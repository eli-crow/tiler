import { TilesetEditorView } from "@/app/components/TilesetEditorView";
import { Topbar } from "@/app/components/Topbar";
import { useDocumentsState } from "@/app/providers/DocumentsProvider";
import {
  GODOT_NEIGHBORS,
  GODOT_TILES,
  TileNeighborGrid,
  Tileset4x4Plus,
  Tileset4x4PlusCombos,
  TilesetEditor,
  TilesetTerrain,
  TOOL_INSTANCES,
} from "@/editor";
import { useMemo } from "react";
import classes from "./PlaygroundPage.module.css";

interface PlaygroundPageProps {
  backAction?: () => void;
}

export function PlaygroundPage({ backAction }: PlaygroundPageProps) {
  const state = useDocumentsState();

  const editor = useMemo(() => {
    if (state.loading) {
      return null;
    }

    const sourceTilesets: Tileset4x4PlusCombos[] = [];
    const sourceNeighbors: TileNeighborGrid[] = [];
    state.documents.forEach((doc) => {
      const tileset = new Tileset4x4Plus();
      tileset.putSourceImageData(doc.imageData);
      const tilesetCombos = new Tileset4x4PlusCombos(tileset, GODOT_TILES);
      sourceTilesets.push(tilesetCombos);
      sourceNeighbors.push(GODOT_NEIGHBORS);
    });
    const tilesetTerrain = new TilesetTerrain(sourceTilesets, sourceNeighbors, 16, 16);
    const editor = new TilesetEditor(tilesetTerrain, TOOL_INSTANCES.pencil);
    return editor;
  }, [state.loading]);

  return (
    <div className={classes.root}>
      <Topbar title="Playground" backAction={backAction} />
      {editor && <TilesetEditorView editor={editor} />}
    </div>
  );
}
