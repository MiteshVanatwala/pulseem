import clsx from "clsx";
import { Box, Typography, Grid, Button } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { RenderHtml } from '../../../../helpers/Utils/HtmlUtils'
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';
import { useNavigate } from "react-router-dom";

const SendResponseDialog = ({
    isOpen = false,
    classes,
    data,
    setDialogType = () => null
}) => {
    const { t } = useTranslation();
    const { Title, Text, ShowContactSupport = false, redirect = null } = data;
    const navigate = useNavigate();
    const currentDialog = {
        style: { paddingBottom: 20 },
        showDefaultButtons: false,
        title: Title,
        showDivider: true,
        disableBackdropClick: true,
        content: (
            <Box>
                {/* <Typography className={clsx(classes.f18, classes.textCenter)}>
                    {RenderHtml(`${Text} ${!ShowContactSupport ? null : t('campaigns.newsLetterEditor.errors.contactUs')}`)}
                </Typography> */}
                <Typography className={clsx(classes.f18, classes.textCenter)}>
                    {RenderHtml(Text)}
                </Typography>
                {ShowContactSupport && <Typography className={classes.f18}>
                    {RenderHtml(t('campaigns.newsLetterEditor.errors.contactUs'))}
                </Typography>
                }
            </Box>
        ),
        renderButtons: () => (
            <Grid
                container
                spacing={4}
                className={clsx(
                    classes.dialogButtonsContainer
                )}
            >
                <Grid item>
                    <Button
                        name="btnConfirm"
                        variant="contained"
                        size="small"
                        onClick={() => {
                            if (redirect && redirect !== '') {
                                navigate(redirect);
                            }
                            setDialogType(null)
                        }}
                        className={clsx(classes.dialogButton, classes.dialogConfirmButton)}
                    >
                        <>{t('common.Ok')}</>
                    </Button>
                </Grid>
            </Grid>
        )
    }

    return <BaseDialog
        classes={classes}
        open={isOpen}
        onConfirm={() => { setDialogType(null) }}
        onCancel={() => {
            if (redirect && redirect !== '') {
                navigate(redirect);
            }
            setDialogType(null)
        }}
        onClose={() => {
            if (redirect && redirect !== '') {
                navigate(redirect);
            }
            setDialogType(null)
        }}
        {...currentDialog}>
        {currentDialog.content}
    </BaseDialog>
}

export default SendResponseDialog