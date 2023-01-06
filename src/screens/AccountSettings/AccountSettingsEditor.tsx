import React, { useState } from "react";
import { Box } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Title } from "../../components/managment/Title";
import DefaultScreen from "../DefaultScreen";
import clsx from "clsx";
import { useSelector } from "react-redux";
import Form_CompanyDetails from "./Form_CompanyDetails";
import Form_AccountDetails from "./Form_AccountDetails";
import Toast from "../../components/Toast/Toast.component";

const AccountSettingsEditor = ({ classes }: any) => {
  const { t } = useTranslation();
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
      <Box className={clsx(classes.accountSettingsContainer)}>
        <Box className="head">
          <Title Text={t("accountSettings.title")} classes={classes} />
        </Box>
        <Box className={"containerBody"}>
          <Form_CompanyDetails
            classes={classes}
            setToastMessage={setToastMessage}
            ToastMessages={ToastMessages}
          />
          <Form_AccountDetails
            classes={classes}
            setToastMessage={setToastMessage}
            ToastMessages={ToastMessages}
          />
        </Box>
      </Box>
    </DefaultScreen>
  );
};

export default AccountSettingsEditor;
