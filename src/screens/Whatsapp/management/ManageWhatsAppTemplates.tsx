import {
	Box,
	Button,
	FormControl,
	Grid,
	MenuItem,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@material-ui/core';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';
import uniqid from 'uniqid';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import {
	DeleteIcon,
	DuplicateIcon,
	EditIcon,
	PreviewIcon,
	SearchIcon,
	SendIcon
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
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import moment from 'moment';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import { AllTemplateReq, ManagmentIconProps } from './Types/Management.types';
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
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { IoIosArrowDown } from 'react-icons/io';
import ConfirmationButtons from '../../../components/ConfirmationButtons/ConfirmationButtons';
import { sitePrefix } from '../../../config';
import { TablePagination } from '../../../components/managment';
import { TemplateErrorDialog } from '../../../components/TemplateErrorDialog/TemplateErrorDialog';
import { DateFormats } from '../../../helpers/Constants';
import { findPlanByFeatureCode } from '../../../redux/reducers/TiersSlice';
import TierPlans from '../../../components/TierPlans/TierPlans';

const ManageWhatsAppTemplates = ({ classes }: ClassesType) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { t: translator } = useTranslation();
	const { windowSize, rowsPerPage, isRTL, userRoles } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const ToastMessages = useSelector(
		(state: { whatsapp: { ToastMessages: toastProps } }) =>
			state.whatsapp.ToastMessages
	);
	const { currentPlan, availablePlans } = useSelector((state: any) => state.tiers);
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
	const [isAccountSetup, setIsAccountSetup] = useState<boolean | null>(null);
	const [isLoader, setIsLoader] = useState<boolean>(true);
	const [templateListData, setTemplateListData] = useState<
		templateListItemsProps[]
	>([]);
	const [activeRowId, setActiveRowId] = useState<string>('');
	const [dialogType, setDialogType] = useState<any>({});
	const [toastMessage, setToastMessage] =
		useState<toastProps['SUCCESS']>(resetToastData);
	const [TierMessageCode, setTierMessageCode] = useState<string>("");
	const [showTierPlans, setShowTierPlans] = useState(false);
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
				setIsAccountSetup(true);
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
					{`${text} ${date.format(DateFormats.DATE_TIME_24)}`}
				</Typography>
			</>
		);
	};

	const renderStatusCell = (row: templateListItemsProps) => {
		const { Status, RejectionReason } = row;
		return (
			<Typography
				className={clsx(classes.middleText, classes.whatsappTemplatesStatus, {
					[classes.whatsappTemplateStatusCreated]: Status === 'Created',
					[classes.whatsappTemplateStatusApproved]: Status === 'Approved',
					[classes.whatsappTemplateStatusPending]: Status === 'Pending',
					[classes.whatsappTemplateStatusReceived]: Status === 'Received',
					[classes.whatsappTemplateStatusRejected]: Status === 'Rejected',
				})}
			>
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
				{Status === 'Rejected' && (
					<Typography
						onClick={() => setDialogType({
							type: 'errorDialog',
							data: RejectionReason
						})}
						style={{ cursor: 'pointer', fontSize: '16px' }}
						className={classes.whatsappTemplateStatusRejectedReason}>
						{translator('whatsapp.displayError')}
					</Typography>
				)}
			</Typography>
		);
	};

	const renderCategoryCell = (categoryId: number) => {
		return (
			<Typography
				className={clsx(classes.middleText)}
				style={{ textTransform: 'capitalize' }}>
				{translator(`whatsapp.${categoryName[categoryId || 1]}`)}
			</Typography>
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
			setDialogType({
				type: 'preview',
				data: templateData?.TemplateId
			});
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
			setDialogType({
				type: 'submitTemplate',
				data: ''
			});
		} else {
			setToastMessage(ToastMessages.ERROR);
		}
	};

	const getAuthTemplate = (lang: string) => {
		switch (lang) {
			case 'he':
				return authenticationTypes.AUTHENTICATIONHEBREW;

			case 'pl':
				return authenticationTypes.AUTHENTICATIONPOLSKI;
		
			case 'en':
			default:
				return authenticationTypes.AUTHENTICATIONEN;
		}
	}

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
		let template = `${authenticationMockTemplate[getAuthTemplate(templateData.Language)].body}`;
		if (templateData.Data?.types?.authentication?.code_expiration_minutes) {
			template += `\n\n ${authenticationMockTemplate[getAuthTemplate(templateData.Language)].subtitle.replace('X', `${templateData.Data?.types?.authentication?.code_expiration_minutes || 0}`)}`;
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
				setDialogType({
					type: 'duplicate',
					data: ''
				});
				break;
			case 'delete':
				setDialogType({
					type: 'delete',
					data: ''
				});
				break;

			default:
				break;
		}
	};

	const renderCellIcons = (row: templateListItemsProps) => {
		const iconsMap: ManagmentIconProps[] = [
			{
				key: 'preview',
				buttonKey: 'preview',
				uIcon: PreviewIcon,
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
				uIcon: EditIcon,
				disable: !row?.IsAllowEdit,
				lable: translator('campaigns.Image2Resource1.ToolTip'),
				onClick: (key: string, Id: string) => onRowIconClick(key, Id),
				classes: classes,
				rootClass: classes.paddingIcon,
				href: `${sitePrefix}whatsapp/template/edit/${row?.Id?.toString()}`,
				id: row.Id.toString(),
			},
			{
				key: 'duplicate',
				buttonKey: 'duplicate',
				uIcon: DuplicateIcon,
				lable: translator('campaigns.lnkEditResource1.ToolTip'),
				onClick: (key: string, Id: string) => onRowIconClick(key, Id),
				classes: classes,
				rootClass: classes.paddingIcon,
				id: row.Id.toString(),
			},
			{
				key: 'delete',
				buttonKey: 'delete',
				remove: !userRoles?.AllowDelete,
				uIcon: DeleteIcon,
				lable: translator('campaigns.DeleteResource1.HeaderText'),
				onClick: (key: string, Id: string) => onRowIconClick(key, Id),
				classes: classes,
				rootClass: classes.paddingIcon,
				id: row.Id?.toString(),
			},
			{
				key: 'send',
				buttonKey: 'send',
				uIcon: SendIcon,
				lable: translator('whatsappManagement.submit'),
				remove: row.StatusId !== templateStatusIdsByStatusName.Created,
				onClick: (key: string, Id: string) => onRowIconClick(key, Id),
				classes: classes,
				rootClass: clsx(classes.sendIcon, 'sendIcon'),
				textClass: classes.sendIconText,
				id: row.Id.toString(),
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
						)}
						key={icon.key}
						item>
						<ManagmentIcon
							{...icon}
							uIcon={<icon.uIcon width={18} height={20} className={'rowIcon'} />}
						/>
					</Grid>
				))}
			</Grid>
		);
	};

	const onSubmitTemplate = async () => {
		setDialogType({});
		const submitData: commonAPIResponseProps = await dispatch<any>(
			submitTemplateDirect({ id: activeRowId })
		);

		if (submitData?.payload?.StatusCode === 927) {
			if (['WHATSAPP_MEDIA_ATTACHMENT', 'WHATSAPP_TEMPLATES', 'WHATSAPP_BUTTON_ATTACHMENT','WHATSAPP_CARD_MESSAGE'].indexOf(submitData?.payload?.Message) !== -1) {
				setTierMessageCode(submitData?.payload?.Message);
				setDialogType({ type: 'tier' })
			}
		}
		else if (submitData?.payload?.Status === apiStatus.SUCCESS) {
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
		setDialogType({});
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
		setDialogType({});
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

	const getDuplicateDialog = () => ({
		title: translator('whatsappManagement.duplicate'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }}>
				{translator('whatsappManagement.duplicateDesc')}
			</Typography>
		),
		renderButtons: () => <ConfirmationButtons
			classes={classes}
			onConfirm={() => onDuplicaTemplate()}
			onCancel={() => setDialogType({})}
		/>
	})

	const getDeleteDialog = () => ({
		title: translator('whatsappManagement.deleteTemplate'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{translator('whatsapp.alertModal.DeleteTemplateTitle')}
			</Typography>
		),
		renderButtons: () => <ConfirmationButtons
			classes={classes}
			onConfirm={() => onDeleteTemplate()}
			onCancel={() => setDialogType({})}
		/>
	})

	const getPreviewDialog = (templateId: string) => ({
		title: translator('whatsappManagement.preview'),
		showDivider: false,
		content: (
			<Box className={classes.alertModalContentMobile}>
				<WhatsappMobilePreview
					classes={classes}
					templateData={templateData}
					buttonType={buttonType}
					fileData={fileData}
					templateId={templateId}
				/>
			</Box>
		),
		renderButtons: () => (
			<Grid
				container
				spacing={4}
				className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
			>
				<Grid item>
					<Button
						variant='contained'
						size='small'
						onClick={() => { setDialogType(null) }}
						className={clsx(
							classes.btn,
							classes.btnRounded
						)}>
						{translator('common.Ok')}
					</Button>
				</Grid>
			</Grid>
		)
	})

	const getSubmitTemplateDialog = () => ({
		title: translator('whatsapp.alertModal.ConfirmText'),
		showDivider: false,
		content: (
			<>
				<div className={clsx(classes.pb25)}>{translator('whatsapp.alertModal.ConfirmTitle')}</div>
				<Box className={classes.alertModalContentMobile}>
					<WhatsappMobilePreview
						classes={classes}
						templateData={templateData}
						buttonType={buttonType}
						fileData={fileData}
					/>
				</Box>
			</>
		),
		renderButtons: () => <ConfirmationButtons
			classes={classes}
			onConfirm={() => onSubmitTemplate()}
			onCancel={() => setDialogType({})}
		/>
	})

	const handleGetPlanForFeature = (tierMessageCode: string) => {
		const planName = findPlanByFeatureCode(
			tierMessageCode,
			availablePlans,
			currentPlan.Id
		);
		
		if (planName) {
			return translator('billing.tier.featureNotAvailable').replace('{feature}', tierMessageCode).replace('{planName}', planName);
		} else {
			return translator('billing.tier.noFeatureAvailable');
		}
	};

	const getTierValidationDialog = () => ({
		title: translator('billing.tier.permission'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{handleGetPlanForFeature(TierMessageCode)}
			</Typography>
		),
		renderButtons: () => (
			<Grid
				container
				spacing={2}
				className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
			>
				<Grid item>
					<Button
						onClick={() => {
						setDialogType(null);
						setShowTierPlans(true);
					}}
					className={clsx(classes.btn, classes.btnRounded)}
					>
						{translator('billing.upgradePlan')}
					</Button>
				</Grid>
				<Grid item>
					<Button
						onClick={() => setDialogType(null)}
						className={clsx(classes.btn, classes.btnRounded)}
					>
						{translator('common.cancel')}
					</Button>
				</Grid>
			</Grid>
		)
	})

	const renderDialog = () => {
		const { type, data } = dialogType || {}
		let currentDialog: any = {};
		if (type === 'duplicate') {
			currentDialog = getDuplicateDialog();
		} else if (type === 'errorDialog') {
			currentDialog = TemplateErrorDialog({ classes, failedTemplateResponse: data, setDialogType, translator, isRTL });
		} else if (type === 'delete') {
			currentDialog = getDeleteDialog();
		} else if (type === 'preview') {
			currentDialog = getPreviewDialog(data);
		} else if (type === 'submitTemplate') {
			currentDialog = getSubmitTemplateDialog();
		} else if (type === 'tier') {
			currentDialog = getTierValidationDialog();
		}

		if (type) {
			return (
				dialogType && <BaseDialog
					contentStyle={type === 'errorDialog' ? classes.maxWidth400 : null}
					classes={classes}
					open={dialogType}
					onCancel={() => setDialogType({})}
					onClose={() => setDialogType({})}
					renderButtons={currentDialog?.renderButtons || null}
					{...currentDialog}>
					{currentDialog?.content}
				</BaseDialog>
			)
		}
	}

	const renderTableHead = () => {
		return (
			<TableHead>
				<TableRow classes={rowStyle}>
					<TableCell classes={cellStyle} className={classes.flex3} align='center'>{translator('whatsapp.templateName')}</TableCell>
					<TableCell classes={cellStyle} className={classes.flex2} align='center'>{translator('sms.StatusResource1.HeaderText')}</TableCell>
					<TableCell classes={cellStyle} className={classes.flex2} align='center'>{translator('report.ProductsReport.category')}</TableCell>
					<TableCell classes={{ root: classes.tableCellRoot }} className={classes.flex5}></TableCell>
				</TableRow>
			</TableHead>
		)
	}

	const renderRow = (row: templateListItemsProps, index: number) => {
		return (
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
	}

	const renderPhoneRow = (row: templateListItemsProps, index: number) => {
		return (
			<TableRow
				key={`templateMaganement_${row.Id}_${index}`}
				component='div'
				classes={rowStyle}>
				<TableCell style={{ flex: 2 }} classes={{ root: classes.tableCellRoot }}
					className={classes.p20}>
					<Box className={classes.justifyBetween}>
						<Box className={classes.inlineGrid}>
							{renderNameCell(row)}
						</Box>
						<Box className={classes.inlineGrid}>
							{renderStatusCell(row)}
						</Box>
					</Box>
					<Box className={classes.pt5}>
						<Typography
							className={clsx(classes.middleText)}
							style={{ textTransform: 'capitalize' }}
						>
							{translator('report.ProductsReport.category')}: {translator(`whatsapp.${categoryName[row.CategoryId || 1]}`)}
						</Typography>
					</Box>
					<Box className={classes.pt10}>
						{renderCellIcons(row)}
					</Box>
				</TableCell>
			</TableRow>
		)
	}

	const renderTableBody = () => {
		if (templateListData?.length === 0) {
			return (
				<Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }} >
					<Typography>{translator('common.NoDataTryFilter')}</Typography>
				</Box>
			)
		}
		return (
			<TableBody>
				{templateListData?.map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
			</TableBody>
		)
	}

	const renderTable = () => {
		return (
			<TableContainer className={clsx(classes.tableStyle, windowSize === 'xs' ? classes.mt20 : '')}>
				<Table className={classes.tableContainer}>
					<>
						{windowSize !== 'xs' && renderTableHead()}
						{renderTableBody()}
					</>
				</Table>
			</TableContainer>
		)
	}

	return (
		<DefaultScreen
			subPage={'manage'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={false}
			containerClass={clsx(classes.management, classes.mb50, classes.whatsapp)}>
			{isAccountSetup ? (
				<>
					{renderToast()}
					<Box className={clsx('topSection', classes.mb15)}>
						<Title
							Text={translator('whatsappManagement.templateManagement')}
							classes={classes}
							ContainerStyle={{}}
							Element={null}
						/>

						<Grid container spacing={2} className={clsx(classes.lineTopMarging, classes.paddingSides25)}>
							<Grid item xs={12} md={6} lg={2}>
								<TextField
									variant='outlined'
									size='small'
									className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252, 'fullWidth')}
									value={templateNameSearch}
									onChange={handleCampainNameChange}
									onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
										onTemplateKeyDown(e)
									}
									placeholder={translator('whatsapp.templateNamePlaceholder')}
								/>
							</Grid>

							<Grid
								item
								xs={12}
								md={6}
								lg={2}
							>
								<Box className='selectWrapper'>
									<FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
										<Select
											variant="standard"
											displayEmpty
											value={templateStatusSearch}
											defaultValue={templateStatusSearch}
											onChange={(event: SelectChangeEvent) => setTemplateStatusSearch(event.target.value)}
											IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
											MenuProps={{
												PaperProps: {
													style: {
														maxHeight: 300,
														direction: isRTL ? 'rtl' : 'ltr'
													},
												},
											}}
										>
											<MenuItem key="" value="" disabled>
												{translator("common.select")}
											</MenuItem>
											{
												Object.keys(statusesByName)?.map((item: any, index: any) => {
													return <MenuItem
														key={index}
														value={item}
													>
														{translator(statusesByName[item])}
													</MenuItem>
												})
											}
										</Select>
									</FormControl>
								</Box>
							</Grid>

							<Grid item>
								<Button
									size='large'
									variant='contained'
									onClick={onSearch}
									className={clsx(
										classes.btn,
										classes.btnRounded
									)}
									endIcon={<SearchIcon />}
								>
									{translator('campaigns.btnSearchResource1.Text')}
								</Button>
							</Grid>
							{isSearching && (
								<Grid item>
									<Button
										size='large'
										variant='contained'
										onClick={clearSearch}
										className={clsx(
											classes.btn,
											classes.btnRounded
										)}
										endIcon={<ClearIcon />}
									>
										{translator('common.clear')}
									</Button>
								</Grid>
							)}
						</Grid>
					</Box>

					<div className={classes.manageWhatsappTemplates}>
						<Grid
							container
							spacing={2}
							className={classes.manageTemplatesHeaderButtons}>
							<div className={classes.manageTemplatesCreate}>
								<Button onClick={onCreateTemplate} className={clsx(classes.btn, classes.btnRounded)}>
									{translator('whatsappManagement.createTemplate')}
								</Button>
							</div>

							<span className={classes.manageTemplatesCampaignCount}>
								{totalRecord || 0}{' '}
								{translator('whatsappManagement.templates')}
							</span>
						</Grid>

						<Grid
							container
							spacing={2}
							className={windowSize !== 'xs' ? classes.manageTemplatesTableWrapper : ''}
						>
							{renderTable()}
						</Grid>
						<TablePagination
							classes={classes}
							rows={totalRecord}
							rowsPerPage={paginationSetting?.pageSize}
							onRowsPerPageChange={onRowsPerPageChange}
							// @ts-ignore
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
				</>
			) : (
				!isLoader && <NoSetup classes={classes} />
			)}

			{renderDialog()}
			<Loader isOpen={isLoader} showBackdrop={true} />
			{showTierPlans && <TierPlans
				classes={classes}
				isOpen={showTierPlans}
				onClose={() => setShowTierPlans(false)}
			/>}
		</DefaultScreen>
	);
};

export default ManageWhatsAppTemplates;
