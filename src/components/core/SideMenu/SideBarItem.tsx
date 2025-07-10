import useRedirect from "../../../helpers/Routes/Redirect";
import { useSelector } from "react-redux";
import { RedirectPropTypes } from "../../../helpers/Types/Redirect";
import { Collapse, IconButton, List, ListItem, ListItemText, Tooltip, Typography } from "@material-ui/core";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
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
  subPage
}) => {
  const Redirect = useRedirect();
  const { isRTL } = useSelector((state: any) => state.core);

  const handleClick = (e: React.MouseEvent, isCollapseAction: boolean = false) => {
    e.preventDefault();

    if (item.href && !isCollapseAction) {
      Redirect({ url: item.href } as RedirectPropTypes);
    }
    else {
      if (item.options && item.options.length > 0) {
        toggleSubmenu && toggleSubmenu();
      } else {
        if (onItemClick) {
          onItemClick();
        }
        else {
          if (item.href) {
            Redirect({ url: item.href } as RedirectPropTypes);
          }
          if (item.onClick) {
            item.onClick();
          }
        }
      }
    }


  };

  const hasSubmenu = item.options && item.options.length > 0;

  const itemContent = (
    <ListItem
      button
      className={clsx(classes.sidebarItem, isActive && 'active')}
      style={{
        paddingLeft: level > 0 ? 32 + (level * 16) : !isRTL ? 8 : 16, paddingRight: level > 0 ? 32 + (level * 16) : isRTL ? 8 : 16
      }}
    >
      {(item?.iconUnicode || item?.icon) && <Typography
        onClick={((e: React.MouseEvent) => { handleClick(e, false) })}
        className={clsx(classes.phoneAppBarItemIcon, classes.sidebarItemIcon)}>
        {item?.iconUnicode || item?.icon}
      </Typography>}
      {!isCollapsed && (
        <>
          <ListItemText
            onClick={((e: React.MouseEvent) => { handleClick(e, false) })}
            style={{ paddingInlineStart: !item.iconUnicode && !item.icon ? 5 : 0 }}
            primary={item.title}
            className={classes.sidebarItemText}
          />
          {hasSubmenu && (
            <IconButton
              onClick={((e: React.MouseEvent) => { handleClick(e, true) })}
              size="small" style={{ color: '#ffffff' }}>
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
          title={item.title}
          placement="right"
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
                isActive={option.key === subPage || (option.key?.toLowerCase() === currentPage?.toLowerCase())}
                currentPage={currentPage}
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
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};


export default SidebarItem;