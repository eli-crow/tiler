import { TilesetDocument } from "@/app/model";
import { TilesetEditorPageProvider, useTilesetEditorPageState } from "@/app/providers/TilesetEditorPageProvider";
import { useEffect } from "react";
import { TilesetEditorView } from "../../components/TilesetEditorView";
import classes from "./TilesetEditorPage.module.css";
import { TilesetEditorToolbar } from "./TilesetEditorToolbar";
import { TilesetEditorToolSettings } from "./TilesetEditorToolSettings";
import { TilesetEditorTopbar } from "./TilesetEditorTopbar";

export const createNew4x4PlusSymbol = Symbol("createNew");
export const createNewCombosSymbol = Symbol("createNewCombos");

export type TilesetEditorPageMode = "raw" | "Combos" | "terrain";

interface TilesetEditorPageContext {
  documentId: TilesetDocument["id"] | typeof createNew4x4PlusSymbol | typeof createNewCombosSymbol;
  backAction?: () => void;
}

export function TilesetEditorPage({ backAction, documentId }: TilesetEditorPageContext) {
  const context = useTilesetEditorPageState(documentId);

  useEffect(() => {
    if (typeof documentId === "string") {
      context.loadTilesetDocument(documentId);
    } else if (documentId === createNew4x4PlusSymbol) {
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
