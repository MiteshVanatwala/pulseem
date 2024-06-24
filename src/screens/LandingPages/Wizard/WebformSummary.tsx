import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { StateType } from "../../../Models/StateTypes";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PulseemResponse } from "../../../Models/APIResponse";
import { logout } from "../../../helpers/Api/PulseemReactAPI";
import { getById } from "../../../redux/reducers/landingPagesSlice";
import DefaultScreen from "../../DefaultScreen";
import { Title } from "../../../components/managment/Title";
import clsx from 'clsx'
import { Box, Button, Divider, Grid, Typography } from "@material-ui/core";
import { LangugeCode } from "../../../model/PulseemFields/Fields";
import { getGroupsBySubAccountId } from "../../../redux/reducers/groupSlice";
import { Loader } from "../../../components/Loader/Loader";
import { WebformsToReportLeadByApi } from "../../../Models/LandingPage/WebformsToReportLeadByApi";
import moment from "moment";
import { DateFormats } from "../../../helpers/Constants";
import WizardActions from "../../../components/Wizard/WizardActions";
import useRedirect from "../../../helpers/Routes/Redirect";
import { sitePrefix } from "../../../config";
import { RedirectPropTypes } from "../../../helpers/Types/Redirect";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";

const WebformSummary = ({ classes }: any) => {
    const { id } = useParams();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const Redirect = useRedirect();
    const { isRTL, windowSize } = useSelector((state: StateType) => state.core);
    const { subAccountAllGroups } = useSelector((state: StateType) => state.group);
    const [showLoader, setShowLoader] = useState<boolean>(true);
    // @ts-ignore
    const [webForm, setWebForm] = useState<LandingPageModel>({ PageName: '' });
    const [wfIntegrations, setWFIntegrations] = useState<WebformsToReportLeadByApi[]>([]);

    const getData = async () => {
        if (!subAccountAllGroups || subAccountAllGroups?.length === 0) {
            //@ts-ignore
            await dispatch(getGroupsBySubAccountId())
        }
        //@ts-ignore
        const response = await dispatch(getById(id)) as any;
        handleResponse(response.payload);
    }

    const handleResponse = (payload: PulseemResponse) => {
        switch (payload.StatusCode) {
            case 201: {
                setWebForm(payload?.Data?.WebForm);
                setWFIntegrations(payload?.Data?.WebformsToReportLeadByApi);
                break;
            }
            case 401: {
                logout();
                break;
            }
            case 404: {
                break;
            }
        }
        setShowLoader(false);
    }

    useEffect(() => {
        getData();
    }, [])

    const renderLanguage = (lang: number) => {
        const currentLang = LangugeCode.filter((l: any) => { return l.value === lang }) as any;
        return t(currentLang[0]?.label);
    }

    return <DefaultScreen
        currentPage='SurveyDetails'
        classes={classes}
        containerClass={clsx(classes.management, classes.mb50)}>
        <Box className={'topSection'}>
            <Title
                classes={classes}
                Text={t('landingPages.publish')}
            />
            <Box style={{ padding: 25, maxWidth: 900, margin: '0 auto' }}>
                {/* <Box style={{ padding: 25 }}> */}
                <Grid container spacing={1}>
                    <Grid item xs={4}>
                        <Typography className={classes.bold}>{t("landingPages.formName")}</Typography>
                        <Typography title={webForm.PageName} className={classes.ellipsisText}>{webForm.PageName}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography className={classes.bold}>{t('common.campaignType')}</Typography>
                        <Typography>{t('landingPages.WebForm')}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography className={classes.bold}>{t('landingPages.webformLanguage')}</Typography>
                        <Typography>{renderLanguage(webForm.BaseLanguage)}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider style={{ margin: '10px 0px' }} />
                    </Grid>
                    <Grid item xs={4}>
                        <Typography className={classes.bold}>{t('landingPages.answerType')}</Typography>
                        <Typography>{t('landingPages.systemDefaultMessage')}</Typography>
                    </Grid>
                    {subAccountAllGroups?.length > 0 && <Grid item xs={4}>
                        <Typography className={classes.bold}>{t('landingPages.groupsForSubscribers')}</Typography>
                        {webForm.SelectedGroupList?.map((groupId: any) => {
                            const groupFound = subAccountAllGroups?.find((g: any) => {
                                return g?.GroupID === parseInt(groupId)
                            });
                            return <Typography title={groupFound?.GroupName} className={classes.ellipsisText}>{groupFound?.GroupName}</Typography>
                        })}
                    </Grid>}
                    <Grid item xs={4}>
                        <Typography className={classes.bold}>{t('landingPages.limitNumberOfSubscribers')}</Typography>
                        <Typography title={webForm.SubscriptionsLimit > 0 ? webForm.SubscriptionsLimit : t('common.disabled')} className={classes.ellipsisText}>{webForm.SubscriptionsLimit > 0 ? webForm.SubscriptionsLimit : t('common.disabled')}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider style={{ margin: '10px 0px' }} />
                    </Grid>
                    <Grid item xs={4}>
                        <Typography className={classes.bold}>{t('landingPages.formOfflineDate')}</Typography>
                        <Typography title={webForm.OfflineDate ? moment(webForm.OfflineDate).format(DateFormats.IL_DATE_ONLY) : t('common.notSet')}>{webForm.OfflineDate ? moment(webForm.OfflineDate).format(DateFormats.IL_DATE_ONLY) : t('common.notSet')}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography className={classes.bold}>{t('landingPages.redirectURLWhenOffline')}</Typography>
                        <Typography title={webForm.OfflineUrl} className={classes.ellipsisText}>{webForm.OfflineUrl || t('common.notSet')}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography className={classes.bold}>{t('landingPages.reportLeadsToEmails')}</Typography>
                        {webForm?.EmailsToReport?.split(',')?.length > 0 ? webForm?.EmailsToReport.split(',')?.map((email: string) => {
                            return <Typography className={classes.ellipsisText}>{email}</Typography>
                        }) : <>{t('common.notSet')}</>}
                    </Grid>
                    {/* <Grid item xs={4}>
                        <Typography className={classes.bold}>{t('landingPages.reportLeadsToEmails')}</Typography>
                        {wfIntegrations?.length > 0 ? webForm.Systems?.map((sysId: any) => {
                            const sysFound = wfIntegrations.find((s) => { return s.ID === parseInt(sysId) }) as WebformsToReportLeadByApi;
                            return <Typography>{sysFound.Name}</Typography>
                        }) : <>Not set</>}
                    </Grid> */}
                    <Grid item xs={12}>
                        <Divider style={{ margin: '10px 0px' }} />
                    </Grid>
                    <Grid item xs={4}>
                        <Typography className={classes.bold}>{t('landingPages.doubleOptIn')}</Typography>
                        <Typography>{webForm.DoubleOptin ? t('common.enabled') : t('common.disabled')}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography className={classes.bold}>{t('landingPages.commentsToForm')}</Typography>
                        <Typography>{webForm.HasComments ? t('common.enabled') : t('common.disabled')}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography className={classes.bold}>{t('landingPages.facebookLikes')}</Typography>
                        <Typography>{webForm.FacebookPrefunPage ? t('common.enabled') : t('common.disabled')}</Typography>
                    </Grid>
                </Grid>
            </Box>
        </Box>
        <Loader isOpen={showLoader} showBackdrop={true} />
        <Box>
            <WizardActions
                classes={classes}
                // @ts-ignore
                onBack={{
                    callback: () => Redirect({ url: `${sitePrefix}LandingPages/${id}` } as RedirectPropTypes)
                }}
                // @ts-ignore
                additionalButtons={<Button onClick={() => { Redirect({ url: `${sitePrefix}EditRegistrationPage` } as RedirectPropTypes) }}
                    className={clsx(
                        classes.btn,
                        classes.btnRounded,
                        classes.backButton
                    )}
                    endIcon={!isRTL ? <MdArrowForwardIos /> : <MdArrowBackIos />}
                    style={{ margin: '8px' }}
                >{t("master.RadMenuItemLandingManagement.Text")}</Button>}
            />
        </Box>
    </DefaultScreen>
}

export default WebformSummary;