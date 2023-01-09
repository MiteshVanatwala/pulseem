import { ClassesType } from '../../Classes.types';
import DefaultScreen from '../../DefaultScreen';
import WizardTitle from '../../../components/Wizard/WizardTitle';
import { Grid } from '@material-ui/core';
import {
	testGroupDataProps,
	WhatsappCampaignSecondProps,
} from './Types/WhatsappCampaign.types';
import { useTranslation } from 'react-i18next';
import RightPane from './Components/RightPane';
import LeftPane from './Components/LeftPane';
import { BaseSyntheticEvent, useState } from 'react';
import SummaryModal from './Popups/SummaryModal';
import Buttons from './Components/Buttons';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import moment from 'moment';
import Toast from '../../../components/Toast/Toast.component';
import ValidationAlert from './Popups/ValidationAlert';

const SendCampaign = ({
	classes,
}: ClassesType & WhatsappCampaignSecondProps) => {
	const { t: translator } = useTranslation();
	const [isSummaryModal, setIsSummaryModal] = useState<boolean>(false);

	const [selectedGroups, setSelected] = useState<testGroupDataProps[]>([]);
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
	const [toastMessage, setToastMessage] = useState<string>('');
	const [daysBeforeAfter, setdaysBeforeAfter] = useState<string>('');
	const [spectialDateFieldID, setDateFieldID] = useState<string>('0');

	const [newGroupName, setNewGroupName] = useState<string>('');
	const [activeTab, setActiveTab] = useState<'group' | 'manual'>('group');
	const [isValidationAlert, setIsValidationAlert] = useState<boolean>(false);
	const [groupSendValidationErrors, setGroupSendValidationErrors] = useState<
		string[]
	>([]);
	const [isCreateNewGroup, setIsCreateNewGroup] = useState<boolean>(false);

	const subAccountAllGroups: testGroupDataProps[] = [
		{
			GroupID: 89979,
			GroupName: 'ccccc (Testing)',
			SubAccountID: 0,
			CreationDate: '2017-08-20T11:02:08.933',
			UpdateDate: '2017-08-20T11:02:08.933',
			IsTestGroup: false,
			IsDynamic: false,
			Recipients: 0,
		},
		{
			GroupID: 89980,
			GroupName: 'cdgsfsgdf (Testing)',
			SubAccountID: 0,
			CreationDate: '2017-08-20T11:02:39.197',
			UpdateDate: '2017-08-20T12:44:55.69',
			IsTestGroup: true,
			IsDynamic: false,
			Recipients: 5,
		},
		{
			GroupID: 166670,
			GroupName: 'left123',
			SubAccountID: 0,
			CreationDate: '2022-04-08T14:41:09.493',
			UpdateDate: '2022-04-17T12:46:45.297',
			IsTestGroup: true,
			IsDynamic: false,
			Recipients: 1,
		},
		{
			GroupID: 165652,
			GroupName: 'MeitalTest (Testing)',
			SubAccountID: 0,
			CreationDate: '2022-03-10T14:33:53.9',
			UpdateDate: '2022-03-10T14:33:53.9',
			IsTestGroup: true,
			IsDynamic: false,
			Recipients: 0,
		},
		{
			GroupID: 81457,
			GroupName: 'omer (Testing)',
			SubAccountID: 0,
			CreationDate: '2022-04-08T14:41:09.493',
			UpdateDate: '2017-05-21T14:45:34.537',
			IsTestGroup: true,
			IsDynamic: false,
			Recipients: 0,
		},
		{
			GroupID: 55962,
			GroupName: 'בדיקה (Testing)',
			SubAccountID: 0,
			CreationDate: '2016-01-18T18:24:45.42',
			UpdateDate: '2016-01-18T18:28:09.06',
			IsTestGroup: true,
			IsDynamic: false,
			Recipients: 2,
		},
	];

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

	console.log('Send_Campaign:: isSummaryModal::', isSummaryModal);
	console.log('Send_Campaign:: selectedGroups::', selectedGroups);
	console.log(
		'Send_Campaign:: selectedFilterCampaigns::',
		selectedFilterCampaigns
	);
	console.log('Send_Campaign:: selectedFilterGroups::', selectedFilterGroups);
	console.log('Send_Campaign:: sendDate::', sendDate);
	console.log('Send_Campaign:: sendTime::', sendTime);
	console.log('Send_Campaign:: sendType::', sendType);
	console.log('Send_Campaign:: model::', model);
	console.log('Send_Campaign:: isSpecialDateBefore::', isSpecialDateBefore);
	console.log('Send_Campaign:: timePickerOpen::', timePickerOpen);
	console.log('Send_Campaign:: toastMessage::', toastMessage);
	console.log('Send_Campaign:: daysBeforeAfter::', daysBeforeAfter);
	console.log('Send_Campaign:: spectialDateFieldID::', spectialDateFieldID);
	console.log('Send_Campaign:: newGroupName::', newGroupName);
	console.log('Send_Campaign:: activeTab::', activeTab);
	console.log('Send_Campaign:: isValidationAlert::', isValidationAlert);
	console.log(
		'Send_Campaign:: groupSendValidationErrors::',
		groupSendValidationErrors
	);

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
			setToastMessage('ToastMessages.DATE_PASS');
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

	const onFormButtonClick = (buttonName: string) => {
		switch (buttonName) {
			case 'Delete':
				console.log('Delete');
				break;
			case 'Exit':
				console.log('Exit');
				break;
			case 'Save':
				console.log('Save');
				break;
			case 'Send':
				console.log('Send');
				break;

			default:
				break;
		}
	};

	const renderToast = () => {
		if (toastMessage) {
			setTimeout(() => {
				setToastMessage('');
			}, 4000);
			return <Toast data={toastMessage} onClose='' />;
		}
		return null;
	};

	const onNewGroupSave = () => {
		if (newGroupName?.length > 0) {
			console.log('onNewGroupSave');
		} else {
			setGroupSendValidationErrors(['Group name - required field']);
			setIsValidationAlert(true);
		}
	};

	const onFilter = () => {
		console.log('onFilter');
	};

	return (
		<DefaultScreen
			subPage={'send2'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={true}>
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
								subAccountAllGroups={subAccountAllGroups}
								finishedCampaigns={finishedCampaigns}
								selectedGroups={selectedGroups}
								setSelected={setSelected}
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
					<Buttons classes={classes} onFormButtonClick={onFormButtonClick} />
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
			</div>
		</DefaultScreen>
	);
};

export default SendCampaign;
