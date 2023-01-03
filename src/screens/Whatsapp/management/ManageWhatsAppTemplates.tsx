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
	coreProps,
	quickReplyButtonProps,
	savedTemplateAPIProps,
	savedTemplateCallToActionProps,
	savedTemplateCardProps,
	savedTemplateDataProps,
	savedTemplateListProps,
	savedTemplateMediaProps,
	savedTemplateQuickReplyProps,
	savedTemplateTextProps,
	templateDataProps,
} from '../Editor/Types/WhatsappCreator.types';
import ClearIcon from '@material-ui/icons/Clear';
import clsx from 'clsx';
import { BaseSyntheticEvent, useEffect, useState } from 'react';
import moment from 'moment';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import Pagination from './Component/Pagination';
import {
	ManagmentIconProps,
	statusProps,
	templateRowDataProps,
} from './Types/Management.types';
import AlertModal from '../Editor/Popups/AlertModal';
import WhatsappMobilePreview from '../Editor/Components/WhatsappMobilePreview';
import { getSavedTemplatesById } from '../../../redux/reducers/whatsappSlice';
import { statuses } from '../Constant';
import { useNavigate } from 'react-router-dom';

const ManageWhatsAppTemplates = ({ classes }: ClassesType) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { t: translator } = useTranslation();
	const { windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const [isSubmitCampaignOpen, setIsSubmitCampaignOpen] =
		useState<boolean>(false);
	const [isPreviewCampaignOpen, setIsPreviewCampaignOpen] =
		useState<boolean>(false);
	const [isDeleteCampaignOpen, setIsDeleteCampaignOpen] =
		useState<boolean>(false);
	const [isDuplicateCampaignOpen, setIsDuplicateCampaignOpen] =
		useState<boolean>(false);
	const [campaineNameSearch, setCampaineNameSearch] = useState<string>('');
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
	const rows: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
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
		if (campainStatusSearch?.length > 0 || campaineNameSearch?.length > 0) {
			setSearching(true);
		}
	}, [campaineNameSearch, campainStatusSearch]);

	const handleCampainNameChange = (event: BaseSyntheticEvent) => {
		setCampaineNameSearch(event.target.value);
	};
	const clearSearch = () => {
		setCampaineNameSearch('');
		setCampainStatusSearch('');
		setSearching(false);
	};
	const renderNameCell = (row: templateRowDataProps) => {
		let date = null;
		let text = '';
		if (!row.SendDate) {
			date = moment(row.UpdatedDate, dateFormat);
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
					children={undefined}
					icon={undefined}
				/>
				<Typography className={classes.grayTextCell}>
					{`${text} ${date.format('DD/MM/YYYY')} ${date.format('LT')}`}
				</Typography>
			</>
		);
	};
	const renderStatusCell = (status: number) => {
		return (
			<>
				<Typography
					className={clsx(classes.middleText, classes.recipientsStatus, {
						[classes.recipientsStatusCreated]: status === 1,
						[classes.recipientsStatusSent]: status === 4,
						[classes.recipientsStatusSending]: status === 2,
						[classes.recipientsStatusCanceled]: status === 5,
					})}>
					{translator(statuses[status])}
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
								fieldName: translator('whatsapp.websiteButtonText'),
								type: 'text',
								placeholder: translator(
									'whatsapp.websiteButtonTextPlaceholder'
								),
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
									fieldName: translator('whatsapp.phoneButtonText'),
									type: 'text',
									placeholder: translator(
										'whatsapp.phoneButtonTextPlaceholder'
									),
									value: button.title,
								},
								{
									fieldName: translator('whatsapp.country'),
									type: 'select',
									placeholder: 'Select Your Country Code',
									value: '+972 Israel',
								},
								{
									fieldName: translator('whatsapp.phoneNumber'),
									type: 'tel',
									placeholder: translator('whatsapp.phoneNumberPlaceholder'),
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
									fieldName: translator('whatsapp.websiteButtonText'),
									type: 'text',
									placeholder: translator(
										'whatsapp.websiteButtonTextPlaceholder'
									),
									value: button.title,
								},
								{
									fieldName: translator('whatsapp.websiteURL'),
									type: 'text',
									placeholder: translator('whatsapp.websiteURLPlaceholder'),
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

	const onPreview = async (templateId: string) => {
		const templateData: savedTemplateAPIProps = await dispatch<any>(
			getSavedTemplatesById({
				templateId: templateId
					? 'HX7d12be9e2c0cef2863d4adb5e27c40e2'
					: 'HX7d12be9e2c0cef2863d4adb5e27c40e2',
			})
		);
		if (templateData.payload.Status === 'SUCCESS') {
			const templates = templateData.payload.Items
				? templateData.payload.Items
				: [];
			if (templates && templates?.length > 0) {
				const templateData = templates[0]?.Data;
				onSavedTemplateChange(templateData);
			}
			setIsPreviewCampaignOpen(true);
		}
	};

	const onSend = async (templateId: string) => {
		const templateData: savedTemplateAPIProps = await dispatch<any>(
			getSavedTemplatesById({
				templateId: templateId
					? 'HX7d12be9e2c0cef2863d4adb5e27c40e2'
					: 'HX7d12be9e2c0cef2863d4adb5e27c40e2',
			})
		);
		if (templateData.payload.Status === 'SUCCESS') {
			const templates = templateData.payload.Items
				? templateData.payload.Items
				: [];
			if (templates && templates?.length > 0) {
				const templateData = templates[0]?.Data;
				onSavedTemplateChange(templateData);
			}
			setIsSubmitCampaignOpen(true);
		}
	};

	const onRowIconClick = (key: string, templateId: string) => {
		switch (key) {
			case 'send':
				onSend(templateId);
				break;
			case 'preview':
				onPreview(templateId);
				break;
			case 'duplicate':
				setIsDuplicateCampaignOpen(true);
				break;
			case 'delete':
				setIsDeleteCampaignOpen(true);
				break;

			default:
				break;
		}
	};

	const renderCellIcons = (row: templateRowDataProps) => {
		const { Status, AutomationID, AutomationTriggerInActive } = row;

		const iconsMap: ManagmentIconProps[] = [
			{
				key: 'send',
				buttonKey: 'send',
				icon: SendGreenIcon,
				lable: translator('campaigns.imgSendResource1.ToolTip'),
				remove:
					Status !== 1 ||
					(AutomationID !== 0 && AutomationTriggerInActive === false),
				onClick: (key: string, templateId: string) =>
					onRowIconClick(key, templateId),
				classes: classes,
				rootClass: classes.sendIcon,
				textClass: classes.sendIconText,
				id: row.Id.toString(),
			},
			{
				key: 'preview',
				buttonKey: 'preview',
				icon: PreviewIcon,
				lable: translator('campaigns.Image1Resource1.ToolTip'),
				remove: windowSize === 'xs',
				onClick: (key: string, templateId: string) =>
					onRowIconClick(key, templateId),
				classes: classes,
				rootClass: classes.paddingIcon,
				id: row.Id.toString(),
			},
			{
				key: 'edit',
				buttonKey: 'edit',
				icon: EditIcon,
				disable: Status !== 1 || AutomationID !== 0,
				lable: translator('campaigns.Image2Resource1.ToolTip'),
				onClick: (key: string, templateId: string) =>
					onRowIconClick(key, templateId),
				classes: classes,
				rootClass: classes.paddingIcon,
				href: `/react/whatsapp/template/edit/${'01212'}`,
				id: row.Id.toString(),
			},
			{
				key: 'duplicate',
				buttonKey: 'duplicate',
				icon: DuplicateIcon,
				lable: translator('campaigns.lnkEditResource1.ToolTip'),
				onClick: (key: string, templateId: string) =>
					onRowIconClick(key, templateId),
				classes: classes,
				rootClass: classes.paddingIcon,
				id: row.Id.toString(),
			},
			{
				key: 'delete',
				buttonKey: 'delete',
				icon: DeleteIcon,
				lable: translator('campaigns.DeleteResource1.HeaderText'),
				disable: AutomationID !== 0,
				onClick: (key: string, templateId: string) =>
					onRowIconClick(key, templateId),
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

	const getRows = () => {
		let sortData = isSearching ? rows : rows;

		sortData = sortData.slice(
			(page - 1) * rowsPerPage,
			(page - 1) * rowsPerPage + rowsPerPage
		);

		return sortData?.length > 0 ? sortData : rows;
	};

	const onSubmitCampaign = async () => {
		console.log('onSubmitCampaign');
	};

	const onDeleteCampaign = async () => {
		console.log('onDeleteCampaign');
	};

	const onDuplicateCampaign = async () => {
		console.log('onDuplicateCampaign');
	};

	const onCreateTemplate = async () => {
		navigate('/react/whatsapp/template/create');
	};

	const onSearch = async () => {
		console.log('onSearch');
	};

	return (
		<DefaultScreen
			subPage={'manage'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={true}>
			<Title
				Text={'Whatsapp Template Management'}
				Classes={classes.whatsappTemplateTitle}
				ContainerStyle={{}}
				Element={null}
			/>

			<div className={classes.manageWhatsappTemplates}>
				<Grid container spacing={2} className={classes.lineTopMarging}>
					<Grid item lg={2}>
						<TextField
							variant='outlined'
							size='small'
							value={campaineNameSearch}
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
							label={campainStatusSearch?.length > 0 ? '' : 'Status'}
							className={classes.whatsappManagementbuttonField}
							onChange={(e: BaseSyntheticEvent) =>
								setCampainStatusSearch(e.target.value)
							}
							value={campainStatusSearch}>
							{Object.keys(statuses)?.map((status: any) => (
								<MenuItem key={'no-data-template'} value={status}>
									<>{translator(statuses[status?.toString()])}</>
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
							{translator('campaigns.btnSearchResource1.Text')}
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
					<div>
						<Button className={'green'} onClick={onCreateTemplate}>Create Template</Button>
					</div>

					<span className={classes.manageTemplatesCampaignCount}>
						{rows?.length || 0} Templates
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
											{translator('sms.GridBoundColumnResource2.HeaderText')}
										</TableCell>
										<TableCell
											classes={cellStyle}
											className={classes.flex1}
											align='center'>
											{translator('sms.StatusResource1.HeaderText')}
										</TableCell>
										<TableCell
											classes={{ root: classes.tableCellRoot }}
											className={classes.flex5}></TableCell>
									</TableRow>
								</TableHead>
							)}
							{getRows()?.map(() => (
								<TableRow
									key={Math.round(Math.random() * 999999999)}
									classes={rowStyle}>
									<TableCell
										classes={cellStyle}
										align='center'
										className={clsx(classes.flex3, classes.tableCellBody)}>
										{renderNameCell({
											Id: 140831,
											Name: 'sdsd',
											Status: 1,
											IsDeleted: false,
											UpdatedDate: '2022-11-11 07:18:26',
											SendDate: null,
											SentCount: 0,
											CreditsPerSms: 1,
											AutomationID: 0,
											Groups: [],
											AutomationTriggerInActive: false,
										})}
									</TableCell>
									<TableCell
										classes={cellStyle}
										align='center'
										className={clsx(classes.flex1, classes.tableCellBody)}>
										{renderStatusCell(2)}
									</TableCell>
									<TableCell
										component='th'
										scope='row'
										className={clsx(classes.flex5, classes.tableCellRoot)}>
										{renderCellIcons({
											Id: 140831,
											Name: 'sdsd',
											Status: 1,
											IsDeleted: false,
											UpdatedDate: '2022-11-11 07:18:26',
											SendDate: null,
											SentCount: 0,
											CreditsPerSms: 1,
											AutomationID: 0,
											Groups: [],
											AutomationTriggerInActive: false,
										})}
									</TableCell>
								</TableRow>
							))}
						</Table>
					</TableContainer>
				</Grid>
				<Pagination
					classes={classes}
					rows={rows?.length}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={(rowsNumber: number) =>
						setRowsPerPage(rowsNumber)
					}
					rowsPerPageOptions={[6, 10, 20, 30, 40]}
					page={page}
					onPageChange={(pageNumber: number) => setPage(pageNumber)}
					returnPageOne={false}
				/>
			</div>

			<AlertModal
				classes={classes}
				isOpen={isSubmitCampaignOpen}
				onClose={() => setIsSubmitCampaignOpen(false)}
				title={translator('whatsapp.alertModal.ConfirmText')}
				subtitle={translator('whatsapp.alertModal.ConfirmTitle')}
				onConfirmOrYes={() => onSubmitCampaign()}
				type='submit'>
				<Box className={classes.alertModalContentMobile}>
					<WhatsappMobilePreview
						classes={classes}
						campaignNumber='1'
						templateData={templateData}
						buttonType={buttonType}
						fileData={fileData}
					/>
				</Box>
			</AlertModal>

			<AlertModal
				classes={classes}
				isOpen={isPreviewCampaignOpen}
				onClose={() => setIsPreviewCampaignOpen(false)}
				title={'Preview'}
				subtitle={''}
				onConfirmOrYes={() => setIsPreviewCampaignOpen(false)}
				type='alert'>
				<Box className={classes.alertModalContentMobile}>
					<WhatsappMobilePreview
						classes={classes}
						campaignNumber='1'
						templateData={templateData}
						buttonType={buttonType}
						fileData={fileData}
					/>
				</Box>
			</AlertModal>

			<AlertModal
				classes={classes}
				isOpen={isDeleteCampaignOpen}
				onClose={() => setIsDeleteCampaignOpen(false)}
				title={translator('whatsapp.alertModal.DeleteText')}
				subtitle={translator('whatsapp.alertModal.DeleteTitle')}
				type='delete'
				onConfirmOrYes={() => onDeleteCampaign()}
			/>

			<AlertModal
				classes={classes}
				isOpen={isDuplicateCampaignOpen}
				onClose={() => setIsDuplicateCampaignOpen(false)}
				title={'Duplicate Template'}
				subtitle={'Do you want to duplicate this template?'}
				type='delete'
				onConfirmOrYes={() => onDuplicateCampaign()}
			/>
		</DefaultScreen>
	);
};

export default ManageWhatsAppTemplates;
