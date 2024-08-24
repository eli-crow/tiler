import { createTile, RGBA, Tile, TileGrid, TileInnerCorner, TilesetChangedCallback } from "../model";
import sampleImage from "./sample4x4Plus.png";

const TILE_COLUMNS = 5;
const TILE_ROWS = 4;

export class Tileset4x4Plus {
  #canvas: OffscreenCanvas;
  #context: OffscreenCanvasRenderingContext2D;
  #changedSubscriptions = new Set<TilesetChangedCallback>();
  #tileSize = 16;

  get tileSize() {
    return this.#tileSize;
  }

  constructor() {
    this.#canvas = new OffscreenCanvas(this.tileSize * TILE_COLUMNS, this.#tileSize * TILE_ROWS);

    const context = this.#canvas.getContext("2d", {
      willReadFrequently: true,
      alpha: true,
    });
    if (!context) {
      throw new Error("Could not get 2D context");
    }
    this.#context = context;
    this.setFromImageURL(sampleImage);
  }

  subscribe(callback: TilesetChangedCallback) {
    this.#changedSubscriptions.add(callback);
  }

  unsubscribe(callback: TilesetChangedCallback) {
    this.#changedSubscriptions.delete(callback);
  }

  setPixel(tile: Tile, offsetX: number, offsetY: number, color: RGBA) {
    const size = this.#tileSize;

    let isInnerTR = false;
    let isInnerBR = false;
    let isInnerBL = false;
    let isInnerTL = false;
    tile.corners.forEach((corner) => {
      if (corner === "tr") {
        isInnerTR = true;
      } else if (corner === "br") {
        isInnerBR = true;
      } else if (corner === "bl") {
        isInnerBL = true;
      } else if (corner === "tl") {
        isInnerTL = true;
      }
    });

    const isLeft = offsetX < size / 2;
    const isTop = offsetY < size / 2;
    const isRight = !isLeft;
    const isBottom = !isTop;
    if (
      (isInnerTR && isTop && isRight) ||
      (isInnerBR && isBottom && isRight) ||
      (isInnerBL && isBottom && isLeft) ||
      (isInnerTL && isTop && isLeft)
    ) {
      this.#setCornerTilePixel(offsetX, offsetY, color);
    } else {
      const x = tile.x * size + offsetX;
      const y = tile.y * size + offsetY;
      this.#setPixel(x, y, color);
    }
  }

  setFromImageURL(url: string) {
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
    this.#clear();
    this.#context.drawImage(image, 0, 0);
    this.#notifyChanged();
  }

  getTileImageData(tile: Tile): ImageData {
    const targetStartX = tile.x * this.#tileSize;
    const targetStartY = tile.y * this.#tileSize;
    const data = this.#context.getImageData(targetStartX, targetStartY, this.#tileSize, this.#tileSize);
    tile.corners.forEach((corner) => this.#applyCorner(data, corner));
    return data;
  }

  getGodotTiles(): TileGrid {
    return GODOT_TILES;
  }

  #clear() {
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  #setPixel(x: number, y: number, color: RGBA) {
    const imageData = this.#context.createImageData(1, 1);
    imageData.data.set([color.r, color.g, color.b, color.a]);
    this.#context.putImageData(imageData, x, y);
    this.#notifyChanged();
  }

  #setCornerTilePixel(offsetX: number, offsetY: number, color: RGBA) {
    const x = 4 * this.#tileSize + offsetX;
    const y = 0 * this.#tileSize + offsetY;
    this.#setPixel(x, y, color);
  }

  #notifyChanged() {
    this.#changedSubscriptions.forEach((callback) => callback());
  }

  #getCornerImageData(corner: TileInnerCorner) {
    let offsetX: number;
    let offsetY: number;

    if (corner === "tr") {
      offsetX = this.#tileSize / 2;
      offsetY = 0;
    } else if (corner === "bl") {
      offsetX = 0;
      offsetY = this.#tileSize / 2;
    } else if (corner === "br") {
      offsetX = this.#tileSize / 2;
      offsetY = this.#tileSize / 2;
    } else if (corner === "tl") {
      offsetX = 0;
      offsetY = 0;
    } else {
      throw new Error("Invalid corner");
    }

    const cornerTileStartX = 4 * this.#tileSize;
    const cornerTileStartY = 0;

    const imageData = this.#context.getImageData(
      cornerTileStartX + offsetX,
      cornerTileStartY + offsetY,
      this.#tileSize / 2,
      this.#tileSize / 2
    );

    return {
      offsetX,
      offsetY,
      imageData,
    };
  }

  #applyCorner(targetImageData: ImageData, corner: TileInnerCorner) {
    const {
      offsetX,
      offsetY,
      imageData: { data: source },
    } = this.#getCornerImageData(corner);

    const { data: target } = targetImageData;

    for (let y = 0; y < this.#tileSize / 2; y++) {
      for (let x = 0; x < this.#tileSize / 2; x++) {
        const si = (y * (this.#tileSize / 2) + x) * 4;
        const ti = ((y + offsetY) * this.#tileSize + x + offsetX) * 4;
        target[ti] = source[si];
        target[ti + 1] = source[si + 1];
        target[ti + 2] = source[si + 2];
        target[ti + 3] = source[si + 3];
      }
    }
  }
}

const GODOT_TILES: TileGrid = [
  [
    createTile(0, 0),

    createTile(1, 0, ["br"]),
    createTile(2, 0, ["bl", "br"]),
    createTile(3, 0, ["bl"]),

    createTile(2, 1, ["bl", "tr", "br"]),
    createTile(2, 0, ["bl"]),
    createTile(2, 0, ["br"]),
    createTile(2, 1, ["bl", "tl", "br"]),

    createTile(1, 0),
    createTile(2, 1, ["tl", "bl"]),
    createTile(2, 0),
    createTile(3, 0),
  ],
  [
    createTile(0, 1),

    createTile(1, 1, ["br", "tr"]),
    createTile(2, 1, ["bl", "br", "tr", "tl"]),
    createTile(3, 1, ["tl", "bl"]),

    createTile(1, 1, ["tr"]),
    createTile(2, 1, ["tl"]),
    createTile(2, 1, ["tr"]),
    createTile(3, 1, ["tl"]),

    createTile(1, 1),
    createTile(2, 1, ["tl", "br"]),
    createTile(4, 1),
    createTile(2, 1, ["tr", "br"]),
  ],
  [
    createTile(0, 2),

    createTile(1, 2, ["tr"]),
    createTile(2, 2, ["tr", "br"]),
    createTile(3, 2, ["tl"]),

    createTile(1, 1, ["br"]),
    createTile(2, 1, ["bl"]),
    createTile(2, 1, ["br"]),
    createTile(3, 1, ["bl"]),

    createTile(2, 1, ["tl", "bl"]),
    createTile(2, 1),
    createTile(2, 1, ["tr", "bl"]),
    createTile(3, 1),
  ],
  [
    createTile(0, 3),

    createTile(1, 3),
    createTile(2, 3),
    createTile(3, 3),

    createTile(2, 1, ["bl", "tr", "br"]),
    createTile(2, 2, ["tl"]),
    createTile(2, 2, ["tr"]),
    createTile(2, 1, ["tl", "tr", "bl"]),

    createTile(1, 2),
    createTile(2, 2),
    createTile(2, 1, ["bl", "br"]),
    createTile(3, 2),
  ],
];
