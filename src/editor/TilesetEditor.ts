import { EventEmitter } from "./events/EventEmitter";
import { RGBA, Tile, TileGrid, tilesMatch } from "./model";
import { Tileset4x4Plus } from "./tileset/Tileset4x4Plus";
import { EraserTool, SupportsEraserTool } from "./tools/EraserTool";
import { PencilTool, SupportsPencilTool } from "./tools/PencilTool";
import { SupportsTileTool, TileTool } from "./tools/TileTool";

const CSS_SCALE = 6;

interface TileEditorEvents {
  toolChanged(): void;
}

export type TilesetEditorTool = PencilTool | TileTool | EraserTool;

export class TilesetEditor implements SupportsPencilTool, SupportsTileTool, SupportsEraserTool {
  #canvas: HTMLCanvasElement;
  #context: CanvasRenderingContext2D;
  #tiles: TileGrid;
  #tileset: Tileset4x4Plus;
  #cachedPageRect: DOMRect | null = null;
  #tool: TilesetEditorTool;
  #emitter = new EventEmitter<TileEditorEvents>();

  get tool(): TilesetEditorTool {
    return this.#tool;
  }

  set tool(tool: TilesetEditorTool) {
    tool.editor = this;
    this.#tool = tool;
    this.#emitter.emit("toolChanged");
  }

  constructor(tileset: Tileset4x4Plus) {
    this.#tileset = tileset;
    tileset.subscribe(this.#handleChange);

    this.#tiles = this.#tileset.getGodotTiles();

    this.#canvas = document.createElement("canvas");
    this.#canvas.width = this.#tileset.tileSize * this.#tiles[0].length;
    this.#canvas.height = this.#tileset.tileSize * this.#tiles.length;
    this.#canvas.style.width = `${this.#canvas.width * CSS_SCALE}px`;
    this.#canvas.style.height = `${this.#canvas.height * CSS_SCALE}px`;
    this.#canvas.style.imageRendering = "pixelated";
    this.#canvas.addEventListener("pointerdown", this.#handlePointerDown);
    this.#canvas.addEventListener("pointermove", this.#handlePointerMove);
    this.#canvas.addEventListener("pointerup", this.#handlePointerUp);

    window.addEventListener("resize", this.#handleResize);

    const context = this.#canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D context");
    }
    this.#context = context;

    this.#tool = this.tool = new TileTool();

    this.#handleResize();
    this.#draw();
  }

  on: EventEmitter<TileEditorEvents>["on"] = this.#emitter.on.bind(this.#emitter);
  off: EventEmitter<TileEditorEvents>["off"] = this.#emitter.off.bind(this.#emitter);

  mount(parent: HTMLElement) {
    parent.appendChild(this.#canvas);
    this.#handleResize();
  }

  unmount() {
    this.#canvas.remove();
  }

  getTileLocationAtPoint(x: number, y: number) {
    const tileX = Math.floor(x / this.#tileset.tileSize);
    const tileY = Math.floor(y / this.#tileset.tileSize);
    return { x: tileX, y: tileY };
  }

  getTileAtPoint(x: number, y: number) {
    const { x: tileX, y: tileY } = this.getTileLocationAtPoint(x, y);
    const tile = this.#tiles[tileY][tileX];
    return tile;
  }

  setPixel(x: number, y: number, color: RGBA) {
    const tile = this.getTileAtPoint(x, y);
    const offsetX = x % this.#tileset.tileSize;
    const offsetY = y % this.#tileset.tileSize;
    this.#tileset.setPixel(tile, offsetX, offsetY, color);
  }

  setTile(x: number, y: number, tile: Tile) {
    const existingTile = this.#tiles[y][x];
    if (tilesMatch(existingTile, tile)) {
      return;
    }
    this.#tiles[y][x] = tile;
    this.#draw();
  }

  #handleResize = () => {
    const docRect = document.documentElement.getBoundingClientRect();
    const canvasRect = this.#canvas.getBoundingClientRect();
    const pageRect = new DOMRect(
      canvasRect.left - docRect.left,
      canvasRect.top - docRect.top,
      canvasRect.width,
      canvasRect.height
    );
    this.#cachedPageRect = pageRect;
  };

  #handleChange = () => {
    this.#draw();
  };

  #getCanvasPositionFromEvent(event: PointerEvent) {
    const { left, top, width: clientWidth, height: clientHeight } = this.#cachedPageRect!;
    const width = this.#canvas.width;
    const height = this.#canvas.height;
    const x = ((event.pageX - left) / clientWidth) * width;
    const y = ((event.pageY - top) / clientHeight) * height;
    return { x, y };
  }

  #handlePointerDown = (event: PointerEvent) => {
    const { x, y } = this.#getCanvasPositionFromEvent(event);
    this.#tool.onPointerDown(x, y, event);
  };

  #handlePointerMove = (event: PointerEvent) => {
    const { x, y } = this.#getCanvasPositionFromEvent(event);
    this.#tool.onPointerMove(x, y, event);
  };

  #handlePointerUp = (event: PointerEvent) => {
    const { x, y } = this.#getCanvasPositionFromEvent(event);
    this.#tool.onPointerUp(x, y, event);
  };

  #draw() {
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        const imageData = this.#tileset.getTileImageData(tile);
        const targetX = x * this.#tileset.tileSize;
        const targetY = y * this.#tileset.tileSize;
        this.#context.putImageData(imageData, targetX, targetY);
      });
    });
  }
}
