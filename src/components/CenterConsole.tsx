'use client';

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { BOARD_TILES } from '../data/boardTiles';
import { soundEngine } from '../lib/soundEngine';
import {
  Dices,
  ShoppingCart,
  ArrowRight,
  Volume2,
  VolumeX,
  Building2,
  Flame,
  Sparkles,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { formatMoney } from '../lib/utils';
import { TOKEN_AVATARS } from './PlayerToken';

export const CenterConsole: React.FC = () => {
  const { gameState, isMyTurn, myPlayer, sendMessage, setIsPortfolioOpen } = useGame();
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());

  if (!gameState || !myPlayer) return null;

  const activePlayerId = gameState.playerOrder[gameState.turnIndex];
  const activePlayer = gameState.players[activePlayerId];
  const decision = gameState.currentDecision;

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  const handleRollDice = () => {
    soundEngine.playDiceRoll();
    sendMessage({ type: 'ROLL_DICE' });
  };

  const handleBuyProperty = () => {
    if (decision?.tileId !== undefined) {
      soundEngine.playBuyProperty();
      sendMessage({ type: 'BUY_PROPERTY', tileId: decision.tileId });
    }
  };

  const handlePassProperty = () => {
    if (decision?.tileId !== undefined) {
      sendMessage({ type: 'PASS_PROPERTY', tileId: decision.tileId });
    }
  };

  const handleEndTurn = () => {
    sendMessage({ type: 'END_TURN' });
  };

  const handlePayJailFine = () => {
    soundEngine.playCashSound();
    sendMessage({ type: 'PAY_JAIL_FINE' });
  };

  const handleUseJailCard = () => {
    soundEngine.playJailSound();
    sendMessage({ type: 'USE_JAIL_CARD' });
  };

  const handleBankruptcy = () => {
    if (confirm('Are you sure you want to declare bankruptcy and forfeit all properties?')) {
      sendMessage({ type: 'DECLARE_BANKRUPTCY' });
    }
  };

  const currentTile = decision?.tileId !== undefined ? BOARD_TILES.find((t) => t.id === decision.tileId) : null;
  const ActiveIcon = activePlayer ? TOKEN_AVATARS[activePlayer.avatar] || Shield : Shield;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 bg-zinc-950/95 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl overflow-y-auto text-zinc-100 relative">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center font-bold text-xs shadow"
            style={{ backgroundColor: activePlayer?.color }}
          >
            <ActiveIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Turn</div>
            <div className="text-sm font-black text-white flex items-center gap-2">
              {activePlayer?.name}
              {isMyTurn && (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  YOUR TURN
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest">Cash</div>
            <div className="text-sm font-mono font-black text-amber-400">{formatMoney(activePlayer?.cash || 0)}</div>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Dice Physics Display Area */}
      <div className="flex flex-col items-center justify-center my-3">
        {gameState.diceState ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-white via-zinc-100 to-zinc-300 text-zinc-950 font-black text-3xl rounded-2xl shadow-2xl border-2 border-zinc-200 flex items-center justify-center transform -rotate-3 transition-transform hover:rotate-0">
              {gameState.diceState.die1}
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-white via-zinc-100 to-zinc-300 text-zinc-950 font-black text-3xl rounded-2xl shadow-2xl border-2 border-zinc-200 flex items-center justify-center transform rotate-3 transition-transform hover:rotate-0">
              {gameState.diceState.die2}
            </div>
          </div>
        ) : (
          <div className="text-zinc-500 text-xs font-semibold italic">Roll dice to make your move</div>
        )}
        {gameState.diceState?.isDouble && (
          <span className="mt-2 text-[10px] font-black text-amber-400 tracking-widest uppercase bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full animate-bounce">
            DOUBLES ROLLED!
          </span>
        )}
      </div>

      {/* Decision Banner */}
      {decision && (
        <div className="w-full my-2 p-3 bg-zinc-900 border border-amber-500/40 rounded-xl space-y-2">
          {decision.type === 'BUY_PROPERTY' && currentTile && (
            <div className="space-y-2 text-center">
              <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Unowned Property</div>
              <div className="text-base font-black text-white">{currentTile.name}</div>
              <div className="text-xs text-zinc-300 font-mono">
                Price: <span className="font-bold text-amber-400">${currentTile.price}</span> | Base Rent:{' '}
                <span className="font-bold">${currentTile.rent?.[0]}</span>
              </div>
              {isMyTurn && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={handleBuyProperty}
                    disabled={myPlayer.cash < (currentTile.price || 0)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <ShoppingCart className="w-4 h-4" /> BUY (${currentTile.price})
                  </button>
                  <button
                    onClick={handlePassProperty}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl"
                  >
                    PASS
                  </button>
                </div>
              )}
            </div>
          )}

          {decision.type === 'PAY_RENT' && (
            <div className="text-center space-y-1">
              <div className="text-[10px] font-black text-red-400 uppercase tracking-widest">Rent Payment</div>
              <div className="text-sm font-bold text-white">
                Transferred <span className="text-amber-400">${decision.rentAmount}</span> rent to owner!
              </div>
            </div>
          )}

          {decision.type === 'TAX' && (
            <div className="text-center space-y-1">
              <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Tax Deduction</div>
              <div className="text-sm font-bold text-white">
                Deducted <span className="text-rose-400">${decision.taxAmount}</span> for {decision.taxName}
              </div>
            </div>
          )}

          {decision.type === 'CARD' && decision.card && (
            <div className="text-center space-y-1 p-2 bg-purple-950/40 border border-purple-800/40 rounded-xl">
              <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> CARD DRAWN
              </div>
              <p className="text-xs text-purple-200 font-medium">{decision.card.text}</p>
            </div>
          )}
        </div>
      )}

      {/* Jail Banner */}
      {activePlayer?.inJail && isMyTurn && (
        <div className="w-full my-2 p-3 bg-red-950/40 border border-red-800/50 rounded-xl space-y-2 text-center">
          <div className="text-xs font-black text-red-400 uppercase flex items-center justify-center gap-1">
            <AlertCircle className="w-4 h-4" /> YOU ARE IN JAIL
          </div>
          <p className="text-xs text-zinc-300">Turns served: {activePlayer.jailTurns}/3</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={handlePayJailFine}
              disabled={myPlayer.cash < 50}
              className="px-3 py-1.5 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl"
            >
              Pay $50 Fine
            </button>
            {myPlayer.getOutOfJailFreeCards > 0 && (
              <button
                onClick={handleUseJailCard}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl"
              >
                Use Jail Card ({myPlayer.getOutOfJailFreeCards})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Turn Action Controls */}
      <div className="w-full space-y-2 pt-2 border-t border-zinc-800">
        {isMyTurn ? (
          <div className="grid grid-cols-2 gap-2">
            {!myPlayer.hasRolledThisTurn ? (
              <button
                onClick={handleRollDice}
                className="col-span-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
              >
                <Dices className="w-5 h-5" /> ROLL DICE
              </button>
            ) : (
              <button
                onClick={handleEndTurn}
                className="col-span-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
              >
                END TURN <ArrowRight className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setIsPortfolioOpen(true)}
              className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
            >
              <Building2 className="w-4 h-4 text-amber-400" /> Portfolio
            </button>

            <button
              onClick={handleBankruptcy}
              className="py-2.5 px-3 bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-red-800/40"
            >
              <Flame className="w-4 h-4 text-red-400" /> Bankrupt
            </button>
          </div>
        ) : (
          <div className="text-center py-2 text-xs font-semibold text-zinc-400 animate-pulse">
            Waiting for {activePlayer?.name} to move...
          </div>
        )}
      </div>
    </div>
  );
};
