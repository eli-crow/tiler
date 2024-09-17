import { GODOT_TILES, Tileset4x4Plus, Tileset4x4PlusCombos } from "@/editor";
import { v4 as uuid } from "uuid";

type Document = {
  version: number;
  type: "tileset";
  name: string;
};

export type TilesetDocument = Document & {
  id: string;
  type: "tileset";
  tilesetType: string;
  imageData: ImageData;
};

export type TilesetDocumentOptions = {
  name?: string;
  imageData?: ImageData;
};

export type SerializedImageData = {
  colorSpace: ImageData["colorSpace"];
  width: ImageData["width"];
  height: ImageData["height"];
  dataBase64: string;
};

export function imageDataAsSerialized(imageData: ImageData): SerializedImageData {
  return {
    colorSpace: imageData.colorSpace,
    width: imageData.width,
    height: imageData.height,
    dataBase64: uint8ClampedArrayToBase64(imageData.data),
  };
}

export function imageDataFromSerialized(serialized: SerializedImageData): ImageData {
  var imageData = new ImageData(serialized.width, serialized.height, { colorSpace: serialized.colorSpace });
  imageData.data.set(base64ToUint8ClampedArray(serialized.dataBase64));
  return imageData;
}

const __previewCanvas = document.createElement("canvas");
const __previewContext = __previewCanvas.getContext("2d", { alpha: true })!;

export function imageURLFromImageData(imageData: ImageData): string {
  __previewCanvas.width = imageData.width;
  __previewCanvas.height = imageData.height;
  __previewContext.putImageData(imageData, 0, 0);
  return __previewCanvas.toDataURL();
}

export function imageURLFromSerializedImageData(serialized: SerializedImageData): string {
  return imageURLFromImageData(imageDataFromSerialized(serialized));
}

export type SerializedTilesetDocument<T extends TilesetDocument = TilesetDocument> = Omit<T, "imageData"> & {
  imageData: SerializedImageData;
};

export type Tileset4x4PlusDocument = TilesetDocument & {
  version: 1;
  tilesetType: "4x4Plus";
};

export type Tileset4x4PlusDocumentOptions = TilesetDocumentOptions;

export function createTilesetDocument4x4Plus({
  name = "Untitled",
  imageData = new ImageData(1, 1),
}: Tileset4x4PlusDocumentOptions = {}): Tileset4x4PlusDocument {
  return {
    id: uuid(),
    version: 1,
    type: "tileset",
    name,
    tilesetType: "4x4Plus",
    imageData,
  };
}

export type TilesetCombosDocument = TilesetDocument & {
  version: 1;
  tilesetType: "combos";
};

export type TilesetCombosDocumentOptions = TilesetDocumentOptions;

export function createTilesetDocumentCombos({
  name = "Untitled",
  imageData = new ImageData(1, 1),
}: TilesetCombosDocumentOptions = {}): TilesetCombosDocument {
  return {
    id: uuid(),
    version: 1,
    type: "tileset",
    name,
    tilesetType: "combos",
    imageData,
  };
}

export function convertTilesetDocumentToCombos<T extends TilesetDocument>(doc: T): TilesetCombosDocument {
  if (doc.tilesetType === "combos") {
    return doc as TilesetCombosDocument;
  }

  if (doc.tilesetType === "4x4Plus") {
    const tileset4x4Plus = new Tileset4x4Plus();
    tileset4x4Plus.putSourceImageData(doc.imageData);
    const combos = new Tileset4x4PlusCombos(tileset4x4Plus, GODOT_TILES);
    combos.invalidate();
    return {
      id: doc.id,
      version: 1,
      type: "tileset",
      name: doc.name,
      tilesetType: "combos",
      imageData: combos.getImageData(),
    };
  } else {
    throw new Error(`Unsupported tileset type: ${doc.tilesetType}`);
  }
}

function uint8ClampedArrayToBase64(bytes: Uint8ClampedArray): string {
  var binary = "";
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8ClampedArray(base64: string): Uint8ClampedArray {
  var binary = atob(base64);
  var len = binary.length;
  var bytes = new Uint8ClampedArray(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function tilesetAsSerialized<T extends TilesetDocument>(tileset: T): SerializedTilesetDocument<T> {
  return {
    ...tileset,
    imageData: imageDataAsSerialized(tileset.imageData),
  };
}

function serializedTilesetAsTileset<T extends TilesetDocument>(serialized: SerializedTilesetDocument<T>): T {
  return {
    ...(serialized as unknown as T),
    imageData: imageDataFromSerialized(serialized.imageData),
  };
}

export function serializeTilesetDocument<T extends TilesetDocument = TilesetDocument>(tileset: T): string {
  return JSON.stringify(tilesetAsSerialized(tileset));
}

export function deserializeTilesetDocument<T extends TilesetDocument = TilesetDocument>(json: string): T {
  const parsed = JSON.parse(json) as SerializedTilesetDocument<T>;
  return serializedTilesetAsTileset(parsed);
}
