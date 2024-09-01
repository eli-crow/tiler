import { deserializeTilesetDocument, serializeTilesetDocument, TilesetDocument } from "@/app/model";

const TILESET_DOCUMENT_TYPE: FilePickerAcceptType = {
  description: "Tileset Document",
  accept: {
    "application/json": [".tileset"],
  },
};

export class FilesystemService {
  static readonly instance = new FilesystemService();

  async saveTilesetDocument<T extends TilesetDocument>(tileset: T) {
    const serialized = serializeTilesetDocument(tileset);
    const fileHandle = await window.showSaveFilePicker({
      types: [TILESET_DOCUMENT_TYPE],
    });
    const writable = await fileHandle.createWritable();
    await writable.write(serialized);
    await writable.close();
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
