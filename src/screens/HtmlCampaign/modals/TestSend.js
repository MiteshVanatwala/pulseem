import React, { useState } from "react";
import clsx from "clsx";
import { Box, Typography, Chip, InputBase } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { RiSendPlaneFill } from 'react-icons/ri'
import PulseemRadio from '../../../components/Controlls/PulseemRadio'
import "moment/locale/he";
import { useSelector } from "react-redux";
import Toast from '../../../components/Toast/Toast.component';
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import GroupSelectorDropDown from "../../../components/Groups/GroupSelectorDropDown";

const TestSend = ({
    classes,
    isOpen = false,
    onClose,
    campaignId,
    onSubmit = () => null
}) => {
    const { t } = useTranslation();
   const [emails, setEmails] = useState([]);
   const [inputValue, setInputValue] = useState('');
    const [sendSendMethod, setSendMethod] = useState("1");
    const [toastMessage, setToastMessage] = useState(null);
    //eslint-disable-next-line
    const [selectedGroups, setTestGroups] = useState([]);
    const { isRTL, windowSize } = useSelector(state => state.core);
    const { ToastMessages } = useSelector(state => state.campaignEditor);
    const { testGroups } = useSelector((state) => state.group);

    const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const validateEmail = (email) => EMAIL_REGEX.test(email.trim());

    const addEmail = (value) => {
        const trimmed = value.trim().replace(/,+$/, '');
        if (!trimmed) return;
        if (emails.length >= 5) return;
        if (!validateEmail(trimmed)) {
            setToastMessage(ToastMessages.INVALID_EMAIL);
            return;
        }
        if (!emails.includes(trimmed)) {
            setEmails(prev => [...prev, trimmed]);
        }
        setInputValue('');
    };

    const handleEmailKeyDown = (e) => {
        if (['Enter', ',', 'Tab'].includes(e.key)) {
            e.preventDefault();
            addEmail(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && emails.length > 0) {
            setEmails(prev => prev.slice(0, -1));
        }
    };
    const handleSendMethod = (e) => {
        const sendMethod = e.target.value;
        setSendMethod(e.target.value);
        if (sendMethod === "1") {
            setEmails([]);
            setInputValue('');
        }
    }
    const onBeforeClose = () => {
        setEmails([]);
        setInputValue('');
        setTestGroups([]);
        onClose();
    }

    const prepareForSubmit = () => {
        if ((sendSendMethod === "1" && emails.length > 0) || sendSendMethod === "2") {
            const request = {
                Language: `${isRTL ? 'he-IL' : 'en-US'}`,
                CampaignID: campaignId,
                Emails: sendSendMethod === "1" ? emails.join(', ') : '',
                GroupIds: sendSendMethod === "2" ? selectedGroups : []
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
            label: t("campaigns.sendToMoreContact"),
            child: (
                <Box className={classes.chipBoxWrapper}>
                    <Box
                        onClick={() => document.getElementById('email-chip-input')?.focus()}
                        className={classes.chipBox}
                    >
                        {emails.map((email) => (
                            <Chip
                                key={email}
                                label={email}
                                size="small"
                                onDelete={() => setEmails(prev => prev.filter(e => e !== email))}
                                className={classes.chip}
                            />
                        ))}
                        {emails.length < 5 && (
                            <InputBase
                                id="email-chip-input"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleEmailKeyDown}
                                onBlur={() => addEmail(inputValue)}
                                placeholder={t(emails.length === 0 ? 'common.Email' : 'campaigns.testSend.addMoreEmail')}
                                className={classes.inputBase}
                                autoFocus
                            />
                        )}
                        {emails.length >= 5 && (
                            <Typography variant="caption" className={classes.maxEmailsText}>
                                {t('campaigns.testSend.maxEmails')}
                            </Typography>
                        )}
                    </Box>
                </Box>
            )
        },
        {
            value: "2",
            className: classes.radioButtonActive,
            label: <>{t("mainReport.sendToGroups")}</>,
            child: <GroupSelectorDropDown
                classes={classes}
                title={'siteTracking.typeGroupName'}
                style={{ width: '100%', maxWidth: windowSize === 'xs' ? 320 : 460, boxSizing: 'border-box' }}
                dropdown
                onRemoveGroup={handleRemoveGroup}
                groupSelected={selectedGroups}
                dropDownProps={{
                    onSelectGroup: (arr) => {
                        setTestGroups(arr);
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
                    onClose={onBeforeClose}
                    onCancel={onBeforeClose}
                    onConfirm={prepareForSubmit}
                    contentStyle={classes.testSendDialogContainer}
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
