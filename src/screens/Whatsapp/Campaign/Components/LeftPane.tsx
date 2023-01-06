import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Grid, Tooltip } from '@material-ui/core';
import { ClassesType } from '../../../Classes.types';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { LeftPaneProps, smsProps } from '../Types/WhatsappCampaign.types';
import ColumnAdjustmentModal from '../Popups/ColumnAdjustmentModal';
import AlertModal from '../../Editor/Popups/AlertModal';
import FilterRecipientsDialog from '../Popups/FilterRecipientsDialog';
import ManualUpload from './ManualUpload';
import GroupSelector from './GroupSelector';

const LeftPane = ({
	classes,
	subAccountAllGroups,
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
}: ClassesType & LeftPaneProps) => {
	const { testGroups } = useSelector((state: { sms: smsProps }) => state.sms);
	const { t: translator } = useTranslation();
	const [isAlert, setIsAlert] = useState(false);
	const [alertModalSubtitle, setAlertModalSubtitle] = useState<string>('');
	const [highlighted, setHighlighted] = useState<boolean>(false);
	const [areaData, setAreaData] = useState<string>('');
	const [contacts, setContacts] = useState<number[]>([]);
	const [totalRecords, setTotalRecords] = useState<number>(0);
	const [showTestGroups, setShowTestGroups] = useState<boolean>(false);
	const [bsDot, setbsDot] = useState<boolean>(false);
	const [allGroupsSelected, setAllGroupsSelected] = useState<boolean>(false);
	const [isColumnAdjustmentModal, setIsColumnAdjustmentModal] =
		useState<boolean>(false);
	const [isFilterModal, setIsFilterModal] = useState<boolean>(false);
	const [typedData, setTypedData] = useState<string[][]>([
		['Demo', 'Title', 'Name'],
	]);
	const [initialHeadState, setInitialHeadState] = useState<string[]>([
		'Adjust Title',
		'Adjust Title',
		'Adjust Title',
	]);
	const [headers, setHeaders] = useState<string[]>(initialHeadState);

	const handleCombined = () => {};

	return (
		<Grid
			container
			direction='row'
			justifyContent='flex-start'
			className={classes.wizardFlex}>
			<Grid item md={12} xs={12} className={classes.infoDiv}>
				<span className={classes.conInfo}>
					{translator('mainReport.whomTosend')}
				</span>
				<Tooltip
					disableFocusListener
					title={translator('smsReport.whomtoSendTip')}
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
						activeTab === 'group'
							? clsx(classes.tab1, classes.activeTab)
							: clsx(classes.tab1)
					}>
					<span
						onClick={() => setActiveTab('group')}
						style={{ cursor: 'pointer' }}>
						{translator('mainReport.groups')}
					</span>
				</Grid>
				<Grid
					item
					md={12}
					xs={12}
					className={
						activeTab === 'manual'
							? clsx(classes.tab1, classes.activeTab)
							: clsx(classes.tab1)
					}>
					<span
						style={{ marginInlineEnd: '7px', cursor: 'pointer' }}
						onClick={() => {
							setActiveTab('manual');
							setIsCreateNewGroup(false);
						}}>
						{translator('mainReport.manual')}
					</span>
					<Tooltip
						disableFocusListener
						title={translator('smsReport.manualTip')}
						classes={{ tooltip: classes.customWidth }}>
						<span className={classes.bodyInfo}>i</span>
					</Tooltip>
				</Grid>
			</Grid>
			{activeTab === 'manual' && (
				<ManualUpload
					classes={classes}
					highlighted={highlighted}
					areaData={areaData}
					setHighlighted={setHighlighted}
					setAreaData={setAreaData}
					setContacts={setContacts}
					setTypedData={setTypedData}
					setTotalRecords={setTotalRecords}
					totalRecords={totalRecords}
					setInitialHeadState={setInitialHeadState}
					setHeaders={setHeaders}
					setIsColumnAdjustmentModal={setIsColumnAdjustmentModal}
					setAlertModalSubtitle={setAlertModalSubtitle}
					setIsAlert={setIsAlert}
				/>
			)}
			<Grid item md={12} xs={12}>
				{activeTab === 'group' && (
					<GroupSelector
						classes={classes}
						showTestGroups={showTestGroups}
						testGroups={testGroups}
						subAccountAllGroups={subAccountAllGroups}
						selectedGroups={selectedGroups}
						bsDot={bsDot}
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
			<ColumnAdjustmentModal
				classes={classes}
				isColumnAdjustmentModal={isColumnAdjustmentModal}
				onColumnAdjustmentModalClose={() => setIsColumnAdjustmentModal(false)}
				headers={headers}
				setheaders={setHeaders}
				typedData={typedData}
			/>
			<FilterRecipientsDialog
				isFilterModal={isFilterModal}
				onFilterModalClose={() => setIsFilterModal(false)}
				classes={classes}
				subAccountAllGroups={subAccountAllGroups}
				finishedCampaigns={finishedCampaigns}
				selectedFilterCampaigns={selectedFilterCampaigns}
				setFilterCampaigns={setFilterCampaigns}
				selectedFilterGroups={selectedFilterGroups}
				setFilterGroups={setFilterGroups}
				onConfirmOrYes={onFilter}
			/>
			<AlertModal
				classes={classes}
				isOpen={isAlert}
				onClose={() => setIsAlert(false)}
				title={translator('whatsapp.alertModal.alert')}
				subtitle={alertModalSubtitle}
				type='alert'
				onConfirmOrYes={() => setIsAlert(false)}
			/>
		</Grid>
	);
};

export default LeftPane;
