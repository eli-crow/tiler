import { BaseTileset, Tileset4x4Plus, Tileset4x4PlusCombos, TilesetTerrain } from "../tileset";
import { TilesetCombos } from "../tileset/TilesetCombos";
import { FillTool } from "./FillTool";
import { PencilTool } from "./PencilTool";
import { TerrainTileTool } from "./TerrainTileTool";
import { Tool } from "./Tool";

export * from "./FillTool";
export * from "./PencilTool";
export * from "./TerrainTileTool";
export * from "./Tool";

export const TOOL_INSTANCES = {
  pencil: new PencilTool(),
  eraser: new PencilTool(true),
  fill: new FillTool(),
  terrainTile: new TerrainTileTool(),
};

export const TOOLS: Tool[] = Object.values(TOOL_INSTANCES);

export function getDefaultToolForTileset<T extends BaseTileset>(tileset: T) {
  if (tileset instanceof Tileset4x4Plus) {
    return TOOL_INSTANCES.pencil;
  } else if (tileset instanceof Tileset4x4PlusCombos) {
    return TOOL_INSTANCES.pencil;
  } else if (tileset instanceof TilesetTerrain) {
    return TOOL_INSTANCES.terrainTile;
  } else if (tileset instanceof TilesetCombos) {
    return TOOL_INSTANCES.pencil;
  } else {
    throw new Error(`Unknown tileset type: ${tileset}`);
  }
}
