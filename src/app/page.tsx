'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoomCode } from '../lib/utils';
import { Play, Plus, Users, Shield, Sparkles, Dices, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [joinCode, setJoinCode] = useState('');
  const router = useRouter();

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    router.push(`/room/${code}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim().length === 6) {
      router.push(`/room/${joinCode.trim().toUpperCase()}`);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full z-10 space-y-8 text-center">
        {/* Logo & Headline */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black tracking-widest uppercase shadow">
            <Dices className="w-4 h-4" /> REAL-TIME MULTIPLAYER MONOPOLY
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 drop-shadow-sm">
            AGENTOPOLY
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto">
            Experience high-stakes property trading, house building, and real-time multiplayer turns powered by PartyKit.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Create Room Card */}
          <div className="p-6 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all text-left shadow-xl">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Create New Room</h2>
              <p className="text-xs text-zinc-400 mt-1">Host a fresh game and invite friends with a 6-character room code.</p>
            </div>
            <button
              onClick={handleCreateRoom}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              CREATE ROOM <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Join Room Card */}
          <div className="p-6 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all text-left shadow-xl">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Join Room</h2>
              <p className="text-xs text-zinc-400 mt-1">Enter an existing 6-character code to join an active room.</p>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ROOM CODE"
                maxLength={6}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-center font-mono font-black tracking-widest text-amber-400 uppercase text-sm focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={joinCode.trim().length !== 6}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                JOIN GAME
              </button>
            </form>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 font-semibold">
          <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> Server Authoritative Validation</span>
          <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-400" /> PartyKit WebSockets</span>
          <span className="flex items-center gap-1.5"><Dices className="w-4 h-4 text-purple-400" /> Framer Motion Board UI</span>
        </div>
      </div>
    </main>
  );
}
