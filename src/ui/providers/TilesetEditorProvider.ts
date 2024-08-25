import { createContext, useContext, useReducer } from "react";
import { Tileset4x4JigsawEditor } from "../../editor/Tileset4x4PlusJigsawEditor";

const TileEditorContext = createContext<Tileset4x4JigsawEditor>(null as never);
export const TileEditorProvider = TileEditorContext.Provider;

export function useTilesetEditor() {
  const editor = useContext(TileEditorContext);
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  editor.on("toolChanged", forceUpdate);

  return editor;
}
