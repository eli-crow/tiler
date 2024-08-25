import sampleImage from "../assets/sample4x4Plus.png";
import { BaseTilesetEditor } from "./BaseTilesetEditor";
import { createTile, RGBA, Tile, TileGrid, TileInnerCorner } from "./model";
import { EraserTool, SupportsEraserTool } from "./tools/EraserTool";
import { PencilTool, SupportsPencilTool } from "./tools/PencilTool";

const TILE_COLUMNS = 5;
const TILE_ROWS = 4;

export class Tileset4x4PlusEditor
  extends BaseTilesetEditor<PencilTool | EraserTool>
  implements SupportsPencilTool, SupportsEraserTool
{
  constructor() {
    super(16, TILE_COLUMNS, TILE_ROWS, new PencilTool());
    this.drawImageURL(sampleImage);
  }

  setTilePixel(tile: Tile, offsetX: number, offsetY: number, color: RGBA) {
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
      this.#setCornerTilePixel(offsetX, offsetY, color);
    } else {
      super.setTilePixel(tile, offsetX, offsetY, color);
    }
  }

  getTileImageData(tile: Tile): ImageData {
    const data = super.getTileImageData(tile);
    tile.corners.forEach((corner) => this.#applyCorner(data, corner));
    return data;
  }

  getGodotTiles(): TileGrid {
    return GODOT_TILES;
  }

  #setCornerTilePixel(offsetX: number, offsetY: number, color: RGBA) {
    const x = 4 * this.tileSize + offsetX;
    const y = 0 * this.tileSize + offsetY;
    this.setPixel(x, y, color);
  }

  #getCornerImageData(corner: TileInnerCorner) {
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

    const imageData = this.context.getImageData(
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

  #applyCorner(targetImageData: ImageData, corner: TileInnerCorner) {
    const size = this.tileSize;

    const {
      offsetX,
      offsetY,
      imageData: { data: source },
    } = this.#getCornerImageData(corner);

    const { data: target } = targetImageData;

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
