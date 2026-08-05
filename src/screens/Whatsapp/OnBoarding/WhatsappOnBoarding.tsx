import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { ClassesType } from '../../Classes.types';
import DefaultScreen from '../../DefaultScreen';
import {
	CommonRedux,
	coreProps,
	toastProps,
} from '../Editor/Types/WhatsappCreator.types';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Loader } from '../../../components/Loader/Loader';
import Toast from '../../../components/Toast/Toast.component';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { errorToastData, resetToastData, successToastData, WHATSAPP_ONBOARDING_STATUS } from '../Constant';
import { Badge, Box, Button, Grid, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@material-ui/core';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import { Title } from '../../../components/managment/Title';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';
import { facebookLogin, getMetaPhoneNumbers, getWhatsAppCodeVirtualNumbers, getWhatsAppSMSVirtualNumbers, MetaPhoneRegister, setCoexistenceMode, syncCoexistenceHistoryRecords } from '../../../redux/reducers/whatsappOnBoardingSlice';
import { PulseemResponse } from '../../../Models/APIResponse';
import { flatten, get } from 'lodash';
import { IsValidPhoneNumberKeyPress } from '../../../helpers/Utils/Validations';
import { DialogTypeInterface } from '../../../Models/Common';
import { businessInfoInterface, phoneNumbersInterface, virtualNumbersCodeListInterface, virtualNumbersInterface } from '../../../Models/Whatsapp/WhatsappOnboarding';
import { WhatsAppPlatformIDEnum } from '../../../config/enum';
import NoSetup from '../NoSetup/NoSetup';
import { DateFormats } from '../../../helpers/Constants';
import moment from 'moment';

const FB_SDK_SCRIPT_ID = 'facebook-jssdk-whatsapp-onboarding';

// A data row under managementStyle settles at 60px on its own: a 20px text line plus
// tableCellRoot's 10px padding and tableCellBody's 10px margin, top and bottom. Nothing
// here pins a height - the business verification table and the numbers table both take
// that natural 60px, and the coexistence controls line is padded to land on it too.
// size='small' gives a 24px-tall Switch instead of the default 38px, which would make the
// coexistence controls line taller than a row of text. A 2px inset either side takes it
// to 20px - a text line - so that line matches the details line above it. Small enough
// not to crop the thumb, unlike insetting a full-size switch.
const SWITCH_INSET = { marginTop: -2, marginBottom: -2 } as const;

// Local development aid. Meta's coexistence onboarding cannot be completed against
// localhost, and the backend does not yet return is_on_biz_app, so every number looks
// like it cannot do coexistence. Set REACT_APP_WA_COEXISTENCE_MOCK=true in .env to
// force the capability on and exercise the toggles. Double-gated on NODE_ENV so it can
// never be switched on in a production build.
const MOCK_COEXISTENCE =
	process.env.NODE_ENV === 'development' &&
	process.env.REACT_APP_WA_COEXISTENCE_MOCK === 'true';

const WhatsappOnBoarding = ({ classes }: ClassesType) => {
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const { windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const { WhatsAppPlatformID } = useSelector(
		(state: { common: CommonRedux }) => state.common
	);
	const [isLoader, setIsLoader] = useState<boolean>(true);
	const [dialogType, setDialogType] = useState<DialogTypeInterface | null>(null);
	const [toastMessage, setToastMessage] = useState<toastProps['SUCCESS']>(resetToastData);
	const [businessInfo, setBusinessInfo] = useState<businessInfoInterface>({
		name: '',
		business_verification_status: ''
	});
	const [phoneNumbers, setPhoneNumbers] = useState<phoneNumbersInterface[]>([]);
	const [virtualNumbers, setVirtualNumbers] = useState<virtualNumbersInterface[]>([]);
	const [virtualNumbersCodeList, setVirtualNumbersCodeList] = useState<virtualNumbersCodeListInterface[]>([]);
	const [pin, setPin] = useState<string>('');
	const [errors, setErrors] = useState<{
		pin?: string,
		pinError?: string
	}>({
		pin: '',
		pinError: ''
	});
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [code, setCode] = useState('');
  const [isCoexistenceFlow, setIsCoexistenceFlow] = useState<boolean>(false);
	
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot }
  
	useEffect(() => {
		if (WhatsAppPlatformID !== WhatsAppPlatformIDEnum.TWILLIO) {
			fetchMetaPhoneNumbers();
			fetchWhatsAppSMSVirtualNumbers();
			fetchWhatsAppCodeVirtualNumbers();
			// eslint-disable-next-line react-hooks/exhaustive-deps

			const interval = setInterval(() => {
				fetchWhatsAppCodeVirtualNumbers();
			}, 10000);

			return () => clearInterval(interval);
		}
	}, [])

	// Mount-only: previously called straight from the render body, which appended a
	// new SDK script and registered another 'message' listener on every render, so a
	// single Meta callback was handled many times over.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => loadFacebookSDK(), []);

	useEffect(() => {
		// @ts-ignore
		if (phoneNumberId && wabaId && code && !isSubmittingRef.current) {
			// @ts-ignore
			isSubmittingRef.current = true;
			FBlogin();
		}
	}, [phoneNumberId, wabaId, code]);

	// Clears the handshake values so a consumed Meta code can never be resent, and
	// re-arms the guard for the next onboarding attempt.
	const resetHandshake = () => {
		setPhoneNumberId('');
		setWabaId('');
		setCode('');
		// @ts-ignore
		isSubmittingRef.current = false;
	};

	const FBlogin = async () => {
		const payload = {
			phone_number_id: phoneNumberId,
			waba_id: wabaId,
			code: code,
			isCoexistence: isCoexistenceFlow
		};
		console.log('[SaveWhatsappMetaClients] Calling API with payload:', payload);
		const resp = await dispatch(facebookLogin(payload)) as any;
		handleFBloginResponse(resp?.payload as PulseemResponse)
	}

	const handleFBloginResponse = (response: PulseemResponse) => {
		const { StatusCode, Message } = response as any;
		if (StatusCode === 1) {
			setToastMessage({
				...successToastData,
				message: isCoexistenceFlow
					? t('WhatsappOnBoarding.coexistenceSyncStarted')
					: t('WhatsappOnBoarding.phoneNumberRegistered')
			});
			setIsCoexistenceFlow(false);
			resetHandshake();
			fetchMetaPhoneNumbers();
		} else {
			setToastMessage({
				...errorToastData,
				message: (StatusCode >=3 && StatusCode <= 9 || StatusCode === 100) ? t(`WhatsappOnBoarding.SaveWhatsappMetaClientsResponseCode.${StatusCode}`) : Message
			});
			resetHandshake();
		}
	}

	const handleCoexistenceToggle = async (messageServiceId: string, phoneNumber: string, enabled: boolean) => {
		// Optimistic update
		setPhoneNumbers(prev => prev.map(p => p.id === messageServiceId ? { ...p, isCoexistenceEnabled: enabled } : p));
		const resp = await dispatch(setCoexistenceMode({
			enable: enabled,
			phone_number: phoneNumber,
			message_service_id: messageServiceId
		})) as any;
		const payload = resp?.payload as PulseemResponse;
		if (payload?.StatusCode !== 1) {
			// Revert on failure
			setPhoneNumbers(prev => prev.map(p => p.id === messageServiceId ? { ...p, isCoexistenceEnabled: !enabled } : p));
			setToastMessage({ ...errorToastData, message: payload?.Message || t('common.Error') });
		}
	};

	const fetchMetaPhoneNumbers = async () => {
		const resp = await dispatch(getMetaPhoneNumbers({})) as any;
		handleMetaPhoneNumberResponse(resp?.payload as PulseemResponse)
	}

	const fetchWhatsAppSMSVirtualNumbers = async () => {
		const resp = await dispatch(getWhatsAppSMSVirtualNumbers()) as any;
		const { StatusCode, Data } = resp?.payload as PulseemResponse
		if (StatusCode === 1) {
			setVirtualNumbers(flatten(Data));
		}
	}

	const fetchWhatsAppCodeVirtualNumbers = async () => {
		const resp = await dispatch(getWhatsAppCodeVirtualNumbers()) as any;
		const { StatusCode, Data } = resp?.payload as PulseemResponse
		if (StatusCode === 1) {
			setVirtualNumbersCodeList(flatten(Data));
		}
		setIsLoader(false);
	}

	const handleMetaPhoneNumberResponse = (response: PulseemResponse) => {
		const { StatusCode, Data } = response;
		if (StatusCode === 1) {
			const {
				businessInfo, phoneNumbers
			} = Data;
			setBusinessInfo({ ...businessInfo, business_verification_status: businessInfo?.business_verification_status || 'pending' });
			// Coexistence onboarding cannot be run against localhost, so MOCK_COEXISTENCE
			// lets us force the capability on and work on the UI. Real numbers get their
			// value from Meta's is_on_biz_app once the backend returns it.
			setPhoneNumbers(
				MOCK_COEXISTENCE
					? (phoneNumbers || []).map((p: phoneNumbersInterface) => ({ ...p, isBusinessNumber: true }))
					: phoneNumbers
			);
		} else if (StatusCode === 4) {
		}
	}

	const loadFacebookSDK = () => {
		// @ts-ignore
		window.fbAsyncInit = function () {
			// @ts-ignore
			window.FB.init({
				appId: '8512543772102886',
				autoLogAppEvents: true,
				xfbml: true,
				version: 'v21.0',
			});
		};

		if (!document.getElementById(FB_SDK_SCRIPT_ID)) {
			const script = document.createElement('script');
			script.id = FB_SDK_SCRIPT_ID;
			script.src = 'https://connect.facebook.net/en_US/sdk.js';
			script.async = true;
			script.defer = true;
			script.crossOrigin = 'anonymous';
			document.body.appendChild(script);
		}

		window.addEventListener('message', handleMessage);

		return () => {
			window.removeEventListener('message', handleMessage);
		};
	};

	const resetToast = () => {
		setToastMessage(resetToastData);
	};

	const renderToast = () => {
		if (toastMessage.message?.length > 0) {
			setTimeout(() => {
				resetToast();
			}, 4000);
			return <Toast data={toastMessage} />;
		}
		return null;
	};

	const renderDialog = () => {
		const { type } = dialogType || {}
		let currentDialog: any = {};
		if (type === 'OTP') {
			currentDialog = OTPDialog()
		}

		if (type) {
			return (
				dialogType && <BaseDialog
					contentStyle={type === 'errorDialog' ? classes.maxWidth400 : null}
					classes={classes}
					open={dialogType}
					onCancel={() => setDialogType(null)}
					onClose={() => setDialogType(null)}
					renderButtons={currentDialog?.renderButtons || null}
					{...currentDialog}>
					{currentDialog?.content}
				</BaseDialog>
			)
		}
	}

	const handleMessage = async (event: any) => {
		if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') {
			return;
		}

		try {
			const data = JSON.parse(event.data);
			if (data.type === 'WA_EMBEDDED_SIGNUP') {
				if (data.event === 'FINISH') {
					const { phone_number_id, waba_id } = data.data;
					setPhoneNumberId(phone_number_id);
					setWabaId(waba_id);
        } else if (data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING') {
          const { phone_number_id, waba_id } = data.data;
					console.log('[Coexistence] FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING received from Meta:', {
						phone_number_id,
						waba_id,
						full_payload: data
					});
					setIsCoexistenceFlow(true);
					setPhoneNumberId(phone_number_id);
					setWabaId(waba_id);
        } else if (data.event === 'CANCEL' || data.event === 'ERROR') {
					setPhoneNumberId('');
					setWabaId('');
					setIsCoexistenceFlow(false);
        }
      }
    } catch (error) {
      console.log('Non JSON Responses', event.data);
    }
  };
 
  const fbLoginCallback = (response: any) => {
		if (response.authResponse) {
			const code = response.authResponse.code;
			setCode(code);
		}
	};

	const launchWhatsAppSignup = (coexistenceMode: boolean = false) => {
    // @ts-ignore
    window?.FB?.login(fbLoginCallback, {
      config_id: '1240808773727236',
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: coexistenceMode ? 'whatsapp_business_app_onboarding' : '',
        sessionInfoVersion: '3',
      },
    });
  };

	const renderPhoneNumbersTableBody = () => {
		return (
			<Box className='tableBodyContainer'>
				<TableBody>
					{phoneNumbers.map((item: phoneNumbersInterface, index: number) => windowSize === 'xs' ? renderPhoneNumbersPhoneRow(item) : renderPhoneNumbersRow(item, index))}
				</TableBody>
			</Box>
		)
	}

	const renderPhoneNumbersPhoneRow = (row: phoneNumbersInterface) => {
    return (
      <>
        <TableRow
          key={row.id}
          component='div'
          classes={rowStyle}
        >
          <TableCell style={{ flex: 1 }} classes={{ root: clsx(classes.tableCellRoot, classes.p10) }} className={classes.p20}>
            <Box className={clsx(classes.justifyBetween, classes.pb5)}>
              <Box className={clsx(classes.dFlex, classes.f18)}>
								<Typography className={clsx(classes.f18, classes.bold, classes.pe15)}>
									{t("WhatsappOnBoarding.ID")}:
								</Typography>
								<Typography className={classes.f18}>
									{row?.id}
								</Typography>
              </Box>
              <Box className={clsx(classes.dInlineBlock, classes.textCapitalize)}>
								{renderPhoneNumberStatus(row)}
              </Box>
            </Box>
						<Box className={classes.dFlex}>
							<Typography className={clsx(classes.f18, classes.bold, classes.pe15)}>
								{t("WhatsappOnBoarding.phoneNumber")}:
							</Typography>
							<Typography className={classes.f18}>
								{row?.display_phone_number}
							</Typography>
						</Box>
						{/* <Box className={classes.dFlex}>
							<Typography className={clsx(classes.f18, classes.bold, classes.pe15)}>
								{t("WhatsappOnBoarding.tier")}:
							</Typography>
							<Typography className={classes.f18}>
								{row?.tier}
							</Typography>
						</Box>
						<Box className={classes.dFlex}>
							<Typography className={clsx(classes.f18, classes.bold, classes.pe15)}>
								{t("WhatsappOnBoarding.limit")}:
							</Typography>
							<Typography className={classes.f18}>
								{row?.limit}
							</Typography>
						</Box>
						{/* Same coexistence switches as the desktop row, kept under the number */}
						<Box className={classes.pt10}>
							{renderCoexistenceControls(row)}
						</Box>
          </TableCell>
        </TableRow>
      </>
    )
  }

	const renderPhoneNumberStatus = (row: phoneNumbersInterface) => {
		return (
			// Centred and wrapping: the label and the reconnect button share a narrow
			// column, so they sit side by side when there is room and drop onto a
			// second line instead of colliding when there is not.
			<Box
				className={clsx(classes.dFlex)}
				style={{ alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}
			>
				{
					row?.status?.toUpperCase() !== WHATSAPP_ONBOARDING_STATUS.CONNECTED
					? t(`WhatsappOnBoarding.virtualPhoneNumberStatus.${row?.status?.toLowerCase()}`)
					: (
						<Badge color="primary" variant="dot" anchorOrigin={{vertical: 'top', horizontal: 'left'}} className={clsx(classes.connectedDot)}>
							{t(`WhatsappOnBoarding.virtualPhoneNumberStatus.${row?.status?.toLowerCase()}`)}
						</Badge>
					)
				}
				{!row.isBusinessNumber && (
					<Button
						onClick={() => setDialogType({ type: 'OTP', data: row })}
						className={clsx(classes.searchButton, classes.btn, classes.btnRounded)}
						style={{ textTransform: 'capitalize', whiteSpace: 'nowrap', flexShrink: 0 }}
					>
						{t('reconnect')}
					</Button>
				)}
			</Box>
		)
	}

	// Meta accepts the 6-month backfill once per onboarding, so this is a one-way trigger
	// rather than a setting: switching on fires the sync, and there is nothing to switch
	// off afterwards. Ignore any attempt to turn it back off.
	const handleSyncToggle = async (row: phoneNumbersInterface, enabled: boolean) => {
		if (!enabled || row.isLast6MonthsRecordCoexistance || !row.isCoexistenceEnabled) return;
		const setSynced = (value: boolean) => setPhoneNumbers(prev =>
			prev.map(p => p.id === row.id ? { ...p, isLast6MonthsRecordCoexistance: value } : p)
		);
		setSynced(true);
		const resp = await dispatch(syncCoexistenceHistoryRecords({
			// The API example uses bare digits, so strip the display formatting
			phone_number: (row.display_phone_number || '').replace(/[^\d]/g, ''),
			message_service_id: row.id
		})) as any;
		const payload = resp?.payload as PulseemResponse;
		if (payload?.StatusCode === 1) {
			setToastMessage({ ...successToastData, message: t('WhatsappOnBoarding.coexistenceSyncStarted') });
			fetchMetaPhoneNumbers();
		} else {
			setSynced(false);
			setToastMessage({ ...errorToastData, message: payload?.Message || t('common.Error') });
		}
	};

	// Hide the control only when Meta has positively told us the number is not on the
	// WhatsApp Business App. While the backend does not yet return is_on_biz_app the
	// field is undefined, and we show the toggle rather than a dead "Not Available".
	const isCoexistenceCapable = (row: phoneNumbersInterface) => row.isBusinessNumber !== false;

	// Meta only accepts the history sync once, within 24 hours of onboarding, so the
	// switch is dead after that. onboardedOn is not returned by GetMetaPhoneNumbers yet
	// (it is WhatsAppMetaOnBoardClientsInfo.CreatedOn); until it is, the field is absent
	// and the window is treated as open rather than wrongly disabling the control.
	const isSyncWindowOpen = (row: phoneNumbersInterface) => {
		if (!row.onboardedOn) return true;
		return moment().diff(moment(row.onboardedOn), 'hours') < 24;
	};

	const renderSyncCell = (row: phoneNumbersInterface) => {
		if (!isCoexistenceCapable(row)) return (
			<Typography className={clsx(classes.f14)} style={{ color: '#9e9e9e' }}>
				{t('WhatsappOnBoarding.coexistenceNotAvailable')}
			</Typography>
		);
		const isSynced = !!row.isLast6MonthsRecordCoexistance;
		return (
			<Switch
				checked={isSynced}
				onChange={(e) => handleSyncToggle(row, e.target.checked)}
				color='primary'
				size='small'
				style={SWITCH_INSET}
				// Coexistence must be on first - there is no history to pull for a number
				// that is not sharing with the WhatsApp Business App. Also dead once the
				// sync has run or Meta's 24-hour window has closed.
				disabled={!row.isCoexistenceEnabled || isSynced || !isSyncWindowOpen(row)}
			/>
		)
	}

	const renderCoexistenceCell = (row: phoneNumbersInterface) => {
		if (!isCoexistenceCapable(row)) return (
			<Typography className={clsx(classes.f14)} style={{ color: '#9e9e9e' }}>
				{t('WhatsappOnBoarding.coexistenceNotAvailable')}
			</Typography>
		);
		return (
			<Switch
				checked={!!row.isCoexistenceEnabled}
				onChange={(e) => handleCoexistenceToggle(row.id, row.display_phone_number, e.target.checked)}
				color='primary'
				size='small'
				style={SWITCH_INSET}
			/>
		)
	}

	// The two coexistence switches for a number, rendered on their own line directly
	// beneath that number's details so it is unambiguous which number they belong to.
	const renderCoexistenceControls = (row: phoneNumbersInterface) => {
		// Two equal sections - coexistence on the left, app sync on the right - each
		// centred within its own half so the pair reads as two columns of the table.
		// Vertical padding lives on the sections, not the cell, so the divider between
		// them can run the full height of the row instead of stopping short.
		const section = {
			flex: 1,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
		} as const;
		return (
			<Box style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
				{/* Divider matches the column partitions on the details line above */}
				<Box style={{ ...section, borderInlineEnd: '2px solid #F0F5FF' }}>
					<Typography className={clsx(classes.f14, classes.semibold)}>
						{t('WhatsappOnBoarding.coexistenceColumn')}
					</Typography>
					{renderCoexistenceCell(row)}
				</Box>
				<Box style={section}>
					<Typography className={clsx(classes.f14, classes.semibold)}>
						{t('WhatsappOnBoarding.syncColumn')}
					</Typography>
					<Tooltip title={t('WhatsappOnBoarding.syncTooltip')} placement='top' arrow>
						{/* Sized inline rather than via CustomTooltip, whose IconButton wrapper
						    is 48px tall and would stretch the row */}
						<InfoOutlined style={{ fontSize: 16, color: '#9e9e9e', cursor: 'pointer' }} />
					</Tooltip>
					{renderSyncCell(row)}
				</Box>
			</Box>
		)
	}

	const renderPhoneNumbersRow = (row: phoneNumbersInterface, index: number) => {
		// Each number occupies two lines, so nth-of-type striping would alternate within
		// a number instead of between them. Drive the background off the number's index
		// and apply it to both lines, so a number reads as one banded block.
		const rowBackground = index % 2 === 0 ? '#fff' : '#f7faff';
		return (
			<Fragment key={row.id}>
			<TableRow
				classes={rowStyle}
				className={clsx()}
				style={{ backgroundColor: rowBackground }}
			>
				<TableCell
					classes={cellStyle}
					align='center'
					className={classes.flex2}
					style={{ whiteSpace: 'nowrap' }}>
					{row?.display_phone_number}
				</TableCell>
				<TableCell
					classes={cellStyle}
					align='center'
					className={classes.flex2}>
					{row?.id}
				</TableCell>
				 <TableCell
					classes={cellStyle}
					align='center'
					className={classes.flex2}>
					{row?.tier}
				</TableCell>
				<TableCell
					classes={cellStyle}
					align='center'
					className={classes.flex2}>
					{row?.limit}
				</TableCell>
				<TableCell
					classes={cellStyle}
					align='center'
					className={clsx(classes.flex2, classes.textCapitalize)}>
					{renderPhoneNumberStatus(row)}
				</TableCell>
			</TableRow>
			{/* Same background as the details line above, so the pair bands together */}
			<TableRow classes={rowStyle} style={{ backgroundColor: rowBackground }}>
				<TableCell
					classes={cellStyle}
					align='center'
					style={{ flex: 1, borderInlineEnd: 'none' }}>
					{renderCoexistenceControls(row)}
				</TableCell>
			</TableRow>
			</Fragment>
		)
	}

	const renderPhoneNumbersTable = () => {
		return (
			<>
				<Typography className={clsx(classes.semibold, classes.f22, classes.pb10)}>{t('WhatsappOnBoarding.phoneNumberList')}</Typography>
				{/* Five columns in a half-width grid item: scroll horizontally rather than
				    letting the cells squash or push the page out sideways. */}
				<TableContainer className={classes.tableStyle} style={{ overflowX: 'auto' }}>
					<Table className={classes.tableContainer} style={{ minWidth: 520 }}>
						{windowSize !== 'xs' && renderPhoneNumbersTableHead()}
						{renderPhoneNumbersTableBody()}
					</Table>
				</TableContainer>
			</>
		)
	}

	const renderPhoneNumbersTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('WhatsappOnBoarding.phoneNumber')}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('WhatsappOnBoarding.ID')}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('WhatsappOnBoarding.tier')}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('WhatsappOnBoarding.limit')}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('WhatsappOnBoarding.status')}</TableCell>
        </TableRow>
      </TableHead>
    )
  }

	const renderVirtualNumbers = () => {
		if (virtualNumbers.length === 0) return <></>;

		return (
			<>
				<Typography className={clsx(classes.semibold, classes.f22, classes.pb10)}>{t('WhatsappOnBoarding.virtualNumbers')}</Typography>
				<TableContainer className={clsx(classes.tableStyle, windowSize !== 'xs' ? classes.w50 : classes.w100, classes.mb20)}>
					<Table className={classes.tableContainer}>
						{
							windowSize !== 'xs' && (
								<TableHead>
									<TableRow classes={rowStyle}>
										<TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('WhatsappOnBoarding.virtualNumber')}</TableCell>
									</TableRow>
								</TableHead>
							)
						}
						<Box className='tableBodyContainer'>
							<TableBody>
								{
									virtualNumbers.map((vnumber: virtualNumbersInterface) => (
										<TableRow
											classes={rowStyle}
											className={clsx()}
										>
											<TableCell
												classes={cellStyle}
												align='center'
												className={classes.flex2}>
												{vnumber?.Number}
											</TableCell>
										</TableRow>
									))
								}
							</TableBody>
						</Box>
					</Table>
				</TableContainer>
			</>
		)
	}

	const renderIncomingMessages = () => {
		if (virtualNumbersCodeList.length === 0) return <></>;

		return (
			<>
				<Typography className={clsx(classes.semibold, classes.f22, classes.pb10)}>{t('WhatsappOnBoarding.incomingMessages')}</Typography>
				<TableContainer className={clsx(classes.tableStyle)}>
					<Table className={classes.tableContainer}>
						{
							windowSize !== 'xs' && (
								<TableHead>
									<TableRow classes={rowStyle}>
										<TableCell classes={cellStyle} className={classes.flex1} align='center'>{t('WhatsappOnBoarding.virtualNumber')}</TableCell>
										<TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('WhatsappOnBoarding.message')}</TableCell>
										<TableCell classes={cellStyle} className={classes.flex1} align='center'>{t('WhatsappOnBoarding.message')}</TableCell>
									</TableRow>
								</TableHead>
							)
						}
						<Box className='tableBodyContainer'>
							<TableBody>
								{
									virtualNumbersCodeList.map(windowSize === 'xs' ? renderIncomingMessagePhoneRow : renderIncomingMessageRow)
								}
							</TableBody>
						</Box>
					</Table>
				</TableContainer>
			</>
		)
	}

	const renderIncomingMessagePhoneRow = (vnumber: virtualNumbersCodeListInterface) => {
		return (
			<TableRow
				key={vnumber.VirtualNumber}
				component='div'
				classes={rowStyle}
			>
				<TableCell style={{ flex: 1 }} classes={{ root: clsx(classes.tableCellRoot, classes.p10) }} className={classes.p20}>
					<Box className={clsx(classes.pb5)}>
						<Box className={clsx(classes.dFlex, classes.f18)}>
							<Typography className={clsx(classes.f18, classes.bold, classes.pe15)}>
								{t("WhatsappOnBoarding.virtualNumber")}:
							</Typography>
							<Typography className={classes.f18}>
								{vnumber.VirtualNumber}
							</Typography>
						</Box>
					</Box>
					<Box className={classes.dFlex}>
						<Typography className={clsx(classes.f18, classes.bold, classes.pe15)}>
							{t("WhatsappOnBoarding.message")}:
						</Typography>
						<Typography className={classes.f18}>
							{vnumber.ReplyText}
						</Typography>
					</Box>
				</TableCell>
			</TableRow>
		)
	}

	const renderIncomingMessageRow = (vnumber: virtualNumbersCodeListInterface) => {
		return (
			<TableRow
				classes={rowStyle}
				className={clsx()}
				key={vnumber.VirtualNumber}
			>
				<TableCell
					classes={cellStyle}
					align='center'
					className={classes.flex1}>
					{vnumber.VirtualNumber}
				</TableCell>
				<TableCell
					classes={cellStyle}
					align='center'
					className={classes.flex2}>
					{vnumber.ReplyText}
				</TableCell>
				<TableCell
					classes={cellStyle}
					align='center'
					className={classes.flex1}>
					{moment(vnumber.ReplyDate).format(DateFormats.DATE_TIME_24)}
				</TableCell>
			</TableRow>
		)
	}

	const renderBusinessDetails = () => {
		if (businessInfo.name === '') return <></>;

		return (
			<>
				<Typography className={clsx(classes.semibold, classes.f22, classes.pb10)}>{t('WhatsappOnBoarding.businessStatus')}</Typography>
				<TableContainer className={clsx(classes.tableStyle, classes.mb20)}>
					<Table className={classes.tableContainer}>
						<TableHead>
							<TableRow classes={rowStyle}>
								<TableCell classes={cellStyle} className={classes.flex1} align='center'>{t('WhatsappOnBoarding.businessName')}</TableCell>
								<TableCell classes={cellStyle} className={classes.flex1} align='center'>{t('WhatsappOnBoarding.status')}</TableCell>
							</TableRow>
						</TableHead>
						<Box className='tableBodyContainer'>
							<TableBody>
								<TableRow
									classes={rowStyle}
									className={clsx()}
								>
									<TableCell
										classes={cellStyle}
										align='center'
										className={classes.flex1}>
										{businessInfo?.name}
									</TableCell>
									<TableCell
										classes={cellStyle}
										align='center'
										className={classes.flex1}>
										{
											businessInfo?.business_verification_status !== WHATSAPP_ONBOARDING_STATUS.BUSINESS_VERIFIED
												? businessInfo?.business_verification_status
												: (
													<Badge color="primary" variant="dot" anchorOrigin={{ vertical: 'top', horizontal: 'left' }} className={clsx(classes.connectedDot, classes.textCapitalize)}>
														{businessInfo?.business_verification_status}
													</Badge>
												)
										}
									</TableCell>
								</TableRow>
							</TableBody>
						</Box>
					</Table>
				</TableContainer>
			</>
		)
	}

	const metaPhoneRegister = async () => {
		if (pin.length < 6) {
			setErrors({
				...errors,
				pin: t('WhatsappOnBoarding.enterValidPIN')
			})
		} else {
			const { data } = dialogType || {}
			const resp = await dispatch(MetaPhoneRegister({
				PhoneNumberId: get(data, 'id', ''),
				Pin: pin
			})) as any;
			handleMetaPhoneRegisterResponse(resp?.payload as PulseemResponse);
		}
	}

	const handleMetaPhoneRegisterResponse = (response: any) => {
		const { StatusCode, Data: {
			success, error
		} } = response;
		if (StatusCode === 1) {
			setDialogType(null)
			setErrors({
				...errors,
				pin: '',
				pinError: '',
			})
			setToastMessage({
				...successToastData,
				message: t('WhatsappOnBoarding.phoneNumberRegistered')
			});
			fetchMetaPhoneNumbers();
		} else {
			setErrors({
				...errors,
				pinError: (StatusCode >= 3 && StatusCode <= 8 || StatusCode === 100) ? t(`WhatsappOnBoarding.SaveWhatsappMetaClientsResponseCode.${StatusCode}`) : get(error, 'error_user_msg', t('common.Error'))
			})
		}
	}

	const OTPDialog = () => {
		return {
			title: t('WhatsappOnBoarding.enterPin'),
			showDivider: true,
			icon: (
				<div className={clsx(classes.dialogIconContent, 'unicode')}>
					{'\uE11B'}
				</div>
			),
			content: (
				<Box style={{ maxWidth: 400 }} className={clsx(classes.mb20)}>
					<Typography title={t("WhatsappOnBoarding.pin")} className={classes.bold}>
						{t("WhatsappOnBoarding.pin")}
					</Typography>
					<TextField
						autoFocus
						label=""
						variant="outlined"
						name={'pin'}
						value={pin}
						className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField)}
						autoComplete="off"
						onChange={(e: any) => setPin(IsValidPhoneNumberKeyPress(e.target.value) ? e.target.value : '')}
						inputProps={{ maxlength: 6 }}
					/>
					<Box className='textBoxWrapper'>
						<Typography className={clsx(errors.pin ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
							{errors.pin}
						</Typography>
					</Box>

					{
						errors.pinError && (
							<Box className='textBoxWrapper'>
								<Typography className={clsx(classes.errorText, classes.f16, classes.txtCenter, classes.pt20)}>
									{errors.pinError}
								</Typography>
							</Box>
						)
					}
				</Box>
			),
			showDefaultButtons: true,
			confirmText: t("WhatsappOnBoarding.registerPIN"),
			onClose: () => { setDialogType(null) },
			onConfirm: () => metaPhoneRegister()
		}
	}

	return (
		<DefaultScreen
			key="onboarding"
			subPage={'onboarding'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={false}
			containerClass={clsx(classes.management, classes.mb50, classes.whatsapp)}>
			<Box className={'topSection'}>
				<Title Text={t('WhatsappOnBoarding.title')} classes={classes} />
				{
					WhatsAppPlatformID !== WhatsAppPlatformIDEnum.TWILLIO ? (
						<>
							<Box className={clsx(classes.p20)}>
								<Box className={clsx(classes.dFlex)} style={{ gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
									<button
										// @ts-ignore
										onClick={() => launchWhatsAppSignup(false)}
										style={{
											backgroundColor: '#1877f2',
											border: '0',
											borderRadius: '4px',
											color: '#fff',
											cursor: 'pointer',
											fontFamily: 'Helvetica, Arial, sans-serif',
											fontSize: '16px',
											fontWeight: 'bold',
											height: '40px',
											padding: '0 24px',
										}}
									>
										{t('WhatsappOnBoarding.loginWithFacebook')}
									</button>
									<button
										// @ts-ignore
										onClick={() => launchWhatsAppSignup(true)}
										style={{
											backgroundColor: '#42b72a',
											border: '0',
											borderRadius: '4px',
											color: '#fff',
											cursor: 'pointer',
											fontFamily: 'Helvetica, Arial, sans-serif',
											fontSize: '16px',
											fontWeight: 'bold',
											height: '40px',
											padding: '0 24px',
										}}
									>
										{t('WhatsappOnBoarding.loginWithFacebookCoexistence')}
									</button>
								</Box>

								<Typography className={clsx(classes.f22, classes.pt10, classes.semibold)}>{t('WhatsappOnBoarding.instruction')}</Typography>
								<ul className={clsx(classes.mt1, classes.noPadding)}>
									<li className={clsx(classes.pb10)}>1. {RenderHtml(t('WhatsappOnBoarding.instruction_step_1'))}</li>
									<li className={clsx(classes.pb10)}>2. {t('WhatsappOnBoarding.instruction_step_2')}</li>
									<li className={clsx(classes.pb10)}>3. {t('WhatsappOnBoarding.instruction_step_3')}</li>
									<li className={clsx(classes.pb10)}>4. {t('WhatsappOnBoarding.instruction_step_4')}</li>
									<li className={clsx(classes.pb10)}>5. {t('WhatsappOnBoarding.instruction_step_5')}</li>
									<li className={clsx(classes.pb10)}>6. {t('WhatsappOnBoarding.instruction_step_6')}</li>
								</ul>
							</Box>

							<Box className={clsx(classes.p20)}>
								<Grid container spacing={3}>
									{/* Row 1: business account verification (left) beside the WhatsApp numbers table (right) */}
									<Grid item md={6} sm={12} xs={12}>
										{renderBusinessDetails()}
									</Grid>
									<Grid item md={6} sm={12} xs={12}>
										{
											phoneNumbers.length > 0 && (
												<Box>
													{renderPhoneNumbersTable()}
												</Box>
											)
										}
									</Grid>
									{/* Row 2 */}
									<Grid item md={6} sm={12} xs={12}>
										{renderVirtualNumbers()}
									</Grid>
									<Grid item md={6} sm={12} xs={12}>
										<Box>
											{renderIncomingMessages()}
										</Box>
									</Grid>
								</Grid>
							</Box>
						</>
					) : (
						<Box className={clsx(windowSize !== 'xs' ? classes.w30 : null)} style={{ margin: 'auto' }}>
							<NoSetup classes={classes} customMessage={t('WhatsappOnBoarding.NoMeta')} />
						</Box>
					)
				}
			</Box>

			{renderToast()}
			{renderDialog()}
			<Loader isOpen={isLoader} showBackdrop={true} />
		</DefaultScreen>
	);
};
export default WhatsappOnBoarding;
