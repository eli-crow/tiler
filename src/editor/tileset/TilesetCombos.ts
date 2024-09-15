import { CombosTileGrid, combosTilesMatch, TilePosition } from "@/editor/model";
import { SupportsPencilTool } from "@/editor/tools";
import { BaseTileset } from "./BaseTileset";
import type { Tileset4x4Plus } from "./Tileset4x4Plus";
import { Tile4x4PlusCombos } from "./Tileset4x4PlusCombos";

export class Tileset4x4PlusCombos extends BaseTileset implements SupportsPencilTool {
  readonly tiles: CombosTileGrid<Tile4x4PlusCombos>;

  constructor(tileset: Tileset4x4Plus, tiles: CombosTileGrid<Tile4x4PlusCombos>) {
    super(tileset.tileSize, tiles[0].length, tiles.length);

    this.tiles = tiles;
  }

  getTile(position: TilePosition): Tile4x4PlusCombos | null {
    return this.tiles[position.y]?.[position.x] ?? null;
  }

  setTile(position: TilePosition, tile: Tile4x4PlusCombos) {
    const existingTile = this.getTile(position);
    if (existingTile && combosTilesMatch(existingTile, tile)) {
      return;
    }
    this.tiles[position.y][position.x] = tile;
  }
}
