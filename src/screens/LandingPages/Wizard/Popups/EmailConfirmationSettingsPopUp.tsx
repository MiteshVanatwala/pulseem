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
import { IoIosArrowDown } from "react-icons/io";
import { RenderHtml } from "../../../../helpers/Utils/HtmlUtils";
import { setDoubleOptItSettings } from "../../../../redux/reducers/AccountSettingsSlice";
import { IsSharedDomain } from "../../../../helpers/Functions/DomainVerificationHelper";
import { PulseemFeatures } from "../../../../model/PulseemFields/Fields";
import { MAX_TEXTFIELD_LENGTH } from "../../../../helpers/Constants";
import Toast from "../../../../components/Toast/Toast.component";
import DomainsVerificationPopUp from "../../../Settings/AccountSettings/Popups/DomainsVerificationPopUp";
import { EmailConfirmationSettings } from "../../../../Models/LandingPage/LandingPage";
import { getCookie } from "../../../../helpers/Functions/cookies";
import { Loader } from "../../../../components/Loader/Loader";

const EmailConfirmationSettingsPopUp = ({ classes, isOpen, onClose, onConfirm, optInSettings, onVerificationEmail }: any) => {
    const { t } = useTranslation();
    const { verifiedEmails, accountSettings, accountFeatures } = useSelector((state: StateType) => state.common);
    const [showLoader, setShowLoader] = useState<boolean>(true);
    const [isVerifiedDomain, setIsVerifiedDomain] = useState(false);
    const [toastMessage, setToastMessage] = useState<any>();
    const [showVerificationDomains, setShowVerificationDomains] = useState<boolean>(false);
    const [optIn, setOptIn] = useState<EmailConfirmationSettings>({
        IsEmailConfirmationActive: true,
        ConfirmationFromEmail: optInSettings?.ConfirmationFromEmail ?? '',
        ConfirmationFromName: optInSettings?.ConfirmationFromName ?? '',
        ConfirmationSubject: optInSettings?.ConfirmationSubject ?? ''
    });
    const [errors, setErrors] = useState({
        ConfirmationFromEmail: "",
        ConfirmationSubject: "",
        ConfirmationFromName: ""
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
    // Initialize verified emails if needed
    useEffect(() => {
        if (!verifiedEmails || verifiedEmails?.length < 1) {
            initVerifiedEmails();
        } else {
            setShowLoader(false);
        }
    }, []);

    // Update optIn state when optInSettings changes
    useEffect(() => {
        if (optInSettings) {
            setOptIn({
                IsEmailConfirmationActive: optInSettings?.IsEmailConfirmationActive ?? true,
                ConfirmationFromEmail: optInSettings?.ConfirmationFromEmail ?? '',
                ConfirmationFromName: optInSettings?.ConfirmationFromName ?? '',
                ConfirmationSubject: optInSettings?.ConfirmationSubject ?? ''
            });
        }
    }, [optInSettings]); // Add optInSettings as dependency

    // Set default email if none is selected and verified emails are available
    useEffect(() => {
        if ((!optIn?.ConfirmationFromEmail || optIn?.ConfirmationFromEmail === '') && verifiedEmails && verifiedEmails.length > 0) {
            const verifiedEmailsFiltered = verifiedEmails.filter((ve: any) => ve.IsVerified);
            if (verifiedEmailsFiltered.length > 0) {
                setOptIn(prev => ({ ...prev, ConfirmationFromEmail: verifiedEmailsFiltered[0]?.Number }));
            }
        }
    }, [verifiedEmails, optIn?.ConfirmationFromEmail]);

    // Check if email domain is verified
    useEffect(() => {
        if (optIn?.ConfirmationFromEmail && verifiedEmails?.length > 0) {
            const isVerified = verifiedEmails?.filter((ve: any) => ve.Number === optIn?.ConfirmationFromEmail)[0]?.IsVerified;
            const isSharedDomain = IsSharedDomain(optIn?.ConfirmationFromEmail);
            setIsVerifiedDomain(isSharedDomain || isVerified);
        }
    }, [optIn?.ConfirmationFromEmail, verifiedEmails]);

    const handleSaveOptInSettings = async () => {
        const isValid: boolean = validateSettings();

        if (isValid) {
            onConfirm({ ...optIn, IsEmailConfirmationActive: true })
        }
    }

    const validateSettings = () => {
        let isValid = true;
        const selectedEmail = verifiedEmails.filter((e: any) => { return e.Number === optIn.ConfirmationFromEmail })[0];
        const newErr: any = {
            OptInEmail: '',
            ConfirmationFromName: '',
            ConfirmationSubject: ''
        };
        if (optIn.ConfirmationFromEmail === '' || !selectedEmail.IsVerified) {
            isValid = false;
            newErr.ConfirmationFromEmail = t('common.domainVerificationRequired');
        }
        if (optIn.ConfirmationFromName === '') {
            isValid = false;
            newErr.ConfirmationFromName = t('common.requiredField');
        }
        if (optIn.ConfirmationSubject === '') {
            isValid = false;
            newErr.ConfirmationSubject = t('common.requiredField');
        }

        setErrors(newErr)
        return isValid;
    }

    const handleFromEmailChange = (event: any) => {
        setOptIn({ ...optIn, ConfirmationFromEmail: event.target.value })
        setErrors({ ...errors, ConfirmationFromEmail: '' });
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
                        value={optIn?.ConfirmationFromEmail}
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
                        {verifiedEmails.filter((item: any) => item.IsVerified === true).map((item: any, index: any) => {
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
                <Typography className={clsx(errors.ConfirmationFromEmail ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                    {errors.ConfirmationFromEmail ? errors.ConfirmationFromEmail : helperTexts.FromEmail + ' '}
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
                            setOptIn({ ...optIn, ConfirmationFromName: e.target.value });
                        }}
                        inputProps={{
                            maxLength: MAX_TEXTFIELD_LENGTH.NAME
                        }}
                        placeholder={t('common.typeFromName')}
                        value={optIn.ConfirmationFromName}
                    />
                    <Box>
                        {errors.ConfirmationFromName !== '' && <strong className={clsx(classes.textRed, classes.font14)}>{errors.ConfirmationFromName}</strong>}
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
                            setOptIn({ ...optIn, ConfirmationSubject: e.target.value });
                        }}
                        inputProps={{
                            maxLength: MAX_TEXTFIELD_LENGTH.CAMPAIGN_SUBJECT
                        }}
                        placeholder={t('common.typeSubject')}
                        value={optIn.ConfirmationSubject}
                    />
                    <Box>
                        {errors.ConfirmationSubject !== '' && <strong className={clsx(classes.textRed, classes.font14)}>{errors.ConfirmationSubject}</strong>}
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
export default EmailConfirmationSettingsPopUp;