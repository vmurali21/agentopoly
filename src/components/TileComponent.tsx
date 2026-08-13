'use client';

import React from 'react';
import { Tile, PropertyState, Player } from '../types/game';
import { COLOR_THEMES } from '../data/boardTiles';
import { PlayerToken } from './PlayerToken';
import {
  ArrowRightCircle,
  Package,
  Receipt,
  Train,
  HelpCircle,
  Lock,
  Zap,
  ParkingCircle,
  Droplet,
  ShieldAlert,
  Gem,
  Home,
  Building2,
} from 'lucide-react';

interface TileComponentProps {
  tile: Tile;
  propertyState?: PropertyState;
  playersOnTile: Player[];
  gridStyle: React.CSSProperties;
  onClick: () => void;
  isOwner?: boolean;
}

const TILE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  ArrowRightCircle,
  Package,
  Receipt,
  Train,
  HelpCircle,
  Lock,
  Zap,
  ParkingCircle,
  Droplet,
  ShieldAlert,
  Gem,
};

export const TileComponent: React.FC<TileComponentProps> = ({
  tile,
  propertyState,
  playersOnTile,
  gridStyle,
  onClick,
}) => {
  const Icon = tile.icon ? TILE_ICONS[tile.icon] : null;
  const theme = COLOR_THEMES[tile.group] || COLOR_THEMES.SPECIAL;
  const isCorner = tile.id === 0 || tile.id === 10 || tile.id === 20 || tile.id === 30;

  return (
    <div
      onClick={onClick}
      style={gridStyle}
      className={`relative group cursor-pointer select-none flex flex-col justify-between border border-zinc-800/90 transition-all duration-200 hover:z-20 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 ${
        isCorner ? 'bg-zinc-900/95 font-bold' : 'bg-zinc-900/80'
      }`}
    >
      {/* Property Color Header */}
      {tile.group !== 'SPECIAL' && tile.group !== 'CHANCE' && tile.group !== 'COMMUNITY_CHEST' && tile.group !== 'TAX' && (
        <div
          className={`h-4 w-full flex items-center justify-between px-1 text-[10px] font-black ${theme.bg} ${theme.text}`}
        >
          {propertyState?.houses && propertyState.houses > 0 ? (
            <div className="flex items-center gap-0.5">
              {propertyState.houses === 5 ? (
                <div className="flex items-center gap-1 text-red-100 font-extrabold">
                  <Building2 className="w-3 h-3 fill-current text-red-200" /> HOTEL
                </div>
              ) : (
                Array.from({ length: propertyState.houses }).map((_, i) => (
                  <Home key={i} className="w-2.5 h-2.5 fill-current text-emerald-200" />
                ))
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Main Tile Content */}
      <div className="p-1 sm:p-1.5 flex flex-col items-center justify-between flex-grow text-center min-h-0 overflow-hidden">
        {/* Title / Icon */}
        <div className="flex flex-col items-center justify-center gap-0.5 my-auto">
          {Icon && <Icon className="w-4 h-4 text-amber-400 opacity-90" />}
          <div className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-2 text-zinc-200">
            {tile.name}
          </div>
        </div>

        {/* Price / Rent Tag */}
        {tile.price && (
          <div className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-400/90 mt-0.5">
            ${tile.price}
          </div>
        )}
      </div>

      {/* Mortgage Overlay */}
      {propertyState?.isMortgaged && (
        <div className="absolute inset-0 bg-red-950/80 backdrop-blur-[1px] flex items-center justify-center z-10">
          <span className="text-[10px] font-black tracking-widest text-red-400 uppercase -rotate-12 border border-red-500/50 px-1 rounded bg-zinc-950/90">
            MORTGAGED
          </span>
        </div>
      )}

      {/* Owner Badge */}
      {propertyState?.ownerId && (
        <div className="absolute top-0 right-0 w-3 h-3 rounded-bl border-l border-b border-zinc-950 bg-amber-400 z-10 shadow" />
      )}

      {/* Player Tokens Container */}
      {playersOnTile.length > 0 && (
        <div className="absolute bottom-1 left-1 right-1 flex flex-wrap items-center justify-center gap-1 z-20">
          {playersOnTile.map((player) => (
            <PlayerToken key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
};
