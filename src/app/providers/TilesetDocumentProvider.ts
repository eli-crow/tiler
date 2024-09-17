import { createContext, useContext, useRef, useState } from "react";
import {
  convertTilesetDocumentToCombos,
  createTilesetDocument4x4Plus,
  createTilesetDocumentCombos,
  TilesetDocument,
} from "../model";
import { Services } from "../services/Services";

export const createNew4x4PlusSymbol = Symbol("createNew");
export const createNewCombosSymbol = Symbol("createNewCombos");

type TilesetDocumentContext = ReturnType<typeof useTilesetDocumentState>;

const context = createContext<TilesetDocumentContext>(null as never);

export const TilesetDocumentProvider = context.Provider;

export function useTilesetDocumentState(
  init: TilesetDocument["id"] | typeof createNew4x4PlusSymbol | typeof createNewCombosSymbol
) {
  const [doc, setDoc] = useState<TilesetDocument | null>(null);

  async function saveImageData(imageData: ImageData) {
    if (!doc) throw new Error("No document loaded");
    const newDoc = { ...doc, imageData };
    setDoc(newDoc);
    await Services.documents.saveTilesetDocument(newDoc);
  }

  const lastInitRef = useRef<typeof init | null>(null);
  if (lastInitRef.current !== init) {
    lastInitRef.current = init;
    if (typeof init === "string") {
      Services.documents.loadTilesetDocument(init).then(setDoc);
    } else if (init === createNew4x4PlusSymbol) {
      setDoc(createTilesetDocument4x4Plus());
    } else if (init === createNewCombosSymbol) {
      setDoc(createTilesetDocumentCombos());
    }
  }

  function setTilesetName(name: string) {
    if (!doc) throw new Error("No document loaded");
    setDoc({ ...doc, name });
  }

  function convertToCombos() {
    if (!doc) throw new Error("No document loaded");
    if (doc.tilesetType === "combos") return;
    setDoc(convertTilesetDocumentToCombos(doc));
  }

  return {
    doc,
    tilesetName: doc?.name ?? "",
    setTilesetName,
    saveImageData,
    convertToCombos,
  };
}

export function useTilesetDocumentContext() {
  return useContext(context);
}
