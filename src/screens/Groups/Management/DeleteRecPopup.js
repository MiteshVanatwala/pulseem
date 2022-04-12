import {
    Box,
    Grid,
    Typography
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Dialog } from "../../../components/managment/Dialog";
import { AiOutlineCloudUpload } from 'react-icons/ai';
import clsx from 'clsx';
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import { BsInfoCircleFill } from "react-icons/bs";
import { useState } from "react";
import { deleteRecipients } from "../../../redux/reducers/groupSlice";
import { useDispatch } from "react-redux";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Loader } from "../../../components/Loader/Loader";
import { ValidateEmail, ValidateNumber } from "../../../helpers/utils";


const DeleteRecPopup = ({ classes,
    isOpen = false,
    onClose,
    selectedGroups,
    placeHolder = "sms.dragXlOrCsv",
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
    const [confirm, setConfirm] = useState(false)

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
            }
            catch (error) {
                reject(error);
            }
        });
    }

    const areaChange = (e) => {
        let enteredValue = e.target.value.split("\n")
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

        const payload = {
            GroupIDs: selectedGroups,
            CellphoneList: cellPhoneData,
            EmailList: EmailData
        }

        const response = await dispatch(deleteRecipients(payload))
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
                message: 'recipient.delete.succeeded',
                Func: onClose()
            },            
            'S_401': {
                code: 401,
                message: 'recipient.responses.unautorized',
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
                message: '',
                Func: () => null
            },
        })

    }


    const RenderSummaryDialog = () => {
        return (
            <Dialog
                classes={classes}
                open={confirm}
                title={"System Notice"}
                icon={<div className={classes.dialogIconContent}>
                    {'\uE0D5'}
                </div>}
                showDivider={true}
                onClose={() => { setConfirm(false) }}
                onCancel={() => { setConfirm(false) }}
                onConfirm={() => { handleSubmit(); setConfirm(false) }}
            >

                <Typography>{t('recipient.deleteConfirm')}</Typography>
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
            <input
                onChange={handleFiles}
                style={{ display: 'none' }}
                id="uploadxl"
                type="file"
            />
        </Grid>
        <Loader isOpen={showLoader} />
    </Grid>)

    return (
        <Dialog
            classes={classes}
            open={isOpen}
            title={
                <Box className={clsx(classes.flex, classes.justifyBetween)}>
                    <Box>
                        {t('recipient.deleteRecipients')}
                        <CustomTooltip
                            isSimpleTooltip={false}
                            interactive={true}
                            classes={{
                                tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                                arrow: classes.fBlack,
                            }}
                            arrow={true}
                            // style={{ fontSize: 18 }}
                            placement={"top"}
                            title={<Typography noWrap={false}>{t('recipient.bulkRecUpldTooltipText')}</Typography>}
                            text={t('recipient.bulkRecUpldTooltipText')}
                        >
                            <span >
                                <BsInfoCircleFill className={classes.plr10} size={24} style={{ color: '#000' }} />
                            </span>
                        </CustomTooltip>
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
            onConfirm={() => setConfirm(true)}
            customContainerStyle=""
        >
            <Box >
                {DropBox(classes)}
            </Box>
        </Dialog>
    );
};

export default DeleteRecPopup;
