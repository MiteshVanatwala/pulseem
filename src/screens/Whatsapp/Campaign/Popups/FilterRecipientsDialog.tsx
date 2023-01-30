import { Box, Checkbox, Dialog, Button, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Groups from '../Components/Groups/Groups';
import { BaseSyntheticEvent, useState } from 'react';
import clsx from 'clsx';
import {
	coreProps,
	FilterRecipientsDialogProps,
	smsProps,
	testGroupDataProps,
} from '../Types/WhatsappCampaign.types';
import { Close, SupervisedUserCircleOutlined } from '@material-ui/icons';

const FilterRecipientsDialog = ({
	classes,
	isFilterModal,
	onFilterModalClose,
	allGroupList,
	finishedCampaigns,
	selectedFilterCampaigns,
	setFilterCampaigns,
	selectedFilterGroups,
	setFilterGroups,
	onConfirmOrYes,
}: FilterRecipientsDialogProps) => {
	const [toggleReci, settoggleReci] = useState<boolean>(false);
	const [exceptionalDays, setExceptionalDays] = useState<string>('');
	const [RecipientsBool, setRecipientsBool] = useState<boolean>(false);
	const [showTestGroups, setShowTestGroups] = useState<boolean>(false);
	const [snackbarRecipients, setsnackbarRecipients] = useState<boolean>(false);
	const [RecipientsSnackbar, setRecipientsSnackbar] = useState<boolean>(false);
	const [isFilterSelected, setIsFilterSelected] = useState<boolean>(false);

	const [selectedModalFilterCampaigns, setSelectedModalFilterCampaigns] =
		useState<testGroupDataProps[]>(selectedFilterCampaigns);
	const [selectedModalFilterGroups, setSelectedModalFilterGroups] =
		useState<testGroupDataProps[]>(selectedFilterGroups);

	const { testGroups } = useSelector((state: { sms: smsProps }) => state.sms);
	const { t: translator } = useTranslation();

	const { windowSize, isRTL } = useSelector(
		(state: { core: coreProps }) => state.core
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
					selectedModalFilterGroups.length !== 0 ||
					exceptionalDays !== '' ||
					selectedModalFilterCampaigns.length !== 0
				) {
					setIsFilterSelected(true);
					setsnackbarRecipients(true);
				} else {
					setIsFilterSelected(false);
				}
			}
		} else {
			if (
				selectedModalFilterGroups.length !== 0 ||
				exceptionalDays !== '' ||
				selectedModalFilterCampaigns.length !== 0
			) {
				setsnackbarRecipients(true);
				setIsFilterSelected(true);
			} else {
				setIsFilterSelected(false);
			}
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

	const callbackUpdateCampaignFilter = (campaigns: testGroupDataProps[]) => {
		setSelectedModalFilterCampaigns(campaigns);
	};

	const callbackFiltertedCampaigns = (campaign: testGroupDataProps) => {
		const found = selectedModalFilterCampaigns
			.map((c) => {
				return c.GroupID;
			})
			.includes(campaign.GroupID);
		if (found) {
			setSelectedModalFilterCampaigns(
				selectedModalFilterCampaigns.filter(
					(c) => c.GroupID !== campaign.GroupID
				)
			);
		} else {
			setSelectedModalFilterCampaigns([
				...selectedModalFilterCampaigns,
				campaign,
			]);
		}
	};

	const callbackUpdateGroupFilterd = (groups: testGroupDataProps[]) => {
		setSelectedModalFilterGroups(groups);
	};

	const callbackFilteredGroups = (group: testGroupDataProps) => {
		const found = selectedModalFilterGroups
			.map((g) => {
				return g.GroupID;
			})
			.includes(group.GroupID);
		if (found) {
			setSelectedModalFilterGroups(
				selectedModalFilterGroups.filter((c) => c.GroupID !== group.GroupID)
			);
		} else {
			setSelectedModalFilterGroups([...selectedModalFilterGroups, group]);
		}
	};

	const callbackShowTestGroup = async (showTestGroups: boolean) => {
		if (!showTestGroups && testGroups.length > 0) {
			setShowTestGroups(true);
		} else {
			setShowTestGroups(false);
		}
	};

	const onClose = () => {
		setSelectedModalFilterCampaigns(selectedFilterCampaigns);
		setSelectedModalFilterGroups(selectedFilterGroups);
		onFilterModalClose();
	};

	const onConfirm = () => {
		setFilterCampaigns(selectedModalFilterCampaigns);
		setFilterGroups(selectedModalFilterGroups);
		onConfirmOrYes();
	};
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
						<>{translator('whatsappCampaign.filter')}</>
					</div>
					<Box className={classes.filterModalClose}>
						<Close fontSize={'small'} onClick={onFilterModalClose} />
					</Box>
					<Box className={classes.filterModalInfoWrapper}>
						<Box className={classes.filterModalInfo}>
							<SupervisedUserCircleOutlined
								fontSize={'small'}
								onClick={onFilterModalClose}
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
										<>{translator('smsReport.filterInputText')}</>
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
											<>{translator('smsReport.inputTextFilter')}</>:
										</span>
									</div>
									<div>
										<div className={clsx(classes.sidebar)}>
											<Groups
												isFilterSelected={false}
												classes={classes}
												showSortBy={false}
												showSelectAll={false}
												list={
													showTestGroups
														? [...testGroups, ...allGroupList]
														: [...allGroupList]
												}
												selectedList={selectedModalFilterGroups}
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
											<>{translator('smsReport.campaignInfo')}</>:
										</span>
									</div>
									<div>
										<div className={clsx(classes.sidebar)}>
											<Groups
												isFilterSelected={false}
												classes={classes}
												showSortBy={false}
												showSelectAll={false}
												list={finishedCampaigns}
												selectedList={selectedModalFilterCampaigns}
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
							onClick={onConfirm}>
							<>{translator('whatsapp.alertModal.okButtonText')}</>
						</Button>
						<Button
							className='cancel-button'
							color='primary'
							variant='contained'
							onClick={onClose}>
							<>{translator('whatsapp.alertModal.calcelButtonText')}</>
						</Button>
					</Grid>
				</div>
			</Dialog>
		</>
	);
};

export default FilterRecipientsDialog;
