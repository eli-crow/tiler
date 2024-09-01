import { TilesetDocument, TilesetDocumentInfo } from "../model";

export interface IDocumentService {
  saveTilesetDocument<T extends TilesetDocument = TilesetDocument>(tileset: T): Promise<void>;
  loadTilesetDocument<T extends TilesetDocument = TilesetDocument>(id: T["id"]): Promise<T>;
  getTilesetDocumentInfo(): Promise<TilesetDocumentInfo[]>;
}
