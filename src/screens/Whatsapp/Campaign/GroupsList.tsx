import { BaseSyntheticEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import { Grid, Tooltip, Checkbox } from '@material-ui/core';
import { ClassesType } from '../../Classes.types';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { GroupListProps, testGroupDataProps } from './WhatsappCampaign.types';
import Groups from './Groups/Groups';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import ColumnAdjustmentModal from './ColumnAdjustmentModal';

const GroupsList = ({ classes }: ClassesType & GroupListProps) => {
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
	const { t } = useTranslation();
	const [groupClick, setgroupClick] = useState<boolean>(true);
	const [manualClick, setmanualClick] = useState<boolean>(false);
	const [toggleChecked, settoggleChecked] = useState<boolean>(false);
	const [highlighted, setHighlighted] = useState<boolean>(false);
	const [areaData, setareaData] = useState<any>([]);
	const [selectedGroups, setSelected] = useState<testGroupDataProps[]>([]);
	const [contacts, setContacts] = useState<any[]>([]);
	const [totalRecords, settotalRecords] = useState<number>(0);
	const [groupValue, setgroupValue] = useState<string>('');
	const [groupNameExist, setGroupNameExist] = useState<boolean>(false);
	const [showTestGroups, setShowTestGroups] = useState<boolean>(false);
	const [bsDot, setbsDot] = useState<boolean>(false);
	const [dialogType, setDialogType] = useState<{}>({ type: null });
	const [allGroupsSelected, setAllGroupsSelected] = useState<boolean>(false);
	const [isColumnAdjustmentModal, setIsColumnAdjustmentModal] =
		useState<boolean>(false);
	const [typedData, settypedData] = useState<any>([['Demo', 'Title', 'Name']]);
	const [initialheadstate, setinitialheadstate] = useState<any>([
		'Adjust Title',
		'Adjust Title',
		'Adjust Title',
	]);
	const [headers, setheaders] = useState<any>(initialheadstate);

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
		setDialogType({ type: null });
		setDialogType({ type: 'filterRecipients' });
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

	const areaChange = (e: BaseSyntheticEvent) => {
		let enteredValue: string[] = e.target.value.split('\n');
		const records = enteredValue.filter((r: string) => {
			return r !== '';
		});
		settotalRecords(records.length);
		setareaData(e.target.value);
		// setdropClick(false);
	};

	const handlePasted = () => {
		let temp = areaData;
		let a = temp.split('\n').filter((empty: any) => empty);
		let b = [];
		let cols = 0;
		if (temp.indexOf('\t') > -1) {
			for (let i = 0; i < a.length; i++) {
				let splitted = a[i].split('\t');
				b.push(splitted);
				if (splitted.length > cols) {
					cols = splitted.length;
				}
			}
		} else {
			const records = a.filter((r: string) => {
				return r !== '';
			});
			for (let i = 0; i < records.length; i++) {
				let splitted = a[i].split(',');
				b.push(splitted);
				if (splitted.length > cols) {
					cols = splitted.length;
				}
			}
		}
		settypedData(b);

		let dummyArr = [];
		for (let i = 0; i < cols; i++) {
			dummyArr.push(t('sms.adjustTitle'));
		}
		setinitialheadstate(dummyArr);
		setheaders(dummyArr);
		setIsColumnAdjustmentModal(true);
	};

	return (
		<Grid
			container
			direction='row'
			justifyContent='flex-start'
			className={classes.wizardFlex}>
			<Grid item md={12} xs={12} className={classes.infoDiv}>
				<span className={classes.conInfo}>{t('mainReport.whomTosend')}</span>
				<Tooltip
					disableFocusListener
					title={t('smsReport.whomtoSendTip')}
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
						groupClick
							? clsx(classes.tab1, classes.activeTab)
							: clsx(classes.tab1)
					}>
					<span
						onClick={() => {
							setgroupClick(true);
							setmanualClick(false);
						}}
						style={{ cursor: 'pointer' }}>
						{t('mainReport.groups')}
					</span>
				</Grid>
				<Grid
					item
					md={12}
					xs={12}
					className={
						manualClick
							? clsx(classes.tab1, classes.activeTab)
							: clsx(classes.tab1)
					}>
					<span
						style={{ marginInlineEnd: '7px', cursor: 'pointer' }}
						onClick={() => {
							setgroupClick(false);
							settoggleChecked(false);
							setmanualClick(true);
						}}>
						{t('mainReport.manual')}
					</span>
					<Tooltip
						disableFocusListener
						title={t('smsReport.manualTip')}
						classes={{ tooltip: classes.customWidth }}>
						<span className={classes.bodyInfo}>i</span>
					</Tooltip>
				</Grid>
			</Grid>
			{manualClick && (
				<Grid
					item
					md={12}
					xs={12}
					className={
						highlighted ? clsx(classes.greenManual) : clsx(classes.areaManual)
					}>
					<textarea
						placeholder={t('sms.dragXlOrCsv')}
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
						onDrop={(e) => {
							e.preventDefault();
							setHighlighted(false);
							// handleFiles(e);
						}}
					/>
				</Grid>
			)}
			<Grid item md={12} xs={12}>
				{groupClick && (
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
						{manualClick === false ? (
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
									{t('mainReport.createNewGroup')}
								</span>
								<span className={classes.iconNew}>
									{t('mainReport.newFeature')}
								</span>
								<Tooltip
									disableFocusListener
									title={t('mainReport.tooltipCreateGroup')}
									classes={{ tooltip: classes.customWidth }}
									style={{ marginInlineStart: '5px' }}>
									<span className={classes.bodyInfo}>i</span>
								</Tooltip>
							</div>
						) : null}
						{toggleChecked ? (
							<div>
								<input
									type='text'
									className={classes.groupInput}
									placeholder={t('smsReport.groupName')}
									// onChange={inputGroup}
									value={groupValue}
								/>
								<span className={classes.saveBtn} onClick={handleCombined}>
									{t('mainReport.save')}
								</span>
								{groupNameExist ? (
									<span
										style={{
											marginTop: '8px',
											color: 'red',
											fontSize: '12px',
											display: 'block',
										}}>
										{t('sms.groupNameExists').replace(
											'#groupName#',
											groupValue
										)}
									</span>
								) : null}
							</div>
						) : null}
					</div>
					{manualClick === false ? (
						<div
							style={{
								display: 'flex',
								marginTop: '10px',
							}}>
							<span>
								{t('mainReport.totalReci')}:{' '}
								{selectedGroups
									?.reduce(function (a, b) {
										return a + b['Recipients'];
									}, 0)
									?.toLocaleString()}
							</span>
							<Tooltip
								placement={'bottom'}
								disableFocusListener
								title={t('smsReport.finalReciTip')}
								classes={{ tooltip: classes.customWidth }}
								style={{ marginInlineStart: '5px' }}>
								<span className={classes.bodyInfo}>i</span>
							</Tooltip>
						</div>
					) : null}
				</div>
				{manualClick === true ? (
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
									{t('sms.editFields')}
								</span>
								<span
									className={classes.clearDiv}
									onClick={() => {
										setareaData('');
										setContacts([]);
										settypedData([]);
										settotalRecords(0);
									}}>
									{t('sms.clearList')}
								</span>
							</div>
						)}
						<span>
							{t('sms.totalRecords')}: {totalRecords}
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
		</Grid>
	);
};

export default GroupsList;
