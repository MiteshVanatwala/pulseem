import {
	Box,
	Button,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@material-ui/core';
import uniqid from 'uniqid';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
	AutomationIcon,
	DeleteIcon,
	DuplicateIcon,
	EditIcon,
	SearchIcon,
	GroupsIcon,
	PreviewIcon,
	CalendarIcon,
	SendIcon,
} from '../../../assets/images/managment/index';
import ManagmentIcon from './Component/ManagmentIcon';
import { Title } from '../../../components/managment/Title';
import { ClassesType } from '../../Classes.types';
import DefaultScreen from '../../DefaultScreen';
import {
	buttonsDataProps,
	callToActionProps,
	campaignListAPIProps,
	commonAPIResponseProps,
	coreProps,
	quickReplyButtonProps,
	restoreCampaignData,
	savedTemplateCallToActionProps,
	savedTemplateCardProps,
	savedTemplateDataProps,
	savedTemplateMediaProps,
	savedTemplateQuickReplyProps,
	savedTemplateTextProps,
	templateDataProps,
	templateListAPIProps,
	toastProps,
} from '../Editor/Types/WhatsappCreator.types';
import ClearIcon from '@material-ui/icons/Clear';
import clsx from 'clsx';
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import moment from 'moment';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import {
	allCampaignInitialPagination,
	apiStatus,
	campaignStatus,
	campaignStatuses,
	resetToastData,
	authenticationMockTemplate,
	authenticationTypes
} from '../Constant';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { AllCampaignReq, ManagmentIconProps } from './Types/Management.types';
import WhatsappMobilePreview from '../Editor/Components/WhatsappMobilePreview';
import {
	deleteCampaign,
	duplicateCampaign,
	getAllCampaigns,
	getSavedTemplatesPreviewById,
	restoreWhatsAppCampaigns,
	userPhoneNumbers,
} from '../../../redux/reducers/whatsappSlice';
import { useNavigate } from 'react-router-dom';
import {
	campaignDataProps,
	phoneNumberAPIProps,
} from '../Campaign/Types/WhatsappCampaign.types';
import { Loader } from '../../../components/Loader/Loader';
import Toast from '../../../components/Toast/Toast.component';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import NoSetup from '../NoSetup/NoSetup';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { RestorDialogContent, TablePagination } from '../../../components/managment';
import { sitePrefix } from '../../../config';
import ConfirmationButtons from '../../../components/ConfirmationButtons/ConfirmationButtons';
import { pulseemNewTab } from '../../../helpers/Functions/functions';
import { DateFormats } from '../../../helpers/Constants';

const ManageWhatsAppCampaigns = ({ classes }: ClassesType) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { t: translator } = useTranslation();
	const { windowSize, rowsPerPage, isRTL } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const ToastMessages = useSelector(
		(state: { whatsapp: { ToastMessages: toastProps } }) =>
			state.whatsapp.ToastMessages
	);
	const [fromDate, handleFromDate] = useState<MaterialUiPickersDate | null>(
		null
	);
	const [activeRowId, setActiveRowId] = useState<string>('');
	const [toDate, handleToDate] = useState<MaterialUiPickersDate | null>(null);
	const [campaignNameSearch, setCampaignNameSearch] = useState<string>('');
	const [isSearching, setSearching] = useState<boolean>(false);
	const [dialogType, setDialogType] = useState<any>({});
	const [restoreArray, setRestoreArray] = useState<any>([])

	const [templateData, setTemplateData] = useState<templateDataProps>({
		templateText: '',
		templateButtons: [],
	});
	const [totalRecord, setTotalRecord] = useState<number>(0);
	const [paginationSetting, setPaginationSetting] = useState<AllCampaignReq>(
		allCampaignInitialPagination
	);
	const [buttonType, setButtonType] = useState<string>('');
	const [fileData, setFileData] = useState<{
		fileLink: string;
		fileType: string;
	}>({
		fileLink: '',
		fileType: '',
	});

	const [infoModalData, setInfoModalData] = useState<string[]>([
		'Group 1',
		'Group 2',
	]);
	const [isFromDatePickerOpen, setIsFromDatePickerOpen] =
		useState<boolean>(false);
	const [isToDatePickerOpen, setIsToDatePickerOpen] = useState<boolean>(false);
	const [isAccountSetup, setIsAccountSetup] = useState<boolean | null>(null);
	const [isLoader, setIsLoader] = useState<boolean>(true);
	const [campaignListData, setCampaignListData] = useState<campaignDataProps[]>(
		[]
	);
	const [deletedCampaignListData, setDeletedCampaignListData] = useState<
		campaignDataProps[]
	>([]);
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
				setApiCampaignData(
					rowsPerPage
						? { ...paginationSetting, pageSize: Number(rowsPerPage) }
						: paginationSetting,
					true
				);
				if (rowsPerPage) {
					setPaginationSetting({
						...paginationSetting,
						pageSize: Number(rowsPerPage),
					});
				}
				setIsAccountSetup(true);
			} else {
				setIsAccountSetup(false);
			}
			setIsLoader(false);
		})();
		/**
		 * we disable it because we want to run this code only when component loads
		 */
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (
			(fromDate && moment(fromDate).format('DD/MM/YYYY')?.length > 0) ||
			(toDate && moment(toDate).format('DD/MM/YYYY')?.length > 0) ||
			campaignNameSearch?.length > 0
		) {
			setSearching(true);
		}
	}, [fromDate, toDate, campaignNameSearch]);

	const handleFromDateChange = (value: MaterialUiPickersDate | null) => {
		if (toDate && value && value > toDate) {
			handleToDate(null);
		}
		handleFromDate(value);
	};
	const handleCampainNameChange = (event: BaseSyntheticEvent) => {
		setCampaignNameSearch(event.target.value);
	};
	const clearSearch = () => {
		setCampaignNameSearch('');
		handleFromDate(null);
		handleToDate(null);
		setSearching(false);

		const updatedPagination: AllCampaignReq = {
			...paginationSetting,
			pageNo: 1,
			campaignName: '',
			fromDate: null,
			toDate: null,
		};
		setPaginationSetting(updatedPagination);
		setApiCampaignData(updatedPagination, false);
	};
	const renderNameCell = (row: campaignDataProps) => {
		let date = null;
		let text = '';
		if (!row?.SendDate) {
			date = moment(row.UpdateDate, dateFormat);
			text = translator('common.UpdatedOn');
		} else {
			date = moment(row.SendDate, dateFormat);
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
					title={<Typography noWrap={false}>{row.Name}</Typography>}
					text={row.Name}
					titleStyle={undefined}
					children={undefined}
					icon={undefined}
				/>
				<Typography className={classes.grayTextCell}>
					{`${text} ${date.format(DateFormats.DATE_TIME_24)}`}
				</Typography>
			</>
		);
	};
	const renderRecipientsCell = (recipients: number) => {
		return (
			<>
				<Typography className={classes.middleText}>
					{recipients?.toLocaleString()}
				</Typography>
				<Typography className={classes.middleText}>
					{translator('campaigns.recipients')}
				</Typography>
			</>
		);
	};

	const renderMessagesCell = (messages: number) => {
		return (
			<>
				<Typography className={classes.middleText}>
					{messages.toLocaleString()}
				</Typography>
				<Typography className={classes.middleText}>
					{translator('sms.CreditsResource1.HeaderText')}
				</Typography>
			</>
		);
	};
	const renderStatusCell = (status: number) => {
		return (
			// <Box className={classes.justifyBetween}>
				<Typography
					className={clsx(classes.middleText, classes.whatsappCampaignStatus, {
						[classes.whatsappCampaignStatusCreated]:
							status === campaignStatuses.CREATED,
						[classes.whatsappCampaignStatusSending]:
							status === campaignStatuses.SENDING,
						[classes.whatsappCampaignStatusStopped]:
							status === campaignStatuses.STOPPED,
						[classes.whatsappCampaignStatusFinished]:
							status === campaignStatuses.FINISHED,
						[classes.whatsappCampaignStatusCanceled]:
							status === campaignStatuses.CANCELED,
					})}
				>
					{translator(
						`whatsappManagement.${campaignStatus[
							status
						]?.toLocaleLowerCase()}`
					)}
				</Typography>
			// </Box>
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

	const getTemplateIdFromId = (id: string) => {
		return campaignListData?.find(
			(campaign: campaignDataProps) => id === campaign.WACampaignID?.toString()
		)?.TemplateId;
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

	const onPreview = async (campaignId: string) => {
		const previewTemplateId = getTemplateIdFromId(campaignId);
		if (previewTemplateId) {
			setIsLoader(true);
			const templateData: templateListAPIProps = await dispatch<any>(
				getSavedTemplatesPreviewById({
					templateId: previewTemplateId,
				})
			);
			setIsLoader(false);
			if (templateData.payload.Status === apiStatus.SUCCESS) {
				const templates = templateData.payload?.Data?.Items;
				if (templates && templates?.length > 0) {
					const templateData = templates[0];
					if (templateData.CategoryId === 3) {
						renderAuthenticationPreview(templateData);
					} else {
						onSavedTemplateChange(templateData?.Data);
					}
				}
				setDialogType({type: 'preview', data: previewTemplateId})
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

	const onGroups = (campaignId: string) => {
		let modalData: string[] = [];
		setDialogType({type: 'group'})
		const campaign = campaignListData?.find(
			(campaign: campaignDataProps) =>
				campaignId === campaign.WACampaignID?.toString()
		);
		if (campaign && campaign?.Groups) {
			if (typeof campaign?.Groups === 'string') {
				modalData.push(campaign.Groups?.toString());
				setInfoModalData(modalData);
			} else {
				modalData = [...campaign.Groups];
				setInfoModalData(modalData);
			}
		}
	};

	const onRowIconClick = (key: string, campaignId: string) => {
		setActiveRowId(campaignId);
		switch (key) {
			case 'preview':
				onPreview(campaignId);
				break;
			case 'duplicate':
				setDialogType({
					type: 'duplicate'
				})
				break;
			case 'groups':
				onGroups(campaignId);
				break;
			case 'automation':
				pulseemNewTab(`CreateAutomations.aspx?Mode=show&AutomationID=${campaignId}&fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`);
				break;
			case 'delete':
				setDialogType({
					type: 'delete'
				})
				break;

			default:
				break;
		}
	};

	const renderCellIcons = (row: campaignDataProps) => {
		const { Status, AutomationID, Groups, AutomationTriggerInActive } = row;
		const iconsMap: ManagmentIconProps[] = [
			{
				key: 'preview',
				buttonKey: 'preview',
				uIcon: PreviewIcon,
				icon: '',
				lable: translator('campaigns.Image1Resource1.ToolTip'),
				remove: windowSize === 'xs',
				rootClass: classes.paddingIcon,
				onClick: (key: string, id: string) => onRowIconClick(key, id),
				classes: classes,
				id: row.WACampaignID.toString(),
			},
			{
				key: 'edit',
				buttonKey: 'edit',
				uIcon: EditIcon,
				icon: '',
				disable: Status !== 1 || AutomationID !== 0,
				lable: translator('campaigns.Image2Resource1.ToolTip'),
				rootClass: classes.paddingIcon,
				onClick: (key: string, id: string) => onRowIconClick(key, id),
				classes: classes,
				id: row.WACampaignID.toString(),
				href: `${sitePrefix}whatsapp/campaign/edit/page1/${row.WACampaignID}`,
			},
			{
				key: 'duplicate',
				buttonKey: 'duplicate',
				uIcon: DuplicateIcon,
				icon: '',
				lable: translator('campaigns.lnkEditResource1.ToolTip'),
				rootClass: classes.paddingIcon,
				onClick: (key: string, id: string) => onRowIconClick(key, id),
				classes: classes,
				id: row.WACampaignID.toString(),
			},
			{
				key: 'groups',
				buttonKey: 'groups',
				uIcon: GroupsIcon,
				icon: '',
				disable: Groups?.length === 0 ? true : false,
				lable: translator('campaigns.lnkPreviewResource1.ToolTip'),
				remove: windowSize === 'xs',
				rootClass: classes.paddingIcon,
				onClick: (key: string, id: string) => onRowIconClick(key, id),
				classes: classes,
				id: row.WACampaignID.toString(),
			},
			{
				key: 'automation',
				buttonKey: 'automation',
				uIcon: AutomationIcon,
				icon: '',
				disable: AutomationID === 0,
				remove: windowSize === 'xs',
				lable: translator('campaigns.automation'),
				rootClass: classes.paddingIcon,
				onClick: (key: string, id: string) => onRowIconClick(key, `${AutomationID}`),
				classes: classes,
				id: row.WACampaignID.toString(),
			},
			{
				key: 'delete',
				buttonKey: 'delete',
				uIcon: DeleteIcon,
				icon: '',
				disable: AutomationID !== 0,
				rootClass: classes.paddingIcon,
				lable: translator('campaigns.DeleteResource1.HeaderText'),
				onClick: (key: string, id: string) => onRowIconClick(key, id),
				classes: classes,
				id: row.WACampaignID.toString(),
			},
			{
				key: 'send',
				buttonKey: 'send',
				uIcon: SendIcon,
				lable: translator('campaigns.imgSendResource1.ToolTip'),
				remove: Status !== 1 || (AutomationID !== 0 && AutomationTriggerInActive === false),
				rootClass: clsx(classes.sendIcon, 'sendIcon'),
				textClass: classes.sendIconText,
				onClick: (key: string, id: string) => onRowIconClick(key, id),
				classes: classes,
				id: row.WACampaignID.toString(),
				href: `${sitePrefix}whatsapp/campaign/edit/page2/${row.WACampaignID}`,
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
							icon?.disable ? classes.disabledCursor : ''
						)}
						key={icon.key}
						item>
						<ManagmentIcon
							{...icon}
							uIcon={icon?.uIcon && <icon.uIcon width={18} height={20} className={'rowIcon'} />}
						/>
					</Grid>
				))}
			</Grid>
		);
	};

	const onDuplicateCampaign = async () => {
		setDialogType({});
		setIsLoader(true);
		const deleteData: commonAPIResponseProps = await dispatch<any>(
			duplicateCampaign(activeRowId)
		);
		setIsLoader(false);
		if (deleteData?.payload?.Status === apiStatus.SUCCESS) {
			setToastMessage(ToastMessages.DUPLICATE_CAMPAIGN_SUCCESS);
			setApiCampaignData();
		} else {
			deleteData?.payload?.Message
				? setToastMessage({
					...ToastMessages.ERROR,
					message: deleteData?.payload?.Message,
				})
				: setToastMessage(ToastMessages.ERROR);
		}
	};

	const onDeleteCampaign = async () => {
		setDialogType({});
		setIsLoader(true);
		const deleteData: commonAPIResponseProps = await dispatch<any>(
			deleteCampaign(activeRowId)
		);
		setIsLoader(false);
		if (deleteData?.payload?.Status === apiStatus.SUCCESS) {
			setToastMessage(ToastMessages.DELETE_CAMPAIGN_SUCCESS);
			setApiCampaignData();
		} else {
			deleteData?.payload?.Message
				? setToastMessage({
					...ToastMessages.ERROR,
					message: deleteData?.payload?.Message,
				})
				: setToastMessage(ToastMessages.ERROR);
		}
	};

	const onRestoreDeleted = async () => {
		setIsLoader(true);
		const { payload: restoreCampaignData }: restoreCampaignData =
			await dispatch<any>(
				restoreWhatsAppCampaigns(restoreArray?.map((id: any) => Number(id)))
			);
		setIsLoader(false);
		if (restoreCampaignData?.Status === apiStatus.SUCCESS) {
			setToastMessage(ToastMessages.RESTORE_CAMPAIGN_SUCCESS);
			setApiCampaignData();
		} else {
			restoreCampaignData?.Message
				? setToastMessage({
					...ToastMessages.ERROR,
					message: restoreCampaignData?.Message,
				})
				: setToastMessage(ToastMessages.ERROR);
		}
	};

	const onSearch = async () => {
		const updatedPagination: AllCampaignReq = {
			...paginationSetting,
			pageNo: 1,
			campaignName: campaignNameSearch || '',
			fromDate: fromDate || null,
			toDate: toDate || null,
		};
		setPaginationSetting(updatedPagination);
		setApiCampaignData(updatedPagination);
	};

	const onCreateCampaign = async () => {
		navigate('/react/whatsapp/campaign/create/page1');
	};

	const setApiCampaignData = async (
		pagination: AllCampaignReq = paginationSetting,
		updateDeletedCampaigns: boolean = true
	) => {
		setIsLoader(true);
		const { payload: campaignData }: campaignListAPIProps = await dispatch<any>(
			getAllCampaigns(pagination)
		);
		const { payload: allCampaignData }: campaignListAPIProps =
			await dispatch<any>(
				getAllCampaigns({
					...pagination,
					isPagination: false,
					campaignName: '',
					fromDate: null,
					toDate: null,
					isDeleted: true,
				})
			);
		setIsLoader(false);
		if (campaignData.Status === apiStatus.SUCCESS) {
			const filteredCampaignData = campaignData?.Data?.Items?.filter(
				(campaign) => !campaign?.IsDeleted
			);
			setCampaignListData(filteredCampaignData);
			setTotalRecord(campaignData?.Data?.TotalRecord);
		} else {
			setCampaignListData([]);
			setTotalRecord(0);
		}

		if (updateDeletedCampaigns) {
			// for restore
			if (allCampaignData.Status === apiStatus.SUCCESS) {
				const deletedCampaignData = allCampaignData?.Data?.Items?.filter(
					(campaign) => campaign?.IsDeleted
				);
				setDeletedCampaignListData(deletedCampaignData);
			} else {
				setDeletedCampaignListData([]);
			}
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

	const updatePaginationSetting = (pagination: AllCampaignReq) => {
		setApiCampaignData(pagination, false);
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

	const getDeleteDialog = () => ({
    title: translator('whatsappManagement.deleteCampaign'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
        {translator('whatsappManagement.deleteCampaignDesc')}
      </Typography>
    ),
		renderButtons: () => <ConfirmationButtons
			classes={classes}
			onConfirm={() => onDeleteCampaign()}
			onCancel={() => setDialogType({})}
		/>
  })

	const getDuplicateDialog = () => ({
    title: translator('whatsappManagement.duplicateCampaign'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }}>
        {translator('whatsappManagement.duplicateCampaignDesc')}
      </Typography>
    ),
		renderButtons: () => <ConfirmationButtons
			classes={classes}
			onConfirm={() => onDuplicateCampaign()}
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
	
	const getGroup = () => ({
    title: translator('whatsappManagement.campaignGroups'),
    showDivider: false,
    content: (
			<ul className={classes.validationAlertModalUl}>
				{infoModalData?.map((requiredField: string, index: number) => (
					<li key={index} className={classes.infoAlertModalLi}>
						{requiredField}
					</li>
				))}
			</ul>
    ),
    onConfirm: async () => {
			setDialogType({
				type: '',
				data: ''
			});
    }
  })

	const handleRestoreDeleteChange = (WACampaignID: any) => () => {
		const found = restoreArray.includes(WACampaignID)
    if (found) {
      setRestoreArray(restoreArray.filter((restore: any) => restore !== WACampaignID))
    } else {
      setRestoreArray([...restoreArray, WACampaignID])
    }
  }

	const getRestoreDeletedDialog = (data = []) => {
    if (!data || !Array.isArray(data)) return null
    return {
      title: translator('whatsappManagement.restoreDeleted'),
      showDivider: true,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE185'}
        </div>
      ),
      content: (
        <RestorDialogContent
          classes={classes}
          data={deletedCampaignListData}
          currentChecked={restoreArray}
          onChange={handleRestoreDeleteChange}
          dataIdVar='WACampaignID'
        />
      ),
      onConfirm: async () => {
				setDialogType({
					type: '',
					data: ''
				});
        onRestoreDeleted();
      }
    }
  }

	const renderDialog = () => {
    const { type, data } = dialogType || {}
		let currentDialog: any = {};
		if (type === 'duplicate') {
    	currentDialog = getDuplicateDialog();
		} else if (type === 'group') {
    	currentDialog = getGroup();
		} else if (type === 'delete') {
			currentDialog = getDeleteDialog();
		} else if (type === 'preview') {
			currentDialog = getPreviewDialog(data);
		} else if (type === 'restoreDeleted') {
			currentDialog = getRestoreDeletedDialog();
		}

		if (type) {
			return (
				dialogType && <BaseDialog
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
					<TableCell classes={cellStyle} className={classes.flex3} align='center'>{translator('sms.GridBoundColumnResource2.HeaderText')}</TableCell>
					<TableCell classes={cellStyle} className={classes.flex1} align='center'>{translator('campaigns.recipients')}</TableCell>
					<TableCell classes={cellStyle} className={classes.flex1} align='center'>{translator('sms.CreditsResource1.HeaderText')}</TableCell>
					<TableCell classes={cellStyle} className={classes.flex1} align='center'>{translator('sms.StatusResource1.HeaderText')}</TableCell>
					<TableCell classes={{root: classes.tableCellRoot}} className={classes.flex5}></TableCell>
				</TableRow>
			</TableHead>
    )
  }

	const renderRow = (campaign: campaignDataProps) => {
    return (
      <TableRow
				key={campaign.WACampaignID}
				classes={rowStyle}>
				<TableCell
					classes={cellStyle}
					align='center'
					className={clsx(
						classes.flex3,
						classes.tableCellBody
					)}>
					{renderNameCell(campaign)}
				</TableCell>
				<TableCell
					classes={cellStyle}
					align='center'
					className={clsx(
						classes.flex1,
						classes.tableCellBody
					)}>
					{renderRecipientsCell(campaign.TotalSendPlan)}
				</TableCell>
				<TableCell
					classes={cellStyle}
					align='center'
					className={clsx(
						classes.flex1,
						classes.tableCellBody
					)}>
					{renderMessagesCell(1)}
				</TableCell>
				<TableCell
					classes={cellStyle}
					align='center'
					className={clsx(
						classes.flex1,
						classes.tableCellBody
					)}>
					{renderStatusCell(campaign.Status)}
				</TableCell>
				<TableCell
					component='th'
					scope='row'
					className={clsx(
						classes.flex5,
						classes.tableCellRoot
					)}>
					{renderCellIcons(campaign)}
				</TableCell>
			</TableRow>
    )
  }

  const renderPhoneRow = (campaign: campaignDataProps) => {
    return (
			<TableRow
        key={campaign.WACampaignID}
        component='div'
        classes={rowStyle}>
        <TableCell style={{ flex: 2 }} classes={{ root: classes.tableCellRoot }}
          className={classes.p20}>
          <Box className={classes.justifyBetween}>
            <Box className={classes.inlineGrid}>
              {renderNameCell(campaign)}
            </Box>
            <Box className={classes.inlineGrid}>
              {renderStatusCell(campaign.Status)}
            </Box>
          </Box>
					<Grid container className={classes.pt5}>
						<Grid item sm={6} xs={6}>
							<Typography className={classes.middleText}>
								{translator('campaigns.recipients')}: {campaign.TotalSendPlan?.toLocaleString()}
							</Typography>
						</Grid>
						<Grid item sm={6} xs={6}>
							<Typography className={classes.middleText}>
								{translator('sms.CreditsResource1.HeaderText')}: {1}
							</Typography>
						</Grid>
					</Grid>
					<Box className={classes.pt10}>
          	{renderCellIcons(campaign)}
					</Box>
        </TableCell>
      </TableRow>
    )
  }

	const renderTableBody = () => {
		if (campaignListData?.length === 0) {
			return (
				<Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }} >
					<Typography>{translator('common.NoDataTryFilter')}</Typography>
				</Box>
			)
		}
    return (
			<TableBody>
				{ campaignListData?.map(windowSize === 'xs' ? renderPhoneRow : renderRow) }
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
			containerClass={clsx(classes.management, classes.mb50)}>
			{isAccountSetup ? (
				<>
					{renderToast()}
					<Box className={'topSection'}>
						<Title
							Text={translator('whatsappManagement.campaignManagement')}
							classes={classes}
							ContainerStyle={{}}
							Element={null}
						/>
						<Grid container className={clsx(windowSize === 'xs' || windowSize === 'sm' ? classes.mt15 : classes.lineTopMarging, 'searchLine')}>
							<Grid item>
								<TextField
									variant='outlined'
									size='small'
									value={campaignNameSearch}
									onChange={handleCampainNameChange}
									onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
										onTemplateKeyDown(e)
									}
									className={clsx(classes.textField, classes.minWidth252)}
									placeholder={translator(
										'sms.GridBoundColumnResource2.HeaderText'
									)}
								/>
							</Grid>

							{windowSize !== 'xs' && (
								<Grid item>
									<KeyboardDatePicker
										inputVariant='outlined'
										className={clsx(classes.textField)}
										inputProps={{
											className: classes.datePickerInput,
										}}
										variant='inline'
										keyboardIcon={<CalendarIcon />}
										format={'DD/MM/YYYY'}
										placeholder={translator(
											'whatsappManagement.fromDatePlaceholder'
										)}
										initialFocusedDate={moment()}
										value={fromDate}
										onChange={handleFromDateChange}
										onClose={() => setIsFromDatePickerOpen(false)}
										open={isFromDatePickerOpen}
										onClick={() => setIsFromDatePickerOpen(true)}
										autoOk={true}
									/>
								</Grid>
							)}

							{windowSize !== 'xs' && (
								<Grid item>
									<KeyboardDatePicker
										inputVariant='outlined'
										className={clsx(classes.textField)}
										inputProps={{
											className: classes.datePickerInput,
										}}
										variant='inline'
										keyboardIcon={<CalendarIcon />}
										format={'DD/MM/YYYY'}
										placeholder={translator(
											'whatsappManagement.toDatePlaceholder'
										)}
										initialFocusedDate={moment()}
										minDate={moment(fromDate)}
										value={toDate}
										onChange={handleToDate}
										onClose={() => setIsToDatePickerOpen(false)}
										open={isToDatePickerOpen}
										onClick={() => setIsToDatePickerOpen(true)}
										autoOk={true}
									/>
								</Grid>
							)}

							<Grid item>
								<Button
									size='large'
									variant='contained'
									onClick={onSearch}
									className={clsx(classes.btn, classes.btnRounded)}
									endIcon={<SearchIcon />}
								>
									{translator('campaigns.btnSearchResource1.Text')}
								</Button>

								{isSearching && (
									<Button
										size='large'
										variant='contained'
										onClick={clearSearch}
										className={clsx(classes.btn, classes.btnRounded, classes.mleft5)}
										endIcon={<ClearIcon />}
									>
										{translator('common.clear')}
									</Button>
								)}
							</Grid>
						</Grid>
					</Box>


					<div className={clsx(classes.manageWhatsappTemplates, classes.mt15)}>
						<Grid
							container
							spacing={2}
							className={classes.manageTemplatesHeaderButtons}>
							<div className={classes.manageCampaignCreateAndRestore}>
								<Button
									className={clsx(
										classes.btn, classes.btnRounded
									)}
									endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
									onClick={() => onCreateCampaign()}
								>
									{translator('whatsappManagement.createCampaign')}
								</Button>
								<Button
									className={clsx(
										classes.btn, classes.btnRounded
									)}
									endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
									onClick={() => setDialogType({ type: 'restoreDeleted' })}
								>
									{translator('whatsappManagement.restore')}
								</Button>
							</div>

							<span className={classes.manageTemplatesCampaignCount}>
								{totalRecord || 0}{' '}
								{translator('whatsappManagement.campaigns')}
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
		</DefaultScreen>
	);
};

export default ManageWhatsAppCampaigns;
