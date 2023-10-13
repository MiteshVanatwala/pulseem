import { Box } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";
import { StateType } from "../../../Models/StateTypes";

const TooltipBubble = ({ tooltipText = "TooltipText", ...props }: any) => {
  const { isRTL } = useSelector((state: StateType) => state.core);
  return (
    <Box style={{ transform: isRTL ? "scaleX(1)" : "scaleX(-1)" }}>
      <svg
        width="74"
        height="30"
        viewBox="0 0 84 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M69.3039 29.179L69.0218 39.466L55.664 29.179H14.543C10.6859 29.1787 6.9868 27.6415 4.25949 24.9053C1.53217 22.1692 -9.06017e-09 18.4583 0 14.589C0 10.7198 1.53226 7.00899 4.25961 4.27303C6.98695 1.53706 10.686 0 14.543 0H69.3079C73.165 0 76.8641 1.53706 79.5914 4.27303C82.3188 7.00899 83.8509 10.7198 83.8509 14.589C83.8509 16.5052 83.4747 18.4027 82.7436 20.173C82.0125 21.9434 80.941 23.5519 79.5901 24.9068C78.2392 26.2616 76.6356 27.3362 74.8706 28.0693C73.1057 28.8023 71.2141 29.1794 69.3039 29.179Z"
          fill="#CCFF00"
        />
      </svg>
    </Box>
  );
};

export default TooltipBubble;
