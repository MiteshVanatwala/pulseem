import { MdDomain, MdOutlineVerified } from "react-icons/md";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Box, Divider, FormControl, Link, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../../../Models/StateTypes";
import { useEffect, useState } from "react";
import { getAuthorizedEmails } from "../../../../redux/reducers/commonSlice";
import { VerifiedEmail } from "../../../../model/Common/commonProps.types";
import { logout } from "../../../../helpers/Api/PulseemReactAPI";
import { setIsLoader } from "../../../../redux/reducers/coreSlice";
import { DoubleOptInSettings } from "../../../../Models/Account/AccountSettings";
import { IoIosArrowDown } from "react-icons/io";
import { RenderHtml } from "../../../../helpers/Utils/HtmlUtils";

const DoubleOptInSettingsPopUp = ({ classes, isOpen, onClose, onConfirm, optInSettings }: any) => {
    const { t } = useTranslation();
    const { verifiedEmails } = useSelector((state: StateType) => state.common);
    const [responseError, setResponseError] = useState<any>();
    const [optIn, setOptIn] = useState<DoubleOptInSettings>({
        OptInActive: true,
        OptInFromEmail: '',
        OptInFromName: '',
        OptInSubject: ''
    });
    const dispatch = useDispatch();
    const initVerifiedEmails = async () => {
        await dispatch(getAuthorizedEmails());
        dispatch(setIsLoader(false));
    }
    useEffect(() => {
        if (optInSettings && optInSettings?.FromEmail !== '') {
            setOptIn(optInSettings)
        }
        if (!verifiedEmails || verifiedEmails?.length < 1) {
            initVerifiedEmails();
        }
        else {
            dispatch(setIsLoader(false));
        }
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
        title={t("common.domainVerification.verifyDomain")}
        children={<Box className={clsx(classes.fullWidth)}>
            <Box className='selectWrapper'>
                <Typography title={t("campaigns.newsLetterEditor.fromEmail").replace('<b>', '').replace('</b>', '')} className={classes.alignDir}>{RenderHtml(t("campaigns.newsLetterEditor.fromEmail"))}</Typography>
                <FormControl
                    className={clsx(classes.selectInputFormControl, classes.w100)}
                >
                    <Select
                        native
                        variant="standard"
                        name="FromEmail"
                        value={optIn?.OptInFromEmail}
                        className={clsx(classes.pbt5, classes.fromEmailSelect)}
                        onChange={(event: any, val: any) => {
                            setOptIn({ ...optIn, OptInFromEmail: val })
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
                        {verifiedEmails.map((item: any, index: any) => {
                            return <option
                                key={index}
                                value={item.Number}
                            >
                                {t(item.Number)}
                            </option>
                        })}
                    </Select>
                </FormControl>
                {/* <Typography className={clsx(errors.FromEmail ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                    {errors.FromEmail ? errors.FromEmail : helperTexts.FromEmail + ' '}
                    <strong className={clsx(classes.link, classes.textRed)} onClick={() => setVerPopupOpen(true)}>{t('campaigns.newsLetterEditor.helpTexts.clickToVerify')}</strong>
                </Typography> */}
            </Box>
            <Box>
                <Box>{t('campaigns.newsLetterEditor.fromName')}</Box>
                <Box>
                    <TextField
                        variant='outlined'
                        size='small'
                        className={clsx(classes.textField, classes.maxWidth400, classes.p10)}
                        onChange={(e) => {
                            setOptIn({ ...optIn, OptInFromName: e.target.value });
                        }}
                        placeholder={t('campaigns.newsLetterMgmt.emailVerification.secondSlide.placeholder')}
                        error={!!responseError}
                        value={optIn.OptInFromName}
                    />
                </Box>
            </Box>
            <Box>
                <Box>{t('common.MessageText')}</Box>
                <Box>
                    <TextField
                        variant='outlined'
                        size='small'
                        className={clsx(classes.textField, classes.maxWidth400, classes.p10)}
                        onChange={(e) => {
                            setOptIn({ ...optIn, OptInSubject: e.target.value });
                        }}
                        placeholder={t('campaigns.newsLetterMgmt.emailVerification.secondSlide.placeholder')}
                        error={!!responseError}
                        value={optIn.OptInSubject}
                    />
                </Box>
            </Box>
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
export default DoubleOptInSettingsPopUp;