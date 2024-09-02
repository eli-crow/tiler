import { EventEmitter } from "@/editor/events/EventEmitter";
import type { RGBA, TilePosition } from "@/editor/model";
import { SupportsFillTool } from "@/editor/tools/FillTool";
import { SupportsPencilTool } from "@/editor/tools/PencilTool";
import { Tool } from "@/editor/tools/Tool";
import { SizedImageSource } from "@/shared/ClipboardService";

interface Events {
  dataChanged(): void;
}

export interface ProxyTileset {
  sourceTileset: BaseTileset;
}

export function isProxyTileset(tileset: any): tileset is ProxyTileset {
  return tileset instanceof BaseTileset && "sourceTileset" in tileset;
}

export interface MultiProxyTileset {
  sourceTilesets: BaseTileset[];
}

export function isMultiProxyTileset(tileset: any): tileset is MultiProxyTileset {
  return tileset instanceof BaseTileset && "sourceTilesets" in tileset;
}

export abstract class BaseTileset implements SupportsPencilTool, SupportsFillTool {
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

  tilePositionInRange(tilePosition: TilePosition): boolean {
    const { x, y } = tilePosition;
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

  setTilePixel(position: TilePosition, offsetX: number, offsetY: number, color: RGBA) {
    const size = this.tileSize;
    const x = position.x * size + offsetX;
    const y = position.y * size + offsetY;
    this.setPixel(x, y, color);
  }

  setSourceDataFromImageUrlAsync(url: string) {
    return new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => {
        this.setSourceDataFromImageSource(image);
        resolve();
      };
      image.src = url;
    });
  }

  setSourceDataFromImageSource(image: CanvasImageSource) {
    if (isProxyTileset(this)) {
      this.sourceTileset.setSourceDataFromImageSource(image);
    } else if (isMultiProxyTileset(this)) {
      if (this.sourceTilesets.length !== 1) throw new Error("Cannot set source data from image on a MultiProxyTileset");
      this.sourceTilesets[0].setSourceDataFromImageSource(image);
    } else {
      this.context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
      this.context.drawImage(image, 0, 0);
    }
  }

  getTileImageData(tilePosition: TilePosition): ImageData {
    const size = this.tileSize;
    const x = tilePosition.x * size;
    const y = tilePosition.y * size;
    const data = this.context.getImageData(x, y, size, size);
    return data;
  }

  setPixel(x: number, y: number, color: RGBA) {
    const imageData = this.context.createImageData(1, 1);
    imageData.data.set(color);
    this.context.putImageData(imageData, x, y);
  }

  getPixel(x: number, y: number): RGBA {
    const data = this.context.getImageData(x, y, 1, 1).data;
    return [data[0], data[1], data[2], data[3]];
  }

  invalidate() {
    if (isProxyTileset(this)) {
      this.sourceTileset.invalidate();
    } else if (isMultiProxyTileset(this)) {
      this.sourceTilesets.forEach((tileset) => tileset.invalidate());
    }
    this.#emitter.emit("dataChanged");
  }

  getImageData(): ImageData;
  getImageData(x: number, y: number, width: number, height: number): ImageData;
  getImageData(x?: number, y?: number, width?: number, height?: number): ImageData {
    x ??= 0;
    y ??= 0;
    width ??= this.#canvas.width;
    height ??= this.#canvas.height;
    return this.context.getImageData(x, y, width, height);
  }

  getSourceImageData(): ImageData {
    if (isProxyTileset(this)) {
      return this.sourceTileset.getSourceImageData();
    } else if (isMultiProxyTileset(this)) {
      if (this.sourceTilesets.length !== 1)
        throw new Error("Cannot get source image data on a MultiProxyTileset with multiple sources");
      return this.sourceTilesets[0].getSourceImageData();
    } else {
      return this.getImageData();
    }
  }

  putSourceImageData(imageData: ImageData) {
    if (isProxyTileset(this)) {
      this.sourceTileset.putSourceImageData(imageData);
    } else if (isMultiProxyTileset(this)) {
      if (this.sourceTilesets.length !== 1) throw new Error("Cannot put source image data on a MultiProxyTileset");
      this.sourceTilesets[0].putSourceImageData(imageData);
    } else {
      this.context.putImageData(imageData, 0, 0);
    }
  }

  getUniqueColors(): [RGBA, number][] {
    const colorCounts: Map<string, number> = new Map();

    if (isProxyTileset(this)) {
      return this.sourceTileset.getUniqueColors();
    }

    if (isMultiProxyTileset(this)) {
      const uniqueColors = new Map<string, number>();
      this.sourceTilesets.forEach((tileset) => {
        const colors = tileset.getUniqueColors();
        colors.forEach(([color, count]) => {
          const hash = color.join(",");
          if (uniqueColors.has(hash)) {
            uniqueColors.set(hash, uniqueColors.get(hash)! + count);
          } else {
            uniqueColors.set(hash, count);
          }
        });
      });
      return Array.from(uniqueColors.entries()).map(([hash, count]) => {
        const color: RGBA = hash.split(",").map(Number) as RGBA;
        return [color, count] as [RGBA, number];
      });
    }

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

  supportsTool<T extends Tool>(tool: T): boolean {
    return tool.supportsTileset(this);
  }
}
