import React, { useState } from "react";
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
    handleSubmit = () => null,
    showLoader = false
}) => {
    const { t } = useTranslation();
    const [sendSendMethod, setSendMethod] = useState(1);
    const [recipient, setRecipient] = useState('');
    const [selectedGroups, setTestGroups] = useState([]);
    const { testGroups } = useSelector(state => state.sms);
    const { windowSize } = useSelector(state => state.core);

    const handleRecipient = (e) => {
        console.log(e.target.value);
        setRecipient(e.target.value);
    }
    const handleSendMethod = (e) => {
        setSendMethod(e.target.value);
    }

    const radios = [
        {
            value: "1",
            classes: [classes.radioButtonActive],
            label: t("campaigns.sendToContact"),
            child: <Box>
                <TextField
                    variant='outlined'
                    size='small'
                    value={recipient}
                    onChange={handleRecipient}
                    className={classes.textField}
                    style={{ width: '100%' }}
                    placeholder={t('common.Email')}
                />
            </Box>
        },
        {
            value: "2",
            classes: [classes.radioButtonActive],
            label: <CustomTooltip
                isSimpleTooltip={true}
                classes={classes}
                interactive={true}
                arrow={true}
                style={{ fontSize: 14 }}
                placement={'top'}
                icon={<span className={classes.newIcn}>{t("mainReport.newFeature")}</span>}
                text={t("mainReport.sendToGroups")}
            />,
            child: <Box>
                <GroupTags
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
            </Box>
        }
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
            onConfirm={handleSubmit}
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
            <Loader isOpen={showLoader} />
        </Dialog>
    );
}

export default TestSend;
