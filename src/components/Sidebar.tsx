'use client';

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { BOARD_TILES } from '../data/boardTiles';
import { TradeModal } from './TradeModal';
import { Trophy, History, Handshake, Lock, Skull } from 'lucide-react';
import { formatMoney } from '../lib/utils';
import { TOKEN_AVATARS } from './PlayerToken';

export const Sidebar: React.FC = () => {
  const { gameState, myPlayerId } = useGame();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'logs'>('leaderboard');
  const [isTradeOpen, setIsTradeOpen] = useState(false);

  if (!gameState) return null;

  const players = Object.values(gameState.players);

  const leaderboard = players.map((player) => {
    let propertyValue = 0;
    let houseValue = 0;
    let count = 0;

    Object.values(gameState.properties).forEach((prop) => {
      if (prop.ownerId === player.id) {
        count += 1;
        const tile = BOARD_TILES.find((t) => t.id === prop.tileId);
        if (tile) {
          propertyValue += tile.price || 0;
          if (tile.houseCost) {
            houseValue += prop.houses * tile.houseCost;
          }
        }
      }
    });

    const netWorth = player.cash + propertyValue + houseValue;
    return {
      player,
      netWorth,
      propertyCount: count,
    };
  });

  leaderboard.sort((a, b) => b.netWorth - a.netWorth);

  return (
    <div className="w-full h-full bg-zinc-900/90 backdrop-blur-xl rounded-3xl border border-zinc-800 p-4 flex flex-col shadow-2xl text-zinc-100 overflow-hidden">
      {/* Tab Switcher & Trade Action */}
      <div className="flex items-center gap-2 mb-4">
        <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-950 rounded-2xl border border-zinc-800 flex-grow">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`py-2 px-3 rounded-xl text-xs font-black tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'leaderboard' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" /> RANKINGS
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-3 rounded-xl text-xs font-black tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'logs' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" /> FEED
          </button>
        </div>

        <button
          onClick={() => setIsTradeOpen(true)}
          className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 rounded-2xl transition-transform hover:scale-105"
          title="Open Trade Center"
        >
          <Handshake className="w-5 h-5" />
        </button>
      </div>

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-3 overflow-y-auto flex-grow pr-1">
          {leaderboard.map((item, index) => {
            const { player, netWorth, propertyCount } = item;
            const isTurn = gameState.playerOrder[gameState.turnIndex] === player.id;
            const AvatarIcon = TOKEN_AVATARS[player.avatar] || Trophy;

            return (
              <div
                key={player.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isTurn
                    ? 'bg-zinc-950 border-amber-500/80 shadow-lg shadow-amber-500/10 scale-[1.01]'
                    : 'bg-zinc-950/60 border-zinc-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-zinc-500">#{index + 1}</span>
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center shadow"
                      style={{ backgroundColor: player.color }}
                    >
                      <AvatarIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        {player.name}
                        {player.id === myPlayerId && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded-full font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span>Properties: {propertyCount}</span>
                        {player.inJail && (
                          <span className="text-red-400 font-bold flex items-center gap-0.5">
                            <Lock className="w-3 h-3" /> JAIL
                          </span>
                        )}
                        {player.bankrupt && (
                          <span className="text-rose-500 font-bold flex items-center gap-0.5">
                            <Skull className="w-3 h-3" /> BANKRUPT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-black text-amber-400">{formatMoney(player.cash)}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">Net: {formatMoney(netWorth)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Game Activity Log Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-2 overflow-y-auto flex-grow text-xs font-mono pr-1">
          {gameState.logs.length === 0 ? (
            <div className="text-center py-6 text-zinc-500 italic">No activity logged yet</div>
          ) : (
            gameState.logs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-zinc-300 leading-relaxed"
              >
                <span className="text-[9px] text-zinc-500 mr-2 font-bold">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span>{log.text}</span>
              </div>
            ))
          )}
        </div>
      )}

      <TradeModal isOpen={isTradeOpen} onClose={() => setIsTradeOpen(false)} />
    </div>
  );
};
