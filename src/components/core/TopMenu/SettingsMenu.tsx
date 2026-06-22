import { useTranslation } from "react-i18next";
import { getSettingsItem } from "../../../helpers/Routes/routes";
import { get } from "lodash";
import { useSelector } from "react-redux";
import { useRef, useState } from "react";
import { Box, Button, ClickAwayListener, MenuItem, MenuList, Popper, Paper } from "@material-ui/core";
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
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                margin: '8px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 600,
                wordBreak: 'break-word',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                textTransform: 'none',
                width: 'calc(100% - 32px)',
                justifyContent: 'flex-start',
                transition: 'all 0.3s ease'
            }}
            onClick={() => {
                setShowSettings(!showSettings)
            }}
        >
            <FaUserCircle style={{ fontSize: 20, marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0, opacity: 0.9 }} />
            <span style={{ flex: 1, textAlign: isRTL ? 'right' : 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayAccountName}</span>
            <FaCog style={{ fontSize: 16, opacity: 0.8, transform: showSettings ? 'rotate(180deg) scale(1.1)' : 'rotate(0deg) scale(1)', transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
        </Button>

        {showSettings && <Popper
            open={showSettings}
            anchorEl={buttonRef.current}
            role={undefined}
            placement={isRTL ? 'left-start' : 'right-start'}
            style={{ zIndex: 99999 }}
            modifiers={{
                offset: {
                    enabled: true,
                    offset: '0, 16'
                },
                preventOverflow: {
                    enabled: false
                },
                flip: {
                    enabled: false
                }
            }}
        >
            <ClickAwayListener onClickAway={() => setShowSettings(false)}>
                <div>
                    <Paper style={{
                        position: 'relative',
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 10px 24px rgba(0, 0, 0, 0.12))',
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        minWidth: '180px',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        borderTop: '4px solid #FF1744',
                        animation: 'floatUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        transformOrigin: isRTL ? 'top right' : 'top left',
                    }}>
                        <Box
                            style={{
                                position: 'absolute',
                                top: '24px',
                                right: isRTL ? '-6px' : undefined,
                                left: !isRTL ? '-6px' : undefined,
                                width: '12px',
                                height: '12px',
                                backgroundColor: '#ffffff',
                                transform: 'rotate(45deg)',
                                borderTop: isRTL ? '1px solid rgba(0,0,0,0.05)' : 'none',
                                borderRight: isRTL ? '1px solid rgba(0,0,0,0.05)' : 'none',
                                borderBottom: !isRTL ? '1px solid rgba(0,0,0,0.05)' : 'none',
                                borderLeft: !isRTL ? '1px solid rgba(0,0,0,0.05)' : 'none',
                                zIndex: -1,
                            }}
                        />
                            <style>
                                {`
                        @keyframes floatUp {
                            0% { opacity: 0; transform: translateY(-10px) scale(0.95); }
                            100% { opacity: 1; transform: translateY(0) scale(1); }
                        }
                        @keyframes slideText {
                            0% { opacity: 0; transform: translateX(-6px); }
                            100% { opacity: 1; transform: translateX(0); }
                        }
                        `}
                            </style>
                            <MenuList style={{ padding: '6px 4px' }}>
                                {settings.options && settings.options.filter((item) => item.isShow !== false)
                                    .map((option: any, index: any, row: any) => {
                                        const isLogout = option.title === t("appBar.logout");
                                        return (
                                            <Box
                                                key={index}
                                                component='a'
                                                style={{ textDecoration: 'none', display: 'block', padding: '0' }}
                                            >
                                                <MenuItem
                                                    onClick={(e: any) => {
                                                        e.preventDefault();
                                                        if (option.onClick) {
                                                            option.onClick();
                                                        } else {
                                                            Redirect({ url: option.href, openNewTab: option.openInNewWindow } as RedirectPropTypes)
                                                        }
                                                    }}
                                                    style={{
                                                        color: isLogout ? '#FF1744' : '#424242',
                                                        fontSize: '0.86rem',
                                                        padding: '8px 12px',
                                                        fontFamily: 'Assistant, sans-serif',
                                                        fontWeight: 600,
                                                        borderRadius: '6px',
                                                        backgroundColor: 'transparent',
                                                        transition: 'all 0.2s ease',
                                                        opacity: 0,
                                                        animation: `slideText 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
                                                        animationDelay: `${0.03 + (index * 0.03)}s`,
                                                        borderLeft: '3px solid transparent'
                                                    }}
                                                    onMouseEnter={(e: any) => {
                                                        e.currentTarget.style.backgroundColor = isLogout ? 'rgba(255, 23, 68, 0.08)' : 'rgba(0, 0, 0, 0.03)';
                                                        e.currentTarget.style.color = isLogout ? '#D50000' : '#1A1A1A';
                                                        e.currentTarget.style.borderLeft = isLogout ? '3px solid #D50000' : '3px solid #FF1744';
                                                        e.currentTarget.style.transform = 'translateX(4px)';
                                                    }}
                                                    onMouseLeave={(e: any) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.color = isLogout ? '#FF1744' : '#424242';
                                                        e.currentTarget.style.borderLeft = '3px solid transparent';
                                                        e.currentTarget.style.transform = 'translateX(0)';
                                                    }}
                                                >
                                                    <span style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                        {option?.title}
                                                        {isLogout && <option.iconSrc style={{ padding: '0 5px', marginInlineStart: 'auto', color: '#FF1744' }} />}
                                                    </span>
                                                </MenuItem>
                                            </Box>
                                        );
                                    })
                                }
                            </MenuList>
                    </Paper>
                </div>
            </ClickAwayListener>
        </Popper>}
    </Box>
}

export default SettingsMenu;