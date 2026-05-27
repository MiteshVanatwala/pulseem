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


    const { accountSettings, accountFeatures, subAccount } = useSelector((state: any) => state.common);
    const {
        cameFromSubAccount,
        isRTL,
        isAdmin,
        isAllowSwitchAccount,
        userRoles
    } = useSelector((state: any) => state.core);
    const { username } = useSelector((state: any) => state.user);
    const buttonRef = useRef(null);

    const getAccountName = () => {
        if (accountSettings?.IsDirectAccount && subAccount?.DirectAccountCompanyName) {
            return subAccount.DirectAccountCompanyName;
        }
        return accountSettings?.SubAccountName || username;
    };

    const accountName = getAccountName();
    const displayAccountName = accountName && accountName.length > 20 ? `${accountName.slice(0, 20)}...` : accountName;

    const settings = getSettingsItem(
        t,
        '',
        (isAllowSwitchAccount && (isAllowSwitchAccount.toLowerCase() === 'true' || isAdmin !== '')),
        displayAccountName || t('Settings'),
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
        {!cameFromSubAccount && isAdmin !== '' && isAdmin !== 'True' && (
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
            {displayAccountName || t('Settings')}
        </Button>
        {showSettings && <Popper
            open={showSettings}
            anchorEl={buttonRef.current}
            role={undefined}
            placement={isRTL ? 'bottom-start' : 'bottom-end'}
            style={{ backgroundColor: '#fff', zIndex: 600, marginTop: 15 }}
            disablePortal className={classes.userSettingsContainerPopper}
        >
            <ClickAwayListener onClickAway={() => setShowSettings(false)}>
                <MenuList
                    style={{ padding: 0 }}>
                    {settings.options && settings.options.filter((item) => item.isShow !== false)
                        .map((option: any, index: any, row: any) => {

                            return <Box
                                key={index}
                                component='a'
                                className={clsx(classes.appBarItemMenuItem, classes.textLeft)}>
                                <MenuItem
                                    key={index}
                                    onClick={(e: any) => {
                                        e.preventDefault();
                                        if (option.onClick) {
                                            option.onClick();
                                        } else {
                                            Redirect({ url: option.href, openNewTab: option.openInNewWindow } as RedirectPropTypes)
                                        }
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