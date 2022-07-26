import {
    Box,
    Grid,
    Typography,
    FormControlLabel,
    Switch,
    Button
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Dialog } from "../../../../components/managment/Dialog";
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { BsInfoCircleFill } from "react-icons/bs";
import clsx from 'clsx';
import { useEffect, useState } from "react";
import { deleteRecipients, unsubRecipients } from "../../../../redux/reducers/groupSlice";
import { useDispatch } from "react-redux";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Loader } from "../../../../components/Loader/Loader";
import { ValidateEmail, ValidateNumber } from "../../../../helpers/utils";
import CustomTooltip from "../../../../components/Tooltip/CustomTooltip";


const UnsubscribeOrDeletePopup = ({
    classes,
    dialogType = null,
    onClose,
    selectedGroups,
    handleResponses = (response, actions) => null,
    ToastMessages,
    getData
}) => {
    const { t } = useTranslation();
    const [highlighted, setHighlighted] = useState(false);
    const dispatch = useDispatch();
    const [showLoader, setLoader] = useState(false);
    const [areaData, setareaData] = useState("");
    const [finalData, setFinalData] = useState(null);
    const [updatedRows, setUpdatedRows] = useState(-1);
    const [advanceOpt, setAdvanceOpt] = useState(false)
    const [activeTab, setActiveTab] = useState(0)
    const [error, setError] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [limitationWarning, setLimitationWarning] = useState(false);
    const [allData, setAllData] = useState(null);

    const AdvanceOptions = () => {
        return (
            <>
                <FormControlLabel
                    control={
                        <Switch checked={advanceOpt} onClick={() => {
                            setActiveTab(0)
                            setAdvanceOpt(!advanceOpt)
                        }} className={classes.toggleSwitch} />
                    }
                    label={t("recipient.advanceOptions")}
                />

                <Box className={clsx(classes.flex, classes.mt10, classes.mb20)} style={{ height: 26 }}>
                    {advanceOpt && (<>
                        <Box className={activeTab === 0 ? classes.switchButtonActive : classes.switchButton} onClick={() => setActiveTab(0)}>{t("recipient.phone&email")}</Box>
                        <Box className={activeTab === 1 ? classes.switchButtonActive : classes.switchButton} onClick={() => setActiveTab(1)}>{t("recipient.emailOnly")}</Box>
                        <Box className={activeTab === 2 ? classes.switchButtonActive : classes.switchButton} onClick={() => setActiveTab(2)}>{t("recipient.phoneOnly")}</Box>
                    </>
                    )}
                </Box>
            </>
        )
    }

    useEffect(() => {
        const updateFinalData = () => {
            if (!finalData || finalData.length === 0) {
                return;
            }


            let tempData = null;
            if (!allData) {
                setAllData(finalData);
            }

            switch (activeTab) {
                case 0:
                default: {
                    tempData = allData ?? finalData;
                    break;
                }
                case 1: {
                    tempData = allData?.filter((f) => {
                        return f.indexOf('@') > -1;
                    });
                    break;
                }
                case 2: {
                    tempData = allData?.filter((f) => {
                        return f.indexOf('@') === -1;
                    });
                    break;
                }
            }

            handleFinalData(tempData);
        }

        updateFinalData();

    }, [areaData, activeTab])

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
                                    setareaData(sliceData.join(',').replaceAll(',', "\n") + (flatData.length > 1000 ? "\n..." : ""));
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
        let filteredData = data.filter((m) => {
            m = m.replaceAll('\t', '').replaceAll(' ', '');
            let isDate = ((m.split('-').length > 2) || (m.split('\'').length > 2) || (m.split('/').length > 2));
            if (isDate) {
                return null;
            }

            if (ValidateNumber(m)) {
                if (m.length >= 9 && m.length <= 13) {
                    return m;
                }
            }
            if (ValidateEmail(m)) {
                return m;
            }

            return null;
        });

        return filteredData;
    }

    const handleFinalData = (data) => {
        if (!data || data.length === 0)
            return;
        else if (data.length > 1000) {
            setLimitationWarning(true);
        }

        setError(null);
        let filteredData = clearInvalidData(data);
        if (filteredData.length === 0) {
            return;
        }

        setFinalData(filteredData);
        const tempData = [...filteredData];
        setareaData(tempData.join(',').replaceAll(',', "\n"));
        setLoader(false);
        //setareaData(tempData.slice(0, 1000).join(',').replaceAll(',', "\n") + (tempData.length > 1000 ? "\n..." : ""));
    }

    const areaChange = (e) => {
        if (e.target.value.length > 0 && error) {
            setError('')
        }

        let enteredValue = e.target.value.split("\n")
        setareaData(e.target.value);
        if (e.target.value === '') {
            setFinalData(null);
            setError(t("recipient.errors.noData"));
            return;
        }
        handleFinalData(enteredValue);
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
            setLoader(false);
        }
    }

    const handleUnsubSubmit = async () => {
        if (!finalData || finalData.length === 0) {
            setError(t("recipient.errors.noDeleteRecFound"))
            return;
        }
        setLoader(true)
        try {
            const payload = {
                ListOfValues: finalData,
                RemovingOption: activeTab
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
            //TODO: Something went wrong
            setLoader(false);
        }
    }


    const DialogObject = {
        "UNSUB_RECIPIENT": {
            title: t('recipient.unsubRecipients'),
            onClose: onClose,
            onConfirm: handleUnsubSubmit,
            summaryOnClose: () => { setIsSubmitted(false); onClose() },
            onSummaryConfirm: () => {
                setConfirm(false);
                onClose();
            },
            placeHolder: "recipient.unsubTextareaPlaceholder",
            component: AdvanceOptions
        },
        "DELETE_RECIPIENT": {
            title: t('recipient.deleteRecipients'),
            onClose: onClose,
            onConfirm: openConfirmDialog,
            summaryOnClose: () => setConfirm(false),
            onSummaryConfirm: () => {
                confirm && handleDeleteSubmit();
                setConfirm(false)
            },
            placeHolder: "recipient.deleteTextareaPlaceholder",
            component: null
        }
    };

    const RenderSummaryDialog = () => {
        return (
            <Dialog
                classes={classes}
                open={confirm || isSubmitted}
                title={t("common.systemNotice")}
                icon={<div className={classes.dialogIconContent}>
                    {'\uE0D5'}
                </div>}
                showDivider={true}
                onClose={DialogObject[dialogType].summaryOnClose}
                onCancel={DialogObject[dialogType].summaryOnClose}
                onConfirm={DialogObject[dialogType].onSummaryConfirm}
            >
                {confirm && <Typography>{t('recipient.deleteConfirm')}</Typography>}
                {!confirm && <Box className={classes.flex}>
                    {updatedRows <= 0 && <Box>{t("recipient.noRecordsFound")}</Box>}
                    {updatedRows > 0 && <Box>{updatedRows === 1 ? null : updatedRows} {updatedRows === 1 ? t('recipient.rowUpdated') : t('recipient.rowsUpdated')}</Box>}
                </Box>}
            </Dialog>
        )
    }

    const RenderMaximumLimitationRequest = () => {
        return (
            <Dialog
                classes={classes}
                open={limitationWarning}
                title={t("common.systemNotice")}
                icon={<div className={classes.dialogIconContent}>
                    {'\uE0D5'}
                </div>}
                showDefaultButtons={false}
                showDivider={true}
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
            </Dialog>
        )
    }

    const DropBox = (classes) => (<Grid container>
        <Grid item md={12} xs={12} className={clsx(error ? classes.errorFullBorder : '', highlighted ? classes.greenManual : classes.areaManual)}>
            {RenderMaximumLimitationRequest()}
            {RenderSummaryDialog()}
            <textarea
                placeholder={t(DialogObject[dialogType].placeHolder)}
                spellCheck="false"
                autoComplete="off"
                className={
                    clsx(highlighted ? clsx(classes.greenCon) : clsx(classes.areaCon), classes.customScroll, classes.sidebar)
                }
                value={areaData}
                onDragEnter={() => {
                    setHighlighted(true);
                }}
                onChange={areaChange}
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
            // onBlur={(e) => {
            //     if (!e.target.value?.trim()) {
            //         setareaData(e.target.value?.trim())
            //         setError(t('recipient.errors.noData'))
            //     }
            // }}
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
        <Dialog
            maxHeight={dialogType === "UNSUB_RECIPIENT" ? null : "45vh"}
            classes={classes}
            open={dialogType}
            childrenStyle={classes.h50v}
            title={
                <Box className={clsx(classes.flex, classes.justifyBetween)}>
                    <Box>
                        {DialogObject[dialogType].title}
                        <CustomTooltip
                            isSimpleTooltip={false}
                            interactive={true}
                            classes={{
                                tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                                arrow: classes.fBlack,
                            }}
                            arrow={true}
                            style={{ fontSize: 18, fontWeight: "bold", color: '#000', marginInline: 10 }}
                            placement={"top"}
                            title={
                                <Typography noWrap={false}>
                                    {t("recipient.maximumRecordLimitation")}
                                </Typography>
                            }
                            text={t("recipient.maximumRecordLimitation")}
                        >
                            <span>
                                <BsInfoCircleFill />
                            </span>
                        </CustomTooltip>
                    </Box>
                    <Box style={{ cursor: 'pointer' }}>
                        <label htmlFor="uploadxl">
                            <AiOutlineCloudUpload style={{ fontSize: 30, color: '#000' }} />
                        </label>
                    </Box>
                </Box >


            }
            icon={< div className={classes.dialogIconContent} >
                {'\uE0D5'}
            </div >}
            showDivider={true}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={DialogObject[dialogType].onConfirm}
            customContainerStyle={classes.addRecipientDialog}
        >
            <Box style={{ minWidth: 500 }}>
                {DropBox(classes)}
                {DialogObject[dialogType].component && AdvanceOptions()}
            </Box>
        </Dialog >
    )
}

export default UnsubscribeOrDeletePopup