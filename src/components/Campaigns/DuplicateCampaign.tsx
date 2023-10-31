import { useState, useEffect } from "react";
import { Typography, FormControl, FormGroup, FormControlLabel, Checkbox } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { BaseDialog } from "../DialogTemplates/BaseDialog";
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";
import { CloneOptions } from "../../Models/Campaigns/CloneOptions";
import { GrDuplicate } from "react-icons/gr";

const DuplicateCampaign = ({
  title,
  classes,
  isOpen,
  handleClose,
  campaignName,
  isSms = false
}: any) => {
  const { t } = useTranslation();
  const [duplicateOptions, setDuplicateOptions] = useState<Number[]>([]);

  useEffect(() => {
    setDuplicateOptions([]);
  }, [isOpen])

  const handleDuplicateOptions = (option: any) => {
    let tempArray = duplicateOptions || [];
    if (tempArray.indexOf(option) > -1) {
      tempArray = tempArray.filter((opt) => opt !== option)
    }
    else {
      tempArray = [...tempArray, option]
    }
    setDuplicateOptions(tempArray)
  }

  return (
    <BaseDialog
      title={title}
      classes={classes}
      icon={(<GrDuplicate className={classes.whiteIcon} />)}
      open={isOpen}
      onCancel={handleClose}
      onClose={handleClose}
      renderButtons={null}
      onConfirm={() => handleClose(duplicateOptions)}
    >
      <>
        {campaignName && <Typography align='center'
          className={classes.mb5}
        >{RenderHtml(t("campaigns.newsLetterEditor.sendSettings.insertCampaginName").replace('##campaignName##', `<b>"${campaignName}"</b>`))}
        </Typography>}
        <FormControl>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  inputProps={{ "aria-label": "secondary checkbox" }}
                  onClick={() => handleDuplicateOptions(CloneOptions.Groups)}
                  checked={duplicateOptions.indexOf(CloneOptions.Groups) > -1}
                />
              }
              label={t("common.Groups")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  inputProps={{ "aria-label": "secondary checkbox" }}
                  onClick={() => handleDuplicateOptions(CloneOptions.Filters)}
                  checked={duplicateOptions.indexOf(CloneOptions.Filters) > -1}
                />
              }
              label={t("campaigns.newsLetterEditor.sendSettings.filters")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  inputProps={{ "aria-label": "secondary checkbox" }}
                  onClick={() => handleDuplicateOptions(CloneOptions.SendDate)}
                  checked={duplicateOptions.indexOf(CloneOptions.SendDate) > -1}
                />
              }
              label={t("sms.sendingTime")}
            />
            {
              isSms === false && <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    inputProps={{ "aria-label": "secondary checkbox" }}
                    onClick={() => handleDuplicateOptions(CloneOptions.SmsMarketing)}
                    checked={duplicateOptions.indexOf(CloneOptions.SmsMarketing) > -1}
                  />
                }
                label={t("campaigns.newsLetterEditor.sendSettings.smsMarketing.title")}
              />
            }
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  disabled={duplicateOptions.indexOf(CloneOptions.Groups) === -1}
                  inputProps={{ "aria-label": "secondary checkbox" }}
                  onClick={() => handleDuplicateOptions(CloneOptions.Pulses)}
                  checked={duplicateOptions.indexOf(CloneOptions.Pulses) > -1}
                />
              }
              label={t("smsReport.pulseSending")}
            />
          </FormGroup>
        </FormControl>
      </>
    </BaseDialog>
  );
};

export default DuplicateCampaign;
