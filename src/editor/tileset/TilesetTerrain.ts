import {
  flattenTileNeighborGrid,
  RGBA,
  TerrainTile,
  Tile4x4PlusJigsaw,
  TileNeighbor,
  TileNeighborGrid,
  TilePosition,
  type TerrainTileGrid,
  type TileNeighborFlattenedGrid,
} from "@/editor/model";
import { SupportsPencilTool } from "@/editor/tools/PencilTool";
import { SupportsTerrainTileTool } from "@/editor/tools/TerrainTileTool";
import { BaseTileset, MultiProxyTileset } from "./BaseTileset";
import type { Tileset4x4PlusJigsaw } from "./Tileset4x4PlusJigsaw";

const BIT_S = 1 << 8;
const BIT_T = 1 << 7;
const BIT_R = 1 << 6;
const BIT_B = 1 << 5;
const BIT_L = 1 << 4;
const BIT_TR = 1 << 3;
const BIT_BR = 1 << 2;
const BIT_BL = 1 << 1;
const BIT_TL = 1 << 0;

export type Terrain<Tileset extends Tileset4x4PlusJigsaw> = {
  tileset: Tileset;
  neighbors: TileNeighborGrid;
};

export type FlattenedTerrain<Tileset extends Tileset4x4PlusJigsaw> = {
  tileset: Tileset;
  neighbors: TileNeighborFlattenedGrid;
};

export class TilesetTerrain<Tileset extends Tileset4x4PlusJigsaw>
  extends BaseTileset
  implements SupportsTerrainTileTool, SupportsPencilTool, MultiProxyTileset
{
  #tiles: TerrainTileGrid;
  readonly sourceTilesets: Tileset[];
  readonly #sourceNeighbors: TileNeighborFlattenedGrid[];

  constructor(sourceTilesets: Tileset[], sourceNeighbors: TileNeighborGrid[], columns: number, rows: number) {
    const tileSize = sourceTilesets[0].tileSize;
    if (!sourceTilesets.every((tileset) => tileset.tileSize === tileSize)) {
      throw new Error("Tilesets must all have the same tile size");
    }

    super(tileSize, columns, rows);

    this.#tiles = Array.from({ length: rows }, () => Array.from({ length: columns }, () => -1));
    this.sourceTilesets = sourceTilesets;
    this.sourceTilesets.forEach((tileset) => tileset.on("dataChanged", this.#handleSourceTilesetChanged));
    this.#sourceNeighbors = sourceNeighbors.map(flattenTileNeighborGrid);

    this.randomize();
    this.invalidate();
  }

  getTile(position: TilePosition): TerrainTile | null {
    return this.#tiles[position.y]?.[position.x] ?? null;
  }

  hasTileAt(position: TilePosition): boolean {
    const tile = this.getTile(position);
    if (tile === -1) return false;
    if (tile === null) return false;
    return true;
  }

  setTerrainTile(position: TilePosition, tile: TerrainTile) {
    if (!this.tilePositionInRange(position)) {
      return;
    }
    this.#tiles[position.y][position.x] = tile;
  }

  randomize() {
    this.#tiles.forEach((row) => {
      row.forEach((_, x) => {
        const hasTile = Math.random() < 0.75;
        const tilesetIndex = hasTile ? Math.floor(Math.random() * this.sourceTilesets.length) : -1;
        row[x] = tilesetIndex;
      });
    });
  }

  setPixel(targetX: number, targetY: number, color: RGBA): void {
    const position = this.getTilePositionAtPixel(targetX, targetY);
    if (!position) {
      return;
    }

    const info = this.#getSourceTileInfo(position);
    if (!info) {
      return;
    }
    const { sourceTile, sourceIndex } = info;

    const neighbors = this.getTileNeighbors(position);

    if ((neighbors & BIT_S) !== BIT_S) {
      return;
    }

    const offsetX = targetX % this.tileSize;
    const offsetY = targetY % this.tileSize;
    this.sourceTilesets[sourceIndex].setTilePixel(sourceTile.sourcePosition, offsetX, offsetY, color);
  }

  #bitMatches(source: TileNeighbor, target: TileNeighbor, bit: number): boolean {
    return (source & bit) === (target & bit);
  }

  #hasBit(source: TileNeighbor, bit: number): boolean {
    return (source & bit) === bit;
  }

  #getSourceTileInfo(position: TilePosition): { sourceTile: Tile4x4PlusJigsaw; sourceIndex: number } | null {
    if (!this.tilePositionInRange(position)) {
      return null;
    }

    const targetNeighbors = this.getTileNeighbors(position);
    const has_t = this.#hasBit(targetNeighbors, BIT_T);
    const has_r = this.#hasBit(targetNeighbors, BIT_R);
    const has_b = this.#hasBit(targetNeighbors, BIT_B);
    const has_l = this.#hasBit(targetNeighbors, BIT_L);
    const check_tr = has_t && has_r;
    const check_br = has_r && has_b;
    const check_bl = has_b && has_l;
    const check_tl = has_l && has_t;

    const sourceIndex = this.getTile(position);
    if (sourceIndex === -1 || sourceIndex === null) {
      return null;
    }

    const nomatch = (sourceNeighbors: TileNeighbor, bit: number) => {
      return !this.#bitMatches(sourceNeighbors, targetNeighbors, bit);
    };

    let sourcePosition: TilePosition | null = null;
    for (const { x, y, neighbors: s } of this.#sourceNeighbors[sourceIndex]) {
      if (nomatch(s, BIT_S)) continue;
      if (nomatch(s, BIT_T)) continue;
      if (nomatch(s, BIT_R)) continue;
      if (nomatch(s, BIT_B)) continue;
      if (nomatch(s, BIT_L)) continue;

      if (check_tr && nomatch(s, BIT_TR)) continue;
      if (check_br && nomatch(s, BIT_BR)) continue;
      if (check_bl && nomatch(s, BIT_BL)) continue;
      if (check_tl && nomatch(s, BIT_TL)) continue;

      sourcePosition = { x, y };
      break;
    }

    if (!sourcePosition) {
      return null;
    }

    const sourceTileset = this.sourceTilesets[sourceIndex];
    const sourceTile = sourceTileset.getTile(sourcePosition);
    if (!sourceTile) {
      return null;
    }

    return { sourceTile, sourceIndex };
  }

  getTileNeighbors(position: TilePosition): number {
    const { x, y } = position;
    const has = (x: number, y: number) => this.hasTileAt({ x, y });
    let result = 0;
    if (has(x + 0, y + 0)) result |= BIT_S;
    if (has(x + 0, y - 1)) result |= BIT_T;
    if (has(x + 1, y + 0)) result |= BIT_R;
    if (has(x + 0, y + 1)) result |= BIT_B;
    if (has(x - 1, y + 0)) result |= BIT_L;
    if (has(x + 1, y - 1)) result |= BIT_TR;
    if (has(x + 1, y + 1)) result |= BIT_BR;
    if (has(x - 1, y + 1)) result |= BIT_BL;
    if (has(x - 1, y - 1)) result |= BIT_TL;
    return result;
  }

  #handleSourceTilesetChanged = () => {
    this.#draw();
  };

  #draw() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.#tiles.forEach((row, targetTileY) => {
      row.forEach((_, targetTileX) => {
        const targetPosition = { x: targetTileX, y: targetTileY };
        const sourceTileInfo = this.#getSourceTileInfo(targetPosition);
        if (!sourceTileInfo) {
          return;
        }
        const { sourceTile, sourceIndex } = sourceTileInfo;
        const sourceTileset = this.sourceTilesets[sourceIndex];
        const sourceImageData = sourceTileset.getSourceTileImageData(sourceTile);
        const targetX = targetTileX * this.tileSize;
        const targetY = targetTileY * this.tileSize;
        this.context.putImageData(sourceImageData, targetX, targetY);
      });
    });
  }
}
