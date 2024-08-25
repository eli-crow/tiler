import { createTile, RGBA, Tile, TileGrid, tilesMatch } from "../model";
import { BaseTileset } from "./BaseTileset";
import { Tileset4x4Plus } from "./Tileset4x4Plus";

export class Tileset4x4PlusToGodot extends BaseTileset {
  #tiles: TileGrid;
  #tileset: Tileset4x4Plus;

  constructor(tileset: Tileset4x4Plus) {
    const tiles = GODOT_TILES;

    super(tileset.tileSize, tiles[0].length, tiles.length);

    this.#tiles = tiles;
    this.#tileset = tileset;
    tileset.on("dataChanged", this.#handleTilesetChanged);
  }

  getTileAtPoint(x: number, y: number): Tile | null {
    const position = this.getTilePositionAtPixel(x, y);
    if (!position) {
      return null;
    }
    const tile = this.#tiles[position.y][position.x];
    return tile;
  }

  setPixel(x: number, y: number, color: RGBA) {
    const tile = this.getTileAtPoint(x, y);
    if (!tile) {
      return;
    }
    const offsetX = x % this.#tileset.tileSize;
    const offsetY = y % this.#tileset.tileSize;
    this.#tileset.setTilePixel(tile, offsetX, offsetY, color);
    this.onDataChanged();
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
    this.context.clearRect(0, 0, this.width, this.height);
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

const GODOT_TILES: TileGrid = [
  [
    createTile(0, 0),

    createTile(1, 0, ["br"]),
    createTile(2, 0, ["bl", "br"]),
    createTile(3, 0, ["bl"]),

    createTile(2, 1, ["bl", "tr", "br"]),
    createTile(2, 0, ["bl"]),
    createTile(2, 0, ["br"]),
    createTile(2, 1, ["bl", "tl", "br"]),

    createTile(1, 0),
    createTile(2, 1, ["tl", "bl"]),
    createTile(2, 0),
    createTile(3, 0),
  ],
  [
    createTile(0, 1),

    createTile(1, 1, ["br", "tr"]),
    createTile(2, 1, ["bl", "br", "tr", "tl"]),
    createTile(3, 1, ["tl", "bl"]),

    createTile(1, 1, ["tr"]),
    createTile(2, 1, ["tl"]),
    createTile(2, 1, ["tr"]),
    createTile(3, 1, ["tl"]),

    createTile(1, 1),
    createTile(2, 1, ["tl", "br"]),
    createTile(4, 1),
    createTile(2, 1, ["tr", "br"]),
  ],
  [
    createTile(0, 2),

    createTile(1, 2, ["tr"]),
    createTile(2, 2, ["tr", "br"]),
    createTile(3, 2, ["tl"]),

    createTile(1, 1, ["br"]),
    createTile(2, 1, ["bl"]),
    createTile(2, 1, ["br"]),
    createTile(3, 1, ["bl"]),

    createTile(2, 1, ["tl", "bl"]),
    createTile(2, 1),
    createTile(2, 1, ["tr", "bl"]),
    createTile(3, 1),
  ],
  [
    createTile(0, 3),

    createTile(1, 3),
    createTile(2, 3),
    createTile(3, 3),

    createTile(2, 1, ["bl", "tr", "br"]),
    createTile(2, 2, ["tl"]),
    createTile(2, 2, ["tr"]),
    createTile(2, 1, ["tl", "tr", "bl"]),

    createTile(1, 2),
    createTile(2, 2),
    createTile(2, 1, ["bl", "br"]),
    createTile(3, 2),
  ],
];
