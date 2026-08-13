'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { GameProvider, useGame } from '../../../context/GameContext';
import { Lobby } from '../../../components/Lobby';
import { Board } from '../../../components/Board';
import { Sidebar } from '../../../components/Sidebar';
import { PropertyModal } from '../../../components/PropertyModal';
import { PortfolioModal } from '../../../components/PortfolioModal';
import { WinnerModal } from '../../../components/WinnerModal';
import { Shield, Sparkles, Trophy } from 'lucide-react';

function RoomContent({ roomCode }: { roomCode: string }) {
  const { gameState } = useGame();

  if (!gameState) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-medium text-sm">Connecting to PartyKit Room {roomCode}...</p>
      </div>
    );
  }

  if (gameState.gamePhase === 'LOBBY') {
    return (
      <main className="min-h-screen bg-zinc-950 p-4 sm:p-8 flex items-center justify-center">
        <Lobby roomCode={roomCode} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-6 flex flex-col gap-4">
      {/* Top Header */}
      <header className="max-w-[1400px] w-full mx-auto flex items-center justify-between p-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            AGENTOPOLY
          </div>
          <div className="bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 font-mono text-xs text-amber-400 font-bold">
            ROOM: {roomCode}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <Shield className="w-4 h-4" /> Real-time PartyKit Sync
          </span>
        </div>
      </header>

      {/* Main Game Layout (Board + Sidebar) */}
      <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 flex-grow">
        {/* Left: 11x11 Monopoly Board (8 Cols) */}
        <div className="lg:col-span-8 flex items-center justify-center">
          <Board />
        </div>

        {/* Right: Dynamic Leaderboard & Log Ticker (4 Cols) */}
        <div className="lg:col-span-4 h-[600px] lg:h-auto">
          <Sidebar />
        </div>
      </div>

      {/* Modals */}
      <PropertyModal />
      <PortfolioModal />
      <WinnerModal />
    </main>
  );
}

export default function RoomPage() {
  const params = useParams();
  const roomCode = (params?.code as string) || 'DEFAULT';

  return (
    <GameProvider roomCode={roomCode}>
      <RoomContent roomCode={roomCode} />
    </GameProvider>
  );
}
