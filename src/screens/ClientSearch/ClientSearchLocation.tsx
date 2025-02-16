import { Grid, TextField } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from 'clsx';
import React, { useCallback, useState } from "react";
import { debounce } from "lodash";

export const ClientSearchLocation = ({ classes, data, onUpdate }: any) => {
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
    <Grid item xs={8} sm={8} md={8}>
      <TextField
        label={t('common.address')}
        variant='standard'
        size='small'
        value={data?.Address}
        onKeyDown={(event) => handleKeyDown('Address', event)}
        onChange={(event) => handleChange('Address', event.target.value)}
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
        onKeyDown={(event) => handleKeyDown('Country', event)}
        onChange={(event) => handleChange('Country', event.target.value)}
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
        onKeyDown={(event) => handleKeyDown('State', event)}
        onChange={(event) => handleChange('State', event.target.value)}
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
        onKeyDown={(event) => handleKeyDown('City', event)}
        onChange={(event) => handleChange('City', event.target.value)}
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
        onKeyDown={(event) => handleKeyDown('Zip', event)}
        onChange={(event) => handleChange('Zip', event.target.value)}
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