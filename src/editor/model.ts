import { EraserTool } from "./tools/EraserTool";
import { PencilTool } from "./tools/PencilTool";
import { TileTool } from "./tools/TileTool";

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

export function createTile(x: number, y: number, corners: readonly TileInnerCorner[] = []): Tile {
  return {
    x,
    y,
    corners,
  };
}

export type TileGrid = Tile[][];

export type TilesetChangedCallback = () => void;

export type RGBA = [r: number, g: number, b: number, a: number];

export type TilesetEditorTool = PencilTool | TileTool | EraserTool;
