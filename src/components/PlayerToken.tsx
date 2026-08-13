'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../types/game';

export const PlayerToken: React.FC<{ player: Player }> = ({ player }) => {
  return (
    <motion.div
      layoutId={`player-token-${player.id}`}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-black text-[10px] text-white border-2 border-white/80 shadow-lg shadow-black/50 select-none z-30"
      style={{ backgroundColor: player.color }}
      title={`${player.name} ($${player.cash})`}
    >
      {player.name.charAt(0).toUpperCase()}
    </motion.div>
  );
};
