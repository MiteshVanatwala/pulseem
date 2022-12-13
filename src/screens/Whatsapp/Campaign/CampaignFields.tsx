import {
  Box,
  TextField,
  Typography,
  MenuItem,
  Grid,
  Button,
} from "@material-ui/core";
import { ClassesType } from "../../Classes.types";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { coreProps } from "./WhatsappCampaign.types";
import clsx from "clsx";
import { useState } from "react";

const CampaignFields = ({ classes }: ClassesType) => {
  const { t: translator } = useTranslation();
  const { isRTL, windowSize } = useSelector(
    (state: { core: coreProps }) => state.core
  );
  const [isCampaign, setIsCampaign] = useState<boolean>(false);

  return (
    <Grid container spacing={windowSize === "xs" ? 0 : 2}>
      <Grid item xs={12} sm={12} md={12} lg={5}>
        <Grid container spacing={windowSize === "xs" ? 0 : 2}>
          <Grid item xs={12} md={6} sm={12} className={classes.buttonForm}>
            <Typography className={classes.buttonHead}>
              {translator("whatsappCampaign.campaignName")}
            </Typography>
            <TextField
              required
              id="templateName"
              type="text"
              placeholder={translator(
                "whatsappCampaign.campaignNamePlaceholder"
              )}
              className={
                isCampaign
                  ? clsx(classes.buttonField, classes.error)
                  : clsx(classes.buttonField, classes.success)
              }
              //   onChange={onTemplateNameChange}
              //   value={templateName}
            />
            <Typography className={classes.buttonContent}>
              {translator("whatsappCampaign.campaignDesc")}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sm={12} className={classes.buttonForm}>
            <Box className={classes.inputCampDiv}>
              <Typography className={classes.buttonHead}>
                {translator("whatsappCampaign.from")}
              </Typography>
              <Typography
                className={classes.restoreBtn}
                //   onClick={() => {
                //     handleRestore();
                //   }}
              >
                {translator("whatsappCampaign.restore")}
              </Typography>
            </Box>
            <TextField
              required
              id="templateName"
              type="text"
              className={
                isCampaign
                  ? clsx(classes.buttonField, classes.error)
                  : clsx(classes.buttonField, classes.success)
              }
              //   onChange={onTemplateNameChange}
              //   value={templateName}
            />
            <Typography className={classes.buttonContent}>
              {translator("whatsappCampaign.fromDesc")}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={12} md={10}>
        <Grid container spacing={windowSize === "xs" ? 0 : 2}>
          <Grid item xs={12} md={6} sm={12} className={classes.buttonForm}>
            <Typography className={classes.buttonHead}>
              {translator("whatsappCampaign.chooseTemplate")}
            </Typography>

            <TextField
              required
              select
              id="selectSavedTemplate"
              type="text"
              className={
                isCampaign
                  ? clsx(classes.buttonField, classes.error)
                  : clsx(classes.buttonField, classes.success)
              }
              //   onChange={onSavedTemplateChange}
              //   value={savedTemplate}
            >
              {/* {names.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))} */}
            </TextField>
            <Typography className={classes.buttonContent}>
              {translator("whatsappCampaign.chooseTemplateDesc")}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default CampaignFields;
