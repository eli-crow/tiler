import {
  deserializeTilesetDocument,
  serializeTilesetDocument,
  TilesetDocument,
  TilesetDocumentInfo,
} from "@/app/model";
import { IDocumentService } from "./IDocumentService";

const TILESET_DOCUMENT_TYPE: FilePickerAcceptType = {
  description: "Tileset Document",
  accept: {
    "application/json": [".tileset"],
  },
};

export class FilesystemDocumentService implements IDocumentService {
  static readonly instance = new FilesystemDocumentService();

  readonly ready = this.init();

  init(): Promise<void> {
    return Promise.resolve();
  }

  async saveTilesetDocument<T extends TilesetDocument>(tileset: T) {
    const serialized = serializeTilesetDocument(tileset);
    const fileHandle = await window.showSaveFilePicker({
      types: [TILESET_DOCUMENT_TYPE],
    });
    const writable = await fileHandle.createWritable();
    await writable.write(serialized);
    await writable.close();
  }

  async loadTilesetDocument<T extends TilesetDocument>(_id: T["id"]): Promise<T> {
    throw new Error("Method not implemented.");
  }

  async getTilesetDocumentInfo(): Promise<TilesetDocumentInfo[]> {
    throw new Error("Method not implemented.");
  }

  async openTilesetDocument(): Promise<TilesetDocument> {
    const [fileHandle] = await window.showOpenFilePicker({
      excludeAcceptAllOption: true,
      startIn: "documents",
      types: [TILESET_DOCUMENT_TYPE],
    });
    const file = await fileHandle.getFile();
    const json = await file.text();
    return deserializeTilesetDocument(json);
  }
}
