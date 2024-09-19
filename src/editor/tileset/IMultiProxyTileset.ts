import { BaseTileset } from "./BaseTileset";

export interface IMultiProxyTileset {
  sourceTilesets: BaseTileset[];
}

export function isMultiProxyTileset(tileset: any): tileset is IMultiProxyTileset {
  return tileset instanceof BaseTileset && "sourceTilesets" in tileset;
}
