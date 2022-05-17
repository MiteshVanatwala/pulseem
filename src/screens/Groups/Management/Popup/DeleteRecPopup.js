import {
    Box,
    Grid,
    Typography
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Dialog } from "../../../../components/managment/Dialog";
import { AiOutlineCloudUpload } from 'react-icons/ai';
import clsx from 'clsx';
import { useState } from "react";
import { deleteRecipients } from "../../../../redux/reducers/groupSlice";
import { useDispatch } from "react-redux";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Loader } from "../../../../components/Loader/Loader";
import { ValidateEmail, ValidateNumber } from "../../../../helpers/utils";


const DeleteRecPopup = ({ classes,
    isOpen = false,
    onClose,
    selectedGroups,
    placeHolder = "recipient.deleteTextareaPlaceholder",
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
    const [confirm, setConfirm] = useState(false);
    const [finalData, setFinalData] = useState(null);
    const [error, setError] = useState(null)

    const handleFiles = (e) => {
        e.preventDefault();
        setdropClick(true);
        const file = e.dataTransfer?.files[0] || e.target.files[0];;
        const reader = new FileReader();
        var p = new Promise((resolve, reject) => {
            try {
                if (file.name.toLowerCase().indexOf("xls") > -1 || file.name.toLowerCase().indexOf("csv") > -1) {
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
                                const tempData = a[i].split(",")?.filter(n => n);
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
                else {
                    return false;
                    setLoader(false);
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
        if (error) {
            setError(null)
        }
        let enteredValue = e.target.value.split("\n")
        const records = enteredValue.filter((r) => { return r !== "" });
        settotalRecords(records.length)
        setareaData(e.target.value);
        setdropClick(false);
        handleFinalData(enteredValue);
    };

    const handleSubmit = async () => {
        setLoader(true)
        try {
            const payload = {
                GroupIDs: selectedGroups,
                ListOfValues: finalData
            }

            const response = await dispatch(deleteRecipients(payload))
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

    const RenderSummaryDialog = () => {
        return (
            <Dialog
                classes={classes}
                open={confirm}
                title={t("common.systemNotice")}
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
        <Grid item md={12} xs={12} className={clsx(error ? classes.errorFullBorder : '', highlighted ? classes.greenManual : classes.areaManual)}>
            {RenderSummaryDialog()}
            <textarea
                placeholder={t(placeHolder)}
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
                onBlur={() => { (!finalData || finalData.length < 10) && setError(t("recipient.errors.noDeleteRecFound")) }}
            />
            <input
                onChange={handleFiles}
                style={{ display: 'none' }}
                id="uploadxl"
                type="file"
            />
            {error && <Typography className={clsx(classes.bold, classes.errorLabel, classes.f16, classes.ml10)}>{error}</Typography>}
        </Grid>
        <Loader isOpen={showLoader} />
    </Grid>)

    return (
        <Dialog
            classes={classes}
            open={isOpen}
            childrenStyle={classes.h50v}
            title={
                <Box className={clsx(classes.flex, classes.justifyBetween)}>
                    <Box>
                        {t('recipient.deleteRecipients')}

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
            onConfirm={() => {
                if (!finalData || finalData.length < 10) {
                    setError(t("recipient.errors.noDeleteRecFound"))
                }
                else {
                    setConfirm(true)
                }
            }
            }
            customContainerStyle={classes.addRecipientDialog}
        >
            <Box style={{ minWidth: 500 }}>
                {DropBox(classes)}
            </Box>
        </Dialog>
    );
};

export default DeleteRecPopup;
