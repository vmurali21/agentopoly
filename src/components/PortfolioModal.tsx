'use client';

import React from 'react';
import { useGame } from '../context/GameContext';
import { BOARD_TILES, COLOR_THEMES } from '../data/boardTiles';
import { X, Building2, Home, Wrench } from 'lucide-react';
import { formatMoney } from '../lib/utils';

export const PortfolioModal: React.FC = () => {
  const { gameState, isPortfolioOpen, setIsPortfolioOpen, myPlayerId, isMyTurn, sendMessage } = useGame();

  if (!isPortfolioOpen || !gameState || !myPlayerId) return null;

  const ownedProperties = Object.values(gameState.properties).filter((p) => p.ownerId === myPlayerId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-zinc-100 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black">YOUR PROPERTY PORTFOLIO</h3>
          </div>
          <button
            onClick={() => setIsPortfolioOpen(false)}
            className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Property List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-grow">
          {ownedProperties.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-sm italic">
              You do not currently own any properties. Roll the dice and land on unowned tiles to buy them!
            </div>
          ) : (
            ownedProperties.map((prop) => {
              const tile = BOARD_TILES.find((t) => t.id === prop.tileId);
              if (!tile) return null;
              const theme = COLOR_THEMES[tile.group] || COLOR_THEMES.SPECIAL;

              return (
                <div
                  key={prop.tileId}
                  className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-10 rounded ${theme.bg}`} />
                    <div>
                      <div className="font-bold text-sm text-white">{tile.name}</div>
                      <div className="text-xs text-zinc-400 font-mono">
                        Houses: {prop.houses === 5 ? 'Hotel' : prop.houses} | Value: ${tile.price}
                      </div>
                    </div>
                  </div>

                  {isMyTurn && (
                    <div className="flex items-center gap-2">
                      {tile.houseCost && (
                        <button
                          onClick={() => sendMessage({ type: 'BUILD_HOUSE', tileId: tile.id })}
                          disabled={prop.houses >= 5 || prop.isMortgaged}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                        >
                          <Home className="w-3.5 h-3.5" /> +1 (${tile.houseCost})
                        </button>
                      )}
                      {prop.isMortgaged ? (
                        <button
                          onClick={() => sendMessage({ type: 'UNMORTGAGE_PROPERTY', tileId: tile.id })}
                          className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs rounded-lg"
                        >
                          Unmortgage
                        </button>
                      ) : (
                        <button
                          onClick={() => sendMessage({ type: 'MORTGAGE_PROPERTY', tileId: tile.id })}
                          disabled={prop.houses > 0}
                          className="px-2.5 py-1.5 bg-red-950 hover:bg-red-900 border border-red-800/40 text-red-300 font-bold text-xs rounded-lg"
                        >
                          Mortgage
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
