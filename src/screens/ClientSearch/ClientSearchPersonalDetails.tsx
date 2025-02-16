import { Grid, TextField } from '@material-ui/core';
import clsx from 'clsx';
import { debounce } from 'lodash';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const ClientSearchPersonalDetails = ({ classes, data, onUpdate }: any) => {
  const { t } = useTranslation();
  const [localValues, setLocalValues] = useState<{ [key: string]: string }>({});

  const debounceUpdate = useCallback(
    debounce((keyName: string, value: string, forceSearch: boolean = false) => {
      onUpdate(keyName, value, forceSearch);
    }, 300), [onUpdate]
  );


  const handleChange = (field: string, value: string) => {
    // Update local state immediately
    setLocalValues((prev: any) => ({ ...prev, [field]: value }));
    // Debounce the parent update
    debounceUpdate(field, value, false);
  };

  const handleKeyDown = (field: string, event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      debounceUpdate.cancel();
      onUpdate(field, localValues[field] || '', true);
    }
  };

  return <Grid container spacing={3}>
    <Grid item xs={4} sm={4} md={4}>
      <TextField
        label={t('common.first_name')}
        variant='standard'
        size='small'
        value={data?.FirstName}
        onKeyDown={(event) => handleKeyDown('FirstName', event)}
        onChange={(event) => handleChange('FirstName', event.target.value)}
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
        onKeyDown={(event) => handleKeyDown('LastName', event)}
        onChange={(event) => handleChange('LastName', event.target.value)}
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
        onKeyDown={(event) => handleKeyDown('Email', event)}
        onChange={(event) => handleChange('Email', event.target.value)}
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
        onKeyDown={(event) => handleKeyDown('Cellphone', event)}
        onChange={(event) => handleChange('Cellphone', event.target.value)}
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
        onKeyDown={(event) => handleKeyDown('Telephone', event)}
        onChange={(event) => handleChange('Telephone', event.target.value)}
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
        onKeyDown={(event) => handleKeyDown('Company', event)}
        onChange={(event) => handleChange('Company', event.target.value)}
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