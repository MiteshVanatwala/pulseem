import React, { useState, useRef, useCallback, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { getTooltipPortalRoot } from '../../../helpers/Functions/tooltipPortalRoot';

interface SidebarTooltipProps {
  title: React.ReactNode;
  placement?: 'right' | 'left' | 'bottom';
  children: React.ReactElement;
  // Stretch the wrapper to fill the remaining width of its flex parent, instead
  // of shrinking to the content's own size. Needed when wrapping a truncatable
  // text label (e.g. a submenu row); leave unset when wrapping a fixed-size
  // icon/button so it keeps its parent's centering.
  fillWidth?: boolean;
}

const GAP = 8;
const ARROW = 6;

// pos.center = the viewport coordinate (X for bottom, Y for left/right) the tooltip must be centered on.
// pos.edge   = the fixed coordinate on the other axis (top for bottom; left/right edge for sides).
interface TooltipPos {
  center: number;
  edge: number;
  side: 'left' | 'right';
}

const SidebarTooltip: React.FC<SidebarTooltipProps> = ({ title, placement = 'right', children, fillWidth = false }) => {
  const [pos, setPos] = useState<TooltipPos | null>(null);
  const [correction, setCorrection] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const isBottom = placement === 'bottom';
  const isLeft = placement === 'left';

  const show = useCallback(() => {
    if (!title || !wrapperRef.current) return;
    const el = wrapperRef.current;
    const paper = el.closest('.MuiDrawer-paper');
    const pRect = paper?.getBoundingClientRect();

    if (placement === 'right' || placement === 'left') {
      const listItem = el.closest('.MuiListItem-root') as HTMLElement | null;
      const svgEl = el.querySelector('svg') as SVGElement | null;
      const measureEl = listItem ?? svgEl ?? el;
      const rect = measureEl.getBoundingClientRect();
      const center = rect.top + rect.height / 2;

      if (placement === 'right') {
        setPos({ center, edge: (pRect ? pRect.right : rect.right) + GAP, side: 'left' });
      } else {
        setPos({ center, edge: window.innerWidth - (pRect ? pRect.left : rect.left) + GAP, side: 'right' });
      }
    } else {
      const rect = el.getBoundingClientRect();
      setPos({ center: rect.left + rect.width / 2, edge: rect.bottom + GAP, side: 'left' });
    }
  }, [title, placement]);

  const hide = useCallback(() => setPos(null), []);

  // After render, measure the tooltip's true center on the centering axis and snap it onto the target.
  // Corrects for any transformed ancestor that offsets a position:fixed element.
  useLayoutEffect(() => {
    if (!pos || !tooltipRef.current) return;
    const r = tooltipRef.current.getBoundingClientRect();
    const actualCenter = isBottom ? r.left + r.width / 2 : r.top + r.height / 2;
    const delta = pos.center - actualCenter;
    if (Math.abs(delta) > 0.5) {
      setCorrection((c) => c + delta);
    }
  }, [pos, isBottom]);

  const boxStyle: React.CSSProperties | null = pos
    ? isBottom
      ? {
          position: 'fixed',
          left: pos.center + correction,
          top: pos.edge,
          transform: 'translateX(-50%)',
          backgroundColor: '#333', color: '#fff', fontSize: '0.84rem',
          padding: '4.2px 10.5px', borderRadius: 4, whiteSpace: 'nowrap',
          zIndex: 99999, pointerEvents: 'none',
        }
      : {
          position: 'fixed',
          ...(pos.side === 'left' ? { left: pos.edge } : { right: pos.edge }),
          top: pos.center + correction,
          transform: 'translateY(-50%)',
          backgroundColor: '#333', color: '#fff', fontSize: '0.84rem',
          padding: '4.2px 10.5px', borderRadius: 4, whiteSpace: 'nowrap',
          zIndex: 99999, pointerEvents: 'none',
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
        style={fillWidth
          ? { display: 'flex', alignSelf: 'center', flex: 1, minWidth: 0, overflow: 'hidden' }
          : { display: 'flex', alignSelf: 'center' }}
      >
        {children}
      </div>

      {pos && title && boxStyle && ReactDOM.createPortal(
        <div ref={tooltipRef} style={boxStyle}>
          <div style={arrowStyle} />
          {title}
        </div>,
        getTooltipPortalRoot(),
      )}
    </>
  );
};

export default SidebarTooltip;
