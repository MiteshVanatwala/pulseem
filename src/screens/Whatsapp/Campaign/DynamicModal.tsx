import React, { useState, useEffect, useMemo, BaseSyntheticEvent } from "react";
import {
  Button,
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  TextareaAutosize,
  MenuItem,
  Switch,
  Typography,
  FormGroup,
  Tooltip,
  makeStyles,
  Divider,
  Select,
} from "@material-ui/core";
import { DialogTitle, useMediaQuery, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Close } from "@material-ui/icons";
import { ClassesType } from "../../Classes.types";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import { coreProps, dynamicButtonProps } from "./WhatsappCampaign.types";
import { useTranslation } from "react-i18next";

const DynamicModal = ({ classes }: ClassesType) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const [isConfirm, setIsConfirm] = useState<boolean>(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const { t: translator } = useTranslation();
  const { isRTL } = useSelector((state: { core: coreProps }) => state.core);

  const [navApp, setNavApp] = React.useState<string>("");
  const [landPage, setLandPage] = React.useState<string>("");
  const [personalField, setPersonalField] = React.useState<string>("");
  const [textInput, setTextInput] = React.useState<string>("");
  const [linkInput, setLinkInput] = React.useState<string>("");
  const [navAddress, setNavAddress] = React.useState<string>("");
  const [buttonColor, setButtonColor] = useState<boolean>(false);
  /* */
  const useStyles = makeStyles(() => ({
    customWidth: {
      maxWidth: 200,
      backgroundColor: "black",
      fontSize: "14px",
      textAlign: "center",
    },
    noMaxWidth: {
      maxWidth: "none",
    },
  }));
  const styles = useStyles();
  const [isPersonalField, setIsPersonalField] = useState<boolean>(true);
  const [isText, setIsText] = useState<boolean>(false);
  const [isLink, setIsLink] = useState<boolean>(false);
  const [isLandingPage, setIsLandingPage] = useState<boolean>(false);
  const [isNavigation, setIsNavigation] = useState<boolean>(false);
  const [alignment, setAlignment] = useState<string>("right");

  useEffect(() => {
    setAlignment(isRTL ? "right" : "left");
  }, [isRTL]);

  // const handlePersonalFieldClick = () => {
  //   setIsPersonalField(true);
  //   setIsText(false);
  //   setIsLink(false);
  //   setIsLandingPage(false);
  //   setIsNavigation(false);
  // };

  // const handleTextClick = () => {
  //   setIsPersonalField(false);
  //   setIsText(true);
  //   setIsLink(false);
  //   setIsLandingPage(false);
  //   setIsNavigation(false);
  // };

  // const handleLinkClick = () => {
  //   setIsPersonalField(false);
  //   setIsText(false);
  //   setIsLink(true);
  //   setIsLandingPage(false);
  //   setIsNavigation(false);
  // };

  // const handleLandingPageClick = () => {
  //   setIsPersonalField(false);
  //   setIsText(false);
  //   setIsLink(false);
  //   setIsLandingPage(true);
  //   setIsNavigation(false);
  // };

  // const handleNavigationClick = () => {
  //   setIsPersonalField(false);
  //   setIsText(false);
  //   setIsLink(false);
  //   setIsLandingPage(false);
  //   setIsNavigation(true);
  // };

  const dynamicButtons = useMemo<dynamicButtonProps[]>(
    () => [
      {
        tooltipTitle: "whatsappCampaign.pField",
        buttonTitle: "whatsappCampaign.pField",
      },
      {
        tooltipTitle: "whatsappCampaign.text",
        buttonTitle: "whatsappCampaign.text",
      },
      {
        tooltipTitle: "whatsappCampaign.link",
        buttonTitle: "whatsappCampaign.link",
      },
      {
        tooltipTitle: "whatsappCampaign.lPage",
        buttonTitle: "whatsappCampaign.lPage",
      },
      {
        tooltipTitle: "whatsappCampaign.navigation",
        buttonTitle: "whatsappCampaign.navigation",
      },
    ],
    []
  );

  const onButtonClick = (button: dynamicButtonProps) => {
    if (button.buttonTitle.includes("pField")) {
      setIsPersonalField(true);
      setIsText(false);
      setIsLink(false);
      setIsLandingPage(false);
      setIsNavigation(false);
    } else if (button.buttonTitle.includes("text")) {
      setIsPersonalField(false);
      setIsText(true);
      setIsLink(false);
      setIsLandingPage(false);
      setIsNavigation(false);
    } else if (button.buttonTitle.includes("link")) {
      setIsPersonalField(false);
      setIsText(false);
      setIsLink(true);
      setIsLandingPage(false);
      setIsNavigation(false);
    } else if (button.buttonTitle.includes("lPage")) {
      setIsPersonalField(false);
      setIsText(false);
      setIsLink(false);
      setIsLandingPage(true);
      setIsNavigation(false);
    } else if (button.buttonTitle.includes("navigation")) {
      setIsPersonalField(false);
      setIsText(false);
      setIsLink(false);
      setIsLandingPage(false);
      setIsNavigation(true);
    }
  };

  /* */

  const handleClickOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button variant="outlined" onClick={handleClickOpen}>
        Open responsive dialog
      </Button>
      <Dialog
        fullScreen={fullScreen}
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          {translator("whatsappCampaign.dfieldTitle")}
        </DialogTitle>
        <Box position="absolute" top={0} right={0}>
          <IconButton>
            <Close onClick={handleClose} />
          </IconButton>
        </Box>
        <DialogContent>
          <DialogContentText>
            {/* <Stack direction="row" spacing={0.5}>
              <Button
                color="primary"
                variant="outlined"
                size="small"
                // className={clsx(classes.whatsappInfoButtons)}
                onClick={handlePersonalFieldClick}
              >
                Personal Field
              </Button>
              <Button
                color="primary"
                variant="outlined"
                size="small"
                // className={clsx(classes.whatsappInfoButtons)}
                onClick={handleTextClick}
              >
                Text
              </Button>
              <Button
                color="primary"
                variant="outlined"
                size="small"
                // className={clsx(classes.whatsappInfoButtons)}
                onClick={handleLinkClick}
              >
                Link
              </Button>
              <Button
                color="primary"
                variant="outlined"
                size="small"
                // className={clsx(classes.whatsappInfoButtons)}
                onClick={handleLandingPageClick}
              >
                Landing Page
              </Button>
              <Button
                color="primary"
                variant="outlined"
                size="small"
                // className={clsx(classes.whatsappInfoButtons)}
                onClick={handleNavigationClick}
              >
                Navigation
              </Button>
            </Stack> */}
            <Stack direction="row" spacing={0}>
              {dynamicButtons.map((button) => (
                <Tooltip
                  disableFocusListener
                  title={translator(button.tooltipTitle)}
                  classes={{ tooltip: styles.customWidth }}
                  placement="top"
                  arrow
                  key={button.buttonTitle}
                >
                  {onButtonClick && (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      style={{
                        margin: "6px",
                        padding: "3px 9px",
                        borderRadius: "20px",
                      }}
                      onClick={() => onButtonClick(button)}
                    >
                      {translator(button.buttonTitle)}
                    </Button>
                  )}
                </Tooltip>
              ))}
            </Stack>
          </DialogContentText>
          {/* <Stack direction="row" spacing={0.5}> */}
          {isPersonalField ? (
            <Select
              required
              value={personalField}
              displayEmpty
              variant="outlined"
              style={{ width: "100%" }}
              renderValue={
                personalField !== ""
                  ? undefined
                  : () => translator("whatsappCampaign.pFieldPlaceholder")
              }
              onChange={(e: BaseSyntheticEvent) =>
                setPersonalField(e.target.value)
              }
            >
              <MenuItem value="Jonak">Jonak</MenuItem>
              <MenuItem value="Roy">Roy</MenuItem>
            </Select>
          ) : null}

          {isText ? (
            <TextareaAutosize
              required
              aria-label="minimum height"
              placeholder={translator("whatsappCampaign.textPlaceholder")}
              minRows={4}
              style={{ width: "100%" }}
              onChange={(e: BaseSyntheticEvent) => setTextInput(e.target.value)}
              value={textInput}
            />
          ) : null}

          {isLink ? (
            <>
              <Box className={classes.switchDiv}>
                <FormGroup>
                  <Switch
                    className={
                      isRTL
                        ? clsx(classes.reactSwitchHe, "react-switch")
                        : clsx(classes.reactSwitch, "react-switch")
                    }
                    checked={true}
                    //   onChange={toggleKeep}
                    //   onColor="#28a745"
                    //   checkedIcon={false}
                    //   uncheckedIcon={false}
                    //   handleDiameter={30}
                    //   height={20}
                    //   width={48}
                    //   boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                    //   activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                    //   id="material-switch"
                  />
                </FormGroup>
                <Box className={classes.radio}>
                  <Typography style={{ fontSize: "18px" }}>
                    {translator("mainReport.keepTrack")}
                  </Typography>
                  <Typography className={classes.descSwitch}>
                    {translator("mainReport.keepDesc")}
                  </Typography>
                </Box>
              </Box>
              <br />
              <TextField
                required
                variant="outlined"
                placeholder={translator("whatsappCampaign.linkPlaceholder")}
                style={{ width: "100%" }}
                onChange={(e: BaseSyntheticEvent) =>
                  setLinkInput(e.target.value)
                }
                value={linkInput}
              />
            </>
          ) : null}

          {isLandingPage ? (
            <Select
              required
              value={landPage}
              displayEmpty
              variant="outlined"
              style={{ width: "100%" }}
              renderValue={
                landPage !== ""
                  ? undefined
                  : () => translator("whatsappCampaign.lPagePlaceholder")
              }
              onChange={(e: BaseSyntheticEvent) => setLandPage(e.target.value)}
            >
              <MenuItem value="Landing page 1">Landing page 1</MenuItem>
              <MenuItem value="Landing page 2">Landing page 2</MenuItem>
            </Select>
          ) : null}

          {isNavigation ? (
            <>
              <Select
                required
                value={navApp}
                displayEmpty
                variant="outlined"
                style={{ width: "100%" }}
                renderValue={
                  navApp !== ""
                    ? undefined
                    : () => translator("whatsappCampaign.navAppPlaceholder")
                }
                onChange={(e: BaseSyntheticEvent) => setNavApp(e.target.value)}
              >
                <MenuItem value="Waze">Waze</MenuItem>
                <MenuItem value="Google Maps">Google Maps</MenuItem>
              </Select>
              <Divider style={{ height: 10, backgroundColor: "white" }} />
              <TextField
                required
                variant="outlined"
                placeholder={translator(
                  "whatsappCampaign.navigationPlaceholder"
                )}
                style={{ width: "100%" }}
                onChange={(e: BaseSyntheticEvent) =>
                  setNavAddress(e.target.value)
                }
                value={navAddress}
              />
            </>
          ) : null}
          {/* </Stack> */}
        </DialogContent>
        <DialogActions>
          <Button
            // color="primary"
            variant="contained"
            style={{
              margin: "6px",
              padding: "3px 9px",
              borderRadius: "20px",
              backgroundColor: "#d63511",
              color: "white",
            }}
          >
            Exit
          </Button>
          <Button
            // color="secondary"
            variant="contained"
            style={{
              margin: "6px",
              padding: "3px 9px",
              borderRadius: "20px",
              backgroundColor: "#1e8a22",
              color: "white",
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DynamicModal;
