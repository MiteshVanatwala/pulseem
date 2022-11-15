import { useState } from "react";
import { Grid, Typography, Box, Tooltip } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { ClassesType } from "../../Classes.types";
import clsx from "clsx";
import { MessageEditorProps } from "./WhatsappCreator.types";
import ActionCallPopUp from "./ActionCallPopUp";

const MessageEditor = ({ classes }: ClassesType & MessageEditorProps) => {
  const { t: translator } = useTranslation();
  const [alignment, setAlignment] = useState<string>("left");
  const [linkCount, setlinkCount] = useState<number>(0);
  const [messageCount, setmessageCount] = useState<number>(0);
  const [characterCount, setcharacterCount] = useState<number>(0);

  const onMsgChange = () => {};

  const handleMsgSelect = () => {};
  return (
    <>
      <Grid container className={clsx(classes.msgDiv)}>
        <Grid container>
          <Grid item xs={12} md={8} className={classes.boxDiv}>
            <Typography className={classes.msgHead}>
              {translator("whatsapp.yourMessage")}
            </Typography>
            <textarea
              placeholder={translator("whatsapp.typeText")}
              maxLength={1024}
              //   outlined=""
              id="yourMessage"
              className={clsx(classes.msgArea, classes.sidebar)}
              style={alignment ? { textAlign: "left" } : { textAlign: "right" }}
              onChange={onMsgChange}
              onSelect={handleMsgSelect}
              //   value={}
            ></textarea>

            <Box className={classes.smallInfoDiv}>
              <Typography style={{ marginInlineEnd: "18px" }}>
                {linkCount}{" "}
                {linkCount === 1
                  ? translator("mainReport.link")
                  : translator("mainReport.links")}
              </Typography>
              <Typography style={{ marginInlineEnd: "18px" }}>
                {messageCount}{" "}
                {messageCount === 1
                  ? translator("sms.message")
                  : translator("sms.messages")}
              </Typography>
              <Typography>
                {characterCount}/1024 {translator("mainReport.char")}
              </Typography>
            </Box>

            <Box className={classes.funcDiv}>
              <ActionCallPopUp classes={classes} />
              {/* <Test /> */}
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default MessageEditor;
