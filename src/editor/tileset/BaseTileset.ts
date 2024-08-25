import { EventEmitter } from "../events/EventEmitter";
import { RGBA, Tile, TilePosition } from "../model";

interface Events {
  dataChanged(): void;
}

export abstract class BaseTileset {
  readonly #canvas: OffscreenCanvas;
  protected readonly context: OffscreenCanvasRenderingContext2D;
  readonly tileSize: number;
  readonly tileColumns: number;
  readonly tileRows: number;
  readonly #emitter = new EventEmitter<Events>();
  readonly on: EventEmitter<Events>["on"] = this.#emitter.on.bind(this.#emitter);
  readonly off: EventEmitter<Events>["off"] = this.#emitter.off.bind(this.#emitter);
  protected readonly emit: EventEmitter<Events>["emit"] = this.#emitter.emit.bind(this.#emitter);

  get width() {
    return this.#canvas.width;
  }

  get height() {
    return this.#canvas.height;
  }

  get imageSource(): CanvasImageSource {
    return this.#canvas;
  }

  constructor(tileSize: number, tileColumns: number, tileRows: number) {
    this.tileSize = tileSize;
    this.tileColumns = tileColumns;
    this.tileRows = tileRows;

    this.#canvas = new OffscreenCanvas(this.tileSize * this.tileColumns, this.tileSize * this.tileRows);

    this.context = this.#canvas.getContext("2d", { willReadFrequently: true, alpha: true, antialias: false })!;
    this.context.imageSmoothingEnabled = false;
  }

  getTilePositionAtPixel(x: number, y: number): TilePosition | null {
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);
    if (tileX < 0 || tileX >= this.tileColumns || tileY < 0 || tileY >= this.tileRows) {
      return null;
    }
    return { x: tileX, y: tileY };
  }

  setTilePixel(tile: Tile, offsetX: number, offsetY: number, color: RGBA) {
    const size = this.tileSize;
    const x = tile.x * size + offsetX;
    const y = tile.y * size + offsetY;
    this.setPixel(x, y, color);
  }

  setFromImageUrlAsync(url: string) {
    return new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => {
        this.setFromImageSource(image);
        resolve();
      };
      image.src = url;
    });
  }

  setFromImageSource(image: CanvasImageSource) {
    this.context.drawImage(image, 0, 0);
  }

  getTileImageData(tile: Tile): ImageData {
    const size = this.tileSize;
    const x = tile.x * size;
    const y = tile.y * size;
    const data = this.context.getImageData(x, y, size, size);
    return data;
  }

  setPixel(x: number, y: number, color: RGBA) {
    const imageData = this.context.createImageData(1, 1);
    imageData.data.set(color);
    this.context.putImageData(imageData, x, y);
  }

  invalidate() {
    this.#emitter.emit("dataChanged");
  }

  getImageData(x: number, y: number, width: number, height: number): ImageData {
    return this.context.getImageData(x, y, width, height);
  }
}
