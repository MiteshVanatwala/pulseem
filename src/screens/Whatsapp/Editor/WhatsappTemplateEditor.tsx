import { BaseSyntheticEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { actionButtonProps, coreProps, WhatsappCreatorProps } from "./WhatsappCreator.types";
import clsx from "clsx";
import { Box, Button, Grid, makeStyles, Tooltip } from "@material-ui/core";
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import { ClassesType } from "../../Classes.types";

const WhatsappTemplateEditor = ({ classes, onButtonClick }: WhatsappCreatorProps & ClassesType) => {
  const { t: translator } = useTranslation();
  const useStyles = makeStyles(() => ({
    customWidth: {
      maxWidth: 200,
      backgroundColor: "black",
      fontSize: "14px",
      textAlign: 'center'
    },
    noMaxWidth: {
      maxWidth: "none",
    },
  }));
  const styles = useStyles();
  const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
  const [templateText, setTemplateText] = useState('');
  const [linkCount, setlinkCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [alignment, setAlignment] = useState<string>('right');

  useEffect(() => {
    setAlignment(isRTL ? "right" : "left");
  }, [isRTL])
  const onTemplateChange = (e: BaseSyntheticEvent) => {
    setTemplateText(e.target.value)
    setCharacterCount(e.target.value?.length)
  }

  const buttons: actionButtonProps[] = [
    {
      tooltipTitle: "whatsapp.template.callToActionTooltip",
      buttonTitle: 'whatsapp.template.callToAction',
      isDisable: false
    },
    {
      tooltipTitle: "whatsapp.template.quickReplayTooltip",
      buttonTitle: 'whatsapp.template.quickReplay',
      isDisable: false
    },
    {
      tooltipTitle: "whatsapp.template.removalLinkTooltip",
      buttonTitle: 'whatsapp.template.removalLink',
      isDisable: false
    },
    {
      tooltipTitle: "whatsapp.template.removalTextTooltip",
      buttonTitle: 'whatsapp.template.removalText',
      isDisable: false
    },
    {
      tooltipTitle: "whatsapp.template.dynamicFieldTooltip",
      buttonTitle: 'whatsapp.template.dynamicField',
      isDisable: false
    },
  ]

  const actionButtons = [
    {
      buttonTitle: 'demoCall'
    },
    {
      buttonTitle: 'demoAction'
    }
  ]

  return (
    <>
      <textarea
        placeholder={translator("whatsapp.template.textareaPlaceholder")}
        maxLength={1024}
        id="whatsapp-template-text"
        className={clsx(classes.msgArea, classes.sidebar)}
        style={{ textAlign: alignment === 'right' ? 'right' : 'left' }}
        onChange={onTemplateChange}
        // onSelect={handleMsgSelect}
        value={templateText}
      ></textarea>

      <Box className={classes.whatsappActionButtonsWrapper}>
        {actionButtons.map((actionButton) => (
          <Box key={actionButton.buttonTitle} className={classes.whatsappActionButtonsBox}>
            <DeleteOutlinedIcon style={{ color: 'red', cursor: 'pointer' }} onClick={() => console.log(actionButton)} />
            <Button className={classes.whatsappActionButtons}>{actionButton.buttonTitle}</Button>
          </Box>
        ))}
      </Box>

      <Box className={classes.smallInfoDiv}>
        <span className={classes.textInfoWrapper}>
          {linkCount}
          <span className={classes.textInfo}>{linkCount === 1 ? translator("mainReport.link") : translator("mainReport.links")}</span>
        </span>

        <span className={classes.textInfoWrapper}>
          {messageCount}
          <span className={classes.textInfo}>{messageCount === 1 ? translator("sms.message") : translator("sms.messages")}</span>
        </span>

        <span className={classes.textInfoWrapper}>
          {characterCount}/1024
          <span className={classes.textInfo}>{translator("mainReport.char")}</span>
        </span>
      </Box>

      <Box className={classes.whatsappFuncDiv}>

        <Box
          className={isRTL ? classes.emojiHe : classes.emoji}
        >
          {isRTL ? (
            <>
              <Tooltip
                disableFocusListener
                title={translator("mainReport.aligntoRight")}
                classes={{ tooltip: styles.customWidth }}
                placement="top-start"
                arrow
              >
                <FormatAlignRightIcon style={{ marginInlineEnd: "4px" }} onClick={() => { setAlignment('right') }} />
              </Tooltip>
              <Tooltip
                disableFocusListener
                title={translator("mainReport.alignToLeft")}
                classes={{ tooltip: styles.customWidth }}
                placement="top-start"
                arrow
              >
                <FormatAlignLeftIcon onClick={() => { setAlignment('left') }} />
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip
                disableFocusListener
                title={translator("mainReport.alignToLeft")}
                classes={{ tooltip: styles.customWidth }}
                placement="top-start"
                arrow
              >
                <FormatAlignLeftIcon style={{ marginInlineEnd: "4px" }} onClick={() => { setAlignment('left') }} />
              </Tooltip>
              <Tooltip
                disableFocusListener
                title={translator("mainReport.aligntoRight")}
                classes={{ tooltip: styles.customWidth }}
                placement="top-start"
                arrow
              >
                <FormatAlignRightIcon onClick={() => { setAlignment('right') }} />
              </Tooltip>
            </>
          )}
        </Box>

        <Box className={classes.whatsappBaseButtons}>
          {buttons.map((button) => (
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
                  className={clsx(classes.whatsappInfoButtons, button.isDisable ? classes.disabled : null)}
                  onClick={() => onButtonClick(button)}
                >
                  {translator(button.buttonTitle)}
                </Button>
              )}
            </Tooltip>
          ))}

        </Box>
      </Box>
    </>
  );
};

export default WhatsappTemplateEditor;