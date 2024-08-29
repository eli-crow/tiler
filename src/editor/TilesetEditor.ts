import { CSSProperties } from "react";
import { ClipboardService } from "../ui/services/clipboardService";
import { EventEmitter } from "./events/EventEmitter";
import { PixelPoint } from "./model";
import { BaseTileset } from "./tileset/BaseTileset";
import { Tool } from "./tools/Tool";

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 50;
const ZOOM_SENSITIVITY = 0.005;

interface Events {
  toolChanged(): void;
}

export class TilesetEditor<Tileset extends BaseTileset = BaseTileset, SupportedTool extends Tool = Tool> {
  readonly tileset: Tileset;
  readonly #canvas: HTMLCanvasElement;
  readonly #context: CanvasRenderingContext2D;
  #container: HTMLElement = null!;
  #cachedPageRect: DOMRect | null = null;
  #tool: SupportedTool = null!;

  readonly #emitter = new EventEmitter<Events>();
  readonly on: EventEmitter<Events>["on"] = this.#emitter.on.bind(this.#emitter);
  readonly once: EventEmitter<Events>["once"] = this.#emitter.once.bind(this.#emitter);
  readonly off: EventEmitter<Events>["off"] = this.#emitter.off.bind(this.#emitter);
  protected readonly emit: EventEmitter<Events>["emit"] = this.#emitter.emit.bind(this.#emitter);

  #viewZoom = 5;
  #viewX = 0;
  #viewY = 0;

  private get viewZoom() {
    return this.#viewZoom;
  }

  private set viewZoom(value: number) {
    if (value < ZOOM_MIN) value = ZOOM_MIN;
    if (value > ZOOM_MAX) value = ZOOM_MAX;
    this.#viewZoom = value;

    if (this.viewX < this.viewXMin) this.viewX = this.viewXMin;
    if (this.viewX > this.viewXMax) this.viewX = this.viewXMax;
    if (this.viewY < this.viewYMin) this.viewY = this.viewYMin;
    if (this.viewY > this.viewYMax) this.viewY = this.viewYMax;
  }

  private get viewX() {
    return this.#viewX;
  }

  private set viewX(value: number) {
    const clamped = Math.min(Math.max(value, this.viewXMin), this.viewXMax);
    this.#viewX = clamped;
  }

  private get viewXMin() {
    const tilesetWidth = this.tileset.width / this.viewZoom;
    const canvasWidth = this.#canvas.width;
    const maxOffset = Math.abs(canvasWidth - tilesetWidth);
    return -maxOffset;
  }

  private get viewXMax() {
    const tilesetWidth = this.tileset.width / this.viewZoom;
    const canvasWidth = this.#canvas.width;
    const maxOffset = Math.abs(canvasWidth - tilesetWidth);
    return maxOffset;
  }

  private get viewY() {
    return this.#viewY;
  }

  private set viewY(value: number) {
    const clamped = Math.min(Math.max(value, this.viewYMin), this.viewYMax);
    this.#viewY = clamped;
  }

  private get viewYMin() {
    const tilesetHeight = this.tileset.height / this.viewZoom;
    const canvasHeight = this.#canvas.height;
    const maxOffset = Math.abs(canvasHeight - tilesetHeight);
    return -maxOffset;
  }

  private get viewYMax() {
    const tilesetHeight = this.tileset.height / this.viewZoom;
    const canvasHeight = this.#canvas.height;
    const maxOffset = Math.abs(canvasHeight - tilesetHeight);
    return maxOffset;
  }

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
    window.addEventListener("resize", () => this.#handleResize());
    this.#handleResize();
  }

  unmount() {
    this.#canvas.remove();
  }

  copyToClipboard() {
    ClipboardService.default.copyImageSource(this.tileset.imageSource);
  }

  #draw() {
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#drawArtboard();
    this.#drawTileset();
    this.#drawTileGuides();
  }

  #drawArtboard() {
    this.#context.resetTransform();
    this.#context.globalCompositeOperation = "source-over";
    this.#transformToCanvas();
    this.#context.fillStyle = "rgba(83, 80, 92, 0.5)";
    this.#context.fillRect(0, 0, this.tileset.width, this.tileset.height);
  }

  #drawTileset() {
    this.#context.resetTransform();
    this.#context.globalCompositeOperation = "source-over";
    this.#context.imageSmoothingEnabled = false;
    this.#transformToCanvas();
    this.#context.drawImage(this.tileset.imageSource, 0, 0);
  }

  #drawTileGuides() {
    const { width, height, tileSize } = this.tileset;
    const context = this.#context;
    context.resetTransform();
    context.lineWidth = 1;
    context.globalCompositeOperation = "color-dodge";
    context.strokeStyle = "rgba(255, 0, 255, 0.5)";
    context.beginPath();

    const { x: x0, y: y0 } = this.#tilesetToCanvasPoint({ x: 0, y: 0 });
    const { x: x1, y: y1 } = this.#tilesetToCanvasPoint({ x: width, y: height });

    for (let x = tileSize; x < width - 1; x += tileSize) {
      const xCanvas = this.#tilesetToCanvasPoint({ x, y: 0 }).x;
      context.moveTo(xCanvas, y0);
      context.lineTo(xCanvas, y1);
    }
    for (let y = tileSize; y < height; y += tileSize) {
      const yCanvas = this.#tilesetToCanvasPoint({ x: 0, y }).y;
      context.moveTo(x0, yCanvas);
      context.lineTo(x1, yCanvas);
    }
    context.stroke();
  }

  #transformToCanvas() {
    this.#context.translate(-this.viewX, -this.viewY);
    this.#context.translate(this.#canvas.width / 2, this.#canvas.height / 2);
    this.#context.scale(this.viewZoom, this.viewZoom);
    this.#context.translate(this.tileset.width / -2, this.tileset.height / -2);
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

    this.#canvas.width = pageRect.width;
    this.#canvas.height = pageRect.height;

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

    if (event.ctrlKey) {
      this.viewZoom /= 1 + event.deltaY * ZOOM_SENSITIVITY;
      this.viewZoom = Math.max(1, this.#viewZoom);
    } else {
      this.viewX += event.deltaX;
      this.viewY += event.deltaY;
    }

    this.#draw();
  };

  #transformCanvasPointToTilesetPoint(point: PixelPoint): PixelPoint {
    const x = (point.x - this.#canvas.width / 2 + this.viewX) / this.viewZoom + this.tileset.width / 2;
    const y = (point.y - this.#canvas.height / 2 + this.viewY) / this.viewZoom + this.tileset.height / 2;
    return { x, y };
  }

  #tilesetToCanvasPoint(point: PixelPoint): PixelPoint {
    const x = (point.x - this.tileset.width / 2) * this.viewZoom + this.#canvas.width / 2 - this.viewX;
    const y = (point.y - this.tileset.height / 2) * this.viewZoom + this.#canvas.height / 2 - this.viewY;
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
