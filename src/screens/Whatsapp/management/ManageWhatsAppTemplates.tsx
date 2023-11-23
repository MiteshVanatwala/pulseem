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
	quickReplyButtons,
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
import { AllTemplateReq, ManagmentIconProps } from './Types/Management.types';
import AlertModal from '../Editor/Popups/AlertModal';
import WhatsappMobilePreview from '../Editor/Components/WhatsappMobilePreview';
import {
	deleteTemplate,
	duplicateTemplate,
	getAllTemplates,
	submitTemplateDirect,
	userPhoneNumbers,
} from '../../../redux/reducers/whatsappSlice';
import {
	allTemplateInitialPagination,
	apiStatus,
	authenticationMockTemplate,
	authenticationTypes,
	categoryName,
	resetToastData,
	statusesByName,
	templateStatusIdsByStatusName,
} from '../Constant';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../../../components/Loader/Loader';
import Toast from '../../../components/Toast/Toast.component';
import { getTemplateName } from '../Common';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { phoneNumberAPIProps } from '../Campaign/Types/WhatsappCampaign.types';
import NoSetup from '../NoSetup/NoSetup';
import { getApiErrorResponseMessage } from '../Common';

const ManageWhatsAppTemplates = ({ classes }: ClassesType) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { t: translator } = useTranslation();
	const { windowSize, rowsPerPage } = useSelector(
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
	const [isStatusResonModal, setIsStatusResonModal] = useState<boolean>(false);
	const [failedTemplateReason, setFailedTemplateReason] = useState<string>('');
	const [templateNameSearch, setTemplateNameSearch] = useState<string>('');
	const [templateStatusSearch, setTemplateStatusSearch] = useState<string>('');
	const [isSearching, setSearching] = useState<boolean>(false);
	const [totalRecord, setTotalRecord] = useState<number>(0);
	const [templateData, setTemplateData] = useState<templateDataProps>({
		templateText: '',
		templateButtons: [],
	});
	const [paginationSetting, setPaginationSetting] = useState<AllTemplateReq>(
		allTemplateInitialPagination
	);
	const [buttonType, setButtonType] = useState<string>('');
	const [fileData, setFileData] = useState<{
		fileLink: string;
		fileType: string;
	}>({
		fileLink: '',
		fileType: '',
	});
	const [isAccountSetup, setIsAccountSetup] = useState<boolean>(true);
	const [isLoader, setIsLoader] = useState<boolean>(false);
	const [templateListData, setTemplateListData] = useState<
		templateListItemsProps[]
	>([]);
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
	let updatedFileData: {
		fileLink: string;
		fileType: string;
	} = {
		fileLink: '',
		fileType: '',
	};

	useEffect(() => {
		(async () => {
			setIsLoader(true);
			const { payload: phoneNumberData }: phoneNumberAPIProps =
				await dispatch<any>(userPhoneNumbers());
			if (
				phoneNumberData?.Status === apiStatus.SUCCESS &&
				phoneNumberData?.Data &&
				phoneNumberData?.Data?.length > 0
			) {
				setApiTemplateData(
					rowsPerPage
						? { ...paginationSetting, pageSize: Number(rowsPerPage) }
						: paginationSetting
				);
				if (rowsPerPage) {
					setPaginationSetting({
						...paginationSetting,
						pageSize: Number(rowsPerPage),
					});
				}
			} else {
				setIsLoader(false);
				setIsAccountSetup(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (templateStatusSearch?.length > 0 || templateNameSearch?.length > 0) {
			setSearching(true);
		}
	}, [templateNameSearch, templateStatusSearch]);

	const setApiTemplateData = async (
		pagination: AllTemplateReq = paginationSetting
	) => {
		setIsLoader(true);
		const templateData: templateListAPIProps = await dispatch<any>(
			getAllTemplates(pagination)
		);
		setIsLoader(false);
		if (templateData.payload.Status === apiStatus.SUCCESS) {
			setTemplateListData(templateData.payload?.Data?.Items);
			setTotalRecord(templateData?.payload?.Data?.TotalRecord);
		} else {
			setTemplateListData([]);
			setTotalRecord(0);
		}
	};

	const handleCampainNameChange = (event: BaseSyntheticEvent) => {
		setTemplateNameSearch(event.target.value);
	};
	const clearSearch = () => {
		setTemplateNameSearch('');
		setTemplateStatusSearch('');
		setSearching(false);
		const updatedPagination: AllTemplateReq = {
			...paginationSetting,
			pageNo: 1,
			templateName: '',
			templateStatus: 0,
		};
		setPaginationSetting(updatedPagination);
		setApiTemplateData(updatedPagination);
	};

	const onStatusResonClick = (row: templateListItemsProps) => {
		// setFailedTemplateReason(row?.RejectionReason);
		if (row?.RejectionReason?.includes('BODY is missing expected field')) {
			setFailedTemplateReason('invalidTemplateName');
		} else if (
			row?.RejectionReason?.includes('FOOTER is missing expected field')
		) {
			setFailedTemplateReason('noFooter');
		} else if (row?.RejectionReason?.includes('is not a valid phone number')) {
			setFailedTemplateReason('invalidPhone');
		} else if (
			row?.RejectionReason?.includes(
				'Character Limit Exceeded. The Body (or Content) field '
			)
		) {
			setFailedTemplateReason('characterExceeded');
		} else {
			setFailedTemplateReason('common');
		}
		setIsStatusResonModal(true);
	};

	const renderNameCell = (row: templateListItemsProps) => {
		let date = null;
		let text = '';
		if (!row.UpdatedOn) {
			date = moment(row.CreatedDate, dateFormat);
			text = translator('common.CreatedOn');
		} else {
			date = moment(row.UpdatedOn, dateFormat);
			text = translator('common.UpdatedOn');
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
					title={<Typography noWrap={false}>{getTemplateName(row)}</Typography>}
					text={row?.FriendlyTemplateName}
					children={undefined}
					icon={undefined}
					titleStyle={undefined}
				/>
				<Typography className={classes.grayTextCell}>
					{`${text} ${date.format('DD/MM/YYYY')} ${date.format('LT')}`}
				</Typography>
			</>
		);
	};

	const renderStatusCell = (row: templateListItemsProps) => {
		const { Status, RejectionReason } = row;
		return (
			<>
				<Typography
					className={clsx(classes.middleText, classes.whatsappTemplatesStatus, {
						[classes.whatsappTemplateStatusCreated]: Status === 'Created',
						[classes.whatsappTemplateStatusApproved]: Status === 'Approved',
						[classes.whatsappTemplateStatusPending]: Status === 'Pending',
						[classes.whatsappTemplateStatusReceived]: Status === 'Received',
						[classes.whatsappTemplateStatusRejected]: Status === 'Rejected',
					})}>
					<>
						<CustomTooltip
							isSimpleTooltip={false}
							interactive={true}
							classes={{
								tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
								arrow: classes.fBlack,
							}}
							arrow={true}
							placement={'top'}
							title={translator(statusesByName[Status] || Status)}
							text={translator(statusesByName[Status] || Status)}
							icon={undefined}
							style={undefined}
							titleStyle={undefined}>
							<span>
								{statusesByName[Status]
									? translator(statusesByName[Status])
									: Status}
							</span>
						</CustomTooltip>
					</>
					{Status === 'Rejected' && (
						// <CustomTooltip
						// 	isSimpleTooltip={false}
						// 	interactive={true}
						// 	classes={{
						// 		tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
						// 		arrow: classes.fBlack,
						// 	}}
						// 	arrow={true}
						// 	placement={'top'}
						// 	title={RejectionReason}
						// 	text={RejectionReason}
						// 	icon={undefined}
						// 	style={undefined}>
						// 	<Typography
						// 		onClick={() => onStatusResonClick(row)}
						// 		style={{ cursor: 'pointer', fontSize: '16px' }}
						// 		className={classes.whatsappTemplateStatusRejectedReason}>
						// 		{translator('whatsapp.displayError')}
						// 	</Typography>
						// </CustomTooltip>
						<Typography
							onClick={() => onStatusResonClick(row)}
							style={{ cursor: 'pointer', fontSize: '16px' }}
							className={classes.whatsappTemplateStatusRejectedReason}>
							{translator('whatsapp.displayError')}
						</Typography>
					)}
				</Typography>
			</>
		);
	};

	const renderCategoryCell = (categoryId: number) => {
		return (
			<>
				<Typography
					className={clsx(classes.middleText)}
					style={{ textTransform: 'capitalize' }}>
					{translator(`whatsapp.${categoryName[categoryId || 1]}`)}
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
					if (button?.type === 'PHONE_NUMBER') {
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
									value: '+972',
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
		if (cardData?.subtitle) updatedTemplateData.templateText += '\n' + cardData?.subtitle;
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
			updatedFileData.fileLink = cardData?.media[0];
		}
	};

	const saveMediaTemplate = (templateData: savedTemplateDataProps) => {
		const mediaData: savedTemplateMediaProps = templateData?.types['media'];
		updatedTemplateData.templateText = mediaData?.body;
		if (mediaData?.media?.length > 0) {
			updatedFileData.fileLink = mediaData?.media[0];
			updatedFileData.fileType = mediaData?.media_type;
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

	const onPreview = async (id: string) => {
		const templateData = templateListData?.find(
			(template) => template?.Id === Number(id)
		);
		if (templateData) {
			if (templateData.CategoryId === 3) {
				renderAuthenticationPreview(templateData);
			} else {
				onSavedTemplateChange(templateData?.Data);
			}
			setIsPreviewTemplateOpen(true);
		}
	};

	const onSend = async (templateId: string) => {
		const templateData = templateListData?.find(
			(template) => template?.Id === Number(templateId)
		);
		if (templateData) {
			if (templateData.CategoryId === 3) {
				renderAuthenticationPreview(templateData);
			} else {
				onSavedTemplateChange(templateData?.Data);
			}
			setIsSubmitTemplateOpen(true);
		} else {
			setToastMessage(ToastMessages.ERROR);
		}
	};

	const renderAuthenticationPreview = (templateData: any) => {
		setButtonType('quickReply');
		const buttonData: any = setButtonsData('quickReply', [
			{
				title: templateData.Data?.types?.authentication?.actions[0].copy_code_text,
				type: '',
				url: '',
				phone: '',
			}
		]);
		let template = `${authenticationMockTemplate[templateData.Language === 'en' ? authenticationTypes.AUTHENTICATIONEN : authenticationTypes.AUTHENTICATIONHEBREW].body}`;
		if (templateData.Data?.types?.authentication?.code_expiration_minutes) {
			template += `\n\n ${authenticationMockTemplate[templateData.Language === 'en' ? authenticationTypes.AUTHENTICATIONEN : authenticationTypes.AUTHENTICATIONHEBREW].subtitle.replace('X', `${templateData.Data?.types?.authentication?.code_expiration_minutes || 0}`)}`;
		}
		setTemplateData({
			templateText: template,
			templateButtons: buttonData,
		});
		setFileData({
			fileLink: '',
			fileType: ''
		});
	}

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
				remove: row.StatusId !== templateStatusIdsByStatusName.Created,
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
						className={clsx(
							icon?.disable ? classes.disabledCursor : '',
							icon.key === 'send' ? classes.greenTextColor : ''
						)}
						key={icon.key}
						item>
						<ManagmentIcon {...icon} />
					</Grid>
				))}
			</Grid>
		);
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
		setIsDeleteTemplateOpen(false);
		setIsLoader(true);
		const deleteData: deleteTemplateAPIProps = await dispatch<any>(
			deleteTemplate(activeRowId)
		);
		setIsLoader(false);
		if (deleteData?.payload?.Status === apiStatus.SUCCESS) {
			setToastMessage(ToastMessages.DELETE_TEMPLATE_SUCCESS);
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
		setIsDuplicateTemplateOpen(false);
		setIsLoader(true);
		const duplicateData: deleteTemplateAPIProps = await dispatch<any>(
			duplicateTemplate(activeRowId)
		);
		setIsLoader(false);
		if (duplicateData?.payload?.Status === apiStatus.SUCCESS) {
			setToastMessage(ToastMessages.DUPLICATE_TEMPLATE_SUCCESS);
			setApiTemplateData();
		} else {
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
		if (templateStatusSearch?.length > 0 || templateNameSearch?.length > 0) {
			const updatedPagination: AllTemplateReq = {
				...paginationSetting,
				pageNo: 1,
				templateName: templateNameSearch,
				templateStatus: templateStatusIdsByStatusName[templateStatusSearch],
			};
			setPaginationSetting(updatedPagination);
			setApiTemplateData(updatedPagination);
		} else {
			clearSearch();
		}
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

	const updatePaginationSetting = (pagination: AllTemplateReq) => {
		setApiTemplateData(pagination);
		setPaginationSetting(pagination);
	};

	const onRowsPerPageChange = (rowsNumber: number) => {
		dispatch(setRowsPerPage(rowsNumber));
		updatePaginationSetting({
			...paginationSetting,
			pageSize: rowsNumber,
			pageNo: 1,
		});
	};

	const onTemplateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const keyCode = e.keyCode ? e.keyCode : e.which;
		if (keyCode === 13) {
			onSearch();
		}
	};

	const getTemplateId = () => {
		return (
			templateListData?.find((template) => Number(activeRowId) === template?.Id)
				?.TemplateId || ''
		);
	};

	return (
		<DefaultScreen
			subPage={'manage'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={false}
			containerClass={clsx(classes.management, classes.mb50)}>
			{isAccountSetup ? (
				<>
					{renderToast()}
					<Title
						Text={translator('whatsappManagement.templateManagement')}
						Classes={classes}
						ContainerStyle={{}}
						Element={null}
					/>

					<div className={classes.manageWhatsappTemplates}>
						<Grid container spacing={2} className={classes.lineTopMarging}>
							<Grid item xs={6} lg={2}>
								<TextField
									variant='outlined'
									size='small'
									value={templateNameSearch}
									onChange={handleCampainNameChange}
									onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
										onTemplateKeyDown(e)
									}
									className={clsx(classes.textField, classes.minWidth252)}
									placeholder={translator('whatsapp.templateNamePlaceholder')}
								/>
							</Grid>

							<Grid
								item
								xs={6}
								lg={2}
								className={classes.whatsappManagementbuttonFieldFlexWrapper}>
								<TextField
									select
									type='text'
									label={
										templateStatusSearch?.length > 0 ? (
											''
										) : (
											<>{translator('whatsappManagement.status')}</>
										)
									}
									className={classes.whatsappManagementbuttonField}
									onChange={(e: BaseSyntheticEvent) =>
										setTemplateStatusSearch(e.target.value)
									}
									value={templateStatusSearch}>
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
								{totalRecord || 0}{' '}
								<>{translator('whatsappManagement.templates')}</>
							</span>
						</Grid>

						<Grid
							container
							spacing={2}
							className={clsx(classes.manageTemplatesTableWrapper)}>
							<TableContainer>
								<Table className={classes.tableContainer}>
									{windowSize !== 'xs' && (
										<TableHead>
											<TableRow classes={rowStyle}>
												<TableCell
													classes={cellStyle}
													className={classes.flex3}
													align='center'>
													<>{translator('whatsapp.templateName')}</>
												</TableCell>
												<TableCell
													classes={cellStyle}
													className={classes.flex2}
													align='center'>
													<>{translator('sms.StatusResource1.HeaderText')}</>
												</TableCell>
												<TableCell
													classes={cellStyle}
													className={classes.flex2}
													align='center'>
													<>{translator('report.ProductsReport.category')}</>
												</TableCell>
												<TableCell
													classes={{ root: classes.tableCellRoot }}
													className={classes.flex5}></TableCell>
											</TableRow>
										</TableHead>
									)}
									{templateListData?.length === 0 ? (
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
											{templateListData?.map(
												(row: templateListItemsProps, index) => (
													<TableRow
														key={`templateMaganement_${row.Id}_${index}`}
														classes={rowStyle}>
														<TableCell
															classes={cellStyle}
															align='center'
															className={clsx(
																classes.flex3,
																classes.tableCellBody
															)}>
															{renderNameCell(row)}
														</TableCell>
														<TableCell
															classes={cellStyle}
															align='center'
															className={clsx(
																classes.flex2,
																classes.tableCellBody
															)}>
															{renderStatusCell(row)}
														</TableCell>
														<TableCell
															classes={cellStyle}
															align='center'
															className={clsx(
																classes.flex2,
																classes.tableCellBody
															)}>
															{renderCategoryCell(row.CategoryId)}
														</TableCell>
														<TableCell
															component='th'
															scope='row'
															className={clsx(
																classes.flex5,
																classes.tableCellRoot
															)}>
															{renderCellIcons(row)}
														</TableCell>
													</TableRow>
												)
											)}
										</>
									)}
								</Table>
							</TableContainer>
						</Grid>
						<Pagination
							classes={classes}
							rows={totalRecord}
							rowsPerPage={paginationSetting?.pageSize}
							onRowsPerPageChange={onRowsPerPageChange}
							rowsPerPageOptions={[6, 10, 20, 50]}
							page={paginationSetting?.pageNo}
							onPageChange={(pageNumber: number) =>
								updatePaginationSetting({
									...paginationSetting,
									pageNo: pageNumber,
								})
							}
							returnPageOne={false}
						/>
					</div>

					<AlertModal
						classes={classes}
						isOpen={isSubmitTemplateOpen}
						onClose={() => setIsSubmitTemplateOpen(false)}
						// @ts-config
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
						// title={translator('whatsappManagement.preview')}
						title={
							getTemplateId()?.length > 0
								? `${translator(
										'whatsapp.alertModal.templateId'
								  )}: ${getTemplateId()}`
								: translator('whatsappManagement.preview')
						}
						subtitle={''}
						titleFontSize={getTemplateId()?.length > 0 ? '18px' : undefined}
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
						subtitle={translator('whatsapp.alertModal.DeleteTemplateTitle')}
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

					<AlertModal
						classes={classes}
						isOpen={isStatusResonModal}
						onClose={() => setIsStatusResonModal(false)}
						title={''}
						subtitle={translator(
							getApiErrorResponseMessage('templateError', failedTemplateReason)
						)}
						type='alert'
						onConfirmOrYes={() => onDuplicaTemplate()}
						direction='ltr'
					/>
				</>
			) : (
				!isLoader && <NoSetup classes={classes} />
			)}

			<Loader isOpen={isLoader} showBackdrop={true} />
		</DefaultScreen>
	);
};

export default ManageWhatsAppTemplates;
