import type { JigsawTile, JigsawTileGrid, RGBA, TileInnerCorner } from "../model";
import { tilesMatch } from "../model";
import { SupportsJigsawTileTool } from "../tools/JigsawTileTool";
import { SupportsPencilTool } from "../tools/PencilTool";
import { BaseTileset } from "./BaseTileset";
import type { Tileset4x4Plus } from "./Tileset4x4Plus";

export class Tileset4x4PlusJigsaw extends BaseTileset implements SupportsJigsawTileTool, SupportsPencilTool {
  readonly tiles: JigsawTileGrid;
  readonly tileset: Tileset4x4Plus;

  constructor(tileset: Tileset4x4Plus, tiles: JigsawTileGrid) {
    super(tileset.tileSize, tiles[0].length, tiles.length);

    this.tiles = tiles;
    this.tileset = tileset;
    this.tileset.on("dataChanged", this.#handleTilesetDataChanged);
  }

  invalidate() {
    this.tileset.invalidate();
    this.emit("dataChanged");
  }

  getTileImageData(tile: JigsawTile): ImageData {
    const data = this.tileset.getTileImageData(tile);
    tile.corners.forEach((corner) => this.#applyInnerCorner(data, corner));
    return data;
  }

  getTileAtPoint(x: number, y: number): JigsawTile | null {
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
    this.setTilePixel(tile, offsetX, offsetY, color);
  }

  setTilePixel(tile: JigsawTile, offsetX: number, offsetY: number, color: RGBA) {
    const size = this.tileSize;

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
      this.#setInnerCornerTilePixel(offsetX, offsetY, color);
    } else {
      const size = this.tileSize;
      const x = tile.x * size + offsetX;
      const y = tile.y * size + offsetY;
      this.tileset.setPixel(x, y, color);
    }
  }

  getTile(x: number, y: number): JigsawTile | null {
    return this.tiles[y]?.[x] ?? null;
  }

  setTile(x: number, y: number, tile: JigsawTile) {
    const existingTile = this.getTile(x, y);
    if (existingTile && tilesMatch(existingTile, tile)) {
      return;
    }
    this.tiles[y][x] = tile;
  }

  #draw() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        const imageData = this.getTileImageData(tile);
        const targetX = x * this.tileSize;
        const targetY = y * this.tileSize;
        this.context.putImageData(imageData, targetX, targetY);
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
    this.tileset.setPixel(x, y, color);
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

    const imageData = this.tileset.getImageData(
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
