import React from "react";

const Illustration_BG_BL = (props: any) => {
  return (
    <svg
      width="321"
      height="555"
      viewBox={`0 0 ${props.width || 321} ${props.height || 555}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M321 555C315.518 474.956 298.202 409.203 275.009 329.204C271.549 317.293 267.595 305.05 259.256 295.86C244.447 279.521 232.872 258.08 213.426 250.462C201.852 245.971 189.999 241.228 180.716 232.955C169.663 223.128 163.301 209.133 158.071 195.282C136.936 139.41 127.024 75.1396 82.8207 34.9334C59.7262 13.932 29.263 2.41632 -2 0V554.991L321 555Z"
        fill="#F0F5FF"
      />
    </svg>
  );
};

export default Illustration_BG_BL;
