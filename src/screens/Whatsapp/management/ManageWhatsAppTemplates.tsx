import {
	Box,
	Button,
	Grid,
	MenuItem,
	Table,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import uniqid from 'uniqid';
import { useDispatch, useSelector } from 'react-redux';
import {
	DeleteIcon,
	DuplicateIcon,
	EditIcon,
	SendGreenIcon,
	SearchIcon,
	PreviewIcon,
} from '../../../assets/images/managment/index';
import ManagmentIcon from './Component/ManagmentIcon';
import { Title } from '../../../components/managment/Title';
import { ClassesType } from '../../Classes.types';
import DefaultScreen from '../../DefaultScreen';
import {
	buttonsDataProps,
	callToActionProps,
	commonAPIResponseProps,
	coreProps,
	deleteTemplateAPIProps,
	quickReplyButtonProps,
	savedTemplateCallToActionProps,
	savedTemplateCardProps,
	savedTemplateDataProps,
	savedTemplateMediaProps,
	savedTemplateQuickReplyProps,
	savedTemplateTextProps,
	templateDataProps,
	templateListAPIProps,
	templateListItemsProps,
	toastProps,
} from '../Editor/Types/WhatsappCreator.types';
import ClearIcon from '@material-ui/icons/Clear';
import clsx from 'clsx';
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import moment from 'moment';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import Pagination from './Component/Pagination';
import { ManagmentIconProps } from './Types/Management.types';
import AlertModal from '../Editor/Popups/AlertModal';
import WhatsappMobilePreview from '../Editor/Components/WhatsappMobilePreview';
import {
	deleteTemplate,
	duplicateTemplate,
	getAllTemplates,
	getSavedTemplatesPreviewById,
	submitTemplateDirect,
} from '../../../redux/reducers/whatsappSlice';
import { apiStatus, resetToastData, statusesByName } from '../Constant';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../../../components/Loader/Loader';
import Toast from '../../../components/Toast/Toast.component';

const ManageWhatsAppTemplates = ({ classes }: ClassesType) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { t: translator } = useTranslation();
	const { windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const ToastMessages = useSelector(
		(state: { whatsapp: { ToastMessages: toastProps } }) =>
			state.whatsapp.ToastMessages
	);
	const [isSubmitTemplateOpen, setIsSubmitTemplateOpen] =
		useState<boolean>(false);
	const [isPreviewTemplateOpen, setIsPreviewTemplateOpen] =
		useState<boolean>(false);
	const [isDeleteTemplateOpen, setIsDeleteTemplateOpen] =
		useState<boolean>(false);
	const [isDuplicateTemplateOpen, setIsDuplicateTemplateOpen] =
		useState<boolean>(false);
	const [campaignNameSearch, setCampaignNameSearch] = useState<string>('');
	const [campainStatusSearch, setCampainStatusSearch] = useState<string>('');
	const [isSearching, setSearching] = useState<boolean>(false);
	const [page, setPage] = useState<number>(1);
	const [rowsPerPage, setRowsPerPage] = useState<number>(6);
	const [templateData, setTemplateData] = useState<templateDataProps>({
		templateText: '',
		templateButtons: [],
	});
	const [buttonType, setButtonType] = useState<string>('');
	const [fileData, setFileData] = useState<string>('');
	const [isLoader, setIsLoader] = useState<boolean>(false);
	const [templateListData, setTemplateListData] = useState<
		templateListItemsProps[]
	>([]);
	const [tableData, setTableData] = useState<templateListItemsProps[]>([]);
	const [activeRowId, setActiveRowId] = useState<string>('');
	const [toastMessage, setToastMessage] =
		useState<toastProps['SUCCESS']>(resetToastData);
	const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
	const cellStyle = {
		head: classes.tableCellHead,
		body: classes.tableCellBody,
		root: classes.tableCellRoot,
	};
	const dateFormat = 'YYYY-MM-DD HH:mm:ss.FFF';
	let updatedTemplateData: templateDataProps = {
		templateText: '',
		templateButtons: [],
	};
	let updatedButtonType: string = '';
	let updatedFileData: string = '';

	useEffect(() => {
		setApiTemplateData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (campainStatusSearch?.length > 0 || campaignNameSearch?.length > 0) {
			setSearching(true);
		}
	}, [campaignNameSearch, campainStatusSearch]);

	const setApiTemplateData = async () => {
		setIsLoader(true);
		const templateData: templateListAPIProps = await dispatch<any>(
			getAllTemplates()
		);
		if (templateData.payload.Status === apiStatus.SUCCESS) {
			setTemplateListData(templateData.payload?.Data?.Items);
			setTableData(templateData.payload?.Data?.Items);
			setIsLoader(false);
		} else {
			setTemplateListData([]);
			setTableData([]);
			setIsLoader(false);
		}
	};

	const handleCampainNameChange = (event: BaseSyntheticEvent) => {
		setCampaignNameSearch(event.target.value);
	};
	const clearSearch = () => {
		setCampaignNameSearch('');
		setCampainStatusSearch('');
		setSearching(false);
		setTableData(templateListData);
	};
	const renderNameCell = (row: templateListItemsProps) => {
		let date = null;
		let text = '';
		if (!row.CreatedDate) {
			date = moment(row.StatusUpdatedDate, dateFormat);
			text = translator('common.UpdatedOn');
		} else {
			date = moment(row.CreatedDate, dateFormat);
			const dateMillis = date.valueOf();
			const currentDateMillis = moment().valueOf();
			text =
				dateMillis > currentDateMillis
					? translator('common.ScheduledFor')
					: translator('common.SentOn');
		}

		return (
			<>
				<CustomTooltip
					isSimpleTooltip={false}
					interactive={true}
					classes={{
						tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
						arrow: classes.fBlack,
					}}
					arrow={true}
					style={{ fontSize: 18, fontWeight: 'bold' }}
					placement={'top'}
					title={
						<Typography noWrap={false}>
							{row?.FriendlyTemplateName !== ''
								? row?.FriendlyTemplateName
								: row.TemplateName}
						</Typography>
					}
					text={row?.FriendlyTemplateName}
					children={undefined}
					icon={undefined}
				/>
				<Typography className={classes.grayTextCell}>
					{`${text} ${date.format('DD/MM/YYYY')} ${date.format('LT')}`}
				</Typography>
			</>
		);
	};
	const renderStatusCell = (status: string, rejectionReason: string) => {
		return (
			<>
				<Typography
					className={clsx(classes.middleText, classes.whatsappTemplatesStatus, {
						[classes.whatsappTemplateStatusCreated]: status === 'Created',
						[classes.whatsappTemplateStatusApproved]: status === 'Approved',
						[classes.whatsappTemplateStatusPending]: status === 'Pending',
						[classes.whatsappTemplateStatusReceived]: status === 'Received',
						[classes.whatsappTemplateStatusRejected]: status === 'Rejected',
					})}>
					<>
						{statusesByName[status]
							? translator(statusesByName[status])
							: status}
					</>
					{status === 'Rejected' && (
						<Typography
							className={classes.whatsappTemplateStatusRejectedReason}>
							{rejectionReason}
						</Typography>
					)}
				</Typography>
			</>
		);
	};

	const setButtonsData = (buttonType: string, data: buttonsDataProps[]) => {
		let buttonData: quickReplyButtonProps[] | callToActionProps = [];
		switch (buttonType) {
			case 'quickReply':
				buttonData = data?.map((button: buttonsDataProps) => {
					return {
						id: uniqid(),
						typeOfAction: '',
						fields: [
							{
								fieldName: 'whatsapp.websiteButtonText',
								type: 'text',
								placeholder: 'whatsapp.websiteButtonTextPlaceholder',
								value: button.title,
							},
						],
					};
				});
				return buttonData ? buttonData : [];
			case 'callToAction':
				buttonData = data?.map((button: buttonsDataProps) => {
					if (button?.type === 'PHONE') {
						return {
							id: uniqid(),
							typeOfAction: 'phonenumber',
							fields: [
								{
									fieldName: 'whatsapp.phoneButtonText',
									type: 'text',
									placeholder: 'whatsapp.phoneButtonTextPlaceholder',
									value: button.title,
								},
								{
									fieldName: 'whatsapp.country',
									type: 'select',
									placeholder: 'Select Your Country Code',
									value: '+972 Israel',
								},
								{
									fieldName: 'whatsapp.phoneNumber',
									type: 'tel',
									placeholder: 'whatsapp.phoneNumberPlaceholder',
									value: button.phone,
								},
							],
						};
					} else {
						return {
							id: uniqid(),
							typeOfAction: 'website',
							fields: [
								{
									fieldName: 'whatsapp.websiteButtonText',
									type: 'text',
									placeholder: 'whatsapp.websiteButtonTextPlaceholder',
									value: button.title,
								},
								{
									fieldName: 'whatsapp.websiteURL',
									type: 'text',
									placeholder: 'whatsapp.websiteURLPlaceholder',
									value: button.url,
								},
							],
						};
					}
				});
				return buttonData ? buttonData : [];
		}
	};

	const saveQuickreplyTemplate = (templateData: savedTemplateDataProps) => {
		const quickReplyData: savedTemplateQuickReplyProps =
			templateData?.types['quick-reply'];
		updatedButtonType = 'quickReply';
		const buttonData = setButtonsData('quickReply', quickReplyData?.actions);
		updatedTemplateData.templateText = quickReplyData?.body;
		updatedTemplateData.templateButtons = buttonData ? buttonData : [];
	};

	const saveCallToActionTemplate = (templateData: savedTemplateDataProps) => {
		const callToActionData: savedTemplateCallToActionProps =
			templateData?.types['call-to-action'];
		updatedButtonType = 'callToAction';
		const buttonData = setButtonsData(
			'callToAction',
			callToActionData?.actions
		);
		updatedTemplateData.templateText = callToActionData?.body;
		updatedTemplateData.templateButtons = buttonData ? buttonData : [];
	};

	const saveCardTemplate = (templateData: savedTemplateDataProps) => {
		const cardData: savedTemplateCardProps = templateData?.types['card'];
		updatedTemplateData.templateText = cardData?.title;
		if (cardData?.actions?.length > 0) {
			if (cardData?.actions[0]?.type !== 'QUICK_REPLY') {
				updatedButtonType = 'callToAction';
				const buttonData = setButtonsData('callToAction', cardData?.actions);
				updatedTemplateData.templateButtons = buttonData ? buttonData : [];
			} else {
				updatedButtonType = 'quickReply';
				const buttonData = setButtonsData('quickReply', cardData?.actions);
				updatedTemplateData.templateButtons = buttonData ? buttonData : [];
			}
		}
		if (cardData?.media?.length > 0) {
			updatedFileData = cardData?.media[0];
		}
	};

	const saveMediaTemplate = (templateData: savedTemplateDataProps) => {
		const mediaData: savedTemplateMediaProps = templateData?.types['media'];
		updatedTemplateData.templateText = mediaData?.body;
		if (mediaData?.media?.length > 0) {
			updatedFileData = mediaData?.media[0];
		}
	};

	const saveTextTemplate = (templateData: savedTemplateDataProps) => {
		const textData: savedTemplateTextProps = templateData?.types['text'];
		updatedTemplateData.templateText = textData?.body;
	};

	const setUpdatedTemplateData = (templateData: savedTemplateDataProps) => {
		if ('quick-reply' in templateData?.types) {
			saveQuickreplyTemplate(templateData);
		}
		if ('call-to-action' in templateData?.types) {
			saveCallToActionTemplate(templateData);
		} else if ('card' in templateData?.types) {
			saveCardTemplate(templateData);
		} else if ('media' in templateData?.types) {
			saveMediaTemplate(templateData);
		} else if ('text' in templateData?.types) {
			saveTextTemplate(templateData);
		}
	};

	const onSavedTemplateChange = (templateData: savedTemplateDataProps) => {
		if (templateData) {
			setUpdatedTemplateData(templateData);
		}
		setFileData(updatedFileData);
		setButtonType(updatedButtonType);
		setTemplateData(updatedTemplateData);
	};

	const getTemplateIdFromId = (id: string) => {
		return templateListData?.find(
			(template: templateListItemsProps) => id === template.Id?.toString()
		)?.TemplateId;
	};

	const onPreview = async (id: string) => {
		const templateData = templateListData?.find(
			(template) => template?.Id === Number(id)
		);
		if (templateData) {
			onSavedTemplateChange(templateData?.Data);
			setIsPreviewTemplateOpen(true);
		}
	};

	const onSend = async (templateId: string) => {
		const previewTemplateId = getTemplateIdFromId(templateId);
		if (previewTemplateId) {
			const templateData: templateListAPIProps = await dispatch<any>(
				getSavedTemplatesPreviewById({
					templateId: previewTemplateId,
				})
			);
			if (templateData.payload.Status === apiStatus.SUCCESS) {
				const templates = templateData.payload?.Data?.Items;
				if (templates && templates?.length > 0) {
					const templateData = templates[0];
					onSavedTemplateChange(templateData?.Data);
				}
				setIsSubmitTemplateOpen(true);
			} else {
				templateData?.payload?.Message
					? setToastMessage({
							...ToastMessages.ERROR,
							message: templateData?.payload?.Message,
					  })
					: setToastMessage(ToastMessages.ERROR);
			}
		}
	};

	const onRowIconClick = (key: string, Id: string) => {
		setActiveRowId(Id);
		switch (key) {
			case 'send':
				onSend(Id);
				break;
			case 'preview':
				onPreview(Id);
				break;
			case 'duplicate':
				setIsDuplicateTemplateOpen(true);
				break;
			case 'delete':
				setIsDeleteTemplateOpen(true);
				break;

			default:
				break;
		}
	};

	const renderCellIcons = (row: templateListItemsProps) => {
		const iconsMap: ManagmentIconProps[] = [
			{
				key: 'send',
				buttonKey: 'send',
				icon: SendGreenIcon,
				lable: translator('whatsappManagement.submit'),
				remove: row.Status !== 'Received',
				onClick: (key: string, Id: string) => onRowIconClick(key, Id),
				classes: classes,
				rootClass: classes.sendIcon,
				textClass: classes.sendIconText,
				id: row.Id.toString(),
			},
			{
				key: 'preview',
				buttonKey: 'preview',
				icon: PreviewIcon,
				lable: translator('whatsappManagement.preview'),
				remove: windowSize === 'xs',
				onClick: (key: string, Id: string) => onRowIconClick(key, Id),
				classes: classes,
				rootClass: classes.paddingIcon,
				id: row.Id.toString(),
			},
			{
				key: 'edit',
				buttonKey: 'edit',
				icon: EditIcon,
				disable: !row?.IsAllowEdit,
				lable: translator('campaigns.Image2Resource1.ToolTip'),
				onClick: (key: string, Id: string) => onRowIconClick(key, Id),
				classes: classes,
				rootClass: classes.paddingIcon,
				href: `/react/whatsapp/template/edit/${row?.Id?.toString()}`,
				id: row.Id.toString(),
			},
			{
				key: 'duplicate',
				buttonKey: 'duplicate',
				icon: DuplicateIcon,
				lable: translator('campaigns.lnkEditResource1.ToolTip'),
				onClick: (key: string, Id: string) => onRowIconClick(key, Id),
				classes: classes,
				rootClass: classes.paddingIcon,
				id: row.Id.toString(),
			},
			{
				key: 'delete',
				buttonKey: 'delete',
				icon: DeleteIcon,
				lable: translator('campaigns.DeleteResource1.HeaderText'),
				onClick: (key: string, Id: string) => onRowIconClick(key, Id),
				classes: classes,
				rootClass: classes.paddingIcon,
				id: row.Id?.toString(),
			},
		];
		return (
			<Grid
				container
				direction='row'
				justifyContent={windowSize === 'xs' ? 'flex-start' : 'flex-end'}
				alignItems='center'>
				{iconsMap.map((icon) => (
					<Grid
						className={icon?.disable ? classes.disabledCursor : ''}
						key={icon.key}
						item>
						<ManagmentIcon {...icon} />
					</Grid>
				))}
			</Grid>
		);
	};

	const getSearchedTemplate = () => {
		let searchedData: templateListItemsProps[] = templateListData;
		if (campaignNameSearch && campaignNameSearch?.length > 0) {
			searchedData = searchedData?.filter((row: templateListItemsProps) =>
				row.TemplateName?.includes(campaignNameSearch)
			);
		}
		if (campainStatusSearch && campainStatusSearch?.length > 0) {
			searchedData = searchedData?.filter((row: templateListItemsProps) =>
				row.Status?.includes(campainStatusSearch.trim())
			);
		}
		return searchedData;
	};

	const getRows = () => {
		let sortData = tableData;

		sortData = sortData?.slice(
			(page - 1) * rowsPerPage,
			(page - 1) * rowsPerPage + rowsPerPage
		);

		return sortData?.length > 0 ? sortData : [];
	};

	const onSubmitTemplate = async () => {
		const submitData: commonAPIResponseProps = await dispatch<any>(
			submitTemplateDirect({ id: activeRowId })
		);
		setIsSubmitTemplateOpen(false);
		if (submitData?.payload?.Status === apiStatus.SUCCESS) {
			setToastMessage(ToastMessages.SUBMIT_CAMPAIGN_SUCCESS);
			setApiTemplateData();
		} else {
			submitData?.payload?.Message
				? setToastMessage({
						...ToastMessages.ERROR,
						message: submitData?.payload?.Message,
				  })
				: setToastMessage(ToastMessages.ERROR);
		}
	};

	const onDeleteTemplate = async () => {
		const deleteData: deleteTemplateAPIProps = await dispatch<any>(
			deleteTemplate(activeRowId)
		);
		if (deleteData?.payload?.Status === apiStatus.SUCCESS) {
			setIsDeleteTemplateOpen(false);
			setToastMessage(ToastMessages.DELETE_CAMPAIGN_SUCCESS);
			setApiTemplateData();
		} else {
			deleteData?.payload?.Error
				? setToastMessage({
						...ToastMessages.ERROR,
						message: deleteData?.payload?.Error,
				  })
				: setToastMessage(ToastMessages.ERROR);
		}
	};

	const onDuplicaTemplate = async () => {
		const duplicateData: deleteTemplateAPIProps = await dispatch<any>(
			duplicateTemplate(activeRowId)
		);
		if (duplicateData?.payload?.Status === apiStatus.SUCCESS) {
			setIsDuplicateTemplateOpen(false);
			setToastMessage(ToastMessages.DELETE_TEMPLATE_SUCCESS);
			setApiTemplateData();
		} else {
			setIsDuplicateTemplateOpen(false);
			duplicateData?.payload?.Error
				? setToastMessage({
						...ToastMessages.ERROR,
						message: duplicateData?.payload?.Error,
				  })
				: setToastMessage(ToastMessages.ERROR);
		}
	};

	const onCreateTemplate = async () => {
		navigate('/react/whatsapp/template/create');
	};

	const onSearch = async () => {
		setPage(1);
		setTableData(getSearchedTemplate());
	};

	const resetToast = () => {
		setToastMessage(resetToastData);
	};

	const renderToast = () => {
		if (toastMessage.message?.length > 0) {
			setTimeout(() => {
				resetToast();
			}, 4000);
			return <Toast data={toastMessage} />;
		}
		return null;
	};

	return (
		<DefaultScreen
			subPage={'manage'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={false}
			containerClass={clsx(classes.management, classes.mb50)}>
			{renderToast()}
			<Title
				Text={translator('whatsappManagement.templateManagement')}
				classes={classes}
				ContainerStyle={{}}
				Element={null}
			/>

			<div className={classes.manageWhatsappTemplates}>
				<Grid container spacing={2} className={classes.lineTopMarging}>
					<Grid item lg={2}>
						<TextField
							variant='outlined'
							size='small'
							value={campaignNameSearch}
							onChange={handleCampainNameChange}
							className={clsx(classes.textField, classes.minWidth252)}
							placeholder={translator(
								'sms.GridBoundColumnResource2.HeaderText'
							)}
						/>
					</Grid>

					<Grid item lg={2}>
						<TextField
							select
							type='text'
							label={
								campainStatusSearch?.length > 0
									? ''
									: translator('whatsappManagement.status')
							}
							className={classes.whatsappManagementbuttonField}
							onChange={(e: BaseSyntheticEvent) =>
								setCampainStatusSearch(e.target.value)
							}
							value={campainStatusSearch}>
							{Object.keys(statusesByName)?.map((status: string) => (
								<MenuItem key={'no-data-template' + status} value={status}>
									<>{translator(statusesByName[status])}</>
								</MenuItem>
							))}
						</TextField>
					</Grid>

					<Grid item>
						<Button
							size='large'
							variant='contained'
							onClick={onSearch}
							className={classes.searchButton}
							endIcon={<SearchIcon />}>
							<>{translator('campaigns.btnSearchResource1.Text')}</>
						</Button>
					</Grid>
					{isSearching && (
						<Grid item>
							<Button
								size='large'
								variant='contained'
								onClick={clearSearch}
								className={classes.searchButton}
								endIcon={<ClearIcon />}>
								<>{translator('common.clear')}</>
							</Button>
						</Grid>
					)}
				</Grid>

				<Grid
					container
					spacing={2}
					className={classes.manageTemplatesHeaderButtons}>
					<div className={classes.manageTemplatesCreate}>
						<Button className={'green'} onClick={onCreateTemplate}>
							<>{translator('whatsappManagement.createTemplate')}</>
						</Button>
					</div>

					<span className={classes.manageTemplatesCampaignCount}>
						{tableData?.length || 0}{' '}
						<>{translator('whatsappManagement.templates')}</>
					</span>
				</Grid>

				<Grid
					container
					spacing={2}
					className={clsx(
						classes.manageTemplatesTableWrapper,
						classes.manageTemplatesTableWrapperPadding
					)}>
					<TableContainer>
						<Table className={classes.tableContainer}>
							{windowSize !== 'xs' && (
								<TableHead>
									<TableRow classes={rowStyle}>
										<TableCell
											classes={cellStyle}
											className={classes.flex3}
											align='center'>
											<>
												{translator('sms.GridBoundColumnResource2.HeaderText')}
											</>
										</TableCell>
										<TableCell
											classes={cellStyle}
											className={classes.flex1}
											align='center'>
											<>{translator('sms.StatusResource1.HeaderText')}</>
										</TableCell>
										<TableCell
											classes={{ root: classes.tableCellRoot }}
											className={classes.flex5}></TableCell>
									</TableRow>
								</TableHead>
							)}
							{getRows()?.length === 0 ? (
								<Box
									className={clsx(
										classes.flex,
										classes.justifyCenterOfCenter,
										classes.noDataRow
									)}>
									<Typography>
										<>{translator('common.NoDataTryFilter')}</>
									</Typography>
								</Box>
							) : (
								<>
									{getRows()?.map((row: templateListItemsProps, index) => (
										<TableRow
											key={`templateMaganement_${row.Id}_${index}`}
											classes={rowStyle}>
											<TableCell
												classes={cellStyle}
												align='center'
												className={clsx(classes.flex3, classes.tableCellBody)}>
												{renderNameCell(row)}
											</TableCell>
											<TableCell
												classes={cellStyle}
												align='center'
												className={clsx(classes.flex1, classes.tableCellBody)}>
												{renderStatusCell(row.Status, row.RejectionReason)}
											</TableCell>
											<TableCell
												component='th'
												scope='row'
												className={clsx(classes.flex5, classes.tableCellRoot)}>
												{renderCellIcons(row)}
											</TableCell>
										</TableRow>
									))}
								</>
							)}
						</Table>
					</TableContainer>
				</Grid>
				<Pagination
					classes={classes}
					rows={tableData?.length}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={(rowsNumber: number) =>
						setRowsPerPage(rowsNumber)
					}
					rowsPerPageOptions={[6, 10, 20, 50]}
					page={page}
					onPageChange={(pageNumber: number) => setPage(pageNumber)}
					returnPageOne={false}
				/>
			</div>

			<AlertModal
				classes={classes}
				isOpen={isSubmitTemplateOpen}
				onClose={() => setIsSubmitTemplateOpen(false)}
				title={translator('whatsapp.alertModal.ConfirmText')}
				subtitle={translator('whatsapp.alertModal.ConfirmTitle')}
				onConfirmOrYes={() => onSubmitTemplate()}
				type='submit'>
				<Box className={classes.alertModalContentMobile}>
					<WhatsappMobilePreview
						classes={classes}
						templateData={templateData}
						buttonType={buttonType}
						fileData={fileData}
					/>
				</Box>
			</AlertModal>

			<AlertModal
				classes={classes}
				isOpen={isPreviewTemplateOpen}
				onClose={() => setIsPreviewTemplateOpen(false)}
				title={translator('whatsappManagement.preview')}
				subtitle={''}
				onConfirmOrYes={() => setIsPreviewTemplateOpen(false)}
				type='alert'>
				<Box className={classes.alertModalContentMobile}>
					<WhatsappMobilePreview
						classes={classes}
						templateData={templateData}
						buttonType={buttonType}
						fileData={fileData}
					/>
				</Box>
			</AlertModal>

			<AlertModal
				classes={classes}
				isOpen={isDeleteTemplateOpen}
				onClose={() => setIsDeleteTemplateOpen(false)}
				title={translator('whatsappManagement.deleteTemplate')}
				subtitle={translator('whatsapp.alertModal.DeleteTitle')}
				type='delete'
				onConfirmOrYes={() => onDeleteTemplate()}
			/>

			<AlertModal
				classes={classes}
				isOpen={isDuplicateTemplateOpen}
				onClose={() => setIsDuplicateTemplateOpen(false)}
				title={translator('whatsappManagement.duplicate')}
				subtitle={translator('whatsappManagement.duplicateDesc')}
				type='delete'
				onConfirmOrYes={() => onDuplicaTemplate()}
			/>

			<Loader isOpen={isLoader} showBackdrop={true} />
		</DefaultScreen>
	);
};

export default ManageWhatsAppTemplates;
