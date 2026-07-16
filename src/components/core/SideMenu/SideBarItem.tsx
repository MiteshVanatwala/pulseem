import React, { useRef, useState, useCallback, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import useRedirect from "../../../helpers/Routes/Redirect";
import { useSelector } from "react-redux";
import { RedirectPropTypes } from "../../../helpers/Types/Redirect";
import { Collapse, IconButton, List, ListItem, ListItemText, Typography } from "@material-ui/core";
import { FaChevronDown, FaChevronUp, FaWhatsapp, FaRegWindowRestore } from "react-icons/fa";
import { MdPeople, MdMarkEmailRead, MdSms, MdSettings, MdNotificationsActive, MdAccountCircle, MdOutlineDashboardCustomize } from "react-icons/md";
import { BiPencil, BiSitemap } from "react-icons/bi";
import { FiZap, FiSmartphone, FiFileText, FiPieChart } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io";
import clsx from 'clsx';
import SidebarTooltip from "./SidebarTooltip";
import { getTooltipPortalRoot } from "../../../helpers/Functions/tooltipPortalRoot";

const ARROW = 6;
const GAP = 8;

interface SidebarItemProps {
  item: any;
  isCollapsed: boolean;
  isActive?: boolean;
  level?: number;
  classes: any;
  onItemClick?: () => void;
  showSubmenu?: boolean;
  toggleSubmenu?: () => void;
  currentPage: any;
  subPage: any;
  onIconClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isCollapsed,
  isActive = false,
  level = 0,
  classes,
  onItemClick,
  showSubmenu = false,
  toggleSubmenu,
  currentPage,
  subPage,
  onIconClick
}) => {
  const Redirect = useRedirect();
  const { isRTL } = useSelector((state: any) => state.core);

  const iconRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  // targetY = the exact viewport Y of the icon's vertical center we want the tooltip centered on.
  const [tooltipPos, setTooltipPos] = useState<{ x: number; targetY: number; side: 'left' | 'right' } | null>(null);
  // correctionY self-corrects for any transformed ancestor / containing-block offset.
  const [correctionY, setCorrectionY] = useState(0);

  const renderIcon = () => {
    if (item?.iconName === 'MdPeople') return <MdPeople size={28} />;
    if (item?.iconName === 'MdMarkEmailRead') return <MdMarkEmailRead size={28} />;
    if (item?.iconName === 'MdSms') return <MdSms size={28} />;
    if (item?.iconName === 'FaWhatsapp') return <FaWhatsapp size={28} />;
    if (item?.iconName === 'IoLogoWhatsapp') return <IoLogoWhatsapp size={28} />;
    if (item?.iconName === 'FiSmartphone') return <FiSmartphone size={28} />;
    if (item?.iconName === 'BiPencil') return <BiPencil size={28} />;
    if (item?.iconName === 'FiZap') return <FiZap size={28} />;
    if (item?.iconName === 'MdSettings') return <MdSettings size={28} />;
    if (item?.iconName === 'BiSitemap') return <BiSitemap size={24} />;
    if (item?.iconName === 'FaRegWindowRestore') return <FaRegWindowRestore size={24} />;
    if (item?.iconName === 'FiFileText') return <FiFileText size={24} />;
    if (item?.iconName === 'MdNotificationsActive') return <MdNotificationsActive size={28} />;
    if (item?.iconName === 'FiPieChart') return <FiPieChart size={24} />;
    if (item?.iconName === 'MdAccountCircle') return <MdAccountCircle size={28} />;
    if (item?.iconName === 'MdOutlineDashboardCustomize') return <MdOutlineDashboardCustomize size={28} />;
    return null;
  };

  const iconElement = renderIcon();

  const handleIconMouseEnter = useCallback(() => {
    if (!isCollapsed || !iconRef.current || typeof item.title !== 'string') return;
    const el = iconRef.current;
    const rect = el.getBoundingClientRect();
    const paper = el.closest('.MuiDrawer-paper');
    const pRect = paper?.getBoundingClientRect();
    const targetY = rect.top + rect.height / 2;
    if (isRTL) {
      setTooltipPos({ x: window.innerWidth - (pRect ? pRect.left : rect.left) + GAP, targetY, side: 'right' });
    } else {
      setTooltipPos({ x: (pRect ? pRect.right : rect.right) + GAP, targetY, side: 'left' });
    }
  }, [isCollapsed, isRTL, item.title]);

  const handleIconMouseLeave = useCallback(() => setTooltipPos(null), []);

  // After the tooltip renders, measure its true vertical center and snap it onto the icon center.
  // This compensates for any transformed ancestor that would otherwise offset a position:fixed element.
  useLayoutEffect(() => {
    if (!tooltipPos || !tooltipRef.current) return;
    const r = tooltipRef.current.getBoundingClientRect();
    const actualCenter = r.top + r.height / 2;
    const delta = tooltipPos.targetY - actualCenter;
    if (Math.abs(delta) > 0.5) {
      setCorrectionY((c) => c + delta);
    }
  }, [tooltipPos]);

  const handleClick = (e: React.MouseEvent, _isCollapseAction: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();

    if (item.options && item.options.length > 0) {
      toggleSubmenu && toggleSubmenu();
    } else {
      if (onItemClick) {
        onItemClick();
      } else {
        if (item.href) Redirect({ url: item.href } as RedirectPropTypes);
        if (item.onClick) item.onClick();
      }
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCollapsed && onIconClick) {
      onIconClick();
    } else {
      handleClick(e, false);
    }
  };

  const hasSubmenu = item.options && item.options.length > 0;

  const iconContainerElement = (item?.iconUnicode || item?.icon || item?.iconName) ? (
    iconElement ? (
      <div
        ref={iconRef as React.Ref<HTMLDivElement>}
        className={clsx(classes.phoneAppBarItemIcon, classes.sidebarItemIcon)}
        onClick={handleIconClick}
        onMouseEnter={handleIconMouseEnter}
        onMouseLeave={handleIconMouseLeave}
      >
        {iconElement}
      </div>
    ) : (
      <Typography
        ref={iconRef as any}
        onClick={handleIconClick}
        onMouseEnter={handleIconMouseEnter}
        onMouseLeave={handleIconMouseLeave}
        className={clsx(classes.phoneAppBarItemIcon, classes.sidebarItemIcon)}
      >
        {item?.iconUnicode || item?.icon}
      </Typography>
    )
  ) : null;

  const itemTextElement = (
    <ListItemText
      onClick={((e: React.MouseEvent) => { handleClick(e, false) })}
      style={{ paddingInlineStart: !item.iconUnicode && !item.icon && !item.iconName ? 5 : 0 }}
      primary={item.title}
      className={classes.sidebarItemText}
    />
  );

  const tooltipPortal = tooltipPos ? ReactDOM.createPortal(
    <div
      ref={tooltipRef}
      style={{
        position: 'fixed',
        ...(tooltipPos.side === 'left' ? { left: tooltipPos.x } : { right: tooltipPos.x }),
        top: tooltipPos.targetY + correctionY,
        transform: 'translateY(-50%)',
        backgroundColor: '#333',
        color: '#fff',
        fontSize: '0.8rem',
        padding: '4px 10px',
        borderRadius: 4,
        whiteSpace: 'nowrap',
        zIndex: 99999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          ...(tooltipPos.side === 'left'
            ? {
              right: '100%',
              borderTop: `${ARROW}px solid transparent`,
              borderBottom: `${ARROW}px solid transparent`,
              borderRight: `${ARROW}px solid #333`,
            }
            : {
              left: '100%',
              borderTop: `${ARROW}px solid transparent`,
              borderBottom: `${ARROW}px solid transparent`,
              borderLeft: `${ARROW}px solid #333`,
            }),
        }}
      />
      {item.title}
    </div>,
    getTooltipPortalRoot()
  ) : null;

  const itemContent = (
    <ListItem
      button
      component={item.href && !hasSubmenu ? 'a' : 'div'}
      href={item.href && !hasSubmenu ? item.href : undefined}
      className={clsx(classes.sidebarItem, isActive && 'active')}
      style={{
        paddingLeft: level > 0 ? undefined : (!isRTL ? 8 : 16),
        paddingRight: level > 0 ? undefined : (isRTL ? 8 : 16),
        marginBottom: hasSubmenu && showSubmenu ? 0 : undefined
      }}
      onClick={((e: React.MouseEvent) => { handleClick(e, false) })}
    >
      {iconContainerElement}
      {!isCollapsed && (
        <>
          {level > 0 && typeof item.title === 'string' ? (
            <SidebarTooltip title={item.title} placement={isRTL ? 'left' : 'right'} fillWidth>
              {itemTextElement}
            </SidebarTooltip>
          ) : itemTextElement}
          {hasSubmenu && (
            <IconButton
              onClick={((e: React.MouseEvent) => { handleClick(e, true) })}
              size="small" style={{ color: '#ffffff', width: 30, height: 30 }}>
              {/* @ts-ignore */}
              {showSubmenu ? <FaChevronUp /> : <FaChevronDown />}
            </IconButton>
          )}
        </>
      )}
    </ListItem>
  );

  return (
    <>
      {itemContent}
      {tooltipPortal}

      {hasSubmenu && !isCollapsed && (
        <Collapse in={showSubmenu} timeout="auto" unmountOnExit>
          <List className={classes.sidebarSubmenu} style={{ paddingTop: 0, paddingBottom: 0 }}>
            {item.options && item.options.filter((option: any) => option.isShow !== false).map((option: any, index: number) => (
              <SidebarItem
                isActive={option.key === subPage}
                currentPage={null}
                subPage={subPage}
                key={`${option.key || 'item'}-${index}`}
                item={option}
                isCollapsed={false}
                level={level + 1}
                classes={classes}
                onItemClick={() => {
                  if (option.href) {
                    Redirect({ url: option.href, openNewTab: option.openInNewWindow } as RedirectPropTypes);
                  } else if (option.onClick) {
                    option.onClick();
                  }
                }}
                onIconClick={onIconClick}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export default SidebarItem;
