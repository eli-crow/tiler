import { EventEmitter, IEventEmitter } from "@/editor/events/EventEmitter";
import type { RGBA, TilePosition } from "@/editor/model";
import { SupportsFillTool } from "@/editor/tools/FillTool";
import { SupportsPencilTool } from "@/editor/tools/PencilTool";
import { Tool } from "@/editor/tools/Tool";
import { SizedImageSource } from "@/shared/ClipboardService";
import { isMultiProxyTileset } from "./IMultiProxyTileset";
import { isProxyTileset } from "./IProxyTileset";

interface Events {
  dataChanged(): void;
}

export type IBaseTileset = InstanceType<typeof BaseTileset>;

export abstract class BaseTileset implements SupportsPencilTool, SupportsFillTool, IEventEmitter<Events> {
  readonly name: string;
  readonly tileSize: number;
  readonly tileColumns: number;
  readonly tileRows: number;

  readonly #canvas: OffscreenCanvas;
  protected readonly context: OffscreenCanvasRenderingContext2D;

  readonly #bufferCanvas: OffscreenCanvas;
  protected readonly bufferContext: OffscreenCanvasRenderingContext2D;

  get width() {
    return this.#canvas.width;
  }

  get height() {
    return this.#canvas.height;
  }

  get imageSource(): SizedImageSource {
    return this.#canvas;
  }

  get bufferImageSource(): SizedImageSource {
    return this.#bufferCanvas;
  }

  constructor(tileSize: number, tileColumns: number, tileRows: number, name: string) {
    this.tileSize = tileSize;
    this.tileColumns = tileColumns;
    this.tileRows = tileRows;
    this.name = name;

    this.#canvas = new OffscreenCanvas(this.tileSize * this.tileColumns, this.tileSize * this.tileRows);
    this.context = this.#canvas.getContext("2d", { willReadFrequently: true, alpha: true, antialias: false })!;

    this.#bufferCanvas = new OffscreenCanvas(this.tileSize * this.tileColumns, this.tileSize * this.tileRows);
    this.bufferContext = this.#bufferCanvas.getContext("2d", {
      willReadFrequently: true,
      alpha: true,
      antialias: false,
    })!;
  }

  // region Tile Positions
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

  // region Source Data

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
      if (this.sourceTilesets.length !== 1)
        throw new Error("Cannot set source data from image on a MultiProxyTileset with multiple sources");
      this.sourceTilesets[0].setSourceDataFromImageSource(image);
    } else {
      this.context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
      this.context.drawImage(image, 0, 0);
    }
  }

  // region Read
  getImageData(): ImageData;
  getImageData(x: number, y: number, width: number, height: number): ImageData;
  getImageData(x?: number, y?: number, width?: number, height?: number): ImageData {
    x ??= 0;
    y ??= 0;
    width ??= this.#canvas.width;
    height ??= this.#canvas.height;
    return this.context.getImageData(x, y, width, height);
  }

  getBufferImageData(): ImageData;
  getBufferImageData(x: number, y: number, width: number, height: number): ImageData;
  getBufferImageData(x?: number, y?: number, width?: number, height?: number): ImageData {
    x ??= 0;
    y ??= 0;
    width ??= this.#bufferCanvas.width;
    height ??= this.#bufferCanvas.height;
    return this.bufferContext.getImageData(x, y, width, height);
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

  getTileImageData(tilePosition: TilePosition): ImageData | null {
    if (!this.tilePositionInRange(tilePosition)) return null;
    const size = this.tileSize;
    const x = tilePosition.x * size;
    const y = tilePosition.y * size;
    const data = this.context.getImageData(x, y, size, size);
    return data;
  }

  getPixel(x: number, y: number): RGBA {
    const data = this.context.getImageData(x, y, 1, 1).data;
    return [data[0], data[1], data[2], data[3]];
  }

  // region Buffer
  setBufferPixel(x: number, y: number, color: RGBA) {
    const imageData = this.context.createImageData(1, 1);
    imageData.data.set(color);
    this.bufferContext.putImageData(imageData, x, y);
  }

  setTileBufferPixel(position: TilePosition, offsetX: number, offsetY: number, color: RGBA) {
    const size = this.tileSize;
    const x = position.x * size + offsetX;
    const y = position.y * size + offsetY;
    this.setBufferPixel(x, y, color);
  }

  getTileBufferImageData(tilePosition: TilePosition): ImageData | null {
    if (!this.tilePositionInRange(tilePosition)) return null;
    const size = this.tileSize;
    const x = tilePosition.x * size;
    const y = tilePosition.y * size;
    const data = this.bufferContext.getImageData(x, y, size, size);
    return data;
  }

  clearBuffer() {
    this.#bufferCanvas.width = this.#bufferCanvas.width;
  }

  flushBuffer() {
    if (isProxyTileset(this)) {
      this.sourceTileset.flushBuffer();
    } else if (isMultiProxyTileset(this)) {
      this.sourceTilesets.forEach((tileset) => tileset.flushBuffer());
    } else {
      this.context.drawImage(this.#bufferCanvas, 0, 0);
      this.#bufferCanvas.width = this.#bufferCanvas.width;
      this.#emitter.emit("dataChanged");
    }
  }

  // region Drawing
  invalidate() {
    if (isProxyTileset(this)) {
      this.sourceTileset.invalidate();
    } else if (isMultiProxyTileset(this)) {
      this.sourceTilesets.forEach((tileset) => tileset.invalidate());
    } else {
      this.#emitter.emit("dataChanged");
    }
  }

  // region Events
  readonly #emitter = new EventEmitter<Events>();
  readonly on = this.#emitter.on.bind(this.#emitter);
  readonly once = this.#emitter.once.bind(this.#emitter);
  readonly off = this.#emitter.off.bind(this.#emitter);
  protected readonly emit = this.#emitter.emit.bind(this.#emitter);

  // region Misc
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
