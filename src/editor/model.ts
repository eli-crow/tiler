import { JigsawTileTool } from "./tools/JigsawTileTool";
import { PencilTool } from "./tools/PencilTool";

export type PixelPoint = {
  x: number;
  y: number;
};

export type TilePosition = {
  x: number;
  y: number;
};

export type Tile4x4PlusJigsaw = {
  sourcePosition: TilePosition;
  innerCorners: readonly TileInnerCorner[];
};

export function tilePositionsMatch(a: TilePosition, b: TilePosition): boolean {
  return a.x === b.x && a.y === b.y;
}

export function jigsawTilesMatch(a: Tile4x4PlusJigsaw, b: Tile4x4PlusJigsaw): boolean {
  return (
    tilePositionsMatch(a.sourcePosition, b.sourcePosition) &&
    a.innerCorners.length === b.innerCorners.length &&
    a.innerCorners.every((corner, index) => corner === b.innerCorners[index])
  );
}

export type TileInnerCorner = "tl" | "tr" | "bl" | "br";

export type JigsawTileGrid = Tile4x4PlusJigsaw[][];

export type TilesetChangedCallback = () => void;

export type RGBA = [r: number, g: number, b: number, a: number];
export function colorsMatch(a: RGBA, b: RGBA): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

export type TilesetEditorTool = PencilTool | JigsawTileTool;

export type TerrainTile = number;
export type TerrainTileGrid = TerrainTile[][];
export type TileNeighbor = number;
export type TileNeighborFlattened = { x: number; y: number; neighbors: number };
export type TileNeighborGrid = TileNeighbor[][];
export type TileNeighborFlattenedGrid = TileNeighborFlattened[];

export function flattenTileNeighborGrid(grid: TileNeighborGrid): TileNeighborFlattenedGrid {
  const rows = grid.length;
  const cols = grid[0].length;
  const flattened: TileNeighborFlattenedGrid = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const neighbors = grid[y][x];
      flattened.push({ x: x, y: y, neighbors });
    }
  }

  return flattened;
}

// 0b0_0000_0000 : self _ t r b l _ tr br bl tl
// prettier-ignore
export const GODOT_NEIGHBORS: TileNeighborGrid = [
  [0b1_0010_0000,   0b1_0110_0000, 0b1_0111_0000, 0b1_0011_0000,   0b1_1111_0001, 0b1_0111_0100, 0b1_0111_0010, 0b1_1111_1000,   0b1_0110_0100, 0b1_1111_0110, 0b1_0111_0110, 0b1_0011_0010],
  [0b1_1010_0000,   0b1_1110_0000, 0b1_1111_0000, 0b1_1011_0000,   0b1_1110_0100, 0b1_1111_1110, 0b1_1111_0111, 0b1_1011_0010,   0b1_1110_1100, 0b1_1111_1010, 0b0_0000_0000, 0b1_1111_0011],
  [0b1_1000_0000,   0b1_1100_0000, 0b1_1101_0000, 0b1_1001_0000,   0b1_1110_1000, 0b1_1111_1101, 0b1_1111_1011, 0b1_1011_0001,   0b1_1111_1100, 0b1_1111_1111, 0b1_1111_0101, 0b1_1011_0011],
  [0b1_0000_0000,   0b1_0100_0000, 0b1_0101_0000, 0b1_0001_0000,   0b1_1111_0010, 0b1_1101_1000, 0b1_1101_0001, 0b1_1111_0100,   0b1_1100_1000, 0b1_1101_1001, 0b1_1111_1001, 0b1_1001_0001],
];

export const GODOT_TILES: JigsawTileGrid = [
  [
    { sourcePosition: { x: 0, y: 0 }, innerCorners: [] },

    { sourcePosition: { x: 1, y: 0 }, innerCorners: ["br"] },
    { sourcePosition: { x: 2, y: 0 }, innerCorners: ["bl", "br"] },
    { sourcePosition: { x: 3, y: 0 }, innerCorners: ["bl"] },

    { sourcePosition: { x: 2, y: 1 }, innerCorners: ["bl", "tr", "br"] },
    { sourcePosition: { x: 2, y: 0 }, innerCorners: ["bl"] },
    { sourcePosition: { x: 2, y: 0 }, innerCorners: ["br"] },
    { sourcePosition: { x: 2, y: 1 }, innerCorners: ["bl", "tl", "br"] },

    { sourcePosition: { x: 1, y: 0 }, innerCorners: [] },
    { sourcePosition: { x: 2, y: 1 }, innerCorners: ["tl", "tr"] },
    { sourcePosition: { x: 2, y: 0 }, innerCorners: [] },
    { sourcePosition: { x: 3, y: 0 }, innerCorners: [] },
  ],
  [
    { sourcePosition: { x: 0, y: 1 }, innerCorners: [] },

    { sourcePosition: { x: 1, y: 1 }, innerCorners: ["br", "tr"] },
    // @ts-ignore
    { x: 9, sourcePosition: { x: 2, y: 1 }, innerCorners: ["bl", "br", "tr", "tl"] },
    { sourcePosition: { x: 3, y: 1 }, innerCorners: ["tl", "bl"] },

    { sourcePosition: { x: 1, y: 1 }, innerCorners: ["tr"] },
    { sourcePosition: { x: 2, y: 1 }, innerCorners: ["tl"] },
    { sourcePosition: { x: 2, y: 1 }, innerCorners: ["tr"] },
    { sourcePosition: { x: 3, y: 1 }, innerCorners: ["tl"] },

    { sourcePosition: { x: 1, y: 1 }, innerCorners: [] },
    { sourcePosition: { x: 2, y: 1 }, innerCorners: ["tl", "br"] },
    { sourcePosition: { x: 4, y: 1 }, innerCorners: [] },
    { sourcePosition: { x: 2, y: 1 }, innerCorners: ["tr", "br"] },
  ],
  [
    { sourcePosition: { x: 0, y: 2 }, innerCorners: [] },

    { sourcePosition: { x: 1, y: 2 }, innerCorners: ["tr"] },
    { sourcePosition: { x: 2, y: 2 }, innerCorners: ["tr", "tl"] },
    { sourcePosition: { x: 3, y: 2 }, innerCorners: ["tl"] },

    { sourcePosition: { x: 1, y: 1 }, innerCorners: ["br"] },
    { sourcePosition: { x: 2, y: 1 }, innerCorners: ["bl"] },
    { sourcePosition: { x: 2, y: 1 }, innerCorners: ["br"] },
    { sourcePosition: { x: 3, y: 1 }, innerCorners: ["bl"] },

    { sourcePosition: { x: 2, y: 1 }, innerCorners: ["tl", "bl"] },
    { sourcePosition: { x: 2, y: 1 }, innerCorners: [] },
    { sourcePosition: { x: 2, y: 1 }, innerCorners: ["tr", "bl"] },
    { sourcePosition: { x: 3, y: 1 }, innerCorners: [] },
  ],
  [
    { sourcePosition: { x: 0, y: 3 }, innerCorners: [] },

    { sourcePosition: { x: 1, y: 3 }, innerCorners: [] },
    { sourcePosition: { x: 2, y: 3 }, innerCorners: [] },
    { sourcePosition: { x: 3, y: 3 }, innerCorners: [] },

    { sourcePosition: { x: 2, y: 1 }, innerCorners: ["tl", "tr", "br"] },
    { sourcePosition: { x: 2, y: 2 }, innerCorners: ["tl"] },
    { sourcePosition: { x: 2, y: 2 }, innerCorners: ["tr"] },
    { sourcePosition: { x: 2, y: 1 }, innerCorners: ["tl", "tr", "bl"] },

    { sourcePosition: { x: 1, y: 2 }, innerCorners: [] },
    { sourcePosition: { x: 2, y: 2 }, innerCorners: [] },
    { sourcePosition: { x: 2, y: 1 }, innerCorners: ["bl", "br"] },
    { sourcePosition: { x: 3, y: 2 }, innerCorners: [] },
  ],
];
