import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Typography, TextField, Box } from "@material-ui/core";
import { Dialog } from "../managment/index";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { AiOutlineClose } from "react-icons/ai";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { useTranslation } from "react-i18next";


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




const ColumnAdjustmentDialog = ({ classes, isOpen, title, onClose, onConfirm, settings, data, headers = [], setheaders }) => {
    const { t } = useTranslation();
    const { ToastMessages, extraData } = useSelector((state) => state.sms);
    const styles = useStyles();
    const [groupNameInput, setgroupNameInput] = useState("");

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
    }, []);



    const handleManualDialog = (e) => {
        setgroupNameInput(e.target.value);
        setGroupTextError(false);
    }

    const handleChangeId = (id) => {
        if (dropIndex == -1) {
            setdropIndex(id);
        } else {
            setdropIndex(-1);
        }
    };

    const handleCloseSpan = (id, name) => {
        let h = headers;

        headers[id] = t("sms.adjustTitle");

        setheaders(h);

        for (let i = 0; i < selectArray.length; i++) {

            if (selectArray[i].label === name) {
                selectArray[i].isdisabled = false;
                selectArray[i].idx = -1;
                break;
            }
        }

    }

    const handleSelectFirst = (name, id, idx, e) => {
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


    return (
        <Dialog
            classes={classes}
            title={title || t('sms.columnAdjustment')}
            open={isOpen}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={onConfirm}
            customContainerStyle={{}}
            icon={<div className={classes.dialogIconContent}>
                {'\u0056'}
            </div>}
        >
            {data.length > 0 ?
                (<Box className={classes.dialogBox}>
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

                    <Box className={classes.sidebar} style={{ minHeight: "200px", maxWidth: "700px" }} key="columnAdjustment">
                        <table
                            style={{
                                borderCollapse: "collapse",
                                overflowX: "auto",
                                minWidth: "100px",
                            }}
                        >
                            {data.length > 0
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
                            {data.map((item, id) => {
                                return (
                                    <tbody>
                                        <tr key={id}>
                                            {headers.map((data, idx) => {
                                                return (
                                                    <td key={idx} className={classes.tableColumn}
                                                    >
                                                        {Object.values(item)[idx]}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </tbody>
                                );
                                // }
                            })}
                        </table>
                    </Box>
                </Box>) : <Typography variant="body1">{t("common.NoData")}</Typography>}

        </Dialog>
    )
}

export default ColumnAdjustmentDialog