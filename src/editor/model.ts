import { JigsawTileTool } from "./tools/JigsawTileTool";
import { PencilTool } from "./tools/PencilTool";

export type PixelPoint = {
  x: number;
  y: number;
};

export type Tile = {
  x: number;
  y: number;
  corners: readonly TileInnerCorner[];
};

export type TilePosition = {
  x: number;
  y: number;
};

export function tilesMatch(a: Tile, b: Tile): boolean {
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.corners.length === b.corners.length &&
    a.corners.every((corner, index) => corner === b.corners[index])
  );
}

export type TileInnerCorner = "tl" | "tr" | "bl" | "br";
export type TileNeighbor = "tl" | "tr" | "bl" | "br" | "t" | "r" | "b" | "l";

export function createJigsawTile(x: number, y: number, corners: readonly TileInnerCorner[] = []): Tile {
  return {
    x,
    y,
    corners,
  };
}

export type JigsawTileGrid = Tile[][];

export type TilesetChangedCallback = () => void;

export type RGBA = [r: number, g: number, b: number, a: number];

export type TilesetEditorTool = PencilTool | JigsawTileTool;

export type TerrainTile = boolean;
export type TerrainTileGrid = TerrainTile[][];
export type TileNeighborGrid = number[][];
export type FlattenedTileNeighborGrid = { x: number; y: number; neighbors: number }[];

export function flattenTileNeighborGrid(grid: TileNeighborGrid): FlattenedTileNeighborGrid {
  const rows = grid.length;
  const cols = grid[0].length;
  const flattened: FlattenedTileNeighborGrid = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const neighbors = grid[y][x];
      flattened.push({ x, y, neighbors });
    }
  }

  return flattened;
}

// 0b1_0000_0000
// self - t, r, b, l - tr, br, bl, tl

// prettier-ignore
export const GODOT_NEIGHBORS: number[][] = [
  [0b1_0010_0000,   0b1_0110_0000, 0b1_0111_0000, 0b1_0011_0000,   0b1_1111_0001, 0b1_0111_0100, 0b1_0111_0010, 0b1_1111_1000,   0b1_0110_0100, 0b1_1111_0110, 0b1_0111_0110, 0b1_0011_0010],
  [0b1_1010_0000,   0b1_1110_0000, 0b1_1111_0000, 0b1_1011_0000,   0b1_1110_0100, 0b1_1111_1110, 0b1_1111_0111, 0b1_1011_0010,   0b1_1110_1100, 0b1_1111_1010, 0b0_0000_0000, 0b1_1111_0011],
  [0b1_1000_0000,   0b1_1100_0000, 0b1_1101_0000, 0b1_1001_0000,   0b1_1110_1000, 0b1_1111_1101, 0b1_1111_1011, 0b1_1011_0001,   0b1_1111_1100, 0b1_1111_1111, 0b1_1111_0101, 0b1_1011_0011],
  [0b1_0000_0000,   0b1_0100_0000, 0b1_0101_0000, 0b1_0001_0000,   0b1_1111_0001, 0b1_1101_1000, 0b1_1101_0001, 0b1_1111_0100,   0b1_1100_1000, 0b1_1101_1001, 0b1_1111_1001, 0b1_1001_0001],
];

export const GODOT_TILES: JigsawTileGrid = [
  [
    { x: 0, y: 0, corners: [] },

    { x: 1, y: 0, corners: ["br"] },
    { x: 2, y: 0, corners: ["bl", "br"] },
    { x: 3, y: 0, corners: ["bl"] },

    { x: 2, y: 1, corners: ["bl", "tr", "br"] },
    { x: 2, y: 0, corners: ["bl"] },
    { x: 2, y: 0, corners: ["br"] },
    { x: 2, y: 1, corners: ["bl", "tl", "br"] },

    { x: 1, y: 0, corners: [] },
    { x: 2, y: 1, corners: ["tl", "tr"] },
    { x: 2, y: 0, corners: [] },
    { x: 3, y: 0, corners: [] },
  ],
  [
    { x: 0, y: 1, corners: [] },

    { x: 1, y: 1, corners: ["br", "tr"] },
    { x: 2, y: 1, corners: ["bl", "br", "tr", "tl"] },
    { x: 3, y: 1, corners: ["tl", "bl"] },

    { x: 1, y: 1, corners: ["tr"] },
    { x: 2, y: 1, corners: ["tl"] },
    { x: 2, y: 1, corners: ["tr"] },
    { x: 3, y: 1, corners: ["tl"] },

    { x: 1, y: 1, corners: [] },
    { x: 2, y: 1, corners: ["tl", "br"] },
    { x: 4, y: 1, corners: [] },
    { x: 2, y: 1, corners: ["tr", "br"] },
  ],
  [
    { x: 0, y: 2, corners: [] },

    { x: 1, y: 2, corners: ["tr"] },
    { x: 2, y: 2, corners: ["tr", "tl"] },
    { x: 3, y: 2, corners: ["tl"] },

    { x: 1, y: 1, corners: ["br"] },
    { x: 2, y: 1, corners: ["bl"] },
    { x: 2, y: 1, corners: ["br"] },
    { x: 3, y: 1, corners: ["bl"] },

    { x: 2, y: 1, corners: ["tl", "bl"] },
    { x: 2, y: 1, corners: [] },
    { x: 2, y: 1, corners: ["tr", "bl"] },
    { x: 3, y: 1, corners: [] },
  ],
  [
    { x: 0, y: 3, corners: [] },

    { x: 1, y: 3, corners: [] },
    { x: 2, y: 3, corners: [] },
    { x: 3, y: 3, corners: [] },

    { x: 2, y: 1, corners: ["bl", "tr", "br"] },
    { x: 2, y: 2, corners: ["tl"] },
    { x: 2, y: 2, corners: ["tr"] },
    { x: 2, y: 1, corners: ["tl", "tr", "bl"] },

    { x: 1, y: 2, corners: [] },
    { x: 2, y: 2, corners: [] },
    { x: 2, y: 1, corners: ["bl", "br"] },
    { x: 3, y: 2, corners: [] },
  ],
];

export const EXAMPLE_TERRAIN_TILES: TerrainTileGrid = [
  [false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false],
];

// export const EXAMPLE_TERRAIN_TILES: TerrainTileGrid = [
//   [false, false, false, true, false, true, true, true],
//   [true, false, false, true, false, false, true, false],
//   [true, false, true, true, false, true, true, false],
//   [false, false, true, true, false, true, true, true],
//   [true, false, false, true, false, false, true, false],
//   [false, false, false, true, false, true, true, true],
//   [false, false, false, true, false, true, false, false],
// ];
