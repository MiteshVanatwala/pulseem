import { Button, Checkbox, FormControl, FormControlLabel, Grid, Select, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from 'clsx';
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../../Models/StateTypes";
import { BusinessSectorActivityModel } from "../../../Models/BusinessSectorActivity/BusinessSectorActivity";
import { useEffect, useState } from "react";
import { FieldOfActivities } from "../../../helpers/Constants";
import { getCookie, setCookie } from '../../../helpers/Functions/cookies';
import { updateBusinessSectorActivity } from "../../../redux/reducers/commonSlice";

const BusinessSectorActivity = ({ classes, onDone }: any) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state: StateType) => state.core);
  const [filterFieldOfActivity, setFilterFieldOfActivity] = useState<string[]>([]);
  const [businessSectorActivityIgnore, setBusinessSectorActivityIgnore] = useState<boolean>(false);
  const [businessSectorActivity, setBusinessSectorActivity] = useState<BusinessSectorActivityModel>({
    MainActivity: t('common.select'),
    BusinessSize: -1
  })

  const [validationError, setValidationError] = useState<any>({
    MainActivity: false,
    BusinessSize: false
  })

  const dispatch = useDispatch();

  useEffect(() => {
    const showIgnoreCheckbox = getCookie('businessSectorActivityIgnore') || 0;
    setBusinessSectorActivityIgnore(parseInt(showIgnoreCheckbox) >= 3);
    populateFieldOfActivities();
  }, []);

  const populateFieldOfActivities = () => {
    const interests: string[] = [];
    interests.push(t('common.select'));
    FieldOfActivities.map((item: any) => interests.push(t(`SignUp.${item}`)));
    setFilterFieldOfActivity(interests);
  }

  const handleBusinessSize = (e: any) => {
    setValidationError({ ...validationError, BusinessSize: false })
    setBusinessSectorActivity({ ...businessSectorActivity, BusinessSize: e.target.value });
  }
  const handleMainActivity = (e: any) => {
    setValidationError({ ...validationError, MainActivity: false })
    setBusinessSectorActivity({ ...businessSectorActivity, MainActivity: e.target.value })
  }

  const handleSend = async () => {
    let isValid = true;
    const errors: any = { BusinessSize: false, MainActivity: false };
    if (businessSectorActivity.BusinessSize === -1) {
      errors.BusinessSize = true;
      isValid = false;
    }
    if (businessSectorActivity.MainActivity === t('common.select')) {
      errors.MainActivity = true;
      isValid = false;
    }

    setValidationError(errors)

    if (!isValid) {
      return;
    }

    await dispatch((updateBusinessSectorActivity as any)(businessSectorActivity));
    setCookie('dontShowAgainBusinessSector', 'true');
    onDone?.();
  }

  const handleCheckbox = async () => {
    const emptyRequest = {
      MainActivity: '',
      BusinessSize: ''
    } as any;

    await dispatch((updateBusinessSectorActivity as any)(emptyRequest));
    setCookie('dontShowAgainBusinessSector', 'true');
    onDone?.();
  }


  return <Grid container>
    <Grid item xs={12}>
      <Typography>{t('dashboard.businessSectorActivity.size')}</Typography>
    </Grid>
    <Grid item xs={12}>
      <FormControl variant='standard' className={clsx(classes.w100)}>
        <Select
          native
          displayEmpty
          variant="outlined"
          id="BusinessSize"
          value={businessSectorActivity.BusinessSize}
          className={classes.mt1}
          onChange={handleBusinessSize}
        >
          <option value={-1}>{t('common.select')}</option>
          <option value={'1-10'}>{t('dashboard.businessSectorActivity.small')}</option>
          <option value={'10-100'}>{t('dashboard.businessSectorActivity.medium')}</option>
          <option value={'+100'}>{t('dashboard.businessSectorActivity.large')}</option>
        </Select>
        {validationError?.BusinessSize === true && <Typography className={clsx(classes.errorText, classes.f16, classes.pt10)} variant="body1">{t('common.requiredField')}</Typography>}
      </FormControl>
    </Grid>
    <Grid item xs={12} className={classes.mt20}>
      <Typography>{t('dashboard.businessSectorActivity.activityDesc')}</Typography>
    </Grid>
    <Grid item xs={12}>
      <FormControl variant='standard' className={clsx(classes.w100)}>
        <Select
          native
          displayEmpty
          id="MainActivity"
          variant="outlined"
          value={businessSectorActivity.MainActivity}
          className={classes.mt1}
          onChange={handleMainActivity}
        >
          {filterFieldOfActivity.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
        {validationError?.MainActivity === true && <Typography className={clsx(classes.errorText, classes.f16, classes.pt10)} variant="body1">{t('common.requiredField')}</Typography>}
      </FormControl>
    </Grid>
    {businessSectorActivityIgnore && <Grid item xs={12}>
      <FormControl>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onClick={() => {
                handleCheckbox();
              }}
            />
          }
          label={t("common.doNotShow")}
        />

      </FormControl>
    </Grid>}
    <Grid item xs={12} className={clsx(classes.mt20, classes.dFlex, classes.justifyCenterOfCenter)}>
      <Button
        onClick={() => { handleSend() }}
        variant='contained'
        size='medium'
        className={clsx(
          classes.btn,
          classes.btnRounded
        )}
        color="primary"
      >
        {t('common.Send1')}
      </Button>
    </Grid>
  </Grid>
}

export default BusinessSectorActivity;