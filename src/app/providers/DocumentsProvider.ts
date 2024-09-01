import { createContext, useContext, useEffect, useState } from "react";
import { imageURLFromImageData, TilesetDocument } from "../model";
import { IndexedDBDocumentService } from "../services/IndexedDBDocumentService";

const service = IndexedDBDocumentService.instance;

type DocumentsContext = ReturnType<typeof useDocumentInfoState>;

const context = createContext<DocumentsContext>(null!);
export const DocumentInfoProvider = context.Provider;

export function useDocumentInfo(): DocumentsContext {
  return useContext(context);
}

export function useDocumentInfoState() {
  const [documents, setDocuments] = useState<readonly TilesetDocument[]>([]);

  useEffect(() => {
    service.on("changed", () => {
      service.getAllDocuments().then(setDocuments);
    });
    service.getAllDocuments().then(setDocuments);
  }, []);

  const documentsWithImageURL = documents.map((doc) => {
    const url = imageURLFromImageData(doc.imageData);
    return { ...doc, imageURL: url };
  });

  function deleteDocument(id: TilesetDocument["id"]) {
    service.deleteTilesetDocument(id);
  }

  return { documents: documentsWithImageURL, deleteDocument };
}
