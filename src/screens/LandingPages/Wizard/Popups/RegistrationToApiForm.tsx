import { MdDomain } from "react-icons/md";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Box, Button, Checkbox, Divider, FormControl, FormControlLabel, Grid, Select, TextField, Typography } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../../../Models/StateTypes";
import { useEffect, useState } from "react";
import { Loader } from "../../../../components/Loader/Loader";
import { IoIosArrowDown, IoMdCloseCircle } from "react-icons/io";
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
    const { isRTL } = useSelector((state: StateType) => state.core);
    const { AccountExtraFields } = useSelector((state: StateType) => state.extraFields);

    const [errors, setErrors] = useState({
        Name: "",
        RequestUrl: "",
        RequestPostParams: ""
    })

    const dispatch = useDispatch();
    const [regModel, setRegModel] = useState<WebformsToReportLeadByApi>({
        ID: 0,
        Name: '',
        RequestUrl: '',
        RequestPostParams: '',
        IsOptinSend: false,
        CountWebForms: 0
    });
    const [requestType, setRequestType] = useState<any>('Get');
    const AvailableParamList = {
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
    };
    const [apiAvailableParams, setApiAvailableParams] = useState<any>(AvailableParamList);
    const [dynamicParams, setDynamicParams] = useState<any>({});
    // const [finalParams, setFinalParams] = useState<string>('');
    const [showWizard, setShowWizard] = useState<boolean>(false);
    const [extraParameters, setExtraParameters] = useState<{
        [key: string]: string;
    }>({});
    const availableParamKeys = Object.keys(apiAvailableParams);

    const getExtraFields = async () => {
        if (!AccountExtraFields?.data) {
            await dispatch(GetExtraFields());
        }
    }

    useEffect(() => {
        getExtraFields();
        setShowLoader(false);
    }, []);

    const updatedParamObject = (value: string, item: string) => {
        const newObj = { ...dynamicParams };
        let finalItem = `${value}=##${item}##`
        newObj[`##${item}##`] = finalItem;

        if (value === '') {
            delete newObj[`##${item}##`];
        }

        return newObj;
    }

    useEffect(() => {
        if (apiIntegration && apiIntegration?.ID > 0) {
            setRegModel(apiIntegration);
            // Post
            const updArr = {} as any;
            const extraParam = {} as any;
            if (apiIntegration.RequestPostParams !== null && apiIntegration.RequestPostParams.trim() !== '') {
                setRequestType('Post');
                apiIntegration.RequestPostParams?.split('&')?.forEach((qs: any) => {
                    const val = qs?.split('=');
                    if (availableParamKeys.indexOf(val[1].replace(/##/g, '')) > -1) updArr[val[1]] = qs;
                    else extraParam[val[0]] = val[1]
                })
            }
            else { //Get
                setRequestType('Get');
                const urlArr = apiIntegration.RequestUrl.split('?');
                urlArr[1]?.split('&')?.forEach((qs: any) => {
                    const val = qs?.split('=');
                    if (availableParamKeys.indexOf(val[1].replace(/##/g, '')) > -1) updArr[val[1]] = qs;
                    else extraParam[val[0]] = val[1]
                })
            }
            setExtraParameters(extraParam);
            setDynamicParams(updArr);
        }
        else {
            setRegModel({
                ID: 0,
                Name: '',
                RequestUrl: '',
                RequestPostParams: '',
                IsOptinSend: false
            })
            setDynamicParams({});
            setExtraParameters({});
        }
    }, [apiIntegration, isOpen])

    useEffect(() => {
        if (AccountExtraFields && AccountExtraFields?.Data) {
            const obj = AccountExtraFields?.Data;
            setApiAvailableParams({ ...apiAvailableParams, ...obj })
        }
    }, [AccountExtraFields])

    const handleParam = (e: any, item: any) => {
        const newObj = updatedParamObject(e.target.value, item);
        setDynamicParams(newObj)
        const arr = Object.values(newObj);

        let reqUrl = requestType.toLowerCase() === 'get' ? `${regModel.RequestUrl?.split('?')[0]}?${arr.length > 0 ? arr.join('&') : ''}` : regModel.RequestUrl;
        
        let extraParametersURL = '';
        if (Object.keys(extraParameters).length) {
            Object.keys(extraParameters).map((key: any) => {
                extraParametersURL += `&${key}=${extraParameters[key]}`;
            });
        }
        if (reqUrl === '?' && extraParametersURL === '') {
            reqUrl = '';
        }
        setRegModel({
            ...regModel,
            RequestPostParams: (arr.length > 0 ? arr.join('&') : '') + extraParametersURL,
            RequestUrl: reqUrl + (requestType.toLowerCase() === 'get' ? extraParametersURL : '')
        });
    }

    const onSubmit = async () => {
        if (formIsValdid()) {
            // @ts-ignore
            await dispatch(setApiIntegration({
                ...regModel,
                RequestPostParams: requestType.toLowerCase() === 'get' ? '' : regModel.RequestPostParams,
                RequestUrl: requestType.toLowerCase() === 'get' ? regModel.RequestUrl : regModel?.RequestUrl?.split('?')[0],
            }));
            onConfirm();
        }
    }
    const formIsValdid = () => {
        const err = { Name: '', RequestUrl: '', RequestPostParams: '' };
        let isValid = true;
        setErrors(err);

        if (regModel.Name === '') {
            err.Name = t('common.requiredField');
            isValid = false;
        }
        if (regModel.RequestUrl === '') {
            err.RequestUrl = t('common.requiredField');
            isValid = false;
        }
        if (requestType.toLowerCase() === 'post' && regModel.RequestPostParams === '') {
            err.RequestPostParams = t('common.requiredField');
            isValid = false;
        }
        if (!isValid) {
            setErrors({ ...errors, ...err });
        }

        return isValid;
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

    const renderDynamicItem = (item: any) => {
        if (item && item !== '' && dynamicParams[`##${item}##`]) {
            return dynamicParams[`##${item}##`]?.split('=')[0];
        }
        return '';
    }

    const renderRequestUrlValue = () => {
        if (requestType.toLowerCase() === 'get') {
            return regModel.RequestUrl;
        }

        const splittedUrl = regModel.RequestUrl?.split('?');
        if (splittedUrl && splittedUrl?.length >= 1) {
        }
        return regModel.RequestUrl?.split('?')[0]
    }

    useEffect(() => {
        const splittedUrl = regModel?.RequestUrl?.split('?') || ['', ''];
        if (requestType.toLowerCase() === 'get') {
            setRegModel({
                ...regModel,
                RequestPostParams: '',
                RequestUrl: `${splittedUrl[0]}?${regModel.RequestPostParams !== '' ? regModel.RequestPostParams : splittedUrl[1]}`
            });
            processRequestURL(`${splittedUrl[0]}?${regModel.RequestPostParams !== '' ? regModel.RequestPostParams : splittedUrl[1]}`);
        }
        else {
            if (splittedUrl && splittedUrl?.length >= 1) {
                setRegModel({ ...regModel, RequestUrl: splittedUrl[0], RequestPostParams: regModel.RequestPostParams || splittedUrl[1] });
                processRequestURL(`${splittedUrl[0]}?${regModel.RequestPostParams || splittedUrl[1]}`);
            }
        }
    }, [requestType])

    const removeExtraField = (item: string) => {
        const extraParams = { ...extraParameters };
        setRegModel({
            ...regModel,
            RequestUrl: regModel?.RequestUrl?.replace(`&${item}=${extraParams[item]}`, ''), 
            RequestPostParams: regModel?.RequestPostParams?.replace(`&${item}=${extraParams[item]}`, ''), 
        })
        delete extraParams[item];
        setExtraParameters(extraParams);
    }

    const processRequestURL = (requestURL: string) => {
        const parameters = requestURL.split('?')[1]?.split('&');
        if (parameters?.length) {
            const extraParams: any = {}
            const updArr = {} as any;
            if (requestType.toLowerCase() === 'post') {
                parameters.forEach((qs: any) => {
                    const val = qs?.split('=');
                    if (availableParamKeys.indexOf(val[1]?.replace(/##/g, '')) > -1) updArr[val[1]] = qs;
                    else extraParams[val[0]] = val[1];
                })
            }
            else { //Get
                parameters.forEach((qs: any) => {
                    const val = qs?.split('=');
                    if (availableParamKeys.indexOf(val[1]?.replace(/##/g, '')) > -1) updArr[val[1]] = qs;
                    else extraParams[val[0]] = val[1];
                })
            }
            setDynamicParams(updArr);
            setExtraParameters(extraParams)
        }
    }

    const updateKeyValue = (key: string, value: string) => {
        let domain: any = '';
        let querystring: any = ''
        let url = '';
        if (requestType.toLowerCase() === 'get') {
            const reqURL = regModel?.RequestUrl?.split('?') || ['', ''];
            domain = reqURL[0];
            querystring = reqURL[1];
        } else {
            domain = regModel?.RequestUrl?.split('?')[0];
            querystring = regModel?.RequestPostParams;
        }

        querystring.split('&').map((item: any) => {
            if (item.split('=')[0] === key) {
                url += `${key}=${value}&`;
            } else {
                url += `${item}&`; 
            }
        })
        setRegModel({
            ...regModel,
            RequestUrl: `${domain}?${url?.slice(0, -1)}`,
            RequestPostParams: url?.slice(0, -1)
        })
    }

    const renderURLKey = (item: string) => {
        return Object.keys(AvailableParamList).indexOf(item) > -1 ? `##${item}##` : item;
    }

    return <BaseDialog
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
                            className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, errors.Name !== '' ? classes.error : null)}
                            autoComplete="off"
                            onChange={(e: any) => {
                                if (e.target.value !== '') {
                                    setErrors({ ...errors, Name: '' });
                                }
                                setRegModel({ ...regModel, Name: e.target.value })
                            }}
                            title={regModel?.Name}
                        />
                        {errors.Name !== '' && <Box className='textBoxWrapper'>
                            <Typography className={clsx(errors.Name ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                                {errors.Name}
                            </Typography>
                        </Box>}

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
                            style={{ direction: regModel.RequestUrl !== '' ? 'ltr' : 'unset' }}
                            value={renderRequestUrlValue()}
                            className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100, errors.RequestUrl !== '' ? classes.error : null)}
                            autoComplete="off"
                            onChange={(e: any) => {
                                if (e.target.value === '') {
                                    e.target.style.direction = null;
                                }
                                else {
                                    setErrors({ ...errors, RequestUrl: '' });
                                    e.target.style.direction = "ltr";
                                }
                                setRegModel({ ...regModel, RequestUrl: e.target.value })
                                processRequestURL(e.target.value);
                            }}
                            title={regModel.RequestUrl}
                            onBlur={(e: any) => {
                                if (e.target.value === '') {
                                    e.target.style.direction = null;
                                }
                                else {
                                    e.target.style.direction = "ltr";
                                }
                            }}
                        />
                        {errors.RequestUrl !== '' && <Box className='textBoxWrapper'>
                            <Typography className={clsx(errors.RequestUrl ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                                {errors.RequestUrl}
                            </Typography>
                        </Box>}
                        <Grid item md={12} className={classes.w100} style={{ paddingTop: 0 }}>
                            <Typography title={t("landingPages.registrationApi.requestUrl")} style={{ fontSize: 14, margin: 0, fontWeight: 900 }}>
                                {requestType.toLowerCase() === 'get' ? t('landingPages.registrationApi.getExample') : t('landingPages.registrationApi.postExample')}
                            </Typography>
                        </Grid>
                    </Grid>
                    {requestType.toLowerCase() === 'post' && <Grid item md={12} className={classes.w100}>
                        <Typography title={t("landingPages.registrationApi.requestUrl")} className={classes.alignDir}>
                            {t('common.parameters')}
                        </Typography>
                        <textarea
                            id="finalParams"
                            placeholder={t('landingPages.typeParameters')}
                            name="finalParams"
                            style={{ height: 80, border: '1px solid #D6D1E6', direction: regModel?.RequestPostParams !== '' ? 'ltr' : isRTL ? 'rtl' : 'ltr' }}
                            value={regModel.RequestPostParams}
                            className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
                            autoComplete="off"
                            onChange={(e: any) => {
                                if (e.target.value === '') {
                                    e.target.style.direction = null;
                                }
                                else {
                                    e.target.style.direction = "ltr";
                                }
                                setRegModel({ ...regModel, RequestPostParams: e.target.value });
                                processRequestURL(`${regModel.RequestUrl}?${e.target.value}`);
                            }}
                            onBlur={(e: any) => {
                                if (e.target.value === '') {
                                    e.target.style.direction = null;
                                }
                                else {
                                    e.target.style.direction = "ltr";
                                }
                            }}
                            title={regModel.RequestPostParams}
                        />
                        {errors.RequestPostParams !== '' && <Box className='textBoxWrapper'>
                            <Typography className={clsx(errors.RequestPostParams ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                                {errors.RequestPostParams}
                            </Typography>
                        </Box>}
                        <Typography title={t("landingPages.registrationApi.postParamsExample")} style={{ fontSize: 14, margin: 0, fontWeight: 900 }}>
                            {t('landingPages.registrationApi.postParamsExample')}
                        </Typography>
                    </Grid>}
                    {/* <Grid item md={12} className={classes.w100} style={{ paddingTop: 0 }}>
                        <Typography title={t("landingPages.registrationApi.requestUrl")} style={{ direction: 'ltr', fontSize: 14, margin: 0, fontWeight: 900 }}>
                            {`${ regModel.RequestUrl }${ regModel.RequestPostParams !== '' ? '?' : '' }${ regModel.RequestPostParams } `}
                        </Typography>
                    </Grid> */}
                </Grid>
                <Grid container spacing={3} className={classes.p15}>
                    {
                        Object.keys(extraParameters).map((item: any) => {
                            return <Grid key={`key_${item} `} item md={12} className={classes.dFlex} style={{ alignItems: 'center', height: 50 }}>
                                <Grid item md={4} sm={6}>{item}</Grid>
                                <Grid item md={4} sm={6}>
                                    <TextField
                                        placeholder={`${t('landingPages.registrationApi.typeParamFor')} ${extraParameters[item]} `}
                                        id={item}
                                        variant="outlined"
                                        name={item}
                                        value={extraParameters[item]}
                                        className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100)}
                                        autoComplete="off"
                                        onChange={(e: any) => {
                                            setExtraParameters({
                                                ...extraParameters,
                                                [item]: e.target.value
                                            });
                                            updateKeyValue(item, e.target.value);
                                        }}
                                        title={extraParameters[item]}
                                    >
                                    </TextField>
                                </Grid>
                                <Grid item md={4} sm={6} className={clsx(classes.paddingSides15, classes.pt10)}>
                                    <IoMdCloseCircle size={20} className={clsx(classes.textRed, classes.cursorPointer)} onClick={() => removeExtraField(item)} />
                                </Grid>
                            </Grid>
                        })
                    }
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
                    {availableParamKeys.map((item) => {
                        return apiAvailableParams[item] !== '' && <Grid key={`key_${item} `} item md={12} className={classes.dFlex} style={{ alignItems: 'center', height: 50 }}>
                            <Grid item md={4} sm={6}>{apiAvailableParams[item]} ({renderURLKey(item)})</Grid>
                            <Grid item md={4} sm={6}>
                                {showWizard &&
                                    <TextField
                                        placeholder={`${t('landingPages.registrationApi.typeParamFor')} ${apiAvailableParams[item]} `}
                                        id={item}
                                        variant="outlined"
                                        name={item}
                                        value={renderDynamicItem(item)}
                                        className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100)}
                                        autoComplete="off"
                                        onChange={(e: any) => {
                                            handleParam(e, item);
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