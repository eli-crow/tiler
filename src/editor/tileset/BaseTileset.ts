import { SizedImageSource } from "../../ui/services/ClipboardService";
import { EventEmitter } from "../events/EventEmitter";
import type { RGBA, Tile, TilePosition } from "../model";
import { SupportsPencilTool } from "../tools/PencilTool";

interface Events {
  dataChanged(): void;
}

export abstract class BaseTileset implements SupportsPencilTool {
  readonly #canvas: OffscreenCanvas;
  protected readonly context: OffscreenCanvasRenderingContext2D;
  readonly tileSize: number;
  readonly tileColumns: number;
  readonly tileRows: number;
  readonly #emitter = new EventEmitter<Events>();
  readonly on: EventEmitter<Events>["on"] = this.#emitter.on.bind(this.#emitter);
  readonly once: EventEmitter<Events>["once"] = this.#emitter.once.bind(this.#emitter);
  readonly off: EventEmitter<Events>["off"] = this.#emitter.off.bind(this.#emitter);
  protected readonly emit: EventEmitter<Events>["emit"] = this.#emitter.emit.bind(this.#emitter);

  get width() {
    return this.#canvas.width;
  }

  get height() {
    return this.#canvas.height;
  }

  get imageSource(): SizedImageSource {
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

  tilePositionInRange(x: number, y: number): boolean {
    return x >= 0 && x < this.tileColumns && y >= 0 && y < this.tileRows;
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
    this.context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
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

  getUniqueColors(): [RGBA, number][] {
    const colorCounts: Map<string, number> = new Map();
    const data = this.context.getImageData(0, 0, this.#canvas.width, this.#canvas.height).data;
    for (let i = 0; i < data.length; i += 4) {
      const color: RGBA = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      const hash = color.join(",");
      if (colorCounts.has(hash)) {
        colorCounts.set(hash, colorCounts.get(hash)! + 1);
      } else {
        colorCounts.set(hash, 1);
      }
    }
    const rankedColors: [RGBA, number][] = Array.from(colorCounts.entries())
      .map(([hash, count]) => {
        const color: RGBA = hash.split(",").map(Number) as RGBA;
        return [color, count] as [RGBA, number];
      })
      .sort((a, b) => b[1] - a[1]);
    return rankedColors;
  }
}
