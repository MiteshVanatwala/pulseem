import React, { useState, useEffect } from "react";
import { Box } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Title } from "../../../components/managment/Title";
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import FORM_COMPANY_DETAILS from "./Form_CompanyDetails";
import FORM_ACCOUNT_DETAILS from "./Form_AccountDetails";
import Toast from "../../../components/Toast/Toast.component";
import useCore from "../../../helpers/hooks/Core";
import { getAccountSettings, updateDetails, updateSettings } from "../../../redux/reducers/AccountSettingsSlice";
import { AccountSettings } from '../../../Models/Account/AccountSettings';
import { Loader } from "../../../components/Loader/Loader";


const AccountSettingsEditor = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { classes } = useCore();
  const { accountSettings, ToastMessages } = useSelector((state: any) => state?.accountSettings);
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
    setSettingRequest(accountSettings?.Data);
  }, [accountSettings]);

  const handleUpdate = async (updatedObject: AccountSettings, saveType: string, sendRequest: boolean) => {

    setSettingRequest({ ...settingRequest, ...updatedObject });

    if (sendRequest === true) {
      setShowLoader(true);
      let response = null;

      try {
        switch (saveType) {
          case 'company': {
            response = await dispatch(updateDetails(updatedObject));
            break;
          }
          case 'account':
          default: {
            response = await dispatch(updateSettings(updatedObject));
          }
        }
      }
      catch (ex) { }
      finally {
        handleResponses(response);
        setShowLoader(false);
      }
    }

  }

  const handleResponses = (response: any) => {
    switch (response?.StatusCode || response?.payload?.StatusCode) {
      case 201: {
        setToastMessage(ToastMessages.SETTINGS_SAVED);
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
          <FORM_COMPANY_DETAILS
            setToastMessage={setToastMessage}
            ToastMessages={ToastMessages}
            Settings={{ ...settingRequest as AccountSettings }}
            OnUpdate={(updatedObject: AccountSettings, sendRequest: boolean) => handleUpdate(updatedObject, 'company', sendRequest)}
          />
          <FORM_ACCOUNT_DETAILS
            setToastMessage={setToastMessage}
            ToastMessages={ToastMessages}
            Settings={{ ...settingRequest as AccountSettings }}
            OnUpdate={(updatedObject: AccountSettings) => handleUpdate(updatedObject, 'account', true)}
          />
        </Box>
      </Box>
      <Loader isOpen={showLoader} showBackdrop={true} />
    </DefaultScreen>
  );
};

export default AccountSettingsEditor;
