import useRedirect from "../../../helpers/Routes/Redirect";
import { useSelector } from "react-redux";
import { RedirectPropTypes } from "../../../helpers/Types/Redirect";
import { Collapse, IconButton, List, ListItem, ListItemText, Tooltip, Typography } from "@material-ui/core";
import { FaChevronDown, FaChevronUp, FaWhatsapp, FaRegWindowRestore } from "react-icons/fa";
import { MdPeople, MdMarkEmailRead, MdSms, MdSettings, MdNotificationsActive, MdAccountCircle } from "react-icons/md";
import { BiPencil, BiSitemap } from "react-icons/bi";
import { FiZap, FiSmartphone, FiFileText, FiPieChart } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io";
import clsx from 'clsx';

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

  const renderIcon = () => {
    if (item?.iconName === 'MdPeople') {
      // @ts-ignore
      return <MdPeople size={28} />;
    }
    if (item?.iconName === 'MdMarkEmailRead') {
      // @ts-ignore
      return <MdMarkEmailRead size={28} />;
    }
    if (item?.iconName === 'MdSms') {
      // @ts-ignore
      return <MdSms size={28} />;
    }
    if (item?.iconName === 'FaWhatsapp') {
      // @ts-ignore
      return <FaWhatsapp size={28} />;
    }
    if (item?.iconName === 'IoLogoWhatsapp') {
      // @ts-ignore
      return <IoLogoWhatsapp size={28} />;
    }
    if (item?.iconName === 'FiSmartphone') {
      // @ts-ignore
      return <FiSmartphone size={28} />;
    }
    if (item?.iconName === 'BiPencil') {
      // @ts-ignore
      return <BiPencil size={28} />;
    }

    if (item?.iconName === 'FiZap') {
      // @ts-ignore
      return <FiZap size={28} />;
    }
    if (item?.iconName === 'MdSettings') {
      // @ts-ignore
      return <MdSettings size={28} />;
    }
    if (item?.iconName === 'BiSitemap') {
      // @ts-ignore
      return <BiSitemap size={24} />;
    }
    if (item?.iconName === 'FaRegWindowRestore') {
      // @ts-ignore
      return <FaRegWindowRestore size={24} />;
    }
    if (item?.iconName === 'FiFileText') {
      // @ts-ignore
      return <FiFileText size={24} />;
    }
    if (item?.iconName === 'MdNotificationsActive') {
      // @ts-ignore
      return <MdNotificationsActive size={28} />;
    }
    if (item?.iconName === 'FiPieChart') {
      // @ts-ignore
      return <FiPieChart size={24} />;
    }
    if (item?.iconName === 'MdAccountCircle') {
      // @ts-ignore
      return <MdAccountCircle size={28} />;
    }
    return null;
  };

  const iconElement = renderIcon();

  const handleClick = (e: React.MouseEvent, isCollapseAction: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();

    if (item.options && item.options.length > 0) {
      toggleSubmenu && toggleSubmenu();
    } else {
      if (onItemClick) {
        onItemClick();
      } else {
        if (item.href) {
          Redirect({ url: item.href } as RedirectPropTypes);
        }
        if (item.onClick) {
          item.onClick();
        }
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
      {(item?.iconUnicode || item?.icon || item?.iconName) && (
        iconElement ? (
          <div className={clsx(classes.phoneAppBarItemIcon, classes.sidebarItemIcon)} onClick={handleIconClick}>
            {iconElement}
          </div>
        ) : (
          <Typography
            onClick={handleIconClick}
            className={clsx(classes.phoneAppBarItemIcon, classes.sidebarItemIcon)}>
            {item?.iconUnicode || item?.icon}
          </Typography>
        )
      )}
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
      {isCollapsed && typeof item.title === 'string' ? (
        <Tooltip
          arrow
          title={item.title}
          placement={isRTL ? "left" : "right"}
          classes={{ tooltip: classes.tooltip }}
        >
          {itemContent}
        </Tooltip>
      ) : (
        itemContent
      )}

      {hasSubmenu && !isCollapsed && (
        <Collapse in={showSubmenu} timeout="auto" unmountOnExit>
          <List className={classes.sidebarSubmenu} style={{ paddingTop: 0, paddingBottom: 0, }}>
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