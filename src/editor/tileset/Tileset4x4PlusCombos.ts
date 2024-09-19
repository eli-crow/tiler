import {
  CombosTile,
  CombosTileGrid,
  combosTilesMatch,
  ProxyTile,
  TilePosition,
  type RGBA,
  type TileInnerCorner,
} from "@/editor/model";
import { SupportsPencilTool } from "../tools";
import { BaseTileset } from "./BaseTileset";
import { IProxyTileset } from "./IProxyTileset";
import { ITilesetCombos } from "./ITilesetCombos";
import type { Tileset4x4Plus } from "./Tileset4x4Plus";

export type Tile4x4PlusCombos = CombosTile & ProxyTile & { innerCorners: readonly TileInnerCorner[] };

export class Tileset4x4PlusCombos extends BaseTileset implements ITilesetCombos, SupportsPencilTool, IProxyTileset {
  readonly tiles: CombosTileGrid<Tile4x4PlusCombos>;
  readonly sourceTileset: Tileset4x4Plus;

  constructor(tileset: Tileset4x4Plus, tiles: CombosTileGrid<Tile4x4PlusCombos>) {
    super(tileset.tileSize, tiles[0].length, tiles.length, "Combos");

    this.tiles = tiles;
    this.sourceTileset = tileset;
    this.sourceTileset.on("dataChanged", this.#handleTilesetDataChanged);
  }

  forEachTile(callback: (tile: Tile4x4PlusCombos, position: { x: number; y: number }) => void): void {
    this.tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        callback(tile, { x, y });
      });
    });
  }

  getTileImageData(position: TilePosition): ImageData | null {
    const tile = this.getTile(position);
    if (tile === null) return null;

    const data = this.sourceTileset.getTileImageData(tile.sourcePosition);
    if (data === null) return null;
    tile.innerCorners.forEach((corner) => this.#applyInnerCorner(data, corner));

    const buffer = this.sourceTileset.getTileBufferImageData(tile.sourcePosition);
    if (buffer === null) return data;
    tile.innerCorners.forEach((corner) => this.#applyInnerCorner(buffer, corner, true));

    // source-over buffer on top of data
    for (let y = 0; y < this.tileSize; y++) {
      for (let x = 0; x < this.tileSize; x++) {
        const i = (y * this.tileSize + x) * 4;
        const alpha = buffer.data[i + 3] / 255;
        if (alpha === 0) continue;
        const j = (y * this.tileSize + x) * 4;
        data.data[j] = buffer.data[i] * alpha + data.data[j] * (1 - alpha);
        data.data[j + 1] = buffer.data[i + 1] * alpha + data.data[j + 1] * (1 - alpha);
        data.data[j + 2] = buffer.data[i + 2] * alpha + data.data[j + 2] * (1 - alpha);
        data.data[j + 3] = buffer.data[i + 3];
      }
    }

    return data;
  }

  setBufferPixel(x: number, y: number, color: RGBA) {
    const tilePosition = this.getTilePositionAtPixel(x, y);
    if (!tilePosition) {
      return;
    }
    const tile = this.getTile(tilePosition);
    if (!tile) {
      return;
    }
    const offsetX = x % this.tileSize;
    const offsetY = y % this.tileSize;
    this.setTileBufferPixel(tilePosition, offsetX, offsetY, color);
  }

  setTileBufferPixel(tilePosition: TilePosition, offsetX: number, offsetY: number, color: RGBA) {
    const size = this.tileSize;

    const tile = this.getTile(tilePosition);
    if (!tile) return;
    const { innerCorners } = tile;

    const isLeft = offsetX < size / 2;
    const isTop = offsetY < size / 2;
    const isRight = !isLeft;
    const isBottom = !isTop;

    if (
      (innerCorners.includes("tr") && isTop && isRight) ||
      (innerCorners.includes("br") && isBottom && isRight) ||
      (innerCorners.includes("bl") && isBottom && isLeft) ||
      (innerCorners.includes("tl") && isTop && isLeft)
    ) {
      this.#setInnerCornerTilePixel(offsetX, offsetY, color);
    } else {
      this.sourceTileset.setTileBufferPixel(tile.sourcePosition, offsetX, offsetY, color);
    }
  }

  getTile(position: TilePosition): Tile4x4PlusCombos | null {
    return this.tiles[position.y]?.[position.x] ?? null;
  }

  setTile(position: TilePosition, tile: Tile4x4PlusCombos) {
    const existingTile = this.getTile(position);
    if (existingTile && combosTilesMatch(existingTile, tile)) {
      return;
    }
    this.tiles[position.y][position.x] = tile;
  }

  // TODO: drawing does not consider the source drawing buffer, so changes don't apply until the source tileset's buffer is flushed
  #draw() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.tiles.forEach((row, targetTileY) => {
      row.forEach((_tile, targetTileX) => {
        const sourceImageData = this.getTileImageData({ x: targetTileX, y: targetTileY });
        if (!sourceImageData) return;
        const targetX = targetTileX * this.tileSize;
        const targetY = targetTileY * this.tileSize;
        this.context.putImageData(sourceImageData, targetX, targetY);
      });
    });
  }

  #handleTilesetDataChanged = () => {
    this.#draw();
    this.emit("dataChanged");
  };

  #setInnerCornerTilePixel(offsetX: number, offsetY: number, color: RGBA) {
    const x = 4 * this.tileSize + offsetX;
    const y = 0 * this.tileSize + offsetY;
    this.sourceTileset.setBufferPixel(x, y, color);
  }

  #getInnerCornerImageData(corner: TileInnerCorner, buffer = false) {
    const size = this.tileSize;

    let offsetX: number;
    let offsetY: number;

    if (corner === "tr") {
      offsetX = size / 2;
      offsetY = 0;
    } else if (corner === "bl") {
      offsetX = 0;
      offsetY = size / 2;
    } else if (corner === "br") {
      offsetX = size / 2;
      offsetY = size / 2;
    } else if (corner === "tl") {
      offsetX = 0;
      offsetY = 0;
    } else {
      throw new Error("Invalid corner");
    }

    const cornerTileStartX = 4 * size;
    const cornerTileStartY = 0;

    const getImageData = (buffer ? this.sourceTileset.getBufferImageData : this.sourceTileset.getImageData).bind(
      this.sourceTileset
    );
    const imageData = getImageData(cornerTileStartX + offsetX, cornerTileStartY + offsetY, size / 2, size / 2);

    return {
      offsetX,
      offsetY,
      imageData,
    };
  }

  #applyInnerCorner(imageData: ImageData, innerCorner: TileInnerCorner, buffer = false) {
    const size = this.tileSize;

    const getInnerCornerImageData = (
      buffer ? this.#getInnerCornerImageData.bind(this) : this.#getInnerCornerImageData
    ).bind(this);

    const {
      offsetX,
      offsetY,
      imageData: { data: source },
    } = getInnerCornerImageData(innerCorner, buffer);

    const { data: target } = imageData;

    for (let y = 0; y < size / 2; y++) {
      for (let x = 0; x < size / 2; x++) {
        const si = (y * (size / 2) + x) * 4;
        const ti = ((y + offsetY) * size + x + offsetX) * 4;
        target[ti] = source[si];
        target[ti + 1] = source[si + 1];
        target[ti + 2] = source[si + 2];
        target[ti + 3] = source[si + 3];
      }
    }
  }
}
