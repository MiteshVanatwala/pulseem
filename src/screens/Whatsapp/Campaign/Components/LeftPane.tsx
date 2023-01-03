import { BaseSyntheticEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import { Grid, Tooltip, Checkbox } from '@material-ui/core';
import { ClassesType } from '../../../Classes.types';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
	LeftPaneProps,
	smsProps,
	testGroupDataProps,
} from '../Types/WhatsappCampaign.types';
import Groups from './Groups/Groups';
import * as XLSX from 'xlsx';
import ColumnAdjustmentModal from '../Popups/ColumnAdjustmentModal';
import AlertModal from '../../Editor/Popups/AlertModal';
import FilterRecipientsDialog from '../Popups/FilterRecipientsDialog';

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
}: ClassesType & LeftPaneProps) => {
	const { testGroups } = useSelector((state: { sms: smsProps }) => state.sms);
	const { t: translator } = useTranslation();
	const [isAlert, setIsAlert] = useState(false);
	const [alertModalSubtitle, setAlertModalSubtitle] = useState<string>('');
	const [toggleChecked, settoggleChecked] = useState<boolean>(false);
	const [highlighted, setHighlighted] = useState<boolean>(false);
	const [areaData, setareaData] = useState<string>('');
	const [contacts, setContacts] = useState<number[]>([]);
	const [totalRecords, settotalRecords] = useState<number>(0);
	const [showTestGroups, setShowTestGroups] = useState<boolean>(false);
	const [bsDot, setbsDot] = useState<boolean>(false);
	const [allGroupsSelected, setAllGroupsSelected] = useState<boolean>(false);
	const [isColumnAdjustmentModal, setIsColumnAdjustmentModal] =
		useState<boolean>(false);
	const [isFilterModal, setIsFilterModal] = useState<boolean>(false);
	const [typedData, settypedData] = useState<string[][]>([
		['Demo', 'Title', 'Name'],
	]);
	const [initialheadstate, setinitialheadstate] = useState<string[]>([
		'Adjust Title',
		'Adjust Title',
		'Adjust Title',
	]);
	const [headers, setheaders] = useState<string[]>(initialheadstate);

	const handleCombined = () => {};

	const callbackSelectedGroups = (group: testGroupDataProps) => {
		const found = selectedGroups
			.map((group) => {
				return group.GroupID;
			})
			.includes(group.GroupID);
		if (found) {
			setSelected(selectedGroups.filter((g) => g.GroupID !== group.GroupID));
		} else {
			setSelected([...selectedGroups, group]);
		}
	};

	const callbackUpdateGroups = (value: testGroupDataProps[]) => {
		setSelected(value);
	};

	const callbackFilter = () => {
		setIsFilterModal(true);
	};

	const callbackSelectAll = () => {
		if (!allGroupsSelected) {
			if (showTestGroups) {
				setSelected([...testGroups, ...subAccountAllGroups]);
			} else {
				setSelected([...subAccountAllGroups]);
			}
		} else {
			setSelected([]);
		}
		setAllGroupsSelected(!allGroupsSelected);
	};

	const callbackShowTestGroup = async (showTestGroups: boolean) => {
		if (!showTestGroups && testGroups.length > 0) {
			setShowTestGroups(true);
		} else {
			setShowTestGroups(false);
		}
	};

	const areaChange = (e: BaseSyntheticEvent) => {
		let enteredValue: string[] = e.target.value.split('\n');
		const records = enteredValue.filter((r: string) => {
			return r !== '';
		});
		settotalRecords(records.length);
		setareaData(e.target.value);
	};

	const handlePasted = () => {
		let temp = areaData;
		let splittedAreaData: string[] = temp
			?.split('\n')
			.filter((empty: string) => empty);
		let updatedTypedData = [];
		let cols = 0;
		if (temp?.indexOf('\t') > -1) {
			for (let i = 0; i < splittedAreaData.length; i++) {
				let splitted = splittedAreaData[i].split('\t');
				updatedTypedData.push(splitted);
				if (splitted.length > cols) {
					cols = splitted.length;
				}
			}
		} else {
			const records = splittedAreaData.filter((r: string) => {
				return r !== '';
			});
			for (let i = 0; i < records.length; i++) {
				let splitted = splittedAreaData[i].split(',');
				updatedTypedData.push(splitted);
				if (splitted.length > cols) {
					cols = splitted.length;
				}
			}
		}
		settypedData(updatedTypedData);

		let dummyArr = [];
		for (let i = 0; i < cols; i++) {
			dummyArr.push(translator('sms.adjustTitle'));
		}
		setinitialheadstate(dummyArr);
		setheaders(dummyArr);
		setIsColumnAdjustmentModal(true);
	};

	const handleFiles = (e: React.DragEvent<HTMLTextAreaElement>) => {
		e.preventDefault();
		setHighlighted(false);
		if (e?.dataTransfer?.files && e?.dataTransfer?.files?.length > 0) {
			if (e?.dataTransfer?.files?.length === 1) {
				const file: File = e.dataTransfer.files[0];
				const reader = new FileReader();
				return new Promise((resolve, reject) => {
					try {
						if (file.name.toLowerCase().indexOf('xls') > -1) {
							reader.onload = function (e: ProgressEvent<FileReader>) {
								if (e?.target?.result) {
									var data = new Uint8Array(
										e?.target?.result as ArrayBufferLike
									);
									setTimeout(() => {
										var workbook = XLSX.read(data, { type: 'array' });
										var csv: string = XLSX.utils.sheet_to_csv(
											workbook.Sheets[workbook.SheetNames[0]]
										);

										let temp: string = csv;
										let a: string[] = temp.split('\n');
										let b: string[][] = [];
										for (let i = 0; i < a.length; i++) {
											b.push(a[i].split(','));
										}
										b.pop();
										settypedData(b);
										settotalRecords(b.length);
										setareaData(b.join('\n'));
										let dummyArr = [];
										for (let i = 0; i < b[0].length; i++) {
											dummyArr.push(translator('sms.adjustTitle'));
										}
										setinitialheadstate(dummyArr);
										setheaders(dummyArr);

										setIsColumnAdjustmentModal(true);
									}, 0);
								}
							};
							reader.readAsArrayBuffer(file);
						} else if (file.name.toLowerCase().indexOf('csv') > -1) {
							reader.readAsText(file);
							reader.onload = function (e: ProgressEvent<FileReader>) {
								if (e?.target?.result) {
									const lines = e.target.result?.toString()?.split('\n');
									const linesWithoutCommas = lines.map((line: string) =>
										line.replace(/"[^"]+"/g, function (v) {
											return v.replace(/,/g, '');
										})
									);
									const updatedData: string[][] = [];
									linesWithoutCommas?.forEach((line: string) => {
										if (line?.length > 0) {
											updatedData.push(line?.split(';'));
										}
									});
									settypedData(updatedData);
									settotalRecords(updatedData?.length);
									setareaData(
										linesWithoutCommas
											.filter((line: string) => line?.length > 0)
											.join('\n')
											?.replace(/;/g, ',')
									);
									setIsColumnAdjustmentModal(true);
								}
							};
						} else {
							setAlertModalSubtitle('File type is not supported');
							setIsAlert(true);
							return false;
						}
					} catch (error) {
						reject(error);
					}
				});
			} else {
				setAlertModalSubtitle('Multiple files are not supported');
				setIsAlert(true);
			}
		}
	};

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
							settoggleChecked(false);
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
				<Grid
					item
					md={12}
					xs={12}
					className={
						highlighted ? clsx(classes.greenManual) : clsx(classes.areaManual)
					}>
					<textarea
						placeholder={translator('sms.dragXlOrCsv')}
						spellCheck='false'
						autoComplete='off'
						className={
							highlighted ? clsx(classes.greenCon) : clsx(classes.areaCon)
						}
						value={areaData}
						onDragEnter={() => {
							setHighlighted(true);
						}}
						onChange={areaChange}
						onDragLeave={() => {
							setHighlighted(false);
						}}
						onDragOver={(e) => {
							e.preventDefault();
						}}
						onPaste={areaChange}
						onDrop={(e: React.DragEvent<HTMLTextAreaElement>) => {
							handleFiles(e);
						}}
					/>
				</Grid>
			)}
			<Grid item md={12} xs={12}>
				{activeTab === 'group' && (
					<Groups
						classes={classes}
						list={
							showTestGroups
								? [...testGroups, ...subAccountAllGroups]
								: [...subAccountAllGroups]
						}
						selectedList={selectedGroups}
						callbackSelectedGroups={callbackSelectedGroups}
						callbackUpdateGroups={callbackUpdateGroups}
						callbackSelectAll={callbackSelectAll}
						callbackReciFilter={callbackFilter}
						callbackShowTestGroup={callbackShowTestGroup}
						bsDot={bsDot}
						uniqueKey={'groups_1'}
						innerHeight={325}
						showSortBy={true}
						showFilter={true}
						showSelectAll={true}
					/>
				)}
				<div className={classes.groupsFooter}>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
						}}>
						{activeTab === 'group' ? (
							<div className={classes.createGroupContainer}>
								<Checkbox
									disabled={selectedGroups.length >= 2 ? false : true}
									checked={toggleChecked}
									color='primary'
									inputProps={{ 'aria-label': 'secondary checkbox' }}
									onClick={() => {
										settoggleChecked(!toggleChecked);
									}}
								/>
								<span
									className={
										selectedGroups.length >= 2
											? classes.createGroupSpan
											: classes.createGroupSpanDisabled
									}>
									{translator('mainReport.createNewGroup')}
								</span>
								<span className={classes.iconNew}>
									{translator('mainReport.newFeature')}
								</span>
								<Tooltip
									disableFocusListener
									title={translator('mainReport.tooltipCreateGroup')}
									classes={{ tooltip: classes.customWidth }}
									style={{ marginInlineStart: '5px' }}>
									<span className={classes.bodyInfo}>i</span>
								</Tooltip>
							</div>
						) : null}
						{toggleChecked && (
							<div>
								<input
									type='text'
									className={classes.groupInput}
									placeholder={translator('smsReport.groupName')}
									onChange={(e: BaseSyntheticEvent) =>
										onNewGroupChange(e.target.value)
									}
									value={newGroupName}
								/>
								<span className={classes.saveBtn} onClick={onNewGroupSave}>
									{translator('mainReport.save')}
								</span>
							</div>
						)}
					</div>
					{activeTab === 'group' ? (
						<div
							style={{
								display: 'flex',
								marginTop: '10px',
							}}>
							<span>
								{translator('mainReport.totalReci')}:{' '}
								{selectedGroups
									?.reduce(function (a, b) {
										return a + b['Recipients'];
									}, 0)
									?.toLocaleString()}
							</span>
							<Tooltip
								placement={'bottom'}
								disableFocusListener
								title={translator('smsReport.finalReciTip')}
								classes={{ tooltip: classes.customWidth }}
								style={{ marginInlineStart: '5px' }}>
								<span className={classes.bodyInfo}>i</span>
							</Tooltip>
						</div>
					) : null}
				</div>
				{activeTab === 'manual' ? (
					<div
						className={classes.manualChild}
						style={{
							justifyContent: areaData === '' ? 'flex-end' : 'space-between',
						}}>
						{areaData && areaData?.length > 0 && (
							<div>
								<span
									className={classes.addManualDiv}
									onClick={() => {
										handlePasted();
									}}>
									{translator('sms.editFields')}
								</span>
								<span
									className={classes.clearDiv}
									onClick={() => {
										setareaData('');
										setContacts([]);
										settypedData([]);
										settotalRecords(0);
									}}>
									{translator('sms.clearList')}
								</span>
							</div>
						)}
						<span>
							{translator('sms.totalRecords')}: {totalRecords}
						</span>
					</div>
				) : null}
			</Grid>
			<ColumnAdjustmentModal
				classes={classes}
				isColumnAdjustmentModal={isColumnAdjustmentModal}
				onColumnAdjustmentModalClose={() => setIsColumnAdjustmentModal(false)}
				headers={headers}
				setheaders={setheaders}
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
