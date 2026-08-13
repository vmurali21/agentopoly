'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { Trophy, RefreshCw, Crown } from 'lucide-react';

export const WinnerModal: React.FC = () => {
  const { gameState, sendMessage } = useGame();

  const winner = gameState?.winnerId ? gameState.players[gameState.winnerId] : null;

  useEffect(() => {
    if (gameState?.gamePhase === 'GAME_OVER' && winner) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [gameState?.gamePhase, winner]);

  if (gameState?.gamePhase !== 'GAME_OVER' || !winner) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl space-y-5 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto text-amber-400">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-black tracking-widest text-amber-400 uppercase">GAME OVER</div>
          <h2 className="text-3xl font-black text-white">{winner.name} WINS!</h2>
          <p className="text-sm text-zinc-400">All other opponents have declared bankruptcy!</p>
        </div>

        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
          <div className="text-xs text-zinc-400">Winning Cash</div>
          <div className="text-2xl font-mono font-bold text-amber-400">${winner.cash.toLocaleString()}</div>
        </div>

        <button
          onClick={() => sendMessage({ type: 'RESET_GAME' })}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> PLAY AGAIN / RETURN TO LOBBY
        </button>
      </div>
    </div>
  );
};
