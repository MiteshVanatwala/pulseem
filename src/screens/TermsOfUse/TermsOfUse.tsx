import { Button, Checkbox, FormControlLabel, Grid, Typography } from "@material-ui/core";
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";
import { useTranslation } from "react-i18next";
import clsx from 'clsx';
import { TermsOfUseModel } from "../../Models/TermsOfUse/TermsOfUse";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateTermsOfUse } from "../../redux/reducers/TermsOfUseSlice";
import { getCommonFeatures } from "../../redux/reducers/commonSlice";
import useRedirect from "../../helpers/Routes/Redirect";
import { sitePrefix } from "../../config";
import { RedirectPropTypes } from "../../helpers/Types/Redirect";


const TermsOfUse = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const Redirect = useRedirect();
  const [termOfUse, setTermOfUse] = useState<TermsOfUseModel>({
    IsTermsApproved: false
  });

  const { isRTL } = useSelector((state: any) => state.common);

  const onConfirm = async () => {
    const response: any = await dispatch(updateTermsOfUse(termOfUse));
    if (response?.payload?.StatusCode === 201 && termOfUse.IsTermsApproved) {
      await dispatch(getCommonFeatures());
      Redirect({
        url: `${sitePrefix}`,
        openNewTab: false
      } as RedirectPropTypes)
    }
  }

  return <Grid
    container
    className={clsx(classes.flex)}
  >
    <Grid item xs={12}>
      <Typography>{RenderHtml(t('TermsOfUse.description'))}</Typography>
    </Grid>
    <Grid item xs={12}>
      <FormControlLabel
        control={
          <Checkbox
            color="primary"
            inputProps={{ "aria-label": "secondary checkbox" }}
            onClick={() => {
              setTermOfUse({ ...termOfUse, IsTermsApproved: !termOfUse.IsTermsApproved });
            }}
            checked={termOfUse.IsTermsApproved}
          />
        }
        label={t("TermsOfUse.checkbox")}
      />
      <Grid item xs={12} style={{ marginTop: 30 }}>
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
  </Grid>
}

export default TermsOfUse;