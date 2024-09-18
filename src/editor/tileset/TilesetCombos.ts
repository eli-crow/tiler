import { CombosTile, CombosTileGrid, combosTilesMatch, TilePosition } from "@/editor/model";
import { BaseTileset } from "./BaseTileset";
import { ITilesetCombos } from "./ITilesetCombos";
import { Tile4x4PlusCombos } from "./Tileset4x4PlusCombos";

export class TilesetCombos extends BaseTileset implements ITilesetCombos {
  readonly tiles: CombosTileGrid<Tile4x4PlusCombos>;

  constructor(tiles: CombosTileGrid<Tile4x4PlusCombos>) {
    super(16, tiles[0].length, tiles.length, "Combos");

    this.tiles = tiles;
  }

  forEachTile(callback: (tile: CombosTile, position: { x: number; y: number }) => void): void {
    this.tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        callback(tile, { x, y });
      });
    });
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
