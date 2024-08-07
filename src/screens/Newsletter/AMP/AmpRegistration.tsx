import clsx from 'clsx'
import DefaultScreen from '../../DefaultScreen';
import { Box, Button, Checkbox, FormControl, Grid, InputLabel, ListItemText, MenuItem, Select, Typography } from '@material-ui/core';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { Loader } from '../../../components/Loader/Loader';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAuthorizedEmails } from '../../../redux/reducers/commonSlice';
import { useDispatch, useSelector } from 'react-redux';
import { StateType } from '../../../Models/StateTypes';
import { IoIosArrowDown } from 'react-icons/io';
import { Title } from '../../../components/managment/Title';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { ampApproval } from '../../../redux/reducers/AmpSlice';
import Toast from '../../../components/Toast/Toast.component';
import moment from 'moment';
import 'moment/locale/he';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';

const AmpRegistration = ({ classes }: any) => {
    const [showLoader, setShowLoader] = useState<boolean>(true);
    const [selectedEmail, setSelectedEmail] = useState<string[]>([]);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { verifiedEmails } = useSelector((state: StateType) => state.common);
    const { isRTL } = useSelector((state: StateType) => state.core);
    const ToastMessages = {
        100: { severity: 'error', color: 'error', message: 'campaigns.ampSelectEmail', showAnimtionCheck: false },
        201: { severity: 'success', color: 'success', message: 'campaigns.requestSent', showAnimtionCheck: false },
        401: { severity: 'error', color: 'error', message: 'integrations.authResponses.401', showAnimtionCheck: false },
        500: { severity: 'error', color: 'error', message: 'campaigns.newsLetterEditor.errors.generalError', showAnimtionCheck: false }
    } as any;

    const [toastMessage, setToastMessage] = useState<any>(null);
    const [showAmpRegisterDesc, setShowAmpRegisterDesc] = useState<boolean>(false);

    const init = async () => {
        await dispatch(getAuthorizedEmails());
        setShowLoader(false);
    }
    useEffect(() => {
        init();
    }, []);

    const renderToast = () => {
        setTimeout(() => {
            setToastMessage(null);
        }, 4000);
        return <Toast data={toastMessage} />;
    };

    const sendApprovalRequest = async () => {
        if (selectedEmail?.length > 0) {
            const response: any = await dispatch(ampApproval(selectedEmail));
            if (response?.payload?.StatusCode === 201) {
                setShowAmpRegisterDesc(true);
                setSelectedEmail([]);
            }

            setToastMessage(ToastMessages[response?.payload?.StatusCode])
        }
        else {
            setToastMessage(ToastMessages[100])
        }
    }

    return (
        <DefaultScreen
            currentPage="newsletter"
            subPage={"ampRegistration"}
            classes={classes}
            customPadding={true}
            containerClass={clsx(classes.mb50, classes.editorCont)}
        >
            <Box className={classes.mb50}>
                <Box className={'topSection'}>
                    <Title Text={t('master.ampRegistration')} classes={classes} />
                </Box>
                <Box className={"containerBody"}>
                    <Grid container>
                        <Grid item xs={12}>
                            {RenderHtml(t('campaigns.ampPageText'))}
                        </Grid>
                        <Grid item xs={6}>
                            <Box className={clsx('selectWrapper', classes.mb50)}>
                                <FormControl
                                    className={clsx(classes.selectInputFormControl, classes.w100)}
                                >
                                    <InputLabel htmlFor="FromEmail">{t('campaigns.selectUptoFiveEmails')}</InputLabel>
                                    <Select
                                        // label={t("common.select")}
                                        renderValue={() => {
                                            return <Box className={classes.elipsis} style={{ maxWidth: 'calc(100% - 30px)' }}>{selectedEmail?.join(',')}</Box>
                                        }}
                                        multiple
                                        variant="standard"
                                        id="FromEmail"
                                        value={selectedEmail}
                                        className={clsx(classes.pbt5, classes.fromEmailSelect)}
                                        onChange={(event: any) => {
                                            if (event?.target?.value.length <= 5) {
                                                setSelectedEmail(event?.target?.value);
                                            }
                                        }}
                                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    width: 250
                                                },
                                            },
                                        }}
                                    >
                                        {verifiedEmails?.filter((email: any) => { return email.IsVerified === true }).map((item: any, index: number) => {
                                            return <MenuItem key={index} value={item.Number} style={{ paddingInline: 15, direction: isRTL ? 'rtl' : 'ltr' }}>
                                                <Checkbox checked={selectedEmail.indexOf(item.Number) > -1} disabled={selectedEmail.indexOf(item.Number) === -1 && selectedEmail.length > 4} />
                                                <ListItemText primary={item.Number} style={{ marginInline: 15 }} />
                                                {item.RequestsCount > 0 && <>
                                                    <Box className={clsx(classes.font12, classes.colorGray)} style={{ marginInline: 5 }}>{t('campaigns.lastRequestTime')} <b>{moment(item?.LastRequestTime).format('DD-MM-YYYY HH:mm:ss')}</b></Box>
                                                    <Box className={clsx(classes.font12, classes.colorGray)} style={{ marginInline: 5 }}>{t('campaigns.requestsCount')} <b>{item?.RequestsCount}</b></Box>
                                                </>}
                                            </MenuItem>
                                        })}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>
                        <Grid item xs={12} className={classes.mb50}>
                            <Button onClick={sendApprovalRequest}
                                className={clsx(
                                    classes.btn,
                                    classes.btnRounded
                                )}
                                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                                style={{ margin: '8px' }}
                            >{t('campaigns.sendAmpRequest')}</Button>
                        </Grid>
                    </Grid>

                    <BaseDialog
                        classes={classes}
                        open={showAmpRegisterDesc}
                        title={t("campaigns.sendAmpRequest")}
                        showDivider={true}
                        onClose={() => { setShowAmpRegisterDesc(false) }}
                        onCancel={() => { setShowAmpRegisterDesc(false) }}
                        showDefaultButtons={false}
                    >
                        <Box>
                            <Typography variant="subtitle1">
                                {RenderHtml(t('campaigns.ampRegisterDesc'))}
                            </Typography>
                        </Box>
                    </BaseDialog>
                </Box>
            </Box>
            <Loader isOpen={showLoader} />
            {toastMessage && renderToast()}
        </DefaultScreen>
    )
}

export default AmpRegistration;