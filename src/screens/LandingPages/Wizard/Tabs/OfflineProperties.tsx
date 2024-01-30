import clsx from 'clsx';
import { Box, Button, Grid, TextField, Typography } from '@material-ui/core';
import { DateField } from '../../../../components/managment';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';


const OfflineProperties = ({ classes, data, onUpdate }: any) => {
    const { t: translator } = useTranslation();
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

    return <Grid container spacing={3} className={clsx(classes.p15)}>
        <Grid item md={2}>
            <Box>
                <Typography title={translator("landingPages.formOfflineDate")} className={classes.alignDir}>
                    {translator("landingPages.formOfflineDate")}
                </Typography>
                {/* @ts-ignore */}
                <DateField
                    minDate={moment()}
                    maximumDate={moment().add(100, 'y')}
                    classes={classes}
                    value={data.offlineDate}
                    onChange={(value: any) => {
                        onUpdate({
                            ...data,
                            offlineDate: value
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
                    data.offlineDate && (
                        <Button
                            className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)}
                            onClick={() => {
                                onUpdate({
                                    ...data,
                                    offlineDate: null,
                                    offlineURL: '',
                                });

                                setErrors({
                                    ...errors,
                                    offlineURL: '',
                                })
                            }}
                        >
                            {translator("recipient.reset")}
                        </Button>
                    )
                }
            </Box>
        </Grid>

        <Grid item md={4}>
            <Box>
                <Typography title={translator("landingPages.redirectURLWhenOffline")} className={classes.alignDir}>
                    {translator("landingPages.redirectURLWhenOffline")}
                </Typography>
                <TextField
                    id="redirectURLWhenOffline"
                    label=""
                    variant="outlined"
                    name="redirectURLWhenOffline"
                    value={data.offlineURL}
                    className={clsx(classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.offlineURL })}
                    autoComplete="off"
                    onChange={(e: any) => onUpdate({ ...data, offlineURL: e.target.value })}
                    error={!!errors.offlineURL}
                    title={data.offlineURL}
                />
                <Box className='textBoxWrapper'>
                    <Typography className={clsx(errors.offlineURL ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                        {errors.offlineURL ?? errors.offlineURL}
                    </Typography>
                </Box>
            </Box>
        </Grid>
    </Grid>
}

export default OfflineProperties;