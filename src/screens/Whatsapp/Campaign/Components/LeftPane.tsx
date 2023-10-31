import { useRef, useState } from 'react';
import { Button, Grid, Tooltip } from '@material-ui/core';
import { ClassesType } from '../../../Classes.types';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
	LeftPaneProps,
	uploadData,
} from '../Types/WhatsappCampaign.types';
import FilterRecipientsDialog from '../Popups/FilterRecipientsDialog';
import GroupSelector from './GroupSelector';
import { tabs } from '../../Constant';
import UploadXL from '../../../../components/Files/UploadXL';
import { UploadSettings } from '../../../Groups/tempConstants';
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';
import Toast from '../../../../components/Toast/Toast.component';

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
	const [allGroupsSelected, setAllGroupsSelected] = useState<boolean>(false);
	const [dialogType, setDialogType] = useState<string>('');
	const refFilterRecipientsDialog = useRef<any>();
	const [toastMessage, setToastMessage] = useState(null);

	const onFilterSave = () => {
		setDialogType('');
		onFilter();
	};

	const renderToast = () => {
		if (toastMessage) {
			setTimeout(() => {
				setToastMessage(null);
			}, 3000);
			return (
				<Toast data={toastMessage} />
			);
		}
		return null;
	}

	const getFilterDialog = () => ({
		title: translator('whatsappCampaign.filter'),
		showDivider: false,
		content: (
			<FilterRecipientsDialog
				isFilterModal={true}
				onFilterModalClose={() => setDialogType('')}
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
				ref={refFilterRecipientsDialog}
			/>
		),
		showDefaultButtons: false,
		renderButtons: () =>
      (
        <Grid
          container
          spacing={2}
          className={clsx(classes.dialogButtonsContainer)}
        >
          <Grid item>
            <Button
              onClick={() => refFilterRecipientsDialog?.current?.onOkClick() }
              className={clsx(
                classes.btn,
                classes.btnRounded
              )}
            >
              {translator('common.Yes')}
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => refFilterRecipientsDialog?.current?.onNoClick()}
              className={clsx(
                classes.btn,
                classes.btnRounded
              )}
            >
              {translator('common.No')}
            </Button>
          </Grid>
        </Grid>
      ),
	})

	const renderDialog = () => {
		let currentDialog: any = {};
		if (dialogType === 'filter') {
			currentDialog = getFilterDialog();
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
					setToastMessage={setToastMessage}
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
						setIsFilterModal={() => setDialogType('filter')}
						setAllGroupsSelected={setAllGroupsSelected}
						setShowTestGroups={setShowTestGroups}
					/>
				)}
			</Grid>
			{renderDialog()}
			{renderToast()}
		</Grid>
	);
};

export default LeftPane;
