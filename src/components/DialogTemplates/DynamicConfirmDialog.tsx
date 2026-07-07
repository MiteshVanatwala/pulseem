import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Box, Button, Grid, Typography } from '@material-ui/core';
import { BaseDialog } from "../DialogTemplates/BaseDialog";
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { DynamicContentProps } from './Types/Dialog';
import { coreProps } from '../../model/Core/corePros.types';
import { commonProps } from '../../model/Common/commonProps.types';

const DynamicConfirmDialog = ({
    classes,
    text = '',
    title = '',
    isOpen = false,
    onCancel,
    onConfirm,
    onClose,
    confirmButtonText = '',
    cancelButtonText = 'common.cancel'
}: DynamicContentProps) => {
    const { t } = useTranslation();
    const { isRTL } = useSelector(
        (state: { core: coreProps }) => state.core
    );

    const dialog = {
        classes: classes,
        title: title,
        showDivider: true,
        icon: null,
        content: (
            <Grid container>
                <Grid item xs={12} className={clsx(classes.mb4)}>
                    <Box>
                        <Typography className={classes.textCenter}>
                            {RenderHtml(text)}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        ),
        renderButtons: () => (
            <Grid
                container
                spacing={4}
                className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
            >
                <Grid item>
                    <Button
                        variant='contained'
                        size='small'
                        onClick={() => { onConfirm() }}
                        className={clsx(
                            classes.btn,
                            classes.btnRounded
                        )}>
                        {confirmButtonText !== '' ? confirmButtonText : t('common.confirm')}
                    </Button>
                </Grid>
                {onCancel && <Grid item>
                    <Button
                        variant='contained'
                        size='small'
                        onClick={() => { onCancel() }}
                        className={clsx(
                            classes.btn,
                            classes.btnRounded
                        )}>
                        {t(cancelButtonText)}
                    </Button>
                </Grid>}
            </Grid>
        ),
        footerText: () => (
            <Typography className={clsx(classes.contactUs, classes.newLine)} style={{ textAlign: 'center' }}>
                {t('sms.havingIssuesMessage')}
            </Typography>
        )
    };

    return (<BaseDialog
        open={isOpen ?? false}
        onClose={() => onClose()}
        onCancel={() => onCancel ? onCancel() : onClose()}
        {...dialog}>
        {dialog.content}
    </BaseDialog>);
}

export default DynamicConfirmDialog;