'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import PartySocket from 'partysocket';
import { GameState, ClientMessage, ServerMessage, Player } from '../types/game';

interface GameContextType {
  gameState: GameState | null;
  socket: PartySocket | null;
  isConnected: boolean;
  myPlayerId: string | null;
  myPlayer: Player | null;
  isMyTurn: boolean;
  sendMessage: (msg: ClientMessage) => void;
  selectedTileId: number | null;
  setSelectedTileId: (id: number | null) => void;
  isPortfolioOpen: boolean;
  setIsPortfolioOpen: (open: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ roomCode: string; children: ReactNode }> = ({ roomCode, children }) => {
  const [socket, setSocket] = useState<PartySocket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [selectedTileId, setSelectedTileId] = useState<number | null>(null);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);

  useEffect(() => {
    const partyHost = process.env.NEXT_PUBLIC_PARTYKIT_HOST || '127.0.0.1:1999';

    const ws = new PartySocket({
      host: partyHost,
      room: roomCode.toLowerCase(),
    });

    setSocket(ws);
    setMyPlayerId(ws.id);

    ws.addEventListener('open', () => {
      setIsConnected(true);
      const savedName = localStorage.getItem('agentopoly_player_name') || `Player_${ws.id.substring(0, 4)}`;
      const savedColor = localStorage.getItem('agentopoly_player_color') || '#3b82f6';

      ws.send(
        JSON.stringify({
          type: 'JOIN_LOBBY',
          playerId: ws.id,
          name: savedName,
          color: savedColor,
          avatar: 'User',
        } as ClientMessage)
      );
    });

    ws.addEventListener('message', (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data);
        if (msg.type === 'STATE_UPDATE') {
          setGameState(msg.state);
        }
      } catch (e) {
        console.error('Failed to parse server message:', e);
      }
    });

    ws.addEventListener('close', () => {
      setIsConnected(false);
    });

    return () => {
      ws.close();
    };
  }, [roomCode]);

  const sendMessage = useCallback(
    (msg: ClientMessage) => {
      if (socket && isConnected) {
        socket.send(JSON.stringify(msg));
      }
    },
    [socket, isConnected]
  );

  const myPlayer = gameState && myPlayerId ? gameState.players[myPlayerId] || null : null;
  const activePlayerId = gameState?.playerOrder[gameState.turnIndex];
  const isMyTurn = Boolean(myPlayerId && activePlayerId && myPlayerId === activePlayerId);

  return (
    <GameContext.Provider
      value={{
        gameState,
        socket,
        isConnected,
        myPlayerId,
        myPlayer,
        isMyTurn,
        sendMessage,
        selectedTileId,
        setSelectedTileId,
        isPortfolioOpen,
        setIsPortfolioOpen,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
