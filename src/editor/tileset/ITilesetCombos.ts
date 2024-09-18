import { CombosTile, CombosTileGrid } from "../model";
import { SupportsPencilTool } from "../tools";
import { IBaseTileset } from "./BaseTileset";

export interface ITilesetCombos<T extends CombosTile = CombosTile> extends IBaseTileset, SupportsPencilTool {
  readonly tiles: CombosTileGrid<T>;
  getTile(position: { x: number; y: number }): T | null;
  forEachTile(callback: (tile: T, position: { x: number; y: number }) => void): void;
}

export function isTilesetCombos(value: unknown): value is ITilesetCombos {
  return typeof value === "object" && value !== null && "tiles" in value;
}
