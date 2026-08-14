'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../types/game';
import { Bot, Car, Ship, Dog, Cat, Crown } from 'lucide-react';

interface PlayerTokenProps {
  player: Player;
}

export const TOKEN_AVATARS: Record<string, React.FC<{ className?: string }>> = {
  TopHat: Crown,
  RaceCar: Car,
  Battleship: Ship,
  Dog: Dog,
  Cat: Cat,
  Robot: Bot,
};

export const PlayerToken: React.FC<PlayerTokenProps> = ({ player }) => {
  const IconComponent = TOKEN_AVATARS[player.avatar] || Bot;

  return (
    <motion.div
      layoutId={`player-token-${player.id}`}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 border-white/90 shadow-xl shadow-black/80 select-none z-30 transform hover:scale-125 transition-transform"
      style={{ backgroundColor: player.color }}
      title={`${player.name} ($${player.cash})`}
    >
      <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white drop-shadow" />
    </motion.div>
  );
};
