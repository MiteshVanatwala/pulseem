import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Typography, Grid, Box, TextField, Button, Tooltip } from "@material-ui/core";
import * as XLSX from 'xlsx';
import clsx from "clsx";
import Papa from 'papaparse';
import {
    addRecipient,
    addRecipients
} from "../../redux/reducers/groupSlice";
import { makeStyles } from "@material-ui/core/styles";
import { AiOutlineClose } from "react-icons/ai";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { Loader } from '../Loader/Loader';
import { useTranslation } from "react-i18next";
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";
import moment from 'moment';
import 'moment/locale/he';
import { JsonToCSV, CreateFile } from "../../helpers/Export/ExportHelper";
import { BaseDialog } from "../DialogTemplates/BaseDialog";
import { sendToTeamChannel } from "../../redux/reducers/ConnectorsSlice";
import { GetTextAreaSelection } from "../../helpers/Utils/TextHelper";

const useStyles = makeStyles((theme) => ({
    customWidth: {
        maxWidth: 200,
        backgroundColor: "black",
        fontSize: "14px",
        textAlign: 'center'
    },
    noMaxWidth: {
        maxWidth: "none",
    },
}));

const UploadXL = ({
    classes,
    areaStyle,
    placeHolder = "sms.dragXlOrCsv",
    onDone,
    uploadToGroups = [],
    setToastMessage,
    settings,
    tooltipText = "smsReport.manualTotalTooltip",
    onlyMapping = false,
    extraButtons = <></>,
    onType = null
}) => {
    const { t } = useTranslation();
    const { extraData } = useSelector((state) => state.sms);
    const { language, isRTL } = useSelector(state => state.core)
    const { uploadProgress } = useSelector((state) => state.group);
    const dispatch = useDispatch();
    const styles = useStyles();
    const [fileToUpload, setFileToUpload] = useState(null);
    const [showLoader, setLoader] = useState(false);
    const [totalRecords, settotalRecords] = useState(0);
    const [areaData, setareaData] = useState("");
    const [dropClick, setdropClick] = useState(false);
    const [typedData, settypedData] = useState([]);
    const [headers, setheaders] = useState([]);
    const [dialogType, setDialogType] = useState({ type: null });
    const [highlighted, setHighlighted] = React.useState(false);
    const [contacts, setContacts] = React.useState([]);
    const [groupNameInput, setgroupNameInput] = useState("");
    //eslint-disable-next-line
    const [groupList, setGroupList] = useState([]);
    const [selectArray, setselectArray] = useState([]);
    const [groupTextError, setGroupTextError] = useState(false);
    const [GroupNameValidationMessage, setGroupNameValidationMessage] = useState("");
    const [columnValidate, setcolumnValidate] = useState(false);
    const [dropIndex, setdropIndex] = useState(-1);
    const fileRef = useRef(null);
    moment.locale(language);
    const dateFormat = 'DD-MM-YYYY HH:mm:ss';

    useEffect(() => {
        Object.keys(extraData).forEach((ed) => {
            const exist = settings?.Fields.filter((e) => {
                return e.value === ed;
            });

            if (exist <= 0 && extraData[ed] !== '') {
                settings?.Fields.push({
                    isdisabled: false,
                    idx: -1,
                    value: ed,
                    label: extraData[ed]
                });
            }
        });
        let fields = settings?.Fields.map((e, idx) => {
            if (e.label && e.label !== '') {
                return {
                    isdisabled: false,
                    idx: idx,
                    value: e.value,
                    label: t(e.label)
                }
            }
            return null;
        });
        fields = fields.filter((i) => i !== null && typeof i !== 'undefined');

        setselectArray(fields);

    }, [dialogType]);


    const handleCautionCancel = () => {
        if (dropClick === true) {
            setDialogType({ type: "caution" })
            setgroupNameInput("");
            setGroupTextError(false);

        }
        else {
            setDialogType(null);
            setgroupNameInput("");
            setcolumnValidate(false);
        }
    };
    const handleSelectFirst = (item, id, idx) => {
        // id -  index of select array
        // idx - header index
        let h = headers;
        const selectedItem = selectArray.find((sa) => {
            return sa.value === item.value
        });
        if (selectedItem.isdisabled === true) return;

        if (h[idx] !== t("sms.adjustTitle")) {
            const updateItem = selectArray.find((sa) => {
                return sa.label === h[idx]
            });
            updateItem.isdisabled = false;
        }

        h[idx] = item.label;
        selectArray[id].isdisabled = true;
        selectArray[id].idx = idx;
        setheaders(h);
    };
    const handleChangeId = (id) => {
        if (dropIndex === -1) {
            setdropIndex(id);
        } else {
            setdropIndex(-1);
        }
    };

    const areaChange = (e) => {
        var clipboardData, pastedData;
        // Stop data actually being pasted into div
        e.stopPropagation();
        e.preventDefault();
        // Get pasted data via clipboard API
        clipboardData = e.clipboardData || window.clipboardData;
        if (clipboardData) {
            if (e.target.value !== '') {
                const textToReplace = GetTextAreaSelection('dragAndDropText');
                if (textToReplace !== '') {
                    pastedData = e.target.value.replace(textToReplace, clipboardData.getData('Text'));
                }
                else {
                    pastedData = e.target.value + clipboardData.getData('Text');
                }
            }
            else {
                pastedData = clipboardData.getData('Text');
            }
        }
        else {
            pastedData = e.target.value;
        }

        let enteredValue = pastedData?.trim().split("\n")
        const records = enteredValue?.filter((r) => { return r !== "" });
        settotalRecords(records?.length);

        if (records?.length < 100) {
            setareaData(pastedData);
            setdropClick(false);
            onType && onType(pastedData);
        }
        else {
            handlePasted(pastedData);
            setdropClick(true);
        }
    };

    const handlePasted = (value) => {
        let temp = value ?? areaData;
        let a = temp.split("\n").filter(empty => empty);
        let b = [];
        let cols = 0;
        if (temp.indexOf("\t") > -1) {
            for (let i = 0; i < a.length; i++) {
                let splitted = a[i].split("\t");//.filter(obj => !!obj.replace(/ /g, ''));
                b.push(splitted);
                if (splitted.length > cols) {
                    cols = splitted.length;
                }
            }
        }
        else {
            const records = a.filter((r) => { return r !== "" });
            for (let i = 0; i < records.length; i++) {
                let splitted = a[i].split(",");//.filter(obj => !!obj.replace(/ /g, ''));
                b.push(splitted);
                if (splitted.length > cols) {
                    cols = splitted.length;
                }
            }
        }

        let dummyArr = [];
        for (let i = 0; i < cols; i++) {
            dummyArr.push(t("sms.adjustTitle"));
        }
        setheaders(dummyArr);
        if (b.length > 1000) {
            JsonToCSV({ array: b }).then((csvOutput) => {
                CreateFile(csvOutput, 'csv').then((file) => {
                    setFileToUpload(file);
                    parseFile(csvOutput);
                })
            });
        }
        else {
            let d = a.map((td) => {
                if (td.indexOf('\t') > -1) {
                    return td.split('\t');
                }
                else if (td.indexOf(',') > -1) {
                    return td.split(',');
                }
                return td;
            })
            settypedData(d)
            setDialogType({ type: "manualUpload" });
        }

        setLoader(false);
    };

    const handleFiles = (e) => {
        e.preventDefault();
        setdropClick(true);
        const file = e.dataTransfer?.files[0] || e.target.files[0];
        const reader = new FileReader();
        setFileToUpload(file);
        setLoader(true);
        setTimeout(() => {
            return new Promise((resolve, reject) => {
                try {
                    if (file.name.toLowerCase().indexOf("xls") > -1) {
                        reader.onload = function (e) {
                            var data = new Uint8Array(e.target.result);
                            var workbook = XLSX.read(data, { type: "array" });

                            let sheetName = workbook.SheetNames[0];
                            let worksheet = workbook.Sheets[sheetName];
                            var json = XLSX.utils.sheet_to_json(worksheet, {
                                defval: '',
                                raw: false,
                                skipHeader: false,
                                range: -1
                            });

                            const finalData = json.flat().map(function (obj) {
                                return Object.keys(obj).map(function (key) {
                                    return obj[key];
                                });
                            });

                            settypedData(finalData);
                            settotalRecords(finalData.length)

                            let dummyArr = [];
                            for (let i = 0; i < finalData[0].length; i++) {
                                dummyArr.push(t("sms.adjustTitle"));
                            }
                            setheaders(dummyArr)
                            if (dummyArr !== 0) {
                                setDialogType({ type: "manualUpload" });
                            }
                            setLoader(false);
                            fileRef.current.value = "";
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
                                                    String(item).length === 9
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
                                    settotalRecords(results.data.length);
                                    const resultCsv = results.data;
                                    let b = [];
                                    for (let i = 0; i < resultCsv.length; i++) {
                                        b.push(resultCsv[i]);
                                    }
                                    b.pop();
                                    settypedData(b);

                                    let ddc = [];
                                    //eslint-disable-next-line
                                    for (let { } in resultCsv[0]) {
                                        ddc.push(t("sms.adjustTitle"))
                                    }
                                    if (ddc !== 0) {
                                        setheaders(ddc);
                                        setDialogType({ type: "manualUpload" });
                                        setLoader(false);
                                    }
                                    fileRef.current.value = "";
                                },

                            });
                        };
                        reader.readAsText(file, "ISO-8859-8");
                    }
                    else {
                        dispatch(sendToTeamChannel({
                            MethodName: 'handleFiles',
                            ComponentName: 'UploadXL.js',
                            Text: `Client trying to upload non-acceptable file - ${file.name}`
                        }));
                        setLoader(false);
                        return false;
                    }
                }
                catch (error) {
                    dispatch(sendToTeamChannel({
                        MethodName: 'handleFiles',
                        ComponentName: 'UploadXL',
                        Message: error
                    }));
                    reject(error);
                }
            });
        }, 100);

    }

    const parseFile = (data) => {
        var workbook = XLSX.read(data, { type: "array" });
        var csv = XLSX.utils.sheet_to_csv(
            workbook.Sheets[workbook.SheetNames[0]]
            , { header: 1 });

        let temp = csv;
        let a = temp.split("\n");
        let b = [];
        for (let i = 0; i < a.length; i++) {
            b.push(a[i].split(","));
        }
        b.pop();
        settypedData(b);
        settotalRecords(b.length)

        let dummyArr = [];
        for (let i = 0; i < b[0].length; i++) {
            dummyArr.push(t("sms.adjustTitle"));
        }
        setheaders(dummyArr)
        if (dummyArr !== 0) {
            setDialogType({ type: "manualUpload" });
        }
        setLoader(false);
    };


    const handleDataManual = async () => {
        if (manualUploadValidationscheck()) {
            let uploadAsFile = false;
            setLoader(true);
            let r = null;
            let requestPayload = [];
            setDialogType(null);

            const dataToUpload = typedData.length !== 0 ? typedData : contacts;

            if (dataToUpload.length <= 5000) {
                for (let j = 0; j < dataToUpload.length; j++) {
                    requestPayload.push({});
                    for (let k = 0; k < dataToUpload[j].length; k++) {
                        if (headers[k] && headers[k].trim().replace(' ', '').toLowerCase() !== t("sms.adjustTitle").trim().replace(' ', '').toLowerCase()) {
                            let item = selectArray.find((sa) => {
                                return headers[k] === sa.value || headers[k] === sa.label;
                            });

                            let obj = requestPayload[j];
                            let output = typeof dataToUpload[j] == "string" ? 1 : 0;
                            if (output === 0) output = Array.isArray(dataToUpload[j]) ? 2 : 0;
                            if (output === 1) {
                                obj[item.value] = dataToUpload[j].trim();
                                break;
                            }
                            else {
                                obj[item.value] = dataToUpload[j][k].trim();
                            }
                        }
                    }
                }
            }

            // Set mapping
            const mapping = headers.map((h, idx) => {
                if (h.trim().replace(' ', '').toLowerCase() !== t("sms.adjustTitle").trim().replace(' ', '').toLowerCase()) {
                    let item = selectArray.find((sa) => {
                        const isExtraField = sa.label === h;
                        const conditionVal = !isExtraField ? sa.value : sa.label;
                        return h.trim().replace(' ', '').toLowerCase() === conditionVal.trim().replace(' ', '').toLowerCase();
                    });

                    return {
                        Index: idx + 1,
                        Title: item.value
                    }
                }
                return undefined;
            }).filter(function (x) {
                return x !== undefined;
            });

            uploadAsFile = fileToUpload !== null && dataToUpload.length >= 5000;
            if (uploadAsFile) {
                const formData = new FormData();
                formData.append("file", fileToUpload);
                formData.append("groupids", uploadToGroups);
                formData.append("mapping", JSON.stringify(mapping));

                if (onlyMapping === true) {
                    onDone(groupNameInput, formData, uploadAsFile);
                }
                else {
                    r = await dispatch(addRecipients(formData));
                    onDone(groupNameInput, r);
                }
            }
            else {
                const finalPayload = {
                    ClientsData: requestPayload,
                    GroupIds: uploadToGroups,
                    Mapping: mapping
                }
                if (onlyMapping === true) {
                    onDone(groupNameInput, finalPayload, uploadAsFile);
                }
                else {
                    r = await dispatch(addRecipient(finalPayload));
                    onDone(groupNameInput, r);
                }
            }

            setFileToUpload(null);
            setTimeout(() => {
                setgroupNameInput("");
                settotalRecords(0);
                setLoader(false);
            }, 1000);
        }
    }
    const handleManualDialog = (e) => {
        setgroupNameInput(e.target.value);
        setGroupTextError(false);
    }
    const manualUploadValidationscheck = () => {
        let isValid = true;
        setGroupNameValidationMessage("");
        setGroupTextError(false);
        setcolumnValidate(false);
        let groupNameExist = false;

        if (settings?.ShowGroupName) {
            groupNameExist = groupList.filter((gl) => { return gl.GroupName === groupNameInput });
            if (groupNameInput === "") {
                isValid = false;
                setGroupNameValidationMessage(t("common.requiredField"));
                setGroupTextError(true);
            }
            else if (groupNameExist.length > 0) {
                isValid = false;
                setGroupNameValidationMessage(t("sms.groupNameExists").replace("#groupName#", groupNameInput))
                setGroupTextError(true);
            }
        }

        let columnHasValue = false;
        headers.forEach((value) => {
            if (value === t("common.cellphone") || value === 'Cellphone' || value === t("common.email") || value === 'Email') {
                columnHasValue = true
            }
        });

        if (columnHasValue === false) {
            isValid = false;
            setToastMessage({ severity: 'error', color: 'error', message: t('recipient.email_cell_notProvided'), showAnimtionCheck: false })
            setcolumnValidate(true);
        }

        return isValid;

    }
    const manualUploadDialog = () => {
        return {
            title: t('sms.columnAdjustment'),
            showDivider: true,
            icon: (
                <div className={classes.dialogIconContent}>
                    {'\u0056'}
                </div>
            ),
            content: (
                <Box className={classes.dialogBox}>
                    {settings?.ShowGroupName && <div className={classes.manualModal}>
                        <Typography className={classes.inputLabel}>
                            {t("common.GroupName")}:
                        </Typography>
                        <div className={clsx(classes.buttonForm, classes.fullWidth)}>
                            <TextField
                                type="text"
                                placeholder={t("common.GroupName")}
                                className={groupTextError ? clsx(classes.textInput, classes.error) : clsx(classes.textInput, classes.success)}
                                onChange={handleManualDialog}
                                value={groupNameInput}
                            ></TextField>
                            {groupTextError ? <span className={classes.errorLabel}>{GroupNameValidationMessage}</span> : null}
                        </div>
                    </div>}
                    <Box
                        className={clsx(classes.commonFieldPulse, classes.mb3)}>
                        <Typography style={{ fontSize: "20px", marginInlineEnd: "10px" }}>
                            {t("sms.totalRecipients")}:
                        </Typography>
                        <Typography
                            style={{
                                fontSize: "20px",
                                marginInlineEnd: "10px",
                                fontWeight: "600",
                            }}
                        >
                            {contacts.length !== 0 ? contacts.length : typedData.length}
                        </Typography>
                        <Tooltip
                            disableFocusListener
                            title={t(tooltipText)}
                            classes={{ tooltip: styles.customWidth }}
                            sx={{ justifyContent: 'center', zIndex: 9999999999999 }}
                        >
                            <Typography className={classes.bodyInfo}>i</Typography>
                        </Tooltip>
                    </Box>
                    <Box style={{ minHeight: "200px", maxWidth: "700px", overflowX: "scroll" }} key="columnAdjustment">
                        <table
                            style={{
                                borderCollapse: "collapse",
                                overflowX: "auto",
                                minWidth: "100px",
                            }}
                        >
                            {typedData.length !== 0 || contacts.length !== 0
                                ? headers.map((item, idx) => {
                                    return (
                                        <th
                                            key={idx}
                                            className={classes.manualHeader}
                                        >
                                            <div
                                                onClick={() => {
                                                    handleChangeId(idx);
                                                }}
                                                className={classes.adjustP}
                                                style={{ textAlign: "center", cursor: "pointer" }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Typography style={{ fontWeight: "700", cursor: "pointer", marginInlineEnd: "20px" }} className={columnValidate === true && headers[idx] === t("sms.adjustTitle") ? classes.columnError : null}>{headers[idx]}</Typography>

                                                    {headers[idx] !== t("sms.adjustTitle") ? <AiOutlineClose style={{ marginInlineEnd: "8px" }} onClick={() => { handleCloseSpan(idx, headers[idx]) }} /> : null}
                                                    {dropIndex === idx ? <BsChevronUp /> : <BsChevronDown style={{ marginInlineStart: "4px" }} />}  </div>
                                                {dropIndex === idx ? (
                                                    <div className={clsx(classes.adjustC, classes.scrollY, classes.customScroll)} style={{ maxHeight: 175 }}>
                                                        {selectArray.map((item, id) => {

                                                            return (
                                                                <span
                                                                    key={id}
                                                                    className={clsx(item.isdisabled ? classes.grayGroup : classes.grouping, classes.textEllipses)}
                                                                    onClick={() => {
                                                                        handleSelectFirst(item, id, idx);
                                                                    }}
                                                                >
                                                                    {item.label}
                                                                </span>
                                                            )
                                                        })}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </th>

                                    );
                                })
                                : null}
                            {contacts.length !== 0
                                ? [...contacts].splice(0, 5).map((item, idx) => {
                                    return (
                                        <tbody key={idx}>
                                            <tr id={idx}>
                                                {item.map((temp, idx) => {
                                                    return (
                                                        <td
                                                            key={idx}
                                                            id={idx}
                                                            className={classes.tableColumn}
                                                            style={{ direction: moment(temp, dateFormat, true).isValid() ? "ltr" : null }}
                                                        >
                                                            {temp}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        </tbody>
                                    );
                                })
                                : [...typedData].splice(0, 5).map((item, id) => {
                                    let output = typeof item == "string" ? 1 : 0;
                                    if (output === 0) output = Array.isArray(item) ? 2 : 0;
                                    return (
                                        <tbody key={id}>
                                            <tr key={id}>
                                                {headers.map((data, idx, i) => {
                                                    return (
                                                        <td key={idx}
                                                            className={classes.tableColumn}
                                                            style={{ direction: moment(item[idx], dateFormat, true).isValid() ? "ltr" : null }}
                                                        >
                                                            {(output === 1 && idx === 0) ? item : output === 2 ? item[idx] : ''}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        </tbody>
                                    );
                                })}
                        </table>
                    </Box>
                </Box>
            ),
            showDefaultButtons: true,
            onClose: () => { handleCautionCancel() },
            onCancel: () => { handleCautionCancel() },
            onConfirm: () => { handleDataManual() }
        }
    }

    const cautionDialog = () => {
        return {
            title: t('sms.columnAdjustment'),
            content: RenderHtml(t('sms.reset_manual_upload_notice')),
            disableBackdropClick: true,
            onClose: () => setDialogType({ type: "manualUpload" }),
            onCancel: () => setDialogType({ type: "manualUpload" }),
            onConfirm: () => {
                setareaData('');
                settypedData([]);
                settotalRecords(0)
                setDialogType(null);
                onType && onType('');
            }
        }
    }

    const renderDialog = () => {
        const { type } = dialogType || {}

        const dialogContent = {
            manualUpload: manualUploadDialog(),
            caution: cautionDialog()
        }

        const currentDialog = dialogContent[type] || {}

        if (type) {
            return (
                dialogType && <BaseDialog
                    classes={classes}
                    open={dialogType}
                    childrenStyle={classes.mb25}
                    onClose={() => setDialogType(null)}
                    onCancel={() => setDialogType(null)}
                    {...currentDialog}>
                    {currentDialog.content}
                </BaseDialog>
            )
        }
        return <></>
    }
    const handleCloseSpan = (id, name) => {
        let h = headers;

        headers[id] = t("sms.adjustTitle");
        // h[id] = initialheadstate[id];

        setheaders(h);

        for (let i = 0; i < selectArray.length; i++) {

            if (selectArray[i].label === name) {
                selectArray[i].isdisabled = false;
                selectArray[i].idx = -1;
                break;
            }
        }

    }
    return <Grid container>
        <Grid item md={12} xs={12} className={
            highlighted
                ? clsx(classes.greenManual)
                : clsx(classes.areaManual)
        }>
            {renderDialog()}
            <textarea
                id="dragAndDropText"
                placeholder={t(placeHolder)}
                spellCheck="false"
                autoComplete="off"
                className={clsx(
                    classes.customScroll,
                    areaData !== '' && isRTL ? classes.ltr : isRTL ? null : classes.ltr,
                    highlighted ? clsx(classes.greenCon) : clsx(classes.areaCon)
                )
                }
                style={{ ...areaStyle }}
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
                ref={fileRef}
                onChange={handleFiles}
                style={{ display: 'none' }}
                id="uploadxl"
                type="file"
            />
        </Grid>
        <Grid item md={12} xs={12}>
            <div className={classes.manualChild} style={{ justifyContent: areaData === "" ? "flex-end" : "flex-start" }}>
                {areaData !== "" ? (
                    <>
                        <Button
                            className={clsx(classes.btn, classes.btnRounded, classes.ml5)}
                            onClick={() => {
                                handlePasted(areaData);
                            }}
                        >
                            {t("sms.editFields")}
                        </Button>
                        <Button
                            className={clsx(classes.btn, classes.btnRounded, classes.ml5)}
                            onClick={() => {
                                setareaData("");
                                setContacts([]);
                                settypedData([]);
                                settotalRecords(0)
                                onType && onType('');
                            }}
                        >
                            {t("sms.clearList")}
                        </Button>
                        {extraButtons}
                    </>
                ) : null}
                <span style={{ marginTop: areaData === "" ? 12 : null }}>{t("sms.totalRecords")}:  {totalRecords}</span>
            </div>
        </Grid>
        <Loader isOpen={showLoader} progress={uploadProgress} message={t("common.uploadInProgress")} />
    </Grid>
}

export default UploadXL;
