import { ForwardedRef, forwardRef, useImperativeHandle } from 'react';
import { Box, Checkbox } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Groups from '../Components/Groups/Groups';
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import clsx from 'clsx';
import {
	coreProps,
	FilterRecipientsDialogProps,
	selectedFilterCampaignsProps,
	smsProps,
	testGroupDataProps,
} from '../Types/WhatsappCampaign.types';
import CampaignGroups from '../Components/Groups/CampaignGroups';
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';

const FilterRecipientsDialog = forwardRef(({
	classes,
	onFilterModalClose,
	allGroupList,
	finishedCampaigns,
	selectedFilterCampaigns,
	setFilterCampaigns,
	selectedFilterGroups,
	setFilterGroups,
	onConfirmOrYes,
	exceptionalDaysToggle,
	exceptionalDays,
	setExceptionalDaysToggle,
	setExceptionalDays
}: FilterRecipientsDialogProps, ref: ForwardedRef<any>) => {
	const [RecipientsBool, setRecipientsBool] = useState<boolean>(false);
	const [showTestGroups, setShowTestGroups] = useState<boolean>(false);
	const [groupSendValidationErrors, setGroupSendValidationErrors] = useState<
		string[]
	>([]);
	useState<selectedFilterCampaignsProps[]>(selectedFilterCampaigns);
	const [selectedModalFilterCampaigns, setSelectedModalFilterCampaigns] =
		useState<selectedFilterCampaignsProps[]>(selectedFilterCampaigns);
	const [selectedModalFilterGroups, setSelectedModalFilterGroups] =
		useState<testGroupDataProps[]>(selectedFilterGroups);
	useEffect(() => {
		setSelectedModalFilterCampaigns(selectedFilterCampaigns);
	}, [selectedFilterCampaigns]);
	useEffect(() => {
		setSelectedModalFilterGroups(selectedFilterGroups);
	}, [selectedFilterGroups]);
	const [dialogType, setDialogType] = useState<string>('');
	const { testGroups } = useSelector((state: { sms: smsProps }) => state.sms);
	const { t: translator } = useTranslation();

	const { windowSize, isRTL } = useSelector(
		(state: { core: coreProps }) => state.core
	);

	useImperativeHandle(ref, () => ({
    onOkClick() {
      onConfirm();
    },

		onNoClick() {
			onClose();
		}
  }));

	const handleReciInput = (e: BaseSyntheticEvent) => {
		const re = /^[0-9\b]+$/;
		if (e.target.value === '' || re.test(e.target.value)) {
			setExceptionalDays(e.target.value);
			setRecipientsBool(false);
		}
	};

	const callbackUpdateCampaignFilter = (
		campaigns: selectedFilterCampaignsProps[]
	) => {
		setSelectedModalFilterCampaigns(campaigns);
	};

	const callbackFiltertedCampaigns = (
		campaign: selectedFilterCampaignsProps
	) => {
		const found = selectedModalFilterCampaigns
			.map((campaign) => {
				return campaign?.WACampaignID;
			})
			.includes(campaign.WACampaignID);
		if (found) {
			setSelectedModalFilterCampaigns(
				selectedModalFilterCampaigns.filter(
					(campaignData) => campaignData.WACampaignID !== campaign.WACampaignID
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

	const validate = () => {
		if (exceptionalDaysToggle) {
			if (exceptionalDays?.length > 0) {
				return true;
			} else {
				setRecipientsBool(true);
				setGroupSendValidationErrors([translator('sms.FillDay')]);
				setDialogType('validationDialog')
				return false;
			}
		}
		return true;
	};

	const onClose = () => {
		setSelectedModalFilterCampaigns(selectedFilterCampaigns);
		setSelectedModalFilterGroups(selectedFilterGroups);
		onFilterModalClose();
	};

	const onConfirm = () => {
		if (validate()) {
			setFilterCampaigns(selectedModalFilterCampaigns);
			setFilterGroups(selectedModalFilterGroups);
			onConfirmOrYes();
		}
	};

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
			setDialogType('');
		}
	})

	const renderDialog = () => {
		let currentDialog: any = {};
		if (dialogType === 'validationDialog') {
			currentDialog = getValidationDialog();
		}

		if (dialogType) {
			return (
				dialogType && <BaseDialog
					classes={classes}
					open={dialogType}
					onCancel={() => setDialogType('')}
					onClose={() => setDialogType('')}
					renderButtons={currentDialog?.renderButtons || null}
					{...currentDialog}>
					{currentDialog?.content}
				</BaseDialog>
			)
		}
	}
	return (
		<>
			<div>
				<div>
					<Box
						style={{
							width:
								windowSize === 'lg' || windowSize === 'xl' ? '500px' : '',
						}}>
						<div className={classes.reciCheckoxContainer}>
							<Checkbox
								checked={exceptionalDaysToggle}
								color='primary'
								inputProps={{ 'aria-label': 'secondary checkbox' }}
								onClick={() => {
									setExceptionalDaysToggle(!exceptionalDaysToggle);
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
									disabled={exceptionalDaysToggle ? false : true}
									className={
										exceptionalDaysToggle
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
										isFilterSelected={selectedModalFilterGroups?.length > 0}
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
										showTestGroups={showTestGroups}
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
									<CampaignGroups
										isFilterSelected={
											selectedModalFilterCampaigns?.length > 0
										}
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
			{renderDialog()}
		</>
	);
});

export default FilterRecipientsDialog;
