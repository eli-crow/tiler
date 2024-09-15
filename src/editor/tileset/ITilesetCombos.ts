import { CombosTile, CombosTileGrid } from "../model";
import { SupportsPencilTool } from "../tools";
import { IBaseTileset } from "./BaseTileset";

export interface ITilesetCombos<T extends CombosTile = CombosTile> extends IBaseTileset, SupportsPencilTool {
  readonly tiles: CombosTileGrid<T>;
}
