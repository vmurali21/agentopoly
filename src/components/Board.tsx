'use client';

import React from 'react';
import { useGame } from '../context/GameContext';
import { BOARD_TILES } from '../data/boardTiles';
import { TileComponent } from './TileComponent';
import { CenterConsole } from './CenterConsole';
import { Player } from '../types/game';

function getTileGridStyle(id: number): React.CSSProperties {
  if (id === 0) return { gridColumn: '11', gridRow: '11' };
  if (id >= 1 && id <= 9) return { gridColumn: `${11 - id}`, gridRow: '11' };
  if (id === 10) return { gridColumn: '1', gridRow: '11' };
  if (id >= 11 && id <= 19) return { gridColumn: '1', gridRow: `${11 - (id - 10)}` };
  if (id === 20) return { gridColumn: '1', gridRow: '1' };
  if (id >= 21 && id <= 29) return { gridColumn: `${id - 20 + 1}`, gridRow: '1' };
  if (id === 30) return { gridColumn: '11', gridRow: '1' };
  if (id >= 31 && id <= 39) return { gridColumn: '11', gridRow: `${id - 30 + 1}` };
  return {};
}

export const Board: React.FC = () => {
  const { gameState, setSelectedTileId } = useGame();

  if (!gameState) return null;

  const players = Object.values(gameState.players);

  return (
    <div className="relative w-full aspect-square max-w-[850px] mx-auto p-2 bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
      <div className="w-full h-full grid grid-cols-11 grid-rows-11 gap-1">
        {/* Render Perimeter 40 Tiles */}
        {BOARD_TILES.map((tile) => {
          const propertyState = gameState.properties[tile.id];
          const playersOnTile = players.filter((p) => p.position === tile.id && !p.bankrupt);
          const style = getTileGridStyle(tile.id);

          return (
            <TileComponent
              key={tile.id}
              tile={tile}
              propertyState={propertyState}
              playersOnTile={playersOnTile}
              gridStyle={style}
              onClick={() => setSelectedTileId(tile.id)}
            />
          );
        })}

        {/* Center Console Stage */}
        <div style={{ gridColumn: '2 / 11', gridRow: '2 / 11' }} className="p-2 z-10">
          <CenterConsole />
        </div>
      </div>
    </div>
  );
};
