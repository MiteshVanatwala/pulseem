import { Box, TextField, Typography } from '@material-ui/core';
import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next';
import { AiOutlineExclamationCircle, AiOutlineClose } from "react-icons/ai";
import { BsTrash, BsChevronDown, BsChevronUp } from "react-icons/bs";
import { Tooltip } from "@material-ui/core";
import { useDispatch } from 'react-redux';
import { saveManualClients } from '../../../../redux/reducers/smsSlice';

const ManualUploadDialog = ({
    classes = {},
    styles = {},
    groupList = [],
    manualValues = {},
    setManualValues = () => null,
    newGroupDetails = {},
    setNewGroupDetails = () => null,
    groupTextError = "",
    setGroupTextError = () => null,
    setDialogType = () => null,
    contacts = [],
    showLoader = false,
    headers = [],
    setheaders = () => null,
    setLoader = () => null,
    ToastMessages = {},
    setToastMessage = () => null,
    selectedGroups = [],
    setContacts = () => null,
    setGroupList = () => null,
    setSelected = () => null
}) => {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [dropIndex, setdropIndex] = useState(-1);
    const [columnValidate, setcolumnValidate] = useState(false);
    const [selectArray, setselectArray] = useState([]);
    const [GroupNameValidationMessage, setGroupNameValidationMessage] = useState("");

    useEffect(() => {
        setselectArray([
            {
                isdisabled: false,
                idx: -1,
                value: "FirstName",
                label: t("common.first_name")
            },
            {
                isdisabled: false,
                idx: -1,
                value: "LastName",
                label: t("common.last_name")
            },
            {
                isdisabled: false,
                idx: -1,
                value: "CellPhone",
                label: t("common.cellphone")
            }
        ]);
    }, [!showLoader]);


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

    const handleChangeId = (id) => {
        if (dropIndex == -1) {
            setdropIndex(id);
        } else {
            setdropIndex(-1);
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

    const handleCautionCancel = () => {
        if (manualValues.dropClick) {
            setDialogType({ type: "caution" })

            // setnewGroupDetails.groupValue("");
            setGroupTextError(false);

        }
        else {
            setDialogType(null);
            setcolumnValidate(false);
        }
        setNewGroupDetails({ ...newGroupDetails, groupValue: '' })
    };

    const handleManualDialog = (e) => {
        setNewGroupDetails({ ...newGroupDetails, groupValue: e.target.value });
        setGroupTextError(false);
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
        return key;
    }

    const manualUploadValidationscheck = () => {
        let isValid = true;
        setGroupNameValidationMessage("");
        setGroupTextError(false);
        setcolumnValidate(false);

        const groupNameExist = groupList.filter((gl) => { return gl.GroupName === newGroupDetails.groupValue });
        let columnHasValue = false;
        headers.forEach((value) => {
            if (value == t("common.cellphone")) {
                columnHasValue = true
            }
        })

        if (newGroupDetails.groupValue === "") {
            isValid = false;
            setGroupNameValidationMessage(t("common.requiredField"));
            setGroupTextError(true);
        }
        else if (groupNameExist.length > 0) {
            isValid = false;
            setGroupNameValidationMessage(t("sms.groupNameExists").replace("#groupName#", newGroupDetails.groupValue))
            setGroupTextError(true);
        }
        if (columnHasValue === false) {
            isValid = false;
            setcolumnValidate(true);
        }

        return isValid;

    }

    const handleDataManual = async () => {
        if (manualUploadValidationscheck()) {
            let requestPayload = [];

            if (newGroupDetails.groupValue.length !== 0) {
                for (let j = 0; j < newGroupDetails.groupValue.length; j++) {
                    requestPayload.push({});
                    for (let k = 0; k < newGroupDetails.groupValue[j].length; k++) {
                        if (headers[k] && headers[k] !== t("sms.adjustTitle")) {
                            let key = translateHebrewColumns(headers[k].toLocaleString().trim().replace(" ", ""));
                            let obj = requestPayload[j];
                            obj[key] = newGroupDetails.groupValue[j][k].trim();
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
                            let key = translateHebrewColumns(headers[i].toLocaleString().trim().replace(" ", ""));
                            let obj = requestPayload[j];
                            obj[key] = contacts[j][k].trim();
                        }
                        i++;
                    }
                }
            }

            let finalPayload = {
                GroupName: newGroupDetails.groupValue,
                Clients: requestPayload
            }
            setDialogType(null);
            setLoader(true);
            const r = await dispatch(saveManualClients(finalPayload))
            setLoader(false);


            if (r.payload.Reason == "no_recipients_to_update") {
                setToastMessage(ToastMessages.INVALID_RECIPIENTS)
                setManualValues({ ...manualValues, typedData: [] })
                // settypedData([]);
                setContacts([]);
                setNewGroupDetails({ ...newGroupDetails, groupValue: '' })
                // setnewGroupDetails.groupValue("");
                setGroupTextError(false);
            }
            else {
                let tempres = [];
                let temp = [];
                for (let i = 0; i < groupList.length; i++) {
                    tempres.push(groupList[i]);
                }
                for (let i = 0; i < selectedGroups.length; i++) {
                    temp.push(selectedGroups[i]);
                }

                temp.push({
                    Recipients: r.payload.Recipients,
                    GroupName: newGroupDetails.groupValue,
                    GroupID: r.payload.GroupID
                });

                tempres.push({
                    Recipients: r.payload.Recipients,
                    GroupName: newGroupDetails.groupValue,
                    GroupID: r.payload.GroupID
                });
                setGroupList(tempres);
                setSelected(temp);
                setManualValues({ ...manualValues, typedData: [], areaData: "", groupClick: true, manualClick: false, totalRecords: 0 })
                // setareaData("");
                // settypedData([]);
                setContacts([]);
                // setgroupClick(true);
                setNewGroupDetails({ ...newGroupDetails, groupValue: '' })
                // setnewGroupDetails.groupValue("");
                setGroupTextError(false);
                // setmanualClick(false);
                setToastMessage(ToastMessages.GROUP_CREATED_SUCCESS);
                setDialogType({ type: 'summary', data: r.payload.Recipients })
            }
            for (let i = 0; i < selectArray.length; i++) {
                selectArray[i].isdisabled = false;
                selectArray[i].idx = -1;
            }
        }

    }

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
                <div className={classes.manualModal}>
                    <Typography className={classes.inputLabel}>
                        {t("common.GroupName")}:
                    </Typography>
                    <div className={clsx(classes.buttonForm, classes.fullWidth)}>
                        <TextField
                            type="text"
                            placeholder={t("common.GroupName")}
                            className={groupTextError ? clsx(classes.textInput, classes.error) : clsx(classes.textInput, classes.success)}
                            onChange={handleManualDialog}
                            value={newGroupDetails.groupValue}
                        ></TextField>
                        {groupTextError ? <span className={classes.errorLabel}>{GroupNameValidationMessage}</span> : null}
                    </div>
                </div>
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
                        {contacts.length !== 0 ? contacts.length : newGroupDetails.groupValue.length}
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
                        {manualValues.typedData.length !== 0 || contacts.length !== 0
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
                                                <div className={classes.adjustC}>
                                                    {selectArray.map((item, id) => {

                                                        return (
                                                            <span
                                                                className={item.isdisabled ? clsx(classes.grayGroup) : clsx(classes.grouping)}
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
                            : manualValues.typedData.map((item, id) => {
                                if (id > manualValues.typedData.length - 6) {
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

export default ManualUploadDialog