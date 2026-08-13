export type GamePhase = 'LOBBY' | 'IN_GAME' | 'GAME_OVER';

export type TileGroup =
  | 'BROWN'
  | 'LIGHT_BLUE'
  | 'PINK'
  | 'ORANGE'
  | 'RED'
  | 'YELLOW'
  | 'GREEN'
  | 'DARK_BLUE'
  | 'RAILROAD'
  | 'UTILITY'
  | 'SPECIAL'
  | 'CHANCE'
  | 'COMMUNITY_CHEST'
  | 'TAX';

export interface Tile {
  id: number; // 0 to 39
  name: string;
  group: TileGroup;
  price?: number;
  rent?: number[]; // [base, 1 house, 2 houses, 3 houses, 4 houses, hotel]
  houseCost?: number;
  mortgageValue?: number;
  taxAmount?: number;
  icon?: string;
  description?: string;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  avatar: string;
  cash: number;
  position: number;
  inJail: boolean;
  jailTurns: number;
  bankrupt: boolean;
  isHost: boolean;
  isReady: boolean;
  hasRolledThisTurn: boolean;
  doublesCount: number;
  getOutOfJailFreeCards: number;
}

export interface PropertyState {
  tileId: number;
  ownerId: string | null;
  houses: number; // 0..4 = houses, 5 = hotel
  isMortgaged: boolean;
}

export interface DiceState {
  die1: number;
  die2: number;
  isDouble: boolean;
  timestamp: number;
}

export interface GameLog {
  id: string;
  text: string;
  type: 'info' | 'roll' | 'buy' | 'rent' | 'tax' | 'card' | 'jail' | 'mortgage' | 'house' | 'bankrupt' | 'trade';
  timestamp: number;
}

export interface CardEffect {
  id: string;
  deck: 'CHANCE' | 'COMMUNITY_CHEST';
  text: string;
  action:
    | 'ADD_CASH'
    | 'SUBTRACT_CASH'
    | 'MOVE_TO'
    | 'GO_TO_JAIL'
    | 'GET_OUT_OF_JAIL'
    | 'REPAIRS'
    | 'PAY_EACH_PLAYER';
  amount?: number;
  targetPosition?: number;
  houseCost?: number;
  hotelCost?: number;
}

export interface TurnDecision {
  type: 'BUY_PROPERTY' | 'PAY_RENT' | 'CARD' | 'TAX' | 'JAIL_DECISION';
  tileId?: number;
  rentAmount?: number;
  ownerId?: string;
  card?: CardEffect;
  taxAmount?: number;
  taxName?: string;
}

export interface GameState {
  roomId: string;
  gamePhase: GamePhase;
  hostId: string;
  turnIndex: number;
  playerOrder: string[];
  players: Record<string, Player>;
  properties: Record<number, PropertyState>;
  diceState: DiceState | null;
  currentDecision: TurnDecision | null;
  logs: GameLog[];
  winnerId: string | null;
  lastUpdated: number;
}

// Client to Server WebSocket Messages
export type ClientMessage =
  | { type: 'JOIN_LOBBY'; name: string; color: string; avatar: string }
  | { type: 'SELECT_COLOR'; color: string }
  | { type: 'TOGGLE_READY' }
  | { type: 'START_GAME' }
  | { type: 'ROLL_DICE' }
  | { type: 'BUY_PROPERTY'; tileId: number }
  | { type: 'PASS_PROPERTY'; tileId: number }
  | { type: 'BUILD_HOUSE'; tileId: number }
  | { type: 'SELL_HOUSE'; tileId: number }
  | { type: 'MORTGAGE_PROPERTY'; tileId: number }
  | { type: 'UNMORTGAGE_PROPERTY'; tileId: number }
  | { type: 'PAY_JAIL_FINE' }
  | { type: 'USE_JAIL_CARD' }
  | { type: 'ROLL_JAIL_DICE' }
  | { type: 'END_TURN' }
  | { type: 'DECLARE_BANKRUPTCY' }
  | { type: 'RESET_GAME' };

// Server to Client WebSocket Messages
export type ServerMessage =
  | { type: 'STATE_UPDATE'; state: GameState }
  | { type: 'DICE_ROLLED'; dice: DiceState; playerId: string }
  | { type: 'ACTION_LOG'; log: GameLog }
  | { type: 'ERROR'; message: string };
