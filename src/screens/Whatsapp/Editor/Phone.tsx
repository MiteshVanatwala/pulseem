import React from "react";
import MobilePreview from "../../../components/MobilePreivew/MobilePreivew";
import { PhoneProps } from "./WhatsappCreator.types";
import { Box } from "@material-ui/core";

const Phone = ({ classes }: PhoneProps["classes"]) => {
  return (
    <Box className={classes.mobilePreviewContainer}>
      <MobilePreview
        classes={classes}
        campaignNumber=""
        text=""
        keyItem="edtiorPreview"
      />
    </Box>
  );
};

export default React.memo(Phone);
