import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from 'react-dom';
import { useSelector, useDispatch } from "react-redux";
import { Typography, Grid, Button, Box, TextField } from "@material-ui/core";
import { Dialog } from "../managment/index";
import * as XLSX from 'xlsx';
import clsx from "clsx";
import Papa from 'papaparse';
import {
    addRecipient,
    addRecipients
} from "../../redux/reducers/groupSlice";
import { Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AiOutlineClose } from "react-icons/ai";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { Loader } from '../Loader/Loader';
import { useTranslation } from "react-i18next";
import { renderHtml } from "../../helpers/utils";

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
    placeHolder = "sms.dragXlOrCsv",
    onDone = () => null,
    uploadToGroups = [],
    settings = null
}) => {
    const { t } = useTranslation();
    const { ToastMessages, extraData } = useSelector((state) => state.sms);
    const { isRTL } = useSelector((state) => state.core);
    const dispatch = useDispatch();
    const styles = useStyles();
    const [fileToUpload, setFileToUpload] = useState(null);
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [showLoader, setLoader] = useState(false);
    const hiddenFileInput = React.useRef(null);
    const [totalRecords, settotalRecords] = useState(0);
    const [areaData, setareaData] = useState("");
    const [dropClick, setdropClick] = useState(false);
    const [typedData, settypedData] = useState([]);
    const [initialheadstate, setinitialheadstate] = useState([]);
    const [headers, setheaders] = useState(initialheadstate);
    const [dialogType, setDialogType] = useState({ type: null });
    const [highlighted, setHighlighted] = React.useState(false);
    const [contacts, setContacts] = React.useState([]);
    const [groupNameInput, setgroupNameInput] = useState("");
    const [toastMessage, setToastMessage] = useState(null);
    const [groupList, setGroupList] = useState([]);
    const [selectedGroups, setSelected] = useState([]);
    const [selectArray, setselectArray] = useState([]);
    const [groupTextError, setGroupTextError] = useState(false);
    const [GroupNameValidationMessage, setGroupNameValidationMessage] = useState("");
    const [columnValidate, setcolumnValidate] = useState(false);
    const [dropIndex, setdropIndex] = useState(-1);

    useEffect(() => {
        Object.keys(extraData).forEach((ed) => {
            const exist = settings.Fields.filter((e) => {
                return e.value === ed;
            });

            if (exist <= 0 && extraData[ed] !== '') {
                settings.Fields.push({
                    eisdisabled: false,
                    idx: -1,
                    value: ed,
                    label: extraData[ed]
                });
            }
        });
        const fields = settings.Fields.map((e) => {
            return {
                eisdisabled: e.isdisabled,
                idx: e.idx,
                value: e.value,
                label: t(e.label)
            }
        });
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
    const handleSelectFirst = (name, id, idx, e) => {
        // id -  index of select array
        // idx - header index
        let h = headers;
        h[idx] = name.label;
        selectArray.forEach((value, index) => {
            if (value.idx === idx) {
                selectArray[index].isdisabled = false
                selectArray[index].idx = -1
            }
        })
        selectArray[id].isdisabled = true;
        selectArray[id].idx = idx;
        setheaders(h);
    };
    const handleChangeId = (id) => {
        if (dropIndex == -1) {
            setdropIndex(id);
        } else {
            setdropIndex(-1);
        }
    };
    const areaChange = (e) => {
        let enteredValue = e.target.value.split("\n")
        const records = enteredValue.filter((r) => { return r !== "" });
        settotalRecords(records.length)
        setareaData(e.target.value);
        setdropClick(false);
    };
    const handleUploadClick = () => {
        hiddenFileInput.current.click();
    };
    const changeHandler = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setFileToUpload(event.target.files[0]);
        setIsFilePicked(true);
        handleFiles(event);
        return false;
    };

    const handlePasted = () => {
        let temp = areaData;
        let a = temp.split("\n").filter(empty => empty);
        let b = [];
        let cols = 0;
        if (temp.indexOf("\t") > -1) {
            for (let i = 0; i < a.length; i++) {
                let splitted = a[i].split("\t").filter(obj => !!obj.replace(/ /g, ''));
                b.push(splitted);
                if (splitted.length > cols) {
                    cols = splitted.length;
                }
            }
        }
        else {
            const records = a.filter((r) => { return r !== "" });
            for (let i = 0; i < records.length; i++) {
                let splitted = a[i].split(",").filter(obj => !!obj.replace(/ /g, ''));
                b.push(splitted);
                if (splitted.length > cols) {
                    cols = splitted.length;
                }
            }
        }
        settypedData(b);

        let dummyArr = [];
        for (let i = 0; i < cols; i++) {
            dummyArr.push(t("sms.adjustTitle"));
        }
        setinitialheadstate(dummyArr);
        setheaders(dummyArr)
        setDialogType({ type: "manualUpload" });
    };

    const handleFiles = (e) => {
        e.preventDefault();
        setdropClick(true);
        const file = e.dataTransfer?.files[0] || e.target.files[0];;
        const reader = new FileReader();
        setFileToUpload(file);
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
                                b.push(a[i].split(","));
                            }
                            b.pop();
                            settypedData(b);
                            settotalRecords(b.length)

                            setareaData(b);
                            let dummyArr = [];
                            for (let i = 0; i < b[0].length; i++) {
                                dummyArr.push(t("sms.adjustTitle"));
                            }
                            setinitialheadstate(dummyArr);
                            setheaders(dummyArr)

                            setLoader(false);
                            if (dummyArr !== 0) {
                                setDialogType({ type: "manualUpload" });
                            }

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
                }
                else {
                    return false;
                }
                setLoader(false)
            }
            catch (error) {
                reject(error);
            }
        });
    }
    const translateHebrewColumns = (key) => {
        if (key === 'שםפרטי') {
            return "FirstName";
        }
        if (key === 'שםמשפחה') {
            return "LastName";
        }
        if (key === 'סלולרי') {
            return "Cellphone";
        }
        if (key === 'דואראלקטרוני') {
            return "Email";
        }
        return key;
    }
    const handleDataManual = async () => {
        if (manualUploadValidationscheck()) {
            let requestPayload = [];

            if (typedData.length !== 0) {
                for (let j = 0; j < typedData.length; j++) {
                    requestPayload.push({});
                    for (let k = 0; k < typedData[j].length; k++) {
                        if (headers[k] && headers[k] !== t("sms.adjustTitle")) {
                            let key = translateHebrewColumns(headers[k].toLocaleString().replaceAll(" ", ""));
                            let obj = requestPayload[j];
                            obj[key] = typedData[j][k].trim();
                        }
                    }
                }
            }
            else {
                for (let j = 0; j < contacts.length; j++) {
                    requestPayload.push({});
                    let i = 0;

                    for (let k in contacts[j]) {
                        if (headers[i] && headers[i] !== t("sms.adjustTitle")) {
                            let key = translateHebrewColumns(headers[i].toLocaleString().replaceAll(" ", ""));
                            let obj = requestPayload[j];
                            obj[key] = contacts[j][k].trim();
                        }
                        i++;
                    }
                }
            }

            // Set mapping
            const mapping = headers.map((h, idx) => {
                if (h != t("sms.adjustTitle")) { return { Index: idx, Title: translateHebrewColumns(h.toLocaleString().replaceAll(' ', '')) } }
            }).filter(function (x) {
                return x !== undefined;
            });

            setDialogType(null);
            setLoader(true);
            let r = null;

            if (fileToUpload !== null && requestPayload.length >= 5000) {
                const formData = new FormData();
                formData.append("file", fileToUpload);
                formData.append("groupids", uploadToGroups);
                formData.append("mapping", JSON.stringify(mapping));
                r = await dispatch(addRecipients(formData))
            }
            else {
                const finalPayload = {
                    ClientsData: requestPayload,
                    GroupIds: uploadToGroups,
                    Mapping: mapping
                }
                r = await dispatch(addRecipient(finalPayload))
            }

            setLoader(false);
            setFileToUpload(null);
            onDone(r);
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

        if (settings.ShowGroupName) {
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
            if (value == t("common.cellphone") || value == 'Cellphone' || value == t("common.email") || value == 'Email') {
                columnHasValue = true
            }
        });

        if (columnHasValue === false) {
            isValid = false;
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
                    {settings.ShowGroupName && <div className={classes.manualModal}>
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
                            title={t("smsReport.manualTotalTooltip")}
                            classes={{ tooltip: styles.customWidth }}
                            sx={{ justifyContent: 'center', zIndex: 9999999999999 }}
                        >
                            <Typography className={classes.bodyInfo}>i</Typography>
                        </Tooltip>
                    </Box>
                    <Box className={classes.sidebar} style={{ minHeight: "200px", maxWidth: "700px" }} key="columnAdjustment">
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
                                                    {dropIndex == idx ? <BsChevronUp /> : <BsChevronDown style={{ marginInlineStart: "4px" }} />}  </div>
                                                {dropIndex == idx ? (
                                                    <div className={clsx(classes.adjustC, classes.scrollY, classes.customScroll)} style={{ maxHeight: 175 }}>
                                                        {selectArray.map((item, id) => {

                                                            return (
                                                                <span
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
                                ? contacts.map((item, idx) => {
                                    if (idx > contacts.length - 6) {
                                        return (
                                            <tbody>
                                                <tr id={idx} key={idx}>
                                                    {item.map((temp, idx) => {
                                                        return (
                                                            <td
                                                                id={idx}
                                                                className={classes.tableColumn}
                                                            >
                                                                {temp}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            </tbody>
                                        );
                                    }
                                })
                                : typedData.map((item, id) => {
                                    if (id > typedData.length - 6) {
                                        return (
                                            <tbody>
                                                <tr key={id}>
                                                    {headers.map((data, idx) => {
                                                        return (
                                                            <td key={idx} className={classes.tableColumn}
                                                            >
                                                                {item[idx]}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            </tbody>
                                        );
                                    }
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
            content: renderHtml(t('sms.reset_manual_upload_notice')),
            onClose: () => setDialogType('manualUpload'),
            onCancel: () => setDialogType(null),
            onConfirm: () => {
                setareaData('');
                settypedData([]);
                settotalRecords(0)
                setDialogType(null);
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
                dialogType && <Dialog
                    classes={classes}
                    open={dialogType}
                    onClose={() => { setDialogType(null) }}
                    {...currentDialog}>
                    {currentDialog.content}
                </Dialog>
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
                placeholder={t(placeHolder)}
                spellCheck="false"
                autoComplete="off"
                className={clsx(
                    classes.customScroll,
                    highlighted ? clsx(classes.greenCon) : clsx(classes.areaCon)
                )
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
            />
            <input
                onChange={handleFiles}
                style={{ display: 'none' }}
                id="uploadxl"
                type="file"
            />
        </Grid>
        <Grid item md={12} xs={12}>
            <div className={classes.manualChild} style={{ justifyContent: areaData === "" ? "flex-end" : "space-between" }}>
                {areaData !== "" ? (
                    <div>
                        <span
                            className={classes.addManualDiv}
                            onClick={() => {
                                handlePasted();
                            }}
                        >
                            {t("sms.editFields")}
                        </span>
                        <span
                            className={classes.clearDiv}
                            onClick={() => {
                                setareaData("");
                                setContacts([]);
                                settypedData([]);
                                settotalRecords(0)
                            }}
                        >
                            {t("sms.clearList")}
                        </span>
                    </div>
                ) : null}
                <span>{t("sms.totalRecords")}:  {totalRecords}</span>
            </div>
        </Grid>
        <Loader isOpen={showLoader} />
    </Grid>
}

export default UploadXL;
