import { useTranslation } from "react-i18next";
import { getSettingsItem } from "../../../helpers/Routes/routes";
import { get } from "lodash";
import { useSelector } from "react-redux";
import SidebarItem from "../SideMenu/SideBarItem";
import { useRef, useState } from "react";
import { Box, Button, ClickAwayListener, MenuItem, MenuList, Paper, Popper } from "@material-ui/core";
import clsx from 'clsx';
import useRedirect from "../../../helpers/Routes/Redirect";
import { RedirectPropTypes } from "../../../helpers/Types/Redirect";
import { IoIosArrowDown } from "react-icons/io";

const SettingsMenu = (classes: any) => {
    const { t } = useTranslation();
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const Redirect = useRedirect();

    const { accountSettings, accountFeatures, subAccount } = useSelector((state: any) => state.common);
    const {
        windowSize,
        isRTL,
        isAdmin,
        isAllowSwitchAccount,
        userRoles
    } = useSelector((state: any) => state.core);
    const { username } = useSelector((state: any) => state.user);
    const buttonRef = useRef(null);

    const settings = getSettingsItem(
        t,
        '',
        (isAllowSwitchAccount && (isAllowSwitchAccount.toLowerCase() === 'true' || isAdmin !== '')),
        username.length > 20 ? `${username.slice(0, 20)}...` : username,
        isRTL,
        accountSettings,
        accountFeatures,
        get(subAccount, 'CompanyAdmin', false),
        userRoles
    );

    console.log(settings);

    return <div className={classes.sidebarFooter}>
        <Button onClick={() => { setShowSettings(!showSettings) }}
            style={{ padding: 0 }}
            endIcon={<IoIosArrowDown />}
            ref={buttonRef}>
            {username}
        </Button>
        {showSettings && <Popper
            open={showSettings}
            anchorEl={buttonRef.current}
            role={undefined}
            placement={'bottom'}
            style={{ backgroundColor: '#fff', zIndex: 600 }}
            disablePortal className={classes.notificationUpdateContainerPopper}>
            <ClickAwayListener onClickAway={() => setShowSettings(false)}>
                <MenuList
                    style={{ padding: 0 }}>
                    {settings.options && settings.options.filter((item) => item.isShow !== false)
                        .map((option: any, index: any, row: any) => {
                            console.log(option);
                            return <Box
                                key={index}
                                component='a'
                                className={clsx(classes.appBarItemMenuItem, classes.textLeft)}>
                                <MenuItem
                                    key={index}
                                    onClick={(e: any) => {
                                        e.preventDefault();
                                        Redirect({ url: option.href, openNewTab: option.openInNewWindow } as RedirectPropTypes)
                                    }}
                                    classes={{ root: classes.appBarItemMenuRoot }}
                                    className={clsx(classes.appBarItemMenuItem, index !== row.length - 1 ? classes.appBarItemBorder : '', option.title === t("appBar.logout") ? 'active' : '')}
                                >
                                    {option?.title}
                                    {
                                        option.title === t("appBar.logout") && <option.iconSrc style={{ padding: '0 5px', marginInlineStart: 'auto', color: '#fff' }} />
                                    }
                                </MenuItem>
                            </Box>
                        })
                    }
                </MenuList>
            </ClickAwayListener>
        </Popper>}
    </div>
}

export default SettingsMenu;