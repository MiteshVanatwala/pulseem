import { MdDomain } from "react-icons/md";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Box, Checkbox, Divider, FormControl, FormControlLabel, Grid, Input, Link, ListItemText, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../../../Models/StateTypes";
import { useEffect, useState } from "react";
import { getAuthorizedEmails } from "../../../../redux/reducers/commonSlice";
import { logout } from "../../../../helpers/Api/PulseemReactAPI";
import { Loader } from "../../../../components/Loader/Loader";
import { AiOutlineStop } from "react-icons/ai";
import CustomTooltip from "../../../../components/Tooltip/CustomTooltip";
import { RenderHtml } from "../../../../helpers/Utils/HtmlUtils";
import PulseemTags from "../../../../components/Tags/PulseemTags";
import { BiPlus } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import { WebformsToReportLeadByApi } from "../../../../Models/LandingPage/WebformsToReportLeadByApi";
const RegistrationToApiForm = ({
    classes,
    webformsToReportLeadByApi,
    isNew = false,
    isOpen = false,
    onClose,
    onConfirm }: any) => {
    const { t } = useTranslation();
    const [showLoader, setShowLoader] = useState<boolean>(true);
    const { isRTL } = useSelector((state: StateType) => state.core);
    const dispatch = useDispatch();
    const [regModel, setRegModel] = useState<WebformsToReportLeadByApi>({
        ID: 0,
        Name: '',
        RequestUrl: '',
        RequestPostParams: '',
        IsOptinSend: false
    });
    const [requestType, setRequestType] = useState<any>('Get');

    useEffect(() => {
        setShowLoader(false)
    }, []);

    const handleResponses = (response: any) => {
        switch (response?.StatusCode) {
            case 201: {

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

    return <BaseDialog
        customContainerStyle={classes.summaryContainer}
        disableBackdropClick={false}
        classes={classes}
        icon={<MdDomain className={classes.notifyIconWhite} />}
        open={isOpen}
        showDefaultButtons={false}
        title={t("landingPages.registrationApi.title")}
        children={<Box className={clsx(classes.fullWidth)}>
            <FormControl>
                <Grid container spacing={3} className={clsx(classes.p15)}>
                    <Grid item md={12} className={classes.w100}>
                        <Typography title={t("landingPages.registrationApi.subTitle")} className={classes.alignDir}>
                            {t("landingPages.registrationApi.subTitle")}
                        </Typography>
                    </Grid>
                    <Divider />

                    <Grid item md={12} className={classes.w100}>
                        <Typography title={t("landingPages.registrationApi.systemName")} className={classes.alignDir}>
                            {t("landingPages.registrationApi.systemName")}
                        </Typography>
                        <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
                            <TextField
                                id="name"
                                label=""
                                variant="outlined"
                                name="Name"
                                value={regModel?.Name}
                                className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100)}
                                autoComplete="off"
                                onChange={(e: any) => setRegModel({ ...regModel, Name: e.target.value })}
                                title={regModel?.Name}
                            />
                        </FormControl>
                    </Grid>

                    <Grid item md={3} className={classes.w100}>
                        <Typography title={t("landingPages.registrationApi.methodType")} className={classes.alignDir}>
                            {t("landingPages.registrationApi.methodType")}
                        </Typography>

                        <Select
                            variant="standard"
                            name="requestType"
                            value={requestType}
                            className={clsx(classes.w100, classes.mt10)}
                            onChange={(event, val) => setRequestType(event.target.value)}
                            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                        direction: isRTL ? 'rtl' : 'ltr'
                                    },
                                },
                            }}
                        >
                            <MenuItem value={'Get'}>Get</MenuItem>
                            <MenuItem value={'Post'}>Post</MenuItem>
                            <MenuItem value={'Put'}>Put</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item md={5} className={classes.w100}>
                        <Typography title={t("landingPages.registrationApi.requestUrl")} className={classes.alignDir}>
                            {t("landingPages.registrationApi.requestUrl")}
                        </Typography>
                        <TextField
                            id="requestUrl"
                            label=""
                            variant="outlined"
                            name="requestUrl"
                            value={regModel.RequestUrl}
                            className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
                            autoComplete="off"
                            onChange={(e: any) => setRegModel({ ...regModel, RequestUrl: e.target.value })}
                            title={regModel.RequestUrl}
                        />
                    </Grid>

                    <Grid item md={4} className={classes.w100} style={{ display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={regModel.IsOptinSend}
                                    onChange={() => setRegModel({ ...regModel, IsOptinSend: !regModel.IsOptinSend })}
                                    name="IsOptinSend"
                                    color="primary"
                                />
                            }
                            label={t('landingPages.registrationApi.isOptIn')}
                        />
                    </Grid>
                </Grid>
            </FormControl>
            <Loader isOpen={showLoader} />
        </Box>}
        onConfirm={() => {
            onConfirm && onConfirm();
        }}
        onClose={() => {
            onClose && onClose();
        }}
        onCancel={() => {
            onClose && onClose();
        }}
    />
}
export default RegistrationToApiForm;