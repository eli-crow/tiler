import { EventEmitter } from "@/editor";
import { deserializeTilesetDocument, serializeTilesetDocument, TilesetDocument } from "../model";
import { IDocumentService, IDocumentServiceEvents } from "./IDocumentService";

const DB_NAME = "tiler";
const DB_STORE_NAME = "documents";

export class IndexedDBDocumentService implements IDocumentService {
  static readonly instance = new IndexedDBDocumentService(DB_NAME, DB_STORE_NAME);

  readonly #dbName: string;
  readonly #storeName: string;
  #db!: IDBDatabase;

  readonly #emitter = new EventEmitter<IDocumentServiceEvents>();
  readonly on = this.#emitter.on.bind(this.#emitter);
  readonly once = this.#emitter.once.bind(this.#emitter);
  readonly off = this.#emitter.off.bind(this.#emitter);
  readonly #emit = this.#emitter.emit.bind(this.#emitter);

  readonly #ready = this.init();

  constructor(dbName: string, storeName: string) {
    this.#dbName = dbName;
    this.#storeName = storeName;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.#dbName);

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB database"));
      };

      request.onsuccess = () => {
        this.#db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(this.#storeName);
      };
    });
  }

  async saveTilesetDocument<T extends TilesetDocument = TilesetDocument>(tileset: T): Promise<void> {
    await this.#ready;
    const file = await this.#writeFile(tileset.id, serializeTilesetDocument(tileset));
    this.#emit("changed");
    return file;
  }

  async loadTilesetDocument<T extends TilesetDocument = TilesetDocument>(id: T["id"]): Promise<T> {
    await this.#ready;
    const json = await this.#readFile(id);
    return deserializeTilesetDocument<T>(json);
  }

  async deleteTilesetDocument<T extends TilesetDocument = TilesetDocument>(id: T["id"]): Promise<void> {
    await this.#ready;
    await this.#deleteFile(id);
    this.#emit("changed");
  }

  async getAllDocuments(): Promise<TilesetDocument[]> {
    await this.#ready;
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(this.#storeName, "readonly");
      const objectStore = transaction.objectStore(this.#storeName);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const documentsJSON = request.result as string[];
        const infos = documentsJSON.map((json) => deserializeTilesetDocument(json));
        resolve(infos);
      };

      request.onerror = () => {
        reject(new Error("Failed to read documents from IndexedDB"));
      };
    });
  }

  async #writeFile(key: string, data: string): Promise<void> {
    await this.#ready;
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(this.#storeName, "readwrite");
      const objectStore = transaction.objectStore(this.#storeName);
      const request = objectStore.put(data, key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error("Failed to write data to IndexedDB"));
      };
    });
  }

  async #readFile(key: string): Promise<string> {
    await this.#ready;
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(this.#storeName, "readonly");
      const objectStore = transaction.objectStore(this.#storeName);
      const request = objectStore.get(key);

      request.onsuccess = () => {
        const data = request.result;
        if (data === undefined) {
          reject(new Error("File not found in IndexedDB"));
        } else {
          resolve(data);
        }
      };

      request.onerror = () => {
        reject(new Error("Failed to read data from IndexedDB"));
      };
    });
  }

  async #deleteFile(key: string): Promise<void> {
    await this.#ready;
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(this.#storeName, "readwrite");
      const objectStore = transaction.objectStore(this.#storeName);
      const request = objectStore.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error("Failed to delete file from IndexedDB"));
      };
    });
  }
}
