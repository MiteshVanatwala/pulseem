import { useCallback, useEffect, useRef, useState } from 'react';

export interface DraggablePosition {
  x: number;
  y: number;
}

interface UseDraggableProps {
  /** Unique key for persistence. Include the screen + element id so each screen remembers its own spot. */
  storageKey: string;
  /** Minimum distance (px) the pointer must travel before it counts as a drag and not a tap/click. */
  dragThreshold?: number;
  /** Keep at least this many px between the element and the viewport edges. */
  edgePadding?: number;
}

const STORAGE_PREFIX = 'pulsiDragPos:';

const readStored = (storageKey: string): DraggablePosition | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    // localStorage blocked (private mode) or corrupt value — fall back to defaults.
  }
  return null;
};

const writeStored = (storageKey: string, pos: DraggablePosition | null): void => {
  try {
    if (pos) {
      window.localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(pos));
    } else {
      window.localStorage.removeItem(STORAGE_PREFIX + storageKey);
    }
  } catch {
    // Ignore write failures — dragging still works for the current session.
  }
};

/**
 * Makes a fixed-position element draggable with mouse, touch and pen (Pointer Events),
 * clamps it inside the viewport, and remembers its last position per `storageKey`.
 *
 * While no custom position is stored the element keeps its default CSS positioning;
 * the first drag switches it to explicit top/left coordinates.
 */
export const useDraggable = ({
  storageKey,
  dragThreshold = 6,
  edgePadding = 8,
}: UseDraggableProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPosState] = useState<DraggablePosition | null>(() => readStored(storageKey));
  const [isDragging, setIsDragging] = useState(false);

  // Mirror of `pos` for synchronous reads inside event handlers.
  const posRef = useRef<DraggablePosition | null>(pos);
  const setPos = useCallback((next: DraggablePosition | null) => {
    posRef.current = next;
    setPosState(next);
  }, []);

  // The user's chosen (last-saved) coordinate, kept separate from the clamped value we
  // render. Viewport changes re-clamp from this intent instead of overwriting it, so the
  // saved spot never "creeps" as the mobile URL bar or rotation changes the viewport.
  const intendedPosRef = useRef<DraggablePosition | null>(posRef.current);

  // Live drag session state (not part of render).
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  // True between the end of a drag and the synthetic click it produces, so the
  // consumer can swallow that click (a drag must not also open the chat).
  const dragEndedRef = useRef(false);

  const clamp = useCallback(
    (x: number, y: number): DraggablePosition => {
      const el = ref.current;
      const width = el?.offsetWidth ?? 60;
      const height = el?.offsetHeight ?? 60;
      const maxX = Math.max(edgePadding, window.innerWidth - width - edgePadding);
      const maxY = Math.max(edgePadding, window.innerHeight - height - edgePadding);
      return {
        x: Math.min(Math.max(x, edgePadding), maxX),
        y: Math.min(Math.max(y, edgePadding), maxY),
      };
    },
    [edgePadding]
  );

  // Load the saved position for this screen/element, clamped to the current viewport so a
  // spot saved on a larger screen (or different orientation) still appears fully on-screen.
  useEffect(() => {
    const stored = readStored(storageKey);
    intendedPosRef.current = stored;
    setPos(stored ? clamp(stored.x, stored.y) : null);
  }, [storageKey, setPos, clamp]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    // Ignore a second concurrent pointer — one drag session at a time.
    if (drag.current) return;
    // Only start on primary button (mouse) / touch / pen.
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: rect.left,
      originY: rect.top,
      moved: false,
    };
    dragEndedRef.current = false;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // setPointerCapture unsupported — pointermove still works while over the element.
    }
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const session = drag.current;
      if (!session || session.pointerId !== e.pointerId) return;
      const dx = e.clientX - session.startX;
      const dy = e.clientY - session.startY;
      // Fingers jitter more than a mouse, so require more travel on touch before it
      // counts as a drag — a slightly imprecise tap still reliably opens the chat.
      const threshold = e.pointerType === 'mouse' ? dragThreshold : Math.max(dragThreshold, 10);
      if (!session.moved && Math.hypot(dx, dy) < threshold) return;
      if (!session.moved) {
        session.moved = true;
        setIsDragging(true);
      }
      e.preventDefault();
      setPos(clamp(session.originX + dx, session.originY + dy));
    },
    [clamp, dragThreshold, setPos]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const session = drag.current;
      if (!session || session.pointerId !== e.pointerId) return;
      try {
        ref.current?.releasePointerCapture(e.pointerId);
      } catch {
        // no-op
      }
      if (session.moved) {
        intendedPosRef.current = posRef.current;
        writeStored(storageKey, posRef.current);
        dragEndedRef.current = true;
        setIsDragging(false);
      }
      drag.current = null;
    },
    [storageKey]
  );

  // Keep the element on-screen when the viewport changes (resize / mobile rotate).
  // Re-clamp from the user's intended coordinate — never persist the clamped value, so a
  // temporarily smaller viewport (mobile URL bar, keyboard) doesn't ratchet the saved spot.
  useEffect(() => {
    const handleResize = () => {
      if (!intendedPosRef.current) return;
      setPos(clamp(intendedPosRef.current.x, intendedPosRef.current.y));
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [clamp, setPos]);

  /** Call from an onClickCapture handler: returns true (and clears the flag) if this click ended a drag. */
  const consumeClickAfterDrag = useCallback(() => {
    if (dragEndedRef.current) {
      dragEndedRef.current = false;
      return true;
    }
    return false;
  }, []);

  // Guards shared by both states: stop the browser from hijacking a press-and-drag as text
  // selection or an iOS image "Save/Copy" callout.
  const gestureGuards: React.CSSProperties = {
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
  };
  const style: React.CSSProperties = pos
    ? {
        top: pos.y,
        left: pos.x,
        right: 'auto',
        bottom: 'auto',
        transition: isDragging ? 'none' : 'top 0.15s ease, left 0.15s ease, opacity 0.2s ease',
        cursor: isDragging ? 'grabbing' : 'grab',
        ...gestureGuards,
      }
    : { cursor: 'grab', ...gestureGuards };

  const handlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };

  return { ref, style, handlers, isDragging, consumeClickAfterDrag };
};
