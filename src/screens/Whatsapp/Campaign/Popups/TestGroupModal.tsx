import {
	Grid,
	TextField,
	InputAdornment,
} from '@material-ui/core';
import {
	SearchOutlined,
} from '@material-ui/icons';
import {
	testGroupDataProps,
	testGroupModalProps,
} from '../Types/WhatsappCampaign.types';
import clsx from 'clsx';
import { BaseSyntheticEvent, useEffect, useMemo, useState } from 'react';
import TestGroupModalRows from './TestGroupModalRows';
import { DefaultGroupSort, sortGroupsByUpdateDate } from '../../../../helpers/Utils/groupSortUtils';

const TestGroupModal = ({
	classes,
	onClose,
	testGroupData,
	selectedTestGroup,
	setSelectedTestGroup,
}: testGroupModalProps) => {
	const [searchText, setSearchText] = useState<string>('');
	const [searchGroupResult, setSearchGroupResult] = useState<
		testGroupDataProps[]
	>([]);

	const sortedTestGroupData = useMemo(
		() => sortGroupsByUpdateDate(testGroupData ?? [], DefaultGroupSort.DIRECTION),
		[testGroupData]
	);

	useEffect(() => {
		const searchedGroup = sortedTestGroupData.filter(
			(testGroup: testGroupDataProps) =>
				testGroup?.GroupName?.substring(
					0,
					searchText?.length
				)?.toLowerCase() === searchText?.toLowerCase()
		);
		setSearchGroupResult(searchedGroup);
	}, [searchText, sortedTestGroupData]);

	const isSelectdGroup = (groupID: number) => {
		const selectedGroup = selectedTestGroup.find(
			(selectedGroup: testGroupDataProps) => selectedGroup.GroupID === groupID
		);

		return !!selectedGroup;
	};

	const onSelectGroup = (groupID: number) => {
		if (isSelectdGroup(groupID)) {
			const updatedSelectedGroup = selectedTestGroup.filter(
				(selectedGroup: testGroupDataProps) =>
					selectedGroup?.GroupID !== groupID
			);
			setSelectedTestGroup(updatedSelectedGroup);
		} else {
			const selectedGroup = testGroupData?.find(
				(testGroup: testGroupDataProps) => testGroup?.GroupID === groupID
			);
			if (selectedGroup) {
				setSelectedTestGroup([...selectedTestGroup, selectedGroup]);
			}
		}
	};

	return (
		<>
			<div className={classes.testGroupModalContent}>
				<div className={classes.testGroupModalContentWrapper}>
					<Grid container className={classes.testGroupModalContentSearch}>
						<Grid item lg={12} className={classes.buttonForm}>
							<TextField
								id='input-with-icon-textfield'
								className={clsx(
									classes.buttonField,
									classes.success,
									classes.testGroupModalContentSearchField
								)}
								placeholder={'Search'}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<SearchOutlined />
										</InputAdornment>
									),
								}}
								value={searchText}
								onChange={(e: BaseSyntheticEvent) =>
									setSearchText(e.target.value)
								}
								variant='standard'
							/>
						</Grid>
					</Grid>
					<TestGroupModalRows
						classes={classes}
						searchText={searchText}
						testGroupData={sortedTestGroupData}
						searchGroupResult={searchGroupResult}
						onSelectGroup={(groupID: number) => onSelectGroup(groupID)}
						isSelectdGroup={(groupID: number) => isSelectdGroup(groupID)}
					/>
				</div>
			</div>
		</>
	);
};

export default TestGroupModal;
