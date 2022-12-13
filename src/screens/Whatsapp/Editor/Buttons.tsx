import React, { useState } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import { coreProps, ButtonsProps } from "./WhatsappCreator.types";
import { Button, Box } from "@material-ui/core";
import { BsTrash } from "react-icons/bs";
import { useTranslation } from "react-i18next";

const Buttons = ({ classes }: ButtonsProps["classes"]) => {
  const { t: translator } = useTranslation();

  const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
  const [isFromAutomation, setIsFromAutomation] = useState<boolean>(false);

  return (
    <div
      style={
        isRTL
          ? { marginRight: "auto" }
          : { marginLeft: "auto", paddingBottom: 40 }
      }
      className={clsx(classes.baseButtonsContainer, "baseButtonsContainer")}
    >
      <Box>
        <Button
          variant="contained"
          size="medium"
          className={clsx(classes.actionButton, classes.actionButtonRed)}
          style={{ margin: "8px", padding: "9px 0" }}
        >
          <BsTrash style={{ fontSize: "25" }} />
        </Button>
      </Box>

      <Button
        variant="contained"
        size="medium"
        className={clsx(
          classes.actionButton,
          classes.actionButtonLightBlue,
          classes.backButton
        )}
        color="primary"
        style={{ margin: "8px" }}
      >
        <>
          {translator("whatsapp.saveSms")}
        </>
      </Button>
      <Button
        type="submit"
        variant="contained"
        size="medium"
        className={clsx(
          classes.actionButton,
          classes.actionButtonLightGreen,
          classes.backButton
        )}
        color="primary"
        style={{ margin: "8px" }}
      >
        <>
          {!isFromAutomation
            ? translator("whatsapp.submit")
            : translator("whatsapp.saveAndExit")}
        </>
      </Button>
    </div>
  );
};

export default React.memo(Buttons);
