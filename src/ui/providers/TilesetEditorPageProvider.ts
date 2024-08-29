import { createContext, useContext, useRef, useState } from "react";
import { EXAMPLE_TERRAIN_TILES, GODOT_NEIGHBORS, GODOT_TILES } from "../../editor/model";
import { BaseTileset } from "../../editor/tileset/BaseTileset";
import { Tileset4x4Plus } from "../../editor/tileset/Tileset4x4Plus";
import { Tileset4x4PlusJigsaw } from "../../editor/tileset/Tileset4x4PlusJigsaw";
import { Tileset4x4PlusTerrain } from "../../editor/tileset/Tileset4x4PlusTerrain";
import { TilesetEditor } from "../../editor/TilesetEditor";
import { PencilTool } from "../../editor/tools/PencilTool";

const context = createContext<TilesetEditorPageContext>(null as never);
export const TilesetEditorPageProvider = context.Provider;

export function useTilesetEditorPageContext() {
  const tileset = useContext(context);
  return tileset;
}

export type TilesetEditorPageMode = "raw" | "jigsaw" | "terrain";
export type TilesetEditorPageContext = {
  mode: TilesetEditorPageMode;
  setMode: (mode: TilesetEditorPageMode) => void;
  tileset: BaseTileset;
  editor: TilesetEditor;
};

export function useTilesetEditorPageState() {
  const [mode, setMode] = useState<TilesetEditorPageMode>("raw");

  const tileset4x4Plus = useRef(new Tileset4x4Plus());
  const tileset4x4PlusJigsaw = useRef(new Tileset4x4PlusJigsaw(tileset4x4Plus.current, GODOT_TILES));
  const tileset4x4PlusTerrain = useRef(
    new Tileset4x4PlusTerrain(tileset4x4PlusJigsaw.current, GODOT_NEIGHBORS, EXAMPLE_TERRAIN_TILES)
  );

  const editor4x4Plus = useRef(new TilesetEditor(tileset4x4Plus.current, new PencilTool()));
  const editor4x4PlusJigsaw = useRef(new TilesetEditor(tileset4x4PlusJigsaw.current, new PencilTool()));
  const editor4x4PlusTerrain = useRef(new TilesetEditor(tileset4x4PlusTerrain.current, new PencilTool()));

  let tileset: BaseTileset;
  let editor: TilesetEditor;
  if (mode === "raw") {
    tileset = tileset4x4Plus.current;
    editor = editor4x4Plus.current;
  } else if (mode === "jigsaw") {
    tileset = tileset4x4PlusJigsaw.current;
    editor = editor4x4PlusJigsaw.current;
  } else if (mode === "terrain") {
    tileset = tileset4x4PlusTerrain.current;
    editor = editor4x4PlusTerrain.current;
  } else {
    throw new Error(`Invalid editor mode: ${mode}`);
  }

  return { mode, setMode, tileset, editor };
}

export function useTileset() {
  const pageContext = useContext(context);
  return pageContext.tileset;
}

export function useTilesetEditor() {
  const pageContext = useContext(context);
  return pageContext.editor;
}
