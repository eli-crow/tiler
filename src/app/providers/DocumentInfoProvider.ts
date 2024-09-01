import { createContext, useContext, useEffect, useState } from "react";
import { TilesetDocumentInfo } from "../model";
import { IndexedDBDocumentService } from "../services/IndexedDBDocumentService";

const service = IndexedDBDocumentService.instance;

type DocumentInfoContext = {
  documentInfos: readonly TilesetDocumentInfo[];
};

const context = createContext<DocumentInfoContext>(null!);
export const DocumentInfoProvider = context.Provider;

export function useDocumentInfo(): DocumentInfoContext {
  return useContext(context);
}

export function useDocumentInfoState(): DocumentInfoContext {
  const [documentInfos, setDocumentInfos] = useState<readonly TilesetDocumentInfo[]>([]);

  useEffect(() => {
    service.getTilesetDocumentInfo().then(setDocumentInfos);
  }, []);

  return { documentInfos };
}
