import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Typography, TextField, Box, Tooltip } from "@material-ui/core";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { AiOutlineClose } from "react-icons/ai";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { TranslateKeys } from '../../helpers/UI/TableText';
import { BaseDialog } from "../DialogTemplates/BaseDialog";

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

const ColumnAdjustmentDialog = ({
    t,
    classes,
    isOpen,
    title,
    onClose,
    onConfirm,
    settings,
    data,
    headers = [],
    setheaders,
    setselectArray = () => null,
    selectArray,
    isSimplyAccount = false,
    tooltipText = "smsReport.manualTotalTooltip",
    onUpdateClientFields = () => null }) => {

    const { extraData } = useSelector((state) => state.sms);
    const styles = useStyles();
    const [groupNameInput, setgroupNameInput] = useState("");
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
        t("common.birthDate"),
        t("recipient.reminderDate")
    ]

    useEffect(() => {
        Object.keys(extraData).forEach((ed) => {
            const exist = settings.Fields.filter((e) => {
                return e.value === ed;
            });

            if (exist <= 0 && extraData[ed] !== '') {
                settings.Fields.push({
                    isdisabled: false,
                    idx: -1,
                    value: ed,
                    label: extraData[ed]
                });
            }
        });

        let restHeader = headers.splice(headersOrder.length, headers.length - headersOrder.length)
        let tempHeaders = [...headersOrder, ...restHeader]

        let fields = [];

        fields = settings.Fields.map((e, idx) => {
            if (e.label && e.label !== '') {
                return {
                    isdisabled: e.value.toLowerCase().indexOf('extra') > - 1 ? (idx === -1) : true,
                    idx: idx,
                    value: e.value,
                    label: t(e.label)
                }
            }
            return null;
        });

        fields = fields.filter((i) => i !== null && typeof i !== 'undefined');
        setselectArray([...fields, ...selectOptions]);
        setheaders(tempHeaders);

    }, [selectOptions]);



    const handleManualDialog = (e) => {
        setgroupNameInput(e.target.value);
        setGroupTextError(false);
    }

    const handleChangeId = (id) => {
        if (dropIndex === -1) {
            setdropIndex(id);
        } else {
            setdropIndex(-1);
        }
    };

    const handleCloseSpan = (id, name) => {
        let h = headers;
        h[id] = t("sms.adjustTitle");
        setheaders(h);

        const deletedItem = selectArray.find((sa) => {
            return name === sa.label;
        });

        data.forEach((d) => {
            d[deletedItem.value] = '';
        });

        deletedItem.isdisabled = false;
        deletedItem.idx = -1;

        onUpdateClientFields(data);
    }

    const handleSelectFirst = (item, idx) => {
        let h = headers;
        const headerArrays = [...selectArray];
        const selectedItem = headerArrays.find((sa) => { return sa.value === item.value });
        if (selectedItem.isdisabled === true) return;

        h[idx] = item.label;

        if (h[idx] !== t("sms.adjustTitle")) {
            const updateItem = headerArrays.find((sa) => {
                return sa.label === h[idx] || sa.value === h[idx]
            });
            updateItem.isdisabled = false;
        }

        selectedItem.isdisabled = true;
        selectedItem.idx = idx;
        headerArrays[idx] = selectedItem;

        setheaders(h);
        data.forEach((d) => {
            const index = (idx + 10 - headers.length);
            d[item.value] = d.AdditionalData[index];
        });

        onUpdateClientFields(data);
    };


    return (
        <BaseDialog
            disableBackdropClick={true}
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
            showDivider={false}
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
                                    {headers.map((_, idx) => {
                                        let cursorStyle = 'pointer';
                                        if (isSimplyAccount === true) {
                                            cursorStyle = idx > 9 ? 'pointer' : 'not-allowed'
                                        }

                                        return (
                                            <th
                                                key={idx}
                                                className={classes.manualHeader}
                                            >
                                                <div
                                                    onClick={() => {
                                                        (idx > 9 || !isSimplyAccount) && handleChangeId(idx);
                                                    }}
                                                    className={classes.adjustP}
                                                    style={{ textAlign: "center", cursor: cursorStyle }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <Typography style={{ fontWeight: "700", cursor: cursorStyle, marginInlineEnd: "20px" }} className={columnValidate === true && headers[idx] === t("sms.adjustTitle") ? classes.columnError : null}>{t(selectOptions.find(obj => obj.value === headers[idx])?.label || headers[idx])}</Typography>

                                                        {headers[idx] !== t("sms.adjustTitle") ? <AiOutlineClose style={{ marginInlineEnd: "8px" }}
                                                            onClick={() => {
                                                                (idx > 9 || !isSimplyAccount) && handleCloseSpan(idx, headers[idx])
                                                            }} /> : null}
                                                        {dropIndex === idx ? <BsChevronUp /> : <BsChevronDown style={{ marginInlineStart: "4px" }} />}
                                                    </div>
                                                    {dropIndex === idx ? (
                                                        <div className={clsx(classes.adjustC, classes.scrollY, classes.customScroll)} style={{ maxHeight: 175 }}>
                                                            {selectArray.map((item) => {

                                                                return (
                                                                    <span
                                                                        className={clsx(item.isdisabled ? classes.grayGroup : classes.grouping, classes.textEllipses)}
                                                                        onClick={() => {
                                                                            handleSelectFirst(item, idx);
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
                                    })}
                                    {data.slice(0, 5).map((item, id) => {
                                        let restObj = { ...item };
                                        let additionalIndex = 0;

                                        return (
                                            <tbody>
                                                <tr key={id}>
                                                    {headers.map((headerKey, idx) => {
                                                        let dispData = '';
                                                        if (headers.length <= (idx + 10)) {
                                                            if (restObj["AdditionalData"]) {
                                                                dispData = restObj["AdditionalData"][additionalIndex];
                                                                additionalIndex++;
                                                            }
                                                        }
                                                        else {
                                                            const translatedKey = TranslateKeys(headerKey, t).key;
                                                            dispData = restObj[translatedKey];
                                                            delete restObj[TranslateKeys(headerKey, t).value === t("sms.adjustTitle") ? Object.keys(restObj)[0] : TranslateKeys(headerKey, t).value];
                                                        }

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

        </BaseDialog>
    )
}

export default ColumnAdjustmentDialog