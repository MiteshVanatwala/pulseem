import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Grid, TextField, Typography } from '@material-ui/core';
import { Autocomplete } from '@mui/material';
import { PlaceHolders } from '../../../../helpers/Constants';


const SeoSettings = ({ classes, data, onUpdate, errors }: any) => {
    const { t: translator } = useTranslation();
    
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
                    value={data.PageTitle}
                    className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.PageTitle })}
                    autoComplete="off"
                    onChange={(e: any) => onUpdate({ ...data, PageTitle: e.target.value })}
                    error={!!errors.PageTitle}
                    title={data.PageTitle}
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
                    key={data.MetaKeywords}
                    value={data?.MetaKeywords || ''}
                    onChange={(event: any, value: any, reason: any) => {
                        if (reason === 'createOption') {
                            console.log(data?.MetaKeywords?.length)
                            onUpdate({
                                ...data,
                                MetaKeywords: data?.MetaKeywords === null ? `${value[0]}` : `${data.MetaKeywords}, ${value[0]}`
                            })
                        }
                    }}
                    renderTags={(value: any, props: any) =>
                        value?.split(',').map((option: string, index: any) => (
                            <Chip label={option} {...props({ index })} className={clsx(classes.MuiChipRoot)} onDelete={() => {
                                const filteredMeta = data.MetaKeywords?.split(',').filter((m: any) => { return m !== option });
                                onUpdate({
                                    ...data,
                                    MetaKeywords: filteredMeta.join(',')
                                })
                            }} />
                        ))
                    }
                    renderInput={(params: any) => <TextField {...params} className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.MetaKeywords })} />}
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
                    onChange={(e: any) => onUpdate({ ...data, MetaDescription: e.target.value })}
                    value={data.MetaDescription}
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
                    style={{ textAlign: 'left', direction: 'ltr' }}
                    onChange={(e: any) => onUpdate({ ...data, ClientJavaScript: e.target.value })}
                    value={data.ClientJavaScript}
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
                    style={{ textAlign: 'left', direction: 'ltr' }}
                    onChange={(e: any) => onUpdate({ ...data, ClientBodyScript: e.target.value })}
                    value={data.ClientBodyScript}
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
                    style={{ textAlign: 'left', direction: 'ltr' }}
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
                    id="FacebookPixelCode"
                    className={clsx(classes.textarea, classes.sidebar)}
                    style={{ textAlign: 'left', direction: 'ltr' }}
                    onChange={(e: any) => onUpdate({ ...data, FacebookPixelCode: e.target.value })}
                    value={data.FacebookPixelCode}
                ></textarea>
            </Box>
        </Grid>
    </Grid>)
}
export default SeoSettings;