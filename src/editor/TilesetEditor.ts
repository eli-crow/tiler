import { CSSProperties } from "react";
import { ClipboardService } from "../shared/ClipboardService";
import { EventEmitter } from "./events/EventEmitter";
import { PixelPoint, RGBA } from "./model";
import { BaseTileset } from "./tileset/BaseTileset";
import { Tool } from "./tools/Tool";

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 50;
const ZOOM_SENSITIVITY = 0.005;
const ZOOM_PINCH_SENSITIVITY = 0.045;
const UNDO_GESTURE_DELAY_MS = 150;
const UNDO_GESTURE_MAX_DISTANCE = 20;
const UNDO_MAX_COUNT = 100;

interface Events {
  changed(): void;
}

export class TilesetEditor<Tileset extends BaseTileset = BaseTileset, SupportedTool extends Tool = Tool> {
  #tileset!: Tileset;
  readonly #canvas: HTMLCanvasElement;
  readonly #context: CanvasRenderingContext2D;
  #container: HTMLElement = null!;
  #cachedPageRect: DOMRect | null = null;
  #tool: SupportedTool = null!;
  #checkerPattern: CanvasPattern = null!;
  #color: RGBA = [255, 0, 255, 255];
  #isGesturing = false;
  #viewZoom = 5;
  #viewX = 0;
  #viewY = 0;
  readonly #undoStack: ImageData[] = [];

  readonly #emitter = new EventEmitter<Events>();
  readonly on: EventEmitter<Events>["on"] = this.#emitter.on.bind(this.#emitter);
  readonly once: EventEmitter<Events>["once"] = this.#emitter.once.bind(this.#emitter);
  readonly off: EventEmitter<Events>["off"] = this.#emitter.off.bind(this.#emitter);
  protected readonly emit: EventEmitter<Events>["emit"] = this.#emitter.emit.bind(this.#emitter);

  get tileset(): Tileset {
    return this.#tileset;
  }

  set tileset(tileset: Tileset) {
    if (tileset !== this.#tileset) {
      this.#tileset.off("dataChanged", this.#onTilesetChanged);

      this.#tileset = tileset;
      this.#tileset.on("dataChanged", this.#onTilesetChanged);
      this.#tool.tileset = tileset;
      this.#emitter.emit("changed");
      this.#draw();
    }
  }

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
    this.#tool.editor = this;
    this.#emitter.emit("changed");
  }

  get color(): RGBA {
    return this.#color;
  }

  set color(color: RGBA) {
    this.#color = color;
    this.#emitter.emit("changed");
  }

  constructor(tileset: Tileset, defaultTool: SupportedTool) {
    this.#tileset = tileset;
    this.#tileset.on("dataChanged", this.#onTilesetChanged);

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
    this.#canvas.addEventListener("touchstart", this.#handleTouchStart);

    this.#context = this.#canvas.getContext("2d", { willReadFrequently: true, alpha: true })!;
    this.#context.imageSmoothingEnabled = false;

    const checkerCanvas = document.createElement("canvas");
    const checkerContext = checkerCanvas.getContext("2d")!;
    const patternSize = 2;
    checkerCanvas.width = patternSize;
    checkerCanvas.height = patternSize;
    checkerContext.imageSmoothingEnabled = false;
    checkerContext.fillStyle = "rgba(100, 100, 100, 1)";
    checkerContext.fillRect(0, 0, 1, 1);
    checkerContext.fillRect(1, 1, 1, 1);
    checkerContext.fillStyle = "rgba(160, 160, 160, 1)";
    checkerContext.fillRect(1, 0, 1, 1);
    checkerContext.fillRect(0, 1, 1, 1);

    this.#checkerPattern = this.#context.createPattern(checkerCanvas, "repeat")!;
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

  undo = () => {
    if (this.#undoStack.length === 0) return;
    const imageData = this.#undoStack.pop()!;
    this.tileset.putSourceImageData(imageData);
    this.tileset.invalidate();
  };

  #onTilesetChanged = () => {
    this.#draw();
  };

  #handleTouchStart = (startE: TouchEvent) => {
    startE.preventDefault();
    startE.stopPropagation();

    if (startE.touches.length !== 2) {
      return;
    }

    this.#isGesturing = true;

    const [start1, start2] = startE.touches;
    const startPinchDistance = Math.hypot(start2.pageX - start1.pageX, start2.pageY - start1.pageY);
    const startMidpointX = (start1.pageX + start2.pageX) / 2;
    const startMidpointY = (start1.pageY + start2.pageY) / 2;
    const startViewZoom = this.viewZoom;
    const startViewX = this.viewX;
    const startViewY = this.viewY;

    let lastMoveMidpointX = startMidpointX;
    let lastMoveMidpointY = startMidpointY;

    const handleMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;

      const [move1, move2] = e.touches;
      const movePinchDistance = Math.hypot(move2.pageX - move1.pageX, move2.pageY - move1.pageY);
      lastMoveMidpointX = (move1.pageX + move2.pageX) / 2;
      lastMoveMidpointY = (move1.pageY + move2.pageY) / 2;

      const deltaPinchDistance = movePinchDistance - startPinchDistance;
      const movementX = lastMoveMidpointX - startMidpointX;
      const movementY = lastMoveMidpointY - startMidpointY;

      this.viewZoom = startViewZoom + deltaPinchDistance * ZOOM_PINCH_SENSITIVITY;
      this.viewX = startViewX - movementX / this.viewZoom;
      this.viewY = startViewY - movementY / this.viewZoom;
      this.#draw();
    };

    const handleEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        const deltaDistance = Math.hypot(lastMoveMidpointX - startMidpointX, lastMoveMidpointY - startMidpointY);
        const duration = e.timeStamp - startE.timeStamp;
        if (deltaDistance < UNDO_GESTURE_MAX_DISTANCE && duration < UNDO_GESTURE_DELAY_MS) {
          // HACK: pointer events and touch events don't play nice, but undoing twice here seems to work for now
          this.undo();
          this.undo();
          this.undo();
        }
        this.#isGesturing = false;
        window.removeEventListener("touchmove", handleMove);
        window.removeEventListener("touchend", handleEnd);
      }
    };

    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleEnd);
  };

  #draw() {
    this.#context.reset();
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#transformToCanvas();
    this.#drawArtboard();
    this.#drawTileset();
    this.#drawTileGuides();
  }

  #drawArtboard() {
    this.#context.imageSmoothingEnabled = false;
    this.#context.fillStyle = this.#checkerPattern;
    this.#context.fillRect(0, 0, this.tileset.width, this.tileset.height);
  }

  #drawTileset() {
    this.#context.imageSmoothingEnabled = false;
    this.#context.drawImage(this.tileset.imageSource, 0, 0);
  }

  #drawTileGuides() {
    const { width, height, tileSize } = this.tileset;
    const ctx = this.#context;
    ctx.lineWidth = 1 / this.viewZoom;
    ctx.globalCompositeOperation = "color-dodge";
    ctx.strokeStyle = "rgba(255, 0, 255, 0.5)";

    ctx.beginPath();

    const x0 = 0;
    const y0 = 0;
    const x1 = width;
    const y1 = height;

    for (let x = tileSize; x < width - 1; x += tileSize) {
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y1);
    }
    for (let y = tileSize; y < height; y += tileSize) {
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
    }

    ctx.stroke();
  }

  #transformToCanvas() {
    const ch = this.#canvas.height;
    const cw = this.#canvas.width;
    const vx = this.viewX + this.tileset.width / 2;
    const vy = this.viewY + this.tileset.height / 2;
    const vz = this.viewZoom;
    this.#context.setTransform(vz, 0, 0, vz, cw / 2 - vx * vz, ch / 2 - vy * vz);
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
    if (this.#isGesturing) return;
    const { x, y } = this.#getTilesetPixelFromEvent(event);
    this.#storeUndo();
    this.#tool.onPointerDown(x, y, event);
  };

  #handlePointerMove = (event: PointerEvent) => {
    if (this.#isGesturing) return;
    const { x, y } = this.#getTilesetPixelFromEvent(event);
    this.#tool.onPointerMove(x, y, event);
  };

  #handlePointerUp = (event: PointerEvent) => {
    if (this.#isGesturing) return;
    const { x, y } = this.#getTilesetPixelFromEvent(event);
    this.#tool.onPointerUp(x, y, event);
  };

  #handleWheel = (event: WheelEvent) => {
    event.preventDefault();

    if (event.ctrlKey) {
      this.viewZoom /= 1 + event.deltaY * ZOOM_SENSITIVITY;
      this.viewZoom = Math.max(1, this.#viewZoom);
    } else {
      this.viewX += event.deltaX / this.viewZoom;
      this.viewY += event.deltaY / this.viewZoom;
    }

    this.#draw();
  };

  #storeUndo = () => {
    const imageData = this.tileset.getSourceImageData();
    this.#undoStack.push(imageData);
    if (this.#undoStack.length > UNDO_MAX_COUNT) {
      this.#undoStack.shift();
    }
  };

  #canvasPointToTilesetPoint(point: PixelPoint): PixelPoint {
    const { x, y } = point;
    const { viewX, viewY, viewZoom } = this;
    const halfCanvasWidth = this.#canvas.width / 2;
    const halfCanvasHeight = this.#canvas.height / 2;
    const halfTilesetWidth = this.tileset.width / 2;
    const halfTilesetHeight = this.tileset.height / 2;
    const tilesetX = (x - halfCanvasWidth) / viewZoom + halfTilesetWidth + viewX;
    const tilesetY = (y - halfCanvasHeight) / viewZoom + halfTilesetHeight + viewY;
    return { x: tilesetX, y: tilesetY };
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
    return this.#canvasPointToTilesetPoint(canvasPoint);
  }
}
