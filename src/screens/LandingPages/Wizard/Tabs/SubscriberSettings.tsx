import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Checkbox, Divider, FormControl, FormControlLabel, Grid, MenuItem, TextField, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import PulseemTags from '../../../../components/Tags/PulseemTags';
import { BiPlus } from 'react-icons/bi';
import Groups from '../../../../components/Groups/GroupsHandler/Groups';
import { Group } from '../../../../Models/Groups/Group';
import { coreProps } from '../../../Whatsapp/Campaign/Types/WhatsappCampaign.types';

const SubscriberSettings = ({ classes, data, onUpdate, removeEmailId, onSetDialog, onShowTestGroups }: any) => {
    const { t: translator } = useTranslation();
    const { subAccountAllGroups } = useSelector((state: any) => state.group);
    const { testGroups } = useSelector((state: any) => state.sms);
    const { isRTL } = useSelector(
        (state: { core: coreProps }) => state.core
    );
    const [errors, setErrors] = useState({
        formName: '',
        formLanguage: '',
        shortURL: '',
        pageTitle: '',
        answerMessage: '',
        paymentURL: '',
        paymentAPIUsername: '',
        paymentTerminalNumber: '',
        offlineURL: '',
        group: '',
        pageDescription: '',
        googleAnalytics: '',
        googleConvertion: '',
        googleTagManager: '',
        facebookPixel: '',
        cssStyle: '',
        previewTitle: '',
        previewIcon: '',
        previewDescription: '',
        seoPageTitle: '',
        seoKeywords: '',
        seoDescription: '',
        EmailsToReport: '',
        updateExistingRecipients: '',
        limitSubscribers: '',
        emailId: '',
    });
    const [showTestGroups, setShowTestGroups] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState<any>([]);
    const [allGroupsSelected, setAllGroupsSelected] = useState(false);

    const callbackUpdateGroups = (groups: any) => {
        const found = selectedGroups.map((group: Group) => { return group.GroupID; }).includes(groups.GroupID);
        const groupList: Group[] = found
            ? selectedGroups.filter((g: Group) => g.GroupID !== groups.GroupID)
            : [...selectedGroups, groups];
        setSelectedGroups(groupList);
        onUpdate({ ...data, GroupIDs: groupList.map(g => g.GroupID.toString()) })
    }

    const callbackSelectAll = () => {
        let groupList: Group[] = [];
        if (!allGroupsSelected) {
            groupList = showTestGroups ? [...testGroups, ...subAccountAllGroups] : [...subAccountAllGroups];
        } else {
            groupList = [];
        }
        setSelectedGroups(groupList);
        setAllGroupsSelected(!allGroupsSelected);
        onUpdate({ ...data, GroupIDs: groupList.map(g => g.GroupID.toString()) })
    }

    const onRemoveGroup = (leftGroups: Group[]) => {
        if (leftGroups && leftGroups?.length > 0) {
            setSelectedGroups(leftGroups);
            onUpdate({ ...data, GroupIDs: leftGroups.map(g => g.GroupID.toString()) })
        }
        else {
            setSelectedGroups([]);
            onUpdate({ ...data, GroupIDs: [] })
        }
    }

    useEffect(() => {
        if (data && data?.SelectedGroupList?.length > 0) {
            const selected = data.SelectedGroupList.map((x: any) => { return subAccountAllGroups.find((s: any) => s.GroupID === parseInt(x.trim())) })
            setSelectedGroups(selected);
        }
    }, [])



    return (
        <Grid container spacing={3} className={clsx(classes.p15)}>
            <Grid item md={4}>
                <Box>
                    <Typography title={translator("landingPages.reportLeadsToEmails")} className={classes.alignDir}>
                        {translator("landingPages.reportLeadsToEmails")}
                    </Typography>
                    <PulseemTags
                        title={""}
                        style={null}
                        classes={classes}
                        tagStyle={{ maxWidth: 150 }}
                        items={data.EmailsToReport.map((emailId: string) => {
                            return {
                                Name: emailId,
                                ID: emailId
                            };
                        })}
                        // @ts-ignore
                        onShowModal={() => onSetDialog({ type: 'addEmailId' })}
                        // @ts-ignore
                        handleRemove={removeEmailId}
                        // @ts-ignore
                        icon={<BiPlus />}
                    />
                    <Box className='textBoxWrapper'>
                        <Typography className={clsx(errors.EmailsToReport ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                            {errors.EmailsToReport ?? errors.EmailsToReport}
                        </Typography>
                    </Box>
                </Box>
            </Grid>

            <Grid item md={4}>
                <Box>
                    <Typography title={translator("landingPages.updateExistingRecipients")} className={classes.alignDir}>
                        {translator("landingPages.updateExistingRecipients")}
                    </Typography>
                    <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
                        <Select
                            variant="standard"
                            name="FromEmail"
                            value={data.IsUpdate ? 1 : 0}
                            className={classes.pbt5}
                            onChange={(event, val) => onUpdate({ ...data, IsUpdate: event.target.value })}
                            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                        direction: isRTL ? 'rtl' : 'ltr'
                                    },
                                },
                            }}
                        >
                            <MenuItem value={0}>{translator("common.disabled")}</MenuItem>
                            <MenuItem value={1}>{translator("common.enabled")}</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Grid>

            <Grid item md={4}>
                <Box>
                    <Typography title={translator("landingPages.limitNumberOfSubscribers")} className={classes.alignDir}>
                        {translator("landingPages.limitNumberOfSubscribers")}
                    </Typography>
                    <TextField
                        id="limitNumberOfSubscribers"
                        label=""
                        variant="outlined"
                        name="Name"
                        value={data.SubscriptionsLimit}
                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
                        autoComplete="off"
                        onChange={(e: any) => onUpdate({ ...data, SubscriptionsLimit: e.target.value < 0 ? 0 : e.target.value })}
                        title={data.SubscriptionsLimit}
                        type='number'
                    />
                </Box>
            </Grid>

            <Grid item md={12}>
                <FormControlLabel
                    control={
                        <Checkbox
                            color="primary"
                            inputProps={{ "aria-label": "secondary checkbox" }}
                            onClick={() => onUpdate({
                                ...data,
                                DoubleOptin: !data.DoubleOptin
                            })}
                            checked={data.DoubleOptin}
                        />
                    }
                    label={translator("landingPages.duplicateEmailConfirmation")}
                />
            </Grid>
            <Grid item md={12}>
                <Box>
                    <Typography title={translator("landingPages.redirectURLWhenOffline")} className={clsx(classes.alignDir, classes.pb10, classes.bold)}>
                        {translator("landingPages.addSubscribersToGroups")}
                    </Typography>
                    <Groups
                        classes={classes}
                        list={
                            subAccountAllGroups
                        }
                        // @ts-ignore
                        showTestGroups={false}
                        // test={showTestGroups}
                        selectedList={selectedGroups}
                        //@ts-ignore
                        callbackSelectedGroups={callbackUpdateGroups}
                        //@ts-ignore
                        callbackSelectAll={callbackSelectAll}
                        //@ts-ignore
                        callbackShowTestGroup={() => onShowTestGroups(!showTestGroups)}
                        callbackUpdateGroups={onRemoveGroup}
                        showSortBy={true}
                        showFilter={false}
                        showSelectAll={true}
                        isFilterSelected={false}
                        bsDot={null}
                        isNotifications={false}
                        isSms={false}
                        isCampaign={false}
                        noSelectionText={''}
                        //@ts-ignore
                        innerHeight={325}
                    // isFilterSelected={false}
                    />
                    <Box className='textBoxWrapper'>
                        <Typography className={clsx(errors.group ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                            {errors.group ?? errors.group}
                        </Typography>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    )
}

export default SubscriberSettings;