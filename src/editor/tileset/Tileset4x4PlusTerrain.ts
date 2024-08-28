import {
  flattenTileNeighborGrid,
  type FlattenedTileNeighborGrid,
  type TerrainTileGrid,
  type TileNeighborGrid,
  type TilePosition,
} from "../model";
import { SupportsPencilTool } from "../tools/PencilTool";
import { SupportsTerrainTileTool } from "../tools/TerrainTileTool";
import { BaseTileset } from "./BaseTileset";
import type { Tileset4x4PlusJigsaw } from "./Tileset4x4PlusJigsaw";

const BIT_S = 0b100000000;
const BIT_T = 0b010000000;
const BIT_R = 0b001000000;
const BIT_B = 0b000100000;
const BIT_L = 0b000010000;
const BIT_TR = 0b000001000;
const BIT_BR = 0b000000100;
const BIT_BL = 0b000000010;
const BIT_TL = 0b000000001;

export class Tileset4x4PlusTerrain extends BaseTileset implements SupportsTerrainTileTool, SupportsPencilTool {
  #tiles: TerrainTileGrid;
  #jigsaw: Tileset4x4PlusJigsaw;
  #tileNeighbors: FlattenedTileNeighborGrid;

  constructor(jigsaw: Tileset4x4PlusJigsaw, neighborGrid: TileNeighborGrid, tiles: TerrainTileGrid) {
    super(jigsaw.tileSize, tiles[0].length, tiles.length);

    this.#tiles = tiles;

    this.#jigsaw = jigsaw;
    this.#jigsaw.on("dataChanged", this.#handleJigsawDataChanged);

    this.#tileNeighbors = flattenTileNeighborGrid(neighborGrid);
  }

  invalidate() {
    this.#jigsaw.invalidate();
    this.emit("dataChanged");
  }

  getTile(x: number, y: number): boolean | null {
    return this.#tiles[y]?.[x] ?? null;
  }

  setTile(x: number, y: number, tile: boolean) {
    if (!this.tilePositionInRange(x, y)) {
      return;
    }
    this.#tiles[y][x] = tile;
  }

  getJigsawTilePosition(terrainX: number, terrainY: number): TilePosition | null {
    if (!this.tilePositionInRange(terrainX, terrainY)) {
      return null;
    }

    const neighbors = this.getTileNeighbors(terrainX, terrainY);
    const h_t = (neighbors & BIT_T) === BIT_T;
    const h_r = (neighbors & BIT_R) === BIT_R;
    const h_b = (neighbors & BIT_B) === BIT_B;
    const h_l = (neighbors & BIT_L) === BIT_L;

    // h_ means selected tile "has" that neighbor
    // m_ means selected tile "matches" the other tile's neighbor

    for (const { x, y, neighbors: other } of this.#tileNeighbors) {
      const m_s = (neighbors & BIT_S) === (other & BIT_S);
      const m_t = (neighbors & BIT_T) === (other & BIT_T);
      const m_r = (neighbors & BIT_R) === (other & BIT_R);
      const m_b = (neighbors & BIT_B) === (other & BIT_B);
      const m_l = (neighbors & BIT_L) === (other & BIT_L);
      if (!(m_s && m_t && m_r && m_b && m_l)) continue;

      const m_tr = (neighbors & BIT_TR) === (other & BIT_TR);
      const m_br = (neighbors & BIT_BR) === (other & BIT_BR);
      const m_bl = (neighbors & BIT_BL) === (other & BIT_BL);
      const m_tl = (neighbors & BIT_TL) === (other & BIT_TL);

      if (h_t && h_r && !m_tr) continue;
      if (h_r && h_b && !m_br) continue;
      if (h_b && h_l && !m_bl) continue;
      if (h_l && h_t && !m_tl) continue;

      return { x, y };
    }

    // const match = sidesCandidates.find((candidate) => this.hasMatchingCorners(neighbors, candidate.neighbors));

    return null;
  }

  getTileNeighbors(x: number, y: number): number {
    const up = y - 1;
    const dn = y + 1;
    const lt = x - 1;
    const rt = x + 1;

    const s = this.getTile(x, y) ?? false;
    const t = this.getTile(x, up) ?? false;
    const r = this.getTile(rt, y) ?? false;
    const b = this.getTile(x, dn) ?? false;
    const l = this.getTile(lt, y) ?? false;
    const tr = this.getTile(rt, up) ?? false;
    const br = this.getTile(rt, dn) ?? false;
    const bl = this.getTile(lt, dn) ?? false;
    const tl = this.getTile(lt, up) ?? false;

    let result = 0;
    if (s) result |= 1 << 8;
    if (t) result |= 1 << 7;
    if (r) result |= 1 << 6;
    if (b) result |= 1 << 5;
    if (l) result |= 1 << 4;
    if (tr) result |= 1 << 3;
    if (br) result |= 1 << 2;
    if (bl) result |= 1 << 1;
    if (tl) result |= 1 << 0;

    return result;
  }

  #handleJigsawDataChanged = () => {
    this.#draw();
  };

  #draw() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.#tiles.forEach((row, y) => {
      row.forEach((_, x) => {
        const jigsawPosition = this.getJigsawTilePosition(x, y);
        if (!jigsawPosition) {
          return;
        }
        const jigsawTile = this.#jigsaw.getTile(jigsawPosition.x, jigsawPosition.y);
        if (!jigsawTile) {
          return;
        }
        const imageData = this.#jigsaw.getTileImageData(jigsawTile);
        const targetX = x * this.tileSize;
        const targetY = y * this.tileSize;
        this.context.putImageData(imageData, targetX, targetY);
      });
    });
  }
}
