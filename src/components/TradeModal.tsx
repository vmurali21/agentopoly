'use client';

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { BOARD_TILES, COLOR_THEMES } from '../data/boardTiles';
import { X, Handshake, DollarSign, Building } from 'lucide-react';
import { formatMoney } from '../lib/utils';

export const TradeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { gameState, myPlayerId, sendMessage } = useGame();
  const [targetPlayerId, setTargetPlayerId] = useState<string>('');
  const [offerCash, setOfferCash] = useState<number>(0);
  const [requestCash, setRequestCash] = useState<number>(0);
  const [offeredTileIds, setOfferedTileIds] = useState<number[]>([]);
  const [requestedTileIds, setRequestedTileIds] = useState<number[]>([]);

  if (!isOpen || !gameState || !myPlayerId) return null;

  const opponents = Object.values(gameState.players).filter((p) => p.id !== myPlayerId && !p.bankrupt);
  const myProperties = Object.values(gameState.properties).filter((p) => p.ownerId === myPlayerId && p.houses === 0);
  const targetProperties = targetPlayerId
    ? Object.values(gameState.properties).filter((p) => p.ownerId === targetPlayerId && p.houses === 0)
    : [];

  const toggleOfferTile = (id: number) => {
    setOfferedTileIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const toggleRequestTile = (id: number) => {
    setRequestedTileIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleProposeTrade = () => {
    if (!targetPlayerId) return;
    alert('Trade offer proposed to opponent!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black uppercase tracking-tight">TRADE CENTER</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-grow text-xs">
          {/* Target Player Select */}
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">
              Select Trade Partner
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {opponents.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTargetPlayerId(p.id)}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 font-bold transition-all ${
                    targetPlayerId === p.id
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: p.color }} />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {targetPlayerId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
              {/* Left Column: Your Offer */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3">
                <div className="font-black text-amber-400 uppercase text-[10px] tracking-widest">YOU OFFER</div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold block mb-1">Cash ($)</label>
                  <input
                    type="number"
                    value={offerCash}
                    onChange={(e) => setOfferCash(Number(e.target.value))}
                    max={gameState.players[myPlayerId]?.cash || 0}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-amber-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold block mb-1">Properties</label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {myProperties.map((p) => {
                      const tile = BOARD_TILES.find((t) => t.id === p.tileId);
                      const isChecked = offeredTileIds.includes(p.tileId);
                      return (
                        <div
                          key={p.tileId}
                          onClick={() => toggleOfferTile(p.tileId)}
                          className={`p-2 rounded-lg border cursor-pointer flex items-center justify-between font-bold text-[11px] ${
                            isChecked ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          <span>{tile?.name}</span>
                          <span className="font-mono text-[10px] text-zinc-400">${tile?.price}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Your Request */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3">
                <div className="font-black text-emerald-400 uppercase text-[10px] tracking-widest">YOU ASK FOR</div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold block mb-1">Cash ($)</label>
                  <input
                    type="number"
                    value={requestCash}
                    onChange={(e) => setRequestCash(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-emerald-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold block mb-1">Properties</label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {targetProperties.map((p) => {
                      const tile = BOARD_TILES.find((t) => t.id === p.tileId);
                      const isChecked = requestedTileIds.includes(p.tileId);
                      return (
                        <div
                          key={p.tileId}
                          onClick={() => toggleRequestTile(p.tileId)}
                          className={`p-2 rounded-lg border cursor-pointer flex items-center justify-between font-bold text-[11px] ${
                            isChecked ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          <span>{tile?.name}</span>
                          <span className="font-mono text-[10px] text-zinc-400">${tile?.price}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2.5 bg-zinc-800 text-zinc-300 font-bold rounded-xl">
            CANCEL
          </button>
          <button
            onClick={handleProposeTrade}
            disabled={!targetPlayerId}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-black rounded-xl shadow-lg"
          >
            PROPOSE TRADE
          </button>
        </div>
      </div>
    </div>
  );
};
