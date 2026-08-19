import React, { useState, useRef, useCallback } from "react";
import { Loader2, RotateCw } from "lucide-react";

export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const THRESHOLD = 70;

  const onTouchStart = useCallback((e) => {
    const el = e.currentTarget.closest && e.currentTarget.closest("main");
    if (!el || el.scrollTop > 0 || refreshing) {
      pulling.current = false;
      return;
    }
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, [refreshing]);

  const onTouchMove = useCallback((e) => {
    if (!pulling.current || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setPull(Math.min(delta * 0.5, 80));
  }, [refreshing]);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pull >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPull(THRESHOLD);
      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  }, [pull, onRefresh, refreshing]);

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="flex items-center justify-center overflow-hidden transition-all duration-150" style={{ height: pull > 0 ? pull : 0 }}>
        {refreshing ? (
          <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
        ) : (
          <RotateCw
            className={`w-5 h-5 text-orange-400 transition-transform ${pull >= THRESHOLD ? "rotate-180" : ""}`}
            style={{ opacity: Math.min(pull / THRESHOLD, 1) }}
          />
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}