import { BaseTileset } from "./BaseTileset";
import sampleImage from "./examples/sample4x4Plus.png";

const TILE_COLUMNS = 5;
const TILE_ROWS = 4;

export class Tileset4x4Plus extends BaseTileset {
  constructor() {
    super(16, TILE_COLUMNS, TILE_ROWS);
  }

  protected async load() {
    await this.setFromImageUrlAsync(sampleImage);
  }
}
