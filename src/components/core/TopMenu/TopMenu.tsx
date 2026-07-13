import { Box, Button, ClickAwayListener, MenuItem, MenuList, Paper, Popper, IconButton } from "@material-ui/core";
import NotificationBell from "../../NotificationBell/NotificationBell";
import clsx from 'clsx';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { getCookie, setCookie } from "../../../helpers/Functions/cookies";
import { Language } from "../../../Models/SideMenuBar/SideMenuBarModel";
import { setLanguage } from "../../../redux/reducers/coreSlice";
import { BsGlobe2 } from "react-icons/bs";
import { MdSupportAgent } from 'react-icons/md';
import { toggleHelpDrawer } from "../../../redux/reducers/helpDrawerSlice";
import i18n from "../../../i18n";
import SidebarTooltip from '../SideMenu/SidebarTooltip';


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
                style={{ zIndex: 99999 }}
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                placement="bottom"
            >
                <ClickAwayListener onClickAway={handleClose}>
                    <Paper className={classes.languageSelector}>
                        <MenuList style={{ backgroundColor: '#fff', padding: 0 }}>
                            {languages.map((lang) => (
                                <MenuItem
                                    style={{ paddingInline: 20, paddingBlock: 12, minWidth: 140 }}
                                    key={lang.value}
                                    onClick={() => changeLanguage(lang)}
                                    selected={lang.value.toLowerCase() === language.toLowerCase()}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 500 }}>{lang.title}</span>
                                        <span style={{ color: '#888', fontSize: '0.85em', fontWeight: 600, marginLeft: 20 }}>{lang.mobileTitle}</span>
                                    </div>
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Paper>
                </ClickAwayListener>
            </Popper>
        </>
    );
};

export interface TopMenuProps {
    classes: any;
    onMenuToggle?: () => void;
}

const TopMenu: React.FC<TopMenuProps> = ({ classes, onMenuToggle }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { windowSize, cameFromSubAccount, isAdmin } = useSelector((state: any) => state.core);
    const isMobile = windowSize === 'xs' || windowSize === 'sm' || windowSize === 'md';
    const showBackToAdmin = !cameFromSubAccount && isAdmin !== '' && isAdmin !== 'True';

    const returnToAdmin = () => {
        window.location.href = '/Pulseem/ReactRedirect.aspx';
    };

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
                {showBackToAdmin && (
                    <Box>
                        <Button onClick={returnToAdmin} className={classes.backToAdminButton}>
                            {t('appBar.backToAdmin')}
                        </Button>
                    </Box>
                )}
                <Box>
                    <SidebarTooltip
                        title={t('dashboard.helpDrawer.support.helpCenter.title')}
                        placement="bottom"
                    >
                        <IconButton
                            size="small"
                            className={clsx(classes.noPadding)}
                            onClick={() => {
                                dispatch(toggleHelpDrawer());
                            }}
                        >
                            <MdSupportAgent style={{ fontSize: 26, color: '#000' }} />
                        </IconButton>
                    </SidebarTooltip>
                </Box>
                <Box>
                    <NotificationBell classes={classes} />
                </Box>
                <Box className={classes.dFlex}>
                    <LanguageSelector classes={classes} />
                </Box>
            </Box>
        </Box>
    );
};

export default TopMenu;
