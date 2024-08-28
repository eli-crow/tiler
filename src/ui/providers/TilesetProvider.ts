import { createContext, useContext } from "react";
import { BaseTileset } from "../../editor/tileset/BaseTileset";

const TilesetContext = createContext<BaseTileset>(null as never);
export const TilesetProvider = TilesetContext.Provider;

export function useTileset() {
  const tileset = useContext(TilesetContext);
  return tileset;
}
