import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAccountExtraData } from "../../redux/reducers/smsSlice";
import { Grid, TextField } from "@material-ui/core";
import clsx from 'clsx';
import { debounce } from "lodash";

export const ClientSearchExtraFields = ({ classes, data, onUpdate }: any) => {
  const dispatch = useDispatch();
  const { extraData } = useSelector((state: any) => state.sms);
  const [localValues, setLocalValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!extraData || extraData.length === 0) {
      dispatch(getAccountExtraData());
    }
  }, [])

  const debounceUpdate = useCallback(
    debounce((keyName: string, value: string, forceSearch: boolean = false) => {
      onUpdate(keyName, value, forceSearch);
    }, 300), [onUpdate]
  );


  const handleChange = (field: string, value: string) => {
    // Update local state immediately
    setLocalValues(prev => ({ ...prev, [field]: value }));
    // Debounce the parent update
    debounceUpdate(field, value, false);
  };

  const handleKeyDown = (field: string, event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      debounceUpdate.cancel();
      onUpdate(field, localValues[field] || '', true);
    }
  };


  return <Grid container className={classes.pt25}>
    {Object.keys(extraData).map((field: any) => {
      const fieldName = extraData[field];
      return field.toLowerCase().indexOf('date') > -1 || extraData[field] === '' ? (
        <>
        </>) : (<Grid item xs={12} sm={3} md={3} className={clsx(classes.p10)}>
          <TextField
            label={fieldName || field}
            variant='standard'
            size='small'
            value={localValues[field] ?? data.MyConditions[0][field] ?? ''}
            onKeyDown={(event) => handleKeyDown(field, event)}
            onChange={(event) => handleChange(field, event.target.value)}
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