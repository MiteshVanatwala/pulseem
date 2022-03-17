import { Typography, Button, Grid, Box, FormControlLabel, FormControl, RadioGroup, Radio, FormHelperText, Divider, TextField } from "@material-ui/core";
import { useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import clsx from "clsx";
import Papa from 'papaparse';

const UploadXL = ({
    classes,
    fileType = "xlsx",
    placeHolder = "Drop a file",
    onDone = () => null
}) => {
    const [totalRecords, settotalRecords] = useState(0);
    const [areaClick, setareaClick] = useState(false);
    const [areaData, setareaData] = useState("");
    const [dropClick, setdropClick] = useState(false);

    const areaChange = (e) => {
        let enteredValue = e.target.value.split("\n")
        const records = enteredValue.filter((r) => { return r !== "" });
        settotalRecords(records.length)
        setareaData(e.target.value);
        setareaClick(true);
        setdropClick(false);
    };

    useEffect(() => {
        const upload = () => {
            setIsFilePicked(false);
            setFileToUpload(null);
            var reader = new FileReader();
            reader.onload = async function (event) {
                var fileContent = event.target.result;
                const fileModel = {
                    FileRequest: fileContent,
                    GroupID: 1
                }
                await dispatch(addRecipients(fileModel));
            }
            reader.readAsDataURL(fileToUpload);

        }
        if (fileToUpload != null && isFilePicked) {
            upload();
        }
    }, [fileToUpload]);
    const handleFiles = (e) => {
        e.preventDefault();
        setareaClick(false);
        setdropClick(true);
        const file = e.dataTransfer.files[0];
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
                                //setContacts(results.data)
                                settotalRecords(results.data.length)

                                const resultCsv = results.data;
                                // setDialogType({ type: "manualUpload" });
                                let ddc = [];
                                for (let i in resultCsv[0]) {
                                    ddc.push(t("sms.adjustTitle"))
                                }
                                // setheaders(ddc);
                            },

                        });

                        setareaData(reader.result.substring(0, 1500));
                    };
                    reader.readAsText(file, "ISO-8859-8");
                }
                else {
                    return false;
                }
            }
            catch (error) {
                reject(error);
            }
        });
    }

    return <Grid item md={12} xs={12} className={
        highlighted
            ? clsx(classes.greenManual)
            : clsx(classes.areaManual)
    }>
        <textarea
            placeholder={placeHolder}
            spellCheck="false"
            autoComplete="off"
            className={
                highlighted ? clsx(classes.greenCon) : clsx(classes.areaCon)
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
    </Grid>
}

export default UploadXL;