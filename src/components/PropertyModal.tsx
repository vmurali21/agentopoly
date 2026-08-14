'use client';

import React from 'react';
import { useGame } from '../context/GameContext';
import { BOARD_TILES, COLOR_THEMES } from '../data/boardTiles';
import { soundEngine } from '../lib/soundEngine';
import { X, Home, Building2, ShoppingCart, Wrench, ShieldAlert } from 'lucide-react';
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
    soundEngine.playCashSound();
    sendMessage({ type: 'BUILD_HOUSE', tileId: tile.id });
  };

  const handleSellHouse = () => {
    soundEngine.playCashSound();
    sendMessage({ type: 'SELL_HOUSE', tileId: tile.id });
  };

  const handleMortgage = () => {
    soundEngine.playCashSound();
    sendMessage({ type: 'MORTGAGE_PROPERTY', tileId: tile.id });
  };

  const handleUnmortgage = () => {
    soundEngine.playCashSound();
    sendMessage({ type: 'UNMORTGAGE_PROPERTY', tileId: tile.id });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden text-zinc-100 animate-in fade-in zoom-in duration-200">
        {/* Authentic Title Deed Card Container */}
        <div className="p-4 bg-amber-50/5 text-zinc-950 rounded-2xl m-3 border-2 border-zinc-700 shadow-inner">
          {/* Header Color Band */}
          <div
            className={`p-4 rounded-xl border border-black/20 ${theme.bg} ${theme.text} text-center space-y-1 shadow-md`}
          >
            <div className="text-[9px] font-black uppercase tracking-widest opacity-90">TITLE DEED</div>
            <h3 className="text-xl font-black uppercase tracking-tight">{tile.name}</h3>
          </div>

          {/* Card Body Stats */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl mt-3 text-zinc-200 space-y-2 text-xs">
            {tile.rent ? (
              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between font-extrabold text-white pb-1 border-b border-zinc-800 text-sm">
                  <span>RENT</span>
                  <span className="text-amber-400">${tile.rent[0]}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>With 1 House</span>
                  <span className="text-white">${tile.rent[1]}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>With 2 Houses</span>
                  <span className="text-white">${tile.rent[2]}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>With 3 Houses</span>
                  <span className="text-white">${tile.rent[3]}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>With 4 Houses</span>
                  <span className="text-white">${tile.rent[4]}</span>
                </div>
                <div className="flex justify-between font-black text-amber-400 pt-1.5 border-t border-zinc-800">
                  <span>With HOTEL</span>
                  <span>${tile.rent[5]}</span>
                </div>
              </div>
            ) : (
              <p className="text-center text-zinc-400 text-xs italic py-2">{tile.description}</p>
            )}

            {/* House & Mortgage Info */}
            <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              {tile.houseCost && (
                <div className="flex justify-between">
                  <span>Houses Cost Each</span>
                  <span className="font-bold text-emerald-400">${tile.houseCost}</span>
                </div>
              )}
              {tile.mortgageValue && (
                <div className="flex justify-between">
                  <span>Mortgage Value</span>
                  <span className="font-bold text-red-400">${tile.mortgageValue}</span>
                </div>
              )}
            </div>
          </div>

          {/* Owner Status */}
          <div className="mt-3 p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between text-xs text-zinc-300">
            <span className="font-semibold text-zinc-400 uppercase text-[10px]">Owner</span>
            {owner ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/40 shadow"
                  style={{ backgroundColor: owner.color }}
                />
                <span className="font-bold text-white">
                  {owner.name} {isOwner ? '(YOU)' : ''}
                </span>
              </div>
            ) : (
              <span className="font-extrabold text-amber-400 text-[10px] bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                UNOWNED
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 flex flex-col gap-2">
          {isOwner && isMyTurn && propState && (
            <div className="grid grid-cols-2 gap-2">
              {tile.houseCost && (
                <>
                  <button
                    onClick={handleBuildHouse}
                    disabled={propState.houses >= 5 || propState.isMortgaged}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                  >
                    <Home className="w-4 h-4" /> Build (${tile.houseCost})
                  </button>
                  <button
                    onClick={handleSellHouse}
                    disabled={propState.houses <= 0}
                    className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    Sell (${tile.houseCost / 2})
                  </button>
                </>
              )}

              {propState.isMortgaged ? (
                <button
                  onClick={handleUnmortgage}
                  className="col-span-2 py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  Unmortgage (${Math.floor((tile.mortgageValue || 0) * 1.1)})
                </button>
              ) : (
                <button
                  onClick={handleMortgage}
                  disabled={propState.houses > 0}
                  className="col-span-2 py-2.5 px-3 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800/40 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  Mortgage (+${tile.mortgageValue})
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => setSelectedTileId(null)}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
