import { useDispatch, useSelector } from "react-redux";
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import { setVerificationDomain } from "../../redux/reducers/newsletterSlice";
import { StateType } from "../../Models/StateTypes";
import { MdArrowBackIos, MdArrowForwardIos, MdDomain, MdOutlineReportGmailerrorred, MdOutlineVerified } from "react-icons/md";
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";
import { useTranslation } from "react-i18next";
import { Grid, Box, Accordion, AccordionSummary, makeStyles, AccordionDetails, Typography, Button, TextField, InputAdornment } from '@material-ui/core'
import clsx from "clsx";
import { useEffect, useState } from "react";
import { GrFormAdd, GrFormSubtract } from "react-icons/gr";
import { PulseemResponse } from "../../Models/APIResponse";
import { GetDomainVerification, SetSharedDomain } from "../../redux/reducers/DomainVerificationSlice";
import { logout } from "../../helpers/Api/PulseemReactAPI";

interface DomainVerificationObj {
    classes: any,
    domain: {
        display: boolean,
        address: string,
        verifyCallback?: Function | never,
        verifySharedCallback?: Function | never
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
    const { domainVerificationPopUp } = useSelector((state: StateType) => state.newsletter);
    const [activeAccordion, setActiveAccordion] = useState<number>(0);
    const [domainReady, setDomainReady] = useState<boolean>(false);
    const [sharedDomain, setSharedDomain] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [callbackResponse, setCallbackResponse] = useState<any>({
        SourceID: 0,
        IsSPFApproved: false,
        IsDKIMApproved: false,
        IsDMARCApprotved: false

    } as any);
    const resetDomainObj = { domain: '', display: false };

    enum DomainSourceStatus {
        Success = 0,
        SyntaxError = 1,
        GmailServers = 2
    }

    useEffect(() => {
        setReason('')
    }, [activeAccordion])

    const verifyDomain = async () => {
        const response = await dispatch(GetDomainVerification(domain?.address)) as any;
        handleResponses(response?.payload)
    }

    const handleResponses = (response: PulseemResponse) => {
        switch (response.StatusCode) {
            case 201: {
                switch (response.Data?.SourceID) {
                    case DomainSourceStatus.Success: {
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
        const response = await dispatch(SetSharedDomain(sharedDomain + '@pulseem.co'));
        
        switch (response?.payload?.StatusCode) {
            case 201: { break; }
            case 401: { logout(); break; }
        }
        // save shared domain on subaccountsettings table
    }

    return domain?.display ? (<BaseDialog
        disableBackdropClick={false}
        classes={classes}
        icon={<MdDomain className={classes.notifyIconWhite} />}
        open={domainVerificationPopUp?.display}
        onConfirm={() => {
            dispatch(setVerificationDomain({ ...resetDomainObj }));
        }}
        onClose={() => {
            dispatch(setVerificationDomain({ ...resetDomainObj }));
        }}
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
            <Accordion
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
                        <Box className={classes.dFlex} style={{ marginBlock: 15 }}>
                            <TextField
                                inputMode="url"
                                dir="ltr"
                                className={clsx(classes.textField)}
                                InputProps={{
                                    style: { maxWidth: '100px !important', width: '100px !important' },
                                    endAdornment: <InputAdornment position="end">@pulseem.co</InputAdornment>
                                }}
                                placeholder={t("common.domainVerification.popup.sections.sendFromSharedDomain.placeholder")}
                                type="text"
                                variant="standard"
                                value={sharedDomain}
                                onChange={(event: any) => setSharedDomain(event.target.value.replace('@', ''))}
                            />
                            <Button
                                style={{ marginInline: 15, minWidth: 150 }}
                                className={clsx(classes.btn, classes.btnRounded, classes.f12, 'flexEnd')}
                                onClick={saveSharedDomain}
                            >{t('common.domainVerification.popup.sections.sendFromSharedDomain.saveDomain')}</Button>
                        </Box>
                        <Box className={classes.fullWidth}>{RenderHtml(t("common.domainVerification.popup.sections.sendFromSharedDomain.text1"))}</Box>
                        <Box className={classes.fullFlexColumn}>
                            {domain?.verifySharedCallback && <Button
                                className={clsx(classes.btn, classes.btnRounded, classes.f14, 'flexEnd')}
                                onClick={() => domain?.verifySharedCallback && domain?.verifySharedCallback(callbackResponse)}
                            >
                                {t('common.domainVerification.popup.sections.sendFromSharedDomain.button')}
                                {<MdOutlineVerified />}
                            </Button>}
                        </Box>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Box>}
    />) : (<></ >)
}

export default DomainVerification;