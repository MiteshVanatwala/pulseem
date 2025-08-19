import clsx from 'clsx';
import { Box, Button, Checkbox, FormControl, FormControlLabel, Grid, TextField, Typography, Select as SelectPM, MenuItem } from '@material-ui/core';
import { DateField } from '../../../../components/managment';
import { useTranslation } from 'react-i18next';
import { defaultAccountExtraDataLandingPage } from '../../../../helpers/Constants';
import { useSelector } from 'react-redux';
import { coreProps } from '../../../Whatsapp/Campaign/Types/WhatsappCampaign.types';

const OfflineProperties = ({ classes, data, onUpdate, errors, setErrors }: any) => {
    const { t: translator } = useTranslation();
    const { isRTL } = useSelector(
            (state: { core: coreProps }) => state.core
        );

    const renderAutofillFields = () => {
        return (
            <>
                <Grid item xs={12} md={5}>
                    <Box>
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
                                    displayEmpty
                                    value={data.autofillFields || []}
                                    style={{
                                        height: '56px'
                                    }}
                                    onChange={(e: any) => {
                                        const selected = e.target.value as string[];
                                        onUpdate({
                                            ...data,
                                            autofillFields: selected
                                        });
                                    }}
                                    renderValue={(selected) => {
                                        if (!selected || (selected as string[]).length === 0) {
                                            return <Typography style={{ 
                                                color: 'rgba(0, 0, 0, 0.6)',
                                                padding: '8px 0'
                                            }}>
                                                {translator("landingPages.selectAutofillFieldsPlaceHolder")}
                                            </Typography>;
                                        }
                                        return (selected as string[])
                                            .map(key => {
                                                const field = defaultAccountExtraDataLandingPage.find(item => Object.keys(item)[0] === key);
                                                return field ? translator(Object.values(field)[0] as string) : key;
                                            })
                                            .join(', ');
                                    }}
                                    MenuProps={{
                                        anchorOrigin: {
                                            vertical: 'bottom',
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
                                style={{ alignItems: 'flex-start', margin: 0 }}
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
                                        style={{ paddingTop: 0 }}
                                    />
                                }
                                label={translator("landingPages.autofillEditable")}
                                labelPlacement="end"
                            />
                        </Grid>
                    </>
                )}
            </>
        );
    };

    return (
        <Grid container spacing={3} className={clsx(classes.p15, classes.mb4)}>
            <Grid item md={6} className={classes.w100}>
                <Typography title={translator("landingPages.formOfflineDate")} className={classes.alignDir}>
                    {translator("landingPages.formOfflineDate")}
                </Typography>
                {/* @ts-ignore */}
                <DateField
                    classes={classes}
                    value={data.OfflineDate}
                    onChange={(value: any) => {
                        onUpdate({
                            ...data,
                            OfflineDate: value
                        })
                    }}
                    placeholder={translator('common.FromDate')}
                    timePickerOpen={false}
                    dateActive={true}
                    onTimeChange={() => { }}
                    timeActive={false}
                    buttons={[]}
                    removePadding={true}
                    hideInvalidDateMessage={true}
                />
                {
                    data.OfflineDate && (
                        <Button
                            className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)}
                            onClick={() => {
                                onUpdate({
                                    ...data,
                                    OfflineDate: null,
                                    OfflineUrl: '',
                                });

                                setErrors({
                                    ...errors,
                                    OfflineUrl: '',
                                })
                            }}
                        >
                            {translator("recipient.reset")}
                        </Button>
                    )
                }
            </Grid>

            <Grid item md={6} className={classes.w100}>
                <Typography title={translator("landingPages.redirectURLWhenOffline")} className={classes.alignDir}>
                    {translator("landingPages.redirectURLWhenOffline")}
                </Typography>
                <TextField
                    id="redirectURLWhenOffline"
                    label=""
                    variant="outlined"
                    name="redirectURLWhenOffline"
                    value={data.OfflineUrl}
                    className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.OfflineUrl })}
                    autoComplete="off"
                    onChange={(e: any) => onUpdate({ ...data, OfflineUrl: e.target.value })}
                    error={!!errors.OfflineUrl}
                    title={data.OfflineUrl}
                />
                <Box className='textBoxWrapper'>
                    <Typography className={clsx(classes.f14)}>
                        Example: https://www.redirectURL.com
                    </Typography>
                    <Typography className={clsx(errors.OfflineUrl ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                        {errors.OfflineUrl ?? errors.OfflineUrl}
                    </Typography>
                </Box>
            </Grid>
            {renderAutofillFields()}
        </Grid>
    )
}

export default OfflineProperties;