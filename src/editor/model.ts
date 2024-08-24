import { PencilTool } from "./tools/PencilTool";
import { TileTool } from "./tools/TileTool";
import { Tool } from "./tools/Tool";

export type Tile = {
  x: number;
  y: number;
  corners: readonly TileInnerCorner[];
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
export type ReadonlyTileGrid = readonly (readonly Tile[])[];

export type TilesetChangedCallback = () => void;

export type RGBA = { r: number; g: number; b: number; a: number };

export type SupportsPencilTool = {
  setPixel(x: number, y: number, color: RGBA): void;
  get tool(): Tool;
  set tool(tool: PencilTool);
};

export type SupportsTileTool = {
  setTile(x: number, y: number, tile: Tile): void;
  get tool(): Tool;
  set tool(tool: TileTool);
};
