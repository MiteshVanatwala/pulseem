import React from "react";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { useClasses } from "../style/classes/index";

type generalPropTypes = {
  redirect: Function;
  classes: any;
};

type RedirectPropTypes = {
  url: string;
  openNewTab: boolean;
};

const useGeneralProps = () => {
  const navigate = useHistory();
  const { isRTL, windowSize } = useSelector(
    (state: { core: any }) => state?.core
  );
  const classes = useClasses(windowSize, isRTL)();

  const Redirect = (RedirectProps: RedirectPropTypes) => {
    let { url = "", openNewTab = false } = RedirectProps;
    if (openNewTab) {
      window.open(url);
      return false;
    }
    if (window.location.href.indexOf("aspx") > -1) {
      window.location.href = url;
    } else {
      navigate.push(url);
    }
  };

  const generalProps: generalPropTypes = {
    redirect: Redirect,
    classes: classes,
  };

  return generalProps;
};

export default useGeneralProps;
