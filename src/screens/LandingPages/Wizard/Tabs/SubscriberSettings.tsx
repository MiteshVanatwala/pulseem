import { useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Checkbox, FormControl, FormControlLabel, Grid, MenuItem, TextField, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import PulseemTags from '../../../../components/Tags/PulseemTags';
import { BiPlus } from 'react-icons/bi';
import Groups from '../../../../components/Groups/GroupsHandler/Groups';

const SubscriberSettings =  ({ classes, data, onUpdate, callbackUpdateGroups, callbackSelectAll, removeEmailId, onSetDialog }: any) => {
    const { t: translator } = useTranslation();
    const { subAccountAllGroups } = useSelector((state: any) => state.group);
    const { testGroups } = useSelector((state: any) => state.sms);
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
        reportLeadsToEmails: '',
        updateExistingRecipients: '',
        limitSubscribers: '',
        emailId: '',
    });
    const [showTestGroups, setShowTestGroups] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState<any>([]);

    return (
        <Grid container spacing={3} className={clsx(classes.p15)}>
            <Grid item md={12}>
                <Box>
                    <Typography title={translator("landingPages.redirectURLWhenOffline")} className={clsx(classes.alignDir, classes.pb10, classes.bold)}>
                        {translator("landingPages.addSubscribersToGroups")}
                    </Typography>
                    <Groups
                        classes={classes}
                        list={
                            showTestGroups ? [...subAccountAllGroups, ...testGroups] : [...subAccountAllGroups]
                        }
                        // @ts-ignore
                        showTestGroups={showTestGroups}
                        // test={showTestGroups}
                        selectedList={selectedGroups}
                        //@ts-ignore
                        callbackSelectedGroups={callbackUpdateGroups}
                        //@ts-ignore
                        callbackSelectAll={callbackSelectAll}
                        //@ts-ignore
                        callbackShowTestGroup={() => setShowTestGroups(!showTestGroups)}
                        showSortBy={true}
                        showFilter={false}
                        showSelectAll={true}
                        isFilterSelected={false}
                        bsDot={null}
                        isNotifications={false}
                        isSms={true}
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
                        // @ts-ignore
                        items={data.reportLeadsToEmails?.map((f) => {
                            return {
                                Name: f,
                                ID: f
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
                        <Typography className={clsx(errors.reportLeadsToEmails ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                            {errors.reportLeadsToEmails ?? errors.reportLeadsToEmails}
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
                            value={data.updateExistingRecipients}
                            className={classes.pbt5}
                            onChange={(event, val) => onUpdate({ ...data, updateExistingRecipients: event.target.value })}
                            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
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
                        value={data.limitNumberOfSubscribers}
                        className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
                        autoComplete="off"
                        onChange={(e: any) => onUpdate({ ...data, limitNumberOfSubscribers: e.target.value < 0 ? 0 : e.target.value })}
                        title={data.limitNumberOfSubscribers}
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
                                duplicateMailConfirmation: !data.duplicateMailConfirmation
                            })}
                            checked={data.duplicateMailConfirmation}
                        />
                    }
                    label={translator("landingPages.duplicateEmailConfirmation")}
                />
            </Grid>
        </Grid>
    )
}

export default SubscriberSettings;