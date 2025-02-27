import { FormControl, Grid, MenuItem, OutlinedInput, Select, TextField, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from 'clsx';
import { Autocomplete } from "@mui/material";
import { useSelector } from "react-redux";
import { StateType } from "../../../Models/StateTypes";
import { BusinessSectorActivityModel } from "../../../Models/BusinessSectorActivity/BusinessSectorActivity";
import { useEffect, useState } from "react";
import { FieldOfActivities } from "../../../helpers/Constants";
import { IoIosArrowDown } from "react-icons/io";

const BusinessSectorActivity = ({ classes }: any) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state: StateType) => state.core);
  const [filterFieldOfActivity, setFilterFieldOfActivity] = useState<string[]>([]);
  const [businessSectorActivity, setBusinessSectorActivity] = useState<BusinessSectorActivityModel>({
    MainActivity: '',
    BusinessSize: 0
  })

  useEffect(() => {
    populateFieldOfActivities();
  }, []);

  const populateFieldOfActivities = () => {
    const interests: string[] = [];
    FieldOfActivities.map((item: any) => interests.push(t(`SignUp.${item}`)));
    setFilterFieldOfActivity(interests);
  }

  const handleBusinessSize = (e: any) => {
    console.log(e);
    setBusinessSectorActivity({ ...businessSectorActivity, BusinessSize: e.target.value });
  }


  return <Grid container>
    <Grid item xs={12}>
      <Typography>{t('dashboard.businessSectorActivity.size')}</Typography>
    </Grid>
    <Grid item xs={12}>
      <Select
        native
        labelId="demo-multiple-checkbox-label"
        id="demo-multiple-checkbox"
        value={businessSectorActivity.BusinessSize}
        onChange={handleBusinessSize}
        input={<OutlinedInput label={t('dashboard.businessSectorActivity.size')} />}
      >
        <option value={1}>{t('dashboard.businessSectorActivity.small')}</option>
        <option value={2}>{t('dashboard.businessSectorActivity.medium')}</option>
        <option value={3}>{t('dashboard.businessSectorActivity.large')}</option>
      </Select>
    </Grid>
    <Grid item xs={12} className={classes.mt20}>
      <Typography>{t('dashboard.businessSectorActivity.activityDesc')}</Typography>
    </Grid>
    <Grid item xs={12}>
      <FormControl variant='standard' className={clsx(classes.w100)}>
        <Autocomplete
          value={businessSectorActivity.MainActivity}
          disablePortal
          id='pinkScrollbar'
          className={classes.autoComplete}
          options={filterFieldOfActivity}
          renderOption={(props, options) => <MenuItem component='li' {...props} key={options} value={options}>{options}</MenuItem>
          }
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          renderInput={(params) => {
            //@ts-ignore
            return (<TextField
              {...params}
              color="primary" className={clsx(classes.textField, classes.w100)}
            />)
          }}
          onChange={(event: any, value: any) => {
            setBusinessSectorActivity({
              ...businessSectorActivity,
              MainActivity: value
            })
          }}
          popupIcon={<IoIosArrowDown size={20} className={classes.colrPrimary} />}
        />
      </FormControl>
    </Grid>
  </Grid>
}

export default BusinessSectorActivity;