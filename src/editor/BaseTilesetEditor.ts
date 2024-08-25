import { EventEmitter } from "./events/EventEmitter";
import { RGBA, Tile, TilesetChangedCallback } from "./model";
import { Tool } from "./tools/Tool";

const CSS_SCALE = 6;

interface Events {
  toolChanged(): void;
}

export abstract class BaseTilesetEditor<SupportedTool extends Tool = Tool> {
  #canvas: HTMLCanvasElement;
  #changedSubscriptions = new Set<TilesetChangedCallback>();
  #cachedPageRect: DOMRect | null = null;
  protected context: CanvasRenderingContext2D;
  readonly tileSize: number;
  readonly tileColumns: number;
  readonly tileRows: number;
  #tool: SupportedTool;
  #emitter = new EventEmitter<Events>();

  get tool(): SupportedTool {
    return this.#tool;
  }

  set tool(tool: SupportedTool) {
    this.#tool = tool;
    this.#tool.editor = this;
    this.#emitter.emit("toolChanged");
  }

  constructor(tileSize: number, tileColumns: number, tileRows: number, defaultTool: SupportedTool) {
    this.tileSize = tileSize;
    this.tileColumns = tileColumns;
    this.tileRows = tileRows;
    this.#tool = defaultTool;
    this.tool = defaultTool;

    this.#canvas = document.createElement("canvas");
    this.#canvas.width = this.tileSize * this.tileColumns;
    this.#canvas.height = this.tileSize * this.tileRows;
    this.#canvas.style.width = `${this.#canvas.width * CSS_SCALE}px`;
    this.#canvas.style.height = `${this.#canvas.height * CSS_SCALE}px`;
    this.#canvas.style.imageRendering = "pixelated";
    this.#canvas.addEventListener("pointerdown", this.#handlePointerDown);
    this.#canvas.addEventListener("pointermove", this.#handlePointerMove);
    this.#canvas.addEventListener("pointerup", this.#handlePointerUp);

    window.addEventListener("resize", this.#handleResize);

    const context = this.#canvas.getContext("2d", {
      willReadFrequently: true,
      alpha: true,
    });
    if (!context) {
      throw new Error("Could not get 2D context");
    }
    this.context = context;

    this.#handleResize();
  }

  on: EventEmitter<Events>["on"] = this.#emitter.on.bind(this.#emitter);
  off: EventEmitter<Events>["off"] = this.#emitter.off.bind(this.#emitter);

  subscribe(callback: TilesetChangedCallback) {
    this.#changedSubscriptions.add(callback);
  }

  unsubscribe(callback: TilesetChangedCallback) {
    this.#changedSubscriptions.delete(callback);
  }

  getTileLocationAtPoint(x: number, y: number) {
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);
    return { x: tileX, y: tileY };
  }

  setTilePixel(tile: Tile, offsetX: number, offsetY: number, color: RGBA) {
    const size = this.tileSize;
    const x = tile.x * size + offsetX;
    const y = tile.y * size + offsetY;
    this.setPixel(x, y, color);
  }

  drawImageURL(url: string) {
    return new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => {
        this.drawImageSource(image);
        resolve();
      };
      image.src = url;
    });
  }

  drawImageSource(image: CanvasImageSource) {
    this.clear();
    this.context.drawImage(image, 0, 0);
    this.#notifyChanged();
  }

  getTileImageData(tile: Tile): ImageData {
    const targetStartX = tile.x * this.tileSize;
    const targetStartY = tile.y * this.tileSize;
    const data = this.context.getImageData(targetStartX, targetStartY, this.tileSize, this.tileSize);
    return data;
  }

  setPixel(x: number, y: number, color: RGBA) {
    const imageData = this.context.createImageData(1, 1);
    imageData.data.set(color);
    this.context.putImageData(imageData, x, y);
    this.#notifyChanged();
  }

  mount(parent: HTMLElement) {
    parent.appendChild(this.#canvas);
    this.#handleResize();
  }

  unmount() {
    this.#canvas.remove();
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

  clear() {
    this.context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  #notifyChanged() {
    this.#changedSubscriptions.forEach((callback) => callback());
  }

  #getCanvasPositionFromEvent(event: PointerEvent) {
    const { left, top, width: clientWidth, height: clientHeight } = this.#cachedPageRect!;
    const width = this.#canvas.width;
    const height = this.#canvas.height;
    const x = ((event.pageX - left) / clientWidth) * width;
    const y = ((event.pageY - top) / clientHeight) * height;
    return { x, y };
  }
}
