import clsx from 'clsx';
import { Box, Button, Grid, TextField, Typography } from '@material-ui/core';
import { DateField } from '../../../../components/managment';
import { useTranslation } from 'react-i18next';

const OfflineProperties = ({ classes, data, onUpdate, errors, setErrors }: any) => {
    const { t: translator } = useTranslation();

    return <Grid container spacing={3} className={clsx(classes.p15, classes.mb4)}>
        <Grid item md={2}>
            <Box>
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
            </Box>
        </Grid>

        <Grid item md={3}>
            <Box>
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
                    <Typography className={clsx(classes.f16)}>
                        Example: https://www.redirectURL.com
                    </Typography>
                    <Typography className={clsx(errors.OfflineUrl ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                        {errors.OfflineUrl ?? errors.OfflineUrl}
                    </Typography>
                </Box>
            </Box>
        </Grid>
    </Grid>
}

export default OfflineProperties;