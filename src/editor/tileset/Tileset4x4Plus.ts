import sampleImage from "../../assets/sample4x4Plus.png";
import { BaseTileset } from "./BaseTileset";

const TILE_COLUMNS = 5;
const TILE_ROWS = 4;

export class Tileset4x4Plus extends BaseTileset {
  constructor() {
    super(16, TILE_COLUMNS, TILE_ROWS);
    this.setFromImageUrlAsync(sampleImage).then(() => {
      this.invalidate();
    });
  }
}
