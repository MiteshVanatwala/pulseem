import { useState } from 'react';
import { Grid, Tooltip } from '@material-ui/core';
import { ClassesType } from '../../../Classes.types';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
	LeftPaneProps,
	uploadData,
} from '../Types/WhatsappCampaign.types';
import AlertModal from '../../Editor/Popups/AlertModal';
import FilterRecipientsDialog from '../Popups/FilterRecipientsDialog';
import GroupSelector from './GroupSelector';
import { tabs } from '../../Constant';
import UploadXL from '../../../../components/Files/UploadXL';
import { UploadSettings } from '../../../Groups/tempConstants';

const LeftPane = ({
	classes,
	allGroupList,
	testGroupList,
	finishedCampaigns,
	selectedGroups,
	setSelected,
	selectedFilterCampaigns,
	setFilterCampaigns,
	selectedFilterGroups,
	setFilterGroups,
	onNewGroupChange,
	newGroupName,
	onNewGroupSave,
	activeTab,
	setActiveTab,
	onFilter,
	isCreateNewGroup,
	setIsCreateNewGroup,
	onManualUpload,
	exceptionalDaysToggle,
	exceptionalDays,
	setExceptionalDaysToggle,
	setExceptionalDays,
	showTestGroups,
	setShowTestGroups
}: ClassesType & LeftPaneProps) => {
	const { t: translator } = useTranslation();
	const [isAlert, setIsAlert] = useState(false);
	const [allGroupsSelected, setAllGroupsSelected] = useState<boolean>(false);
	const [isFilterModal, setIsFilterModal] = useState<boolean>(false);

	const onFilterSave = () => {
		setIsFilterModal(false);
		onFilter();
	};
	return (
		<Grid
			container
			direction='row'
			justifyContent='flex-start'
			className={classes.wizardFlex}>
			<Grid item md={12} xs={12} className={classes.infoDiv}>
				<span className={classes.conInfo}>
					<>{translator('mainReport.whomTosend')}</>
				</span>
				<Tooltip
					disableFocusListener
					title={<>{translator('smsReport.whomtoSendTip')}</>}
					classes={{ tooltip: classes.customWidth }}>
					<span className={classes.bodyInfo}>i</span>
				</Tooltip>
			</Grid>
			<Grid item md={12} xs={12} className={classes.tabDiv}>
				<Grid
					item
					md={12}
					xs={12}
					className={
						activeTab === tabs.GROUP
							? clsx(classes.tab1, classes.activeTab)
							: clsx(classes.tab1)
					}>
					<span
						onClick={() => setActiveTab(tabs.GROUP)}
						style={{ cursor: 'pointer' }}>
						<>{translator('mainReport.groups')}</>
					</span>
				</Grid>
				<Grid
					item
					md={12}
					xs={12}
					className={
						activeTab === tabs.MANUAL
							? clsx(classes.tab1, classes.activeTab)
							: clsx(classes.tab1)
					}>
					<span
						style={{ marginInlineEnd: '7px', cursor: 'pointer' }}
						onClick={() => {
							setActiveTab(tabs.MANUAL);
							setIsCreateNewGroup(false);
						}}>
						<>{translator('mainReport.manual')}</>
					</span>
					<Tooltip
						disableFocusListener
						title={<>{translator('smsReport.manualTip')}</>}
						classes={{ tooltip: classes.customWidth }}>
						<span className={classes.bodyInfo}>i</span>
					</Tooltip>
				</Grid>
			</Grid>
			{activeTab === tabs.MANUAL && (
				<UploadXL
					classes={classes}
					areaStyle={{
						height: 422,
					}}
					onDone={(
						groupName: string,
						res: uploadData,
						uploadedAsFile: boolean
					) => {
						onManualUpload(groupName, res, uploadedAsFile);
					}}
					settings={{ ...UploadSettings.GROUPS, ShowGroupName: true }}
					setToastMessage={() => { }}
					placeHolder={'recipient.addRecTextareaPlaceholder'}
					tooltipText='recipient.bulkRecUpldTooltipText'
					onlyMapping={true}
				/>
			)}
			<Grid item md={12} xs={12}>
				{activeTab === tabs.GROUP && (
					<GroupSelector
						classes={classes}
						showTestGroups={showTestGroups}
						testGroupList={testGroupList}
						allGroupList={allGroupList}
						selectedGroups={selectedGroups}
						isFilterSelected={
							selectedFilterGroups?.length > 0 ||
							selectedFilterCampaigns?.length > 0 ||
							(exceptionalDaysToggle && exceptionalDays?.length > 0)
						}
						isCreateNewGroup={isCreateNewGroup}
						newGroupName={newGroupName}
						allGroupsSelected={allGroupsSelected}
						setIsCreateNewGroup={setIsCreateNewGroup}
						onNewGroupChange={onNewGroupChange}
						onNewGroupSave={onNewGroupSave}
						setSelected={setSelected}
						setIsFilterModal={setIsFilterModal}
						setAllGroupsSelected={setAllGroupsSelected}
						setShowTestGroups={setShowTestGroups}
					/>
				)}
			</Grid>
			<FilterRecipientsDialog
				isFilterModal={isFilterModal}
				onFilterModalClose={() => setIsFilterModal(false)}
				classes={classes}
				allGroupList={allGroupList}
				finishedCampaigns={finishedCampaigns}
				selectedFilterCampaigns={selectedFilterCampaigns}
				setFilterCampaigns={setFilterCampaigns}
				selectedFilterGroups={selectedFilterGroups}
				setFilterGroups={setFilterGroups}
				onConfirmOrYes={onFilterSave}
				exceptionalDaysToggle={exceptionalDaysToggle}
				exceptionalDays={exceptionalDays}
				setExceptionalDaysToggle={setExceptionalDaysToggle}
				setExceptionalDays={setExceptionalDays}
			/>
			<AlertModal
				classes={classes}
				isOpen={isAlert}
				onClose={() => setIsAlert(false)}
				title={translator('whatsapp.alertModal.alert')}
				subtitle={''}
				type='alert'
				onConfirmOrYes={() => setIsAlert(false)}
			/>
		</Grid>
	);
};

export default LeftPane;
