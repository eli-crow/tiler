import { TilesetDocument } from "@/app/model";
import {
  createNew4x4PlusSymbol,
  createNewCombosSymbol,
  TilesetDocumentProvider,
  useTilesetDocumentState,
} from "@/app/providers/TilesetDocumentProvider";
import { TilesetEditorProvider, useTilesetEditorState } from "@/app/providers/TilesetEditorProvider";
import { TilesetsProvider, useTilesetsState } from "@/app/providers/TilesetsProvider";
import { TilesetEditorView } from "../../components/TilesetEditorView";
import classes from "./TilesetEditorPage.module.css";
import { TilesetEditorToolbar } from "./TilesetEditorToolbar";
import { TilesetEditorToolSettings } from "./TilesetEditorToolSettings";
import { TilesetEditorTopbar } from "./TilesetEditorTopbar";

export type TilesetEditorPageMode = "raw" | "Combos" | "terrain";

interface TilesetEditorPageContext {
  documentId: TilesetDocument["id"] | typeof createNew4x4PlusSymbol | typeof createNewCombosSymbol;
  backAction?: () => void;
}

export function TilesetEditorPage({ backAction, documentId }: TilesetEditorPageContext) {
  const docState = useTilesetDocumentState(documentId);

  return (
    <div className={classes.root}>
      <TilesetDocumentProvider value={docState}>
        {docState.doc && <TilesetEditorPageInner doc={docState.doc} backAction={backAction} />}
      </TilesetDocumentProvider>
    </div>
  );
}

interface TilesetEditorPageInnerProps {
  doc: TilesetDocument;
  backAction?: () => void;
}

function TilesetEditorPageInner({ doc, backAction }: TilesetEditorPageInnerProps) {
  const tilesetsState = useTilesetsState(doc);
  const editorState = useTilesetEditorState(tilesetsState.tileset);
  return (
    <TilesetsProvider value={tilesetsState}>
      <TilesetEditorProvider value={editorState}>
        <TilesetEditorTopbar backAction={backAction} />
        <TilesetEditorView />
        <TilesetEditorToolSettings />
        <TilesetEditorToolbar />
      </TilesetEditorProvider>
    </TilesetsProvider>
  );
}
