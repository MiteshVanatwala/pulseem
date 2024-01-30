import { useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Grid, TextField, Typography } from '@material-ui/core';
import { Autocomplete } from '@mui/material';
import { PlaceHolders } from '../../../../helpers/Constants';


const SeoSettings = ({ classes, data, onUpdate }: any) => {
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

    return (<Grid container spacing={3} className={clsx(classes.p15)}>
        <Grid item md={12}>
            <Box>
                <Typography title={translator("landingPages.pageTitle")} className={classes.alignDir}>
                    {translator("landingPages.pageTitle")}
                </Typography>
                <TextField
                    id="pageTitle"
                    label=""
                    variant="outlined"
                    name="pageTitle"
                    value={data.seoPageTitle}
                    className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.seoPageTitle })}
                    autoComplete="off"
                    onChange={(e: any) => onUpdate({ ...data, seoPageTitle: e.target.value })}
                    error={!!errors.seoPageTitle}
                    title={data.seoPageTitle}
                />
            </Box>
        </Grid>

        <Grid item md={12}>
            <Box>
                <Typography title={translator("landingPages.keywords")} className={classes.alignDir}>
                    {translator("landingPages.keywords")}
                </Typography>
                <Autocomplete
                    clearIcon={false}
                    options={[]}
                    freeSolo
                    multiple
                    value={data.seoKeywords}
                    onChange={(event: any, value: any, reason: any) => {
                        onUpdate({
                            ...data,
                            seoKeywords: value
                        })
                    }}
                    renderTags={(value: any, props: any) =>
                        value.map((option: string, index: any) => (
                            <Chip label={option} {...props({ index })} className={clsx(classes.MuiChipRoot)} />
                        ))
                    }
                    renderInput={(params: any) => <TextField {...params} className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.formName })} />}
                />
            </Box>
        </Grid>

        <Grid item md={12}>
            <Box>
                <Typography title={translator("landingPages.description")} className={classes.alignDir}>
                    {translator("landingPages.description")}
                </Typography>
                <textarea
                    placeholder={translator("landingPages.description")}
                    maxLength={1000}
                    id="yourMessage"
                    className={clsx(classes.textarea, classes.sidebar)}
                    // style={{ textAlign: alignment }}
                    onChange={(e: any) => onUpdate({ ...data, pageDescription: e.target.value })}
                    value={data.pageDescription}
                ></textarea>
            </Box>
        </Grid>

        <Grid item md={3}>
            <Box>
                <Typography title={translator("landingPages.googleAnalytics")} className={classes.alignDir}>
                    {translator("landingPages.googleAnalytics")}
                </Typography>
                <textarea
                    placeholder={PlaceHolders.GOOGLE_ANALYTICS}
                    maxLength={1000}
                    id="yourMessage"
                    className={clsx(classes.textarea, classes.sidebar)}
                    // style={{ textAlign: alignment }}
                    onChange={(e: any) => onUpdate({ ...data, googleAnalytics: e.target.value })}
                    value={data.googleAnalytics}
                ></textarea>
            </Box>
        </Grid>

        <Grid item md={3}>
            <Box>
                <Typography title={translator("landingPages.googleConvertion")} className={classes.alignDir}>
                    {translator("landingPages.googleConvertion")}
                </Typography>
                <textarea
                    placeholder={PlaceHolders.GOOGLE_CONVERSION}
                    maxLength={1000}
                    id="yourMessage"
                    className={clsx(classes.textarea, classes.sidebar)}
                    // style={{ textAlign: alignment }}
                    onChange={(e: any) => onUpdate({ ...data, googleConvertion: e.target.value })}
                    value={data.googleConvertion}
                ></textarea>
            </Box>
        </Grid>

        <Grid item md={3}>
            <Box>
                <Typography title={translator("landingPages.googleTagManager")} className={classes.alignDir}>
                    {translator("landingPages.googleTagManager")}
                </Typography>
                <textarea
                    placeholder={PlaceHolders.GOOGLE_TAG_MANAGER}
                    maxLength={1000}
                    id="yourMessage"
                    className={clsx(classes.textarea, classes.sidebar)}
                    onChange={(e: any) => onUpdate({ ...data, googleTagManager: e.target.value })}
                    value={data.googleTagManager}
                ></textarea>
            </Box>
        </Grid>

        <Grid item md={3}>
            <Box>
                <Typography title={translator("landingPages.facebookPixel")} className={classes.alignDir}>
                    {translator("landingPages.facebookPixel")}
                </Typography>
                <textarea
                    placeholder={PlaceHolders.FACEBOOK_PIXEL}
                    maxLength={1000}
                    id="facebookPixel"
                    className={clsx(classes.textarea, classes.sidebar)}
                    // style={{ textAlign: alignment }}
                    onChange={(e: any) => onUpdate({ ...data, facebookPixel: e.target.value })}
                    value={data.facebookPixel}
                ></textarea>
            </Box>
        </Grid>
    </Grid>)
}
export default SeoSettings;