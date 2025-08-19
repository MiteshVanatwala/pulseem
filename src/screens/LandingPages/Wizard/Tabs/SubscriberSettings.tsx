import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Button, Checkbox, FormControl, FormControlLabel, Grid, Input, ListItemText, MenuItem, Radio, RadioGroup, TextField, Typography, Select as SelectPM } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import PulseemTags from '../../../../components/Tags/PulseemTags';
import { BiPlus } from 'react-icons/bi';
import { coreProps } from '../../../Whatsapp/Campaign/Types/WhatsappCampaign.types';
import { WebformsToReportLeadByApi } from '../../../../Models/LandingPage/WebformsToReportLeadByApi';
import RegistrationToApiForm from '../Popups/RegistrationToApiForm';
import { useEffect, useState } from 'react';
import ConfirmRadioDialog from '../../../../components/DialogTemplates/ConfirmRadioDialog';
import { RenderHtml } from '../../../../helpers/Utils/HtmlUtils';
import { AiOutlineExclamationCircle } from 'react-icons/ai';
import { defaultAccountExtraDataLandingPage } from '../../../../helpers/Constants';

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
    const [isNewPage, setIsNewPage] = useState<boolean>(true);
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

    useEffect(() => {
        const isNewPage = !data?.ID || data?.ID > 0;
        setIsNewPage(isNewPage);
    }, []);

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

    const renderAutofillFields = () => {
        return (
            <>
                <Grid item xs={12} md={5}>
                    <Box className={clsx(classes.pt15)}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={data?.autofillEnabled}
                                    onChange={(e) => {
                                        onUpdate({
                                            ...data,
                                            autofillEnabled: e.target.checked,
                                            autofillFields: e.target.checked ? data?.autofillFields : []
                                        });
                                    }}
                                    color="primary"
                                />
                            }
                            classes={{
                                root: classes.formControlLabelRoot,
                                label: classes.formControlLabelAlign
                            }}
                            label={translator("landingPages.autofillFields")}
                        />
                    </Box>
                </Grid>

                {data.autofillEnabled && (
                    <>
                        <Grid item xs={12} md={7}>
                            <FormControl variant="outlined" className={clsx(classes.w100, classes.pt10)}>
                                <SelectPM
                                    multiple
                                    value={data.autofillFields || []}
                                    onChange={(e: any) => {
                                        const selected = e.target.value as string[];
                                        onUpdate({
                                            ...data,
                                            autofillFields: selected
                                        });
                                    }}
                                    renderValue={(selected) => (
                                        (selected as string[])
                                            .map(key => {
                                                const field = defaultAccountExtraDataLandingPage.find(item => Object.keys(item)[0] === key);
                                                return field ? translator(Object.values(field)[0] as string) : key;
                                            })
                                            .join(', ')
                                    )}
                                    MenuProps={{
                                        anchorOrigin: {
                                            vertical: 'top',
                                            horizontal: 'left',
                                        },
                                        transformOrigin: {
                                            vertical: 'top',
                                            horizontal: 'left',
                                        },
                                        getContentAnchorEl: null,
                                        PaperProps: {
                                            style: {
                                                maxHeight: '300px',
                                                width: 'auto',
                                                direction: isRTL ? 'rtl' : 'ltr'
                                            },
                                        },
                                    }}
                                >
                                    {defaultAccountExtraDataLandingPage.map((item: any) => {
                                        const key = Object.keys(item)[0];
                                        const value = Object.values(item)[0];
                                        return (
                                            <MenuItem key={key} value={key}>
                                                <Checkbox checked={(data.autofillFields || []).indexOf(key) > -1} />
                                                <Typography>{translator(value)}</Typography>
                                            </MenuItem>
                                        );
                                    })}
                                </SelectPM>
                            </FormControl>

                            <FormControlLabel
                                className={clsx(classes.pt10)}
                                control={
                                    <Checkbox
                                        checked={data.autofillEditable}
                                        onChange={(e) => {
                                            onUpdate({
                                                ...data,
                                                autofillEditable: e.target.checked
                                            });
                                        }}
                                        color="primary"
                                    />
                                }
                                label={translator("landingPages.autofillEditable")}
                            />
                        </Grid>
                    </>
                )}
            </>
        );
    };

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
                        renderValue={() => data.IsUpdate}
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

                {
                    data.IsUpdate === true && (
                        <FormControlLabel
                            className={clsx(classes.pt10)}
                            style={{ alignItems: 'flex-start', margin: 0 }}
                            control={
                                <Checkbox
                                    checked={data.SubscriptionOptin}
                                    onChange={(e) => {
                                        onUpdate({
                                            ...data,
                                            SubscriptionOptin: e.target.checked
                                        });
                                    }}
                                    color="primary"
                                    style={{ paddingTop: 0 }}
                                />
                            }
                            label={translator("landingPages.updateExistingRecipientToActive")}
                            labelPlacement="end"
                        />
                    )
                }
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

            {/* {renderAutofillFields()} */}

            <Grid item md={12} className={clsx(classes.dFlex)}>
                <RadioGroup row aria-label="WebViewLocation" name="WebViewLocation" defaultValue="1" className={clsx(classes.mb10)}
                >
                    <FormControlLabel
                        className={classes.fullWidth}
                        label={translator('landingPages.addClientAsActiveWhenClientSelect')}
                        value={null}
                        control={<Radio
                            color="primary"
                            name={'optinGroup'}
                            inputProps={{ "aria-label": "secondary checkbox" }}
                            checked={data?.DoubleOptin === null || (data?.DoubleOptin === null && isNewPage)}
                            onChange={(e: any) => {
                                onUpdate({
                                    ...data,
                                    DoubleOptin: null
                                })
                            }}
                        />
                        }
                    />
                    <FormControlLabel
                        className={classes.fullWidth}
                        label={translator('landingPages.addClientAsActive')}
                        value={false}
                        control={<Radio
                            color="primary"
                            name={'optinGroup'}
                            inputProps={{ "aria-label": "secondary checkbox" }}
                            checked={data?.DoubleOptin === false}
                            onChange={() => {
                                setShowConfirmDialog(true)
                            }}
                        />
                        }
                    />
                    <FormControlLabel
                        className={classes.fullWidth}
                        label={translator('landingPages.duplicateEmailConfirmation')}
                        value={true}
                        control={<Radio
                            color="primary"
                            name={'optinGroup'}
                            inputProps={{ "aria-label": "secondary checkbox" }}
                            checked={data?.DoubleOptin === true}
                            onChange={() => {
                                onUpdate({
                                    ...data,
                                    DoubleOptin: true
                                })
                            }}
                        />
                        }
                    />
                </RadioGroup>
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
            <ConfirmRadioDialog
                classes={classes}
                isOpen={showConfirmDialog}
                title={translator('common.payAttention')}
                // @ts-ignore
                icon={<AiOutlineExclamationCircle />}
                // @ts-ignore
                radioTitle={RenderHtml(translator('landingPages.changeOptInDesclaimer'))}
                onConfirm={(e: any) => {
                    onUpdate({
                        ...data,
                        DoubleOptin: false
                    });
                    setShowConfirmDialog(false)
                }}
                onCancel={() => setShowConfirmDialog(false)}
                options={null}
            />
        </Grid>
    )
}

export default SubscriberSettings;