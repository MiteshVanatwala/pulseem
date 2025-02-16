import { Grid, TextField } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from 'clsx';
import React, { useCallback } from "react";
import { debounce } from "lodash";

export const ClientSearchLocation = ({ classes, data, onUpdate }: any) => {
  const { t } = useTranslation();

  const debounceUpdate = useCallback(
    debounce((keyName: string, value: string, forceUpdate: boolean = false) => {
      onUpdate(keyName, value, forceUpdate);
    }, 300),
    []
  );

  return <Grid container spacing={3}>
    <Grid item xs={8} sm={8} md={8}>
      <TextField
        label={t('common.address')}
        variant='standard'
        size='small'
        value={data?.Address}
        onKeyDown={(event: any) => debounceUpdate('Address', event.target.value, event.key === 'Enter')}
        onChange={(event: any) => debounceUpdate('Address', event.target.value)}
        className={clsx(classes.w100, classes.textField, classes.mt25)}
        InputLabelProps={{
          style: {
            fontSize: 17
          }
        }}
      />
    </Grid>
    <Grid item xs={4} sm={4} md={4}>
      <TextField
        label={t('common.country')}
        variant='standard'
        size='small'
        value={data?.Country}
        onKeyDown={(event: any) => debounceUpdate('Country', event.target.value, event.key === 'Enter')}
        onChange={(event: any) => debounceUpdate('Country', event.target.value)}
        className={clsx(classes.w100, classes.textField, classes.mt25)}
        InputLabelProps={{
          style: {
            fontSize: 17
          }
        }}
      />
    </Grid>
    <Grid item xs={4} sm={4} md={4}>
      <TextField
        label={t('common.state')}
        variant='standard'
        size='small'
        value={data?.State}
        onKeyDown={(event: any) => debounceUpdate('State', event.target.value.trim(), event.key === 'Enter')}
        onChange={(event: any) => debounceUpdate('State', event.target.value.trim())}
        className={clsx(classes.w100, classes.textField, classes.mt25)}
        InputLabelProps={{
          style: {
            fontSize: 17
          }
        }}
      />
    </Grid>
    <Grid item xs={4} sm={4} md={4}>
      <TextField
        label={t('common.city')}
        variant='standard'
        size='small'
        value={data?.City}
        onKeyDown={(event: any) => debounceUpdate('City', event.target.value, event.key === 'Enter')}
        onChange={(event: any) => debounceUpdate('City', event.target.value)}
        className={clsx(classes.w100, classes.textField, classes.mt25)}
        InputLabelProps={{
          style: {
            fontSize: 17
          }
        }}
      />
    </Grid>
    <Grid item xs={4} sm={4} md={4}>
      <TextField
        label={t('common.zip')}
        variant='standard'
        size='small'
        value={data?.Zip}
        onKeyDown={(event: any) => debounceUpdate('Zip', event.target.value, event.key === 'Enter')}
        onChange={(event: any) => debounceUpdate('Zip', event.target.value)}
        className={clsx(classes.w100, classes.textField, classes.mt25)}
        InputLabelProps={{
          style: {
            fontSize: 17
          }
        }}
      />
    </Grid>
  </Grid>
}

export default React.memo(ClientSearchLocation);