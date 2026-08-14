'use client';

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Copy, Check, Crown, Play, User, Sparkles, Shield, RefreshCw } from 'lucide-react';
import { TOKEN_AVATARS } from './PlayerToken';

const PRESET_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Yellow', hex: '#f59e0b' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Pink', hex: '#ec4899' },
];

const PRESET_AVATARS = [
  { id: 'Robot', label: 'Robot' },
  { id: 'TopHat', label: 'Hat' },
  { id: 'RaceCar', label: 'Car' },
  { id: 'Battleship', label: 'Ship' },
  { id: 'Dog', label: 'Dog' },
  { id: 'Cat', label: 'Cat' },
];

export const Lobby: React.FC<{ roomCode: string }> = ({ roomCode }) => {
  const { gameState, sendMessage, myPlayerId, myPlayer } = useGame();
  const [copied, setCopied] = useState(false);
  const [playerName, setPlayerName] = useState(myPlayer?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(myPlayer?.avatar || 'Robot');

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-300">
        <RefreshCw className="w-10 h-10 animate-spin text-amber-500 mb-4" />
        <p className="text-lg font-medium">Connecting to PartyKit Room...</p>
      </div>
    );
  }

  const players = Object.values(gameState.players);
  const isHost = myPlayerId === gameState.hostId;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPlayerName(val);
    localStorage.setItem('agentopoly_player_name', val);
    sendMessage({
      type: 'JOIN_LOBBY',
      name: val,
      color: myPlayer?.color || '#3b82f6',
      avatar: selectedAvatar,
    });
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    localStorage.setItem('agentopoly_player_avatar', avatarId);
    sendMessage({
      type: 'JOIN_LOBBY',
      name: playerName || myPlayer?.name || 'Player',
      color: myPlayer?.color || '#3b82f6',
      avatar: avatarId,
    });
  };

  const handleColorSelect = (hex: string) => {
    localStorage.setItem('agentopoly_player_color', hex);
    sendMessage({ type: 'SELECT_COLOR', color: hex });
  };

  const handleStartGame = () => {
    sendMessage({ type: 'START_GAME' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-zinc-900/90 backdrop-blur-xl rounded-3xl border border-zinc-800 shadow-2xl text-zinc-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500">
            AGENTOPOLY LOBBY
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Real-time multiplayer Monopoly powered by PartyKit</p>
        </div>

        {/* Room Code Badge */}
        <div className="flex items-center gap-3 bg-zinc-950 px-5 py-3 rounded-2xl border border-zinc-800">
          <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Room Code</div>
          <div className="font-mono text-2xl font-black text-amber-400 tracking-wider">{roomCode}</div>
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Copy Room Link"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Left Column: Player Profile */}
        <div className="space-y-6">
          <div className="bg-zinc-950/60 p-6 rounded-2xl border border-zinc-800/80 space-y-5">
            <h2 className="text-base font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-5 h-5" /> Customize Profile
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Player Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={handleNameChange}
                  placeholder="Enter your name"
                  maxLength={16}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Token Icon
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((av) => {
                    const IconComp = TOKEN_AVATARS[av.id] || User;
                    const isSelected = selectedAvatar === av.id;
                    return (
                      <button
                        key={av.id}
                        onClick={() => handleAvatarSelect(av.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-lg scale-105'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                        title={av.label}
                      >
                        <IconComp className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Token Color
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => handleColorSelect(c.hex)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-transform hover:scale-110 ${
                        myPlayer?.color === c.hex
                          ? 'border-white scale-110 shadow-lg shadow-white/20'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {myPlayer?.color === c.hex && <Check className="w-5 h-5 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-2xl text-amber-200/90 text-sm space-y-2">
            <div className="flex items-center gap-2 font-black text-amber-400 uppercase text-xs tracking-wider">
              <Sparkles className="w-4 h-4" /> Multi-Window / Multiplayer Testing
            </div>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              Open the room URL in another browser tab to test real-time turn synchronization between multiple players!
            </p>
          </div>
        </div>

        {/* Right Column: Connected Roster */}
        <div className="space-y-6">
          <div className="bg-zinc-950/60 p-6 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-5 h-5" /> Connected Roster ({players.length}/6)
              </h2>
            </div>

            <div className="space-y-3">
              {players.map((p) => {
                const AvatarIcon = TOKEN_AVATARS[p.avatar] || User;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full border-2 border-white/50 flex items-center justify-center shadow"
                        style={{ backgroundColor: p.color }}
                      >
                        <AvatarIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          {p.name}
                          {p.id === myPlayerId && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 font-mono">$1,500 Starting Cash</div>
                      </div>
                    </div>

                    {p.isHost && (
                      <div className="flex items-center gap-1.5 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-xl font-black">
                        <Crown className="w-3.5 h-3.5 fill-current" /> HOST
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            {isHost ? (
              <button
                onClick={handleStartGame}
                disabled={players.length < 1}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-zinc-950 font-black text-lg rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <Play className="w-6 h-6 fill-current" /> START GAME
              </button>
            ) : (
              <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-center text-zinc-400 text-sm animate-pulse font-medium">
                Waiting for host to start the game...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
