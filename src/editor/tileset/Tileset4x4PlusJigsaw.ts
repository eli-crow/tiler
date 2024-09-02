import {
  jigsawTilesMatch,
  TilePosition,
  type JigsawTileGrid,
  type RGBA,
  type Tile4x4PlusJigsaw,
  type TileInnerCorner,
} from "@/editor/model";
import { SupportsJigsawTileTool } from "@/editor/tools/JigsawTileTool";
import { SupportsPencilTool } from "@/editor/tools/PencilTool";
import { BaseTileset, ProxyTileset } from "./BaseTileset";
import type { Tileset4x4Plus } from "./Tileset4x4Plus";

export class Tileset4x4PlusJigsaw
  extends BaseTileset
  implements SupportsJigsawTileTool, SupportsPencilTool, ProxyTileset
{
  readonly tiles: JigsawTileGrid;
  readonly sourceTileset: Tileset4x4Plus;

  constructor(tileset: Tileset4x4Plus, tiles: JigsawTileGrid) {
    super(tileset.tileSize, tiles[0].length, tiles.length);

    this.tiles = tiles;
    this.sourceTileset = tileset;
    this.sourceTileset.on("dataChanged", this.#handleTilesetDataChanged);
  }

  invalidate() {
    this.sourceTileset.invalidate();
    this.emit("dataChanged");
  }

  getUniqueColors() {
    return this.sourceTileset.getUniqueColors();
  }

  getSourceTileImageData(tile: Tile4x4PlusJigsaw): ImageData {
    const data = this.sourceTileset.getTileImageData(tile.sourcePosition);
    tile.innerCorners.forEach((corner) => this.#applyInnerCorner(data, corner));
    return data;
  }

  getTileAtPoint(x: number, y: number): Tile4x4PlusJigsaw | null {
    const position = this.getTilePositionAtPixel(x, y);
    if (!position) {
      return null;
    }
    const tile = this.tiles[position.y][position.x];
    return tile;
  }

  setPixel(x: number, y: number, color: RGBA) {
    const tile = this.getTileAtPoint(x, y);
    if (!tile) {
      return;
    }
    const offsetX = x % this.tileSize;
    const offsetY = y % this.tileSize;
    this.setTilePixel(tile.sourcePosition, offsetX, offsetY, color);
  }

  setTilePixel(tilePosition: TilePosition, offsetX: number, offsetY: number, color: RGBA) {
    const size = this.tileSize;

    const tile = this.getTile(tilePosition);
    let isInnerTR = false;
    let isInnerBR = false;
    let isInnerBL = false;
    let isInnerTL = false;
    tile?.innerCorners.forEach((corner) => {
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
      this.#setInnerCornerTilePixel(offsetX, offsetY, color);
    } else {
      this.sourceTileset.setTilePixel(tilePosition, offsetX, offsetY, color);
    }
  }

  getTile(position: TilePosition): Tile4x4PlusJigsaw | null {
    return this.tiles[position.y]?.[position.x] ?? null;
  }

  setTile(position: TilePosition, tile: Tile4x4PlusJigsaw) {
    const existingTile = this.getTile(position);
    if (existingTile && jigsawTilesMatch(existingTile, tile)) {
      return;
    }
    this.tiles[position.y][position.x] = tile;
  }

  #draw() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.tiles.forEach((row, targetTileX) => {
      row.forEach((tile, targetTileY) => {
        const sourceImageData = this.getSourceTileImageData(tile);
        const targetX = targetTileY * this.tileSize;
        const targetY = targetTileX * this.tileSize;
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
