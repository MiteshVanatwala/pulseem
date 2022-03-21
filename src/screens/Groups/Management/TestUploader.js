import React, { useState, useEffect, useMemo } from "react";
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import UploadXL from '../../../components/Files/UploadXL';
import { UploadSettings } from "../tempConstants";

const TestUploader = ({ classes }) => {
  const onDone = (e) => {
    console.log(e)
  }
return (
  <DefaultScreen
    currentPage="testUploader"
    classes={classes}
    containerClass={clsx(classes.management, classes.mb50)}
  >
  <UploadXL
    classes={classes}
    onDone={onDone}
    settings={UploadSettings.GROUPS}
  />
  </DefaultScreen>
);
}

export default TestUploader;
