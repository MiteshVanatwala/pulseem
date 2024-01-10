import {
    Box,
    Grid,
    Typography,
    FormControlLabel,
    Button,
    FormControl,
    FormLabel,
    RadioGroup,
    Radio,
    MenuItem
} from "@material-ui/core";
import Select from '@mui/material/Select';
import { useTranslation } from "react-i18next";
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { BsInfoCircleFill } from "react-icons/bs";
import clsx from 'clsx';
import { useEffect, useState } from "react";
import { deleteRecipients, unsubRecipients } from "../../../../redux/reducers/groupSlice";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Loader } from "../../../../components/Loader/Loader";
import { IsValidPhone, IsValidEmail } from "../../../../helpers/Utils/Validations";
import CustomTooltip from "../../../../components/Tooltip/CustomTooltip";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { getTwoFactorAuthValues } from '../../../../redux/reducers/commonSlice';
import { sendToTeamChannel } from "../../../../redux/reducers/ConnectorsSlice";
import { RenderHtml } from "../../../../helpers/Utils/HtmlUtils";
import { IoIosArrowDown } from "react-icons/io";

const UnsubscribeOrDeletePopup = ({
    classes,
    dialogType = null,
    onClose,
    selectedGroups,
    handleResponses = (response, actions) => null,
    ToastMessages,
    getData,
    showDropBox = true,
    onSubmit = null,
    showEmailToNotify = false
}) => {
    const { isRTL } = useSelector(state => state.core);
    const { twoFactorAuthEmails } = useSelector(state => state.common);
    const { t } = useTranslation();
    const [highlighted, setHighlighted] = useState(false);
    const dispatch = useDispatch();
    const [showLoader, setLoader] = useState(false);
    const [areaData, setareaData] = useState("");
    const [finalData, setFinalData] = useState(null);
    const [updatedRows, setUpdatedRows] = useState(-1);
    const [activeTab, setActiveTab] = useState(showDropBox ? '0' : 0)
    const [error, setError] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [limitationWarning, setLimitationWarning] = useState(false);
    const [enteredValue, setEnteredValues] = useState(null);
    const [confirmUnsubscsribe, setConfirmUnsubscsribe] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [unsubscribeOption, setUnsubscribeOption] = useState(0);
    const [notifyEmail, setNotifyEmail] = useState(-1);

    const AdvanceOptions = () => {
        useEffect(() => {
            const initVerifiedEmails = async () => {
                await dispatch(getTwoFactorAuthValues(1));
            }
            if (showEmailToNotify && twoFactorAuthEmails?.length === 0) {
                initVerifiedEmails();
            }
        }, [showEmailToNotify]);
        return (
            <>
                {!showDropBox ? (<>
                    <Box className={clsx(classes.dFlex)}>
                        <RadioGroup
                            aria-label='UnsubscribeType'
                            name='UnsubscribeType'
                            value={activeTab}>
                            <FormControlLabel
                                value='0'
                                control={<Radio color='primary' checked={activeTab === 0} />}
                                label={<Typography style={{ fontWeight: activeTab === 0 ? 'bold' : 500 }}>{t('recipient.phone&email')}</Typography>}
                                onClick={() => setActiveTab(0)}
                            />
                            <FormControlLabel
                                value='1'
                                control={<Radio color='primary' checked={activeTab === 1} />}
                                label={<Typography style={{ fontWeight: activeTab === 1 ? 'bold' : 500 }}>{t('recipient.emailOnly')}</Typography>}
                                onClick={() => setActiveTab(1)}
                            />
                            <FormControlLabel
                                value='2'
                                control={<Radio color='primary' checked={activeTab === 2} />}
                                label={<Typography style={{ fontWeight: activeTab === 2 ? 'bold' : 500 }}>{t('recipient.phoneOnly')}</Typography>}
                                onClick={() => setActiveTab(2)}
                            />
                        </RadioGroup>
                        {/* <Box className={activeTab === 0 ? classes.switchButtonActive : classes.switchButton} onClick={() => setActiveTab(0)}>{t("recipient.phone&email")}</Box>
                        <Box className={activeTab === 1 ? classes.switchButtonActive : classes.switchButton} onClick={() => setActiveTab(1)}>{t("recipient.emailOnly")}</Box>
                        <Box className={activeTab === 2 ? classes.switchButtonActive : classes.switchButton} onClick={() => setActiveTab(2)}>{t("recipient.phoneOnly")}</Box> */}
                    </Box>
                    {showEmailToNotify && <Box style={{ display: 'flex' }}>
                        <Box className={clsx(classes.spaceBetween, classes.justifyCenterOfCenter)}>
                            <Typography>{RenderHtml(t("recipient.unsubscribed.notifyEmail"))}</Typography>
                            <FormControl
                                variant="standard"
                                className={clsx(classes.selectInputFormControl)}
                            >
                                <Select
                                    variant="standard"
                                    displayEmpty
                                    value={notifyEmail || -1}
                                    className={classes.pbt5}
                                    onChange={(event, val) => {
                                        setNotifyEmail(event.target.value);
                                    }}
                                    label={t("recipient.unsubscribed.notifyEmail")}
                                    name="FromEmail"
                                    IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 300,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem disabled value="-1" key="-1">{t("common.select")}</MenuItem>
                                    {
                                        twoFactorAuthEmails.map((item, index) => {
                                            return <MenuItem
                                                key={`exd_${index}`}
                                                value={item.AuthValue}
                                            >
                                                {t(item.AuthValue)}
                                            </MenuItem>
                                        })
                                    }
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>}
                </>) : (
                    <Box className={clsx(classes.flex, classes.mt10, classes.mb20)}>
                        <FormControl>
                            <FormLabel id="unsubRadio" className={clsx(classes.f20, classes.p5)}><strong>{t('recipient.unsubSettings')}</strong></FormLabel>
                            <RadioGroup
                                aria-labelledby="unsubRadio"
                                defaultValue="female"
                                name="unsubRadio-group"
                                value={`${unsubscribeOption}`}
                                onChange={(e) => setUnsubscribeOption(e.target.value)}
                            >
                                <FormControlLabel value={'0'} className={classes.unSubAdvanceOptns} control={<Radio />} label={t('recipient.removeDetailsFrmWndw') + '.'} />
                                <FormControlLabel value={'1'} className={classes.unSubAdvanceOptns} control={<Radio />} label={
                                    <Box style={{ display: 'flex' }}>
                                        {t('recipient.RemoveAllEmailandCellphones') + '.'}
                                        <CustomTooltip
                                            arrow
                                            isSimpleTooltip={false}
                                            // title={t('recipient.unsubSetting1Tooltip')}
                                            classes={classes}
                                            interactive={true}
                                            // arrow={true}
                                            placement={'top'}
                                            title={<Typography noWrap={false}>{t('recipient.unsubSetting1Tooltip')}</Typography>}
                                            text={<span>
                                                <BsInfoCircleFill />
                                            </span>}
                                        />
                                    </Box>
                                } />
                            </RadioGroup>
                        </FormControl>
                    </Box>
                )}
            </>
        )
    }

    // useEffect(() => {
    //     const updateFinalData = () => {
    //         if (!finalData || finalData.length === 0) {
    //             return;
    //         }


    //         let tempData = null;
    //         if (!allData) {
    //             setAllData(finalData);
    //             setEnteredValues(finalData);
    //         }

    //         let output = typeof allData == "string" ? 1 : 0;
    //         if (output === 0) output = Array.isArray(allData) ? 2 : 0;

    //         switch (activeTab) {
    //             case 0:
    //             default: {
    //                 if (allData && output === 1) {
    //                     tempData = allData?.split("\n") ?? finalData;
    //                 }
    //                 else {
    //                     tempData = finalData;
    //                 }
    //                 break;
    //             }
    //             case 1: {
    //                 if (allData && output === 1) {
    //                     tempData = allData?.split("\n").filter((f) => {
    //                         return f.indexOf('@') > -1;
    //                     });
    //                 }
    //                 else {
    //                     tempData = allData.filter((f) => {
    //                         return f.indexOf('@') > -1;
    //                     });
    //                 }
    //                 break;
    //             }
    //             case 2: {
    //                 if (allData && output === 1) {
    //                     tempData = allData?.split("\n").filter((f) => {
    //                         return f.indexOf('@') === -1;
    //                     });
    //                 }
    //                 else {
    //                     tempData = allData.filter((f) => {
    //                         return f.indexOf('@') === -1;
    //                     });
    //                 }
    //                 break;
    //             }
    //         }

    //         handleFinalData(tempData);
    //     }

    //     updateFinalData();

    // }, [activeTab])

    useEffect(() => {
        if (confirmUnsubscsribe === true) {
            handleUnsubSubmit();
        }

    }, [confirmUnsubscsribe, unsubscribeOption]);

    useEffect(() => {
        if (confirmDelete === true && finalData) {
            openConfirmDialog();
        }

    }, [confirmDelete]);

    const openConfirmDialog = () => {
        if (!finalData || finalData.length === 0) {
            setError(t("recipient.errors.noDeleteRecFound"))
        }
        else {
            setConfirm(true)
        }
    }

    const handleFiles = (e) => {
        e.preventDefault();
        // setdropClick(true);
        const file = e.dataTransfer?.files[0] || e.target.files[0];;
        const reader = new FileReader();
        // setFileToUpload(file);
        var p = new Promise((resolve, reject) => {
            try {
                if (file.name.toLowerCase().indexOf("xls") > -1) {
                    setLoader(true);

                    reader.onload = function (e) {
                        var data = new Uint8Array(e.target.result);
                        setTimeout(() => {
                            var workbook = XLSX.read(data, { type: "array" });
                            var csv = XLSX.utils.sheet_to_csv(
                                workbook.Sheets[workbook.SheetNames[0]]
                                , { header: 1 });

                            let temp = csv;
                            let a = temp.split("\n");

                            if (a.length > 1000) {
                                setLimitationWarning(true);
                                setLoader(false);
                                resolve(null);
                            }
                            else {
                                let b = [];
                                for (let i = 0; i < a.length; i++) {
                                    const tempData = a[i].split(",")?.filter(n => n);
                                    b.push(...tempData);
                                }
                                b.pop();
                                setLoader(false);
                                resolve(b);
                            }
                        }, 0);
                    };
                    reader.readAsArrayBuffer(file, "utf-8")
                }
                else if (file.name.toLowerCase().indexOf("csv") > -1) {
                    setLoader(true);
                    reader.onload = function () {
                        const finalData = [];
                        Papa.parse(reader.result, {
                            delimiter: ",", // auto-detect
                            newline: "", // auto-detect
                            quoteChar: "",
                            escapeChar: "",
                            preview: 0,
                            worker: true,
                            skipEmptyLines: true,
                            fastMode: true,
                            chunkSize: 10000,
                            chunk: async (chunkRows, action) => {
                                if (finalData && finalData.flat().length > 1000) {
                                    setLimitationWarning(true);
                                    setLoader(false);
                                    resolve(null);
                                    action.abort();
                                }
                                else if (chunkRows.data) {
                                    const tempRows = chunkRows.data.flat();
                                    tempRows.pop();
                                    let flatData = tempRows.flat();
                                    let validData = clearInvalidData(flatData.flat())
                                    if (validData && validData.length > 0) {
                                        finalData.push(validData);
                                    }
                                }
                            },
                            complete: () => {
                                if (finalData.flat().length < 1000) {
                                    setError(null);
                                    setFinalData(finalData.flat());
                                    const tempData = [...finalData];
                                    const flatData = tempData.flat();
                                    const sliceData = flatData.slice(0, 1000)
                                    setareaData(sliceData.join(',').trim().replace(',', "\n") + (flatData.length > 1000 ? "\n..." : ""));
                                    setLoader(false);
                                    resolve(null);
                                }
                            },

                        });
                    };
                    reader.readAsText(file, "ISO-8859-8");
                }
                else {
                    setLoader(false);
                    return false;
                }
            }
            catch (error) {
                setLoader(false);
                dispatch(sendToTeamChannel({
                    MethodName: 'handleFiles',
                    ComponentName: 'UnsubscribeOrDeletePopup.js',
                    Text: error
                }));
                reject(error);
            }
        });

        p.then((data) => {
            if (data) {
                handleFinalData(data);
            }
        });
    }

    const clearInvalidData = (data) => {
        const filteredData = data.filter((m) => {
            m = m.replace('\t', '');
            m = m.replace('\r', '');
            m = m.replace(' ', '');
            let isDate = ((m.split('-').length > 2) || (m.split('\'').length > 2) || (m.split('/').length > 2));
            if (isDate) {
                return null;
            }

            if (IsValidPhone(m)) {
                if (m.length >= 9 && m.length <= 13) {
                    return m.trim();
                }
            }
            if (IsValidEmail(m)) {
                return m.trim();
            }

            return null;
        });

        return filteredData?.map((m) => {
            m = m.trim().replace('\t', '').replace('\r', '').replace(' ', '');
            return m.trim();
        });
    }

    const handleFinalData = (data) => {
        if (!data && data.length === 0)
            return;

        setError(null);
        let filteredData = clearInvalidData(data);
        if (filteredData.length === 0) {
            return;
        }
        setFinalData(filteredData);
        const tempData = [...filteredData];
        setareaData(tempData.join(',').trim().replace(',', "\n"));
        setLoader(false);

        if (filteredData.length > 1000) {
            setLimitationWarning(true);
        }
    }

    const areaChange = (e) => {
        var clipboardData, pastedData;
        // Stop data actually being pasted into div
        e.stopPropagation();
        e.preventDefault();
        // Get pasted data via clipboard API
        clipboardData = e.clipboardData || window.clipboardData;
        if (clipboardData) {
            pastedData = e.target.value += clipboardData.getData('Text');
        }
        else {
            pastedData = e.target.value;
        }

        let tempValues = pastedData.trim().split("\n")
        // const records = tempValues.filter((r) => { return r !== "" });

        // if (records.length < 100) {
        setareaData(pastedData);
        setEnteredValues(tempValues);
        // }
        if (e.target.value === '') {
            setFinalData(null);
            setError(t("recipient.errors.noData"));
            return;
        }
    };

    const handleDeleteSubmit = async () => {
        if (!finalData || finalData.length === 0) {
            setError(t("recipient.errors.noDeleteRecFound"))
            return;
        }
        setLoader(true)
        try {
            const payload = {
                GroupIDs: selectedGroups,
                ListOfValues: finalData
            }

            const response = await dispatch(deleteRecipients(payload))
            setUpdatedRows(response.payload?.Summary?.TotalRecords ?? -1);
            //settotalRecords(finalData.length)
            setLoader(false)
            handleResponses(response, {
                'S_200': {
                    code: 200,
                    message: ToastMessages.SERVER_FOUND_NO_RESPONSE,
                    Func: () => null
                },
                'S_201': {
                    code: 201,
                    message: response.payload?.Summary?.TotalRecords < 1 ? ToastMessages.RECIPIENTS_DELETED_NOT_FOUND_RECORDS : ToastMessages.RECIPIENTS_DELETED_FROM_GROUP,
                    Func: () => {
                        if (response.payload?.Summary?.TotalRecords < 1) {
                            onClose();
                        }
                        else {
                            new Promise(async (resolutionFunc, rejectionFunc) => {
                                await resolutionFunc(getData());
                            }).then((res) => {
                                onClose()
                            })
                        }
                    }
                },
                'S_401': {
                    code: 401,
                    message: ToastMessages.UNAUTORIZED_RESPONSE,
                    Func: () => null
                },
                'S_404': {
                    code: 404,
                    message: ToastMessages.RECIPIENTS_NOT_FOUND,
                    Func: () => null
                }, 'S_405': {
                    code: 405,
                    message: ToastMessages.UNSUBSCRIBE_LIMIT,
                    Func: () => null
                },
                'S_500': {
                    code: 500,
                    message: ToastMessages.ERROR_OCCURED,
                    Func: () => null
                },
                'default': {
                    message: ToastMessages.ERROR_OCCURED,
                    Func: () => null
                },
            })
        }
        catch (e) {
            dispatch(sendToTeamChannel({
                MethodName: 'handleDeleteSubmit',
                ComponentName: 'UnsubscribeOrDeletePopup.js',
                Text: e
            }));
            setLoader(false);
        }
    }

    const handleUnsubSubmit = async () => {

        if (onSubmit) {
            return onSubmit(activeTab, notifyEmail);
        }
        if (!finalData || finalData.length === 0) {
            setError(t("recipient.errors.noDeleteRecFound"))
            return;
        }
        setLoader(true)
        try {
            const payload = {
                ListOfValues: finalData,
                UnsubscribeOption: -1
            }

            if (showDropBox) {
                payload.UnsubscribeOption = unsubscribeOption;
            }

            const response = await dispatch(unsubRecipients(payload))
            setUpdatedRows(response.payload?.Summary?.TotalRecords ?? -1);
            //settotalRecords(finalData.length)
            setLoader(false)
            handleResponses(response, {
                'S_200': {
                    code: 200,
                    message: ToastMessages.SERVER_FOUND_NO_RESPONSE,
                    Func: () => null
                },
                'S_201': {
                    code: 201,
                    message: '',
                    Func: () => {
                        setIsSubmitted(true);
                        new Promise(async (resolutionFunc, rejectionFunc) => {
                            await resolutionFunc(getData());
                        });
                    }
                },
                'S_401': {
                    code: 401,
                    message: ToastMessages.GROUP_INVALID_ID,
                    Func: () => null
                },
                'S_404': {
                    code: 404,
                    message: ToastMessages.RECIPIENTS_NOT_FOUND,
                    Func: () => null
                },
                'S_405': {
                    code: 405,
                    message: ToastMessages.UNSUBSCRIBE_LIMIT,
                    Func: () => null
                },
                'S_500': {
                    code: 500,
                    message: ToastMessages.ERROR_OCCURED,
                    Func: () => null
                },
                'default': {
                    message: ToastMessages.ERROR_OCCURED,
                    Func: () => null
                },
            })
        }
        catch (e) {
            dispatch(sendToTeamChannel({
                MethodName: 'handleUnsubSubmit',
                ComponentName: 'UnsubscribeOrDeletePopup.js',
                Text: e
            }));
            setLoader(false);
        }
    }


    const DialogObject = {
        "UNSUB_RECIPIENT": {
            title: t('recipient.unsubRecipients'),
            onClose: onClose,
            onConfirm: () => {
                if (enteredValue) {
                    handleFinalData(enteredValue);
                }
                setConfirmUnsubscsribe(true);
            },
            summaryOnClose: () => { setIsSubmitted(false); onClose(); setConfirmUnsubscsribe(false); },
            onSummaryConfirm: () => {
                setConfirm(false);
                setConfirmUnsubscsribe(false);
                onClose();
            },
            placeHolder: "recipient.unsubTextareaPlaceholder",
            component: AdvanceOptions
        },
        "DELETE_RECIPIENT": {
            title: t('recipient.deleteRecipients'),
            onClose: onClose,
            onConfirm: () => {
                handleFinalData(enteredValue);
                setConfirmDelete(true);
            },
            summaryOnClose: () => { setConfirm(false); setConfirmDelete(false); },
            onSummaryConfirm: () => {
                confirm && handleDeleteSubmit();
                setConfirm(false);
                setConfirmDelete(false);
            },
            placeHolder: "recipient.deleteTextareaPlaceholder",
            component: null
        }
    };

    const RenderSummaryDialog = () => {
        return (
            <BaseDialog
                classes={classes}
                open={confirm || isSubmitted}
                title={t("common.systemNotice")}
                icon={<div className={clsx(classes.dialogIconContent, 'unicode')}>
                    {'\uE0D5'}
                </div>}
                onClose={DialogObject[dialogType].summaryOnClose}
                onCancel={DialogObject[dialogType].summaryOnClose}
                onConfirm={DialogObject[dialogType].onSummaryConfirm}
            >
                {confirm && <Typography>{t('recipient.deleteConfirm')}</Typography>}
                {!confirm && <Box className={classes.flex}>
                    {updatedRows <= 0 && <Box>{t("recipient.noRecordsFound")}</Box>}
                    {updatedRows > 0 && <Box>{updatedRows === 1 ? null : updatedRows} {updatedRows === 1 ? t('recipient.rowUpdated') : t('recipient.rowsUpdated')}</Box>}
                </Box>}
            </BaseDialog>
        )
    }

    const RenderMaximumLimitationRequest = () => {
        return (
            <BaseDialog
                classes={classes}
                open={limitationWarning}
                title={t("common.systemNotice")}
                icon={<div className={clsx(classes.dialogIconContent, 'unicode')}>
                    {'\uE0D5'}
                </div>}
                showDefaultButtons={false}
                showDivider={false}
                onClose={() => { setLimitationWarning(false) }}
                onCancel={() => { setLimitationWarning(false) }}
                renderButtons={() => {
                    return <Button
                        variant='contained'
                        style={{ margin: '0 auto' }}
                        onClick={() => { setLimitationWarning(false) }}
                        className={clsx(
                            classes.dialogButton,
                            classes.dialogConfirmButton
                        )}>
                        {t('common.Ok')}
                    </Button>
                }}
            >
                <Typography>{t('recipient.maximumRecordLimitation')}</Typography>
            </BaseDialog>
        )
    }

    const DropBox = (classes) => (<Grid container>
        <Grid item md={12} xs={12} className={clsx(error ? classes.errorFullBorder : '', highlighted ? classes.greenManual : classes.areaManual)}>
            {RenderMaximumLimitationRequest()}
            {finalData && finalData.length < 1000 && RenderSummaryDialog()}
            <textarea
                placeholder={t(DialogObject[dialogType].placeHolder)}
                spellCheck="false"
                autoComplete="off"
                className={
                    clsx(highlighted ? clsx(classes.greenCon) : clsx(classes.areaCon),
                        areaData !== '' && isRTL ? classes.ltr : isRTL ? null : classes.ltr,
                        classes.customScroll, classes.sidebar)
                }
                value={areaData}
                onDragEnter={() => {
                    setHighlighted(true);
                }}
                onChange={(e) => areaChange(e)}
                onDragLeave={() => {
                    setHighlighted(false);
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                }}
                onPaste={areaChange}
                onDrop={(e) => {
                    e.preventDefault();
                    setHighlighted(false);
                    handleFiles(e)
                }}
            />
            <input
                onChange={handleFiles}
                style={{ display: 'none' }}
                id="uploadxl"
                type="file"
            />
            {error && <label style={{ color: 'red', fontSize: '.9em' }}>{error}</label>}
        </Grid>
        <Loader isOpen={showLoader} />
    </Grid>)


    return (
        <BaseDialog
            maxHeight={dialogType === "UNSUB_RECIPIENT" ? null : "45vh"}
            classes={classes}
            open={dialogType}
            childrenStyle={showDropBox ? classes.h50v : classes.h10v}
            title={
                <Box className={clsx(classes.flex, classes.justifyBetween, classes.alignItemsCenter)}>
                    <Box>
                        {DialogObject[dialogType].title}
                    </Box>
                    {showDropBox && <Box style={{ cursor: 'pointer' }}>
                        <label htmlFor="uploadxl">
                            <AiOutlineCloudUpload style={{ fontSize: 30, color: '#fff' }} className={clsx(classes.paddingSides15, classes.pt5)} />
                        </label>
                    </Box>}
                </Box>
            }
            icon={<div className={clsx(classes.dialogIconContent, 'unicode', classes.pt10)} >
                {'\uE0D5'}
            </div >}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={DialogObject[dialogType].onConfirm}
        >
            <Box style={{ minWidth: 500 }}>
                {showDropBox && DropBox(classes)}
                {/* {!showDropBox && } */}
                {DialogObject[dialogType].component && AdvanceOptions()}
            </Box>
        </BaseDialog >
    )
}

export default UnsubscribeOrDeletePopup