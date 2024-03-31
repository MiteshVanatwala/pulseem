import { useTranslation } from "react-i18next";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { RenderHtml } from "../../../../helpers/Utils/HtmlUtils";
import { FormControl, Grid, MenuItem, Select, Typography } from "@material-ui/core";
import clsx from 'clsx';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllTwoFactorAuthValues } from "../../../../redux/reducers/AccountSettingsSlice";
import PulseemRadio from "../../../../components/Controlls/PulseemRadio";
import { IoIosArrowDown } from "react-icons/io";
import { StateType } from "../../../../Models/StateTypes";

const DisableOtpPopup = ({ classes, onClose, onConfirm }: any) => {
  const { isRTL } = useSelector((state: StateType) => state.core);
  const { t } = useTranslation();
  const [emailList, setEmailList] = useState([]);
  const [cellphoneList, setCellphoneList] = useState([]);
  const [selectedOption, setSelected] = useState<string>('1');
  const [authSelected, setAuthSelected] = useState<string>(t('common.select'));

  const dispatch = useDispatch();

  useEffect(() => {
    const getValues = async () => {
      const vals = await dispatch(getAllTwoFactorAuthValues()) as any;
      setEmailList(vals?.payload?.Data?.Emails)
      setCellphoneList(vals?.payload?.Data?.Cellphones)
    }

    getValues();

  }, [])

  const handleSendCode = () => {

  }

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
              setAuthSelected(t('common.select'))
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
        <Grid item md={12} xs={12}>
          <FormControl
            variant='standard'
            className={clsx(classes.selectInputFormControl, classes.w100, classes.mt15)}
            style={{ maxWidth: 300 }}>
            <Select
              variant="standard"
              // disabled
              autoWidth
              value={authSelected || ''}
              name='TwoFactorAuthOptionID'
              onChange={(e: any) =>
                setAuthSelected(e.target.value)
              }
              IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    direction: isRTL ? 'rtl' : 'ltr'
                  },
                },
              }}
            >
              <MenuItem
                key={''}
                value={t('common.select')}
              >
                {t('common.select')}
              </MenuItem>
              {selectedOption === '1' && emailList?.map((item: any, index) => {
                return (
                  <MenuItem
                    key={index}
                    value={item?.AuthValue}
                  >
                    {t(item?.AuthValue)}
                  </MenuItem>
                );
              })}
              {selectedOption === '2' && cellphoneList?.map((item: any, index) => {
                return (
                  <MenuItem
                    key={index}
                    value={item?.AuthValue}
                  >
                    {t(item?.AuthValue)}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
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
      handleSendCode();
      // onClose();
      // handleConfirmOtpRegulation();
    }}
    showDefaultButtons={true}
  />
}

export default DisableOtpPopup;