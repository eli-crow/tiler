import { createContext, useContext, useReducer } from "react";
import { TilesetEditor } from "../../editor/TilesetEditor";

const TileEditorContext = createContext<TilesetEditor>(null as never);
export const TileEditorProvider = TileEditorContext.Provider;

export function useTilesetEditor() {
  const editor = useContext(TileEditorContext);
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  editor.on("toolChanged", forceUpdate);

  return editor;
}
