import React, { useState, FC } from "react";
import {
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  Slider,
  Box,
  Paper,
} from "@material-ui/core";
import {
  ExitToApp as ExitToAppIcon,
  Visibility as VisibilityIcon,
  Timer as TimerIcon,
  Height as HeightIcon,
  TouchApp as TouchAppIcon,
} from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import TriggerCard from "./Components/TriggersCard";
import clsx from 'clsx';
import DisplayFrequency from "./Components/DisplayFrequency";
import PageTargeting from "./Components/PageTargeting";
import AdvancedSettings from "./Components/AdvanceSettings";
import DefaultScreen from "../../DefaultScreen";
import { Title } from "../../../components/managment/Title";

interface Trigger {
  enabled: boolean;
  pages?: number;
  time?: number;
  scope?: string;
  depth?: number;
  clicks?: number;
}

interface TriggersState {
  exitIntent: Trigger;
  pageViews: Trigger;
  viewingTime: Trigger;
  scrollDepth: Trigger;
  pageClicks: Trigger;
}

const PopupTriggers: FC<{ classes: any }> = ({ classes }) => {
  const { t } = useTranslation();
  const [triggers, setTriggers] = useState<TriggersState>({
    exitIntent: { enabled: true },
    pageViews: { enabled: false, pages: 3 },
    viewingTime: { enabled: false, time: 30, scope: "currentPage" },
    scrollDepth: { enabled: true, depth: 50 },
    pageClicks: { enabled: false, clicks: 5 },
  });

  const handleToggle =
    (trigger: keyof TriggersState) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setTriggers({
          ...triggers,
          [trigger]: { ...triggers[trigger], enabled: event.target.checked },
        });
      };

  const handleChange =
    (trigger: keyof TriggersState, field: keyof Trigger) =>
      (event: React.ChangeEvent<{ value: unknown }>) => {
        setTriggers({
          ...triggers,
          [trigger]: { ...triggers[trigger], [field]: event.target.value },
        });
      };

  const handleSliderChange =
    (trigger: keyof TriggersState, field: keyof Trigger) =>
      (event: any, newValue: number | number[]) => {
        setTriggers({
          ...triggers,
          [trigger]: { ...triggers[trigger], [field]: newValue as number },
        });
      };

  console.log('popupTriggers:', t('popupTriggers.title'));
  console.log('popupTriggers.popupTriggers:', t('popupTriggers.popupTriggers.title'));


  return (
    <DefaultScreen
      currentPage='PopupTriggers'
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      <Box className={clsx(classes.mainTitlePopupTrigger, 'topSection')} mb={4}>
        <Title Text={t('PopupTriggers.popupTriggers.mainTitle')} classes={classes} />
        <Paper variant="outlined" className={clsx(classes.paperPopupTrigger, classes.noPadding)}>
          <Box className={clsx(classes.topHeaderPopupTrigger, classes.p10)}>
            <Typography variant="body1" className={clsx(classes.managementTitle, classes.sectionTitlePopupTrigger)} gutterBottom>
              {t("PopupTriggers.popupTriggers.title")}
            </Typography>
            <Typography variant="body1" className={classes.subtitlePopupTrigger}>
              {t("PopupTriggers.popupTriggers.subtitle")}
            </Typography>
          </Box>
          <Grid container spacing={3} className={classes.cardContainerPopupTrigger}>
            {/* Exit Intent */}
            <Grid item xs={12} sm={6} md={4}>
              <TriggerCard
                title={t("PopupTriggers.popupTriggers.exitIntent.title")}
                description={t("PopupTriggers.popupTriggers.exitIntent.description")}
                footer={t("PopupTriggers.popupTriggers.exitIntent.footer")}
                icon={<ExitToAppIcon />}
                enabled={triggers.exitIntent.enabled}
                onToggle={handleToggle("exitIntent")}
                classes={classes}
              />
            </Grid>

            {/* Page Views */}
            <Grid item xs={12} sm={6} md={4}>
              <TriggerCard
                title={t("PopupTriggers.popupTriggers.pageViews.title")}
                description={t("PopupTriggers.popupTriggers.pageViews.description")}
                footer={t("PopupTriggers.popupTriggers.pageViews.footer")}
                icon={<VisibilityIcon />}
                enabled={triggers.pageViews.enabled}
                onToggle={handleToggle("pageViews")}
                classes={classes}
              >
                <Box className={classes.inputContainerPopupTrigger}>
                  <Typography>{t("PopupTriggers.popupTriggers.pageViews.after")}</Typography>
                  <TextField
                    variant="outlined"
                    size="small"
                    className={classes.textFieldPopupTrigger}
                    value={triggers.pageViews.pages}
                    onChange={handleChange("pageViews", "pages")}
                    disabled={!triggers.pageViews.enabled}
                  />
                  <Typography>{t("PopupTriggers.popupTriggers.pageViews.pages")}</Typography>
                </Box>
              </TriggerCard>
            </Grid>

            {/* Viewing Time */}
            <Grid item xs={12} sm={6} md={4}>
              <TriggerCard
                title={t("PopupTriggers.popupTriggers.viewingTime.title")}
                description={t("PopupTriggers.popupTriggers.viewingTime.description")}
                footer={t("PopupTriggers.popupTriggers.viewingTime.footer")}
                icon={<TimerIcon />}
                enabled={triggers.viewingTime.enabled}
                onToggle={handleToggle("viewingTime")}
                classes={classes}
              >
                <Box
                  className={classes.inputContainerPopupTrigger}
                  display="flex"
                  flexWrap="wrap"
                  alignItems="center"
                  style={{ gap: 8 }}
                >
                  <Typography variant="body2" noWrap>
                    {t("PopupTriggers.popupTriggers.pageViews.after")}
                  </Typography>

                  <TextField
                    variant="outlined"
                    className={classes.textFieldPopupTrigger}
                    value={triggers.viewingTime.time}
                    onChange={handleChange("viewingTime", "time")}
                    disabled={!triggers.viewingTime.enabled}
                  />

                  <Typography variant="body2" noWrap>
                    {t("PopupTriggers.popupTriggers.viewingTime.seconds")}
                  </Typography>

                  <Select
                    value={triggers.viewingTime.scope}
                    onChange={handleChange("viewingTime", "scope")}
                    variant="outlined"
                    className={classes.selectPopupTrigger}
                    disabled={!triggers.viewingTime.enabled}
                    style={{ minWidth: 120 }}
                  >
                    <MenuItem value="currentPage">
                      {t("PopupTriggers.popupTriggers.viewingTime.onCurrentPage")}
                    </MenuItem>
                    <MenuItem value="anyPage">
                      {t("PopupTriggers.popupTriggers.viewingTime.onAnyPage")}
                    </MenuItem>
                  </Select>
                </Box>
              </TriggerCard>
            </Grid>

            {/* Scroll Depth */}
            <Grid item xs={12} sm={6} md={4}>
              <TriggerCard
                title={t("PopupTriggers.popupTriggers.scrollDepth.title")}
                description={t("PopupTriggers.popupTriggers.scrollDepth.description")}
                footer={t("PopupTriggers.popupTriggers.scrollDepth.footer")}
                icon={<HeightIcon />}
                enabled={triggers.scrollDepth.enabled}
                onToggle={handleToggle("scrollDepth")}
                classes={classes}
              >
                <Box className={classes.sliderContainerPopupTrigger}>
                  <Box className={clsx(classes.sliderLabelPopupTrigger, classes.mLeft5)}>
                    <Typography className={classes.font20}>{t("PopupTriggers.popupTriggers.scrollDepth.pageDepth")}</Typography>
                    <Slider
                      value={triggers.scrollDepth.depth}
                      onChange={handleSliderChange("scrollDepth", "depth")}
                      aria-labelledby="scroll-depth-slider"
                      valueLabelDisplay="auto"
                      min={0}
                      max={100}
                      classes={{
                        root: classes.sliderRootPopupTrigger,
                        rail: classes.railPopupTrigger,
                        track: classes.trackPopupTrigger,
                        thumb: classes.thumbPopupTrigger,
                      }}
                      disabled={!triggers.scrollDepth.enabled}
                    />
                    <Typography className={classes.font20}>
                      {triggers.scrollDepth.depth}%
                    </Typography>
                  </Box>
                </Box>
              </TriggerCard>
            </Grid>

            {/* Page Clicks */}
            <Grid item xs={12} sm={6} md={4}>
              <TriggerCard
                title={t("PopupTriggers.popupTriggers.pageClicks.title")}
                description={t("PopupTriggers.popupTriggers.pageClicks.description")}
                footer={t("PopupTriggers.popupTriggers.pageClicks.footer")}
                icon={<TouchAppIcon />}
                enabled={triggers.pageClicks.enabled}
                onToggle={handleToggle("pageClicks")}
                classes={classes}
              >
                <Box className={classes.inputContainerPopupTrigger}>
                  <Typography>{t("PopupTriggers.popupTriggers.pageViews.after")}</Typography>
                  <TextField
                    variant="outlined"
                    className={classes.textFieldPopupTrigger}
                    value={triggers.pageClicks.clicks}
                    onChange={handleChange("pageClicks", "clicks")}
                    disabled={!triggers.pageClicks.enabled}
                  />
                  <Typography>{t("PopupTriggers.popupTriggers.pageClicks.clicks")}</Typography>
                </Box>
              </TriggerCard>
            </Grid>
          </Grid>
        </Paper>
        <DisplayFrequency classes={classes} />
        <PageTargeting classes={classes} />
        <AdvancedSettings classes={classes} />
      </Box>
    </DefaultScreen>
  );
};

export default PopupTriggers;
