import { useTranslation } from "react-i18next";
import { getSettingsItem } from "../../../helpers/Routes/routes";
import { get } from "lodash";
import { useSelector } from "react-redux";
import { useState } from "react";
import { Box, Button, Collapse, ListItem, ListItemText, MenuItem, MenuList } from "@material-ui/core";
import clsx from 'clsx';
import useRedirect from "../../../helpers/Routes/Redirect";
import { RedirectPropTypes } from "../../../helpers/Types/Redirect";
import { FaUserCircle, FaCog } from "react-icons/fa";

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

    const returnToMainAccount = () => {
        window.location.href = '/Pulseem/ReactRedirect.aspx?fromreact=true';
    };

    return <Box>
        {/* Return to main account button */}
        {cameFromSubAccount && (
            <Button
                onClick={returnToMainAccount}
                className={classes.languageSelector}
            >
                {t('appBar.returnToMainAccount')}
            </Button>
        )}
        <ListItem
            button
            className={classes.sidebarItem}
            style={{
                paddingLeft: !isRTL ? 8 : 16,
                paddingRight: isRTL ? 8 : 16,
            }}
            onClick={() => {
                setShowSettings(!showSettings)
            }}
        >
            <div className={clsx(classes.phoneAppBarItemIcon, classes.sidebarItemIcon)}>
                <FaUserCircle size={24} />
            </div>
            <ListItemText
                primary={displayAccountName}
                className={classes.sidebarItemText}
            />
            <FaCog style={{ fontSize: 18, opacity: 0.85, marginInlineEnd: 8, flexShrink: 0, transform: showSettings ? 'rotate(180deg) scale(1.1)' : 'rotate(0deg) scale(1)', transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
        </ListItem>

        <Collapse in={showSettings} timeout='auto' unmountOnExit>
            <MenuList className={classes.sidebarSubmenu} style={{ padding: '6px 4px' }}>
                {settings.options && settings.options.filter((item) => item.isShow !== false)
                    .map((option: any, index: any) => {
                        const isLogout = option.title === t("appBar.logout");
                        return (
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
                                style={{
                                    color: '#ffffff',
                                    fontSize: '0.86rem',
                                    padding: '8px 12px',
                                    fontFamily: 'Assistant, sans-serif',
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    backgroundColor: 'transparent',
                                    transition: 'all 0.2s ease',
                                    borderLeft: '3px solid transparent'
                                }}
                                onMouseEnter={(e: any) => {
                                    e.currentTarget.style.backgroundColor = isLogout ? 'rgba(255, 23, 68, 0.25)' : 'rgba(255, 255, 255, 0.15)';
                                    e.currentTarget.style.borderLeft = isLogout ? '3px solid #FF8A80' : '3px solid #ffffff';
                                }}
                                onMouseLeave={(e: any) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderLeft = '3px solid transparent';
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    {option?.title}
                                    {isLogout && <option.iconSrc style={{ padding: '0 5px', marginInlineStart: 'auto', color: '#ffffff' }} />}
                                </span>
                            </MenuItem>
                        );
                    })
                }
            </MenuList>
        </Collapse>
    </Box>
}

export default SettingsMenu;