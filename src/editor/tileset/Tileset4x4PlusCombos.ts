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
import { BaseTileset, ProxyTileset } from "./BaseTileset";
import type { Tileset4x4Plus } from "./Tileset4x4Plus";

export type Tile4x4PlusCombos = CombosTile & ProxyTile & { innerCorners: readonly TileInnerCorner[] };

export class Tileset4x4PlusCombos extends BaseTileset implements SupportsPencilTool, ProxyTileset {
  readonly tiles: CombosTileGrid<Tile4x4PlusCombos>;
  readonly sourceTileset: Tileset4x4Plus;

  constructor(tileset: Tileset4x4Plus, tiles: CombosTileGrid<Tile4x4PlusCombos>) {
    super(tileset.tileSize, tiles[0].length, tiles.length);

    this.tiles = tiles;
    this.sourceTileset = tileset;
    this.sourceTileset.on("dataChanged", this.#handleTilesetDataChanged);
  }

  getTileImageData(position: TilePosition): ImageData | null {
    const tile = this.getTile(position);
    if (tile === null) return null;

    const data = this.sourceTileset.getTileImageData(tile.sourcePosition);
    if (data === null) return null;

    tile.innerCorners.forEach((corner) => this.#applyInnerCorner(data, corner));
    return data;
  }

  setPixel(x: number, y: number, color: RGBA) {
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
    this.setTilePixel(tilePosition, offsetX, offsetY, color);
  }

  setTilePixel(tilePosition: TilePosition, offsetX: number, offsetY: number, color: RGBA) {
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
      this.sourceTileset.setTilePixel(tile.sourcePosition, offsetX, offsetY, color);
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
    this.sourceTileset.setPixel(x, y, color);
  }

  #getInnerCornerImageData(corner: TileInnerCorner) {
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

    const imageData = this.sourceTileset.getImageData(
      cornerTileStartX + offsetX,
      cornerTileStartY + offsetY,
      size / 2,
      size / 2
    );

    return {
      offsetX,
      offsetY,
      imageData,
    };
  }

  #applyInnerCorner(imageData: ImageData, innerCorner: TileInnerCorner) {
    const size = this.tileSize;

    const {
      offsetX,
      offsetY,
      imageData: { data: source },
    } = this.#getInnerCornerImageData(innerCorner);

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
