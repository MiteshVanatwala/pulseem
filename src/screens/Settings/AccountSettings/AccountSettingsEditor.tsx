import React, { useState, useEffect } from "react";
import { Box } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Title } from "../../../components/managment/Title";
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import Form_CompanyDetails from "./Form_CompanyDetails";
import Form_AccountDetails from "./Form_AccountDetails";
import Toast from "../../../components/Toast/Toast.component";
import useCore from "../../../helpers/hooks/Core";
import { getAccountSettings } from "../../../redux/reducers/AccountSettingsSlice";
import { AccountSettings } from '../../../Models/Account/AccountSettings';
import { Loader } from "../../../components/Loader/Loader";


const AccountSettingsEditor = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { classes } = useCore();
  const { ToastMessages } = useSelector((state: any) => state?.settings);
  const { StatusCode, Message, Data } = useSelector((state: any) => state?.accountSettings);
  const [toastMessage, setToastMessage] = useState(null);
  const [showLoader, setShowLoader] = useState(true);
  const [settingRequest, setSettingRequest] = useState<AccountSettings | null>({
    SubAccountId: -1,
    LoginUserName: '',
    AccountID: -1,
    CompanyAdmin: false,
    CompanyName: '',
    ContactName: '',
    Email: '',
    CellPhone: '',
    Telephone: '',
    City: '',
    Address: '',
    ZipCode: null,
    BirthDate: null,
    DefaultFromMail: '',
    DefaultFromName: '',
    DefaultCellNumber: '',
    MaxMailSendingForMonth: null,
    MaxSMSSendingForMonth: null,
    BulkEmail: null,
    BulkSMS: null,
    BulkMMS: null,
    UnsubscribeType: false,
    IsSmsImmediateUnsubscribeLink: false,
    TwoFactorAuthEnabled: null,
    TwoFactorAuthOptionID: null,
    TwoFactorAuthTestMethodID: null,
    TwoFactorAuthRetries: null,
    TwoFactorAuthOverrideDateTime: null,
    ExpiryDate: null

  } as AccountSettings);

  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return <Toast data={toastMessage} />;
  };

  const getData = async () => {
    await dispatch(getAccountSettings());
    setShowLoader(false);
  }
  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    setSettingRequest(Data);
  }, [Data]);

  const handleUpdate = (updatedObject: AccountSettings) => {
    setSettingRequest({ ...settingRequest, ...updatedObject })
  }

  const handleResponses = (response: any) => {
    switch (response?.StatusCode || response?.payload?.StatusCode) {
      case 201: {
        break;
      }
      case 401: {
        break;
      }
      case 405: {
        break;
      }
      case 409: {
        break;
      }
      case 500:
      default: {
        setToastMessage(ToastMessages?.GENERAL_ERROR);
      }
    }
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
            Settings={{ ...Data }}
            OnUpdate={(updatedObject: AccountSettings) => handleUpdate(updatedObject)}
          />
          <Form_AccountDetails
            setToastMessage={setToastMessage}
            ToastMessages={ToastMessages}
            Settings={{ ...Data }}
            OnUpdate={(updatedObject: AccountSettings) => handleUpdate(updatedObject)}
          />
        </Box>
      </Box>
      <Loader isOpen={showLoader} showBackdrop={true} />
    </DefaultScreen>
  );
};

export default AccountSettingsEditor;
