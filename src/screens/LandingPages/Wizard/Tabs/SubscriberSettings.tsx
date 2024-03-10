import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Button, Checkbox, FormControl, FormControlLabel, Grid, Input, ListItemText, MenuItem, TextField, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import PulseemTags from '../../../../components/Tags/PulseemTags';
import { BiPlus } from 'react-icons/bi';
import { coreProps } from '../../../Whatsapp/Campaign/Types/WhatsappCampaign.types';
import { WebformsToReportLeadByApi } from '../../../../Models/LandingPage/WebformsToReportLeadByApi';
import RegistrationToApiForm from '../Popups/RegistrationToApiForm';
import { useState } from 'react';

const SubscriberSettings = ({ classes, data, onUpdate, removeEmailId, onSetDialog, errors, onDone }: any) => {
    const { t: translator } = useTranslation();
    const { isRTL } = useSelector(
        (state: { core: coreProps }) => state.core
    );
    const [createApiIntegrations, setCreateApiIntegrations] = useState<boolean>(false);
    const [editApiIntegrations, setEditApiIntegrations] = useState<boolean>(false);
    const [selectedApiIntegration, setSelectedApiIntegration] = useState<WebformsToReportLeadByApi>({
        ID: -1,
        IsOptinSend: false,
        Name: '',
        RequestPostParams: '',
        RequestUrl: ''
    });
    const [systemSelectOpen, setSystemSelectOpen] = useState<boolean>(false);

    const handleChangeMultiple = (event: any) => {
        //const { value } = event.target;
        // const value = [];
        // for (let i = 0, l = options.length; i < l; i += 1) {
        //     if (options[i].selected) {
        //         value.push(options[i].value);
        //     }
        // }


    };

    const onEditSystem = (id: number) => {
        const found = data?.WebformsToReportLeadByApi.find((x: WebformsToReportLeadByApi) => { return x.ID === id });
        setSelectedApiIntegration(found);

        setEditApiIntegrations(true);
    }

    const resetSelectedApiIntegration = () => {
        setSelectedApiIntegration({
            ID: -1,
            IsOptinSend: false,
            Name: '',
            RequestPostParams: '',
            RequestUrl: ''
        });
        setEditApiIntegrations(false);
        setCreateApiIntegrations(false);
    }

    const handleEditSystem = (item: WebformsToReportLeadByApi) => {
        setSystemSelectOpen(false);
        onEditSystem(item.ID);
    }

    return (
        <Grid container spacing={3} className={clsx(classes.p15)}>
            <Grid item md={6} className={classes.w100}>
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
            </Grid>

            <Grid item md={6} className={classes.w100}>
                <Typography title={translator("landingPages.updateExistingRecipients")} className={classes.alignDir}>
                    {translator("landingPages.updateExistingRecipients")}
                </Typography>
                <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
                    <Select
                        native
                        variant="standard"
                        name="IsUpdate"
                        value={data.IsUpdate === true ? 1 : 0}
                        className={classes.pbt5}
                        renderValue={data.IsUpdate}
                        onChange={(event, val) => onUpdate({ ...data, IsUpdate: event.target.value === '1' })}
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
                        <option value={0}>{translator("common.disabled")}</option>
                        <option value={1}>{translator("common.enabled")}</option>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item md={6} className={classes.w100}>
                <Typography title={translator("landingPages.limitNumberOfSubscribers")} className={classes.alignDir}>
                    {translator("landingPages.limitNumberOfSubscribers")}
                </Typography>
                <TextField
                    style={{ marginTop: 3 }}
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
            </Grid>

            <Grid item md={6} className={classes.w100}>
                <Typography title={translator("landingPages.sendRegistrationToExternalApi")} className={clsx(classes.alignDir)}>
                    {translator("landingPages.sendRegistrationToExternalApi")}
                </Typography>
                {data.Systems && <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
                    <Select
                        labelId="demo-mutiple-checkbox-label"
                        id="demo-mutiple-checkbox"
                        multiple
                        placeholder={translator('common.SelectSystems')}
                        name="Systems"
                        onClick={() => setSystemSelectOpen(!systemSelectOpen)}
                        open={systemSelectOpen}
                        value={data?.Systems || []}
                        input={<Input />}
                        renderValue={() => {
                            const selected: string[] = data?.WebformsToReportLeadByApi?.map((item: WebformsToReportLeadByApi) => {
                                return data.Systems?.indexOf(item.ID.toString()) > -1 ? item.Name : null
                            });

                            if (selected && selected?.filter((elem: any) => { return elem !== null })?.length > 1) {
                                return selected.join(',').slice(0, selected.lastIndexOf(','));
                            }

                            return selected;
                        }}
                        className={classes.pbt5}
                        onChange={(event: any, val: any) => {
                            const arr: string[] = event.target.value;

                            const exists: WebformsToReportLeadByApi[] = data?.WebformsToReportLeadByApi?.filter((item: WebformsToReportLeadByApi) => {
                                return arr.indexOf(item.ID.toString()) > -1
                            });

                            onUpdate({ ...data, Systems: exists.map((x: any) => x.ID.toString()) })

                        }}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300,
                                    direction: isRTL ? 'rtl' : 'ltr'
                                }
                            },
                        }}
                    >
                        {data?.WebformsToReportLeadByApi?.map((item: WebformsToReportLeadByApi) => {
                            return (<MenuItem key={item.ID.toString()} value={item.ID.toString()}>
                                <Checkbox checked={data.Systems?.indexOf(item.ID.toString()) > -1} />
                                <ListItemText primary={item.Name} />
                                <Button onClick={(event: any) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    handleEditSystem(item);
                                }}>{translator("common.edit")}</Button>
                            </MenuItem>)
                        })}
                    </Select>
                </FormControl>}
                <Box className={clsx(classes.dFlex, classes.spaceBetween)}>
                    <Button onClick={() => setCreateApiIntegrations(!createApiIntegrations)}>{translator('common.addNew')}</Button>
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
            <RegistrationToApiForm
                classes={classes}
                webFormId={data.ID}
                apiIntegration={selectedApiIntegration}
                isOpen={createApiIntegrations || editApiIntegrations}
                isNew={createApiIntegrations}
                onClose={() => {
                    resetSelectedApiIntegration();

                }}
                onConfirm={(d: any) => {
                    resetSelectedApiIntegration();
                    onDone();
                }}
            />
        </Grid>
    )
}

export default SubscriberSettings;