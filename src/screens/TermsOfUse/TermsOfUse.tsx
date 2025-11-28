import { Button, Checkbox, FormControl, FormControlLabel, Grid, Typography } from "@material-ui/core";
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";
import { useTranslation } from "react-i18next";
import clsx from 'clsx';
// import { TermsOfUseModel } from "../../Models/TermsOfUse/TermsOfUse";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateTermsOfUse } from "../../redux/reducers/TermsOfUseSlice";
import { getCommonFeatures } from "../../redux/reducers/commonSlice";
import { Loader } from "../../components/Loader/Loader";
// import useRedirect from "../../helpers/Routes/Redirect";
// import { sitePrefix } from "../../config";
// import { RedirectPropTypes } from "../../helpers/Types/Redirect";


const TermsOfUse = ({ classes, onClose }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isLoader, setIsLoader] = useState<boolean>(false);
  // const Redirect = useRedirect();
  // const [termOfUse, setTermOfUse] = useState<TermsOfUseModel>({
  //   IsTermsApproved: false
  // });
  // const [requiredField, setRequiredField] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState({
    chkUpdate: false,
    chkPolicy: false
  });
  const [errors, setErrors] = useState({
    chkPolicy: '',
    chkUpdate: '',
  });

  const { isRTL } = useSelector((state: any) => state.common);

  const onConfirm = async () => {
    let errorsTemp = errors;
    errorsTemp.chkPolicy = userDetails.chkPolicy ? '' : t('common.requiredField');

    setErrors({
      ...errors,
      ...errorsTemp
    });
    if (!errorsTemp.chkPolicy) {
      setIsLoader(true);
      const response: any = await dispatch(updateTermsOfUse({
        IsTermsApproved: userDetails.chkPolicy,
        IgnoranceCount: 0,
        AcceptedTermsFromReact: true
      }));
      setIsLoader(false);
      if (response?.payload?.StatusCode === 201 && userDetails.chkPolicy) {
        await dispatch(getCommonFeatures());
        // Redirect({
        //   url: `${sitePrefix}`,
        //   openNewTab: false
        // } as RedirectPropTypes)
        onClose();
      }
      else {
        // setRequiredField(true);
      }
    }
    
  }

  return <Grid
    container
    className={clsx(classes.h100, classes.w100, classes.flex)}
    style={{
      whiteSpace: 'normal',
      overflowWrap: 'break-word',
      wordBreak: 'break-word',
      wordWrap: 'break-word',
      hyphens: 'auto'
    }}
  >
    {/* <Grid item xs={12}>
      <Typography>{RenderHtml(t('TermsOfUse.description'))}</Typography>
    </Grid> */}
    <Grid item xs={12}>
      <FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={userDetails.chkUpdate}
              onChange={() => setUserDetails({ ...userDetails, chkUpdate: !userDetails.chkUpdate })}
              color="primary"
            />
          }
          className={clsx({
            [classes.textRight]: isRTL,
            [classes.textLeft]: !isRTL,
          })}
          label={<>
            <span className={classes.f18}>{RenderHtml(t('SignUp.UpdateTrainingContentCheckbox'))}</span>
            {!!errors.chkUpdate && (
              <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                {errors.chkUpdate}
              </Typography>
            )}
          </>
          }
        />
      </FormControl>

      <FormControl className={classes.dBlock}>
        <FormControlLabel
          control={
            <Checkbox
              checked={userDetails.chkPolicy}
              onChange={() => setUserDetails({ ...userDetails, chkPolicy: !userDetails.chkPolicy })}
              color="primary"
            />
          }
          label={<>
            <span className={clsx(classes.paddingInline5, classes.colrPrimary, classes.f18)}>*</span>
            <span className={classes.f18}>{RenderHtml(t('SignUp.PrivacyPolicyCheckbox'))}</span>
            {!!errors.chkPolicy && (
              <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                {errors.chkPolicy}
              </Typography>
            )}
          </>
          }
        />
      </FormControl>
      {/* <FormControlLabel
        control={
          <Checkbox
            color="primary"
            inputProps={{ "aria-label": "secondary checkbox" }}
            onClick={() => {
              setTermOfUse({ ...termOfUse, IsTermsApproved: !termOfUse.IsTermsApproved });
              setRequiredField(false)
            }}
            checked={termOfUse.IsTermsApproved}
          />
        }
        label={t("TermsOfUse.checkbox")}
      />
      <Grid item xs={12}>
        {requiredField && <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>{t('common.requiredField')}</Typography>
        }
      </Grid> */}
      <Grid item xs={12} className={classes.mt6}>
        <Grid
          container
          spacing={4}
          className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
        >
          <Grid item>
            <Button
              variant='contained'
              size='small'
              onClick={onConfirm}
              className={clsx(
                classes.btn,
                classes.btnRounded
              )}
            >
              {t('common.confirm')}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
    <Loader isOpen={isLoader} showBackdrop={true} />
  </Grid>
}

export default TermsOfUse;