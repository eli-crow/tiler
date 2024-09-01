import { useState } from "react";
import type { TilesetDocument } from "./model";
import { DocumentsPage } from "./views/documents/DocumentsPage";
import { createNewSymbol, TilesetEditorPage } from "./views/tileset/TilesetEditorPage";

export function App() {
  const [openDocumentId, setOpenDocumentId] = useState<TilesetDocument["id"] | null | typeof createNewSymbol>(null);

  if (openDocumentId === null) {
    return (
      <DocumentsPage onRequestNavigate={setOpenDocumentId} onNewDocument={() => setOpenDocumentId(createNewSymbol)} />
    );
  }

  return <TilesetEditorPage documentId={openDocumentId} backAction={() => setOpenDocumentId(null)} />;
}
