import {
    Box,
    FormControlLabel,
    Grid,
    Switch,
    Typography
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Dialog } from "../../../components/managment/Dialog";
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { VscCircleFilled } from 'react-icons/vsc';
import clsx from 'clsx';
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import { BsInfoCircleFill } from "react-icons/bs";
import { useState } from "react";
import { unsubRecipients } from "../../../redux/reducers/groupSlice";
import { useDispatch } from "react-redux";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Loader } from "../../../components/Loader/Loader";
import { ValidateEmail, ValidateNumber } from "../../../helpers/utils";



const UnSubRecPopup = ({ classes,
    isOpen = false,
    onClose,
    placeHolder = "recipient.unsubTextareaPlaceholder",
    handleResponses = (response, actions) => null,
}) => {
    const { t } = useTranslation();
    const [highlighted, setHighlighted] = useState(false);
    const dispatch = useDispatch();
    const [showLoader, setLoader] = useState(false);
    const [totalRecords, settotalRecords] = useState(0);
    const [areaData, setareaData] = useState("");
    const [dropClick, setdropClick] = useState(false);
    const [typedData, settypedData] = useState([]);
    const [advanceOpt, setAdvanceOpt] = useState(false)
    const [activeTab, setActiveTab] = useState(0)
    const [error, setError] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [summaryCount, setSummaryCount] = useState(0)


    const handleFiles = (e) => {
        e.preventDefault();
        setdropClick(true);
        const file = e.dataTransfer?.files[0] || e.target.files[0];;
        const reader = new FileReader();
        // setFileToUpload(file);
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
    }

    const areaChange = (e) => {
        if (e.target.value.length > 0 && error) {
            setError('')
        }

        let enteredValue = e.target.value.split("\n")
        // enteredValue = enteredValue.split(",")
        const records = enteredValue.filter((r) => { return r !== "" });
        settotalRecords(records.length)
        setareaData(e.target.value);
        setdropClick(false);
    };

    const handleSubmit = async () => {
        setLoader(true)
        let tempData = areaData;
        let tempDataArr = tempData.split('\n')
        let tempArr3 = [];
        let tempArr2 = tempDataArr.map((obj) => {
            const childArr = obj.split(',')
            childArr.map((cObj) => {
                const rObj = cObj.replace(/ /g, '')
                tempArr3 = [...tempArr3, rObj]
            })
        })
        const filteredData = tempArr3.filter(obj => !!obj && obj !== '""')
        if (filteredData.length == 0) {
            return;
        }
        const cellPhoneData = filteredData.filter(obj => ValidateNumber(obj))
        const EmailData = filteredData.filter(obj => ValidateEmail(obj))
        let tempCount = activeTab === 0 && (cellPhoneData.length + EmailData.length) || activeTab === 1 && EmailData.length || activeTab === 2 && cellPhoneData.length
        setSummaryCount(tempCount)
        const payload = {
            ListOfValues: filteredData,
            RemovingOption: activeTab
        }

        const response = await dispatch(unsubRecipients(payload))
        settotalRecords(filteredData.length)
        setLoader(false)
        handleResponses(response, {
            'S_200': {
                code: 200,
                message: 'recipient.responses.serverFoundWithNoResponse',
                Func: () => null
            },
            'S_201': {
                code: 201,
                message: 'recipient.unsubscribed.succeeded',
                Func: () => setIsSubmitted(true)
            },
            'S_401': {
                code: 401,
                message: 'group.invalidApi',
                Func: () => null
            },
            'S_404': {
                code: 404,
                message: 'recipient.responses.notFound',
                Func: () => null
            },
            'S_500': {
                code: 500,
                message: 'common.ErrorOccured',
                Func: () => null
            },
            'default': {
                message: 'common.ErrorOccured',
                Func: () => null
            },
        })

    }

    const handlePasted = () => {

    };

    const RenderSummaryDialog = () => {


        return (
            <Dialog
                classes={classes}
                open={isSubmitted}
                title={t("common.systemNotice")}
                icon={<div className={classes.dialogIconContent}>
                    {'\uE0D5'}
                </div>}
                showDivider={true}
                onClose={() => { setIsSubmitted(false); onClose() }}
                onCancel={() => { setIsSubmitted(false); onClose() }}
                onConfirm={() => { setIsSubmitted(false); onClose() }}
            >

                <Box className={classes.flex}>
                    <Box>{summaryCount === 1 ? null : summaryCount} {summaryCount === 1 ? t('recipient.rowUpdated') : t('recipient.rowsUpdated')}</Box>
                </Box>
            </Dialog>
        )
    }

    const DropBox = (classes) => (<Grid container>
        <Grid item md={12} xs={12} className={
            highlighted
                ? clsx(classes.greenManual)
                : clsx(classes.areaManual)
        }>
            {RenderSummaryDialog()}
            <textarea
                placeholder={t(placeHolder)}
                spellCheck="false"
                autoComplete="off"
                className={
                    clsx(highlighted ? clsx(classes.greenCon) : clsx(classes.areaCon), classes.customScroll)
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
                onBlur={(e) => {
                    if (!e.target.value) {
                        setError(t('recipient.errors.noData'))
                    }
                }}
            // onChange={}
            />

            <input
                onChange={handleFiles}
                style={{ display: 'none' }}
                id="uploadxl"
                type="file"
            />
        </Grid>
        <Loader isOpen={showLoader} />
        {error && <label style={{ color: 'red', fontSize: '.9em' }}>{error}</label>}
    </Grid>)

    return (
        <Dialog
            classes={classes}
            open={isOpen}
            childrenStyle={classes.h50v}
            title={
                <Box className={clsx(classes.flex, classes.justifyBetween)}>
                    <Box>
                        {t('recipient.unsubRecipients')}

                    </Box>
                    <Box style={{ cursor: 'pointer' }}>
                        <label htmlFor="uploadxl">
                            <AiOutlineCloudUpload style={{ fontSize: 30, color: '#000' }} />
                        </label>
                    </Box>
                </Box>


            }
            icon={< div className={classes.dialogIconContent} >
                {'\uE0D5'}
            </div >}
            showDivider={true}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={handleSubmit}
            customContainerStyle={classes.addRecipientDialog}
        >
            <Box style={{ minWidth: 600 }}>
                {DropBox(classes)}
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
            </Box>
        </Dialog >
    );
};

export default UnSubRecPopup;
