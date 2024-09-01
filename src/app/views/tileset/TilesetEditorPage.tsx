import { TilesetDocument } from "@/app/model";
import { TilesetEditorPageProvider, useTilesetEditorPageState } from "@/app/providers/TilesetEditorPageProvider";
import { useEffect } from "react";
import classes from "./TilesetEditorPage.module.css";
import { TilesetEditorToolbar } from "./TilesetEditorToolbar";
import { TilesetEditorToolSettings } from "./TilesetEditorToolSettings";
import { TilesetEditorTopbar } from "./TilesetEditorTopbar";
import { TilesetEditorView } from "./TilesetEditorView";

export const createNewSymbol: unique symbol = Symbol("createNew");

export type TilesetEditorPageMode = "raw" | "jigsaw" | "terrain";

interface TilesetEditorPageContext {
  documentId: TilesetDocument["id"] | typeof createNewSymbol;
  backAction?: () => void;
}

export function TilesetEditorPage({ backAction, documentId }: TilesetEditorPageContext) {
  const context = useTilesetEditorPageState();

  useEffect(() => {
    if (typeof documentId === "string") {
      context.loadTilesetDocument(documentId);
    }
  }, []);

  return (
    <div className={classes.root}>
      <TilesetEditorPageProvider value={context}>
        <TilesetEditorTopbar backAction={backAction} />
        <TilesetEditorView />
        <TilesetEditorToolSettings />
        <TilesetEditorToolbar />
      </TilesetEditorPageProvider>
    </div>
  );
}
