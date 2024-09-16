import { CombosTileGrid, combosTilesMatch, TilePosition } from "@/editor/model";
import { SupportsPencilTool } from "@/editor/tools";
import { BaseTileset } from "./BaseTileset";
import { Tile4x4PlusCombos } from "./Tileset4x4PlusCombos";

export class TilesetCombos extends BaseTileset implements SupportsPencilTool {
  readonly tiles: CombosTileGrid<Tile4x4PlusCombos>;

  constructor(tiles: CombosTileGrid<Tile4x4PlusCombos>) {
    super(16, tiles[0].length, tiles.length, "Combos");

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
