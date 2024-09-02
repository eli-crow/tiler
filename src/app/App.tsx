import { useState } from "react";
import type { TilesetDocument } from "./model";
import { DocumentsPage } from "./views/documents/DocumentsPage";
import { PlaygroundPage } from "./views/documents/PlaygroundPage";
import { createNewSymbol, TilesetEditorPage } from "./views/tileset/TilesetEditorPage";

const playgroundSymbol = Symbol("playground");

export function App() {
  const [view, setView] = useState<TilesetDocument["id"] | null | typeof createNewSymbol | typeof playgroundSymbol>(
    null
  );

  if (view === null) {
    return (
      <DocumentsPage
        onRequestNavigate={setView}
        onNewDocument={() => setView(createNewSymbol)}
        onPlayground={() => setView(playgroundSymbol)}
      />
    );
  }

  if (view === playgroundSymbol) {
    return <PlaygroundPage backAction={() => setView(null)} />;
  }

  return <TilesetEditorPage documentId={view} backAction={() => setView(null)} />;
}
