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
import { IsSharedDomain } from "../../../../helpers/Functions/DomainVerificationHelper";
import { PulseemFeatures } from "../../../../model/PulseemFields/Fields";
import { MAX_TEXTFIELD_LENGTH } from "../../../../helpers/Constants";
import Toast from "../../../../components/Toast/Toast.component";
import DomainsVerificationPopUp from "./DomainsVerificationPopUp";
import { VerifiedEmail } from "../../../../model/Common/commonProps.types";
import { Loader } from "../../../../components/Loader/Loader";

const DoubleOptInSettingsPopUp = ({ classes, isOpen, onClose, onConfirm, optInSettings, onVerificationEmail }: any) => {
    const { t } = useTranslation();
    const { verifiedEmails, accountSettings, accountFeatures } = useSelector((state: StateType) => state.common);
    const [showLoader, setShowLoader] = useState<boolean>(true);
    const [isVerifiedDomain, setIsVerifiedDomain] = useState(false);
    const [toastMessage, setToastMessage] = useState<any>();
    const [showVerificationDomains, setShowVerificationDomains] = useState<boolean>(false);
    const [optIn, setOptIn] = useState<DoubleOptInSettings>({
        OptInActive: true,
        OptInFromEmail: optInSettings?.OptInFromEmail ?? '',
        OptInFromName: optInSettings?.OptInFromName ?? '',
        OptInSubject: optInSettings?.OptInSubject ?? ''
    });
    const [errors, setErrors] = useState({
        OptInFromEmail: "",
        OptInSubject: "",
        OptInFromName: ""
    })
    const helperTexts = {
        Name: t('common.requiredField'),
        Subject: t('campaigns.newsLetterEditor.helpTexts.Subject'),
        FromName: t('common.requiredField'),
        FromEmail: t('campaigns.newsLetterEditor.helpTexts.FromEmail'),
        ReplyEmail: t('campaigns.newsLetterEditor.helpTexts.ReplyEmail'),
        PreviewText: t('campaigns.newsLetterEditor.helpTexts.pre_helper_text')
    }
    const dispatch = useDispatch();

    const initVerifiedEmails = async () => {
        const startTime = Date.now();
        await dispatch(getAuthorizedEmails());
        // Keep the loader visible past the backdrop's fade-in transition (~225ms)
        // so a fast response doesn't reverse the fade before it becomes noticeable.
        const minLoaderDuration = 400;
        const elapsed = Date.now() - startTime;
        if (elapsed < minLoaderDuration) {
            setTimeout(() => setShowLoader(false), minLoaderDuration - elapsed);
        } else {
            setShowLoader(false);
        }
    }
    // Always refresh verified emails on open so stale data isn't shown
    useEffect(() => {
        if (verifiedEmails && verifiedEmails?.length > 0) {
            setShowLoader(false);
        }
        initVerifiedEmails();
    }, []);

    // Update optIn state when optInSettings changes
    useEffect(() => {
        if (optInSettings) {
            setOptIn({
                OptInActive: optInSettings?.OptInActive ?? true,
                OptInFromEmail: optInSettings?.OptInFromEmail || '',
                OptInFromName: optInSettings?.OptInFromName || '',
                OptInSubject: optInSettings?.OptInSubject || ''
            });
        }
    }, [optInSettings]); // Add optInSettings as dependency

    // Set default email if none is selected and verified emails are available
    useEffect(() => {
        if ((!optIn?.OptInFromEmail || optIn?.OptInFromEmail === '') && verifiedEmails && verifiedEmails.length > 0) {
            const verifiedEmailsFiltered = verifiedEmails.filter((ve: any) => ve.IsVerified);
            if (verifiedEmailsFiltered.length > 0) {
                setOptIn(prev => ({ ...prev, OptInFromEmail: verifiedEmailsFiltered[0]?.Number }));
            }
        }
    }, [verifiedEmails, optIn?.OptInFromEmail]);

    // Check if email domain is verified
    useEffect(() => {
        if (optIn?.OptInFromEmail && verifiedEmails?.length > 0) {
            const isVerified = verifiedEmails?.filter((ve: any) => ve.Number === optIn?.OptInFromEmail)[0]?.IsVerified;
            const isSharedDomain = IsSharedDomain(optIn?.OptInFromEmail);
            setIsVerifiedDomain(isSharedDomain || isVerified);
        }
    }, [optIn?.OptInFromEmail, verifiedEmails]);

    const handleSaveOptInSettings = async () => {
        const isValid: boolean = validateSettings();

        if (isValid) {
            const response: any = await dispatch(setDoubleOptItSettings({ ...optIn, OptInActive: true }));
            handleResponses(response?.payload)
        }
    }

    const validateSettings = () => {
        let isValid = true;
        const selectedEmail = verifiedEmails?.filter((e: any) => { return e.Number === optIn.OptInFromEmail })[0];
        const newErr: any = {
            OptInEmail: '',
            OptInFromName: '',
            OptInSubject: ''
        };
        if (optIn.OptInFromEmail === '' || !selectedEmail?.IsVerified) {
            isValid = false;
            newErr.OptInFromEmail = t('common.domainVerificationRequired');
        }
        if (optIn.OptInFromName === '') {
            isValid = false;
            newErr.OptInFromName = t('common.requiredField');
        }
        if (optIn.OptInSubject === '') {
            isValid = false;
            newErr.OptInSubject = t('common.requiredField');
        }

        setErrors(newErr)
        return isValid;
    }

    const handleResponses = (response: any) => {
        switch (response?.StatusCode) {
            case 0: {
                alert(t('SubUsers.limitedAccess'));
                break;
            }
            case 201: {
                setToastMessage({ severity: 'success', color: 'success', message: t('common.settingsSavedSuccessfuly'), showAnimtionCheck: true });
                setTimeout(() => {
                    onConfirm(optIn);
                }, 3000);
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

    const handleFromEmailChange = (event: any) => {
        setOptIn({ ...optIn, OptInFromEmail: event.target.value })
        setErrors({ ...errors, OptInFromEmail: '' });
    }

    const renderToast = () => {
        if (toastMessage) {
            setTimeout(() => {
                setToastMessage(null);
            }, 3000);
            return (
                <Toast data={toastMessage} />
            );
        }
        return null;
    }

    return <BaseDialog
        customContainerStyle={classes.summaryContainer}
        disableBackdropClick={true}
        classes={classes}
        icon={<MdDomain className={classes.notifyIconWhite} />}
        open={isOpen}
        showDefaultButtons={false}
        title={t("settings.accountSettings.optIn.checkboxTitle")}
        children={<Box className={clsx(classes.fullWidth)}>
            <Box className='selectWrapper'>
                <Typography title={t("campaigns.newsLetterEditor.fromEmail").replace('<b>', '').replace('</b>', '')} className={classes.alignDir}>{RenderHtml(t("campaigns.newsLetterEditor.fromEmail"))}</Typography>
                <FormControl
                    className={clsx(classes.selectInputFormControl, classes.maxWidth400)}
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
                        {verifiedEmails.filter((email: VerifiedEmail) => { return email.IsVerified === true }).map((item: any, index: any) => {
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
                    {!isVerifiedDomain ? <strong className={clsx(classes.link, classes.textRed)} onClick={() => setShowVerificationDomains(true)}>{t('common.domainVerification.verifyDomain')}</strong> : <strong className={clsx(classes.link, classes.textRed)} onClick={() => onVerificationEmail(true)}>{t('campaigns.newsLetterEditor.helpTexts.clickToVerify')}</strong>}
                </Typography>
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
                        inputProps={{
                            maxLength: MAX_TEXTFIELD_LENGTH.NAME
                        }}
                        placeholder={t('campaigns.newsLetterMgmt.emailVerification.secondSlide.placeholder')}
                        value={optIn.OptInFromName}
                    />
                    <Box>
                        {errors.OptInFromName !== '' && <strong className={clsx(classes.textRed, classes.font14)}>{errors.OptInFromName}</strong>}
                    </Box>
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
                        inputProps={{
                            maxLength: MAX_TEXTFIELD_LENGTH.CAMPAIGN_SUBJECT
                        }}
                        placeholder={t('campaigns.newsLetterMgmt.emailVerification.secondSlide.placeholder')}
                        value={optIn.OptInSubject}
                    />
                    <Box>
                        {errors.OptInSubject !== '' && <strong className={clsx(classes.textRed, classes.font14)}>{errors.OptInSubject}</strong>}
                    </Box>
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
            {renderToast()}
            <Loader isOpen={showLoader} />
            {showVerificationDomains && <DomainsVerificationPopUp
                classes={classes} isOpen={showVerificationDomains}
                onClose={() => setShowVerificationDomains(false)}
                onConfirm={() => setShowVerificationDomains(false)}
            />}
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