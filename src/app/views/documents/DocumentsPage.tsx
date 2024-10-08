import { Topbar } from "@/app/components/Topbar";
import type { TilesetDocument } from "@/app/model";
import { DocumentInfoProvider, useDocumentsState } from "@/app/providers/DocumentsProvider";
import classes from "./DocumentsPage.module.css";

interface DocumentInfoProps {
  onRequestNavigate: (tilesetId: TilesetDocument["id"]) => void;
  onNewDocument: (type: TilesetDocument["tilesetType"]) => void;
  onPlayground: () => void;
}

export function DocumentsPage({ onRequestNavigate, onNewDocument, onPlayground }: DocumentInfoProps) {
  const state = useDocumentsState();

  function handleDocumentClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!(e.target instanceof HTMLButtonElement)) {
      e.currentTarget.querySelector<HTMLButtonElement>("button[data-is-edit-button]")!.click();
    }
  }

  return (
    <div className={classes.root}>
      <Topbar title="Tilesets">
        <button className={classes.button} onClick={onPlayground}>
          Playground
        </button>
      </Topbar>
      <DocumentInfoProvider value={state}>
        <div className={classes.documentGroup}>
          {state.documents.map((doc) => (
            <article key={doc.id} className={classes.document} onClick={handleDocumentClick}>
              <img className={classes.documentImage} src={doc.imageURL} alt={doc.name} />
              <p className={classes.documentName}>{doc.name}</p>
              <button className={classes.button} onClick={() => state.deleteDocument(doc.id)}>
                Delete
              </button>
              <button data-is-edit-button="true" className={classes.button} onClick={() => onRequestNavigate(doc.id)}>
                Edit
              </button>
            </article>
          ))}
          <button className={classes.newDocument} onClick={() => onNewDocument("4x4Plus")}>
            New "4x4Plus" Tileset
          </button>
          <button className={classes.newDocument} onClick={() => onNewDocument("combos")}>
            New "Combos" Tileset
          </button>
        </div>
      </DocumentInfoProvider>
    </div>
  );
}
