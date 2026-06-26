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
import SidebarTooltip from './SidebarTooltip';

interface SidebarItemProps {
  item: any;
  isCollapsed: boolean;
  isActive?: boolean;
  level?: number;
  classes: any;
  onItemClick?: () => void;
  showSubmenu?: boolean;
  toggleSubmenu?: () => void;
  currentPage: any; // passed through to sub-items only
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
        className={clsx(classes.phoneAppBarItemIcon, classes.sidebarItemIcon)}
        onClick={handleIconClick}
      >
        {iconElement}
      </div>
    ) : (
      <Typography
        onClick={handleIconClick}
        className={clsx(classes.phoneAppBarItemIcon, classes.sidebarItemIcon)}
      >
        {item?.iconUnicode || item?.icon}
      </Typography>
    )
  ) : null;

  const wrappedIcon = isCollapsed && typeof item.title === 'string' && iconContainerElement ? (
    <SidebarTooltip title={item.title} placement={isRTL ? 'left' : 'right'}>
      {iconContainerElement}
    </SidebarTooltip>
  ) : iconContainerElement;

  const itemContent = (
    <ListItem
      button
      className={clsx(classes.sidebarItem, isActive && 'active')}
      style={{
        paddingLeft: level > 0 ? undefined : (!isRTL ? 8 : 16),
        paddingRight: level > 0 ? undefined : (isRTL ? 8 : 16),
        marginBottom: hasSubmenu && showSubmenu ? 0 : undefined
      }}
      onClick={((e: React.MouseEvent) => { handleClick(e, false) })}
    >
      {wrappedIcon}
      {!isCollapsed && (
        <>
          <ListItemText
            onClick={((e: React.MouseEvent) => { handleClick(e, false) })}
            style={{ paddingInlineStart: !item.iconUnicode && !item.icon && !item.iconName ? 5 : 0 }}
            primary={item.title}
            className={classes.sidebarItemText}
          />
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
