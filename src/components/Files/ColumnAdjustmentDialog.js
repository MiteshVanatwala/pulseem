import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Typography, TextField, Box, Tooltip } from "@material-ui/core";
import { Dialog } from "../managment/index";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { AiOutlineClose } from "react-icons/ai";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { translateKeys } from '../../helpers/languageHelper';

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

const ColumnAdjustmentDialog = ({ classes, isOpen, title, onClose, onConfirm, settings, data, headers = [], setheaders, tooltipText = "smsReport.manualTotalTooltip", t }) => {
    const { extraData } = useSelector((state) => state.sms);
    const styles = useStyles();
    const [groupNameInput, setgroupNameInput] = useState("");

    const [selectArray, setselectArray] = useState([]);
    const [groupTextError, setGroupTextError] = useState(false);
    const [GroupNameValidationMessage, setGroupNameValidationMessage] = useState("");
    const [columnValidate, setcolumnValidate] = useState(false);
    const [dropIndex, setdropIndex] = useState(-1);
    const [selectOptions, setSelectOptions] = useState([]);

    const headersOrder = [
        t("common.email"),
        t("smsReport.firstName"),
        t("smsReport.lastName"),
        t("common.cellphone"),
        t("common.telephone"),
        t("common.address"),
        t("common.city"),
        t("common.zip"),
        t("common.birthDate")
    ]

    useEffect(() => {
        Object.keys(extraData).forEach((ed) => {
            const exist = selectOptions.filter((e) => {
                return e.value === ed;
            });

            if (exist <= 0 && extraData[ed] !== '') {
                selectOptions.push({
                    eisdisabled: false,
                    idx: -1,
                    value: ed,
                    label: extraData[ed]
                });
            }
        });

        let restHeader = headers.splice(headersOrder.length, headers.length - headersOrder.length)
        let tempHeaders = [...headersOrder, ...restHeader]

        const fields = settings.Fields.map((e) => {
            let tempIndex = tempHeaders.map(e => { return e.replace(' ','').toLowerCase()}).indexOf(e.value.replace(' ', '').toLowerCase())
            return {
                isdisabled: tempIndex === -1 ? e.isdisabled : true,
                idx: tempIndex === -1 ? e.idx : tempIndex,
                value: e.value,
                label: t(e.label)
            }
        });
        setselectArray(fields);
        setheaders(tempHeaders);

    }, [selectOptions]);



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
            showDivider={true}
        >

            {data.length > 0 ?
                (
                    <>

                        <Box className={classes.dialogBox}>
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
                                    {data.length !== 0 ? data.length : ''}
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
                                                            <Typography style={{ fontWeight: "700", cursor: "pointer", marginInlineEnd: "20px" }} className={columnValidate === true && headers[idx] === t("sms.adjustTitle") ? classes.columnError : null}>{t(selectOptions.find(obj => obj.value === headers[idx])?.label || headers[idx])}</Typography>

                                                            {headers[idx] !== t("sms.adjustTitle") ? <AiOutlineClose style={{ marginInlineEnd: "8px" }} onClick={() => { handleCloseSpan(idx, headers[idx]) }} /> : null}
                                                            {dropIndex == idx ? <BsChevronUp /> : <BsChevronDown style={{ marginInlineStart: "4px" }} />}
                                                        </div>
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
                                        let restObj = { ...item };

                                        return (
                                            <tbody>
                                                <tr key={id}>
                                                    {headers.map((data, idx) => {
                                                        let dispData = restObj[translateKeys(data, t).key] || Object.values(restObj)[0];
                                                        delete restObj[translateKeys(data, t).value === t("sms.adjustTitle") ? Object.keys(restObj)[0] : translateKeys(data, t).value];

                                                        return (
                                                            <td key={idx} className={classes.tableColumn}
                                                            >
                                                                {dispData === 0 ? '' : dispData}
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
                    </>
                ) : <Typography variant="body1">{t("common.NoData")}</Typography>}

        </Dialog>
    )
}

export default ColumnAdjustmentDialog