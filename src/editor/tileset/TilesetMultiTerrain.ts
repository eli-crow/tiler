import { BaseTileset } from "./BaseTileset";

const TILE_COLUMNS = 5;
const TILE_ROWS = 4;

export class TilesetMultiTerrain extends BaseTileset {
  constructor() {
    super(16, TILE_COLUMNS, TILE_ROWS);
  }
}
