import {
	Box,
	Checkbox,
	Dialog,
	DialogActions,
	Button,
	Grid,
} from '@material-ui/core';
import { FaFilter } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Groups from './Groups/Groups';
import { BaseSyntheticEvent, useState } from 'react';
import clsx from 'clsx';
import {
	FilterRecipientsDialogProps,
	testGroupDataProps,
} from './WhatsappCampaign.types';
import { Close, SupervisedUserCircleOutlined } from '@material-ui/icons';

const FilterRecipientsDialog = ({
	classes,
	isFilterModal,
	onFilterModalClose,
}: FilterRecipientsDialogProps) => {
	const [toggleReci, settoggleReci] = useState<boolean>(false);
	const [exceptionalDays, setExceptionalDays] = useState<string>('');
	const [dialogType, setDialogType] = useState<{}>({ type: null });
	const [RecipientsBool, setRecipientsBool] = useState<boolean>(false);
	const [selectedFilterCampaigns, setFilterCampaigns] = useState<any[]>([]);
	const [showTestGroups, setShowTestGroups] = useState<boolean>(false);
	const [selectedFilterGroups, setFilterGroups] = useState<any[]>([]);
	const [bsDot, setbsDot] = useState<boolean>(false);
	const [snackbarRecipients, setsnackbarRecipients] = useState<boolean>(false);
	const [RecipientsSnackbar, setRecipientsSnackbar] = useState<boolean>(false);

	const { testGroups } = useSelector((state: { sms: any }) => state.sms);

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

	const { t } = useTranslation();

	const { windowSize, isRTL } = useSelector(
		(state: { core: any }) => state.core
	);

	const handleReciInput = (e: BaseSyntheticEvent) => {
		const re = /^[0-9\b]+$/;
		if (e.target.value === '' || re.test(e.target.value)) {
			setExceptionalDays(e.target.value);
			setRecipientsBool(false);
		}
	};

	const handleFilterConfirm = () => {
		let formIsvalid = true;
		if (toggleReci) {
			formIsvalid = validationCheck();
			if (formIsvalid) {
				if (
					selectedFilterGroups.length !== 0 ||
					exceptionalDays !== '' ||
					selectedFilterCampaigns.length !== 0
				) {
					setbsDot(true);
					setsnackbarRecipients(true);
				} else {
					setbsDot(false);
				}
			}
		} else {
			if (
				selectedFilterGroups.length !== 0 ||
				exceptionalDays !== '' ||
				selectedFilterCampaigns.length !== 0
			) {
				setsnackbarRecipients(true);
				setbsDot(true);
			} else {
				setbsDot(false);
			}
		}
		if (formIsvalid) {
			setDialogType({});
		}
	};

	const validationCheck = () => {
		if (exceptionalDays === '') {
			setRecipientsBool(true);
			setRecipientsSnackbar(true);
			return false;
		} else {
			return true;
		}
	};

	const callbackUpdateCampaignFilter = (campaigns: any) => {
		setFilterCampaigns(campaigns);
	};

	const callbackFiltertedCampaigns = (campaign: any) => {
		const found = selectedFilterCampaigns
			.map((c) => {
				return c.GroupID;
			})
			.includes(campaign.GroupID);
		if (found) {
			setFilterCampaigns(
				selectedFilterCampaigns.filter((c) => c.GroupID !== campaign.GroupID)
			);
		} else {
			setFilterCampaigns([...selectedFilterCampaigns, campaign]);
		}
	};

	const callbackUpdateGroupFilterd = (groups: any) => {
		setFilterGroups(groups);
	};

	const callbackFilteredGroups = (group: any) => {
		const found = selectedFilterGroups
			.map((g) => {
				return g.GroupID;
			})
			.includes(group.GroupID);
		if (found) {
			setFilterGroups(
				selectedFilterGroups.filter((c) => c.GroupID !== group.GroupID)
			);
		} else {
			setFilterGroups([...selectedFilterGroups, group]);
		}
	};

	const callbackShowTestGroup = async (showTestGroups: any) => {
		if (!showTestGroups && testGroups.length > 0) {
			setShowTestGroups(true);
			//setGroupList(testGroups.concat(subAccountAllGroups));
		} else {
			setShowTestGroups(false);
			// const g = subAccountAllGroups.filter((group) => { return group.IsTestGroup !== true });
			// setGroupList(g);
		}
	};

	const onClose = () => {};

	return (
		<>
			<Dialog
				open={isFilterModal}
				onClose={onFilterModalClose}
				aria-labelledby='responsive-dialog-title'>
				<div className={classes.filterModal}>
					<div
						id='responsive-dialog-title'
						className={classes.filterModalTitle}>
						{/* {title} */}
						Filter
					</div>
					<Box className={classes.filterModalClose}>
						<Close fontSize={'small'} onClick={onClose} />
					</Box>
					<Box className={classes.filterModalInfoWrapper}>
						<Box className={classes.filterModalInfo}>
							<SupervisedUserCircleOutlined
								fontSize={'small'}
								onClick={onClose}
							/>
						</Box>
					</Box>
					<div className={classes.filterModalContent}>
						<div className={classes.testGroupModalContentWrapper}>
							<Box
								style={{
									width:
										windowSize === 'lg' || windowSize === 'xl' ? '500px' : '',
								}}>
								<div className={classes.reciCheckoxContainer}>
									<Checkbox
										checked={toggleReci}
										color='primary'
										inputProps={{ 'aria-label': 'secondary checkbox' }}
										onClick={() => {
											settoggleReci(!toggleReci);
											setExceptionalDays('');
										}}
									/>
									<span
										style={{
											display: 'inline-block',
											marginTop: 2,
										}}
										className={classes.font13}>
										{t('smsReport.filterInputText')}
									</span>
									<div
										style={{
											marginRight: isRTL ? 'auto' : '',
											marginLeft: !isRTL ? 'auto' : '',
										}}>
										<input
											type='text'
											disabled={toggleReci ? false : true}
											className={
												toggleReci
													? RecipientsBool
														? clsx(classes.pulseActive, classes.error)
														: clsx(classes.pulseActive, classes.success)
													: clsx(classes.pulseInsert)
											}
											onChange={(e) => {
												handleReciInput(e);
											}}
											value={exceptionalDays}
											maxLength={3}
										/>
									</div>
								</div>
								<div>
									<div style={{ padding: '10px' }}>
										<span className={classes.font13}>
											{' '}
											{t('smsReport.inputTextFilter')}:
										</span>
									</div>
									<div>
										<div className={clsx(classes.sidebar)}>
											<Groups
												bsDot={false}
												classes={classes}
												showSortBy={false}
												showSelectAll={false}
												list={
													showTestGroups
														? [...testGroups, ...subAccountAllGroups]
														: [...subAccountAllGroups]
												}
												selectedList={selectedFilterGroups}
												callbackUpdateGroups={callbackUpdateGroupFilterd}
												callbackSelectedGroups={callbackFilteredGroups}
												callbackShowTestGroup={callbackShowTestGroup}
												innerHeight={160}
												uniqueKey={'groups_2'}
												showFilter={false}
												callbackSelectAll={() => {}}
												callbackReciFilter={() => {}}
											/>
										</div>
									</div>
								</div>
								<div className={classes.camapignsDiv}>
									<div style={{ padding: '10px' }}>
										<span className={classes.font13}>
											{t('smsReport.campaignInfo')}:
										</span>
									</div>
									<div>
										<div className={clsx(classes.sidebar)}>
											<Groups
												bsDot={false}
												classes={classes}
												showSortBy={false}
												showSelectAll={false}
												list={finishedCampaigns}
												selectedList={selectedFilterCampaigns}
												callbackUpdateGroups={callbackUpdateCampaignFilter}
												callbackSelectedGroups={callbackFiltertedCampaigns}
												innerHeight={160}
												uniqueKey={'campaigns'}
												showFilter={false}
												callbackSelectAll={() => {}}
												callbackReciFilter={() => {}}
												callbackShowTestGroup={() => {}}
											/>
										</div>
									</div>
								</div>
							</Box>
						</div>
					</div>
					<Grid container className={classes.alertModalAction}>
						<Button
							className='ok-button'
							variant='contained'
							color='primary'
							autoFocus
							// onClick={onConfirmOrYes}
						>
							{t('whatsapp.alertModal.okButtonText')}
						</Button>
						<Button
							className='cancel-button'
							color='primary'
							variant='contained'
							onClick={onFilterModalClose}>
							{t('whatsapp.alertModal.calcelButtonText')}
						</Button>
					</Grid>
				</div>
			</Dialog>
		</>
	);
};

export default FilterRecipientsDialog;
