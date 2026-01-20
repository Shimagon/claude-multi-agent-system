import React, { useState } from 'react';
import {
  useGameStore,
  useCurrentPlayer,
  useDeckCount,
  useDiscardCount,
  useGameSettings,
  useGameEvents,
  DEFAULT_SETTINGS,
  GameEvent,
} from '../store/gameStore';
import { useTimer } from '../hooks/useTimer';

// Event type to readable text
const eventTypeLabels: Record<string, string> = {
  game_started: 'Game Started',
  card_flipped: 'Card Flipped',
  name_registered: 'Name Registered',
  card_claimed: 'Card Claimed',
  turn_changed: 'Turn Changed',
  game_over: 'Game Over',
};

const formatEventMessage = (event: GameEvent): string => {
  switch (event.type) {
    case 'game_started':
      return `Game started with ${event.data?.playerCount} players`;
    case 'card_flipped':
      return `Character #${event.characterId} flipped${event.characterName ? ` ("${event.characterName}")` : ' (new!)'}`;
    case 'name_registered':
      return `${event.playerName} named character #${event.characterId} as "${event.characterName}"`;
    case 'card_claimed':
      return `${event.playerName} claimed "${event.characterName}" (+${event.cardsWon} cards)`;
    case 'turn_changed':
      return `${event.playerName}'s turn`;
    case 'game_over':
      return `Game Over! Winner: ${event.playerName} (${event.data?.finalScore} points)`;
    default:
      return event.type;
  }
};

export const GameDebug: React.FC = () => {
  const [playerNames, setPlayerNames] = useState<string>('Player1,Player2');
  const [newName, setNewName] = useState<string>('');
  const [showEvents, setShowEvents] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Store state
  const {
    currentCard,
    characterNames,
    players,
    isGameStarted,
    isGameOver,
    winner,
    initializeGame,
    shuffleDeck,
    flipCard,
    registerName,
    claimCard,
    nextTurn,
    resetGame,
    updateSettings,
    clearEvents,
  } = useGameStore();

  const currentPlayer = useCurrentPlayer();
  const deckCount = useDeckCount();
  const discardCount = useDiscardCount();
  const settings = useGameSettings();
  const events = useGameEvents();

  // Timer hook
  const timer = useTimer({
    onExpire: () => {
      console.log('Timer expired!');
    },
  });

  const handleInitGame = () => {
    const names = playerNames.split(',').map((n) => n.trim()).filter(Boolean);
    if (names.length >= 2) {
      initializeGame(names);
    }
  };

  const handleRegisterName = () => {
    if (currentCard && newName.trim()) {
      const success = registerName(currentCard.characterId, newName);
      if (success) {
        setNewName('');
        if (settings.autoAdvanceTurn) {
          nextTurn();
        }
      }
    }
  };

  const handleClaimCard = (playerId: string) => {
    const success = claimCard(playerId);
    if (success && settings.autoAdvanceTurn) {
      nextTurn();
    }
  };

  const handleFlipCard = () => {
    flipCard();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '900px' }}>
      <h1>Nanjamonja Game Debug (Local Mode)</h1>

      {/* Game Setup */}
      {!isGameStarted && (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h2>Setup</h2>
          <input
            type="text"
            value={playerNames}
            onChange={(e) => setPlayerNames(e.target.value)}
            placeholder="Player names (comma separated)"
            style={{ width: '300px', marginRight: '10px' }}
          />
          <button onClick={handleInitGame}>Start Game</button>
        </div>
      )}

      {/* Game Status */}
      {isGameStarted && (
        <>
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h2>Game Status</h2>
            <p>Deck: {deckCount} cards</p>
            <p>Discard Pile: {discardCount} cards</p>
            <p>Current Player: {currentPlayer?.name || 'N/A'}</p>
            <p>Game Over: {isGameOver ? 'Yes' : 'No'}</p>
            {winner && <p style={{ color: 'green', fontWeight: 'bold' }}>Winner: {winner.name}!</p>}

            {/* Timer Display */}
            {timer.isActive && (
              <div style={{ marginTop: '10px', padding: '5px', backgroundColor: timer.hasTimeLimit && timer.progress > 0.7 ? '#ffcccc' : '#e0ffe0' }}>
                <p>Time Elapsed: {timer.formattedElapsed}</p>
                {timer.hasTimeLimit && (
                  <>
                    <p>Time Remaining: {timer.formattedRemaining}</p>
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#ddd' }}>
                      <div
                        style={{
                          width: `${(1 - timer.progress) * 100}%`,
                          height: '100%',
                          backgroundColor: timer.progress > 0.7 ? 'red' : 'green',
                          transition: 'width 0.1s',
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            {timer.isExpired && (
              <p style={{ color: 'red', fontWeight: 'bold' }}>Timer Expired! Card moved to discard.</p>
            )}
          </div>

          {/* Current Card */}
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h2>Current Card</h2>
            {currentCard ? (
              <div>
                <p>Character ID: {currentCard.characterId}</p>
                <p>Name: {currentCard.name || '(Not named yet)'}</p>

                {!currentCard.name && (
                  <div style={{ marginTop: '10px' }}>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Give this character a name"
                      style={{ marginRight: '10px' }}
                      onKeyPress={(e) => e.key === 'Enter' && handleRegisterName()}
                    />
                    <button onClick={handleRegisterName}>Register Name</button>
                  </div>
                )}

                {currentCard.name && (
                  <div style={{ marginTop: '10px' }}>
                    <p>Quick claim:</p>
                    {players.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handleClaimCard(player.id)}
                        style={{ marginRight: '5px' }}
                      >
                        {player.name} claims!
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p>No card flipped</p>
            )}
          </div>

          {/* Actions */}
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h2>Actions</h2>
            <button onClick={handleFlipCard} disabled={isGameOver || currentCard !== null} style={{ marginRight: '10px' }}>
              Flip Card
            </button>
            <button onClick={shuffleDeck} style={{ marginRight: '10px' }}>
              Shuffle Deck
            </button>
            <button onClick={nextTurn} style={{ marginRight: '10px' }}>
              Next Turn
            </button>
            <button onClick={resetGame} style={{ color: 'red' }}>
              Reset Game
            </button>
          </div>

          {/* Players */}
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h2>Players</h2>
            {players.map((player) => (
              <div
                key={player.id}
                style={{
                  padding: '5px',
                  backgroundColor: player.id === currentPlayer?.id ? '#e0ffe0' : 'transparent',
                }}
              >
                <strong>{player.name}</strong>: {player.score} points ({player.collectedCards.length} cards)
              </div>
            ))}
          </div>

          {/* Named Characters */}
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h2>Named Characters ({characterNames.size}/12)</h2>
            {Array.from(characterNames.entries()).map(([charId, name]) => (
              <div key={charId}>
                Character {charId}: "{name}"
              </div>
            ))}
            {characterNames.size === 0 && <p>No characters named yet</p>}
          </div>

          {/* Settings Panel */}
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h2 onClick={() => setShowSettings(!showSettings)} style={{ cursor: 'pointer' }}>
              Settings {showSettings ? '▼' : '▶'}
            </h2>
            {showSettings && (
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    checked={settings.autoAdvanceTurn}
                    onChange={(e) => updateSettings({ autoAdvanceTurn: e.target.checked })}
                  />
                  Auto-advance turn
                </label>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    checked={settings.enableSoundEffects}
                    onChange={(e) => updateSettings({ enableSoundEffects: e.target.checked })}
                  />
                  Enable sound effects
                </label>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    checked={settings.enableVibration}
                    onChange={(e) => updateSettings({ enableVibration: e.target.checked })}
                  />
                  Enable vibration
                </label>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Reaction time limit (ms, 0 = no limit):
                  <input
                    type="number"
                    value={settings.reactionTimeLimit}
                    onChange={(e) => updateSettings({ reactionTimeLimit: parseInt(e.target.value) || 0 })}
                    style={{ marginLeft: '10px', width: '80px' }}
                  />
                </label>
                <button onClick={() => updateSettings(DEFAULT_SETTINGS)} style={{ marginTop: '10px' }}>
                  Reset to Defaults
                </button>
              </div>
            )}
          </div>

          {/* Event History */}
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h2 onClick={() => setShowEvents(!showEvents)} style={{ cursor: 'pointer' }}>
              Event History ({events.length}) {showEvents ? '▼' : '▶'}
            </h2>
            {showEvents && (
              <div>
                <button onClick={clearEvents} style={{ marginBottom: '10px' }}>
                  Clear Events
                </button>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {[...events].reverse().map((event) => (
                    <div key={event.id} style={{ padding: '3px', borderBottom: '1px solid #eee' }}>
                      <span style={{ color: '#666', fontSize: '0.8em' }}>
                        [{new Date(event.timestamp).toLocaleTimeString()}]
                      </span>{' '}
                      <strong>{eventTypeLabels[event.type] || event.type}</strong>:{' '}
                      {formatEventMessage(event)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GameDebug;
