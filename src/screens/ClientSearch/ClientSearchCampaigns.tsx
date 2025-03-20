import { useTranslation } from "react-i18next";
import clsx from 'clsx';
import { Checkbox, FormControlLabel, Grid } from "@material-ui/core";


export const ClientSearchCampaigns = ({ classes, data, onUpdate }: any) => {
  const { t } = useTranslation();

  return (
    <Grid container className={classes.pt25}>
      <Grid item xs={12} sm={3} md={3} className={clsx(classes.p10)}>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onChange={(event: any) => onUpdate('ShowOpened', event.target.checked)}
              checked={data?.ShowOpened}
            />
          }
          label={t("campaigns.newsLetterEditor.sendSettings.summarySegmCritCb1")}
        />
      </Grid>
      <Grid item xs={12} sm={3} md={3} className={clsx(classes.p10)}>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onChange={(event: any) => onUpdate('ShowClicked', event.target.checked)}
              checked={data?.ShowClicked}
            />
          }
          label={t("campaigns.newsLetterEditor.sendSettings.summarySegmCritCb3")}
        />
      </Grid>
      <Grid item xs={12} sm={3} md={3} className={clsx(classes.p10)}>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onChange={(event: any) => onUpdate('ShowNotClicked', event.target.checked)}
              checked={data?.ShowNotClicked}
            />
          }
          label={t("campaigns.newsLetterEditor.sendSettings.summarySegmCritCb4")}
        />
      </Grid>
      <Grid item xs={12} sm={3} md={3} className={clsx(classes.p10)}>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onChange={(event: any) => onUpdate('ShowNotOpened', event.target.checked)}
              checked={data?.ShowNotOpened}
            />
          }
          label={t("campaigns.newsLetterEditor.sendSettings.summarySegmCritCb2")}
        />
      </Grid>
    </Grid>)
}

export default ClientSearchCampaigns;