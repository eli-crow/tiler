type Document = {
  version: number;
  type: "tileset";
  name: string;
};

export type TilesetDocument = Document & {
  type: "tileset";
  imageData: ImageData;
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

export type SerializedTilesetDocument<T extends TilesetDocument> = Omit<T, "imageData"> & {
  imageData: SerializedImageData;
};

export type Tileset4x4PlusDocument = TilesetDocument & {
  version: 1;
  tilesetType: "4x4Plus";
};

export function createTilesetDocument4x4Plus(): Tileset4x4PlusDocument {
  return {
    version: 1,
    type: "tileset",
    name: "Untitled Tileset",
    tilesetType: "4x4Plus",
    imageData: new ImageData(1, 1),
  };
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
