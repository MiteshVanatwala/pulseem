import React, { useEffect, useState, createRef, useRef } from "react";
import clsx from "clsx";
import { Typography, Button, TextField, Box } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Loader } from '../../../components/Loader/Loader';
import { RiSendPlaneFill } from 'react-icons/ri'
import PulseemRadio from '../../../components/Controlls/PulseemRadio'
import "moment/locale/he";
import { Dialog } from "../../../components/managment/Dialog";
import GroupTags from "../../../components/Groups/GroupTags";
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import { useSelector } from "react-redux";

const TestSend = ({
    classes,
    isOpen = false,
    onClose,
    campaignId,
    onSubmit = () => null
}) => {
    const { t } = useTranslation();
    const [sendSendMethod, setSendMethod] = useState("1");
    const [recipient, setRecipient] = useState('');
    const [selectedGroups, setTestGroups] = useState([]);
    const { testGroups } = useSelector(state => state.sms);
    const { windowSize, isRTL } = useSelector(state => state.core);

    const handleRecipient = (e) => {
        setRecipient(e.target.value);
    }
    const handleSendMethod = (e) => {
        setSendMethod(e.target.value);
    }

    const prepareForSubmit = () => {
        const request = {
          Language: `${isRTL ? 'he-IL' : 'en-US'}`,
          CampaignID: campaignId,
          Emails: recipient,
          GroupIds: selectedGroups
        }
        onSubmit(request);
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
                className={classes.textField}
                style={{ width: '100%' }}
                placeholder={t('common.Email')}
                autoFocus
            />
        }//,
        /*{
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
                dropDownProps={{
                    onChange: (e, val) => {
                        const idArr = val.reduce((prevVal, newVal) => [...prevVal, newVal.GroupID], [])
                        setTestGroups(idArr)
                    },
                    selectedGroups: selectedGroups,
                    groups: testGroups
                }}
            />
        }*/
    ];

    return (
        <Dialog
            classes={classes}
            customContainerStyle={classes.dialogZindex}
            open={isOpen}
            title={t('mainReport.testSend')}
            icon={<div className={classes.dialogIconContent}>
                <RiSendPlaneFill />
            </div>}
            showDivider={true}
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
        </Dialog>
    );
}

export default TestSend;
