import { CSSProperties } from "react";
import { EventEmitter } from "./events/EventEmitter";
import { PixelPoint } from "./model";
import { BaseTileset } from "./tileset/BaseTileset";
import { Tool } from "./tools/Tool";

interface Events {
  toolChanged(): void;
}

export class TilesetEditor<Tileset extends BaseTileset = BaseTileset, SupportedTool extends Tool = Tool> {
  readonly tileset: Tileset;
  readonly #canvas: HTMLCanvasElement;
  readonly #context: CanvasRenderingContext2D;
  #container: HTMLElement = null!;
  #cachedPageRect: DOMRect | null = null;
  #tool: SupportedTool;

  readonly #emitter = new EventEmitter<Events>();
  readonly on: EventEmitter<Events>["on"] = this.#emitter.on.bind(this.#emitter);
  readonly off: EventEmitter<Events>["off"] = this.#emitter.off.bind(this.#emitter);

  #viewZoom = 8;
  #viewX = 0;
  #viewY = 0;

  get tool(): SupportedTool {
    return this.#tool;
  }

  set tool(tool: SupportedTool) {
    this.#tool = tool;
    this.#tool.tileset = this.tileset;
    this.#emitter.emit("toolChanged");
  }

  constructor(tileset: Tileset, defaultTool: SupportedTool) {
    this.tileset = tileset;
    this.tileset.on("dataChanged", () => this.#draw());

    this.#tool = defaultTool;
    this.tool = defaultTool;

    this.#canvas = document.createElement("canvas");
    Object.assign(this.#canvas.style, <CSSProperties>{
      imageRendering: "pixelated",
      position: "absolute",
      minHeight: 0,
      minWidth: 0,
      width: "100%",
      height: "100%",
    });
    this.#canvas.addEventListener("pointerdown", this.#handlePointerDown);
    this.#canvas.addEventListener("pointermove", this.#handlePointerMove);
    this.#canvas.addEventListener("pointerup", this.#handlePointerUp);
    this.#canvas.addEventListener("wheel", this.#handleWheel);

    this.#context = this.#canvas.getContext("2d", { willReadFrequently: true, alpha: true })!;
    this.#context.imageSmoothingEnabled = false;
  }

  mount(container: HTMLElement) {
    this.#container = container;
    this.#container.appendChild(this.#canvas);
    window.addEventListener("resize", this.#handleResize);
    this.#handleResize();
  }

  unmount() {
    this.#canvas.remove();
  }

  #draw() {
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    // const centerOffsetX = (this.#canvas.width + this.tileset.width) / 2;
    // const centerOffsetY = (this.#canvas.height + this.tileset.height) / 2;

    this.#context.resetTransform();
    this.#context.translate(this.#canvas.width / 2, this.#canvas.height / 2);
    this.#context.scale(this.#viewZoom, this.#viewZoom);
    this.#context.translate(this.tileset.width / -2, this.tileset.height / -2);
    this.#context.translate(-this.#viewX, -this.#viewY);
    this.#context.drawImage(this.tileset.imageSource, 0, 0);
  }

  #handleResize = () => {
    const docRect = document.documentElement.getBoundingClientRect();
    const containerRect = this.#container.getBoundingClientRect();
    const pageRect = new DOMRect(
      containerRect.left - docRect.left,
      containerRect.top - docRect.top,
      containerRect.width,
      containerRect.height
    );
    this.#cachedPageRect = pageRect;

    this.#canvas.width = pageRect.width * window.devicePixelRatio;
    this.#canvas.height = pageRect.height * window.devicePixelRatio;

    this.#context.imageSmoothingEnabled = false;

    this.#draw();
  };

  #handlePointerDown = (event: PointerEvent) => {
    const { x, y } = this.#getTilesetPixelFromEvent(event);
    this.#tool.onPointerDown(x, y, event);
  };

  #handlePointerMove = (event: PointerEvent) => {
    const { x, y } = this.#getTilesetPixelFromEvent(event);
    this.#tool.onPointerMove(x, y, event);
  };

  #handlePointerUp = (event: PointerEvent) => {
    const { x, y } = this.#getTilesetPixelFromEvent(event);
    this.#tool.onPointerUp(x, y, event);
  };

  #handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    this.#viewX += event.deltaX / this.#viewZoom;
    this.#viewY += event.deltaY / this.#viewZoom;
    this.#draw();
  };

  #transformCanvasPointToTilesetPoint(point: PixelPoint): PixelPoint {
    const x = (point.x - this.#canvas.width / 2) / this.#viewZoom + this.#viewX + this.tileset.width / 2;
    const y = (point.y - this.#canvas.height / 2) / this.#viewZoom + this.#viewY + this.tileset.height / 2;
    return { x, y };
  }

  #getCanvasPixelFromEvent(event: PointerEvent): PixelPoint {
    const { left, top, width: clientWidth, height: clientHeight } = this.#cachedPageRect!;
    const width = this.#canvas.width;
    const height = this.#canvas.height;
    const x = ((event.pageX - left) / clientWidth) * width;
    const y = ((event.pageY - top) / clientHeight) * height;
    return { x, y };
  }

  #getTilesetPixelFromEvent(event: PointerEvent): PixelPoint {
    const canvasPoint = this.#getCanvasPixelFromEvent(event);
    return this.#transformCanvasPointToTilesetPoint(canvasPoint);
  }
}
