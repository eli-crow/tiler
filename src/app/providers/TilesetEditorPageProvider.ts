import { createTilesetDocument4x4Plus, TilesetDocument } from "@/app/model";
import {
  BaseTileset,
  EXAMPLE_TERRAIN_TILES,
  FillTool,
  GODOT_NEIGHBORS,
  GODOT_TILES,
  JigsawTileTool,
  PencilTool,
  RGBA,
  TerrainTileTool,
  Tileset4x4Plus,
  Tileset4x4PlusJigsaw,
  Tileset4x4PlusTerrain,
  TilesetEditor,
  Tool,
} from "@/editor";
import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { FilesystemService } from "../services/FilesystemService";

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
  saveTilesetDocument: () => Promise<void>;
  loadTilesetDocument: () => Promise<void>;
  setTilesetName: (name: string) => void;
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
  const [doc, setDoc] = useState<TilesetDocument>(createTilesetDocument4x4Plus());
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

  async function saveTilesetDocument() {
    const newDoc = {
      ...doc,
      imageData: tileset.getSourceImageData(),
    };
    setDoc(newDoc);
    await FilesystemService.instance.saveTilesetDocument(newDoc);
  }

  async function loadTilesetDocument() {
    const newDoc = await FilesystemService.instance.openTilesetDocument();
    setDoc(newDoc);
    tileset.putSourceImageData(newDoc.imageData);
    tileset.invalidate();
  }

  function setTilesetName(name: string) {
    setDoc({ ...doc, name });
  }

  return {
    mode,
    setMode,
    tool,
    setTool,
    color,
    setColor,
    tileset,
    editor,
    tilesetName: doc.name,
    saveTilesetDocument,
    loadTilesetDocument,
    setTilesetName,
    supportedTools,
  };
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
