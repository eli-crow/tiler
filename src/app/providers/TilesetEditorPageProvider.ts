import { createTilesetDocument4x4Plus, TilesetDocument } from "@/app/model";
import {
  BaseTileset,
  getDefaultToolForTileset,
  GODOT_NEIGHBORS,
  GODOT_TILES,
  RGBA,
  Tileset4x4Plus,
  Tileset4x4PlusCombos,
  TilesetEditor,
  TilesetTerrain,
  Tool,
  TOOL_INSTANCES,
  TOOLS,
} from "@/editor";
import sample4x4Plus from "@/editor/tileset/examples/sample4x4Plus.png";
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { IDocumentService } from "../services/IDocumentService";
import { IndexedDBDocumentService } from "../services/IndexedDBDocumentService";

const documentService: IDocumentService = IndexedDBDocumentService.instance;

const context = createContext<TilesetEditorPageContext>(null as never);
export const TilesetEditorPageProvider = context.Provider;

export function useTilesetEditorPageContext() {
  const tileset = useContext(context);
  return tileset;
}

export type TilesetEditorPageMode = "raw" | "Combos" | "terrain";
export type TilesetEditorPageContext = ReturnType<typeof useTilesetEditorPageState>;

export function useTilesetEditorPageState() {
  const [doc, setDoc] = useState<TilesetDocument | null>(null);

  const tileset4x4Plus = useMemo(() => new Tileset4x4Plus(), []);
  const tileset4x4PlusCombos = useMemo(() => new Tileset4x4PlusCombos(tileset4x4Plus, GODOT_TILES), [tileset4x4Plus]);
  const tileset4x4PlusTerrain = useMemo(
    () => new TilesetTerrain([tileset4x4PlusCombos], [GODOT_NEIGHBORS], 16, 16),
    [tileset4x4PlusCombos]
  );
  const editor = useMemo<TilesetEditor<BaseTileset>>(
    () => new TilesetEditor(tileset4x4Plus, TOOL_INSTANCES.pencil),
    [tileset4x4Plus]
  );

  const [mode, setMode] = useState<TilesetEditorPageMode>("raw");
  let tileset: BaseTileset;
  if (mode === "raw") {
    tileset = tileset4x4Plus;
  } else if (mode === "Combos") {
    tileset = tileset4x4PlusCombos;
  } else if (mode === "terrain") {
    tileset = tileset4x4PlusTerrain;
  } else {
    throw new Error(`Invalid editor mode: ${mode}`);
  }

  const [showTileGuides, setShowTileGuides] = useState(editor.showTileGuides);
  const [color, setColor] = useState<RGBA>(editor.color);
  const [tool, setTool] = useState<Tool>(getDefaultToolForTileset(tileset));
  const supportedTools = TOOLS.filter((t) => t.supportsTileset(tileset));

  editor.tool = tool;
  editor.color = color;
  editor.tileset = tileset;
  editor.showTileGuides = showTileGuides;
  if (!tileset.supportsTool(tool)) {
    setTool(getDefaultToolForTileset(tileset));
  }

  async function saveTilesetDocument() {
    if (!doc) {
      throw new Error("No document loaded");
    }
    const newDoc = {
      ...doc,
      imageData: tileset.getSourceImageData(),
    };
    setDoc(newDoc);
    await documentService.saveTilesetDocument(newDoc);
  }

  async function loadTilesetDocument(id: TilesetDocument["id"]) {
    const newDoc = await documentService.loadTilesetDocument(id);
    setDoc(newDoc);
    tileset.putSourceImageData(newDoc.imageData);
    tileset.invalidate();
  }

  async function initExampleTilesetDocument() {
    const newDoc = createTilesetDocument4x4Plus();
    await tileset.setSourceDataFromImageUrlAsync(sample4x4Plus);
    tileset.invalidate();
    setDoc(newDoc);
  }

  function setTilesetName(name: string) {
    if (!doc) {
      throw new Error("No document loaded");
    }
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
    showTileGuides,
    setShowTileGuides,
    tilesetName: doc?.name ?? "",
    saveTilesetDocument,
    loadTilesetDocument,
    initExampleTilesetDocument,
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

export function useActiveTool<T extends Tool>() {
  const pageContext = useContext(context);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    pageContext.tool.on("changed", forceUpdate);
    return () => pageContext.tool.off("changed", forceUpdate);
  });
  return pageContext.tool as T;
}
