import React, { useState } from "react";
import { Box } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Title } from "../../../components/managment/Title";
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import { useSelector } from "react-redux";
import Form_CompanyDetails from "./Form_CompanyDetails";
import Form_AccountDetails from "./Form_AccountDetails";
import Toast from "../../../components/Toast/Toast.component";
import useCore from "../../../helpers/hooks/Core";

const AccountSettingsEditor = () => {
  const { t } = useTranslation();
  const { classes } = useCore();
  const { ToastMessages } = useSelector((state: any) => state?.settings);
  const [toastMessage, setToastMessage] = useState(null);

  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return <Toast data={toastMessage} />;
  };

  return (
    <DefaultScreen
      currentPage="settings"
      subPage="accountSettings"
      classes={classes}
      containerClass={classes.management}
    >
      {toastMessage && renderToast()}
      <Box className={clsx(classes.settingsContainer)}>
        <Box className="head">
          <Title Text={t("settings.accountSettings.title")} classes={classes} />
        </Box>
        <Box className={"containerBody"}>
          <Form_CompanyDetails
            setToastMessage={setToastMessage}
            ToastMessages={ToastMessages}
          />
          <Form_AccountDetails
            setToastMessage={setToastMessage}
            ToastMessages={ToastMessages}
          />
        </Box>
      </Box>
    </DefaultScreen>
  );
};

export default AccountSettingsEditor;
