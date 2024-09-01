import { deserializeTilesetDocument, serializeTilesetDocument, TilesetDocument, TilesetDocumentInfo } from "../model";
import { IDocumentService } from "./IDocumentService";

const DB_NAME = "tiler";
const DB_STORE_NAME = "documents";

export class IndexedDBDocumentService implements IDocumentService {
  static readonly instance = new IndexedDBDocumentService(DB_NAME, DB_STORE_NAME);

  readonly #dbName: string;
  readonly #storeName: string;
  #db!: IDBDatabase;

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
    return await this.writeFile(tileset.id, serializeTilesetDocument(tileset));
  }

  async loadTilesetDocument<T extends TilesetDocument = TilesetDocument>(id: T["id"]): Promise<T> {
    await this.#ready;
    const json = await this.readFile(id);
    return deserializeTilesetDocument<T>(json);
  }

  async getTilesetDocumentInfo(): Promise<TilesetDocumentInfo[]> {
    await this.#ready;
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction(this.#storeName, "readonly");
      const objectStore = transaction.objectStore(this.#storeName);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const documents = request.result as string[];
        const infos = documents.map((json) => {
          const document = JSON.parse(json) as TilesetDocument;
          return {
            id: document.id,
            name: document.name,
          };
        });
        resolve(infos);
      };

      request.onerror = () => {
        reject(new Error("Failed to read documents from IndexedDB"));
      };
    });
  }

  async writeFile(key: string, data: string): Promise<void> {
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

  async readFile(key: string): Promise<string> {
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

  async deleteFile(key: string): Promise<void> {
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
