import React from "react";
import MobilePreview from "../../../components/MobilePreivew/MobilePreivew";
import { RenderPhoneProps } from "./types";
import { Box } from "@material-ui/core";

const RenderPhone = ({ classes }: RenderPhoneProps) => {
  return (
    <>
      {" "}
      <Box className={classes.mobilePreviewContainer}>
        <MobilePreview
          classes={classes}
          campaignNumber=""
          text=""
          keyItem="edtiorPreview"
        />
      </Box>
    </>
  );
};

export default React.memo(RenderPhone);
