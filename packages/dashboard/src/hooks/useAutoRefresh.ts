import { useEffect, useRef, useState, useCallback } from 'react';

export function useAutoRefresh(
  refreshFn: () => void | Promise<void>,
  intervalSeconds = 300,
) {
  const [enabled, setEnabled] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    intervalRef.current = setInterval(refreshFn, intervalSeconds * 1000);
  }, [refreshFn, intervalSeconds, stop]);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
    return stop;
  }, [enabled, start, stop]);

  const manualRefresh = useCallback(async () => {
    await refreshFn();
    if (enabled) start();
  }, [refreshFn, enabled, start]);

  return { enabled, setEnabled, manualRefresh };
}
