import type { TilesetDocument } from "@/app/model";
import { DocumentInfoProvider, useDocumentInfoState } from "@/app/providers/DocumentInfoProvider";
import classes from "./DocumentsPage.module.css";

interface DocumentInfoProps {
  onRequestNavigate: (tilesetId: TilesetDocument["id"]) => void;
  onNewDocument: () => void;
}

export function DocumentsPage({ onRequestNavigate, onNewDocument }: DocumentInfoProps) {
  const documentInfoState = useDocumentInfoState();
  return (
    <div className={classes.root}>
      <DocumentInfoProvider value={documentInfoState}>
        <div className={classes.documentList}>
          {documentInfoState.documentInfos.map((doc) => (
            <button key={doc.id} className={classes.document} onClick={() => onRequestNavigate(doc.id)}>
              {doc.name}
            </button>
          ))}
        </div>
      </DocumentInfoProvider>

      <button className={classes.newDocument} onClick={() => onNewDocument()}>
        New Document
      </button>
    </div>
  );
}
