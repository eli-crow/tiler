import { BaseTileset, getDefaultToolForTileset, RGBA, TilesetEditor, Tool, TOOL_INSTANCES, TOOLS } from "@/editor";
import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";

const context = createContext<TilesetEditorContext>(null as never);
export const TilesetEditorProvider = context.Provider;

export function useTilesetEditorContext() {
  const tileset = useContext(context);
  return tileset;
}

export type TilesetEditorContext = ReturnType<typeof useTilesetEditorState>;

export function useTilesetEditorState(tileset: BaseTileset) {
  const editor = useMemo<TilesetEditor<BaseTileset>>(
    () => new TilesetEditor(tileset, TOOL_INSTANCES.pencil),
    [tileset]
  );

  const [showTileGuides, setShowTileGuides] = useState(editor.showTileGuides);
  const [color, setColor] = useState<RGBA>(editor.color);
  const [tool, setTool] = useState<Tool>(getDefaultToolForTileset(tileset));
  const supportedTools = TOOLS.filter((t) => t.supportsTileset(tileset));

  editor.tool = tool;
  editor.color = color;
  editor.tileset = tileset;
  editor.showTileGuides = showTileGuides;

  const lastTileset = useRef<BaseTileset | null>(null);
  if (lastTileset.current !== tileset && !tileset.supportsTool(tool)) {
    setTool(getDefaultToolForTileset(tileset));
    lastTileset.current = tileset;
  }

  return {
    tool,
    setTool,
    color,
    setColor,
    editor,
    showTileGuides,
    setShowTileGuides,
    supportedTools,
  };
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
