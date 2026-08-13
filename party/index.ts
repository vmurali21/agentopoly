import type * as Party from 'partykit/server';
import {
  GameState,
  ClientMessage,
  ServerMessage,
  Player,
  PropertyState,
  DiceState,
  CardEffect,
  GameLog,
} from '../src/types/game';
import { BOARD_TILES, PROPERTY_SETS } from '../src/data/boardTiles';
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from '../src/data/cards';

const PLAYER_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#ec4899', // Pink
];

export default class MonopolyServer implements Party.Server {
  state: GameState;
  chanceDeck: CardEffect[];
  chestDeck: CardEffect[];

  constructor(readonly room: Party.Room) {
    this.chanceDeck = this.shuffle([...CHANCE_CARDS]);
    this.chestDeck = this.shuffle([...COMMUNITY_CHEST_CARDS]);

    this.state = {
      roomId: room.id,
      gamePhase: 'LOBBY',
      hostId: '',
      turnIndex: 0,
      playerOrder: [],
      players: {},
      properties: {},
      diceState: null,
      currentDecision: null,
      logs: [],
      winnerId: null,
      lastUpdated: Date.now(),
    };
  }

  shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Send state on connect
    this.sendState(conn);
  }

  onClose(conn: Party.Connection) {
    // If game has not started, remove player from lobby
    if (this.state.gamePhase === 'LOBBY') {
      if (this.state.players[conn.id]) {
        delete this.state.players[conn.id];
        this.state.playerOrder = this.state.playerOrder.filter((id) => id !== conn.id);
        if (this.state.hostId === conn.id) {
          this.state.hostId = this.state.playerOrder[0] || '';
          if (this.state.hostId && this.state.players[this.state.hostId]) {
            this.state.players[this.state.hostId].isHost = true;
          }
        }
        this.broadcastState();
      }
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const msg: ClientMessage = JSON.parse(message);
      this.handleClientMessage(msg, sender);
    } catch (e) {
      console.error('Error handling message:', e);
    }
  }

  handleClientMessage(msg: ClientMessage, sender: Party.Connection) {
    const playerId = sender.id;

    switch (msg.type) {
      case 'JOIN_LOBBY': {
        if (!this.state.players[playerId]) {
          const colorIndex = Object.keys(this.state.players).length % PLAYER_COLORS.length;
          const assignedColor = msg.color || PLAYER_COLORS[colorIndex];
          const isFirst = this.state.playerOrder.length === 0;

          const newPlayer: Player = {
            id: playerId,
            name: msg.name || `Player ${this.state.playerOrder.length + 1}`,
            color: assignedColor,
            avatar: msg.avatar || 'User',
            cash: 1500,
            position: 0,
            inJail: false,
            jailTurns: 0,
            bankrupt: false,
            isHost: isFirst,
            isReady: true,
            hasRolledThisTurn: false,
            doublesCount: 0,
            getOutOfJailFreeCards: 0,
          };

          this.state.players[playerId] = newPlayer;
          this.state.playerOrder.push(playerId);
          if (isFirst) {
            this.state.hostId = playerId;
          }

          this.addLog(`${newPlayer.name} joined the room`, 'info');
        }
        this.broadcastState();
        break;
      }

      case 'SELECT_COLOR': {
        if (this.state.players[playerId]) {
          this.state.players[playerId].color = msg.color;
          this.broadcastState();
        }
        break;
      }

      case 'TOGGLE_READY': {
        if (this.state.players[playerId]) {
          this.state.players[playerId].isReady = !this.state.players[playerId].isReady;
          this.broadcastState();
        }
        break;
      }

      case 'START_GAME': {
        if (this.state.hostId === playerId && this.state.gamePhase === 'LOBBY') {
          if (this.state.playerOrder.length < 1) return;

          // Initialize properties
          this.state.properties = {};
          BOARD_TILES.forEach((tile) => {
            if (tile.group !== 'SPECIAL' && tile.group !== 'CHANCE' && tile.group !== 'COMMUNITY_CHEST' && tile.group !== 'TAX') {
              this.state.properties[tile.id] = {
                tileId: tile.id,
                ownerId: null,
                houses: 0,
                isMortgaged: false,
              };
            }
          });

          // Reset all players
          this.state.playerOrder.forEach((id) => {
            if (this.state.players[id]) {
              this.state.players[id].cash = 1500;
              this.state.players[id].position = 0;
              this.state.players[id].inJail = false;
              this.state.players[id].jailTurns = 0;
              this.state.players[id].bankrupt = false;
              this.state.players[id].hasRolledThisTurn = false;
              this.state.players[id].doublesCount = 0;
            }
          });

          this.state.gamePhase = 'IN_GAME';
          this.state.turnIndex = 0;
          this.state.diceState = null;
          this.state.currentDecision = null;
          this.addLog(`Game started! It's ${this.getActivePlayer()?.name}'s turn.`, 'info');
          this.broadcastState();
        }
        break;
      }

      case 'ROLL_DICE': {
        const activePlayer = this.getActivePlayer();
        if (!activePlayer || activePlayer.id !== playerId || this.state.gamePhase !== 'IN_GAME') return;
        if (activePlayer.hasRolledThisTurn) return;

        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        const isDouble = die1 === die2;

        this.state.diceState = {
          die1,
          die2,
          isDouble,
          timestamp: Date.now(),
        };

        this.addLog(`${activePlayer.name} rolled ${die1} and ${die2} (${die1 + die2})${isDouble ? ' - DOUBLE!' : ''}`, 'roll');

        // Check if player in Jail
        if (activePlayer.inJail) {
          if (isDouble) {
            activePlayer.inJail = false;
            activePlayer.jailTurns = 0;
            this.addLog(`${activePlayer.name} rolled doubles and got out of Jail!`, 'jail');
          } else {
            activePlayer.jailTurns += 1;
            activePlayer.hasRolledThisTurn = true;
            if (activePlayer.jailTurns >= 3) {
              activePlayer.cash -= 50;
              activePlayer.inJail = false;
              activePlayer.jailTurns = 0;
              this.addLog(`${activePlayer.name} served 3 turns in jail and paid $50 fine.`, 'jail');
            } else {
              this.addLog(`${activePlayer.name} failed to roll doubles and remains in Jail.`, 'jail');
              this.broadcastState();
              return;
            }
          }
        }

        // Handle doubles streak
        if (isDouble && !activePlayer.inJail) {
          activePlayer.doublesCount += 1;
          if (activePlayer.doublesCount >= 3) {
            activePlayer.inJail = true;
            activePlayer.position = 10; // Jail tile
            activePlayer.doublesCount = 0;
            activePlayer.hasRolledThisTurn = true;
            this.addLog(`${activePlayer.name} rolled 3 consecutive doubles and was sent to Jail!`, 'jail');
            this.broadcastState();
            return;
          }
        } else {
          activePlayer.doublesCount = 0;
        }

        // Move player
        const oldPos = activePlayer.position;
        const newPos = (oldPos + die1 + die2) % 40;

        // Check GO pass ($200 salary)
        if (oldPos + die1 + die2 >= 40) {
          activePlayer.cash += 200;
          this.addLog(`${activePlayer.name} passed GO and collected $200!`, 'info');
        }

        activePlayer.position = newPos;
        activePlayer.hasRolledThisTurn = true;

        // Execute tile landing rules
        this.handleTileLanding(activePlayer, newPos, die1 + die2);
        this.broadcastState();
        break;
      }

      case 'BUY_PROPERTY': {
        const activePlayer = this.getActivePlayer();
        if (!activePlayer || activePlayer.id !== playerId) return;
        const tile = BOARD_TILES.find((t) => t.id === msg.tileId);
        const propState = this.state.properties[msg.tileId];

        if (tile && tile.price && propState && propState.ownerId === null) {
          if (activePlayer.cash >= tile.price) {
            activePlayer.cash -= tile.price;
            propState.ownerId = activePlayer.id;
            this.addLog(`${activePlayer.name} bought ${tile.name} for $${tile.price}!`, 'buy');
            this.state.currentDecision = null;
          }
        }
        this.broadcastState();
        break;
      }

      case 'PASS_PROPERTY': {
        const activePlayer = this.getActivePlayer();
        if (!activePlayer || activePlayer.id !== playerId) return;
        this.addLog(`${activePlayer.name} decided not to buy the property.`, 'info');
        this.state.currentDecision = null;
        this.broadcastState();
        break;
      }

      case 'BUILD_HOUSE': {
        const activePlayer = this.getActivePlayer();
        if (!activePlayer || activePlayer.id !== playerId) return;
        const prop = this.state.properties[msg.tileId];
        const tile = BOARD_TILES.find((t) => t.id === msg.tileId);

        if (prop && tile && prop.ownerId === activePlayer.id && tile.houseCost && prop.houses < 5) {
          if (this.ownsFullSet(activePlayer.id, tile.group)) {
            if (activePlayer.cash >= tile.houseCost) {
              activePlayer.cash -= tile.houseCost;
              prop.houses += 1;
              const buildingType = prop.houses === 5 ? 'Hotel' : 'House';
              this.addLog(`${activePlayer.name} built a ${buildingType} on ${tile.name} for $${tile.houseCost}!`, 'house');
            }
          }
        }
        this.broadcastState();
        break;
      }

      case 'SELL_HOUSE': {
        const activePlayer = this.getActivePlayer();
        if (!activePlayer || activePlayer.id !== playerId) return;
        const prop = this.state.properties[msg.tileId];
        const tile = BOARD_TILES.find((t) => t.id === msg.tileId);

        if (prop && tile && prop.ownerId === activePlayer.id && tile.houseCost && prop.houses > 0) {
          const refund = Math.floor(tile.houseCost / 2);
          activePlayer.cash += refund;
          prop.houses -= 1;
          this.addLog(`${activePlayer.name} sold a building on ${tile.name} for $${refund}.`, 'house');
        }
        this.broadcastState();
        break;
      }

      case 'MORTGAGE_PROPERTY': {
        const activePlayer = this.getActivePlayer();
        if (!activePlayer || activePlayer.id !== playerId) return;
        const prop = this.state.properties[msg.tileId];
        const tile = BOARD_TILES.find((t) => t.id === msg.tileId);

        if (prop && tile && prop.ownerId === activePlayer.id && !prop.isMortgaged && prop.houses === 0 && tile.mortgageValue) {
          prop.isMortgaged = true;
          activePlayer.cash += tile.mortgageValue;
          this.addLog(`${activePlayer.name} mortgaged ${tile.name} for $${tile.mortgageValue}.`, 'mortgage');
        }
        this.broadcastState();
        break;
      }

      case 'UNMORTGAGE_PROPERTY': {
        const activePlayer = this.getActivePlayer();
        if (!activePlayer || activePlayer.id !== playerId) return;
        const prop = this.state.properties[msg.tileId];
        const tile = BOARD_TILES.find((t) => t.id === msg.tileId);

        if (prop && tile && prop.ownerId === activePlayer.id && prop.isMortgaged && tile.mortgageValue) {
          const cost = Math.floor(tile.mortgageValue * 1.1);
          if (activePlayer.cash >= cost) {
            activePlayer.cash -= cost;
            prop.isMortgaged = false;
            this.addLog(`${activePlayer.name} unmortgaged ${tile.name} for $${cost}.`, 'mortgage');
          }
        }
        this.broadcastState();
        break;
      }

      case 'PAY_JAIL_FINE': {
        const activePlayer = this.getActivePlayer();
        if (!activePlayer || activePlayer.id !== playerId || !activePlayer.inJail) return;

        if (activePlayer.cash >= 50) {
          activePlayer.cash -= 50;
          activePlayer.inJail = false;
          activePlayer.jailTurns = 0;
          this.addLog(`${activePlayer.name} paid $50 fine and got out of Jail!`, 'jail');
        }
        this.broadcastState();
        break;
      }

      case 'USE_JAIL_CARD': {
        const activePlayer = this.getActivePlayer();
        if (!activePlayer || activePlayer.id !== playerId || !activePlayer.inJail) return;

        if (activePlayer.getOutOfJailFreeCards > 0) {
          activePlayer.getOutOfJailFreeCards -= 1;
          activePlayer.inJail = false;
          activePlayer.jailTurns = 0;
          this.addLog(`${activePlayer.name} used a Get Out of Jail Free card!`, 'jail');
        }
        this.broadcastState();
        break;
      }

      case 'END_TURN': {
        const activePlayer = this.getActivePlayer();
        if (!activePlayer || activePlayer.id !== playerId) return;

        // Check if player gets another turn due to double (and not in jail)
        const isDouble = this.state.diceState?.isDouble && !activePlayer.inJail && activePlayer.doublesCount > 0;

        this.state.currentDecision = null;

        if (!isDouble) {
          this.advanceTurn();
        } else {
          activePlayer.hasRolledThisTurn = false;
          this.addLog(`${activePlayer.name} rolled doubles and gets another turn!`, 'info');
        }

        this.broadcastState();
        break;
      }

      case 'DECLARE_BANKRUPTCY': {
        const activePlayer = this.getActivePlayer();
        if (!activePlayer || activePlayer.id !== playerId) return;

        activePlayer.bankrupt = true;
        this.addLog(`${activePlayer.name} declared bankruptcy!`, 'bankrupt');

        // Reset owned properties to bank
        Object.values(this.state.properties).forEach((prop) => {
          if (prop.ownerId === activePlayer.id) {
            prop.ownerId = null;
            prop.houses = 0;
            prop.isMortgaged = false;
          }
        });

        // Check remaining players
        const activePlayers = this.state.playerOrder.filter((id) => !this.state.players[id]?.bankrupt);

        if (activePlayers.length === 1) {
          this.state.gamePhase = 'GAME_OVER';
          this.state.winnerId = activePlayers[0];
          const winner = this.state.players[activePlayers[0]];
          this.addLog(`🎉 ${winner.name} wins the game!`, 'info');
        } else {
          this.advanceTurn();
        }

        this.broadcastState();
        break;
      }

      case 'RESET_GAME': {
        this.state.gamePhase = 'LOBBY';
        this.state.turnIndex = 0;
        this.state.diceState = null;
        this.state.currentDecision = null;
        this.state.winnerId = null;
        this.addLog(`Game reset to lobby by host.`, 'info');
        this.broadcastState();
        break;
      }
    }
  }

  handleTileLanding(player: Player, position: number, diceSum: number) {
    const tile = BOARD_TILES.find((t) => t.id === position);
    if (!tile) return;

    // Special Tiles
    if (tile.id === 30) {
      // Go to Jail
      player.position = 10;
      player.inJail = true;
      player.doublesCount = 0;
      this.addLog(`${player.name} landed on Go To Jail! Direct to Jail!`, 'jail');
      return;
    }

    if (tile.group === 'TAX') {
      const tax = tile.taxAmount || 100;
      player.cash -= tax;
      this.state.currentDecision = {
        type: 'TAX',
        taxAmount: tax,
        taxName: tile.name,
      };
      this.addLog(`${player.name} landed on ${tile.name} and paid $${tax} tax.`, 'tax');
      return;
    }

    if (tile.group === 'CHANCE' || tile.group === 'COMMUNITY_CHEST') {
      const isChance = tile.group === 'CHANCE';
      const deck = isChance ? this.chanceDeck : this.chestDeck;
      const card = deck.shift();
      if (card) {
        deck.push(card); // recycle card to bottom
        this.executeCard(player, card, diceSum);
      }
      return;
    }

    // Property / Railroad / Utility
    const propState = this.state.properties[position];
    if (propState) {
      if (propState.ownerId === null) {
        // Unowned -> Option to buy
        this.state.currentDecision = {
          type: 'BUY_PROPERTY',
          tileId: position,
        };
      } else if (propState.ownerId !== player.id && !propState.isMortgaged) {
        // Owned by someone else -> Calculate Rent
        const owner = this.state.players[propState.ownerId];
        if (owner && !owner.bankrupt && !owner.inJail) {
          let rent = 0;
          if (tile.group === 'RAILROAD') {
            const ownedRRs = this.getOwnedCountInGroup(owner.id, 'RAILROAD');
            const rentTable = tile.rent || [25, 50, 100, 200];
            rent = rentTable[Math.min(ownedRRs - 1, 3)] || 25;
          } else if (tile.group === 'UTILITY') {
            const ownedUtils = this.getOwnedCountInGroup(owner.id, 'UTILITY');
            const mult = ownedUtils === 2 ? 10 : 4;
            rent = diceSum * mult;
          } else if (tile.rent) {
            const houses = propState.houses;
            rent = tile.rent[houses] || tile.rent[0];
            // Double rent if owner holds full set and 0 houses built
            if (houses === 0 && this.ownsFullSet(owner.id, tile.group)) {
              rent *= 2;
            }
          }

          player.cash -= rent;
          owner.cash += rent;
          this.state.currentDecision = {
            type: 'PAY_RENT',
            tileId: position,
            rentAmount: rent,
            ownerId: owner.id,
          };
          this.addLog(`${player.name} paid $${rent} rent to ${owner.name} for landing on ${tile.name}.`, 'rent');
        }
      }
    }
  }

  executeCard(player: Player, card: CardEffect, diceSum: number) {
    this.addLog(`${player.name} drew card: "${card.text}"`, 'card');

    switch (card.action) {
      case 'ADD_CASH':
        player.cash += card.amount || 0;
        break;
      case 'SUBTRACT_CASH':
        player.cash -= card.amount || 0;
        break;
      case 'MOVE_TO':
        if (card.targetPosition !== undefined) {
          if (player.position > card.targetPosition && card.targetPosition !== 10) {
            player.cash += 200; // Passed GO
            this.addLog(`${player.name} passed GO and collected $200!`, 'info');
          }
          player.position = card.targetPosition;
          this.handleTileLanding(player, player.position, diceSum);
        }
        break;
      case 'GO_TO_JAIL':
        player.position = 10;
        player.inJail = true;
        player.doublesCount = 0;
        break;
      case 'GET_OUT_OF_JAIL':
        player.getOutOfJailFreeCards += 1;
        break;
      case 'PAY_EACH_PLAYER':
        const amount = card.amount || 50;
        Object.values(this.state.players).forEach((p) => {
          if (p.id !== player.id && !p.bankrupt) {
            player.cash -= amount;
            p.cash += amount;
          }
        });
        break;
      case 'REPAIRS':
        let repairBill = 0;
        Object.values(this.state.properties).forEach((p) => {
          if (p.ownerId === player.id) {
            if (p.houses === 5) repairBill += card.hotelCost || 100;
            else repairBill += p.houses * (card.houseCost || 25);
          }
        });
        player.cash -= repairBill;
        this.addLog(`${player.name} paid $${repairBill} for property repairs.`, 'tax');
        break;
    }

    this.state.currentDecision = {
      type: 'CARD',
      card,
    };
  }

  ownsFullSet(ownerId: string, group: string): boolean {
    const tileIds = PROPERTY_SETS[group];
    if (!tileIds) return false;
    return tileIds.every((id) => this.state.properties[id]?.ownerId === ownerId);
  }

  getOwnedCountInGroup(ownerId: string, group: string): number {
    const tileIds = PROPERTY_SETS[group] || [];
    return tileIds.filter((id) => this.state.properties[id]?.ownerId === ownerId).length;
  }

  getActivePlayer(): Player | null {
    const activeId = this.state.playerOrder[this.state.turnIndex];
    return activeId ? this.state.players[activeId] || null : null;
  }

  advanceTurn() {
    if (this.state.playerOrder.length === 0) return;
    let nextIndex = (this.state.turnIndex + 1) % this.state.playerOrder.length;
    let attempts = 0;

    while (this.state.players[this.state.playerOrder[nextIndex]]?.bankrupt && attempts < this.state.playerOrder.length) {
      nextIndex = (nextIndex + 1) % this.state.playerOrder.length;
      attempts++;
    }

    this.state.turnIndex = nextIndex;
    const nextPlayer = this.getActivePlayer();
    if (nextPlayer) {
      nextPlayer.hasRolledThisTurn = false;
      nextPlayer.doublesCount = 0;
      this.addLog(`Turn passed to ${nextPlayer.name}.`, 'info');
    }
  }

  addLog(text: string, type: GameLog['type']) {
    const log: GameLog = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      type,
      timestamp: Date.now(),
    };
    this.state.logs.unshift(log);
    if (this.state.logs.length > 100) this.state.logs.pop();
  }

  sendState(conn: Party.Connection) {
    const msg: ServerMessage = {
      type: 'STATE_UPDATE',
      state: this.state,
    };
    conn.send(JSON.stringify(msg));
  }

  broadcastState() {
    this.state.lastUpdated = Date.now();
    const msg: ServerMessage = {
      type: 'STATE_UPDATE',
      state: this.state,
    };
    this.room.broadcast(JSON.stringify(msg));
  }
}
