import { useTranslation } from "react-i18next";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { RenderHtml } from "../../../../helpers/Utils/HtmlUtils";
import { Grid, Typography } from "@material-ui/core";
import clsx from 'clsx';
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getAllTwoFactorAuthValues } from "../../../../redux/reducers/AccountSettingsSlice";
import PulseemRadio from "../../../../components/Controlls/PulseemRadio";

const DisableOtpPopup = ({ classes, onClose, onConfirm }: any) => {
  const { t } = useTranslation();
  const [emailList, setEmailList] = useState([]);
  const [cellphoneList, setCellphoneList] = useState([]);
  const [selectedOption, setSelected] = useState<string>('1');

  const dispatch = useDispatch();

  useEffect(() => {
    const getValues = async () => {
      const vals = await dispatch(getAllTwoFactorAuthValues()) as any;
      setEmailList(vals?.payload?.Emails)
      setCellphoneList(vals?.payload?.Cellphones)
    }

    getValues();

  }, [])
  // const { }

  return <BaseDialog
    // icon={<MdCelebration />}
    title={t('settings.accountSettings.bypassOtp.regulationPopup.title')}
    children={<>
      {RenderHtml(t("settings.accountSettings.bypassOtp.regulationPopup.text"))}
      <Typography className={clsx(classes.font18, classes.mt15)}>
        {t("settings.accountSettings.bypassOtp.regulationPopup.reEnterPassword")}
      </Typography>

      <Grid container className={classes.mt15}>
        <Grid item md={6} xs={12}>
          <PulseemRadio
            classes={classes}
            isVerical={false}
            name={'otpType'}
            onChange={(e: any, x: any, y: any) => {
              setSelected(e.target.value.toString())
            }}
            radioOptions={[
              {
                value: "1",
                className: selectedOption === '2' ? classes.radioButtonDisabled : classes.radioButtonActive,
                label: t("common.verifyByEmail"),
                child: null
              },
              {
                value: "2",
                className: selectedOption === '1' ? classes.radioButtonDisabled : classes.radioButtonActive,
                label: t("common.verifyBySms"),
                child: null
              }
            ]}
            value={selectedOption}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          {/* List of emails / cellphone by selected type */}
        </Grid>
      </Grid>
      <Typography className={clsx(classes.font16, classes.mt5)}>
        {t("settings.accountSettings.bypassOtp.regulationPopup.acceptAgreement")}
      </Typography>
    </>
    }
    open={true}
    classes={classes}
    confirmText={t("common.Ok")}
    disableBackdropClick={true}
    onCancel={() => onClose()}
    onClose={() => onClose()}
    onConfirm={() => {
      onClose();
      // handleConfirmOtpRegulation();
    }}
    showDefaultButtons={true}
  />
}

export default DisableOtpPopup;