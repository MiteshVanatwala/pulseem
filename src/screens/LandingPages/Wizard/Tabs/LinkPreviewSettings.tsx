import { Box, Grid, TextField, Typography } from "@material-ui/core";
import clsx from "clsx";
import PulseemTags from "../../../../components/Tags/PulseemTags";
import { BiUpload } from "react-icons/bi";
import { useTranslation } from "react-i18next";

const LinkPreviewSettings = ({ classes, data, onUpdate, filesProperties, removeAttachmentFile, onSetDialog, errors }: any) => {
    const { t: translator } = useTranslation();

    return (<Grid container spacing={3} className={clsx(classes.p15)}>
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
                    value={data.LinkPreviewTitle}
                    className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100, { [classes.textFieldError]: !!errors.LinkPreviewTitle })}
                    autoComplete="off"
                    onChange={(e: any) => onUpdate({ ...data, LinkPreviewTitle: e.target.value })}
                    error={!!errors.LinkPreviewTitle}
                    title={data.LinkPreviewTitle}
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