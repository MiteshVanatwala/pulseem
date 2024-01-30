import { Box, Grid, IconButton, TextField, Tooltip, Typography } from "@material-ui/core";
import clsx from "clsx";
import { BsInfoCircle } from "react-icons/bs";
import PulseemTags from "../../../../components/Tags/PulseemTags";
import { BiUpload } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const LinkPreviewSettings = ({ classes, data, onUpdate, filesProperties, removeAttachmentFile, onSetDialog }: any) => {
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

    return (<Grid container spacing={3} className={clsx(classes.p15, classes.pt2rem)}>
        <Grid item md={4}>
            <Box>
                <Typography title={translator("landingPages.previewTitle")} className={classes.alignDir}>
                    {translator("landingPages.previewTitle")}
                </Typography>
                <TextField
                    id="previewTitle"
                    label=""
                    variant="outlined"
                    name="Name"
                    value={data.previewTitle}
                    className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.previewTitle })}
                    autoComplete="off"
                    onChange={(e: any) => onUpdate({ ...data, previewTitle: e.target.value })}
                    error={!!errors.previewTitle}
                    title={data.previewTitle}
                />
                <Box className='textBoxWrapper'>
                    <Typography className={clsx(errors.previewTitle ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                        {errors.previewTitle ?? errors.previewTitle}
                    </Typography>
                </Box>
            </Box>
        </Grid>

        <Grid item md={4}>
            <Box>
                <Typography title={translator("landingPages.previewIcon")} className={classes.alignDir}>
                    {translator("landingPages.previewIcon")}
                </Typography>
                <PulseemTags
                    title={""}
                    style={null}
                    classes={classes}
                    tagStyle={{ maxWidth: 150 }}
                    // @ts-ignore
                    items={filesProperties?.map((f) => {
                        return {
                            Name: f.FileName,
                            ID: f.ID
                        };
                    })}
                    // @ts-ignore
                    onShowModal={() => filesProperties.length === 0 && onSetDialog({ type: 'galleryDialog' })}
                    // @ts-ignore
                    handleRemove={removeAttachmentFile}
                    // @ts-ignore
                    icon={<BiUpload />}
                />
                <Box className='textBoxWrapper'>
                    <Typography className={clsx(errors.formName ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                        {errors.previewIcon ?? errors.previewIcon}
                    </Typography>
                </Box>
            </Box>
        </Grid>

        <Grid item md={4}>
            <Box>
                <Typography title={translator("landingPages.previewDescription")} className={classes.alignDir}>
                    {translator("landingPages.previewDescription")}
                </Typography>
                <TextField
                    id="previewDescription"
                    label=""
                    variant="outlined"
                    name="Name"
                    value={data.previewDescription}
                    className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.previewDescription })}
                    autoComplete="off"
                    onChange={(e: any) => onUpdate({ ...data, previewDescription: e.target.value })}
                    error={!!errors.previewDescription}
                    title={data.previewDescription}
                />
                <Box className='textBoxWrapper'>
                    <Typography className={clsx(errors.previewDescription ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                        {errors.previewDescription ?? errors.previewDescription}
                    </Typography>
                </Box>
            </Box>
        </Grid>
    </Grid>)
}

export default LinkPreviewSettings;