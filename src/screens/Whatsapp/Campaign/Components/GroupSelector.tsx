import { Checkbox, Tooltip } from '@material-ui/core';
import { BaseSyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { groupSelectorProps, testGroupDataProps } from '../Types/WhatsappCampaign.types';
import Groups from './Groups/Groups';

const GroupSelector = ({
	classes,
	showTestGroups,
	testGroups,
	subAccountAllGroups,
	selectedGroups,
	bsDot,
	isCreateNewGroup,
	setIsCreateNewGroup,
	onNewGroupChange,
	newGroupName,
	onNewGroupSave,
    setSelected,
    allGroupsSelected,
    setIsFilterModal,
    setAllGroupsSelected,
    setShowTestGroups
}: groupSelectorProps) => {
	const { t: translator } = useTranslation();

	const onSelectedGroups = (group: testGroupDataProps) => {
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

	const onUpdateGroups = (value: testGroupDataProps[]) => {
		setSelected(value);
	};

	const onReciFilter = () => {
		setIsFilterModal(true);
	};

	const onSelectAll = () => {
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

	const onShowTestGroup = async (showTestGroups: boolean) => {
		if (!showTestGroups && testGroups.length > 0) {
			setShowTestGroups(true);
		} else {
			setShowTestGroups(false);
		}
	};
	return (
		<>
			<Groups
				classes={classes}
				list={
					showTestGroups
						? [...testGroups, ...subAccountAllGroups]
						: [...subAccountAllGroups]
				}
				selectedList={selectedGroups}
				callbackSelectedGroups={onSelectedGroups}
				callbackUpdateGroups={onUpdateGroups}
				callbackSelectAll={onSelectAll}
				callbackReciFilter={onReciFilter}
				callbackShowTestGroup={onShowTestGroup}
				bsDot={bsDot}
				uniqueKey={'groups_1'}
				innerHeight={325}
				showSortBy={true}
				showFilter={true}
				showSelectAll={true}
			/>
			<div className={classes.groupsFooter}>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
					}}>
					<div className={classes.createGroupContainer}>
						<Checkbox
							disabled={selectedGroups.length >= 2 ? false : true}
							checked={isCreateNewGroup}
							color='primary'
							inputProps={{ 'aria-label': 'secondary checkbox' }}
							onClick={() => {
								setIsCreateNewGroup(!isCreateNewGroup);
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
					{isCreateNewGroup && (
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
				<div
					style={{
						display: 'flex',
						marginTop: '10px',
					}}>
					<span>
						{translator('mainReport.totalReci')}:{' '}
						{selectedGroups
							?.reduce(function (a: any, b: { [x: string]: any }) {
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
			</div>
		</>
	);
};
export default GroupSelector;
