import { BaseTileset } from "./BaseTileset";

export interface IProxyTileset {
  sourceTileset: BaseTileset;
}

export function isProxyTileset(tileset: any): tileset is IProxyTileset {
  return tileset instanceof BaseTileset && "sourceTileset" in tileset;
}
