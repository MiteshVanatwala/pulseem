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
} from './WhatsappCampaign.types';
import { FaCheck } from 'react-icons/fa';
import { HiOutlineUserGroup } from 'react-icons/hi';
import clsx from 'clsx';
import { BaseSyntheticEvent, useEffect, useState } from 'react';

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
				testGroup?.GroupName?.substring(0, searchText?.length) === searchText
		);
		setSearchGroupResult([...searchedGroup]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchText]);

	const isSelectdGroup = (groupID: number) => {
		let isSelected = false;
		selectedTestGroup.forEach((selectedGroup: testGroupDataProps) => {
			if (selectedGroup.GroupID === groupID) {
				isSelected = true;
			}
		});
		return isSelected;
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
					<div className={classes.alertModalContent}>
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
							<Box className={classes.testGroupModalGroupList}>
								{searchText?.length <= 0 ? (
									<>
										{testGroupData?.map(
											(group: testGroupDataProps, index: number) => (
												<div
													key={index}
													className={clsx(classes.searchCon)}
													onClick={() => {
														onSelectGroup(group.GroupID);
													}}>
													<span
														// style={{
														// 	marginInlineEnd: windowSize !== 'xs' ? '25px' : '10px',
														// }}
														className={
															isSelectdGroup(group.GroupID)
																? classes.greenDoc
																: classes.blueDoc
														}>
														{isSelectdGroup(group.GroupID) ? (
															<FaCheck className={clsx(classes.green)} />
														) : (
															<HiOutlineUserGroup />
														)}
													</span>
													<div className={classes.testGroupModalGroupDiv}>
														<span className={classes.ellipsisText}>
															{group.GroupName}
														</span>
														<span style={{ whiteSpace: 'nowrap' }}>
															{group.Recipients}{' '}
															{group.Recipients === 1
																? translator('sms.recipient')
																: translator('sms.recipients')}
														</span>
													</div>
												</div>
											)
										)}
									</>
								) : (
									<>
										{searchGroupResult?.map(
											(group: testGroupDataProps, index: number) => (
												<div
													key={index}
													className={clsx(classes.searchCon)}
													onClick={() => {
														onSelectGroup(group.GroupID);
													}}>
													<span
														className={
															isSelectdGroup(group.GroupID)
																? classes.greenDoc
																: classes.blueDoc
														}>
														{isSelectdGroup(group.GroupID) ? (
															<FaCheck className={clsx(classes.green)} />
														) : (
															<HiOutlineUserGroup />
														)}
													</span>
													<div className={classes.testGroupModalGroupDiv}>
														<span className={classes.ellipsisText}>
															{group.GroupName}
														</span>
														<span style={{ whiteSpace: 'nowrap' }}>
															{group.Recipients}{' '}
															{group.Recipients === 1
																? translator('sms.recipient')
																: translator('sms.recipients')}
														</span>
													</div>
												</div>
											)
										)}
									</>
								)}
							</Box>
						</div>
					</div>
					<Grid container className={classes.alertModalAction}>
						<Button
							className='ok-button'
							variant='contained'
							color='primary'
							autoFocus
							onClick={onConfirmOrYes}>
							{translator('whatsapp.alertModal.okButtonText')}
						</Button>
						<Button
							className='cancel-button'
							color='primary'
							variant='contained'
							onClick={onCancel}>
							{translator('whatsapp.alertModal.calcelButtonText')}
						</Button>
					</Grid>
				</div>
			</Dialog>
		</>
	);
};

export default TestGroupModal;
