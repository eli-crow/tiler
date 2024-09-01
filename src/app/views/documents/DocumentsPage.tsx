import type { TilesetDocument } from "@/app/model";
import { DocumentInfoProvider, useDocumentInfoState } from "@/app/providers/DocumentsProvider";
import classes from "./DocumentsPage.module.css";

interface DocumentInfoProps {
  onRequestNavigate: (tilesetId: TilesetDocument["id"]) => void;
  onNewDocument: () => void;
}

export function DocumentsPage({ onRequestNavigate, onNewDocument }: DocumentInfoProps) {
  const state = useDocumentInfoState();

  function handleDocumentClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!(e.target instanceof HTMLButtonElement)) {
      e.currentTarget.querySelector<HTMLButtonElement>("button[data-is-edit-button]")!.click();
    }
  }

  return (
    <div className={classes.root}>
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
          <button className={classes.newDocument} onClick={() => onNewDocument()}>
            New Tileset
          </button>
        </div>
      </DocumentInfoProvider>
    </div>
  );
}
