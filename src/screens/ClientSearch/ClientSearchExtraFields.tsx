import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { getAccountExtraData } from "../../redux/reducers/smsSlice";
import { Grid, TextField } from "@material-ui/core";
import clsx from 'clsx';
import { debounce } from "lodash";

export const ClientSearchExtraFields = ({ classes, data, onUpdate, onEnter }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { extraData } = useSelector((state: any) => state.sms);
  useEffect(() => {
    if (!extraData || extraData.length === 0) {
      dispatch(getAccountExtraData());
    }
  }, [])

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

  const mergedExtraFields = {
    "ExtraField1": extraData.ExtraField1 && extraData.ExtraField1 !== '' ? extraData.ExtraField1 : t('common.ExtraField1'),
    "ExtraField2": extraData.ExtraField2 && extraData.ExtraField2 !== '' ? extraData.ExtraField2 : t('common.ExtraField2'),
    "ExtraField3": extraData.ExtraField3 && extraData.ExtraField3 !== '' ? extraData.ExtraField3 : t('common.ExtraField3'),
    "ExtraField4": extraData.ExtraField4 && extraData.ExtraField4 !== '' ? extraData.ExtraField4 : t('common.ExtraField4'),
    "ExtraField5": extraData.ExtraField5 && extraData.ExtraField5 !== '' ? extraData.ExtraField5 : t('common.ExtraField5'),
    "ExtraField6": extraData.ExtraField6 && extraData.ExtraField6 !== '' ? extraData.ExtraField6 : t('common.ExtraField6'),
    "ExtraField7": extraData.ExtraField7 && extraData.ExtraField7 !== '' ? extraData.ExtraField7 : t('common.ExtraField7'),
    "ExtraField8": extraData.ExtraField8 && extraData.ExtraField8 !== '' ? extraData.ExtraField8 : t('common.ExtraField8'),
    "ExtraField9": extraData.ExtraField9 && extraData.ExtraField9 !== '' ? extraData.ExtraField9 : t('common.ExtraField9'),
    "ExtraField10": extraData.ExtraField10 && extraData.ExtraField10 !== '' ? extraData.ExtraField10 : t('common.ExtraField10'),
    "ExtraField11": extraData.ExtraField11 && extraData.ExtraField11 !== '' ? extraData.ExtraField11 : t('common.ExtraField11'),
    "ExtraField12": extraData.ExtraField12 && extraData.ExtraField12 !== '' ? extraData.ExtraField12 : t('common.ExtraField12'),
    "ExtraField13": extraData.ExtraField13 && extraData.ExtraField13 !== '' ? extraData.ExtraField13 : t('common.ExtraField13'),
    "ExtraDate1": extraData.ExtraDate1 && extraData.ExtraDate1 !== '' ? extraData.ExtraDate1 : t('common.ExtraDate1'),
    "ExtraDate2": extraData.ExtraDate2 && extraData.ExtraDate2 !== '' ? extraData.ExtraDate2 : t('common.ExtraDate2'),
    "ExtraDate3": extraData.ExtraDate3 && extraData.ExtraDate3 !== '' ? extraData.ExtraDate3 : t('common.ExtraDate3'),
    "ExtraDate4": extraData.ExtraDate4 && extraData.ExtraDate4 !== '' ? extraData.ExtraDate4 : t('common.ExtraDate4'),
  } as any;

  return <Grid container className={classes.pt25}>
    {Object.keys(mergedExtraFields).map((field: any) => {
      const fieldName = mergedExtraFields[field];
      return field.toLowerCase().indexOf('date') > -1 ? (
        <>
        </>) : (<Grid item xs={12} sm={3} md={3} className={clsx(classes.p10)}>
          <TextField
            label={fieldName || field}
            variant='standard'
            size='small'
            value={data.MyConditions[0][field]}
            onKeyDown={handleKeyDown}
            onChange={(event: any) => debounceUpdate(field, event.target.value)}
            className={clsx(classes.w100, classes.textField, classes.mt25)}
            InputLabelProps={{
              style: {
                fontSize: 17
              }
            }}
          />
        </Grid>
      )
    })}
  </Grid>
}

export default ClientSearchExtraFields;