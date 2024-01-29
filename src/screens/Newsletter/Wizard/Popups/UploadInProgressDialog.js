import { Box, Typography, Button, Grid } from '@material-ui/core'
import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux';
import { RenderHtml } from '../../../../helpers/Utils/HtmlUtils';

const UploadInProgressDialog = ({
    classes,
    onClose
}) => {
    const { t } = useTranslation()
    const { isRTL } = useSelector((state) => state.core);
    return {
        showDivider: false,
        disableBackdropClick: true,
        content: (
            <Box className={clsx(classes.flexColumnCenter, classes.p20)}>
                <Typography className={clsx(classes.fontBold, classes.font24, classes.mt2)}>
                    {t('recipient.bulkImportTitle')}
                </Typography>
                <Typography className={clsx(classes.font18, classes.mt2)}>
                    {RenderHtml(t("recipient.importResponses.fileUploaded"))}
                </Typography>
                <Grid
                    container
                    spacing={4}
                    className={clsx(
                        classes.dialogButtonsContainer,
                        classes.mt3
                    )}
                >
                    <Grid item>
                        <Button onClick={() => { onClose() }}
                            variant='contained'
                            size='medium'
                            className={clsx(
                                classes.btn, classes.btnRounded
                            )}
                            style={{ margin: '8px' }}
                            color="primary"
                        >{t('common.Ok')}</Button>
                    </Grid>
                </Grid>
            </Box>
        ),
        renderButtons: false,
        showDefaultButtons: false,
        exit: true
    }
}

export default UploadInProgressDialog