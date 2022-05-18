import {
    Box,
    Grid,
    Typography,
    FormControlLabel,
    Switch
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Dialog } from "../../../../components/managment/Dialog";
import { AiOutlineCloudUpload } from 'react-icons/ai';
import clsx from 'clsx';
import { useState } from "react";
import { deleteRecipients, unsubRecipients } from "../../../../redux/reducers/groupSlice";
import { useDispatch } from "react-redux";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Loader } from "../../../../components/Loader/Loader";
import { ValidateEmail, ValidateNumber } from "../../../../helpers/utils";


const UnSub_Del_Popup = ({
    classes,
    dialogType = false,
    onClose,
    selectedGroups,
    handleResponses = (response, actions) => null,
    ToastMessages
}) => {
    const { t } = useTranslation();
    const [highlighted, setHighlighted] = useState(false);
    const dispatch = useDispatch();
    const [showLoader, setLoader] = useState(false);
    const [totalRecords, settotalRecords] = useState(0);
    const [areaData, setareaData] = useState("");
    const [dropClick, setdropClick] = useState(false);
    const [typedData, settypedData] = useState([]);
    const [finalData, setFinalData] = useState(null);
    const [updatedRows, setUpdatedRows] = useState(-1);
    const [advanceOpt, setAdvanceOpt] = useState(false)
    const [activeTab, setActiveTab] = useState(0)
    const [error, setError] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [confirm, setConfirm] = useState(false);





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

    const openConfirmDialog = () => {
        if (!finalData || finalData.length < 10) {
            setError(t("recipient.errors.noDeleteRecFound"))
        }
        else {
            setConfirm(true)
        }
    }

    const handleFiles = (e) => {
        e.preventDefault();
        setdropClick(true);
        const file = e.dataTransfer?.files[0] || e.target.files[0];;
        const reader = new FileReader();
        var p = new Promise((resolve, reject) => {
            try {
                if (file.name.toLowerCase().indexOf("xls") > -1) {
                    // setLoader(true);

                    reader.onload = function (e) {
                        var data = new Uint8Array(e.target.result);
                        setTimeout(() => {
                            var workbook = XLSX.read(data, { type: "array" });
                            var csv = XLSX.utils.sheet_to_csv(
                                workbook.Sheets[workbook.SheetNames[0]]
                                , { header: 1 });

                            let temp = csv;
                            let a = temp.split("\n");
                            let b = [];
                            for (let i = 0; i < a.length; i++) {
                                const tempData = a[i].split(",")
                                b.push(...tempData);
                            }
                            b.pop();
                            settypedData(b);
                            settotalRecords(b.length)
                            setareaData(b);
                            setLoader(false);
                            resolve(b);
                        }, 0);
                    };
                    reader.readAsArrayBuffer(file, "utf-8")
                }

                else if (file.name.toLowerCase().indexOf("csv") > -1) {
                    setLoader(true);
                    reader.onload = function () {
                        var config = {
                            delimiter: "", // auto-detect
                            newline: "", // auto-detect
                            quoteChar: "",
                            escapeChar: "",
                            header: false,
                            trimHeader: false,
                            dynamicTyping: true,
                            preview: 0,
                            encoding: "utf-8",
                            worker: true,
                            comments: false,
                            step: undefined,
                            complete: undefined,
                            error: undefined,
                            download: false,
                            skipEmptyLines: true,
                            chunk: function (c) {
                                var final = c["data"]
                                    .filter(function (el) {
                                        return (
                                            typeof el != "object" ||
                                            Array.isArray(el) ||
                                            Object.keys(el).length > 0
                                        );
                                    })
                                    .map((finalResult) => {
                                        const fr = [...finalResult];
                                        let fixedItem = [];
                                        fr.forEach((item) => {
                                            if (
                                                item &&
                                                String(item).startsWith("5") &&
                                                String(item).length == 9
                                            ) {
                                                item = "0" + item;
                                            }
                                            if (item && String(item).indexOf("9.72") > -1) {
                                                item = parseFloat(item);
                                            }
                                            fixedItem.push(String(item).trim());
                                        });
                                        return fixedItem;
                                    });
                                var conf = {
                                    quotes: false,
                                    quoteChar: '"',
                                    escapeChar: '"',
                                    delimiter: ",",
                                    newline: "\r\n",
                                    skipEmptyLines: true,
                                    columns: null,
                                    worker: true,
                                };
                                const csvResults = Papa.unparse(final, conf);
                                resolve(csvResults)
                            },
                            fastMode: true,
                            beforeFirstChunk: undefined,
                            withCredentials: undefined,
                        };

                        Papa.parse(reader.result, {
                            config,
                            complete: results => {
                                settotalRecords(results.data.length)
                                const resultCsv = results.data;
                                let ddc = [];
                                for (let i in resultCsv[0]) {
                                    ddc.push(t("sms.adjustTitle"))
                                }
                                resolve(resultCsv);
                            },

                        });

                        setareaData(reader.result.substring(0, 1500));
                    };
                    reader.readAsText(file, "ISO-8859-8");
                    setLoader(false);
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
            handleFinalData(data);
        });
    }

    const handleFinalData = (data) => {
        if (Array.isArray(data)) {
            const cols = [];
            data.map((row) => {
                if (row.indexOf('\t') > -1) {
                    row = row.trim().split('\t');
                    row.forEach((col) => {
                        cols.push(col);
                    });
                }
            });
            if (cols.length > 0)
                data = cols;
        }

        if (data.length === 0)
            return;

        let filteredData = data.filter((m) => {
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
        if (filteredData.length === 0) {
            return;
        }
        setFinalData(filteredData);
    }

    const areaChange = (e) => {
        if (e.target.value.length > 0 && error) {
            setError('')
        }
        let enteredValue = e.target.value.split("\n")
        const records = enteredValue.filter((r) => { return r !== "" });
        settotalRecords(records.length)
        setareaData(e.target.value);
        setdropClick(false);
        handleFinalData(enteredValue);
    };

    const handleDeleteSubmit = async () => {
        setLoader(true)
        try {
            const payload = {
                GroupIDs: selectedGroups,
                ListOfValues: finalData
            }

            const response = await dispatch(deleteRecipients(payload))
            setUpdatedRows(response.payload?.Summary?.TotalRecords ?? -1);
            settotalRecords(finalData.length)
            setLoader(false)
            handleResponses(response, {
                'S_200': {
                    code: 200,
                    message: ToastMessages.SERVER_FOUND_NO_RESPONSE,
                    Func: () => null
                },
                'S_201': {
                    code: 201,
                    message: ToastMessages.RECIPIENTS_DELETED_FROM_GROUP,
                    Func: onClose()
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
        setLoader(true)
        try {
            const payload = {
                ListOfValues: finalData,
                RemovingOption: activeTab
            }

            const response = await dispatch(unsubRecipients(payload))
            setUpdatedRows(response.payload?.Summary?.TotalRecords ?? -1);
            settotalRecords(finalData.length)
            setLoader(false)
            handleResponses(response, {
                'S_200': {
                    code: 200,
                    message: ToastMessages.SERVER_FOUND_NO_RESPONSE,
                    Func: () => null
                },
                'S_201': {
                    code: 201,
                    message: ToastMessages.UNSUBSCRIBE_SUCCESS,
                    Func: () => setIsSubmitted(true)
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
                confirm && handleDeleteSubmit();
                setConfirm(false)
            },
            placeHolder: "recipient.deleteTextareaPlaceholder",
            component: AdvanceOptions
        },
        "DELETE_RECIPIENT": {
            title: t('recipient.deleteRecipients'),
            onClose: onClose,
            onConfirm: openConfirmDialog,
            summaryOnClose: setConfirm(false),
            onSummaryConfirm: () => {
                handleDeleteSubmit();
                setConfirm(false)
            },
            placeHolder: "recipient.unsubTextareaPlaceholder",
            component: () => null
        },
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

    const DropBox = (classes) => (<Grid container>
        <Grid item md={12} xs={12} className={clsx(error ? classes.errorFullBorder : '', highlighted ? classes.greenManual : classes.areaManual)}>
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
                // onBlur={() => { (!finalData || finalData.length < 10) && setError(t("recipient.errors.noDeleteRecFound")) }}
                onBlur={(e) => {
                    if (!e.target.value) {
                        setError(t('recipient.errors.noData'))
                    }
                }}
            />
            <input
                onChange={handleFiles}
                style={{ display: 'none' }}
                id="uploadxl"
                type="file"
            />
            {/* {error && <Typography className={clsx(classes.bold, classes.errorLabel, classes.f16, classes.ml10)}>{error}</Typography>} */}
            {error && <label style={{ color: 'red', fontSize: '.9em' }}>{error}</label>}
        </Grid>
        <Loader isOpen={showLoader} />
    </Grid>)


    return (
        <Dialog
            classes={classes}
            open={dialogType}
            childrenStyle={classes.h50v}
            title={
                <Box className={clsx(classes.flex, classes.justifyBetween)}>
                    <Box>
                        {DialogObject[dialogType].title}
                    </Box>
                    <Box style={{ cursor: 'pointer' }}>
                        <label htmlFor="uploadxl">
                            <AiOutlineCloudUpload style={{ fontSize: 30, color: '#000' }} />
                        </label>
                    </Box>
                </Box>


            }
            icon={<div className={classes.dialogIconContent}>
                {'\uE0D5'}
            </div>}
            showDivider={true}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={DialogObject[dialogType].onConfirm}
            customContainerStyle={classes.addRecipientDialog}
        >
            <Box style={{ minWidth: 500 }}>
                {DropBox(classes)}
                {DialogObject[dialogType].component}

            </Box>
        </Dialog>
    )
}

export default UnSub_Del_Popup