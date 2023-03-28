import {
	Button,
	Box,
	Dialog,
	Grid,
	TextField,
	InputAdornment,
} from '@material-ui/core';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
	Close,
	SearchOutlined,
	SupervisedUserCircleOutlined,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import {
	testGroupDataProps,
	testGroupModalProps,
} from '../Types/WhatsappCampaign.types';
import clsx from 'clsx';
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import TestGroupModalRows from './TestGroupModalRows';

const TestGroupModal = ({
	classes,
	isOpen,
	onClose,
	onConfirmOrYes,
	title,
	testGroupData,
	selectedTestGroup,
	setSelectedTestGroup,
}: testGroupModalProps) => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const { t: translator } = useTranslation();
	const [searchText, setSearchText] = useState<string>('');
	const [searchGroupResult, setSearchGroupResult] = useState<
		testGroupDataProps[]
	>([]);

	useEffect(() => {
		const searchedGroup = testGroupData.filter(
			(testGroup: testGroupDataProps) =>
				testGroup?.GroupName?.substring(
					0,
					searchText?.length
				)?.toLowerCase() === searchText?.toLowerCase()
		);
		setSearchGroupResult(searchedGroup);
	}, [searchText, testGroupData]);

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

	const onCancel = () => {
		onClose();
		setSelectedTestGroup([]);
	};

	return (
		<>
			<Dialog
				fullScreen={fullScreen}
				open={isOpen}
				onClose={onClose}
				aria-labelledby='responsive-dialog-title'>
				<div className={classes.alertModal}>
					<div id='responsive-dialog-title' className={classes.alertModalTitle}>
						{title}
					</div>
					<Box className={classes.alertModalClose}>
						<Close fontSize={'small'} onClick={onClose} />
					</Box>
					<Box className={classes.alertModalInfoWrapper}>
						<Box className={classes.alertModalInfo}>
							<SupervisedUserCircleOutlined
								fontSize={'small'}
								onClick={onClose}
							/>
						</Box>
					</Box>
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
								testGroupData={testGroupData}
								searchGroupResult={searchGroupResult}
								onSelectGroup={(groupID: number) => onSelectGroup(groupID)}
								isSelectdGroup={(groupID: number) => isSelectdGroup(groupID)}
							/>
						</div>
					</div>
					<Grid container className={classes.alertModalAction}>
						<Button
							className='ok-button'
							variant='contained'
							color='primary'
							autoFocus
							onClick={onConfirmOrYes}>
							<>{translator('whatsapp.alertModal.okButtonText')}</>
						</Button>
						<Button
							className='cancel-button'
							color='primary'
							variant='contained'
							onClick={onCancel}>
							<>{translator('whatsapp.alertModal.calcelButtonText')}</>
						</Button>
					</Grid>
				</div>
			</Dialog>
		</>
	);
};

export default TestGroupModal;
