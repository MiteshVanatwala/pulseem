import { ClassesType } from '../../Classes.types';
import DefaultScreen from '../../DefaultScreen';
import WizardTitle from '../../../components/Wizard/WizardTitle';
import { Grid } from '@material-ui/core';
import {
	APIManualUploadDataProps,
	ApiSaveCampaignSettingsDataProps,
	APISaveManualUploadClientsProps,
	createCombinedGroupProps,
	gropListAPIProps,
	selectArrayProps,
	smsReducerProps,
	testGroupDataProps,
	WhatsappCampaignSecondProps,
} from './Types/WhatsappCampaign.types';
import { useTranslation } from 'react-i18next';
import RightPane from './Components/RightPane';
import LeftPane from './Components/LeftPane';
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import SummaryModal from './Popups/SummaryModal';
import Buttons from './Components/Buttons';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import moment from 'moment';
import Toast from '../../../components/Toast/Toast.component';
import ValidationAlert from './Popups/ValidationAlert';
import {
	createCombinedGroup,
	getAllGroups,
	saveManualUpload,
} from '../../../redux/reducers/whatsappSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '../../../components/Loader/Loader';
import { buttons, initialSelectArray, resetToastData, tabs } from '../Constant';
import { getTestGroups } from '../../../redux/reducers/smsSlice';
import { translateHebrewColumns } from '../Common';
import { toastProps } from '../Editor/Types/WhatsappCreator.types';
import { useParams } from 'react-router-dom';

const SendCampaign = ({
	classes,
}: ClassesType & WhatsappCampaignSecondProps) => {
	const { t: translator } = useTranslation();
	const dispatch = useDispatch();
	const { campaignID } = useParams();
	const { testGroups: testGroupList } = useSelector(
		(state: { sms: smsReducerProps }) => state.sms
	);
	const ToastMessages = useSelector(
		(state: { whatsapp: { ToastMessages: toastProps } }) =>
			state.whatsapp.ToastMessages
	);
	const [isSummaryModal, setIsSummaryModal] = useState<boolean>(false);

	const [selectedGroups, setSelectedGroups] = useState<testGroupDataProps[]>(
		[]
	);
	const [selectedFilterCampaigns, setFilterCampaigns] = useState<
		testGroupDataProps[]
	>([]);
	const [selectedFilterGroups, setFilterGroups] = useState<
		testGroupDataProps[]
	>([]);
	const [sendDate, handleFromDate] = useState<MaterialUiPickersDate | null>(
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
	const [isValidationAlert, setIsValidationAlert] = useState<boolean>(false);
	const [groupSendValidationErrors, setGroupSendValidationErrors] = useState<
		string[]
	>([]);
	const [isLoader, setIsLoader] = useState<boolean>(false);
	const [isCreateNewGroup, setIsCreateNewGroup] = useState<boolean>(false);

	const [allGroupList, setAllGroupList] = useState<testGroupDataProps[]>([]);

	const finishedCampaigns: testGroupDataProps[] = [
		{
			GroupID: 899579,
			GroupName: 'ccccc (Testing)',
			SubAccountID: 0,
			CreationDate: '2017-08-20T11:02:08.933',
			UpdateDate: '2017-08-20T11:02:08.933',
			IsTestGroup: false,
			IsDynamic: false,
			Recipients: 0,
		},
		{
			GroupID: 891980,
			GroupName: 'cdgsfsgdf (Testing)',
			SubAccountID: 0,
			CreationDate: '2017-08-20T11:02:39.197',
			UpdateDate: '2017-08-20T12:44:55.69',
			IsTestGroup: true,
			IsDynamic: false,
			Recipients: 5,
		},
		{
			GroupID: 1666780,
			GroupName: 'left123',
			SubAccountID: 0,
			CreationDate: '2022-04-08T14:41:09.493',
			UpdateDate: '2022-04-17T12:46:45.297',
			IsTestGroup: true,
			IsDynamic: false,
			Recipients: 1,
		},
		{
			GroupID: 1655652,
			GroupName: 'MeitalTest (Testing)',
			SubAccountID: 0,
			CreationDate: '2022-03-10T14:33:53.9',
			UpdateDate: '2022-03-10T14:33:53.9',
			IsTestGroup: true,
			IsDynamic: false,
			Recipients: 0,
		},
		{
			GroupID: 814457,
			GroupName: 'omer (Testing)',
			SubAccountID: 0,
			CreationDate: '2022-04-08T14:41:09.493',
			UpdateDate: '2017-05-21T14:45:34.537',
			IsTestGroup: true,
			IsDynamic: false,
			Recipients: 0,
		},
		{
			GroupID: 552962,
			GroupName: 'בדיקה (Testing)',
			SubAccountID: 0,
			CreationDate: '2016-01-18T18:24:45.42',
			UpdateDate: '2016-01-18T18:28:09.06',
			IsTestGroup: true,
			IsDynamic: false,
			Recipients: 2,
		},
	];

	const [manualUploadGroupName, setManualUploadGroupName] =
		useState<string>('');
	const [columnValidate, setColumnValidate] = useState<boolean>(false);
	const [groupTextError, setGroupTextError] = useState<boolean>(false);
	const [GroupNameValidationMessage, setGroupNameValidationMessage] =
		useState<string>('');

	const [initialHeadState, setInitialHeadState] = useState<string[]>([
		'Adjust Title',
		'Adjust Title',
		'Adjust Title',
	]);
	const [headers, setHeaders] = useState<string[]>(initialHeadState);
	const [typedData, setTypedData] = useState<string[][]>([
		['Demo', 'Title', 'Name'],
	]);
	const [selectArray, setselectArray] =
		useState<selectArrayProps[]>(initialSelectArray);

	useEffect(() => {
		/**
		 * testGroupList is for fetching all test groups across the platform
		 * Here testGroupList is we are taking from existing code and we don't
		 * know what is the initial value that is the reason we kept it here in
		 * if condition
		 */
		if (!testGroupList || testGroupList?.length === 0) {
			dispatch(getTestGroups());
		}
		/**
		 * getApiGroupsData is for fetching all groups across the platform
		 */
		getApiGroupsData();
		/**
		 * we disable it because we want to run this code only when component loads
		 */
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleDatePicker = (value: MaterialUiPickersDate | null) => {
		handleFromDate(value);
	};

	const handleRadioTime = (value: MaterialUiPickersDate | null) => {
		setsendTime(value);
	};

	const handleSendType = (event: BaseSyntheticEvent) => {
		if (event.target.value === '1') {
			setModel({ ...model, SendDate: null });
			handleFromDate(null);
		} else if (event.target.value === '3') {
			setModel({ ...model, SendDate: null });
			handleFromDate(null);
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

		handleFromDate(date);
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

	const handleSelectChange = (e: BaseSyntheticEvent) => {
		if (e.target.value === '0') {
			setDateFieldID('0');
		} else {
			setDateFieldID(e.target.value);
		}
	};

	const onCampaignSave = () => {
		// saveCampaignSettings
		// 	let saveCampaignSettingsPayload: ApiSaveCampaignSettingsDataProps = {
		// 		WACampaignID: Number(campaignID),
		// SendTypeID: 1,
		// Groups: [selectedGroups],
		// SendExeptional: {
		// 	IsExceptionalroups?: boolean,
		// 	Groups?: number[],
		// 	IsExceptionSmsCampaigns?: boolean,
		// 	Campaigns?: number[],
		// 	ExceptionalDays?: number,
		// },
		// RandomSettings?: {
		// 	RandomAmount?: number,
		// },
		// specialsettings?: {
		// 	datefieldid?: number,
		// 	day?: number,
		// 	intervaltypeid?: number,
		// 	sendhour?: string,
		// },
		// FutureDateTime?: string,
		// 	}
	};

	const onFormButtonClick = (buttonName: string) => {
		switch (buttonName) {
			case buttons.DELETE:
				console.log(buttons.DELETE);
				break;
			case buttons.EXIT:
				console.log(buttons.EXIT);
				break;
			case buttons.SAVE:
				onCampaignSave();
				break;
			case buttons.SEND:
				console.log(buttons.SEND);
				break;

			default:
				break;
		}
	};

	const resetToast = () => {
		setToastMessage(resetToastData);
	};

	const renderToast = () => {
		if (toastMessage) {
			setTimeout(() => {
				resetToast();
			}, 4000);
			return <Toast data={toastMessage} onClose='' />;
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
			const createdGroupData: createCombinedGroupProps = await dispatch<any>(
				createCombinedGroup(combinedGroupPayload)
			);
			await getApiGroupsData();
			if (createdGroupData?.payload?.GroupID) {
				setSelectedGroups([createdGroupData?.payload]);
				setNewGroupName('');
				setIsCreateNewGroup(false);
			}
		} else {
			setGroupSendValidationErrors(['Group name - required field']);
			setIsValidationAlert(true);
		}
	};

	const onFilter = () => {
		console.log('onFilter');
	};

	const getApiGroupsData = async () => {
		setIsLoader(true);
		const groupData: gropListAPIProps = await dispatch<any>(getAllGroups());
		if (groupData.meta?.requestStatus === 'fulfilled') {
			setAllGroupList(groupData.payload);
			setIsLoader(false);
		} else {
			setAllGroupList([]);
			setIsLoader(false);
		}
	};

	const onManualUpload = async () => {
		let requestPayload: APISaveManualUploadClientsProps[] = [];

		for (let j = 0; j < typedData.length; j++) {
			requestPayload.push({});
			for (let k = 0; k < typedData[j].length; k++) {
				if (headers[k] && headers[k] !== translator('sms.adjustTitle')) {
					let key = translateHebrewColumns(
						headers[k].toLocaleString().trim().replace(' ', '')
					);
					let obj: any = requestPayload[j];
					obj[key] = typedData[j][k].trim();
				}
			}
		}
		const manualUploadData: APIManualUploadDataProps = await dispatch<any>(
			saveManualUpload({
				GroupName: manualUploadGroupName,
				Clients: requestPayload,
			})
		);
		if (manualUploadData.payload.Reason === 'no_recipients_to_update') {
			setToastMessage(ToastMessages.INVALID_RECIPIENTS);
		}
	};

	return (
		<DefaultScreen
			subPage={'send2'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={true}
			containerClass={null}>
			<div>
				<div>
					<WizardTitle
						title={translator('whatsappCampaign.whatsappCampaign')}
						classes={classes}
						stepNumber={2}
						subTitle={translator('mainReport.sendSetting')}
					/>
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
								onManualUploadGroupName={setManualUploadGroupName}
								manualUploadGroupName={manualUploadGroupName}
								columnValidate={columnValidate}
								groupTextError={groupTextError}
								GroupNameValidationMessage={GroupNameValidationMessage}
								setColumnValidate={setColumnValidate}
								setGroupTextError={setGroupTextError}
								setGroupNameValidationMessage={setGroupNameValidationMessage}
								setHeaders={setHeaders}
								setInitialHeadState={setInitialHeadState}
								headers={headers}
								onManualUpload={onManualUpload}
								typedData={typedData}
								setTypedData={setTypedData}
								resetColumnTitle={() => setHeaders(initialHeadState)}
								selectArray={selectArray}
							/>
						</Grid>
						<Grid item md={1} xs={12}></Grid>
						<Grid item md={4} xs={12}>
							<RightPane
								classes={classes}
								handleDatePicker={handleDatePicker}
								sendDate={sendDate}
								sendTime={sendTime}
								setsendTime={setsendTime}
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
							/>
						</Grid>
					</Grid>
					<Buttons
						classes={classes}
						onFormButtonClick={onFormButtonClick}
						displayBackButton={true}
					/>
				</div>
				<SummaryModal
					classes={classes}
					isOpen={isSummaryModal}
					campaignName={''}
					fromNumber={''}
					onSummaryModalClose={() => setIsSummaryModal(false)}
				/>
				<ValidationAlert
					classes={classes}
					isOpen={isValidationAlert}
					onClose={() => setIsValidationAlert(false)}
					title={translator('whatsappCampaign.sendValidation')}
					requiredFields={groupSendValidationErrors}
				/>
				{renderToast()}
				<Loader isOpen={isLoader} showBackdrop={true} />
			</div>
		</DefaultScreen>
	);
};

export default SendCampaign;
