'use client';

import React from 'react';
import { useGame } from '../context/GameContext';
import { BOARD_TILES, COLOR_THEMES } from '../data/boardTiles';
import { X, Home, Building2, ShieldAlert, ShoppingCart, Check, Wrench } from 'lucide-react';
import { formatMoney } from '../lib/utils';

export const PropertyModal: React.FC = () => {
  const { gameState, selectedTileId, setSelectedTileId, myPlayerId, isMyTurn, sendMessage } = useGame();

  if (selectedTileId === null || !gameState) return null;

  const tile = BOARD_TILES.find((t) => t.id === selectedTileId);
  if (!tile) return null;

  const propState = gameState.properties[selectedTileId];
  const theme = COLOR_THEMES[tile.group] || COLOR_THEMES.SPECIAL;
  const owner = propState?.ownerId ? gameState.players[propState.ownerId] : null;
  const isOwner = propState?.ownerId === myPlayerId;

  const handleBuildHouse = () => {
    sendMessage({ type: 'BUILD_HOUSE', tileId: tile.id });
  };

  const handleSellHouse = () => {
    sendMessage({ type: 'SELL_HOUSE', tileId: tile.id });
  };

  const handleMortgage = () => {
    sendMessage({ type: 'MORTGAGE_PROPERTY', tileId: tile.id });
  };

  const handleUnmortgage = () => {
    sendMessage({ type: 'UNMORTGAGE_PROPERTY', tileId: tile.id });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden text-zinc-100 animate-in fade-in zoom-in duration-200">
        {/* Header Color Banner */}
        <div className={`p-4 ${theme.bg} ${theme.text} flex items-center justify-between`}>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-80">{tile.group}</div>
            <h3 className="text-xl font-black">{tile.name}</h3>
          </div>
          <button
            onClick={() => setSelectedTileId(null)}
            className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Ownership Status */}
          <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl">
            <span className="text-xs text-zinc-400 font-semibold uppercase">Owner</span>
            {owner ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-white/40"
                  style={{ backgroundColor: owner.color }}
                />
                <span className="text-sm font-bold text-white">
                  {owner.name} {isOwner ? '(YOU)' : ''}
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                UNOWNED
              </span>
            )}
          </div>

          {/* Rent & Stats Table */}
          {tile.rent && (
            <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-800 space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold border-b border-zinc-800 pb-1">
                <span className="text-zinc-400">Rent</span>
                <span className="text-white font-mono font-bold">${tile.rent[0]}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>With 1 House</span>
                <span className="font-mono">${tile.rent[1]}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>With 2 Houses</span>
                <span className="font-mono">${tile.rent[2]}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>With 3 Houses</span>
                <span className="font-mono">${tile.rent[3]}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>With 4 Houses</span>
                <span className="font-mono">${tile.rent[4]}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold pt-1 border-t border-zinc-800">
                <span>With HOTEL</span>
                <span className="font-mono">${tile.rent[5]}</span>
              </div>
            </div>
          )}

          {/* Pricing Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {tile.price && (
              <div className="p-2.5 bg-zinc-950/40 rounded-lg border border-zinc-800">
                <div className="text-zinc-400">Purchase Price</div>
                <div className="text-sm font-mono font-bold text-amber-400">{formatMoney(tile.price)}</div>
              </div>
            )}

            {tile.houseCost && (
              <div className="p-2.5 bg-zinc-950/40 rounded-lg border border-zinc-800">
                <div className="text-zinc-400">House / Hotel Cost</div>
                <div className="text-sm font-mono font-bold text-emerald-400">{formatMoney(tile.houseCost)}</div>
              </div>
            )}

            {tile.mortgageValue && (
              <div className="col-span-2 p-2.5 bg-zinc-950/40 rounded-lg border border-zinc-800 flex justify-between items-center">
                <div className="text-zinc-400">Mortgage Value</div>
                <div className="text-sm font-mono font-bold text-red-400">{formatMoney(tile.mortgageValue)}</div>
              </div>
            )}
          </div>

          {/* Management Controls (If Active Player is Owner) */}
          {isOwner && isMyTurn && propState && (
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" /> Manage Property
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tile.houseCost && (
                  <>
                    <button
                      onClick={handleBuildHouse}
                      disabled={propState.houses >= 5 || propState.isMortgaged}
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow"
                    >
                      <Home className="w-3.5 h-3.5" /> Build House (${tile.houseCost})
                    </button>
                    <button
                      onClick={handleSellHouse}
                      disabled={propState.houses <= 0}
                      className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                    >
                      Sell House (${tile.houseCost / 2})
                    </button>
                  </>
                )}

                {propState.isMortgaged ? (
                  <button
                    onClick={handleUnmortgage}
                    className="col-span-2 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                  >
                    Unmortgage (${Math.floor((tile.mortgageValue || 0) * 1.1)})
                  </button>
                ) : (
                  <button
                    onClick={handleMortgage}
                    disabled={propState.houses > 0}
                    className="col-span-2 py-2 px-3 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800/40 font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                  >
                    Mortgage (+${tile.mortgageValue})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
