import { BaseTileset, GODOT_TILES, Tileset4x4Plus, Tileset4x4PlusCombos, TilesetTerrain } from "@/editor";
import { TilesetCombos } from "@/editor/tileset/TilesetCombos";
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { TilesetDocument } from "../model";

type TilesetsState = {
  tileset: BaseTileset;
  tilesetOptions: { name: string; index: number; isSelected: boolean }[];
  setTilesetIndex: (index: number) => void;
};

const tilesetsContext = createContext<TilesetsState>(null as never);
export const TilesetsProvider = tilesetsContext.Provider;

export function useTilesetsState(doc: TilesetDocument): TilesetsState {
  const allTilesets: readonly BaseTileset[] = useMemo(() => {
    switch (doc.tilesetType) {
      case "4x4Plus": {
        const raw = new Tileset4x4Plus();
        raw.setSourceData(doc.imageData);
        const combos = new Tileset4x4PlusCombos(raw, GODOT_TILES);
        const terrain = new TilesetTerrain([combos], 16, 16);
        return [raw, combos, terrain];
      }

      case "combos": {
        const raw = new TilesetCombos(GODOT_TILES);
        raw.setSourceData(doc.imageData);

        const terrain = new TilesetTerrain([raw], 16, 16);
        return [raw, terrain];
      }

      default:
        throw new Error(`Invalid tileset type: ${doc.tilesetType}`);
    }
  }, [doc.tilesetType]);

  const [tilesetIndex, setTilesetIndex] = useState(0);
  const tileset = allTilesets[tilesetIndex];

  const [lastType, setLastType] = useState(doc.tilesetType);
  if (lastType !== doc.tilesetType) {
    setTilesetIndex(0);
    setLastType(doc.tilesetType);
  }

  const tilesetOptions: TilesetsState["tilesetOptions"] = allTilesets.map((tileset, index) => ({
    name: tileset.name,
    index: index,
    isSelected: index === tilesetIndex,
  }));

  return {
    tileset,
    tilesetOptions,
    setTilesetIndex,
  };
}

export function useTilesetsContext() {
  return useContext(tilesetsContext);
}

export function useTileset() {
  const pageContext = useContext(tilesetsContext);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    pageContext.tileset.on("dataChanged", forceUpdate);
    return () => pageContext.tileset.off("dataChanged", forceUpdate);
  });
  return pageContext.tileset;
}
