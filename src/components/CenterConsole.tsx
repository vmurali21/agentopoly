'use client';

import React from 'react';
import { useGame } from '../context/GameContext';
import { BOARD_TILES } from '../data/boardTiles';
import { Dices, ShoppingCart, ArrowRight, Home, AlertCircle, Sparkles, Building2, Flame } from 'lucide-react';
import { formatMoney } from '../lib/utils';

export const CenterConsole: React.FC = () => {
  const { gameState, isMyTurn, myPlayer, sendMessage, setIsPortfolioOpen } = useGame();

  if (!gameState || !myPlayer) return null;

  const activePlayerId = gameState.playerOrder[gameState.turnIndex];
  const activePlayer = gameState.players[activePlayerId];
  const decision = gameState.currentDecision;

  const handleRollDice = () => {
    sendMessage({ type: 'ROLL_DICE' });
  };

  const handleBuyProperty = () => {
    if (decision?.tileId !== undefined) {
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
    sendMessage({ type: 'PAY_JAIL_FINE' });
  };

  const handleUseJailCard = () => {
    sendMessage({ type: 'USE_JAIL_CARD' });
  };

  const handleBankruptcy = () => {
    if (confirm('Are you sure you want to declare bankruptcy and forfeit all assets?')) {
      sendMessage({ type: 'DECLARE_BANKRUPTCY' });
    }
  };

  // Find tile info for current decision if any
  const currentTile = decision?.tileId !== undefined ? BOARD_TILES.find((t) => t.id === decision.tileId) : null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 bg-zinc-950/90 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-2xl overflow-y-auto text-zinc-100">
      {/* Current Turn Header Ticker */}
      <div className="w-full flex items-center justify-between p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center font-bold text-xs shadow"
            style={{ backgroundColor: activePlayer?.color }}
          >
            {activePlayer?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Current Turn</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              {activePlayer?.name}
              {isMyTurn && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  YOUR TURN
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-zinc-400 uppercase tracking-wider">Cash</div>
          <div className="text-sm font-mono font-bold text-amber-400">{formatMoney(activePlayer?.cash || 0)}</div>
        </div>
      </div>

      {/* Dice Display Area */}
      <div className="flex flex-col items-center justify-center my-3">
        {gameState.diceState ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-white to-zinc-200 text-zinc-950 font-black text-2xl rounded-2xl shadow-xl border-2 border-zinc-300 flex items-center justify-center">
              {gameState.diceState.die1}
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-white to-zinc-200 text-zinc-950 font-black text-2xl rounded-2xl shadow-xl border-2 border-zinc-300 flex items-center justify-center">
              {gameState.diceState.die2}
            </div>
          </div>
        ) : (
          <div className="text-zinc-500 text-xs font-medium italic">Dice waiting to be rolled</div>
        )}
        {gameState.diceState?.isDouble && (
          <span className="mt-2 text-xs font-black text-amber-400 tracking-wider uppercase bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            DOUBLES ROLLED!
          </span>
        )}
      </div>

      {/* Landing Decision Banner / Modals inside console */}
      {decision && (
        <div className="w-full my-2 p-3 bg-zinc-900 border border-amber-500/40 rounded-xl space-y-2">
          {decision.type === 'BUY_PROPERTY' && currentTile && (
            <div className="space-y-2 text-center">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Unowned Property</div>
              <div className="text-base font-extrabold text-white">{currentTile.name}</div>
              <div className="text-xs text-zinc-300">
                Price: <span className="font-bold text-amber-400">${currentTile.price}</span> | Base Rent:{' '}
                <span className="font-bold">${currentTile.rent?.[0]}</span>
              </div>
              {isMyTurn && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={handleBuyProperty}
                    disabled={myPlayer.cash < (currentTile.price || 0)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow"
                  >
                    <ShoppingCart className="w-4 h-4" /> BUY (${currentTile.price})
                  </button>
                  <button
                    onClick={handlePassProperty}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-lg"
                  >
                    PASS
                  </button>
                </div>
              )}
            </div>
          )}

          {decision.type === 'PAY_RENT' && (
            <div className="text-center space-y-1">
              <div className="text-xs font-semibold text-red-400 uppercase tracking-widest">Rent Paid</div>
              <div className="text-sm font-bold text-white">
                Paid <span className="text-amber-400">${decision.rentAmount}</span> rent to owner!
              </div>
            </div>
          )}

          {decision.type === 'TAX' && (
            <div className="text-center space-y-1">
              <div className="text-xs font-semibold text-rose-400 uppercase tracking-widest">Tax Paid</div>
              <div className="text-sm font-bold text-white">
                Paid <span className="text-rose-400">${decision.taxAmount}</span> for {decision.taxName}
              </div>
            </div>
          )}

          {decision.type === 'CARD' && decision.card && (
            <div className="text-center space-y-1 p-2 bg-purple-950/40 border border-purple-800/40 rounded-lg">
              <div className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> CARD DRAWN
              </div>
              <p className="text-xs text-purple-200 font-medium">{decision.card.text}</p>
            </div>
          )}
        </div>
      )}

      {/* Jail Action Box */}
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
              className="px-3 py-1.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-bold text-xs rounded-lg"
            >
              Pay $50 Fine
            </button>
            {myPlayer.getOutOfJailFreeCards > 0 && (
              <button
                onClick={handleUseJailCard}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs rounded-lg"
              >
                Use Jail Card ({myPlayer.getOutOfJailFreeCards})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Turn Action Buttons */}
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
              className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
            >
              <Building2 className="w-4 h-4 text-amber-400" /> Portfolio
            </button>

            <button
              onClick={handleBankruptcy}
              className="py-2 px-3 bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-red-800/40"
            >
              <Flame className="w-4 h-4 text-red-400" /> Bankrupt
            </button>
          </div>
        ) : (
          <div className="text-center py-2 text-xs font-semibold text-zinc-400">
            Waiting for {activePlayer?.name} to complete turn...
          </div>
        )}
      </div>
    </div>
  );
};
