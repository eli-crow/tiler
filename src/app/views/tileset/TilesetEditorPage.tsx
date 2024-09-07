import { TilesetDocument } from "@/app/model";
import { TilesetEditorPageProvider, useTilesetEditorPageState } from "@/app/providers/TilesetEditorPageProvider";
import { useEffect } from "react";
import { TilesetEditorView } from "../../components/TilesetEditorView";
import classes from "./TilesetEditorPage.module.css";
import { TilesetEditorToolbar } from "./TilesetEditorToolbar";
import { TilesetEditorToolSettings } from "./TilesetEditorToolSettings";
import { TilesetEditorTopbar } from "./TilesetEditorTopbar";

export const createNewSymbol: unique symbol = Symbol("createNew");

export type TilesetEditorPageMode = "raw" | "Combos" | "terrain";

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
    if (documentId === createNewSymbol) {
      context.initExampleTilesetDocument();
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
