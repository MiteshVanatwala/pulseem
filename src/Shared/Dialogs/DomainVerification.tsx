import { useDispatch, useSelector } from "react-redux";
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import { StateType } from "../../Models/StateTypes";
import { MdArrowBackIos, MdArrowForwardIos, MdDomain, MdOutlineVerified } from "react-icons/md";
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";
import { useTranslation } from "react-i18next";
import { Grid, Box, Accordion, AccordionSummary, makeStyles, AccordionDetails, Typography, Button, TextField, InputAdornment, FormControl, Select, MenuItem, ListItemIcon } from '@material-ui/core'
import clsx from "clsx";
import { useEffect, useState } from "react";
import { GrFormAdd, GrFormSubtract } from "react-icons/gr";
import { SetSharedDomain } from "../../redux/reducers/DomainVerificationSlice";
import { logout } from "../../helpers/Api/PulseemReactAPI";
import { getCommonFeatures } from "../../redux/reducers/commonSlice";
import { IoIosArrowDown } from "react-icons/io";
import { PulseemFeatures } from "../../model/PulseemFields/Fields";
import { ValidateEmailAddress } from "../../helpers/Utils/common";

interface ButtonOptions {
    text: string,
    onCallback?: Function | never
}
interface DomainVerificationObj {
    classes: any,
    domain: {
        display: boolean,
        address: string,
        verifySharedCallback?: Function | never,
        isSummary: boolean,
        isFullDescription: boolean,
        preText?: string,
        showSkip: boolean,
        replyTo: string | never,
        options?: ButtonOptions[]
    },
    forceShow: boolean,
    onClose?: Function | never,
}
const useStyles = makeStyles({
    accordionIcons: {
        position: 'absolute',
        '& path': {
            stroke: '#ff3343'
        }
    },
    headLabel: {
        paddingBottom: 5,
        background: '#f0f5ff',
        paddingLeft: 5,
        borderRadius: 5,
    },
    expandedBox: {
        borderBottom: '2px solid #f0f5ff',
        borderRadius: 10,
        marginBottom: 16,
        '& .MuiAccordionSummary-root': {
            minHeight: 30,
            maxHeight: 48,
            padding: 0
        },
        '& .MuiAccordionSummary-content': {
            margin: 0
        }
    },
    displayBlock: {},
    plusIcon: {
        width: 30,
    }
});
const DomainVerification = ({ classes, domain, forceShow, onClose }: DomainVerificationObj) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const localClasses = useStyles();
    const { isRTL } = useSelector((state: StateType) => state.core);
    const { accountSettings, verifiedEmails, accountFeatures } = useSelector((state: StateType) => state.common)
    const { domainVerificationPopUp } = useSelector((state: StateType) => state.newsletter);
    const [activeAccordion, setActiveAccordion] = useState<number>(0);
    const [sharedDomain, setSharedDomain] = useState<string>('');
    const [replyTo, setReplyTo] = useState<string>('');
    const callbackResponse = {
        SourceID: 0,
        IsSPFApproved: false,
        IsDKIMApproved: false,
        IsDMARCApprotved: false,
        ReplyTo: null,
        FromEmail: null,
        Skip: null
    } as any;

    const DOMAIN_EMAIL_SUFFIX = '@pulseem.co';
    const handleCopyRecord = () => {
        const elem = document.getElementById("copyStatusIcon");
        const records = document.getElementById("dkimRecord");
        if (elem) {
            elem.innerHTML = "\uE134";
            navigator.clipboard.writeText(records?.innerText ?? '');
            setTimeout(() => {
                elem.innerHTML = "\ue0b0";
            }, 4000);
        }
    }
    document.getElementById("copyLabel")?.addEventListener("click", handleCopyRecord);
    useEffect(() => {
        if (accountSettings && accountSettings?.SubAccountSettings) {
            setSharedDomain(accountSettings?.SubAccountSettings?.SharedEmailDomain?.replace(DOMAIN_EMAIL_SUFFIX, ''));
        }
        if (verifiedEmails && verifiedEmails?.length > 0) {
            setReplyTo(domain.replyTo || (verifiedEmails && verifiedEmails[0]?.Number));
        }
    }, [accountSettings, verifiedEmails]);
    const saveSharedDomain = async () => {
        if (replyTo && replyTo !== '' && replyTo !== '-1' && sharedDomain && sharedDomain !== '' && sharedDomain !== '-1') {
            const response = await dispatch(SetSharedDomain(sharedDomain + DOMAIN_EMAIL_SUFFIX));
            // @ts-ignore
            switch (response?.payload?.StatusCode) {
                case 201: {
                    // @ts-ignore
                    dispatch(getCommonFeatures({ forceRequest: true } as any));
                    domain?.verifySharedCallback && domain?.verifySharedCallback({ ...callbackResponse, FromEmail: sharedDomain + DOMAIN_EMAIL_SUFFIX, ReplyTo: replyTo })
                    break;
                }
                case 404: {
                    // setSharedDomainSaveProc({ inProgress: false, isSaved: false });
                    break;
                }
                case 422: {
                    // setSharedDomainSaveProc({ inProgress: false, isSaved: false });
                    break;
                }
                case 401: { logout(); break; }
            }
        }
        else {
            alert('please fill required field');
        }
        // save shared domain on subaccountsettings table
    }
    const handleSkip = () => {
        domain?.verifySharedCallback && domain?.verifySharedCallback({ ...callbackResponse, Skip: true })
    }
    const handleSharedDomainValue = (event: any) => {
        if (ValidateEmailAddress(event.target.value + DOMAIN_EMAIL_SUFFIX) || event.target.value === '') {
            setSharedDomain(event.target.value);
        }
    }
    return (domain?.display === true || forceShow === true) ? (<BaseDialog
        disableBackdropClick={false}
        classes={classes}
        icon={<MdDomain className={classes.notifyIconWhite} />}
        open={domainVerificationPopUp?.display}
        onClose={() => {
            if (onClose) {
                onClose();
            }
        }}
        showDefaultButtons={false}
        onCancel={() => {
            if (onClose) {
                onClose();
            }
        }}
        title={RenderHtml(t("common.domainVerification.popup.title").replace('##domainAddress##', domain.address !== '' ? `- ${domain.address}` : ''))}
        children={<Box className={clsx(classes.fullWidth)}>
            <Box className={classes.mb20}>
                {RenderHtml(domain?.preText)}
            </Box>
            {domain.isFullDescription && <Accordion
                expanded={activeAccordion === 1}
                className={clsx(classes.noBoxShadow, localClasses.expandedBox)}
                key={1}
            >
                <AccordionSummary
                    expandIcon={""}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    style={{ display: 'flex', flexDirection: 'row' }}
                    onClick={() => setActiveAccordion(activeAccordion === 1 ? 0 : 1)}
                >
                    <Typography className={clsx(classes.font18, classes.bold, localClasses.plusIcon)}>
                        {activeAccordion !== 1 ? <GrFormAdd size={26} className={clsx(localClasses.accordionIcons, localClasses.plusIcon)} /> : <GrFormSubtract size={26} className={clsx(localClasses.accordionIcons, localClasses.displayBlock)} />}
                    </Typography>
                    <Typography className={clsx(classes.font18, classes.bold)}>
                        {t("common.domainVerification.popup.sections.verifyDomain.title")}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container>
                        <Box className={classes.fullWidth}>{
                            domain.isFullDescription ? RenderHtml(t("common.domainVerification.popup.sections.verifyDomain.text"))
                                : RenderHtml(t("common.domainVerification.popup.sections.verifyDomain.text"))
                        }</Box>
                    </Grid>
                </AccordionDetails>
            </Accordion>}
            {domain.isFullDescription && <Accordion
                expanded={activeAccordion === 2}
                className={clsx(classes.noBoxShadow, localClasses.expandedBox)}
                key={2}
            >
                <AccordionSummary
                    expandIcon={""}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    onClick={() => setActiveAccordion(activeAccordion === 2 ? 0 : 2)}
                >
                    <Typography className={clsx(classes.font18, classes.bold, localClasses.plusIcon)}>
                        {activeAccordion !== 2 ? <GrFormAdd size={26} className={clsx(localClasses.accordionIcons, localClasses.plusIcon)} /> : <GrFormSubtract size={26} className={clsx(localClasses.accordionIcons, localClasses.displayBlock)} />}
                    </Typography>
                    <Typography align="left" className={clsx(classes.font18, classes.bold)}>
                        {t("common.domainVerification.popup.sections.buyVerifiedDomain.title")}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container>
                        <Box className={classes.fullWidth}>{RenderHtml(t("common.domainVerification.popup.sections.buyVerifiedDomain.text"))}</Box>
                    </Grid>
                </AccordionDetails>
            </Accordion>}
            {accountFeatures?.indexOf(PulseemFeatures.HIDE_SHARED_DOMAIN) === -1 && domain?.verifySharedCallback !== null && domain?.verifySharedCallback !== undefined && <Accordion
                expanded={activeAccordion === 3}
                className={clsx(classes.noBoxShadow, localClasses.expandedBox)}
                key={3}
            >
                <AccordionSummary
                    expandIcon={""}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    onClick={() => setActiveAccordion(activeAccordion === 3 ? 0 : 3)}
                >
                    <Typography className={clsx(classes.font18, classes.bold, localClasses.plusIcon)}>
                        {activeAccordion !== 3 ? <GrFormAdd size={26} className={clsx(localClasses.accordionIcons, localClasses.plusIcon)} /> : <GrFormSubtract size={26} className={clsx(localClasses.accordionIcons, localClasses.displayBlock)} />}
                    </Typography>
                    <Typography align="left" className={clsx(classes.font18, classes.bold)}>
                        {t("common.domainVerification.popup.sections.sendFromSharedDomain.title")}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container>
                        <Box className={classes.fullWidth}>{RenderHtml(t("common.domainVerification.popup.sections.sendFromSharedDomain.text"))}</Box>
                        <Box className={clsx(classes.dFlex)} style={{ marginBlock: 15, alignContent: 'center', justifyContent: 'flex-start', gap: 15 }}>
                            <Box style={{ maxWidth: 200 }}>
                                <Typography title={t("campaigns.newsLetterEditor.fromEmail").replace('<b>', '').replace('</b>', '')} className={clsx(classes.alignDir)}>{RenderHtml(t("campaigns.newsLetterEditor.fromEmail"))}</Typography>
                                <TextField
                                    inputMode="url"
                                    dir="ltr"
                                    className={clsx(classes.textField, classes.textFieldWithTemplate)}
                                    style={{ borderRadius: 0, border: 'none', borderBottom: '1px solid #D6D1E6', marginTop: 7 }}
                                    InputProps={{
                                        style: { maxWidth: '100px !important', width: '100px !important' },
                                        endAdornment: <InputAdornment position="end">{DOMAIN_EMAIL_SUFFIX}</InputAdornment>
                                    }}
                                    placeholder={t("common.domainVerification.popup.sections.sendFromSharedDomain.placeholder")}
                                    type="text"
                                    variant="standard"
                                    value={sharedDomain}
                                    onChange={(event: any) => handleSharedDomainValue(event)}
                                />
                            </Box>
                            <Box className='selectWrapper' style={{ minWidth: 300 }}>
                                <Typography title={t("campaigns.newsLetterEditor.replyTo").replace('<b>', '').replace('</b>', '')} className={clsx(classes.alignDir)}>{RenderHtml(t("campaigns.newsLetterEditor.replyTo"))}</Typography>
                                <FormControl
                                    className={clsx(classes.selectInputFormControl, classes.w100)}
                                >
                                    <Select
                                        variant="standard"
                                        name="FromEmail"
                                        value={replyTo}
                                        className={classes.pbt5}
                                        onChange={(event: any) => setReplyTo(event.target.value)}
                                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 300,
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem
                                            key='-1'
                                            value='-1'
                                            disabled
                                        >
                                            {t("common.select")}
                                        </MenuItem>
                                        {verifiedEmails.map((item: any, index: number) => {
                                            return <MenuItem
                                                key={index}
                                                value={item.Number}
                                                // @ts-ignore
                                                name={item.Number}
                                            >
                                                {t(item.Number)}
                                            </MenuItem>
                                        })}
                                        {accountFeatures?.indexOf(PulseemFeatures.HIDE_SHARED_DOMAIN) === -1 && accountSettings?.SubAccountSettings?.SharedEmailDomain && <MenuItem
                                            key={verifiedEmails.length + 1}
                                            value={accountSettings?.SubAccountSettings?.SharedEmailDomain}
                                            // @ts-ignore
                                            name={accountSettings?.SubAccountSettings?.SharedEmailDomain}
                                        >
                                            <ListItemIcon style={{ minWidth: 25 }}>
                                                <MdOutlineVerified style={{ color: 'green', fontSize: 20 }} />
                                            </ListItemIcon>
                                            {t(accountSettings?.SubAccountSettings?.SharedEmailDomain)}
                                        </MenuItem>}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box style={{ alignSelf: 'flex-end' }}>
                                <Button
                                    style={{ marginBlock: 0, marginInline: 15, maxHeight: 40, marginBottom: 5 }}
                                    className={clsx(
                                        classes.btn,
                                        classes.btnRounded,
                                        classes.backButton
                                    )}
                                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                                    onClick={saveSharedDomain}
                                >{t('common.saveAndContinue')}</Button>
                            </Box>
                        </Box>
                    </Grid>
                </AccordionDetails>
            </Accordion>}
            {domain?.options && <Box className={clsx(classes.dFlex, classes.justifyContentEnd)}>
                {domain?.options.map((option: ButtonOptions) => {
                    return <Button
                        className={clsx(
                            classes.btn,
                            classes.btnRounded,
                            classes.backButton
                        )}
                        endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                        style={{ marginInlineEnd: 15 }}
                        onClick={() => option?.onCallback && option?.onCallback()}>{option.text}</Button>
                })}
            </Box>}
            {domain?.showSkip && <Box className={classes.dFlex} style={{ justifyContent: 'flex-end' }}>
                <Button
                    className={clsx(
                        classes.btn,
                        classes.btnRounded,
                        classes.backButton
                    )}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    style={{ justifySelf: 'flex-end' }}
                    onClick={handleSkip}>{t('common.skip')}</Button>
            </Box>}
        </Box>}
    />) : (<></>)
}
export default DomainVerification;