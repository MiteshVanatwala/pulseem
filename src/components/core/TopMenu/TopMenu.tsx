import { Box, Button, ClickAwayListener, MenuItem, MenuList, Paper, Popper, Tooltip } from "@material-ui/core";
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

const TopMenu = ({ classes }: any) => {
    return <Box className={clsx(classes.topMenu, classes.flexEnd)}>
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
}

export default TopMenu;