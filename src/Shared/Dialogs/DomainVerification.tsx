import { useDispatch, useSelector } from "react-redux";
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import { setVerificationDomain } from "../../redux/reducers/newsletterSlice";
import { StateType } from "../../Models/StateTypes";
import { MdArrowBackIos, MdArrowForwardIos, MdDomain } from "react-icons/md";
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";
import { useTranslation } from "react-i18next";
import { Grid, Box, Accordion, AccordionSummary, makeStyles, AccordionDetails, Typography, Button } from '@material-ui/core'
import clsx from "clsx";
import { useState } from "react";
import { GrFormAdd, GrFormSubtract } from "react-icons/gr";

interface DomainVerificationObj {
    classes: any,
    domain: {
        display: boolean,
        address: string
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
    const [sharedDomainReady, setSharedDomainReady] = useState<boolean>(false);
    const resetDomainObj = { domain: '', display: false };

    const verifyDomainRegularity = () => {
        // const response = await dispatch(verifyDomainRegularity())
        // handleResponses(response.payload)
    }

    const verifySharedDomainCreated = () => {
        // const response = await dispatch(verifyDomainRegularity())
        // handleResponses(response.payload)
    }

    const VerifyDomain = () => {
        return <Grid container>
            <Box className={classes.fullWidth}>{RenderHtml(t("common.domainVerification.popup.sections.verifyDomain.text"))}</Box>
            <Box className={classes.fullFlexColumn}>
                <Button
                    className={clsx(classes.btn, classes.btnRounded, classes.f14, 'flexEnd')}
                    onClick={verifyDomainRegularity}
                >
                    {t('common.domainVerification.popup.sections.verifyDomain.button')}
                    {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                </Button>
            </Box>
        </Grid>
    }

    const BuyVerifiedDomain = () => {
        return <Grid container>
            <Box className={classes.fullWidth}>{RenderHtml(t("common.domainVerification.popup.sections.buyVerifiedDomain.text"))}</Box>
        </Grid>
    }

    const SharedDomain = () => {
        return <Grid container>
            <Box className={classes.fullWidth}>{RenderHtml(t("common.domainVerification.popup.sections.sendFromSharedDomain.text"))}</Box>
            <Box className={classes.fullFlexColumn}>
                {!sharedDomainReady && <Button
                    className={clsx(classes.btn, classes.btnRounded, classes.f14, 'flexEnd')}
                    onClick={verifySharedDomainCreated}
                >
                    {t('common.domainVerification.popup.sections.verifyDomain.button')}
                    {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                </Button>}
                {sharedDomainReady && <Button
                    className={clsx(classes.btn, classes.btnRounded, classes.f14, 'flexEnd')}
                    onClick={verifySharedDomainCreated}
                >
                    {t('common.domainVerification.popup.sections.sendFromSharedDomain.button')}
                    {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                </Button>}
            </Box>
        </Grid>
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
                    <VerifyDomain />
                </AccordionDetails>
            </Accordion>
            <Accordion
                expanded={activeAccordion === 2}
                className={clsx(classes.noBoxShadow, localClasses.expandedBox)}
                key={1}
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
                    <BuyVerifiedDomain />
                </AccordionDetails>
            </Accordion>
            <Accordion
                expanded={activeAccordion === 3}
                className={clsx(classes.noBoxShadow, localClasses.expandedBox)}
                key={1}
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
                    <SharedDomain />
                </AccordionDetails>
            </Accordion>
        </Box>}
    />) : (<></ >)
}

export default DomainVerification;