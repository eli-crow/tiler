import { IDocumentService } from "./IDocumentService";
import { IndexedDBDocumentService } from "./IndexedDBDocumentService";

const DB_NAME = "tiler";
const DB_STORE_NAME = "documents";

export class Services {
  static readonly documents: IDocumentService = new IndexedDBDocumentService(DB_NAME, DB_STORE_NAME);
}
