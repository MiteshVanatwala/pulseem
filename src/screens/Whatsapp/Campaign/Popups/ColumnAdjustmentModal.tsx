import {
	Typography,
	TextField,
	Box,
	Tooltip,
	Dialog,
	useMediaQuery,
	Button,
	Grid,
	Theme,
} from '@material-ui/core';
import clsx from 'clsx';
import { AiOutlineClose } from 'react-icons/ai';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { BaseSyntheticEvent, useState } from 'react';
import { Close, SupervisedUserCircleOutlined } from '@material-ui/icons';
import {
	ColumnAdjustmentModalProps,
	selectArrayProps,
} from '../Types/WhatsappCampaign.types';

const ColumnAdjustmentModal = ({
	classes,
	isColumnAdjustmentModal,
	onColumnAdjustmentModalClose,
	headers,
	setheaders,
	typedData,
	onManualUploadGroupName,
	manualUploadGroupName,
	columnValidate,
	groupTextError,
	GroupNameValidationMessage,
	setColumnValidate,
	setGroupTextError,
	setGroupNameValidationMessage,
	onManualUpload,
	selectArray
}: ColumnAdjustmentModalProps) => {
	const theme: Theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));
	const { t: translator } = useTranslation();
	const [dropIndex, setdropIndex] = useState<number>(-1);

	const handleChangeId = (id: number) => {
		if (dropIndex === -1) {
			setdropIndex(id);
		} else {
			setdropIndex(-1);
		}
	};

	const handleCloseSpan = (id: number, name: string) => {
		let h = headers;

		headers[id] = translator('sms.adjustTitle');
		setheaders(h);

		for (let i = 0; i < selectArray.length; i++) {
			if (selectArray[i].label === name) {
				selectArray[i].isdisabled = false;
				selectArray[i].idx = -1;
				break;
			}
		}
	};

	const handleSelectFirst = (
		name: selectArrayProps,
		id: number,
		idx: number,
		e: BaseSyntheticEvent
	) => {
		let h = headers;
		h[idx] = name.label;
		selectArray.forEach((value: selectArrayProps, index: number) => {
			if (value.idx === idx) {
				selectArray[index].isdisabled = false;
				selectArray[index].idx = -1;
			}
		});
		selectArray[id].isdisabled = true;
		selectArray[id].idx = idx;
		setheaders(h);
	};

	const onManualUploadOk = () => {
		if (manualUploadGroupName?.length === 0) {
			setGroupTextError(true);
			setColumnValidate(true);
			setGroupNameValidationMessage(translator('common.requiredField'));
		} else {
			onManualUpload();
		}
	};

	const onGroupNamechange = (groupName: string) => {
		setGroupTextError(false);
		onManualUploadGroupName(groupName);
	};

	return (
		<Dialog
			fullScreen={fullScreen}
			open={isColumnAdjustmentModal}
			onClose={onColumnAdjustmentModalClose}
			aria-labelledby='responsive-dialog-title'>
			<div className={classes.columnAdjustmentModal}>
				<div
					id='responsive-dialog-title'
					className={classes.columnAdjustmentModalTitle}>
					<>{translator('whatsappCampaign.dfieldTitle')}</>
				</div>
				<Box className={classes.columnAdjustmentModalClose}>
					<Close fontSize={'small'} onClick={onColumnAdjustmentModalClose} />
				</Box>
				<Box className={classes.columnAdjustmentModalInfoWrapper}>
					<Box className={classes.columnAdjustmentModalInfo}>
						<SupervisedUserCircleOutlined
							fontSize={'small'}
							onClick={onColumnAdjustmentModalClose}
						/>
					</Box>
				</Box>
				<div className={classes.columnAdjustmentModalContent}>
					<div className={classes.testGroupModalContentWrapper}>
						<Box>
							<div className={classes.manualModal}>
								<Typography className={classes.inputLabel}>
									<>{translator('common.GroupName')}</>:
								</Typography>
								<div className={clsx(classes.buttonForm, classes.fullWidth)}>
									<TextField
										type='text'
										placeholder={translator('common.GroupName')}
										className={
											groupTextError
												? clsx(classes.textInput, classes.error)
												: clsx(classes.textInput, classes.success)
										}
										onChange={(e: BaseSyntheticEvent) =>
											onGroupNamechange(e.target.value)
										}
										value={manualUploadGroupName}></TextField>
									{groupTextError ? (
										<span className={classes.errorLabel}>
											{GroupNameValidationMessage}
										</span>
									) : null}
								</div>
							</div>
							<Box className={clsx(classes.commonFieldPulse, classes.mb3)}>
								<Typography
									style={{ fontSize: '20px', marginInlineEnd: '10px' }}>
									<>{translator('sms.totalRecipients')}</>:
								</Typography>
								<Typography
									style={{
										fontSize: '20px',
										marginInlineEnd: '10px',
										fontWeight: '600',
									}}>
									{typedData.length}
								</Typography>
								<Tooltip
									disableFocusListener
									title={translator('smsReport.manualTotalTooltip')}
									classes={{ tooltip: classes.customWidth }}
									style={{ justifyContent: 'center', zIndex: 9999999999999 }}>
									<Typography className={classes.bodyInfo}>i</Typography>
								</Tooltip>
							</Box>
							<Box
								className={classes.columnAdjustmentModalTableWrapper}
								key='columnAdjustment'>
								<table>
									{typedData.length !== 0 ? (
										headers.map((_item: string, idx: number) => {
											return (
												<th key={idx} className={classes.manualHeader}>
													<div
														onClick={() => {
															handleChangeId(idx);
														}}
														className={classes.adjustP}
														style={{
															textAlign: 'center',
															cursor: 'pointer',
														}}>
														<div
															style={{
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
															}}>
															<Typography
																style={{
																	fontWeight: '700',
																	cursor: 'pointer',
																	marginInlineEnd: '20px',
																}}
																className={
																	columnValidate === true &&
																	headers[idx] === translator('sms.adjustTitle')
																		? classes.columnError
																		: ''
																}>
																{headers[idx]}
															</Typography>
															{headers[idx] !==
															translator('sms.adjustTitle') ? (
																<AiOutlineClose
																	style={{ marginInlineEnd: '8px' }}
																	onClick={() => {
																		handleCloseSpan(idx, headers[idx]);
																	}}
																/>
															) : null}
															{dropIndex === idx ? (
																<BsChevronUp />
															) : (
																<BsChevronDown
																	style={{ marginInlineStart: '4px' }}
																/>
															)}{' '}
														</div>
														{dropIndex === idx ? (
															<div className={classes.adjustC}>
																{selectArray.map(
																	(item: selectArrayProps, id: number) => {
																		return (
																			<span
																				className={
																					item.isdisabled
																						? clsx(classes.grayGroup)
																						: clsx(classes.grouping)
																				}
																				onClick={(e) => {
																					handleSelectFirst(item, id, idx, e);
																				}}>
																				{item.label}
																			</span>
																		);
																	}
																)}
															</div>
														) : null}
													</div>
												</th>
											);
										})
									) : (
										<>Nodata</>
									)}
									{typedData?.map((item: string[], id: number) => {
										if (id > typedData.length - 6) {
											return (
												<tbody>
													<tr key={id}>
														{headers.map((data: string, idx: number) => {
															return (
																<td key={idx} className={classes.tableColumn}>
																	{item[idx]}
																</td>
															);
														})}
													</tr>
												</tbody>
											);
										}
										return null;
									})}
								</table>
							</Box>
						</Box>
					</div>
				</div>
				<Grid container className={classes.alertModalAction}>
					<Button
						className='ok-button'
						variant='contained'
						color='primary'
						autoFocus
						onClick={onManualUploadOk}>
						<>{translator('whatsapp.alertModal.okButtonText')}</>
					</Button>
					<Button
						className='cancel-button'
						color='primary'
						variant='contained'
						onClick={onColumnAdjustmentModalClose}>
						<>{translator('whatsapp.alertModal.calcelButtonText')}</>
					</Button>
				</Grid>
			</div>
		</Dialog>
	);
};

export default ColumnAdjustmentModal;
