import React, { useState, useRef } from "react";
import clsx from "clsx";
import { TextField, Box, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { RiSendPlaneFill } from 'react-icons/ri'
import PulseemRadio from '../../../components/Controlls/PulseemRadio'
import "moment/locale/he";
import { useSelector } from "react-redux";
import Toast from '../../../components/Toast/Toast.component';
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import GroupTags from "../../../components/Groups/GroupTags";

const TestSend = ({
    classes,
    isOpen = false,
    onClose,
    campaignId,
    onSubmit = () => null
}) => {
    const { t } = useTranslation();
    const [recipient, setRecipient] = useState('');
    const [sendSendMethod, setSendMethod] = useState("1");
    const [toastMessage, setToastMessage] = useState(null);
    //eslint-disable-next-line
    const [selectedGroups, setTestGroups] = useState([]);
    const { isRTL, windowSize } = useSelector(state => state.core);
    const { ToastMessages } = useSelector(state => state.campaignEditor);
    const emailRef = useRef(null);
    const { testGroups } = useSelector((state) => state.sms);

    const handleRecipient = (e) => {
        validateEmail();
        setRecipient(e.target.value);
        if (e.target.value === '') {
            e.target.style.direction = null;
        }
        else {
            e.target.style.direction = "ltr";
        }
    }
    const validateEmail = () => {
        emailRef.current.classList.remove('error');
        var regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!regex.test(recipient)) {
            emailRef.current.classList.add('error');
            return false;
        }
        return true;
    }
    const handleSendMethod = (e) => {
        setSendMethod(e.target.value);
    }

    const prepareForSubmit = () => {
        if ((sendSendMethod === "1" && validateEmail()) || sendSendMethod === "2") {
            const request = {
                Language: `${isRTL ? 'he-IL' : 'en-US'}`,
                CampaignID: campaignId,
                Emails: recipient,
                GroupIds: selectedGroups
            }
            onSubmit(request);
        }
        else {
            setToastMessage(ToastMessages.INVALID_EMAIL);
        }
    }

    const handleRemoveGroup = (newList) => {
        let newSelection = newList ? newList : [];
        setTestGroups(newSelection);
    }

    const radios = [
        {
            value: "1",
            className: classes.radioButtonActive,
            label: t("campaigns.sendToContact"),
            child: <TextField
                variant='outlined'
                size='small'
                value={recipient}
                onChange={handleRecipient}
                className={clsx(classes.textField, classes.emailField)}
                onBlur={(e) => {
                    if (e.target.value === '') {
                        e.target.style.direction = null;
                    }
                    else {
                        e.target.style.direction = "ltr";
                    }
                }}
                placeholder={t('common.Email')}
                autoFocus
                ref={emailRef}
            />
        },
        {
            value: "2",
            className: classes.radioButtonActive,
            label:
                <CustomTooltip
                    isSimpleTooltip={false}
                    classes={classes}
                    interactive={true}
                    arrow={true}
                    style={{ fontSize: 17 }}
                    placement={'top'}
                    title={<Typography noWrap={false}>{t("mainReport.sendToGroups")}</Typography>}
                    text={<>{t("mainReport.sendToGroups")}<span className={classes.newIcn}>{t("mainReport.newFeature")}</span></>}
                />,
            child: <GroupTags
                classes={classes}
                title={'siteTracking.typeGroupName'}
                style={{ width: windowSize === 'xs' ? 320 : 460 }}
                dropdown
                onRemoveGroup={handleRemoveGroup}
                groupSelected={selectedGroups}
                dropDownProps={{
                    onChange: (e, val) => {
                        if (e?.target?.checked === false) {
                            const groupIdToRemove = val[val.length-1]?.GroupID;
                            const newArr = val?.filter((g) => { return g.GroupID !== groupIdToRemove });
                            setTestGroups(newArr);
                        }
                        else {
                            const idArr = val.reduce((prevVal, newVal) => [...prevVal, newVal.GroupID], [])
                            setTestGroups(idArr)
                        }
                    },
                    selectedGroups: selectedGroups,
                    groups: testGroups
                }}
            />
        }
    ];

    const renderToast = () => {
        if (toastMessage) {
            setTimeout(() => {
                setToastMessage(null);
            }, 4000);
            return (
                <Toast data={toastMessage} />
            );
        }
        return null;
    }
    return !isOpen ? (<></>) :
        (
            <>
                {renderToast()}
                <BaseDialog
                    classes={classes}
                    customContainerStyle={classes.dialogZindex}
                    open={isOpen}
                    title={t('mainReport.testSend')}
                    icon={<div className={classes.dialogIconContent}>
                        <RiSendPlaneFill />
                    </div>}
                    showDivider={false}
                    onClose={onClose}
                    onCancel={onClose}
                    onConfirm={prepareForSubmit}
                    contentStyle={classes.testSendDialog}
                    reduceTitle
                    style={{ minWidth: 240, zIndex: '100 !important' }}
                    cancelText="common.Cancel"
                    confirmText="common.Ok"
                >
                    <Box className={clsx(classes.contentBox, classes.mt10, classes.mb25)}>
                        <PulseemRadio
                            classes={classes}
                            name={"sendMethod"}
                            onChange={handleSendMethod}
                            value={sendSendMethod}
                            radioOptions={radios}
                        />
                    </Box>
                </BaseDialog>
            </>
        );
}

export default TestSend;
