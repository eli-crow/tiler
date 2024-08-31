import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { EXAMPLE_TERRAIN_TILES, GODOT_NEIGHBORS, GODOT_TILES, RGBA } from "../../editor/model";
import { BaseTileset } from "../../editor/tileset/BaseTileset";
import { Tileset4x4Plus } from "../../editor/tileset/Tileset4x4Plus";
import { Tileset4x4PlusJigsaw } from "../../editor/tileset/Tileset4x4PlusJigsaw";
import { Tileset4x4PlusTerrain } from "../../editor/tileset/Tileset4x4PlusTerrain";
import { TilesetEditor } from "../../editor/TilesetEditor";
import { FillTool } from "../../editor/tools/FillTool";
import { JigsawTileTool } from "../../editor/tools/JigsawTileTool";
import { PencilTool } from "../../editor/tools/PencilTool";
import { TerrainTileTool } from "../../editor/tools/TerrainTileTool";
import { Tool } from "../../editor/tools/Tool";

const context = createContext<TilesetEditorPageContext>(null as never);
export const TilesetEditorPageProvider = context.Provider;

export function useTilesetEditorPageContext() {
  const tileset = useContext(context);
  return tileset;
}

export type TilesetEditorPageMode = "raw" | "jigsaw" | "terrain";
export type TilesetEditorPageContext = {
  tilesetName: string;
  mode: TilesetEditorPageMode;
  setMode: (mode: TilesetEditorPageMode) => void;
  tileset: BaseTileset;
  editor: TilesetEditor;
  supportedTools: readonly Tool[];
  tool: Tool;
  setTool: (tool: Tool) => void;
  color: RGBA;
  setColor: (color: RGBA) => void;
};

const pencilTool = new PencilTool();
const eraserTool = new PencilTool(true);
const jigsawTileTool = new JigsawTileTool();
const terrainTileTool = new TerrainTileTool();
const fillTool = new FillTool();

export const TOOLS = [pencilTool, eraserTool, fillTool, jigsawTileTool, terrainTileTool];

const tileset4x4Plus = new Tileset4x4Plus();
const tileset4x4PlusJigsaw = new Tileset4x4PlusJigsaw(tileset4x4Plus, GODOT_TILES);
const tileset4x4PlusTerrain = new Tileset4x4PlusTerrain(tileset4x4PlusJigsaw, GODOT_NEIGHBORS, EXAMPLE_TERRAIN_TILES);

const editor: TilesetEditor = new TilesetEditor(tileset4x4Plus, pencilTool);

function getDefaultToolForTileset<T extends BaseTileset>(tileset: T) {
  if (tileset instanceof Tileset4x4Plus) {
    return pencilTool;
  } else if (tileset instanceof Tileset4x4PlusJigsaw) {
    return pencilTool;
  } else if (tileset instanceof Tileset4x4PlusTerrain) {
    return pencilTool;
  } else {
    throw new Error(`Unknown tileset type: ${tileset}`);
  }
}

export function useTilesetEditorPageState(): TilesetEditorPageContext {
  const [tilesetName, _setTilesetName] = useState("4x4Plus Example");
  const [mode, setMode] = useState<TilesetEditorPageMode>("raw");
  const [color, setColor] = useState<RGBA>([255, 255, 255, 255]);

  let tileset: BaseTileset;
  if (mode === "raw") {
    tileset = tileset4x4Plus;
  } else if (mode === "jigsaw") {
    tileset = tileset4x4PlusJigsaw;
  } else if (mode === "terrain") {
    tileset = tileset4x4PlusTerrain;
  } else {
    throw new Error(`Invalid editor mode: ${mode}`);
  }

  const [tool, setTool] = useState<Tool>(getDefaultToolForTileset(tileset));
  const supportedTools = TOOLS.filter((t) => t.supportsTileset(tileset));

  editor.tool = tool;
  editor.color = color;
  editor.tileset = tileset;
  if (!tileset.supportsTool(tool)) {
    setTool(getDefaultToolForTileset(tileset));
  }

  return { mode, setMode, tool, setTool, color, setColor, tileset, editor, tilesetName, supportedTools };
}

export function useTileset() {
  const pageContext = useContext(context);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    pageContext.tileset.on("dataChanged", forceUpdate);
    return () => pageContext.tileset.off("dataChanged", forceUpdate);
  });
  return pageContext.tileset;
}

export function useTilesetEditor() {
  const pageContext = useContext(context);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const editor = pageContext.editor;
  useEffect(() => {
    editor.on("changed", forceUpdate);
    return () => editor.off("changed", forceUpdate);
  }, []);
  return editor;
}
