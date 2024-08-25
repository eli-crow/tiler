import { createContext, useContext, useReducer } from "react";
import { BaseTilesetEditor } from "../../editor/BaseTilesetEditor";

const TileEditorContext = createContext<BaseTilesetEditor>(null as never);
export const TileEditorProvider = TileEditorContext.Provider;

export function useTilesetEditor() {
  const editor = useContext(TileEditorContext);
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  editor.on("toolChanged", forceUpdate);

  return editor;
}
