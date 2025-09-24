import { ClassesType } from '../../Classes.types';
import DefaultScreen from '../../DefaultScreen';
import { Grid, Box, Typography } from '@material-ui/core';
import {
	APICreateGroupData,
	ApiCreateGroupPayload,
	ApiSaveCampaignSettingsData,
	ApiSaveCampaignSettings,
	ApiSendCampaign,
	campaignSettingsData,
	campaignSettingsPayloadData,
	createCombinedGroupData,
	gropListAPIProps,
	selectedFilterCampaignsProps,
	smsReducerProps,
	specialDateDropDownData,
	testGroupDataProps,
	uploadClientDataPayload,
	uploadClientData,
	uploadData,
	whatsappCampaignNameFilterData,
	whatsappCampaignNameFilterPayloadData,
	WhatsappCampaignSecondProps,
	ApiGetCampaignSummary,
	ApiGetCampaignSummaryPayloadData,
	phoneNumberAPIProps,
	GetTestGroups,
	ApiSendCampaignData,
	coreProps,
} from './Types/WhatsappCampaign.types';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import RightPane from './Components/RightPane';
import LeftPane from './Components/LeftPane';
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import SummaryModal from './Popups/SummaryModal';
import Buttons from './Components/Buttons';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import moment from 'moment';
import Toast from '../../../components/Toast/Toast.component';
import {
	addRecipient,
	addRecipients,
	createCombinedGroup,
	createGroup,
	deleteCampaign,
	getAccountExtraData,
	getAllGroups,
	getCampaignSettings,
	getWhatsAppCampaignSummary,
	getWhatsappCampaignNameFilter,
	saveCampaignSettings,
	sendCampaign,
	userPhoneNumbers,
} from '../../../redux/reducers/whatsappSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '../../../components/Loader/Loader';
import {
	apiStatus,
	buttons,
	resetToastData,
	tabs,
	whatsappRoutes,
} from '../Constant';
import { getTestGroups } from '../../../redux/reducers/smsSlice';
import {
	commonAPIResponseProps,
	toastProps,
} from '../Editor/Types/WhatsappCreator.types';
import { useNavigate, useParams } from 'react-router-dom';
import SendCampaignSuccess from './Popups/SendCampaignSuccess';
import NoSetup from '../NoSetup/NoSetup';
import { specialDateDropDownPayload } from './Types/WhatsappCampaign.types';
import { Title } from '../../../components/managment/Title';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { sitePrefix } from '../../../config';
import { SelectChangeEvent, Stack } from '@mui/material';
import ConfirmationButtons from '../../../components/ConfirmationButtons/ConfirmationButtons';
import { DateFormats } from '../../../helpers/Constants';
import Pulse from '../../../components/Pulse/Pulse';

const SendCampaign = ({
	classes,
}: ClassesType & WhatsappCampaignSecondProps) => {
	const { t: translator } = useTranslation();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const queryParams = new URLSearchParams(window.location.search)
	let FromAutomation = queryParams.get("FromAutomation") || false
	if (FromAutomation === 'false') FromAutomation = false;
	const NodeToEdit = queryParams.get("NodeToEdit") || false
	let isSendCampaign = queryParams.get("new") || false
	if (isSendCampaign === 'false') isSendCampaign = false;

	const { campaignID } = useParams();
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	const { testGroups: testGroupList } = useSelector(
		(state: { sms: smsReducerProps }) => state.sms
	);
	const ToastMessages = useSelector(
		(state: { whatsapp: { ToastMessages: toastProps } }) =>
			state.whatsapp.ToastMessages
	);

	const [showTestGroups, setShowTestGroups] = useState<boolean>(false);
	const [selectedGroups, setSelectedGroups] = useState<testGroupDataProps[]>(
		[]
	);
	const [selectedFilterCampaigns, setFilterCampaigns] = useState<
		selectedFilterCampaignsProps[]
	>([]);
	const [selectedFilterGroups, setFilterGroups] = useState<
		testGroupDataProps[]
	>([]);
	const [sendDate, handleSendDate] = useState<MaterialUiPickersDate | null>(
		null
	);
	const [sendTime, setsendTime] = useState<MaterialUiPickersDate | null>(null);
	const [sendType, setSendType] = useState<string>('1');
	const [model, setModel] = useState<{}>({ ID: 0 });
	const [isSpecialDateBefore, setIsSpecialDateBefore] = useState<boolean>(true);
	const [timePickerOpen, setTimePickerOpen] = useState<boolean>(false);
	const [toastMessage, setToastMessage] =
		useState<toastProps['SUCCESS']>(resetToastData);
	const [daysBeforeAfter, setdaysBeforeAfter] = useState<string>('');
	const [spectialDateFieldID, setDateFieldID] = useState<string>('0');
	const [newGroupName, setNewGroupName] = useState<string>('');

	const [activeTab, setActiveTab] = useState<'group' | 'manual'>(tabs.GROUP);
	const [groupSendValidationErrors, setGroupSendValidationErrors] = useState<
		string[]
	>([]);
	const [isAccountSetup, setIsAccountSetup] = useState<boolean | null>(null);
	const [isLoader, setIsLoader] = useState<boolean>(true);
	const [isCreateNewGroup, setIsCreateNewGroup] = useState<boolean>(false);

	const [allGroupList, setAllGroupList] = useState<testGroupDataProps[]>([]);
	const [exceptionalDaysToggle, setExceptionalDaysToggle] =
		useState<boolean>(false);
	const [exceptionalDays, setExceptionalDays] = useState<string>('');
	const [randomlyCount, setRandomlyCount] = useState<string>('');

	const [specialDatedropDown, setSpecialDatedropDown] =
		useState<specialDateDropDownPayload>();
	const [finishedCampaigns, setFinishedCampaigns] = useState<
		selectedFilterCampaignsProps[]
	>([]);
	const [campaignSummary, setCampaignSummary] =
		useState<ApiGetCampaignSummaryPayloadData>();
	const [dialogType, setDialogType] = useState<any>({
		type: '',
		data: ''
	});
	
	const [ pulseData, setPulseData ] = useState({
		pulseSettingsId: 0,
		pulseAmount: 0,
		timeInterval: 0,
		pulseType: 2,
		random: 0,
		timeType: 1,
		pulsePer: "recipients",
		pulseReci: "",
		minName: "mins",
		hourName: "Hours",
		togglePulse: false,
		toggleRandom: false,
		pulsesOpen: false
	});
	
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
				/**
				 * testGroupList is for fetching all test groups across the platform
				 * Here testGroupList is we are taking from existing code and we don't
				 * know what is the initial value that is the reason we kept it here in
				 * if condition
				 */
				checkCampaignID();
				if (!testGroupList || testGroupList?.length === 0) {
					await dispatch(getTestGroups());
				}
				/**
				 * getApiGroupsData is for fetching all groups across the platform
				 */
				(async () => {
					setIsLoader(true);
					const groupsData = await getApiGroupsData();
					const campaignsData = await getFilterCampaign();
					getSpecialDateDropDown();
					getCampaignSettingData(groupsData, campaignsData);
				})();
				setIsAccountSetup(true);
			} else {
				setIsLoader(false);
				setIsAccountSetup(false);
			}
		})();
		/**
		 * we disable it because we want to run this code only when component loads
		 */
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const checkCampaignID = () => {
		if (!campaignID) {
			navigate(whatsappRoutes.CREATE_CAMPAIGN_PAGE1);
		}
	};

	const getFilterCampaign = async () => {
		if (campaignID) {
			const {
				payload: whatsappCampaignNameFilterData,
			}: whatsappCampaignNameFilterData = await dispatch<any>(
				getWhatsappCampaignNameFilter(campaignID)
			);
			if (whatsappCampaignNameFilterData?.Status === apiStatus.SUCCESS) {
				setFinishedCampaigns(whatsappCampaignNameFilterData?.Data);
				return whatsappCampaignNameFilterData?.Data;
			}
			return [];
		}
	};

	const getSpecialDateDropDown = async () => {
		const { payload: specialDateDropDownData }: specialDateDropDownData =
			await dispatch<any>(getAccountExtraData());
		setSpecialDatedropDown(specialDateDropDownData);
		// if (specialDateDropDownData) {
		// 	let finalDropDownData: string[] = [];
		// 	Object.keys(specialDateDropDownData)?.forEach((specialDayKey) => {
		// 		if (
		// 			specialDayKey?.toLowerCase()?.includes('extradate') &&
		// 			specialDateDropDownData[specialDayKey]?.length > 0
		// 		) {
		// 			finalDropDownData.push(specialDateDropDownData[specialDayKey]);
		// 		}
		// 	});
		// 	setSpecialDatedropDown(finalDropDownData);
		// }
	};

	const setSendSetting = (
		SendTypeID: number,
		FutureDateTime: string | null,
		SpecialSettings: campaignSettingsPayloadData['SpecialSettings']
	) => {
		if (SendTypeID === 2 && FutureDateTime) {
			handleSendDate(moment(FutureDateTime));
		} else if (SendTypeID === 3 && SpecialSettings) {
			setdaysBeforeAfter(SpecialSettings?.Day?.toString() || '');
			setsendTime(moment(SpecialSettings?.SendHour));
			setIsSpecialDateBefore(
				SpecialSettings?.IntervalTypeID === -1 ? true : false
			);
			setDateFieldID(SpecialSettings?.DateFieldID?.toString() || '0');
		}
	};

	const getCampaignSettingData = async (
		groupsData: testGroupDataProps[] | undefined,
		campaignsData: whatsappCampaignNameFilterPayloadData[] | undefined
	) => {
		if (campaignID) {
			const { payload: campaignSettings }: campaignSettingsData =
				await dispatch<any>(getCampaignSettings(campaignID));
			setIsLoader(false);
			let apiGroups = campaignSettings?.Data?.Groups;
			let apiFilterGroups = campaignSettings?.Data?.SendExeptional?.Groups;
			let apiFilterCampaigns =
				campaignSettings?.Data?.SendExeptional?.Campaigns;
			let SendTypeID = campaignSettings?.Data?.SendTypeID;
			if (SendTypeID === 1 || SendTypeID === 2 || SendTypeID === 3) {
				setSendType(campaignSettings?.Data?.SendTypeID?.toString());
			} else {
				setSendType('1');
			}
			setSendSetting(
				campaignSettings?.Data?.SendTypeID,
				campaignSettings?.Data?.FutureDateTime,
				campaignSettings?.Data?.SpecialSettings
			);
			if (groupsData) {
				let testGroups = testGroupList;
				// Will select from normal group
				let updateSelectedGroups = groupsData?.filter((groupData) =>
					apiGroups?.includes(Number(groupData?.GroupID))
				);
				// will fetch test group if not available
				if (!testGroupList || testGroupList?.length === 0) {
					const { payload: updatedtestGroups }: GetTestGroups =
						await dispatch<any>(getTestGroups());
					if (updatedtestGroups?.length > 0) {
						testGroups = updatedtestGroups;
					}
				}
				// Will select from test group
				let updateSelectedTestGroups = testGroups?.filter((groupData) => {
					if (apiGroups?.includes(Number(groupData?.GroupID))) {
						setShowTestGroups(true);
					}
					return apiGroups?.includes(Number(groupData?.GroupID));
				});
				setSelectedGroups([
					...updateSelectedGroups,
					...updateSelectedTestGroups,
				]);
				setFilterGroups(
					groupsData?.filter((groupData) =>
						apiFilterGroups?.includes(Number(groupData?.GroupID))
					)
				);
			}
			if (campaignsData) {
				setFilterCampaigns(
					campaignsData?.filter((campaign) =>
						apiFilterCampaigns?.includes(Number(campaign?.WACampaignID))
					)
				);
			}
			if (campaignSettings?.Data?.SendExeptional?.ExceptionalDays) {
				setExceptionalDays(
					campaignSettings?.Data?.SendExeptional?.ExceptionalDays?.toString()
				);
				setExceptionalDaysToggle(true);
			}

			const {
				PulseSettings,
				RandomSettings
			} = campaignSettings?.Data;
			if (PulseSettings !== null && RandomSettings !== null) {
				setPulseData({
					pulseSettingsId: PulseSettings?.PulseSettingsId || 0,
					pulseAmount: PulseSettings?.PulseAmount || 0,
					timeInterval: PulseSettings?.TimeInterval || 0,
					pulseType: PulseSettings?.PulseType || 0,
					random: RandomSettings?.RandomAmount || 0,
					timeType: PulseSettings?.TimeType || 0,
					pulsePer: PulseSettings?.PulseType === 2 ? "recipients" : "percent",
					pulseReci: PulseSettings?.PulseType === 2 ? "Recipients" : "",
					minName: PulseSettings?.TimeType === 1 ? "mins" : "",
					hourName: PulseSettings?.TimeType === 2 ? "Hours" : "",
					togglePulse: PulseSettings?.PulseSettingsId !== -1 ? true : false,
					toggleRandom: RandomSettings?.RandomAmount !== 0 ? true : false,
					pulsesOpen: false
				})
			}
		}
	};

	const handleDatePicker = (value: MaterialUiPickersDate | null) => {
		handleSendDate(moment(value));
	};

	const handleRadioTime = (value: MaterialUiPickersDate | null) => {
		setsendTime(value);
	};

	const handleSendType = (event: BaseSyntheticEvent) => {
		if (event.target.value === '1') {
			setModel({ ...model, SendDate: null });
			handleSendDate(null);
		} else if (event.target.value === '3') {
			setModel({ ...model, SendDate: null });
			handleSendDate(null);
		}
		setSendType(event.target.value);
	};

	const handleTimePicker = (value: MaterialUiPickersDate | null) => {
		let date = moment(sendDate);
		let time = moment(value, 'HH:mm');

		date.set({
			hour: time.get('hour'),
			minute: time.get('minute'),
		});

		if (date < moment()) {
			date = moment();
			setToastMessage(ToastMessages.DATE_PASS);
		}

		handleSendDate(date);
		setTimePickerOpen(false);
	};

	const handleSpecialDayChange = (e: BaseSyntheticEvent) => {
		const re = /^[0-9\b]+$/;
		if (
			(e.target.value === '' || re.test(e.target.value)) &&
			Number(e.target.value <= 999)
		) {
			setdaysBeforeAfter(e.target.value);
		}
	};

	const handleSelectChange = (e: SelectChangeEvent) => {
		if (e.target.value === '0') {
			setDateFieldID('0');
		} else {
			setDateFieldID(e.target.value);
		}
	};

	const onCampaignSave = async (
		showMessage: boolean = true,
		isLoading: boolean = false,
		isValidate: boolean = true,
		ApiSelectedGroups: testGroupDataProps[] = selectedGroups
	) => {
		if (isValidate === true ? validateSendSetting() : true) {
			let saveCampaignSettingsPayload: ApiSaveCampaignSettingsData = {
				WACampaignID: Number(campaignID),
				SendTypeID: Number(sendType),
				Groups: ApiSelectedGroups?.map((group) => group.GroupID),
				SendExeptional: {
					IsExceptionalGroups: selectedFilterGroups?.length > 0 ? true : false,
					Groups: selectedFilterGroups?.map((group) => group.GroupID),
					IsExceptionSmsCampaigns:
						selectedFilterCampaigns?.length > 0 ? true : false,
					Campaigns: selectedFilterCampaigns?.map(
						(campaign) => campaign.WACampaignID
					),
					ExceptionalDays: exceptionalDaysToggle ? Number(exceptionalDays) : 0,
				},
				PulseSettings: {
					PulseSettingsId: pulseData.pulseSettingsId,
					PulseAmount: pulseData.pulseAmount,
					PulseType: pulseData.pulseType,
					TimeInterval: pulseData.timeInterval,
					TimeType: pulseData.timeType
				},
				RandomSettings: {
					RandomAmount: pulseData.random
				}
			};
			if (sendType === '2') {
				saveCampaignSettingsPayload['FutureDateTime'] = `${moment(sendDate)
					.locale('en')
					.format('YYYY-MM-DD hh:mm:ss a')}`;
			}
			if (sendType === '3') {
				saveCampaignSettingsPayload['specialsettings'] = {
					datefieldid: Number(spectialDateFieldID),
					day: Number(daysBeforeAfter),
					intervaltypeid: isSpecialDateBefore ? -1 : 1,
					sendhour: moment(sendTime).locale('en').format('YYYY-MM-DD hh:mm a'),
				};
			}
			isLoading && setIsLoader(true);
			const { payload: saveCampaignSettingData }: ApiSaveCampaignSettings =
				await dispatch<any>(saveCampaignSettings(saveCampaignSettingsPayload));
			setIsLoader(false);
			if (saveCampaignSettingData.Status === apiStatus.SUCCESS) {
				if (showMessage) {
					setToastMessage(ToastMessages.CAMPAIGN_SAVE_SUCCESS);
				}
				return saveCampaignSettingData?.Status;
			} else {
				saveCampaignSettingData?.Message
					? setToastMessage({
						...ToastMessages.ERROR,
						message: saveCampaignSettingData?.Message,
					})
					: setToastMessage(ToastMessages.ERROR);
				return apiStatus?.ERROR;
			}
		}
	};

	const onCampaignSend = async () => {
		if (validateSendSetting() && campaignID) {
			const saveCampaignData = await onCampaignSave(false, true, true);
			setIsLoader(true);
			let { payload: campaignSummaryData }: ApiGetCampaignSummary =
				await dispatch<any>(getWhatsAppCampaignSummary(campaignID));
			if (saveCampaignData === apiStatus.SUCCESS) {
				if (campaignSummaryData.Status === apiStatus.SUCCESS) {
					if (campaignSummaryData?.Data?.FinalCount > 0) {
						setCampaignSummary(campaignSummaryData?.Data);
						if (
							campaignSummaryData.Data.WhatsappTierID === 1 ||
							campaignSummaryData.Data.WhatsappTierID === 2 ||
							campaignSummaryData.Data.WhatsappTierID === 3
						) {
							if (
								campaignSummaryData?.Data?.WhatsappSmsLeft > 0 ||
								(sendType === '2' &&
									moment(sendDate).diff(moment(), 'seconds') > 86400) ||
								sendType === '3'
							) {
								setDialogType({
									type: 'summary'
								})
							} else {
								setDialogType({
									type: 'exceedDailyLimit'
								})
							}
						} else {
							setDialogType({
								type: 'summary'
							})
						}
					} else {
						setToastMessage({
							...ToastMessages.ERROR,
							message: translator('whatsappCampaign.noRecipient'),
						});
					}
				} else {
					campaignSummaryData?.Message
						? setToastMessage({
							...ToastMessages.ERROR,
							message: campaignSummaryData?.Message,
						})
						: setToastMessage(ToastMessages.ERROR);
				}
			}
		}
		setIsLoader(false);
	};

	const onDeleteCampaign = async () => {
		setDialogType({ type: '', data: '' })
		if (campaignID) {
			const deleteData: commonAPIResponseProps = await dispatch<any>(
				deleteCampaign(campaignID)
			);
			if (deleteData?.payload?.Status === apiStatus.SUCCESS) {
				setToastMessage(ToastMessages.DELETE_CAMPAIGN_SUCCESS);
				setTimeout(() => {
					navigate(whatsappRoutes.CAMPAIGN_MANAGEMENT);
				}, 1000);
			} else {
				deleteData?.payload?.Message
					? setToastMessage({
						...ToastMessages.ERROR,
						message: deleteData?.payload?.Message,
					})
					: setToastMessage(ToastMessages.ERROR);
			}
		}
	};

	const onFormButtonClick = async (buttonName: string) => {
		switch (buttonName) {
			case buttons.DELETE:
				setDialogType({
					type: 'delete'
				})
				break;
			case buttons.EXIT:
				setDialogType({
					type: 'exit'
				})
				break;
			case buttons.SAVE:
				onCampaignSave(true, true, true);
				break;
			case buttons.SEND:
				onCampaignSend();
				break;
			case buttons.CONTINUE:
				if (!!FromAutomation && !isSendCampaign) {
					const saveCampaignData = await onCampaignSave(true, true, true);
					if (saveCampaignData === apiStatus.SUCCESS) {
						window.location.href = `/Pulseem/CreateAutomations.aspx?AutomationID=${FromAutomation}&NodeToEdit=${NodeToEdit}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`
					}
				}
				break;

			default:
				break;
		}
	};

	const resetToast = () => {
		setToastMessage(resetToastData);
	};

	const renderToast = () => {
		if (toastMessage && toastMessage.message !== '') {
			setTimeout(() => {
				resetToast();
			}, 4000);
			return <Toast data={toastMessage} />;
		}
		return null;
	};

	const onNewGroupSave = async () => {
		if (newGroupName?.length > 0) {
			const combinedGroupPayload = {
				SubAccountID: 1,
				GroupName: newGroupName,
				GroupIds: selectedGroups?.map(
					(group: testGroupDataProps) => group.GroupID
				),
			};
			setIsLoader(true);
			const { payload: createdGroupData }: createCombinedGroupData =
				await dispatch<any>(createCombinedGroup(combinedGroupPayload));
			if (createdGroupData) {
				await getApiGroupsData();

				if (createdGroupData?.GroupID) {
					setSelectedGroups([createdGroupData]);
					setNewGroupName('');
					setIsCreateNewGroup(false);
				}
				await onCampaignSave(false, false, false, [createdGroupData]);
				setToastMessage(ToastMessages.GROUP_CREATED_SUCCESS);
			} else {
				setToastMessage(ToastMessages.ERROR);
			}
			setIsLoader(false);
		} else {
			setIsLoader(false);
			setGroupSendValidationErrors([
				translator('whatsappCampaign.groupNameRequired'),
			]);
			setDialogType({
				type: 'validation'
			})
		}
	};

	const onFilter = () => {
	};

	const getApiGroupsData = async () => {
		setIsLoader(true);
		const groupData: gropListAPIProps = await dispatch<any>(getAllGroups());
		if (groupData.meta?.requestStatus === 'fulfilled') {
			setAllGroupList(groupData.payload);
			return groupData.payload;
		} else {
			setAllGroupList([]);
			return [];
		}
	};

	const onManualUpload = async (
		groupName: string,
		uploadData: uploadData,
		uploadedAsFile: boolean
	) => {
		setIsLoader(true);
		let requestPayload: ApiCreateGroupPayload = {
			GroupName: groupName,
			IsTestGroup: false,
		};
		let uploadClientData: uploadClientData;
		const { payload: createGroupData }: APICreateGroupData =
			await dispatch<any>(createGroup(requestPayload));
		if (createGroupData?.StatusCode === 201 && createGroupData?.Message) {
			if (uploadedAsFile) {
				// If data is more than 5000 rows we will upload as single file
				// To upload data method will be **addRecipients**
				uploadClientData = await dispatch<any>(
					addRecipients({
						...uploadData,
						GroupIds: [Number(createGroupData?.Message)],
					})
				);
				setIsLoader(false);
			} else {
				// If data is less than 5000 rows we will upload data in format of JSON
				// To upload data method will be **addRecipient**
				uploadClientData = await dispatch<any>(
					addRecipient({
						...uploadData,
						GroupIds: [Number(createGroupData?.Message)],
					})
				);
				setIsLoader(false);
			}
			handleAddClientsResponse(
				uploadClientData?.payload,
				createGroupData?.Message
			);
		} else {
			setIsLoader(false);
			createGroupData?.Message
				? setToastMessage({
					...ToastMessages.ERROR,
					message: createGroupData?.Message,
				})
				: setToastMessage(ToastMessages.ERROR);
		}
	};

	const handleAddClientsResponse = async (
		res: uploadClientDataPayload,
		groupID: string
	) => {
		switch (res?.StatusCode) {
			case 201: {
				setToastMessage(ToastMessages.UPLOAD_CLIENT_DATA_SUCEESS);
				setActiveTab('group');
				setIsLoader(true);
				const latestGroups = await getApiGroupsData();
				const latestAddedGroup = latestGroups?.find(
					(group) => group.GroupID?.toString() === groupID
				);
				setIsLoader(false);
				if (latestAddedGroup) {
					setSelectedGroups([...selectedGroups, latestAddedGroup]);
					await onCampaignSave(false, false, false, [
						...selectedGroups,
						latestAddedGroup,
					]);
				}
				break;
			}
			case 401: {
				setToastMessage(ToastMessages.INVALID_API_MISSING_KEY);
				break;
			}
			case 200:
			case 500:
			default: {
				setToastMessage(ToastMessages.GENERAL_ERROR);
				break;
			}
		}
	};
	const validateSendSetting = () => {
		let isValidated: boolean = true;
		let validationErrors: string[] = [];
		if (selectedGroups?.length === 0) {
			validationErrors.push(translator('group.zeroSelected'));
			isValidated = false;
		}
		if (sendType === '1' || sendType === '2' || sendType === '3') {
			if (sendType === '1' && isValidated) {
				isValidated = true;
			}
			if (sendType === '2') {
				if (!sendDate) {
					validationErrors.push(translator('whatsappCampaign.timeAndDate'));
					isValidated = false;
				}
			}
			if (sendType === '3') {
				if (
					!sendTime ||
					daysBeforeAfter === '' ||
					spectialDateFieldID === '0'
				) {
					validationErrors?.push(translator('whatsappCampaign.timeAndDate'));
					isValidated = false;
				}
			}
		} else {
			validationErrors.push(translator('whatsappCampaign.timeAndDate'));
			isValidated = false;
		}
		if (!isValidated) {
			setGroupSendValidationErrors(validationErrors);
			setDialogType({
				type: 'validation'
			})
		}
		return isValidated;
	};

	const onSummarySend = async () => {
		setIsLoader(true);
		setDialogType({ type: '' });
		let sendCampaignPayload: ApiSendCampaignData = {
			WACampaignID: Number(campaignID),
		};
		if (Number(randomlyCount) > 0) {
			sendCampaignPayload.Random = Number(randomlyCount);
		}
		if (campaignID) {
			const { payload: sendCampaignData }: ApiSendCampaign =
				await dispatch<any>(sendCampaign(sendCampaignPayload));
			setIsLoader(false);
			if (sendCampaignData?.StatusCode === 927) {
				// WHATSAPP_CAMPAIGN_SEND
				setDialogType({ type: 'tier' })
			}
			else if (sendCampaignData?.Status === apiStatus.SUCCESS) {
				setDialogType({
					type: 'sendCampaignSuccess'
				});
				setRandomlyCount('');
			} else {
				sendCampaignData?.Message
					? setToastMessage({
						...ToastMessages.ERROR,
						message: sendCampaignData?.Message,
					})
					: setToastMessage(ToastMessages.ERROR);
			}
		}
	};

	const onExitCampaign = () => {
		if (FromAutomation) {
			window.location.href = `/Pulseem/CreateAutomations.aspx?AutomationID=${FromAutomation}&NodeToEdit=${NodeToEdit}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`
		} else {
			navigate(whatsappRoutes.CAMPAIGN_MANAGEMENT);
		}
	};

	const getExitDialog = () => ({
		title: translator('whatsappManagement.LeaveCampaignCreation'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{translator('whatsappManagement.LeaveCampaignCreationDesc')}
			</Typography>
		),
		renderButtons: () => <ConfirmationButtons
			classes={classes}
			onConfirm={async () => {
				await onCampaignSave(true, true, true);
				onExitCampaign();
			}}
			onCancel={() => {
				setDialogType({ type: '', data: '' });
				onExitCampaign();
			}}
		/>
	})

	const getDeleteDialog = () => ({
		title: translator('whatsapp.alertModal.DeleteText'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{translator('whatsapp.alertModal.DeleteTitle')}
			</Typography>
		),
		renderButtons: () => <ConfirmationButtons
			classes={classes}
			onConfirm={() => onDeleteCampaign()}
			onCancel={() => setDialogType({ type: '', data: '' })}
		/>
	})

	const getValidationDialog = () => ({
		title: translator('whatsappCampaign.sendValidation'),
		showDivider: false,
		content: (
			<ul className={clsx(classes.noMargin, classes.mb20)}>
				{groupSendValidationErrors?.map((requiredField: string, index: number) => (
					<li key={index} className={classes.validationAlertModalLi}>
						{requiredField}
					</li>
				))}
			</ul>
		),
		onConfirm: async () => {
			setDialogType({
				type: '',
				data: ''
			});
		}
	})

	const getExceedDailyLimit = () => ({
		title: translator('settings.accountSettings.actDetails.fields.exceedLimitMpdalMessage'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{`${translator('settings.accountSettings.actDetails.fields.exceedLimitMpdalTimeMessage')}
					${campaignSummary?.NextAvailableTime
						? moment(campaignSummary?.NextAvailableTime).format(DateFormats.DATE_TIME_24)
						: moment().add(1, 'd').format(DateFormats.DATE_TIME_24)
					}`}
			</Typography>
		),
		onConfirm: async () => {
			setDialogType({
				type: '',
				data: ''
			});
		}
	})

	const getSummary = () => ({
		title: translator('whatsappCampaign.summary'),
		showDivider: false,
		showDefaultButtons: false,
		content: (
			<SummaryModal
				classes={classes}
				campaignName={''}
				fromNumber={''}
				onSummaryModalClose={() => setDialogType({ type: '' })}
				onConfirmOrYes={onSummarySend}
				selectedGroups={selectedGroups}
				selectedFilterGroups={selectedFilterGroups}
				selectedFilterCampaigns={selectedFilterCampaigns}
				sendType={sendType}
				sendDate={sendDate}
				sendTime={sendTime}
				isSpecialDateBefore={isSpecialDateBefore}
				daysBeforeAfter={daysBeforeAfter}
				specialDatedropDown={specialDatedropDown}
				spectialDateFieldID={spectialDateFieldID}
				campaignSummary={campaignSummary}
				randomlyCount={randomlyCount}
				setRandomlyCount={setRandomlyCount}
				resetRandomCount={() => setRandomlyCount('')}
				pulseData={pulseData}
			/>
		),
		onConfirm: async () => {
			setDialogType({
				type: '',
				data: ''
			});
		}
	})

	const getSendCampaignSuccess = () => ({
		title: translator('campaigns.campaignIsOnItsWay'),
		showDivider: false,
		showDefaultButtons: false,
		content: (
			<SendCampaignSuccess
				classes={classes}
				isFromAutomation={!!FromAutomation}
				onBackToHome={() => navigate(`${sitePrefix}`)}
				onBackToCampaigns={() =>
					navigate(whatsappRoutes.CAMPAIGN_MANAGEMENT)
				}
				onBackToAutomation={() => window.location.href = `/Pulseem/CreateAutomations.aspx?AutomationID=${FromAutomation}&NodeToEdit=${NodeToEdit}&fromreact=true`}
			/>
		),
		onConfirm: async () => {
			setDialogType({ type: '' });
		}
	})

	const getTierValidationDialog = () => ({
		title: translator('billing.tier.permission'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				Tier Validation
			</Typography>
		)
	})

	const renderDialog = () => {
		const { type } = dialogType || {}
		let currentDialog: any = {};
		if (type === 'exit') {
			currentDialog = getExitDialog();
		} else if (type === 'validation') {
			currentDialog = getValidationDialog();
		} else if (type === 'delete') {
			currentDialog = getDeleteDialog();
		} else if (type === 'exceedDailyLimit') {
			currentDialog = getExceedDailyLimit();
		} else if (type === 'summary') {
			currentDialog = getSummary();
		} else if (type === 'sendCampaignSuccess') {
			currentDialog = getSendCampaignSuccess();
		} else if (type === 'tier') {
			currentDialog = getTierValidationDialog();
		}

		if (type) {
			return (
				dialogType && <BaseDialog
					classes={classes}
					open={dialogType}
					onCancel={() => setDialogType({})}
					onClose={() => setDialogType({})}
					renderButtons={currentDialog?.renderButtons || null}
					{...currentDialog}>
					{currentDialog?.content}
				</BaseDialog>
			)
		}
	}

	const renderSubHeader = () => {
		return (
				<Title
						Element={(
								<Box className='stepHead'>
										<Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} ml={1} >
												<span className={'stepTitle'}>
														{translator("mainReport.sendSetting")}
												</span>

										</Stack>
								</Box>
						)}
						classes={classes}
						isIcon={false}
						ContainerStyle={{
								padding: 0,
								minHeight: 42,
								height: 'auto',
								overflowY: 'hidden'
						}}
				/>
		)
	}

	return (
		<DefaultScreen
			subPage={'send2'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={true}
			containerClass={classes.editorCont}
		>
			{isAccountSetup ? (
				<Box className={"head"}>
					<Box className={clsx('topSection', classes.mb50)}>
						<Title
							Text={translator('whatsappCampaign.header')}
							classes={classes}
						/>
						<Box className={'containerBody'}>
							{renderSubHeader()}
							<Box className={clsx('bodyBlock', classes.pt20)}>
								<Grid container style={{ marginBottom: '40px' }}>
									<Grid item md={7} xs={12}>
										<LeftPane
											classes={classes}
											allGroupList={allGroupList}
											testGroupList={testGroupList}
											finishedCampaigns={finishedCampaigns}
											selectedGroups={selectedGroups}
											setSelected={setSelectedGroups}
											selectedFilterCampaigns={selectedFilterCampaigns}
											setFilterCampaigns={setFilterCampaigns}
											selectedFilterGroups={selectedFilterGroups}
											setFilterGroups={setFilterGroups}
											onNewGroupChange={setNewGroupName}
											newGroupName={newGroupName}
											onNewGroupSave={onNewGroupSave}
											activeTab={activeTab}
											setActiveTab={setActiveTab}
											onFilter={onFilter}
											isCreateNewGroup={isCreateNewGroup}
											setIsCreateNewGroup={setIsCreateNewGroup}
											onManualUpload={onManualUpload}
											exceptionalDaysToggle={exceptionalDaysToggle}
											exceptionalDays={exceptionalDays}
											setExceptionalDaysToggle={setExceptionalDaysToggle}
											setExceptionalDays={setExceptionalDays}
											showTestGroups={showTestGroups}
											setShowTestGroups={setShowTestGroups}
										/>
									</Grid>
									<Grid item md={1} xs={12}></Grid>
									<Grid item md={4} xs={12}>
										<RightPane
											classes={classes}
											handleDatePicker={handleDatePicker}
											sendDate={sendDate}
											sendTime={sendTime}
											handleRadioTime={handleRadioTime}
											sendType={sendType}
											handleSendType={handleSendType}
											timePickerOpen={timePickerOpen}
											handleTimePicker={handleTimePicker}
											daysBeforeAfter={daysBeforeAfter}
											handleSpecialDayChange={handleSpecialDayChange}
											spectialDateFieldID={spectialDateFieldID}
											handleSelectChange={handleSelectChange}
											isSpecialDateBefore={isSpecialDateBefore}
											setIsSpecialDateBefore={setIsSpecialDateBefore}
											specialDatedropDown={specialDatedropDown}
											selectedGroups={selectedGroups}
											pulseSendingOpen={() => setPulseData({ ...pulseData, pulsesOpen: true })}
											packetSending={
												pulseData.togglePulse ? <span style={{ marginBottom: "5px", marginTop: "5px" }}>
													{translator("smsReport.packetSend")} - {pulseData.pulseAmount} {pulseData.pulsePer === "" || pulseData.pulsePer === "recipients" ? translator("sms.recipients") : translator("common.Percent")} {" "}
													{translator("sms.every")} {pulseData.timeInterval} {pulseData.hourName === "" || pulseData.minName === "mins" ? translator("common.minutes") : translator("common.hours")}
												</span> : <></>
											}
											randomSending={
												pulseData.toggleRandom ?
													<span>{translator("smsReport.randomSend")} - {pulseData.random} {translator("smsReport.randomRecipients")}</span>
												: <></>
											}
										/>
									</Grid>
								</Grid>
							</Box>
							<Buttons
								classes={classes}
								onFormButtonClick={onFormButtonClick}
								displayBackButton={true}
								showSendButton={FromAutomation ? (!!FromAutomation && !isSendCampaign) : true}
								showContinueButton={FromAutomation ? (!!FromAutomation && !!isSendCampaign) : false}
								isSummary={!FromAutomation}
							/>
						</Box>
					</Box>
					{renderToast()}
				</Box>
			) : (
				!isLoader && <NoSetup classes={classes} />
			)}
			{renderDialog()}
			<Loader isOpen={isLoader} showBackdrop={true} />
			{
        <Pulse
          classes={classes}
          selectedGroups={selectedGroups}
          onClose={(pulseResponse: any) => {
            if (pulseResponse !== null) {
							setPulseData({
								...pulseData,
								pulseAmount: pulseResponse?.pulseAmount,
								timeInterval: pulseResponse?.timeInterval,
								pulseType: pulseResponse?.pulseType,
								random: pulseResponse?.random,
								timeType: pulseResponse?.timeType,
								pulsePer: pulseResponse?.pulsePer,
								pulseReci: pulseResponse?.pulseReci,
								minName: pulseResponse?.minName,
								hourName: pulseResponse?.hourName,
								togglePulse: pulseResponse?.togglePulse,
								toggleRandom: pulseResponse?.toggleRandom,
								pulsesOpen: false,
							});
            } else {
							setPulseData({
								...pulseData,
								pulsesOpen: false,
							})
						}
          }}
          isOpen={pulseData.pulsesOpen}
          initialValues={{
            pulseAmount: pulseData.pulseAmount,
            timeInterval: pulseData.timeInterval,
            pulseType: pulseData.pulseType,
            random: pulseData.random,
            timeType: pulseData.timeType,
            pulsePer: pulseData.pulsePer,
            pulseReci: pulseData.pulseReci,
            minName: pulseData.minName,
            hourName: pulseData.hourName,
            togglePulse: pulseData.togglePulse,
            toggleRandom: pulseData.toggleRandom,
          }}
        />
      }
		</DefaultScreen>
	);
};

export default SendCampaign;
