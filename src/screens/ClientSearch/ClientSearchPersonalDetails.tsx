import { Grid, TextField } from '@material-ui/core';
import clsx from 'clsx';
import { debounce } from 'lodash';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const ClientSearchPersonalDetails = ({ classes, data, onUpdate, onEnter }: any) => {
  const { t } = useTranslation();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onEnter?.();
    }
  };

  const debounceUpdate = useCallback(
    debounce((keyName: string, value: string) => {
      onUpdate(keyName, value);
    }, 300),
    []
  );

  return <Grid container spacing={3}>
    <Grid item xs={4} sm={4} md={4}>
      <TextField
        label={t('common.first_name')}
        variant='standard'
        size='small'
        value={data?.FirstName}
        onKeyDown={handleKeyDown}
        onChange={(event: any) => debounceUpdate('FirstName', event.target.value)}
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
        label={t('common.last_name')}
        variant='standard'
        size='small'
        value={data?.LastName}
        onKeyDown={handleKeyDown}
        onChange={(event: any) => debounceUpdate('LastName', event.target.value)}
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
        label={t('common.email')}
        variant='standard'
        size='small'
        value={data?.Email}
        onKeyDown={handleKeyDown}
        onChange={(event: any) => debounceUpdate('Email', event.target.value.trim())}
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
        label={t('common.cellphone')}
        variant='standard'
        size='small'
        type='number'
        value={data?.Cellphone}
        onKeyDown={handleKeyDown}
        onChange={(event: any) => debounceUpdate('Cellphone', event.target.value)}
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
        label={t('common.telephone')}
        variant='standard'
        size='small'
        value={data?.Telephone}
        onKeyDown={handleKeyDown}
        onChange={(event: any) => debounceUpdate('Telephone', event.target.value)}
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
        label={t('common.company')}
        variant='standard'
        size='small'
        value={data?.Company}
        onKeyDown={handleKeyDown}
        onChange={(event: any) => debounceUpdate('Company', event.target.value)}
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

export default ClientSearchPersonalDetails;