import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Checkbox, FormControl, FormControlLabel, Grid, MenuItem, TextField, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import PulseemTags from '../../../../components/Tags/PulseemTags';
import { BiPlus } from 'react-icons/bi';
import { coreProps } from '../../../Whatsapp/Campaign/Types/WhatsappCampaign.types';

const SubscriberSettings = ({ classes, data, onUpdate, removeEmailId, onSetDialog, errors }: any) => {
    const { t: translator } = useTranslation();
    const { isRTL } = useSelector(
        (state: { core: coreProps }) => state.core
    );

    return (
        <Grid container spacing={3} className={clsx(classes.p15)}>
            <Grid item md={6}>
                <Box>
                    <Typography title={translator("landingPages.reportLeadsToEmails")} className={classes.alignDir}>
                        {translator("landingPages.reportLeadsToEmails")}
                    </Typography>
                    <PulseemTags
                        title={""}
                        style={null}
                        classes={classes}
                        tagStyle={{ maxWidth: 150 }}
                        items={data?.EmailsToReport && data?.EmailsToReport.map((emailId: string) => {
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

            <Grid item md={6}>
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

            <Grid item md={6}>
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

            <Grid item md={6} className={clsx(classes.dFlex)}>
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
        </Grid>
    )
}

export default SubscriberSettings;