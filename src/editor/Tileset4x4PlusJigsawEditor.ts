import { BaseTilesetEditor } from "./BaseTilesetEditor";
import { RGBA, Tile, TileGrid, tilesMatch } from "./model";
import { Tileset4x4PlusEditor } from "./Tileset4x4PlusEditor";
import { EraserTool, SupportsEraserTool } from "./tools/EraserTool";
import { PencilTool, SupportsPencilTool } from "./tools/PencilTool";
import { SupportsTileTool, TileTool } from "./tools/TileTool";

export class Tileset4x4JigsawEditor
  extends BaseTilesetEditor<PencilTool | EraserTool | TileTool>
  implements SupportsPencilTool, SupportsTileTool, SupportsEraserTool
{
  #tiles: TileGrid;
  #tileset: Tileset4x4PlusEditor;

  constructor(tileset: Tileset4x4PlusEditor) {
    const tiles = tileset.getGodotTiles();

    super(tileset.tileSize, tiles[0].length, tiles.length, new PencilTool());

    this.#tiles = tiles;
    this.#tileset = tileset;
    tileset.subscribe(this.#handleTilesetChanged);
  }

  getTileAtPoint(x: number, y: number) {
    const { x: tileX, y: tileY } = this.getTileLocationAtPoint(x, y);
    const tile = this.#tiles[tileY][tileX];
    return tile;
  }

  setPixel(x: number, y: number, color: RGBA) {
    const tile = this.getTileAtPoint(x, y);
    const offsetX = x % this.#tileset.tileSize;
    const offsetY = y % this.#tileset.tileSize;
    this.#tileset.setTilePixel(tile, offsetX, offsetY, color);
  }

  setTile(x: number, y: number, tile: Tile) {
    const existingTile = this.#tiles[y][x];
    if (tilesMatch(existingTile, tile)) {
      return;
    }
    this.#tiles[y][x] = tile;
    this.draw();
  }

  #handleTilesetChanged = () => {
    this.draw();
  };

  draw() {
    this.clear();
    this.#tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        const imageData = this.#tileset.getTileImageData(tile);
        const targetX = x * this.#tileset.tileSize;
        const targetY = y * this.#tileset.tileSize;
        this.context.putImageData(imageData, targetX, targetY);
      });
    });
  }
}
