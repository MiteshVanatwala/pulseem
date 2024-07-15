import clsx from "clsx";
import { Box, Typography, Grid, Button } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { RenderHtml } from '../../../../helpers/Utils/HtmlUtils'
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { WhiteLabelObject } from "../../../../components/WhiteLabel/WhiteLabelMigrate";
import { useEffect, useState } from "react";

const SendResponseDialog = ({
    isOpen = false,
    classes,
    data,
    setDialogType = () => null
}) => {
    const { t } = useTranslation();
    const { Title, Text, ShowContactSupport = false, redirect = null } = data;
    const { accountSettings } = useSelector((state) => state.common);
    const navigate = useNavigate();
    const [isWhiteLabel, setIsWhiteLabel] = useState(false);

    useEffect(() => {
        const refId = accountSettings?.Account?.ReferrerID;
        // @ts-ignore
        setIsWhiteLabel(refId > 0 && WhiteLabelObject[refId] !== undefined);
    }, [accountSettings])

    const currentDialog = {
        style: { paddingBottom: 20 },
        showDefaultButtons: false,
        title: Title,
        showDivider: true,
        disableBackdropClick: true,
        content: (
            <Box>
                <Typography className={clsx(classes.f18, classes.textCenter)}>
                    {RenderHtml(Text)}
                </Typography>
                {ShowContactSupport && <Typography className={classes.f18}>
                    {RenderHtml(t(WhiteLabelObject[isWhiteLabel ? accountSettings?.Account?.ReferrerID : 0]['ContactOnError']))}
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