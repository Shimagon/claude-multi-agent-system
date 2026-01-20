import { useEffect, useState, useCallback, useRef } from 'react';
import { useReactionTimer } from '../store/gameStore';

interface UseTimerOptions {
  onExpire?: () => void;
  updateInterval?: number; // ms
}

export const useTimer = (options: UseTimerOptions = {}) => {
  const { onExpire, updateInterval = 100 } = options;
  const {
    cardFlippedAt,
    isTimerExpired,
    reactionTimeLimit,
    expireTimer,
    addToDiscardPile,
    isActive,
    hasTimeLimit,
  } = useReactionTimer();

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(reactionTimeLimit);
  const onExpireRef = useRef(onExpire);

  // Keep callback ref updated
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Timer update effect
  useEffect(() => {
    if (!isActive || !cardFlippedAt) {
      setTimeElapsed(0);
      setTimeRemaining(reactionTimeLimit);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - cardFlippedAt;
      setTimeElapsed(elapsed);

      if (hasTimeLimit) {
        const remaining = Math.max(0, reactionTimeLimit - elapsed);
        setTimeRemaining(remaining);

        // Check if timer expired
        if (remaining === 0 && !isTimerExpired) {
          expireTimer();
          addToDiscardPile();
          onExpireRef.current?.();
        }
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [
    isActive,
    cardFlippedAt,
    hasTimeLimit,
    reactionTimeLimit,
    isTimerExpired,
    expireTimer,
    addToDiscardPile,
    updateInterval,
  ]);

  // Calculate progress (0 to 1)
  const progress = hasTimeLimit
    ? Math.min(1, timeElapsed / reactionTimeLimit)
    : 0;

  // Format time for display
  const formatTime = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${seconds}.${tenths}s`;
  }, []);

  return {
    timeElapsed,
    timeRemaining,
    progress,
    isActive,
    isExpired: isTimerExpired,
    hasTimeLimit,
    formattedElapsed: formatTime(timeElapsed),
    formattedRemaining: formatTime(timeRemaining),
  };
};

export default useTimer;
