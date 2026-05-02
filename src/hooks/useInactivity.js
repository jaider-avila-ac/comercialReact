import { useEffect, useRef } from "react";

export function useInactivity(onInactive, timeout = 30 * 60 * 1000) {
  const timerRef = useRef();

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onInactive(), timeout);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    resetTimer();
    events.forEach(event => window.addEventListener(event, resetTimer));
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onInactive, timeout]);
}