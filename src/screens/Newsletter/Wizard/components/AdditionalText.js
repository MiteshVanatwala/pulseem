import {
    Box,
    Grid,
    Typography,
    Checkbox,
    Radio,
    FormControlLabel,
    RadioGroup
} from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx';

export const AdditionalText = ({
    localClasses,
    selectedCheck,
    handleChangeCheckbox,
    classes,
    campaingnValues,
    handleSelectionRadio
}) => {
    const { t } = useTranslation();
    return <Box pt={3}>
        <Typography className={localClasses.suHeading}>{t("campaigns.newsLetterEditor.textAdditions")}</Typography>
        {/* If you don't see this email */}
        <Grid container className={localClasses.contentCenter}>
            <Grid xs={2} sm={1}>
                <Checkbox
                    color="primary"
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                    name='WebViewLocation'
                    checked={!!selectedCheck.WebViewLocation}
                    onClick={handleChangeCheckbox}
                />
            </Grid>
            <Grid xs={10} sm={4}>
                <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.dontSee_clickHere_mail")} align="left">{t("campaigns.newsLetterEditor.dontSee_clickHere_mail")}</Typography>
            </Grid>
            <Grid xs={12} sm={7} className={classes.justifyContentEnd}>
                <RadioGroup row aria-label="WebViewLocation" name="WebViewLocation" defaultValue="1">
                    <FormControlLabel value={1} control={<Radio
                        color="primary"
                        checked={campaingnValues.WebViewLocation === 1}
                        onChange={handleSelectionRadio}
                        disabled={!!!selectedCheck.WebViewLocation}
                        value={1}
                        name="WebViewLocation"
                    />} label={t("campaigns.newsLetterEditor.atBeginning")} />
                    <FormControlLabel value={2} control={<Radio
                        color="primary"
                        checked={campaingnValues.WebViewLocation === 2}
                        onChange={handleSelectionRadio}
                        disabled={!!!selectedCheck.WebViewLocation}
                        value={2}
                        name="WebViewLocation"
                    />} label={t("campaigns.newsLetterEditor.atBottom")} />
                </RadioGroup>
            </Grid>
        </Grid>
        {/* Print Email */}
        <Grid container className={clsx(localClasses.contentCenter, classes.pt15)}>
            <Grid xs={2} sm={1}>
                <Checkbox
                    color="primary"
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                    name='PrintLocation'
                    checked={selectedCheck.PrintLocation || campaingnValues.PrintLocation !== 0}
                    onClick={handleChangeCheckbox}
                />
            </Grid>
            <Grid xs={10} sm={4}>
                <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.printMail")} align="left">{t("campaigns.newsLetterEditor.printMail")}</Typography>
            </Grid>
            <Grid xs={12} sm={7} className={classes.justifyContentEnd}>
                <RadioGroup row aria-label="position" name="PrintLocation" defaultValue="2">
                    <FormControlLabel value={1} control={<Radio
                        color="primary"
                        checked={campaingnValues.PrintLocation === 1}
                        onChange={handleSelectionRadio}
                        disabled={!!!selectedCheck.PrintLocation && campaingnValues.PrintLocation === 0}
                        value={1}
                        name="PrintLocation"
                    />} label={t("campaigns.newsLetterEditor.atBeginning")} />
                    <FormControlLabel value={2} control={<Radio
                        color="primary"
                        checked={campaingnValues.PrintLocation === 2}
                        onChange={handleSelectionRadio}
                        disabled={!!!selectedCheck.PrintLocation && campaingnValues.PrintLocation === 0}
                        value={2}
                        name="PrintLocation"
                    />} label={t("campaigns.newsLetterEditor.atBottom")} />
                </RadioGroup>
            </Grid>
        </Grid>
        {/* Remove Customer from mail list */}
        <Grid container className={clsx(localClasses.contentCenter, classes.pt15)}>
            <Grid xs={2} sm={1} >
                <Checkbox
                    color="primary"
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                    name='UnsubscribeLocation'
                    checked={!!selectedCheck.UnsubscribeLocation}
                    onClick={handleChangeCheckbox}
                />
            </Grid>
            <Grid xs={10} sm={4}>
                <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.removeCustomerFromMail")} align="left">{t("campaigns.newsLetterEditor.removeCustomerFromMail")}</Typography>
            </Grid>
            <Grid xs={12} sm={7} className={classes.justifyContentEnd}>
                <RadioGroup row aria-label="position" name="UnsubscribeLocation" defaultValue="2">
                    <FormControlLabel value={1} control={<Radio
                        color="primary"
                        checked={campaingnValues.UnsubscribeLocation === 1}
                        onChange={handleSelectionRadio}
                        disabled={!!!selectedCheck.UnsubscribeLocation}
                        value={1}
                        name="UnsubscribeLocation"
                    />} label={t("campaigns.newsLetterEditor.atBeginning")} />
                    <FormControlLabel value={2} control={<Radio
                        color="primary"
                        checked={campaingnValues.UnsubscribeLocation === 2}
                        onChange={handleSelectionRadio}
                        disabled={!!!selectedCheck.UnsubscribeLocation}
                        value={2}
                        name="UnsubscribeLocation"
                    />} label={t("campaigns.newsLetterEditor.atBottom")} />
                </RadioGroup>
            </Grid>
        </Grid>
        {/* Update customer information */}
        <Grid container className={clsx(localClasses.contentCenter, classes.pt15)}>
            <Grid xs={2} sm={1}>
                <Checkbox
                    color="primary"
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                    name='UpdateClient'
                    checked={selectedCheck.UpdateClient || campaingnValues.UpdateClient !== 0}
                    onClick={handleChangeCheckbox}
                />
            </Grid>
            <Grid xs={10} sm={4}>
                <Typography className={classes.f14} title={t("campaigns.newsLetterEditor.updateCustomerInfo")} align="left">{t("campaigns.newsLetterEditor.updateCustomerInfo")}</Typography>
            </Grid>
            <Grid xs={12} sm={7} className={classes.justifyContentEnd}>
                <RadioGroup row aria-label="position" name="UpdateClient" defaultValue="2">
                    <FormControlLabel value={1} control={<Radio
                        color="primary"
                        checked={campaingnValues.UpdateClient === 1}
                        onChange={handleSelectionRadio}
                        disabled={!!!selectedCheck.UpdateClient && campaingnValues.UpdateClient === 0}
                        value={1}
                        name="UpdateClient"
                    />} label={t("campaigns.newsLetterEditor.atBeginning")} />
                    <FormControlLabel value={2} control={<Radio
                        color="primary"
                        checked={campaingnValues.UpdateClient === 2}
                        onChange={handleSelectionRadio}
                        disabled={!!!selectedCheck.UpdateClient && campaingnValues.UpdateClient === 0}
                        value={2}
                        name="UpdateClient"
                    />} label={t("campaigns.newsLetterEditor.atBottom")} />
                </RadioGroup>
            </Grid>
        </Grid>
    </Box>
}