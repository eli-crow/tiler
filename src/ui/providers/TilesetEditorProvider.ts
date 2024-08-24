import { createContext, useContext } from "react";
import { TilesetEditor } from "../../editor/TilesetEditor";

const TileEditorContext = createContext<TilesetEditor>(null as never);
export const TileEditorProvider = TileEditorContext.Provider;

export function useTilesetEditor() {
  return useContext(TileEditorContext);
}
