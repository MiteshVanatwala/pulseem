import { useTranslation } from "react-i18next";
import { getSettingsItem } from "../../../helpers/Routes/routes";
import { get } from "lodash";
import { useSelector } from "react-redux";
import { useRef, useState } from "react";
import { Box, Button, ClickAwayListener, MenuItem, MenuList, Popper } from "@material-ui/core";
import clsx from 'clsx';
import useRedirect from "../../../helpers/Routes/Redirect";
import { RedirectPropTypes } from "../../../helpers/Types/Redirect";
import { FaUserCircle } from "react-icons/fa";

const SettingsMenu = ({ classes }: any) => {
    const { t } = useTranslation();
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const Redirect = useRedirect();

    console.log(classes.userSettings);

    const { accountSettings, accountFeatures, subAccount } = useSelector((state: any) => state.common);
    const {
        cameFromSubAccount,
        isRTL,
        isAdmin,
        isAllowSwitchAccount,
        userRoles
    } = useSelector((state: any) => state.core);
    // const { username } = useSelector((state: any) => state.user);
    const username = 'Ya Yuda122Ya Yuda122Ya Yuda122Ya Yuda122Ya Yuda122Ya Yuda122Ya Yuda122Ya Yuda122Ya Yuda122Ya Yuda122Ya Yuda122Ya Yuda122'
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

    const returnToAdmin = () => {
        window.location.href = '/Pulseem/ReactRedirect.aspx';
    };

    const returnToMainAccount = () => {
        window.location.href = '/Pulseem/ReactRedirect.aspx?fromreact=true';
    };

    return <Box>
        {/* Admin/Return buttons */}
        {!cameFromSubAccount && isAdmin !== '' && (
            <Button
                onClick={returnToAdmin}
                className={classes.languageSelector}
            >
                {t('appBar.admin')}
            </Button>
        )}
        {cameFromSubAccount && (
            <Button
                onClick={returnToMainAccount}
                className={classes.languageSelector}
            >
                {t('appBar.returnToMainAccount')}
            </Button>
        )}
        <Button
            ref={buttonRef}
            style={{ padding: 0 }}
            onClick={() => {
                setShowSettings(!showSettings)
            }}
            startIcon={<FaUserCircle style={{ fontSize: 23 }} />}
            className={classes.userSettings}
        >
            {username.length > 20 ? `${username.substring(0, 20)}...` : username}
        </Button>
        {showSettings && <Popper
            open={showSettings}
            anchorEl={buttonRef.current}
            role={undefined}
            placement={'bottom-start'}
            style={{ backgroundColor: '#fff', zIndex: 600, marginTop: 15 }}
            disablePortal className={classes.userSettingsContainerPopper}
        >
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
                                    className={clsx(option.title === t("appBar.logout") && classes.lastItemBorderRadius, classes.appBarItemMenuItem, index !== row.length - 1 ? classes.appBarItemBorder : '', option.title === t("appBar.logout") ? 'active' : '')}
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
    </Box>
}

export default SettingsMenu;