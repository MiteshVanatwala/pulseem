import { MdDomain } from "react-icons/md";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Box, Button, FormControl, Select, TextField, Typography } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../../../Models/StateTypes";
import { useEffect, useState } from "react";
import { getAuthorizedEmails } from "../../../../redux/reducers/commonSlice";
import { logout } from "../../../../helpers/Api/PulseemReactAPI";
import { DoubleOptInSettings } from "../../../../Models/Account/AccountSettings";
import { IoIosArrowDown } from "react-icons/io";
import { RenderHtml } from "../../../../helpers/Utils/HtmlUtils";
import { setDoubleOptItSettings } from "../../../../redux/reducers/AccountSettingsSlice";
import { SharedEmailDomain } from "../../../../config";
import { IsSharedDomain } from "../../../../helpers/Functions/DomainVerificationHelper";
import { PulseemFeatures } from "../../../../model/PulseemFields/Fields";
import VerificationDialog from "../../../../components/DialogTemplates/VerificationDialog";

const DoubleOptInSettingsPopUp = ({ classes, isOpen, onClose, onConfirm, optInSettings, onVerificationEmail }: any) => {
    const { t } = useTranslation();
    const { verifiedEmails, accountSettings, accountFeatures } = useSelector((state: StateType) => state.common);
    const [responseError, setResponseError] = useState<any>();
    const [optIn, setOptIn] = useState<DoubleOptInSettings>({
        OptInActive: true,
        OptInFromEmail: '',
        OptInFromName: '',
        OptInSubject: ''
    });
    const dispatch = useDispatch();

    const initVerifiedEmails = async () => {
        await dispatch(getAuthorizedEmails());
    }
    useEffect(() => {
        if (optInSettings) {
            setOptIn({
                OptInActive: optInSettings?.OptInActive ?? true,
                OptInFromEmail: optInSettings?.OptInFromEmail || '',
                OptInFromName: optInSettings?.OptInFromName || '',
                OptInSubject: optInSettings?.OptInSubject || ''
            });
        }
        if (!verifiedEmails || verifiedEmails?.length < 1) {
            initVerifiedEmails();
        }
    }, []);

    useEffect(() => {
        if (!optIn?.OptInFromEmail || optIn?.OptInFromEmail === '') {
            setOptIn({ ...optIn, OptInFromEmail: verifiedEmails.filter((ve: any) => { return ve.IsVerified && ve.IsVerified })[0]?.Number })
        }
    }, [verifiedEmails])

    const handleSaveOptInSettings = async () => {
        const response: any = await dispatch(setDoubleOptItSettings(optIn));
        handleResponses(response?.payload)
    }
    const handleResponses = (response: any) => {
        switch (response?.StatusCode) {
            case 0: {
                alert(t('SubUsers.limitedAccess'));
                break;
            }
            case 201: {
                onConfirm(optIn)
                break;
            }
            case 401: {
                logout();
                break;
            }
            default:
            case 500: {
                alert('error occured');
                break;
            }
        }
    }

    const [errors, setErrors] = useState({
        OptInFromEmail: "",
        OptInSubject: "",
        OptInFromName: ""
    })

    useEffect(() => {
        if (optIn && optIn?.OptInFromEmail && verifiedEmails?.length > 0) {
            if (optIn?.OptInFromEmail?.FromEmail !== '') {
                const isVerified = verifiedEmails?.filter((ve: any) => { return ve.Number === optIn?.OptInFromEmail })[0]?.IsVerified;
                const isSharedDomain = IsSharedDomain(optIn?.OptInFromEmail)
                setIsVerifiedDomain(isSharedDomain || isVerified);
            }
        }
    }, [optIn, verifiedEmails])

    const handleFromEmailChange = (event: any) => {
        setOptIn({ ...optIn, OptInFromEmail: event.target.value })
        setErrors({ ...errors, OptInFromEmail: '' });
    }
    const [isVerifiedDomain, setIsVerifiedDomain] = useState(false);

    const helperTexts = {
        Name: t('campaigns.newsLetterEditor.helpTexts.Name'),
        Subject: t('campaigns.newsLetterEditor.helpTexts.Subject'),
        FromName: t('common.requiredField'),
        FromEmail: t('campaigns.newsLetterEditor.helpTexts.FromEmail'),
        ReplyEmail: t('campaigns.newsLetterEditor.helpTexts.ReplyEmail'),
        PreviewText: t('campaigns.newsLetterEditor.helpTexts.pre_helper_text')
    }

    return <BaseDialog
        customContainerStyle={classes.summaryContainer}
        disableBackdropClick={false}
        classes={classes}
        icon={<MdDomain className={classes.notifyIconWhite} />}
        open={isOpen}
        showDefaultButtons={false}
        title={t("settings.accountSettings.optIn.checkboxTitle")}
        children={<Box className={clsx(classes.fullWidth)}>
            <Box className='selectWrapper'>
                <Typography title={t("campaigns.newsLetterEditor.fromEmail").replace('<b>', '').replace('</b>', '')} className={classes.alignDir}>{RenderHtml(t("campaigns.newsLetterEditor.fromEmail"))}</Typography>
                <FormControl
                    className={clsx(classes.selectInputFormControl, classes.w100)}
                >
                    <Select
                        native
                        variant="standard"
                        name="FromEmail"
                        value={optIn?.OptInFromEmail}
                        className={clsx(classes.pbt5, classes.fromEmailSelect, !isVerifiedDomain ? classes.errorBg : null)}
                        onChange={(event, val) => {
                            handleFromEmailChange(event);
                        }}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300,
                                },
                            },
                        }}
                    >
                        <option
                            key='-1'
                            value='-1'
                            disabled
                        >
                            {t("common.select")}
                        </option>
                        {verifiedEmails.map((item: any, index: any) => {
                            return <option
                                key={index}
                                value={item.Number}
                            >
                                {t(item.Number)}
                            </option>
                        })}
                        {accountFeatures?.indexOf(PulseemFeatures.HIDE_SHARED_DOMAIN) === -1 && accountSettings?.SubAccountSettings?.SharedEmailDomain && <option
                            key={verifiedEmails.length + 1}
                            value={accountSettings?.SubAccountSettings?.SharedEmailDomain}
                        >
                            {t(accountSettings?.SubAccountSettings?.SharedEmailDomain)}
                        </option>}
                    </Select>
                </FormControl>
                <Typography className={clsx(errors.OptInFromEmail ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                    {errors.OptInFromEmail ? errors.OptInFromEmail : helperTexts.FromEmail + ' '}
                    <strong className={clsx(classes.link, classes.textRed)} onClick={() => onVerificationEmail(true)}>{t('campaigns.newsLetterEditor.helpTexts.clickToVerify')}</strong>
                </Typography>
                {/* <FormControl
                    className={clsx(classes.selectInputFormControl, classes.w100)}
                >
                    <Select
                        native
                        variant="standard"
                        name="FromEmail"
                        value={optIn?.OptInFromEmail}
                        className={clsx(classes.pbt5, classes.fromEmailSelect)}
                        onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                            setOptIn({ ...optIn, OptInFromEmail: event.target.value })
                        }}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300,
                                },
                            },
                        }}
                    >
                        <option
                            key='-1'
                            value='-1'
                            disabled
                        >
                            {t("common.select")}
                        </option>
                        {verifiedEmails?.filter((ve: any) => { return ve.IsVerified && ve.IsVerified }).map((item: any, index: any) => {
                            return <option
                                key={index}
                                value={item.Number}
                            >
                                {t(item.Number)}
                            </option>
                        })}
                    </Select>
                </FormControl> */}
            </Box>
            <Box className={classes.mt5}>
                <Box>{t('campaigns.newsLetterEditor.fromName')}</Box>
                <Box>
                    <TextField
                        variant='outlined'
                        size='small'
                        className={clsx(classes.textField, classes.maxWidth400, classes.p10)}
                        onChange={(e) => {
                            setOptIn({ ...optIn, OptInFromName: e.target.value });
                        }}
                        placeholder={t('campaigns.newsLetterMgmt.emailVerification.secondSlide.placeholder')}
                        error={!!responseError}
                        value={optIn.OptInFromName}
                    />
                </Box>
            </Box>
            <Box className={classes.mt5}>
                <Box>{t('common.MessageText')}</Box>
                <Box>
                    <TextField
                        variant='outlined'
                        size='small'
                        className={clsx(classes.textField, classes.maxWidth400, classes.p10)}
                        onChange={(e) => {
                            setOptIn({ ...optIn, OptInSubject: e.target.value });
                        }}
                        placeholder={t('campaigns.newsLetterMgmt.emailVerification.secondSlide.placeholder')}
                        error={!!responseError}
                        value={optIn.OptInSubject}
                    />
                </Box>
            </Box>
            <Box className={classes.mt25} style={{ textAlign: 'center' }}>
                <Button
                    className={clsx(
                        classes.btn,
                        classes.btnRounded,
                        "saveFixedDetails"
                    )}
                    onClick={() => { handleSaveOptInSettings() }}>{t('common.save')}
                </Button>
            </Box>
        </Box>}
        onClose={() => {
            onClose && onClose();
        }}
        onCancel={() => {
            onClose && onClose();
        }}
    />
}
export default DoubleOptInSettingsPopUp;