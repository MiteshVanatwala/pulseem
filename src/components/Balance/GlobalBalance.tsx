import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Grid, Paper, Typography, Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { CardIcon } from '../../assets/images/dashboard/index'
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import GlobalBalancePaymentWizard from './GlobalBalancePaymentWizard';

const GlobalBalance = ({ classes }: any) => {
  const { isRTL } = useSelector((state: any) => state.core)
  const { currencySymbol, isCurrencySymbolPrefix, finalGlobalBalance } = useSelector((state: any) => state.common)
  const { t } = useTranslation();
  const [dialogType, setDialogType] = useState<{
    type: string;
    data: any
  } | null>(null);

  const renderPackagesListDialog = () => {
    return {
      title: t('common.topUp'),
		  showDivider: false,
      content: <GlobalBalancePaymentWizard classes={classes} />
    };
  }

  const renderDialog = () => {
    const { type, data } = dialogType || {}

    let currentDialog: any = {};
		if (type === 'PaymentDialog') {
			currentDialog = renderPackagesListDialog();
    }

    if (type) {
      return (
        dialogType && <BaseDialog
          contentStyle={classes.w70VW}
          classes={classes}
          open={dialogType}
          onClose={() => setDialogType(null)}
          onCancel={() => setDialogType(null)}
          {...currentDialog}>
          {currentDialog.content}
        </BaseDialog>
      )
    }
    return <></>
  }

  return (
    <>
      <Paper
        className={clsx(classes.dashboardTopPaper, classes.bulkMargin, classes.bulkStatusContainer)}
        elevation={3}>

        <Grid container justifyContent='center'>
          <Grid item xs={12} className={clsx(classes.posRelative, classes.dashBoxtitleSection)}>
            <Box className={classes.spaceBetween}>
              <Box className={clsx(classes.alignItemsCenter, classes.flexJustifyCenter)}>
                <CardIcon className={clsx(classes.marginInlineEnd15, classes.marginInlineStart5)} />
                <Typography
                  className={clsx(classes.dInlineBlock, 'title')}
                >
                  {t('SubAccount.credit')}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Box className={clsx(classes.textCenter, classes.p50, classes.f30, classes.bold)}>
            <div className={classes.pt10}>{t('SubAccount.balance')}</div>
            <div className={classes.pt10}>{ isCurrencySymbolPrefix ? currencySymbol : '' } {finalGlobalBalance} { !isCurrencySymbolPrefix ? currencySymbol : '' }</div>
            <Box className={classes.pt10}>
              <Button className={clsx(classes.btn, classes.btnRounded, classes.f12)} onClick={() => setDialogType({ type: 'PaymentDialog', data: {} })}>
                {t('common.topUp')}
                {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Paper>
      <GlobalBalancePaymentWizard classes={classes} isOpen={dialogType?.type === 'PaymentDialog'} onClose={() => setDialogType(null)} />
    </>
  )
}

export default React.memo(GlobalBalance);
