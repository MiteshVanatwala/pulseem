import { useDispatch, useSelector } from "react-redux";
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import { setVerificationDomain } from "../../redux/reducers/newsletterSlice";
import { StateType } from "../../Models/StateTypes";
import { MdArrowBackIos, MdArrowForwardIos, MdDomain, MdOutlineReportGmailerrorred, MdOutlineVerified } from "react-icons/md";
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";
import { useTranslation } from "react-i18next";
import { Grid, Box, Accordion, AccordionSummary, makeStyles, AccordionDetails, Typography, Button, TextField, InputAdornment, FormControl, Select, MenuItem, ListItemIcon } from '@material-ui/core'
import clsx from "clsx";
import { useEffect, useState } from "react";
import { GrFormAdd, GrFormSubtract } from "react-icons/gr";
import { PulseemResponse } from "../../Models/APIResponse";
import { GetDomainVerification, SetSharedDomain } from "../../redux/reducers/DomainVerificationSlice";
import { logout } from "../../helpers/Api/PulseemReactAPI";
import { getCommonFeatures } from "../../redux/reducers/commonSlice";
import { IoIosArrowDown } from "react-icons/io";

interface DomainVerificationObj {
    classes: any,
    domain: {
        display: boolean,
        address: string,
        verifyCallback?: Function | never,
        verifySharedCallback?: Function | never,
        isSummary: boolean
    }
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

const DomainVerification = ({ classes, domain }: DomainVerificationObj) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const localClasses = useStyles();
    const { isRTL } = useSelector((state: StateType) => state.core);
    const { accountSettings, verifiedEmails } = useSelector((state: StateType) => state.common)
    const { domainVerificationPopUp } = useSelector((state: StateType) => state.newsletter);
    const [activeAccordion, setActiveAccordion] = useState<number>(0);
    const [domainReady, setDomainReady] = useState<boolean>(false);
    const [sharedDomain, setSharedDomain] = useState<string>('');
    const [replyTo, setReplyTo] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [callbackResponse, setCallbackResponse] = useState<any>({
        SourceID: 0,
        IsSPFApproved: false,
        IsDKIMApproved: false,
        IsDMARCApprotved: false,
        ReplyTo: null,
        FromEmail: null,
        Skip: null

    } as any);
    const resetDomainObj = { domain: '', display: false };
    const DOMAIN_EMAIL_SUFFIX = '@pulseem.co';

    enum DomainSourceStatus {
        Success = 0,
        SyntaxError = 1,
        GmailServers = 2
    }

    useEffect(() => {
        setReason('')
    }, [activeAccordion])

    useEffect(() => {
        if (accountSettings && accountSettings?.SubAccountSettings) {
            setSharedDomain(accountSettings?.SubAccountSettings?.SharedEmailDomain?.replace(DOMAIN_EMAIL_SUFFIX, ''));
        }
    }, [accountSettings]);

    const verifyDomain = async () => {
        const response = await dispatch(GetDomainVerification(domain?.address)) as any;
        handleResponses(response?.payload)
    }

    const handleResponses = (response: PulseemResponse) => {
        switch (response.StatusCode) {
            case 201: {
                switch (response.Data?.SourceID) {
                    case DomainSourceStatus.Success: {
                        setDomainReady(true);
                        setCallbackResponse({
                            SourceID: DomainSourceStatus.Success,
                            ...response.Data
                        });
                        break;
                    }
                    case DomainSourceStatus.SyntaxError: {
                        setCallbackResponse({
                            SourceID: DomainSourceStatus.SyntaxError,
                            ...response.Data
                        });
                        break;
                    }
                    case DomainSourceStatus.GmailServers: {
                        setCallbackResponse({
                            SourceID: DomainSourceStatus.GmailServers,
                            ...response.Data
                        });
                        break;
                    }
                }
                setReason(t(`common.domainVerification.popup.responses.${response.Data?.SourceID}`))
                setTimeout(() => { setReason('') }, 5000);
                break;
            }
            case 401: {
                logout();
                break;
            }
            case 500:
            default: {
                break;
            }
        }
    }

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

    return domain?.display ? (<BaseDialog
        disableBackdropClick={false}
        classes={classes}
        icon={<MdDomain className={classes.notifyIconWhite} />}
        open={domainVerificationPopUp?.display}
        // onConfirm={() => {
        //     dispatch(setVerificationDomain({ ...resetDomainObj }));
        // }}
        onClose={() => {
            dispatch(setVerificationDomain({ ...resetDomainObj }));
        }}
        showDefaultButtons={false}
        onCancel={() => {
            dispatch(setVerificationDomain({ ...resetDomainObj }));
        }}
        title={RenderHtml(t("common.domainVerification.popup.title").replace('##domainAddress##', domain.address !== '' ? `- ${domain.address}` : ''))}
        children={<Box className={clsx(classes.fullWidth)}>
            <Accordion
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
                        <Box className={classes.fullWidth}>{RenderHtml(t("common.domainVerification.popup.sections.verifyDomain.text"))}</Box>
                        <Box className={classes.fullFlexColumn}>
                            {!domainReady && <><Button
                                className={clsx(classes.btn, classes.btnRounded, classes.f14, 'flexEnd')}
                                onClick={() => verifyDomain()}
                            >
                                {t('common.domainVerification.popup.sections.verifyDomain.button')}
                                {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                            </Button>
                                {reason !== '' && <Box style={{ display: 'flex', justifyContent: "flex-end", alignItems: 'center', marginTop: 10 }}>
                                    <MdOutlineReportGmailerrorred className={clsx('flexEnd')} style={{ color: 'red', fontSize: 24 }} />
                                    <Typography style={{ marginInline: 5, fontWeight: 600 }}>{reason}</Typography>
                                </Box>}
                            </>}
                            {domainReady && domain?.verifyCallback ? (<Button
                                className={clsx(classes.btn, classes.btnRounded, classes.f14, 'flexEnd')}
                                onClick={() => domain?.verifyCallback && domain?.verifyCallback(callbackResponse)}
                            >
                                {t('common.domainVerification.popup.sections.verifyDomain.button')}
                                {<MdOutlineVerified />}
                            </Button>) : domainReady && <Box style={{ display: 'flex', justifyContent: "flex-end", alignItems: 'center' }}>
                                <MdOutlineVerified className={clsx('flexEnd')} style={{ color: 'green', fontSize: 36 }} textRendering={"Verified"} title="Verified" />
                                <Typography style={{ marginInline: 5, fontWeight: 600 }}>{t('common.domainVerification.popup.domainVerified')}</Typography>
                            </Box>}
                        </Box>
                    </Grid>
                </AccordionDetails>
            </Accordion>
            <Accordion
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
            </Accordion>
            {domain?.verifyCallback !== null && domain?.verifyCallback !== undefined && <Accordion
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
                        <Box className={clsx(classes.dFlex, classes.flexColumn)} style={{ marginBlock: 15, alignContent: 'center', justifyContent: 'flex-start', gap: 15 }}>
                            <Box style={{ maxWidth: 200 }}>
                                <Typography title={t("campaigns.newsLetterEditor.fromEmail")} className={classes.alignDir}>{t("campaigns.newsLetterEditor.fromEmail")}</Typography>
                                <TextField
                                    inputMode="url"
                                    dir="ltr"
                                    className={clsx(classes.textField)}
                                    InputProps={{
                                        style: { maxWidth: '100px !important', width: '100px !important' },
                                        endAdornment: <InputAdornment position="end">{DOMAIN_EMAIL_SUFFIX}</InputAdornment>
                                    }}
                                    placeholder={t("common.domainVerification.popup.sections.sendFromSharedDomain.placeholder")}
                                    type="text"
                                    variant="standard"
                                    value={sharedDomain}
                                    onChange={(event: any) => setSharedDomain(event.target.value.replace('@', ''))}
                                />
                            </Box>
                            <Box className='selectWrapper' style={{ maxWidth: 200 }}>
                                <Typography title={t("campaigns.newsLetterEditor.replyTo")} className={classes.alignDir}>{t("campaigns.newsLetterEditor.replyTo")}</Typography>
                                <FormControl
                                    className={clsx(classes.selectInputFormControl, classes.w100)}
                                >
                                    <Select
                                        variant="standard"
                                        name="FromEmail"
                                        value={replyTo ?? -1}
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
                                        {accountSettings?.SubAccountSettings?.SharedEmailDomain && <MenuItem
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
                            <Button
                                style={{ marginBlock: 15, maxWidth: 200 }}
                                className={clsx(classes.btn, classes.btnRounded, classes.f14)}
                                onClick={saveSharedDomain}
                            >{!domain.isSummary ? t('common.domainVerification.popup.sections.sendFromSharedDomain.saveAndContinue') : t('common.saveAndContinue')}</Button>
                        </Box>
                    </Grid>
                </AccordionDetails>
            </Accordion>}
            {!domain.isSummary && <Box className={classes.dFlex} style={{ justifyContent: 'flex-end' }}>
                <Button className={clsx(classes.btn, classes.btnRounded, classes.f14)} style={{ justifySelf: 'flex-end' }} onClick={handleSkip}>{t('common.skip')}</Button>
            </Box>}
        </Box>}
    />) : (<></ >)
}

export default DomainVerification;