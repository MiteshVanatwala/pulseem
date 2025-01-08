import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Button, Checkbox, Grid, Snackbar, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import Toast from '../Toast/Toast.component';
import { coreProps } from '../../model/Core/corePros.types';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import { Alert } from '@mui/material';

const Pulse = ({ classes, isOpen, onClose, selectedGroups = [], initialValues}: any) => {
	const { t } = useTranslation();
	const { windowSize, isRTL } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const [ toastMessage, setToastMessage ] = useState(null);
	const [ togglePulse, settogglePulse ] = useState(false);
	const [ pulseBool, setpulseBool ] = useState(false);
	const [ snackBarPulseBoolean, setsnackBarPulseBoolean ] = useState(false);
  const [ snackbarTimeBoolean, setsnackbarTimeBoolean ] = useState(false);
  const [ snackbarMainPulse, setsnackbarMainPulse ] = useState(false);
	const [ TimeBool, setTimeBool ] = useState(false);
	const [ pulseAmount, setPulseAmount ] = useState("");
  const [ timeInterval, setTimeInterval ] = useState("");
	const [ toggleRandom, settoggleRandom ] = useState(false);
	const [ random, setrandom ] = useState("");
	const [ boolRandom, setboolRandom ] = useState(false);
	const [ pulseType, setPulseType ] = useState(2);
	const [ pulsePer, setpulsePer ] = useState("recipients");
	const [ pulseReci, setpulseReci ] = useState("");
	const [ timeType, setTimeType ] = useState(1);
	const [ minName, setminName ] = useState("mins");
  const [ hourName, sethourName ] = useState("Hours");

	useEffect(() => {
		if (isOpen) {
			setPulseAmount(initialValues?.pulseAmount || "");
			setTimeInterval(initialValues?.timeInterval || "");
			setPulseType(initialValues?.pulseType || 2);
			setrandom(initialValues?.random || "");
			setTimeType(initialValues?.timeType || 1);
			setpulsePer(initialValues?.pulsePer || "recipients");
			setpulseReci(initialValues?.pulseReci || "");
			setminName(initialValues?.minName || "mins");
			sethourName(initialValues?.hourName || "Hours");
			settogglePulse(initialValues?.togglePulse || false);
			settoggleRandom(initialValues?.toggleRandom || false);
		}
	}, [isOpen]);

	const renderToast = () => {
		setTimeout(() => {
			setToastMessage(null);
		}, 2000);
		return <Toast customData={null} data={toastMessage} />;
	};

	const handlePulseConfirm = () => {
    if (onPulseValidations()) {
			onClose({
				pulseAmount,
				timeInterval,
				pulseType,
				random,
				timeType,
				pulsePer,
				pulseReci,
				minName,
				hourName,
				togglePulse,
				toggleRandom
			})
    }
  }

	const onPulseValidations = () => {
    let isValid = true;
    if (togglePulse) {
      if (pulseAmount === "") {
        setpulseBool(true);
        setsnackBarPulseBoolean(true);
      }
      if (timeInterval === "") {
        setsnackbarTimeBoolean(true);
        setTimeBool(true);
        isValid = false;
      }
    }
    if (toggleRandom) {
      if (random === "") {
        setboolRandom(true);
        setsnackbarMainPulse(true);
        isValid = false;
      }
    }
    return isValid;
  }

	const handlePulseInput = (e: any) => {
    const re = /^[0-9\b]+$/;
    if ((e.target.value === '' || re.test(e.target.value))) {
      if (pulseType === 1) {
        if (Number(e.target.value) > 100) {
          setPulseAmount("100");
        }
        else {
          setPulseAmount(e.target.value);
        }
      }
      else {
        if (Number(e.target.value) > selectedGroups.reduce(function (a: any, b: any) {
          return a + b['Recipients'];
        }, 0)) {
          setPulseAmount(selectedGroups.reduce(function (a: any, b: any) {
            return a + b['Recipients'];
          }, 0))
        }
        else {
          setPulseAmount(e.target.value);
        }
      }
      setpulseBool(false);
    }
  };

	const handleTime = (e: any) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setTimeInterval(e.target.value);
      setTimeBool(false);
    }
  };

	const handleRandom = (e: any) => {
    setboolRandom(false);
    const re = /^[0-9\b]+$/;
    const totalRecipients = selectedGroups.reduce(function (a: any, b: any) {
      return a + b['Recipients'];
    }, 0);

    if ((e.target.value === '' || re.test(e.target.value))) {
      if (pulseType === 1) {
        if (Number(e.target.value) > totalRecipients) {
          setrandom(selectedGroups.reduce(function (a: any, b: any) {
            return a + b['Recipients'];
          }, 0))
          setboolRandom(false);
        }
        else {
          setrandom(e.target.value);
          setboolRandom(false);
        }
      }
      else {
        if (Number(e.target.value) > totalRecipients) {
          setrandom(totalRecipients)
        }
        else {
          setrandom(e.target.value)
        }
      }
    }
  };

	const handleMainWarningPulse = () => {
    if (snackbarTimeBoolean === false || snackBarPulseBoolean === false) {
      return false;
    }
    else if (snackbarMainPulse === false) {
      return false;
    }
  }

	return (
		<BaseDialog
			classes={classes}
			open={isOpen}
			title={t(`smsReport.pulseSending`)}
			icon={
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
          {'\u0056'}
        </div>
			}
			showDivider={false}
			onClose={() => onClose(null)}
			onCancel={() => onClose(null)}
			onConfirm={() => {}}
			reduceTitle
			style={{ minWidth: 240 }}
			renderButtons={() => (
				<Grid
					container
					spacing={2}
					className={clsx(
						classes.dialogButtonsContainer,
						isRTL ? classes.rowReverse : null
					)}
				>
					<Grid item>
						<Button
							onClick={handlePulseConfirm}
							className={clsx(
								classes.btn,
								classes.btnRounded,
								"saveFixedDetails"
							)}
						>
							{t("common.Save")}
						</Button>
					</Grid>
					<Grid item>
						<Button
							variant='contained'
							size='small'
							onClick={() => onClose(null)}
							className={clsx(classes.btn, classes.btnRounded)}
						>
							{t("common.cancel")}
						</Button>
					</Grid>
				</Grid>
			)}
		>
			<>
				<Box className={clsx(classes.pulseDialog, classes.mb25)}>
          <Box className={classes.mb15}
          >
            <Checkbox
              style={{ marginRight: windowSize !== 'xs' ? -15 : -10, marginLeft: windowSize !== 'xs' ? -15 : -10 }}
              checked={togglePulse}
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onClick={() => {
                settogglePulse(!togglePulse);
                setPulseAmount("");
                setTimeInterval("");
              }}
            />
            <Typography className={clsx(classes.ps15, classes.pe15, classes.bold, classes.dInlineBlock)}>{t("smsReport.packetSend")}</Typography>
          </Box>
          <Box className={classes.topPulseDiv}>
            <Box>
              <span className={classes.noOfReci}>
                {t("smsReport.noOfReciPulse")}
              </span>
              <div className={classes.inputFieldDiv}>
                <input
                  type="text"
                  placeholder={t("smsReport.insert")}
                  disabled={togglePulse ? false : true}
                  className={
                    togglePulse
                      ? pulseBool ? clsx(classes.pulseActive, classes.error) : clsx(classes.pulseActive)
                      : clsx(classes.pulseInsert)
                  }
                  value={pulseAmount}
                  onChange={handlePulseInput}
                />
								{/* @ts-ignore */}
                <div className={clsx(classes.commonFieldPulse, classes.mr5, classes.ml5)} style={{ direction: isRTL ? 'ltr' : 'none' }}>
                  <span
                    className={
                      togglePulse
                        ? pulseType === 1
                          ? clsx(classes.percentTrue)
                          : clsx(classes.toggleActive)
                        : clsx(classes.toggleEnd)
                    }
                    onClick={() => {
                      setPulseType(1);
                      setpulsePer("percent");
                    }}
                  >
                    {t("smsReport.percent")}
                  </span>
                  <span
                    className={
                      togglePulse
                        ? pulseType === 2
                          ? clsx(classes.reciTrue)
                          : clsx(classes.reciActive)
                        : clsx(classes.toggleStart)
                    }
                    onClick={() => {
                      setPulseType(2);
                      setpulsePer("recipients");
                      setpulseReci("Recipients");
                    }}
                  >
                    {t("smsReport.Reci")}
                  </span>
                </div>
              </div>
            </Box>
            <Box>
              <span
                className={classes.noOfReci}
              >
                {t("smsReport.timeSend")}
              </span>
              <Box
                className={classes.inputFieldDiv}
              >
                <input
                  type="text"
                  placeholder={t("smsReport.insert")}
                  disabled={togglePulse ? false : true}
                  className={
                    togglePulse
                      ? TimeBool ? clsx(classes.pulseActive, classes.error) : clsx(classes.pulseActive)
                      : clsx(classes.pulseInsert)
                  }
                  onChange={handleTime}
                  value={timeInterval}
                  maxLength={3}
                />

								{/* @ts-ignore */}
                <Box className={clsx(classes.commonFieldPulse, classes.mr5, classes.ml5)} style={{ direction: isRTL ? 'ltr' : 'none' }}>
                  <span
                    className={
                      togglePulse
                        ? timeType === 2
                          ? clsx(classes.percentTrue)
                          : clsx(classes.toggleActive)
                        : clsx(classes.toggleEnd)
                    }
                    onClick={() => {
                      setTimeType(2);
                      setminName("");
                      sethourName("hours");
                    }}
                  >
                    {t("smsReport.Hours")}
                  </span>
                  <span
                    className={
                      togglePulse
                        ? timeType === 1
                          ? clsx(classes.reciTrue)
                          : clsx(classes.reciActive)
                        : clsx(classes.toggleStart)
                    }
                    onClick={() => {
                      setTimeType(1);
                      setminName("mins");
                      sethourName("");
                    }}
                  >
                    {t("smsReport.min")}
                  </span>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            className={classes.randomSendDiv}
          >
            <Checkbox
              style={{ marginRight: windowSize !== 'xs' ? -15 : -10, marginLeft: windowSize !== 'xs' ? -15 : -10 }}
              checked={toggleRandom}
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onClick={() => {
                settoggleRandom(!toggleRandom);
                setrandom("");
              }}
            />
            <Typography className={clsx(classes.ps15, classes.pe15, classes.bold, classes.dInlineBlock)}>{t("smsReport.randomSend")}</Typography>
          </Box>
          <Box className={classes.randomRows}>
            <span
              className={classes.randomReciSpan}
            >
              {t("smsReport.noOfReci")}
            </span>
            <input
              type="text"
              placeholder={t("smsReport.insert")}
              disabled={toggleRandom ? false : true}
              className={
                toggleRandom
                  ? boolRandom ? clsx(classes.ml5, classes.mr5, classes.pulseActive, classes.error) : clsx(classes.pulseActive, classes.ml5, classes.mr5)
                  : clsx(classes.pulseInsert, classes.ml5, classes.mr5)
              }
              value={random}
              onChange={handleRandom}
            />
          </Box>
        </Box>
				{toastMessage && renderToast()}
				<Snackbar
					open={snackbarTimeBoolean || snackBarPulseBoolean || snackbarMainPulse}
					autoHideDuration={5000}
					onClose={() => { handleMainWarningPulse() }}
					anchorOrigin={{
						vertical: "top",
						horizontal: "right",
					}}
					style={{ zIndex: "9999" }}
				>
					<Alert severity="warning" className={classes.snackBarSevere}>
						{t("smsReport.NoPulse")}
					</Alert>
				</Snackbar>
				<Snackbar
					open={snackBarPulseBoolean}
					autoHideDuration={3000}
					onClose={() => { setsnackBarPulseBoolean(false) }}
					anchorOrigin={{
						vertical: "top",
						horizontal: "right",
					}}
					style={{ zIndex: "9999", marginTop: "60px" }}
				>
					<Alert severity="error" className={classes.snackBarSevere}>
						{t("smsReport.pulseAmount")}
					</Alert>
				</Snackbar>
				<Snackbar
					open={snackbarTimeBoolean}
					autoHideDuration={3000}
					onClose={() => { setsnackbarTimeBoolean(false) }}
					anchorOrigin={{
						vertical: "top",
						horizontal: "right",
					}}
					style={{ zIndex: "9999", marginTop: "120px" }}
				>
					<Alert severity="error" className={classes.snackBarSevere}>
						{t("smsReport.timeAmount")}
					</Alert>
				</Snackbar>
				<Snackbar
					open={snackbarMainPulse}
					autoHideDuration={3000}
					onClose={() => { setsnackbarMainPulse(false) }}
					anchorOrigin={{
						vertical: "top",
						horizontal: "right",
					}}
					style={{ zIndex: "9999", marginTop: "60px" }}
				>
					<Alert severity="error" className={classes.snackBarSevere}>
						{t("sms.fillRandomAmount")}
					</Alert>
				</Snackbar>
			</>
		</BaseDialog>
	);
};

export default Pulse;
