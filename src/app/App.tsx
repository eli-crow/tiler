import { useState } from "react";
import type { TilesetDocument } from "./model";
import { createNew4x4PlusSymbol, createNewCombosSymbol } from "./providers/TilesetDocumentProvider";
import { DocumentsPage } from "./views/documents/DocumentsPage";
import { PlaygroundPage } from "./views/documents/PlaygroundPage";
import { TilesetEditorPage } from "./views/tileset/TilesetEditorPage";

const playgroundSymbol = Symbol("playground");

export function App() {
  const [view, setView] = useState<
    | TilesetDocument["id"]
    | null
    | typeof createNew4x4PlusSymbol
    | typeof createNewCombosSymbol
    | typeof playgroundSymbol
  >(null);

  function handleNewDocument(type: TilesetDocument["tilesetType"]) {
    if (type === "4x4Plus") {
      setView(createNew4x4PlusSymbol);
    } else if (type === "combos") {
      setView(createNewCombosSymbol);
    } else {
      throw new Error(`Unknown tileset type: ${type}`);
    }
  }

  if (view === null) {
    return (
      <DocumentsPage
        onRequestNavigate={setView}
        onNewDocument={handleNewDocument}
        onPlayground={() => setView(playgroundSymbol)}
      />
    );
  }

  if (view === playgroundSymbol) {
    return <PlaygroundPage backAction={() => setView(null)} />;
  }

  return <TilesetEditorPage documentId={view} backAction={() => setView(null)} />;
}
