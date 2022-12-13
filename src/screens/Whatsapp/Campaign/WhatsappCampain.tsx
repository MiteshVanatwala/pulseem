import React, { BaseSyntheticEvent, useMemo, useRef, useState } from "react";
import DefaultScreen from "../../DefaultScreen";
import { Title } from "../../../components/managment/Title";
import { useTranslation } from "react-i18next";
import {
  Box,
  Grid,
  Link,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Switch,
  Typography,
  TextField,
  Button,
  Chip,
} from "@material-ui/core";
import { Stack } from "@mui/material";
import { useSelector } from "react-redux";
import { WhatsappCampaignProps, coreProps } from "./WhatsappCampaign.types";
import { ClassesType } from "../../Classes.types";
import CampaignFields from "./CampaignFields";
import clsx from "clsx";
import WhatsappMobilePreview from "../Editor/WhatsappMobilePreview";
import { templateDataProps } from "../Editor/WhatsappCreator.types";

const WhatsappCampaign = ({ classes }: WhatsappCampaignProps & ClassesType) => {
  const { t: translator } = useTranslation();
  const { isRTL, windowSize } = useSelector(
    (state: { core: coreProps }) => state.core
  );
  const [isCampaign, setIsCampaign] = useState<boolean>(false);
  const [buttonType, setButtonType] = useState<string>("");
  const [templateData, setTemplateData] = useState<templateDataProps>({
    templateText: "",
    templateButtons: [],
  });
  const [linkCount, setlinkCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [alignment, setAlignment] = useState<string>("right");
  const [textAreaHeight, setTextAreaHeight] = useState<string>("auto");

  const handleSubmit = () => {};

  return (
    <DefaultScreen
      subPage={"create"}
      currentPage="whatsapp"
      classes={classes}
      customPadding={true}
    >
      <b>
        <p style={{ textAlign: "right", color: "#DC3D1B" }}>
          {translator("whatsappCampaign.note")}
          <br />
          Check your limit <Link>here</Link>
        </p>
      </b>
      <Title
        Text={translator("whatsappCampaign.header")}
        Classes={classes.whatsappTemplateTitle}
        ContainerStyle={{}}
        Element={null}
      />
      <br />
      <form onSubmit={handleSubmit}>
        <Grid container>
          <CampaignFields classes={classes} />
          <Grid
            container
            spacing={windowSize === "xs" ? 0 : 2}
            style={{ paddingTop: "14px" }}
          >
            <Grid item xs={12} sm={12} md={12} lg={5}>
              <div className={classes.WhatsappTextareaWrapper}>
                <textarea
                  required
                  readOnly
                  // ref={templateTextRef}
                  // placeholder={translator(
                  //   "whatsapp.template.textareaPlaceholder"
                  // )}
                  maxLength={1024}
                  id="whatsapp-template-text"
                  className={clsx(classes.msgArea, classes.sidebar)}
                  style={{
                    textAlign: alignment === "right" ? "right" : "left",
                    height: textAreaHeight,
                  }}
                  // onChange={onEditorChange}
                  // value={templateText}
                ></textarea>
              </div>
              <Box className={classes.whatsappSmallInfoDiv}>
                <span className={classes.textInfoWrapper}>
                  <span className={classes.textInfo}>
                    {linkCount === 1
                      ? translator("whatsappCampaign.link")
                      : translator("whatsappCampaign.links")}
                  </span>
                  &nbsp;{linkCount}
                </span>

                <span className={classes.textInfoWrapper}>
                  <span className={classes.textInfo}>
                    {messageCount === 1
                      ? translator("whatsappCampaign.dfield")
                      : translator("whatsappCampaign.dfields")}
                  </span>
                  &nbsp;{messageCount}
                </span>

                <span className={classes.textInfoWrapper}>
                  {/* {templateText?.length} */}
                  <span className={classes.textInfo}>
                    {translator("whatsappCampaign.char")}
                  </span>
                  &nbsp;0/1024
                </span>
              </Box>
            </Grid>

            <Grid item xs={12} sm={12} md={12} lg={7}>
              <Grid container spacing={windowSize === "xs" ? 0 : 2}>
                <Grid item xs={12} sm={12} md={12} lg={6}>
                  {/* <WhatsappTips classes={classes} /> */}
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={6}>
                  <Box>
                    <WhatsappMobilePreview
                      classes={classes}
                      campaignNumber="1"
                      templateData={templateData}
                      buttonType={buttonType}
                    />
                  </Box>

                  <Box className={classes.switchDiv}>
                    <FormGroup>
                      <Switch
                        className={
                          isRTL
                            ? clsx(classes.reactSwitchHe, "react-switch")
                            : clsx(classes.reactSwitch, "react-switch")
                        }
                        // checked={isLinksStatistics}
                        // onChange={toggleKeep}
                        // onColor="#28a745"
                        checkedIcon={false}
                        // uncheckedIcon={false}
                        // handleDiameter={30}
                        // height={20}
                        // width={48}
                        // boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        // activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                        id="material-switch"
                      />
                    </FormGroup>

                    <Box className={classes.radio}>
                      <Typography style={{ fontSize: "18px" }}>
                        {translator("whatsappCampaign.tsend")}
                      </Typography>
                      <Typography className={classes.descSwitch}>
                        {translator("whatsappCampaign.tsendDesc")}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className={classes.radio}>
                    <RadioGroup
                      aria-labelledby="demo-controlled-radio-buttons-group"
                      defaultValue="female"
                      name="radio-buttons-group"
                    >
                      <FormControlLabel
                        value="female"
                        control={<Radio />}
                        label={
                          <Typography style={{ fontSize: 18 }}>
                            Send to one contact
                          </Typography>
                        }
                      />
                      <Stack direction="row" spacing={0.5} height={40}>
                        <TextField
                          required
                          size="small"
                          id="templateName"
                          // inputProps={{ style: { fontSize: 18 } }}
                          placeholder={translator(
                            "whatsappCampaign.oneContactPlaceholder"
                          )}
                          className={
                            isCampaign
                              ? clsx(classes.buttonField, classes.error)
                              : clsx(classes.buttonField, classes.success)
                          }
                          //   onChange={onTemplateNameChange}
                          //   value={templateName}
                        />
                        <Button variant="outlined" color="primary">
                          SEND
                        </Button>
                      </Stack>
                      <br />
                      <Stack direction="row" spacing={0.5} height={40}>
                        <FormControlLabel
                          value="male"
                          control={<Radio />}
                          label={
                            <Typography style={{ fontSize: 18 }}>
                              Send to test groups
                            </Typography>
                          }
                        />
                        {/* <Chip
                        label="New!"
                        size="small"
                        color="primary"
                        style={{ position: "relative", top: 10 }}
                      /> */}
                        <span className={classes.iconNew}>
                          {translator("mainReport.newFeature")}
                        </span>
                      </Stack>
                    </RadioGroup>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            {/* <Buttons classes={classes} /> */}
          </Grid>
        </Grid>
      </form>
    </DefaultScreen>
  );
};

export default WhatsappCampaign;
