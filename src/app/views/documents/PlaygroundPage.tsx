import { TilesetEditorView } from "@/app/components/TilesetEditorView";
import { Topbar } from "@/app/components/Topbar";
import { useDocumentsState } from "@/app/providers/DocumentsProvider";
import { TilesetEditorProvider, useTilesetEditorState } from "@/app/providers/TilesetEditorProvider";
import { BaseTileset, GODOT_TILES, Tileset4x4Plus, Tileset4x4PlusCombos, TilesetTerrain } from "@/editor";
import { ITilesetCombos } from "@/editor/tileset/ITilesetCombos";
import { useMemo } from "react";
import classes from "./PlaygroundPage.module.css";

interface PlaygroundPageProps {
  backAction?: () => void;
}

export function PlaygroundPage({ backAction }: PlaygroundPageProps) {
  const state = useDocumentsState();

  const tileset = useMemo(() => {
    if (state.loading) {
      return null;
    }

    const sourceTilesets: ITilesetCombos[] = [];
    state.documents.forEach((doc) => {
      const tileset = new Tileset4x4Plus();
      tileset.putSourceImageData(doc.imageData);
      const tilesetCombos = new Tileset4x4PlusCombos(tileset, GODOT_TILES);
      sourceTilesets.push(tilesetCombos);
    });
    const tilesetTerrain = new TilesetTerrain(sourceTilesets, 16, 16);
    return tilesetTerrain;
  }, [state.loading]);

  return (
    <div className={classes.root}>
      <Topbar title="Playground" backAction={backAction} />
      {tileset && <PlaygroundPageInner tileset={tileset} />}
    </div>
  );
}

interface PlaygroundPageInnerProps {
  tileset: BaseTileset;
}

function PlaygroundPageInner({ tileset }: PlaygroundPageInnerProps) {
  const editor = useTilesetEditorState(tileset);
  return (
    <TilesetEditorProvider value={editor}>
      <TilesetEditorView />
    </TilesetEditorProvider>
  );
}
