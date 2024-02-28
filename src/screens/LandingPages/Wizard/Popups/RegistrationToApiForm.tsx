import { MdDomain } from "react-icons/md";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Box, Button, Checkbox, Divider, FormControl, FormControlLabel, Grid, Select, TextField, Typography } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../../../Models/StateTypes";
import { useEffect, useState } from "react";
import { logout } from "../../../../helpers/Api/PulseemReactAPI";
import { Loader } from "../../../../components/Loader/Loader";
import { IoIosArrowDown } from "react-icons/io";
import { WebformsToReportLeadByApi } from "../../../../Models/LandingPage/WebformsToReportLeadByApi";
import { GetExtraFields } from "../../../../redux/reducers/ExtraFieldsSlice";
import { deleteApiIntegration, setApiIntegration } from "../../../../redux/reducers/landingPagesSlice";

const RegistrationToApiForm = ({
    classes,
    apiIntegration,
    webFormId = 0,
    isNew = false,
    isOpen = false,
    onClose,
    onConfirm }: any) => {
    const { t } = useTranslation();
    const [showLoader, setShowLoader] = useState<boolean>(true);
    // const { isRTL } = useSelector((state: StateType) => state.core);
    const { AccountExtraFields } = useSelector((state: StateType) => state.extraFields);

    const dispatch = useDispatch();
    const [regModel, setRegModel] = useState<WebformsToReportLeadByApi>({
        ID: 0,
        Name: '',
        RequestUrl: '',
        RequestPostParams: '',
        IsOptinSend: false
    });
    const [requestType, setRequestType] = useState<any>('Get');
    const [apiAvailableParams, setApiAvailableParams] = useState<any>({
        'Email': t(`common.email`),
        'FirstName': t(`smsReport.firstName`),
        'LastName': t(`smsReport.lastName`),
        'Telephone': t(`common.telephone`),
        'Cellphone': t(`common.cellphone`),
        'Address': t(`common.address`),
        'City': t(`common.city`),
        'State': t(`common.state`),
        'Country': t(`common.country`),
        'Zip': t(`common.zip`),
        'Company': t(`common.company`),
        'BirthDate': t(`common.birthDate`),
        'ReminderDate': t(`recipient.reminderDate`),
    });
    const [dynamicParams, setDynamicParams] = useState<any>({});
    // const [finalParams, setFinalParams] = useState<string>('');
    const [showWizard, setShowWizard] = useState<boolean>(false);


    const getExtraFields = async () => {
        if (!AccountExtraFields?.data) {
            await dispatch(GetExtraFields());
        }
    }

    useEffect(() => {
        getExtraFields();
        setShowLoader(false);
    }, []);

    useEffect(() => {
        if (regModel?.RequestUrl && regModel.RequestUrl !== '') {
            if (regModel.RequestUrl.indexOf('?') > -1) {
                setRequestType('Get');
            }
            else {
                setRequestType('Post');
            }
        }
    }, [regModel?.RequestUrl]);

    useEffect(() => {
        if (apiIntegration && apiIntegration?.ID > 0) {
            setRegModel(apiIntegration);
        }
    }, [apiIntegration])

    useEffect(() => {
        if (AccountExtraFields && AccountExtraFields?.Data) {
            const obj = AccountExtraFields?.Data;
            setApiAvailableParams({ ...apiAvailableParams, ...obj })
        }
    }, [AccountExtraFields])

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

    const handleParams = (e: any, item: any) => {
        const newObj = { ...dynamicParams };
        let finalItem = `${e.target.value}=##${item}##`
        newObj[`##${item}##`] = finalItem;

        if (e.target.value === '') {
            delete newObj[`##${item}##`];
        }

        setDynamicParams(newObj)
        const arr = Object.values(newObj);
        // setFinalParams(arr.length > 0 ? arr.join('&') : '');
        setRegModel({ ...regModel, RequestPostParams: arr.length > 0 ? arr.join('&') : '' })
    }

    const onSubmit = async () => {
        // @ts-ignore
        await dispatch(setApiIntegration(regModel));
        onConfirm();
    }
    const onDelete = async () => {
        // @ts-ignore
        await dispatch(deleteApiIntegration({ webFormId: webFormId, id: regModel.ID }));
        onConfirm();
        handleClose();
    }

    const handleClose = () => {
        onClose && onClose();
        setRegModel({
            ID: 0,
            Name: '',
            RequestUrl: '',
            RequestPostParams: '',
            IsOptinSend: false
        });
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
                        <Typography title={t("landingPages.registrationApi.subTitle")} className={clsx(classes.alignDir, classes.bold)}>
                            {t("landingPages.registrationApi.subTitle")}
                        </Typography>
                        <Divider />
                    </Grid>

                    <Grid item md={4} className={classes.w100}>
                        <Typography title={t("landingPages.registrationApi.systemName")} className={classes.alignDir}>
                            {t("landingPages.registrationApi.systemName")}
                        </Typography>
                        <TextField
                            id="name"
                            placeholder={t("landingPages.registrationApi.systemName")}
                            variant="outlined"
                            name="Name"
                            value={regModel?.Name}
                            className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100)}
                            autoComplete="off"
                            onChange={(e: any) => {
                                setRegModel({ ...regModel, Name: e.target.value })
                            }}
                            title={regModel?.Name}
                        />

                    </Grid>

                    <Grid item md={4} className={clsx(classes.w100)}>
                        <Typography title={t("landingPages.registrationApi.methodType")} className={classes.alignDir}>
                            {t("landingPages.registrationApi.methodType")}
                        </Typography>

                        <Select
                            variant="standard"
                            name="requestType"
                            value={requestType}
                            native
                            className={clsx(classes.textField, classes.w100, classes.selectField)}
                            onChange={(event, val) => setRequestType(event.target.value)}
                            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                        direction: 'ltr'
                                    },
                                },
                            }}
                        >
                            <option key='get' value={'Get'}>Get</option>
                            <option key='post' value={'Post'}>Post</option>
                            {/* <option value={'Put'}>Put</option> */}
                        </Select>
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
                    <Grid item md={12} className={classes.w100}>
                        <Typography title={t("landingPages.registrationApi.requestUrl")} className={classes.alignDir}>
                            {t("landingPages.registrationApi.requestUrl")}
                        </Typography>
                        <TextField
                            id="requestUrl"
                            placeholder={t("landingPages.registrationApi.requestUrl")}
                            variant="outlined"
                            name="requestUrl"
                            style={{ direction: 'ltr' }}
                            value={regModel.RequestUrl}
                            className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
                            autoComplete="off"
                            onChange={(e: any) => {
                                setRegModel({ ...regModel, RequestUrl: e.target.value })
                            }}
                            title={regModel.RequestUrl}
                        />
                    </Grid>
                    <Grid item md={12} className={classes.w100}>
                        <Typography title={t("landingPages.registrationApi.requestUrl")} className={classes.alignDir}>
                            פרמטרים
                        </Typography>
                        <textarea
                            id="finalParams"
                            placeholder='הזן פרמטרים או השתמש באשף'
                            name="finalParams"
                            style={{ direction: 'ltr', height: 80, border: '1px solid #D6D1E6' }}
                            value={regModel.RequestPostParams}
                            className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
                            autoComplete="off"
                            onChange={(e: any) => {
                                setRegModel({ ...regModel, RequestPostParams: e.target.value })
                            }}
                            title={regModel.RequestPostParams}
                        />
                    </Grid>
                    <Grid item md={12} className={classes.w100} style={{ paddingTop: 0 }}>
                        <Typography title={t("landingPages.registrationApi.requestUrl")} style={{ direction: 'ltr', fontSize: 14, margin: 0, fontWeight: 900 }}>
                            {`${regModel.RequestUrl}${regModel.RequestPostParams !== '' ? '?' : ''}${regModel.RequestPostParams}`}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container spacing={3} className={classes.p15}>
                    <Grid item md={12} className={clsx(classes.w100, classes.dFlex)} style={{ alignItems: 'center' }}>
                        <Grid item md={4}>
                            <Box className={classes.dFlex}>
                                <Typography title={t("landingPages.registrationApi.availableParameters")} className={clsx(classes.alignDir, classes.bold)}>
                                    {t("landingPages.registrationApi.availableParameters")}
                                </Typography>
                            </Box>
                        </Grid>
                        {showWizard && <Grid item md={4}>
                            <Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                                <Typography title={t("landingPages.registrationApi.parameterInExtrnalSystem")} className={clsx(classes.alignDir, classes.bold)}>
                                    {t("landingPages.registrationApi.parameterInExtrnalSystem")}
                                </Typography>
                            </Box>
                        </Grid>}
                        <Grid item>
                            <Button onClick={() => setShowWizard(!showWizard)} style={{ border: 'none', background: 'white', textDecoration: 'underline' }}>{t('landingPages.registrationApi.showWizard')}</Button>
                        </Grid>
                    </Grid>
                    {Object.keys(apiAvailableParams).map((item) => {
                        return apiAvailableParams[item] !== '' && <Grid item md={12} className={classes.dFlex} style={{ alignItems: 'center', height: 50 }}>
                            <Grid item md={4} sm={6}>{apiAvailableParams[item]} (##{item}##)</Grid>
                            <Grid item md={4} sm={6}>
                                {showWizard &&
                                    <TextField
                                        placeholder={`${t('landingPages.registrationApi.typeParamFor')} ${apiAvailableParams[item]}`}
                                        id={item}
                                        variant="outlined"
                                        name={item}
                                        value={dynamicParams[item]}
                                        className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100)}
                                        autoComplete="off"
                                        onChange={(e: any) => {
                                            handleParams(e, item);
                                        }
                                        }
                                        title={dynamicParams[item]}>

                                    </TextField>
                                }
                            </Grid>
                        </Grid>
                    })}
                </Grid>
            </FormControl>
            <Loader isOpen={showLoader} />
        </Box >}
        renderButtons={() => {
            return <Grid
                container
                spacing={2}
                className={classes.dialogButtonsContainer}
            >
                <Grid item>
                    <Button
                        className={clsx(
                            classes.btn,
                            classes.btnRounded
                        )}
                        onClick={onSubmit}>{t('common.Save')}</Button>
                </Grid>
                {isOpen && !isNew && <Grid item>
                    <Button
                        className={clsx(
                            classes.btn,
                            classes.btnRounded
                        )}
                        onClick={onDelete}>{t('common.Delete')}</Button>
                </Grid>
                }
                <Grid item><Button
                    className={clsx(
                        classes.btn,
                        classes.btnRounded
                    )}
                    onClick={handleClose}>{t('common.Cancel')}</Button>
                </Grid>
            </Grid>
        }}
        onConfirm={() => {
            onConfirm && onConfirm();
        }}
        onClose={() => {
            handleClose();
        }}
        onCancel={() => {
            handleClose();
        }}
    />
}
export default RegistrationToApiForm;