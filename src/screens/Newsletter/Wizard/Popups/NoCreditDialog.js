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
import { WhiteLabelObject } from '../../../../components/WhiteLabel/WhiteLabelMigrate'
import AddCardDialog from '../../../../components/AddCardDialog/AddCardDialog'
import PayPerRecipientNew from '../../../../components/PayPerRecipient/PayPerRecipientNew'

const NoCreditDialog = ({
    classes,
    isOpen,
    popUpType,
    onCancel }) => {
    const { t } = useTranslation()
    const { isRTL } = useSelector(state => state.core)
    const { accountSettings, subAccount, isGlobal, IsPoland } = useSelector(state => state.common)
    const [ isOpenPackageDialog, setIsOpenPackageDialog ] = useState(false);
    const [ isAllowedToPurchase, setIsAllowedToPurchase ] = useState(false);
    const [ isOpenPayPerRecipient, setIsOpenPayPerRecipient ] = useState(false);
    const [ isOpenAddCardDialog, setIsOpenAddCardDialog ] = useState(false);
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
        const isWhiteLabel = accountSettings?.Account?.ReferrerID > 0 && WhiteLabelObject[accountSettings?.Account?.ReferrerID] !== undefined;
        return {
            showDivider: false,
            icon: (
                <GoPackage style={{ fontSize: 35, padding: 5 }} />
            ),
            showDefaultButtons: false,
            content: (
                <Grid item xs={12} style={{ paddingBottom: 5 }}>
                    <Typography className={classes.f20}>
                        {RenderHtml(t(WhiteLabelObject[isWhiteLabel ? accountSettings?.Account?.ReferrerID : 0]['Contact']))}
                    </Typography>
                    <Box className={clsx(classes.mt25, classes.flexColCenter)}>
                        <Button
                            variant='contained'
                            size='small'
                            className={clsx(
                                classes.btn,
                                classes.btnRounded
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
                        <Typography className={classes?.f18}>{RenderHtml(t(popUpType === 2 ? 'campaigns.newsLetterEditor.errors.NEWSLETTER_BULK_ENDED_PURCHASE_OPTION' : 'campaigns.newsLetterEditor.errors.SMS_BULK_ENDED_PURCHASE_OPTION'))}</Typography>
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
                            onClick={() => { 
                                if (isGlobal === true && IsPoland) {
                                    // TODO: Uncomment when PayPerRecipient is ready
                                    setIsOpenPayPerRecipient(true);
                                    // TODO: Comment when PayPerRecipient is ready
                                    // setIsOpenPackageDialog(true);
                                }
                                else {
                                    setIsOpenPackageDialog(true);
                                }
                            }}
                            className={clsx(
                                classes.btn,
                                classes.btnRounded
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
                            classes.btn,
                            classes.btnRounded
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
            {...!isAllowedToPurchase || IsPoland ? renderBillingSupportDialog() : renderPackagesListDialog()}
        >
            {!isAllowedToPurchase || IsPoland ? renderBillingSupportDialog().content : renderPackagesListDialog().content}
        </BaseDialog>
        <PayPerRecipientNew
            classes={classes}
            isOpen={isOpenPayPerRecipient}
            onClose={(PricePackageId) => {
                setIsOpenPayPerRecipient(false);
                if (PricePackageId) {
                    setIsOpenAddCardDialog(true);
                }
            }}
        />
        <AddCardDialog
            classes={classes}
            isOpen={isOpenAddCardDialog}
            onClose={() => setIsOpenAddCardDialog(false)}
        />
    </BaseDialog >
}

export default NoCreditDialog