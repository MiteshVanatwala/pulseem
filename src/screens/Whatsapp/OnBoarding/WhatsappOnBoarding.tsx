import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { ClassesType } from '../../Classes.types';
import DefaultScreen from '../../DefaultScreen';
import {
	coreProps,
	toastProps,
} from '../Editor/Types/WhatsappCreator.types';
import { useEffect, useState } from 'react';
import { Loader } from '../../../components/Loader/Loader';
import Toast from '../../../components/Toast/Toast.component';
import NoSetup from '../NoSetup/NoSetup';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { apiStatus, errorToastData, resetToastData, successToastData, WHATSAPP_ONBOARDING_STATUS } from '../Constant';
import { userPhoneNumbers } from '../../../redux/reducers/whatsappSlice';
import { phoneNumberAPIProps } from '../Campaign/Types/WhatsappCampaign.types';
import { Badge, Box, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@material-ui/core';
import { Title } from '../../../components/managment/Title';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';
import { facebookLogin, getMetaPhoneNumbers, getWhatsAppCodeVirtualNumbers, getWhatsAppSMSVirtualNumbers, MetaPhoneRegister } from '../../../redux/reducers/whatsappOnBoardingSlice';
import { PulseemResponse } from '../../../Models/APIResponse';
import { flatten, get } from 'lodash';
import { IsValidPhoneNumberKeyPress } from '../../../helpers/Utils/Validations';
import { DialogTypeInterface } from '../../../Models/Common';
import { businessInfoInterface, phoneNumbersInterface, virtualNumbersCodeListInterface, virtualNumbersInterface } from '../../../Models/Whatsapp/WhatsappOnboarding';

const WhatsappOnBoarding = ({ classes }: ClassesType) => {
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const { windowSize  } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const [isAccountSetup, setIsAccountSetup] = useState<boolean>(false);
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
		pin?: string
	}>({
		pin: ''
	});

  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot }
  
	useEffect(() => {
		(async () => {
			setIsLoader(true);
			const { payload: phoneNumberData }: phoneNumberAPIProps =
				await dispatch<any>(userPhoneNumbers());
			if (
				phoneNumberData?.Status === apiStatus.SUCCESS &&
				phoneNumberData?.Data &&
				phoneNumberData?.Data?.length > 0
			) {
				setIsLoader(false);
				setIsAccountSetup(true);
				fetchMetaPhoneNumbers();
				fetchWhatsAppSMSVirtualNumbers();
				fetchWhatsAppCodeVirtualNumbers();
			} else {
				setIsLoader(false);
				setIsAccountSetup(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const fetchMetaPhoneNumbers = async () => {
		const resp = await dispatch(getMetaPhoneNumbers({})) as any;
		console.log('getMetaPhoneNumbers');
		console.log(resp);
		handleMetaPhoneNumberResponse(resp?.payload as PulseemResponse)
	}

	const fetchWhatsAppSMSVirtualNumbers = async () => {
		const resp = await dispatch(getWhatsAppSMSVirtualNumbers()) as any;
		console.log('getWhatsAppSMSVirtualNumbers');
		console.log(resp);
		const { StatusCode, Data } = resp?.payload as PulseemResponse
		if (StatusCode === 1) {
			setVirtualNumbers(flatten(Data));
		}
	}
	
	const fetchWhatsAppCodeVirtualNumbers = async () => {
		const resp = await dispatch(getWhatsAppCodeVirtualNumbers()) as any;
		console.log('getWhatsAppCodeVirtualNumbers');
		console.log(resp);
		const { StatusCode, Data } = resp?.payload as PulseemResponse
		if (StatusCode === 1) {
			setVirtualNumbersCodeList(flatten(Data));
		}
	}
	
	const handleMetaPhoneNumberResponse = (response: PulseemResponse) => {
		const { StatusCode, Data: {
			businessInfo, phoneNumbers
		} } = response;
		if (StatusCode === 0) {
			setBusinessInfo(businessInfo);
			setPhoneNumbers(phoneNumbers);
		}
	}

	const loadFacebookSDK = () => {
		// @ts-ignore
		window.fbAsyncInit = function() {
			// @ts-ignore
			window.FB.init({
				appId: '8512543772102886',
				autoLogAppEvents: true,
				xfbml: true,
				version: 'v21.0',
			});
		};

		const script = document.createElement('script');
		script.src = 'https://connect.facebook.net/en_US/sdk.js';
		script.async = true;
		script.defer = true;
		script.crossOrigin = 'anonymous';
		document.body.appendChild(script);

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
			console.log('handleMessage');
			console.log(data);
      if (data.type === 'WA_EMBEDDED_SIGNUP') {
        if (data.event === 'FINISH') {
          const { phone_number_id, waba_id } = data.data;
          console.log("Phone number ID ", phone_number_id, " WhatsApp business account ID ", waba_id);
          const resp = await dispatch(facebookLogin({
            phone_number_id,
            waba_id,
            code: window.localStorage.getItem('fblogin_authcode')
          }));
					console.log('facebookLogin')
					console.log(resp)
        } else if (data.event === 'CANCEL') {
          const { current_step } = data.data;
          console.warn("Cancel at ", current_step);
        } else if (data.event === 'ERROR') {
          const { error_message } = data.data;
          console.error("error ", error_message);
        }
      }
    } catch (error) {
      console.log('Non JSON Responses', event.data);
    }
  };
 
  const fbLoginCallback = (response: any) => {
		console.log('fbLoginCallback');
		console.log(response);
    if (response.authResponse) {
      const code = response.authResponse.code;
      console.log(`Code : ${code}`)
      window.localStorage.setItem('fblogin_authcode', code);
      // The returned code must be transmitted to your backend first and then
      // perform a server-to-server call from there to our servers for an access token.
    }
  };

	const launchWhatsAppSignup = () => {
    // @ts-ignore
    window?.FB?.login(fbLoginCallback, {
      config_id: '1240808773727236', // configuration ID goes here
      response_type: 'code', // must be set to 'code' for System User access token
      override_default_response_type: true, // when true, any response types passed in the "response_type" will take precedence over the default types
      extras: {
        setup: {},
        featureType: '',
        sessionInfoVersion: '2',
      },
    });
  };

	const renderPhoneNumbersTableBody = () => {
    return (
      <Box className='tableBodyContainer'>
        <TableBody>
          {phoneNumbers.map((item: phoneNumbersInterface) => windowSize === 'xs' ? renderPhoneNumbersPhoneRow(item) : renderPhoneNumbersRow(item))}
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
          </TableCell>
        </TableRow>
      </>
    )
  }

	const renderPhoneNumberStatus = (row: phoneNumbersInterface) => {
		return (
			<>
				{
					row?.status !== WHATSAPP_ONBOARDING_STATUS.CONNECTED
					? row?.status?.toLowerCase()
					: (
						<Badge color="primary" variant="dot" anchorOrigin={{vertical: 'top', horizontal: 'left'}} className={clsx(classes.connectedDot)}>
							{row?.status?.toLowerCase()}
						</Badge>
					)
				}
				{
					row?.status !== WHATSAPP_ONBOARDING_STATUS.CONNECTED && (
						<Button
							onClick={() => setDialogType({ type: 'OTP', data: row })}
							className={clsx(classes.searchButton, classes.btn, classes.btnRounded, classes.ml10)}
						>
							{t('Connect')}
						</Button>
					)
				}
			</>
		)
	}

	const renderPhoneNumbersRow = (row: phoneNumbersInterface) => {
    return (
			<TableRow
				key={row.id}
				classes={rowStyle}
				className={clsx()}
			>
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
						{row?.display_phone_number}
				</TableCell>
				<TableCell
					classes={cellStyle}
					align='center'
					className={clsx(classes.flex2, classes.dInlineBlock, classes.textCapitalize)}>
						{renderPhoneNumberStatus(row)}
				</TableCell>
			</TableRow>
    )
  }

	const renderPhoneNumbersTable = () => {
    return (
			<>
				<Typography className={clsx(classes.semibold, classes.f22, classes.pb10)}>{t('WhatsappOnBoarding.phoneNumberList')}</Typography>
				<TableContainer className={classes.tableStyle}>
					<Table className={classes.tableContainer}>
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
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('WhatsappOnBoarding.ID')}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('WhatsappOnBoarding.phoneNumber')}</TableCell>
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
				<TableContainer className={clsx(classes.tableStyle, windowSize !== 'xs' ? classes.w50 : classes.w100)}>
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
			</TableRow>
		)
	}

	const renderBusinessDetails = () => {
		if (businessInfo.name === '') return <></>;

		return (
			<>
				<Typography className={clsx(classes.semibold, classes.f22, classes.pb10)}>{t('WhatsappOnBoarding.businessStatus')}</Typography>
				<TableContainer className={classes.tableStyle}>
					<Table className={classes.tableContainer}>
						<TableHead>
							<TableRow classes={rowStyle}>
								<TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('WhatsappOnBoarding.businessName')}</TableCell>
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
										className={classes.flex2}>
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
													<Badge color="primary" variant="dot" anchorOrigin={{vertical: 'top', horizontal: 'left'}} className={clsx(classes.connectedDot, classes.textCapitalize)}>
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
			console.log('MetaPhoneRegister');
			console.log(resp);
			handleMetaPhoneRegisterResponse(resp?.payload as PulseemResponse);
		}
	}

	const handleMetaPhoneRegisterResponse = (response: any) => {
		const { Data: {
			success, error
		} } = response;
		if (success === true) {
			setDialogType(null)
			setErrors({
				...errors,
				pin: ''
			})
			setToastMessage({
				...successToastData,
				message: t('WhatsappOnBoarding.phoneNumberRegistered')
			});
			fetchMetaPhoneNumbers();
		} else {
			setToastMessage({
				...errorToastData,
				message: get(error, 'message', t('common.Error'))
			});
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
        </Box>
      ),
      showDefaultButtons: true,
			confirmText: t("WhatsappOnBoarding.registerPIN"),
      onClose: () => { setDialogType(null) },
      onConfirm: () => metaPhoneRegister()
    }
  }

	loadFacebookSDK();

	return (
		<DefaultScreen
			subPage={'manage'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={false}
			containerClass={clsx(classes.management, classes.mb50, classes.whatsapp)}>
			{isAccountSetup && (
				<Box className={'topSection'}>
					<Title Text={t('WhatsappOnBoarding.title')} classes={classes} />
					<Box className={clsx(classes.p20)}>
						<button
							onClick={launchWhatsAppSignup}
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
							<Grid item md={6} sm={12} xs={12}>
								{renderBusinessDetails()}
								{
									phoneNumbers.length > 0 && (
										<Box className={clsx(classes.pt20)}>
											{renderPhoneNumbersTable()}
										</Box>
									)
								}
							</Grid>
							<Grid item md={6} sm={12} xs={12}>
								{renderVirtualNumbers()}
								<Box className={clsx(classes.pt20)}>
									{renderIncomingMessages()}
								</Box>
							</Grid>
						</Grid>
					</Box>
				</Box>
			)}
			{!isAccountSetup && (
				!isLoader && <NoSetup classes={classes} />
			)}

			{renderToast()}
			{renderDialog()}
			<Loader isOpen={isLoader} showBackdrop={true} />
		</DefaultScreen>
	);
};

export default WhatsappOnBoarding;
