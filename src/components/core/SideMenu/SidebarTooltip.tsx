import React, { useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';

interface SidebarTooltipProps {
  title: React.ReactNode;
  placement?: 'right' | 'left' | 'bottom';
  children: React.ReactElement;
}

const GAP = 8;
const ARROW = 6;
const Y_NUDGE = 0;

const SidebarTooltip: React.FC<SidebarTooltipProps> = ({ title, placement = 'right', children }) => {
  const [pos, setPos] = useState<{ x: number; y: number; side: 'left' | 'right' } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    if (!title || !wrapperRef.current) return;
    const el = wrapperRef.current;
    const paper = el.closest('.MuiDrawer-paper');
    const pRect = paper?.getBoundingClientRect();

    if (placement === 'right' || placement === 'left') {
      const svgEl = el.querySelector('svg') as SVGElement | null;
      const rect = (svgEl ?? el).getBoundingClientRect();
      const y = rect.top + rect.height / 2 + Y_NUDGE;

      if (placement === 'right') {
        setPos({ x: (pRect ? pRect.right : rect.right) + GAP, y, side: 'left' });
      } else {
        setPos({ x: window.innerWidth - (pRect ? pRect.left : rect.left) + GAP, y, side: 'right' });
      }
    } else {
      const rect = el.getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2, y: rect.bottom + GAP, side: 'left' });
    }
  }, [title, placement]);

  const hide = useCallback(() => setPos(null), []);

  const isBottom = placement === 'bottom';
  const isLeft = placement === 'left';

  const boxStyle: React.CSSProperties | null = pos
    ? {
        position: 'fixed',
        ...(pos.side === 'left' ? { left: pos.x } : { right: pos.x }),
        top: pos.y,
        transform: isBottom ? 'translateX(-50%)' : 'translateY(-50%)',
        backgroundColor: '#333',
        color: '#fff',
        fontSize: '0.8rem',
        padding: '4px 10px',
        borderRadius: 4,
        whiteSpace: 'nowrap',
        zIndex: 99999,
        pointerEvents: 'none',
      }
    : null;

  const arrowStyle: React.CSSProperties = isBottom
    ? {
        position: 'absolute', width: 0, height: 0,
        bottom: '100%', left: '50%', transform: 'translateX(-50%)',
        borderLeft: `${ARROW}px solid transparent`,
        borderRight: `${ARROW}px solid transparent`,
        borderBottom: `${ARROW}px solid #333`,
      }
    : isLeft
    ? {
        position: 'absolute', width: 0, height: 0,
        left: '100%', top: '50%', transform: 'translateY(-50%)',
        borderTop: `${ARROW}px solid transparent`,
        borderBottom: `${ARROW}px solid transparent`,
        borderLeft: `${ARROW}px solid #333`,
      }
    : {
        position: 'absolute', width: 0, height: 0,
        right: '100%', top: '50%', transform: 'translateY(-50%)',
        borderTop: `${ARROW}px solid transparent`,
        borderBottom: `${ARROW}px solid transparent`,
        borderRight: `${ARROW}px solid #333`,
      };

  return (
    <>
      <div
        ref={wrapperRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        style={{ display: 'flex', alignSelf: 'center' }}
      >
        {children}
      </div>

      {pos && title && boxStyle && ReactDOM.createPortal(
        <div style={boxStyle}>
          <div style={arrowStyle} />
          {title}
        </div>,
        document.body,
      )}
    </>
  );
};

export default SidebarTooltip;
