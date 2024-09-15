import {
  CombosTile,
  Neighbor,
  RGBA,
  TerrainTile,
  TileNeighborGrid,
  TileNeighbors,
  TilePosition,
  type TerrainTileGrid,
  type TileNeighborFlattenedGrid,
} from "@/editor/model";
import { SupportsPencilTool } from "@/editor/tools/PencilTool";
import { SupportsTerrainTileTool } from "@/editor/tools/TerrainTileTool";
import { hasBits, maskedBitsMatch } from "@/shared";
import { BaseTileset, MultiProxyTileset } from "./BaseTileset";
import { ITilesetCombos } from "./ITilesetCombos";
import type { Tileset4x4PlusCombos } from "./Tileset4x4PlusCombos";

export type Terrain<Tileset extends Tileset4x4PlusCombos> = {
  tileset: Tileset;
  neighbors: TileNeighborGrid;
};

export type FlattenedTerrain<Tileset extends Tileset4x4PlusCombos> = {
  tileset: Tileset;
  neighbors: TileNeighborFlattenedGrid;
};

export class TilesetTerrain<Tileset extends ITilesetCombos>
  extends BaseTileset
  implements SupportsTerrainTileTool, SupportsPencilTool, MultiProxyTileset
{
  #tiles: TerrainTileGrid;
  readonly sourceTilesets: Tileset[];

  constructor(sourceTilesets: Tileset[], columns: number, rows: number) {
    const tileSize = sourceTilesets[0].tileSize;
    if (!sourceTilesets.every((tileset) => tileset.tileSize === tileSize)) {
      throw new Error("Tilesets must all have the same tile size");
    }

    super(tileSize, columns, rows);

    this.#tiles = Array.from({ length: rows }, () => Array.from({ length: columns }, () => -1));
    this.sourceTilesets = sourceTilesets;
    this.sourceTilesets.forEach((tileset) => tileset.on("dataChanged", this.#handleSourceTilesetChanged));

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

  setPixel(x: number, y: number, color: RGBA): void {
    const tilePosition = this.getTilePositionAtPixel(x, y);
    if (!tilePosition) return;

    const neighbors = this.#getTileNeighbors(tilePosition);
    if (!hasBits(neighbors, Neighbor.Self)) return;

    const info = this.#getSourceTileInfo(tilePosition);
    if (!info) return;

    const offsetX = x % this.tileSize;
    const offsetY = y % this.tileSize;
    this.sourceTilesets[info.sourceIndex].setTilePixel(info.sourcePosition, offsetX, offsetY, color);
  }

  #getSourceTileInfo(
    position: TilePosition
  ): { sourcePosition: TilePosition; sourceTile: CombosTile; sourceIndex: number } | null {
    if (!this.tilePositionInRange(position)) {
      return null;
    }

    const targetNeighbors = this.#getTileNeighbors(position);
    const has_t = hasBits(targetNeighbors, Neighbor.Top);
    const has_r = hasBits(targetNeighbors, Neighbor.Right);
    const has_b = hasBits(targetNeighbors, Neighbor.Bottom);
    const has_l = hasBits(targetNeighbors, Neighbor.Left);
    const check_tr = has_t && has_r;
    const check_br = has_r && has_b;
    const check_bl = has_b && has_l;
    const check_tl = has_l && has_t;

    const sourceIndex = this.getTile(position);
    if (sourceIndex === -1 || sourceIndex === null) {
      return null;
    }

    const nomatch = (sourceNeighbors: TileNeighbors, bit: number) => {
      return !maskedBitsMatch(sourceNeighbors, targetNeighbors, bit);
    };

    const sourceTiles = this.sourceTilesets[sourceIndex].tiles;
    let sourcePosition: TilePosition | null = null;
    let sourceTile: CombosTile | null = null;
    rows: for (let y = 0; y < sourceTiles.length; y++) {
      const row = sourceTiles[y];
      for (let x = 0; x < row.length; x++) {
        const tile = row[x];

        if (nomatch(tile.neighbors, Neighbor.Sides)) continue;
        if (check_tr && nomatch(tile.neighbors, Neighbor.TopRight)) continue;
        if (check_br && nomatch(tile.neighbors, Neighbor.BottomRight)) continue;
        if (check_bl && nomatch(tile.neighbors, Neighbor.BottomLeft)) continue;
        if (check_tl && nomatch(tile.neighbors, Neighbor.TopLeft)) continue;

        sourcePosition = { x, y };
        sourceTile = tile;
        break rows;
      }
    }

    if (!sourcePosition || !sourceTile) {
      return null;
    }

    return { sourcePosition, sourceTile, sourceIndex };
  }

  #getTileNeighbors(position: TilePosition): number {
    const { x, y } = position;
    const has = (x: number, y: number) => this.hasTileAt({ x, y });
    let result = 0;
    if (has(x + 0, y + 0)) result |= Neighbor.Self;
    if (has(x + 0, y - 1)) result |= Neighbor.Top;
    if (has(x + 1, y + 0)) result |= Neighbor.Right;
    if (has(x + 0, y + 1)) result |= Neighbor.Bottom;
    if (has(x - 1, y + 0)) result |= Neighbor.Left;
    if (has(x + 1, y - 1)) result |= Neighbor.TopRight;
    if (has(x + 1, y + 1)) result |= Neighbor.BottomRight;
    if (has(x - 1, y + 1)) result |= Neighbor.BottomLeft;
    if (has(x - 1, y - 1)) result |= Neighbor.TopLeft;
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
        const { sourceIndex, sourcePosition } = sourceTileInfo;
        const sourceTileset = this.sourceTilesets[sourceIndex];
        const sourceImageData = sourceTileset.getTileImageData(sourcePosition);
        if (sourceImageData === null) return;

        const targetX = targetTileX * this.tileSize;
        const targetY = targetTileY * this.tileSize;
        this.context.putImageData(sourceImageData, targetX, targetY);
      });
    });
  }
}
