import { IEventEmitter } from "@/editor";
import { TilesetDocument } from "../model";

export interface IDocumentServiceEvents {
  changed: () => void;
}

export interface IDocumentService extends IEventEmitter<IDocumentServiceEvents> {
  saveTilesetDocument<T extends TilesetDocument = TilesetDocument>(tileset: T): Promise<void>;
  loadTilesetDocument<T extends TilesetDocument = TilesetDocument>(id: T["id"]): Promise<T>;
  deleteTilesetDocument<T extends TilesetDocument = TilesetDocument>(id: T["id"]): Promise<void>;
  getAllDocuments(): Promise<TilesetDocument[]>;
}
