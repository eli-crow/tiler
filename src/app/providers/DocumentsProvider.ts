import { createContext, useContext, useEffect, useState } from "react";
import { imageURLFromImageData, TilesetDocument } from "../model";
import { Services } from "../services/Services";

type DocumentsContext = ReturnType<typeof useDocumentsState>;

const context = createContext<DocumentsContext>(null!);
export const DocumentInfoProvider = context.Provider;

export function useDocuments(): DocumentsContext {
  return useContext(context);
}

export function useDocumentsState() {
  const [documents, setDocuments] = useState<readonly TilesetDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleChange = () => {
      Services.documents.getAllDocuments().then((docs) => {
        setDocuments(docs);
        setLoading(false);
      });
    };
    Services.documents.on("changed", handleChange);
    Services.documents.getAllDocuments().then(handleChange);
    return () => {
      Services.documents.off("changed", handleChange);
    };
  }, []);

  const documentsWithImageURL = documents.map((doc) => {
    const url = imageURLFromImageData(doc.imageData);
    return { ...doc, imageURL: url };
  });

  function deleteDocument(id: TilesetDocument["id"]) {
    Services.documents.deleteTilesetDocument(id);
  }

  return { documents: documentsWithImageURL, deleteDocument, loading };
}
