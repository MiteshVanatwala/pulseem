import React, { useState, useEffect, useMemo } from "react";
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import UploadXL from '../../../components/Files/UploadXL';
import { useTranslation } from "react-i18next";

const TestUploader = ({ classes }) => {
  const { t } = useTranslation();
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
    t={t}
  />
  </DefaultScreen>
);
}

export default TestUploader;
