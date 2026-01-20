import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Card types for Nanjamonja game
export interface Card {
  id: number;
  characterId: number;
  name: string | null; // Name given by players
}

export interface Player {
  id: string;
  name: string;
  collectedCards: Card[];
  score: number;
}

// Game event types for history tracking
export type GameEventType =
  | 'game_started'
  | 'card_flipped'
  | 'name_registered'
  | 'card_claimed'
  | 'turn_changed'
  | 'game_over';

export interface GameEvent {
  id: number;
  type: GameEventType;
  timestamp: number;
  playerId?: string;
  playerName?: string;
  characterId?: number;
  characterName?: string;
  cardsWon?: number;
  data?: Record<string, unknown>;
}

// Game settings for customization
export interface GameSettings {
  reactionTimeLimit: number; // ms, 0 = no limit
  enableSoundEffects: boolean;
  enableVibration: boolean;
  autoAdvanceTurn: boolean;
  showCharacterHints: boolean;
}

// Default settings
export const DEFAULT_SETTINGS: GameSettings = {
  reactionTimeLimit: 0,
  enableSoundEffects: true,
  enableVibration: true,
  autoAdvanceTurn: true,
  showCharacterHints: false,
};

export interface GameState {
  // Deck state
  deck: Card[];
  discardPile: Card[];
  currentCard: Card | null;

  // Character names (12 unique characters)
  characterNames: Map<number, string>;

  // Players
  players: Player[];
  currentPlayerIndex: number;

  // Game status
  isGameStarted: boolean;
  isGameOver: boolean;
  winner: Player | null;

  // Timer state
  cardFlippedAt: number | null;
  isTimerExpired: boolean;

  // Game events/history
  events: GameEvent[];
  eventIdCounter: number;

  // Settings
  settings: GameSettings;

  // Actions
  initializeGame: (playerNames: string[]) => void;
  shuffleDeck: () => void;
  flipCard: () => Card | null;
  registerName: (characterId: number, name: string) => boolean;
  claimCard: (playerId: string) => boolean;
  nextTurn: () => void;
  resetGame: () => void;

  // New actions
  updateSettings: (settings: Partial<GameSettings>) => void;
  expireTimer: () => void;
  addToDiscardPile: () => void;
  getEventHistory: () => GameEvent[];
  clearEvents: () => void;
}

// Helper: Create initial deck (12 characters x 5 cards each = 60 cards)
const createDeck = (): Card[] => {
  const deck: Card[] = [];
  let cardId = 0;

  for (let characterId = 1; characterId <= 12; characterId++) {
    for (let i = 0; i < 5; i++) {
      deck.push({
        id: cardId++,
        characterId,
        name: null,
      });
    }
  }

  return deck;
};

// Helper: Fisher-Yates shuffle algorithm
const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper: Create a game event
const createEvent = (
  state: GameState,
  type: GameEventType,
  data?: Partial<GameEvent>
): GameEvent => ({
  id: state.eventIdCounter,
  type,
  timestamp: Date.now(),
  ...data,
});

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      deck: [],
      discardPile: [],
      currentCard: null,
      characterNames: new Map(),
      players: [],
      currentPlayerIndex: 0,
      isGameStarted: false,
      isGameOver: false,
      winner: null,
      cardFlippedAt: null,
      isTimerExpired: false,
      events: [],
      eventIdCounter: 0,
      settings: DEFAULT_SETTINGS,

      // Initialize game with players
      initializeGame: (playerNames: string[]) => {
        const players: Player[] = playerNames.map((name, index) => ({
          id: `player-${index}`,
          name,
          collectedCards: [],
          score: 0,
        }));

        const deck = shuffle(createDeck());
        const state = get();

        const startEvent = createEvent(state, 'game_started', {
          data: { playerCount: players.length, playerNames },
        });

        set({
          deck,
          discardPile: [],
          currentCard: null,
          characterNames: new Map(),
          players,
          currentPlayerIndex: 0,
          isGameStarted: true,
          isGameOver: false,
          winner: null,
          cardFlippedAt: null,
          isTimerExpired: false,
          events: [startEvent],
          eventIdCounter: 1,
        });
      },

      // Shuffle the remaining deck
      shuffleDeck: () => {
        set((state) => ({
          deck: shuffle(state.deck),
        }));
      },

      // Flip the top card from deck
      flipCard: () => {
        const state = get();

        if (state.deck.length === 0) {
          // Game over - no more cards
          const winner = state.players.reduce((prev, current) =>
            prev.score > current.score ? prev : current
          );

          const gameOverEvent = createEvent(state, 'game_over', {
            playerId: winner.id,
            playerName: winner.name,
            data: { finalScore: winner.score },
          });

          set({
            isGameOver: true,
            winner,
            currentCard: null,
            events: [...state.events, gameOverEvent],
            eventIdCounter: state.eventIdCounter + 1,
          });

          return null;
        }

        const [topCard, ...remainingDeck] = state.deck;

        // Apply registered name if exists
        const characterName = state.characterNames.get(topCard.characterId);
        const cardWithName: Card = {
          ...topCard,
          name: characterName || null,
        };

        const flipEvent = createEvent(state, 'card_flipped', {
          characterId: topCard.characterId,
          characterName: characterName || undefined,
          data: { isNewCharacter: !characterName },
        });

        set({
          deck: remainingDeck,
          currentCard: cardWithName,
          cardFlippedAt: Date.now(),
          isTimerExpired: false,
          events: [...state.events, flipEvent],
          eventIdCounter: state.eventIdCounter + 1,
        });

        return cardWithName;
      },

      // Register a name for a character (first time seeing it)
      registerName: (characterId: number, name: string) => {
        const state = get();
        const currentPlayer = state.players[state.currentPlayerIndex];

        // Check if name already registered
        if (state.characterNames.has(characterId)) {
          return false;
        }

        // Validate name
        if (!name || name.trim().length === 0) {
          return false;
        }

        const trimmedName = name.trim();
        const newCharacterNames = new Map(state.characterNames);
        newCharacterNames.set(characterId, trimmedName);

        // Update current card if it matches
        let updatedCurrentCard = state.currentCard;
        if (state.currentCard && state.currentCard.characterId === characterId) {
          updatedCurrentCard = {
            ...state.currentCard,
            name: trimmedName,
          };
        }

        const nameEvent = createEvent(state, 'name_registered', {
          playerId: currentPlayer?.id,
          playerName: currentPlayer?.name,
          characterId,
          characterName: trimmedName,
        });

        set({
          characterNames: newCharacterNames,
          currentCard: updatedCurrentCard,
          events: [...state.events, nameEvent],
          eventIdCounter: state.eventIdCounter + 1,
        });

        // Move to discard pile after naming
        if (updatedCurrentCard) {
          set((s) => ({
            discardPile: [...s.discardPile, updatedCurrentCard!],
            currentCard: null,
            cardFlippedAt: null,
          }));
        }

        return true;
      },

      // Player claims current card (called correct name first)
      claimCard: (playerId: string) => {
        const state = get();

        if (!state.currentCard || !state.currentCard.name) {
          return false;
        }

        const playerIndex = state.players.findIndex((p) => p.id === playerId);
        if (playerIndex === -1) {
          return false;
        }

        const player = state.players[playerIndex];

        // Player collects current card AND all cards in discard pile
        const collectedCards = [...state.discardPile, state.currentCard];

        const claimEvent = createEvent(state, 'card_claimed', {
          playerId: player.id,
          playerName: player.name,
          characterId: state.currentCard.characterId,
          characterName: state.currentCard.name,
          cardsWon: collectedCards.length,
        });

        const updatedPlayers = state.players.map((p, index) => {
          if (index === playerIndex) {
            return {
              ...p,
              collectedCards: [...p.collectedCards, ...collectedCards],
              score: p.score + collectedCards.length,
            };
          }
          return p;
        });

        set({
          players: updatedPlayers,
          discardPile: [],
          currentCard: null,
          cardFlippedAt: null,
          events: [...state.events, claimEvent],
          eventIdCounter: state.eventIdCounter + 1,
        });

        return true;
      },

      // Move to next player's turn
      nextTurn: () => {
        const state = get();
        const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
        const nextPlayer = state.players[nextIndex];

        const turnEvent = createEvent(state, 'turn_changed', {
          playerId: nextPlayer?.id,
          playerName: nextPlayer?.name,
        });

        set({
          currentPlayerIndex: nextIndex,
          events: [...state.events, turnEvent],
          eventIdCounter: state.eventIdCounter + 1,
        });
      },

      // Reset the entire game
      resetGame: () => {
        set({
          deck: [],
          discardPile: [],
          currentCard: null,
          characterNames: new Map(),
          players: [],
          currentPlayerIndex: 0,
          isGameStarted: false,
          isGameOver: false,
          winner: null,
          cardFlippedAt: null,
          isTimerExpired: false,
          events: [],
          eventIdCounter: 0,
        });
      },

      // Update game settings
      updateSettings: (newSettings: Partial<GameSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      // Expire timer (called when reaction time limit exceeded)
      expireTimer: () => {
        set({ isTimerExpired: true });
      },

      // Add current card to discard pile without claiming
      addToDiscardPile: () => {
        const state = get();
        if (!state.currentCard) return;

        set({
          discardPile: [...state.discardPile, state.currentCard],
          currentCard: null,
          cardFlippedAt: null,
        });
      },

      // Get event history
      getEventHistory: () => {
        return get().events;
      },

      // Clear event history
      clearEvents: () => {
        set({ events: [], eventIdCounter: 0 });
      },
    }),
    {
      name: 'nanjamonja-game-storage',
      partialize: (state) => ({
        settings: state.settings,
        // Don't persist game state, only settings
      }),
    }
  )
);

// Selector hooks for convenience
export const useCurrentPlayer = () =>
  useGameStore((state) => state.players[state.currentPlayerIndex]);

export const useDeckCount = () =>
  useGameStore((state) => state.deck.length);

export const useDiscardCount = () =>
  useGameStore((state) => state.discardPile.length);

export const useGameSettings = () =>
  useGameStore((state) => state.settings);

export const useGameEvents = () =>
  useGameStore((state) => state.events);

export const useIsTimerActive = () =>
  useGameStore((state) => state.cardFlippedAt !== null && !state.isTimerExpired);

export const useReactionTimeElapsed = () =>
  useGameStore((state) =>
    state.cardFlippedAt ? Date.now() - state.cardFlippedAt : 0
  );

// Custom hook for timer functionality
export const useReactionTimer = () => {
  const cardFlippedAt = useGameStore((state) => state.cardFlippedAt);
  const isTimerExpired = useGameStore((state) => state.isTimerExpired);
  const reactionTimeLimit = useGameStore((state) => state.settings.reactionTimeLimit);
  const expireTimer = useGameStore((state) => state.expireTimer);
  const addToDiscardPile = useGameStore((state) => state.addToDiscardPile);

  return {
    cardFlippedAt,
    isTimerExpired,
    reactionTimeLimit,
    expireTimer,
    addToDiscardPile,
    isActive: cardFlippedAt !== null && !isTimerExpired,
    hasTimeLimit: reactionTimeLimit > 0,
  };
};
