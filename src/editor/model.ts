import { Tile4x4PlusCombos } from "./tileset";

export type PixelPoint = {
  x: number;
  y: number;
};

export type TilePosition = {
  x: number;
  y: number;
};

export function tilePositionsMatch(a: TilePosition, b: TilePosition): boolean {
  return a.x === b.x && a.y === b.y;
}

export function combosTilesMatch(a: CombosTile, b: CombosTile): boolean {
  return a.neighbors === b.neighbors;
}

export type TileInnerCorner = "tl" | "tr" | "bl" | "br";

export type CombosTile = {
  neighbors: TileNeighbors;
};

export type ProxyTile = { sourcePosition: TilePosition };

export type CombosTileGrid<T extends CombosTile> = T[][];

export type RGBA = [r: number, g: number, b: number, a: number];
export function colorsMatch(a: RGBA, b: RGBA): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

export type TerrainTile = number;
export type TerrainTileGrid = TerrainTile[][];
export enum Neighbor {
  Self = 1 << 8,
  Top = 1 << 7,
  Right = 1 << 6,
  Bottom = 1 << 5,
  Left = 1 << 4,
  TopRight = 1 << 3,
  BottomRight = 1 << 2,
  BottomLeft = 1 << 1,
  TopLeft = 1 << 0,
  Sides = Neighbor.Top | Neighbor.Right | Neighbor.Bottom | Neighbor.Left,
  Plus = Neighbor.Self | Neighbor.Sides,
}
export type TileNeighbors = number;
export type TileNeighborFlattened = { x: number; y: number; neighbors: number };
export type TileNeighborGrid = TileNeighbors[][];
export type TileNeighborFlattenedGrid = TileNeighborFlattened[];

export const GODOT_TILES: CombosTileGrid<Tile4x4PlusCombos> = [
  [
    { sourcePosition: { x: 0, y: 0 }, neighbors: 0b1_0010_0000, innerCorners: [] },

    { sourcePosition: { x: 1, y: 0 }, neighbors: 0b1_0110_0000, innerCorners: ["br"] },
    { sourcePosition: { x: 2, y: 0 }, neighbors: 0b1_0111_0000, innerCorners: ["bl", "br"] },
    { sourcePosition: { x: 3, y: 0 }, neighbors: 0b1_0011_0000, innerCorners: ["bl"] },

    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_0001, innerCorners: ["bl", "tr", "br"] },
    { sourcePosition: { x: 2, y: 0 }, neighbors: 0b1_0111_0100, innerCorners: ["bl"] },
    { sourcePosition: { x: 2, y: 0 }, neighbors: 0b1_0111_0010, innerCorners: ["br"] },
    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_1000, innerCorners: ["bl", "tl", "br"] },

    { sourcePosition: { x: 1, y: 0 }, neighbors: 0b1_0110_0100, innerCorners: [] },
    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_0110, innerCorners: ["tl", "tr"] },
    { sourcePosition: { x: 2, y: 0 }, neighbors: 0b1_0111_0110, innerCorners: [] },
    { sourcePosition: { x: 3, y: 0 }, neighbors: 0b1_0011_0010, innerCorners: [] },
  ],
  [
    { sourcePosition: { x: 0, y: 1 }, neighbors: 0b1_1010_0000, innerCorners: [] },

    { sourcePosition: { x: 1, y: 1 }, neighbors: 0b1_1110_0000, innerCorners: ["br", "tr"] },
    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_0000, innerCorners: ["bl", "br", "tr", "tl"] },
    { sourcePosition: { x: 3, y: 1 }, neighbors: 0b1_1011_0000, innerCorners: ["tl", "bl"] },

    { sourcePosition: { x: 1, y: 1 }, neighbors: 0b1_1110_0100, innerCorners: ["tr"] },
    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_1110, innerCorners: ["tl"] },
    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_0111, innerCorners: ["tr"] },
    { sourcePosition: { x: 3, y: 1 }, neighbors: 0b1_1011_0010, innerCorners: ["tl"] },

    { sourcePosition: { x: 1, y: 1 }, neighbors: 0b1_1110_1100, innerCorners: [] },
    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_1010, innerCorners: ["tl", "br"] },
    { sourcePosition: { x: 4, y: 1 }, neighbors: 0b0_0000_0000, innerCorners: [] },
    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_0011, innerCorners: ["tr", "br"] },
  ],
  [
    { sourcePosition: { x: 0, y: 2 }, neighbors: 0b1_1000_0000, innerCorners: [] },

    { sourcePosition: { x: 1, y: 2 }, neighbors: 0b1_1100_0000, innerCorners: ["tr"] },
    { sourcePosition: { x: 2, y: 2 }, neighbors: 0b1_1101_0000, innerCorners: ["tr", "tl"] },
    { sourcePosition: { x: 3, y: 2 }, neighbors: 0b1_1001_0000, innerCorners: ["tl"] },

    { sourcePosition: { x: 1, y: 1 }, neighbors: 0b1_1110_1000, innerCorners: ["br"] },
    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_1101, innerCorners: ["bl"] },
    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_1011, innerCorners: ["br"] },
    { sourcePosition: { x: 3, y: 1 }, neighbors: 0b1_1011_0001, innerCorners: ["bl"] },

    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_1100, innerCorners: ["tl", "bl"] },
    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_1111, innerCorners: [] },
    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_0101, innerCorners: ["tr", "bl"] },
    { sourcePosition: { x: 3, y: 1 }, neighbors: 0b1_1011_0011, innerCorners: [] },
  ],
  [
    { sourcePosition: { x: 0, y: 3 }, neighbors: 0b1_0000_0000, innerCorners: [] },

    { sourcePosition: { x: 1, y: 3 }, neighbors: 0b1_0100_0000, innerCorners: [] },
    { sourcePosition: { x: 2, y: 3 }, neighbors: 0b1_0101_0000, innerCorners: [] },
    { sourcePosition: { x: 3, y: 3 }, neighbors: 0b1_0001_0000, innerCorners: [] },

    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_0010, innerCorners: ["tl", "tr", "br"] },
    { sourcePosition: { x: 2, y: 2 }, neighbors: 0b1_1101_1000, innerCorners: ["tl"] },
    { sourcePosition: { x: 2, y: 2 }, neighbors: 0b1_1101_0001, innerCorners: ["tr"] },
    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_0100, innerCorners: ["tl", "tr", "bl"] },

    { sourcePosition: { x: 1, y: 2 }, neighbors: 0b1_1100_1000, innerCorners: [] },
    { sourcePosition: { x: 2, y: 2 }, neighbors: 0b1_1101_1001, innerCorners: [] },
    { sourcePosition: { x: 2, y: 1 }, neighbors: 0b1_1111_1001, innerCorners: ["bl", "br"] },
    { sourcePosition: { x: 3, y: 2 }, neighbors: 0b1_1001_0001, innerCorners: [] },
  ],
];
