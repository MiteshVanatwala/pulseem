import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Paper, Typography, Box, Button, CircularProgress } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { CardIcon } from '../../assets/images/dashboard/index'
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import GlobalBalancePaymentWizard from './GlobalBalancePaymentWizard';
import { GetGlobalAccountPackagesDetails } from '../../redux/reducers/commonSlice';
import { getAccountBilling } from '../../redux/reducers/BillingSlice';
import BillingSettings from '../BillingSettings/BillingSettings';

const GlobalBalance = ({ classes }: any) => {
  const { isRTL } = useSelector((state: any) => state.core)
  const dispatch: any = useDispatch();
  const { accountIsCurrencySymbolPrefix, accountCurrencySymbol, finalGlobalBalance, isGlobal, IsPoland } = useSelector((state: any) => state.common)
  const { billing: { Data: billingDetail } } = useSelector((state: any) => state.billing);
  const { t } = useTranslation();
  const [dialogType, setDialogType] = useState<{
    type: string;
    data: any
  } | null>(null);
  const [isOpenBillingSettings, setIsOpenBillingSettings] = useState(false);

  useEffect(() => {
    if (isGlobal) {
      dispatch(GetGlobalAccountPackagesDetails());
      dispatch(getAccountBilling());
    }
  }, [])

  if (isGlobal === false) return <></>;
  else if (isGlobal === true && IsPoland) return <></>;

  const isBillingDetailsRequired = billingDetail?.CompanyName === '' || billingDetail?.CompanyName === null || billingDetail?.CorporationNumber === '' || billingDetail?.CorporationNumber === null || billingDetail?.Email === '' || billingDetail?.Email === null;

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
                  {t(isGlobal === true ? 'SubAccount.credit' : '')}
                </Typography>
              </Box>
            </Box>
          </Grid>
          {
            isGlobal === true && (
              <Box className={clsx(classes.textCenter, classes.p50, classes.f30, classes.bold)}>
                <div className={classes.pt10}>{t('SubAccount.balance')}</div>
                <div className={classes.pt10}>{ accountIsCurrencySymbolPrefix ? accountCurrencySymbol : '' } {finalGlobalBalance} { !accountIsCurrencySymbolPrefix ? accountCurrencySymbol : '' }</div>
                <Box className={classes.pt10}>
                  <Button className={clsx(classes.btn, classes.btnRounded, classes.f12)} onClick={() => {
                    if (isBillingDetailsRequired) {
                      setIsOpenBillingSettings(true);
                    } else {
                      setDialogType({ type: 'PaymentDialog', data: {} });
                    }
                  }}>
                    {t('common.topUp')}
                    {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                  </Button>
                </Box>
              </Box>
            )
          }

          {
            isGlobal === null && (
              <Box sx={{ pt: 10 }}>
                <CircularProgress />
              </Box>
            )
          }
        </Grid>
      </Paper>
      <GlobalBalancePaymentWizard classes={classes} isOpen={dialogType?.type === 'PaymentDialog'} onClose={() => setDialogType(null)} />
      <BillingSettings classes={classes} isOpen={isOpenBillingSettings} onClose={(isSuccess: boolean) => {
        setIsOpenBillingSettings(false);
        if (isSuccess) {
          setDialogType({ type: 'PaymentDialog', data: {} });
        }
      }} />
    </>
  )
}

export default React.memo(GlobalBalance);
