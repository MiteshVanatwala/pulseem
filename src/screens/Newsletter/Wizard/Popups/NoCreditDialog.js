import { Box, Typography, Grid, Button } from '@material-ui/core'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AiOutlineExclamationCircle } from 'react-icons/ai'
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog'
import { RenderHtml } from '../../../../helpers/Utils/HtmlUtils'
import { useDispatch, useSelector } from "react-redux";
import { getCommonFeatures } from '../../../../redux/reducers/commonSlice'
import PurchaseWizard from '../../../../components/Balance/PaymentWizard/PurchaseWizard'
import { GoPackage } from 'react-icons/go'
import { getPackagesDetails } from '../../../../redux/reducers/dashboardSlice'

const NoCreditDialog = ({
    classes,
    isOpen,
    popUpType,
    onCancel }) => {
    const { t } = useTranslation()
    const { isRTL } = useSelector(state => state.core)
    const { accountSettings, subAccount } = useSelector(state => state.common)
    const [isOpenPackageDialog, setIsOpenPackageDialog] = useState(false);
    const [isAllowedToPurchase, setIsAllowedToPurchase] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getPackagesDetails());
        if (subAccount?.length === 0) {
            dispatch(getCommonFeatures({ forceRequest: true }))
        }
    }, [])

    useEffect(() => {
        if (subAccount) {
            setIsAllowedToPurchase(accountSettings?.Account?.IsPaying && subAccount?.CompanyAdmin)
        }
    }, [subAccount])

    const handleDialogClose = () => {
        setIsOpenPackageDialog(false);
        dispatch(getPackagesDetails());
        onCancel();
    }

    const renderPackagesListDialog = () => {
        return {
            showDivider: false,
            icon: (
                <GoPackage style={{ fontSize: 35, padding: 5 }} />
            ),
            content: (
                <Grid item xs={12} style={{ paddingBottom: 25 }}>
                    <PurchaseWizard classes={classes} onComplete={() => { onCancel?.() }} packageType={popUpType} />
                </Grid >
            ),
            showDefaultButtons: false,
            onCancel: () => { handleDialogClose() }
        };
    }

    const renderBillingSupportDialog = () => {
        return {
            showDivider: false,
            icon: (
                <GoPackage style={{ fontSize: 35, padding: 5 }} />
            ),
            showDefaultButtons: false,
            content: (
                <Grid item xs={12} style={{ paddingBottom: 5 }}>
                    <Typography className={classes.f20}>
                        {RenderHtml(t("common.contactSupportForBilling"))}
                    </Typography>
                    <Box className={clsx(classes.mt25, classes.flexColCenter)}>
                        <Button
                            variant='contained'
                            size='small'
                            className={clsx(
                                classes.dialogButton,
                                classes.dialogConfirmButton
                            )} onClick={handleDialogClose}>{t("common.Ok")}</Button>
                    </Box>
                </Grid >
            ),
            onConfirm: () => handleDialogClose()
        };
    }

    const dialog = {
        isOpen: isOpen,
        title: t('common.ErrorTitle'),
        showDivider: true,
        disableBackdropClick: true,
        icon: (
            <AiOutlineExclamationCircle
                style={{ fontSize: 30, color: "#fff" }}
            />
        ),
        content: (
            <Box>
                {
                    (!isAllowedToPurchase)
                        ?
                        <>
                            <Typography style={{ textAlign: 'center' }}>{RenderHtml(t("sms.notEnoughCreditLeft"))}</Typography>
                            <Typography style={{ textAlign: 'center' }}>{RenderHtml(t("sms.notEnoughCreditLeftDesc"))}</Typography>
                        </>
                        :
                        <Typography className={classes?.f18}>{RenderHtml(t('campaigns.newsLetterEditor.errors.SMS_BULK_ENDED_PURCHASE_OPTION'))}</Typography>
                }
            </Box>
        ),
        showDefaultButtons: false,
        renderButtons: () => {
            return <Grid
                container
                spacing={4}
                className={clsx(classes?.dialogButtonsContainer, isRTL ? classes?.rowReverse : null)}
            >
                {isAllowedToPurchase &&
                    <Grid item>
                        <Button
                            variant='contained'
                            size='small'
                            onClick={() => { setIsOpenPackageDialog(true) }}
                            className={clsx(
                                classes?.solidDialogButton,
                                classes?.dialogConfirmButton
                            )}>
                            {t('dashboard.purchase')}
                        </Button>
                    </Grid>
                }
                <Grid item>
                    <Button
                        variant='contained'
                        size='small'
                        onClick={() => { onCancel() }}
                        className={clsx(
                            classes?.solidDialogButton,
                            classes?.dialogCancelButton
                        )}>
                        {!isAllowedToPurchase ? t('common.cancel') : t('common.notNow')}
                    </Button>
                </Grid>
            </Grid>
        }
    };

    return <BaseDialog
        classes={classes}
        open={isOpen}
        {...dialog}>
        {dialog.content}
        <BaseDialog
            classes={classes}
            open={isOpenPackageDialog}
            {...!isAllowedToPurchase ? renderBillingSupportDialog() : renderPackagesListDialog()}
        >
            {!isAllowedToPurchase ? renderBillingSupportDialog().content : renderPackagesListDialog().content}
        </BaseDialog>
    </BaseDialog >
}

export default NoCreditDialog