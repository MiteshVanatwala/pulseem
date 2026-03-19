import { Box, Button, ClickAwayListener, MenuItem, MenuList, Paper, Popper, Tooltip, IconButton } from "@material-ui/core";
import NotificationBell from "../../NotificationBell/NotificationBell";
import SettingsMenu from "./SettingsMenu";
import clsx from 'clsx';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { getCookie, setCookie } from "../../../helpers/Functions/cookies";
import { Language } from "../../../Models/SideMenuBar/SideMenuBarModel";
import { setLanguage } from "../../../redux/reducers/coreSlice";
import { BsGlobe2 } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import i18n from "../../../i18n";


const LanguageSelector: React.FC<{ classes: any }> = ({ classes }) => {
    const cookieData = getCookie('Culture');
    const { IsPoland } = useSelector((state: any) => state.common);
    let language = !!cookieData
        ? cookieData
        : (IsPoland ? 'en-US' : 'he-IL');
    if (language === 'he-IL' && IsPoland) language = 'pl-PL';

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    const languages: Language[] = [
        {
            title: "עברית",
            mobileTitle: 'עב',
            value: 'he-IL',
            isShow: true
        },
        {
            title: 'English',
            mobileTitle: 'EN',
            value: 'en-US',
            isShow: true
        },
        {
            title: 'Polski',
            mobileTitle: 'PL',
            value: 'pl-PL',
            isShow: true
        }
    ];

    if (IsPoland) {
        languages.shift();
    }

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setIsCollapsed(true)
    };

    const handleClose = () => {
        setIsCollapsed(false)
        setAnchorEl(null);
    };

    const changeLanguage = (option: Language) => {
        const { value } = option;
        const langSelected = value.split('-')[0];

        setCookie('Culture', value);
        i18n.changeLanguage(langSelected);
        dispatch(setLanguage(langSelected));
        handleClose();
    };

    const buttonContent = (
        <Button
            style={{ padding: 0, margin: 0, minWidth: 21, display: 'flex' }}
            onClick={handleClick}
            className={classes.languageSelector}
            fullWidth={!isCollapsed}
        >
            {/* @ts-ignore */}
            <BsGlobe2 style={{ fontSize: 21 }} />
            
        </Button>
    );

    return (
        <>
            {buttonContent}

            <Popper
                style={{ zIndex: 600 }}
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                placement="bottom"
                disablePortal
            >
                <ClickAwayListener onClickAway={handleClose}>
                    <Paper className={classes.languageSelector}>
                        <MenuList style={{ backgroundColor: '#fff' }}>
                            {languages.map((lang) => (
                                <MenuItem
                                    style={{ paddingInline: isCollapsed ? 15 : 15 }}
                                    key={lang.value}
                                    onClick={() => changeLanguage(lang)}
                                    selected={lang.value.toLowerCase() === language.toLowerCase()}
                                >
                                    {lang.title}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Paper>
                </ClickAwayListener>
            </Popper>
        </>
    );
};

interface TopMenuProps {
  classes: any;
  onMenuToggle?: () => void;
}

const TopMenu: React.FC<TopMenuProps> = ({ classes, onMenuToggle }) => {
    const { windowSize } = useSelector((state: any) => state.core);
    const isMobile = windowSize === 'xs' || windowSize === 'sm';

    return (
        <Box 
            className={clsx(isMobile ? classes.mobileTopMenu : classes.topMenu)}
        >
            {/* Mobile Hamburger Menu */}
            {isMobile && onMenuToggle && (
                <Box>
                    <IconButton
                        onClick={onMenuToggle}
                        style={{
                            padding: '8px',
                            color: '#333',
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </IconButton>
                </Box>
            )}
            
            {/* Mobile Logo/Title */}
            {isMobile && (
                <Box style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: '500', color: '#333' }}>
                        
                    </span>
                </Box>
            )}
            
            {/* Desktop/Mobile Right Side Items */}
            <Box className={clsx(isMobile ? classes.mobileRightItems : classes.desktopRightItems)}>
                <Box>
                    <NotificationBell classes={classes} />
                </Box>
                <Box className={classes.dFlex}>
                    <LanguageSelector classes={classes} />
                </Box>
                <Box>
                    <SettingsMenu classes={classes} />
                </Box>
            </Box>
        </Box>
    );
};

export default TopMenu;