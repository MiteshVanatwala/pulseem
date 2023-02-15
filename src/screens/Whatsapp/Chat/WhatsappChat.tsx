import ChatUi from './Component/ChatUi';
import SideBar from './Component/SideBar';
import './css/index.css';
import DefaultScreen from '../../DefaultScreen';
import {
	APIWhatsappChatSidebarContactsItemsProps,
	APIWhatsappChatSidebarContactsProps,
	WhatsappChatProps,
} from './Types/WhatsappChat.type';
import { BaseSyntheticEvent, useEffect, useMemo, useState } from 'react';
import {
	buttonsDataProps,
	callToActionFieldProps,
	callToActionProps,
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
import { useDispatch } from 'react-redux';
import {
	getInboundWhatsappChatStatus,
	getSavedTemplates,
	getWhatsappChatContactsByPhoneNumber,
	manageWhatsappChatCoversationStatus,
	userPhoneNumbers,
} from '../../../redux/reducers/whatsappSlice';
import { useTranslation } from 'react-i18next';
import uniqid from 'uniqid';
import { getDynamicFields } from '../Common';
import {
	landingPageAPIProps,
	landingPageDataProps,
	personalFieldAPIProps,
	personalFieldDataProps,
	phoneNumberAPIProps,
	updatedVariable,
} from '../Campaign/Types/WhatsappCampaign.types';
import DynamicModal from '../Campaign/Popups/DynamicModal';
import {
	getAccountExtraData,
	getPreviousLandingData,
} from '../../../redux/reducers/smsSlice';
import { apiStatus, buttonTypes } from '../Constant';
import { Loader } from '../../../components/Loader/Loader';

const WhatsappChat = ({ classes }: WhatsappChatProps) => {
	const [isLoader, setIsLoader] = useState<boolean>(false);
	const [chatContacts, setChatContacts] = useState<any>([]);
	const [activeUser, setActiveUser] = useState<string>('16067520281');
	const [sideChatContacts, setSideChatContacts] = useState<
		APIWhatsappChatSidebarContactsItemsProps[]
	>([]);
	const [filteredSideChatContacts, setFilteredSideChatContacts] =
		useState<APIWhatsappChatSidebarContactsItemsProps[]>(sideChatContacts);
	const [activePhoneNumber, setActivePhoneNumber] =
		useState<string>(activeUser);
	const [activeUserNumber, setActiveUserNumber] =
		useState<string>('918657485699');
	const [whatsappChatSession, setWhatsappChatSession] = useState<any>([]);

	const handleUserStatus = (e: BaseSyntheticEvent, ClientNumber: string) => {
		e.preventDefault();

		setWhatsappChatCoversationStatus(e.target.value, activeUser, ClientNumber);
	};

	const { t: translator } = useTranslation();
	const dispatch = useDispatch();
	const [isMobileSideBar, setIsMobileSideBar] = useState<boolean>(false);
	const [isTemplateModal, setIsTemplateModal] = useState<boolean>(false);
	const [isDynamcFieldModal, setIsDynamcFieldModal] = useState<boolean>(false);
	const [newMessage, setNewMessage] = useState<string>('');
	const [savedTemplateList, setSavedTemplateList] = useState<
		savedTemplateListProps[]
	>([]);
	const [savedTemplate, setSavedTemplate] = useState<string>('');
	const [fileData, setFileData] = useState<string>('');
	const [buttonType, setButtonType] = useState<string>('');
	const [templateData, setTemplateData] = useState<templateDataProps>({
		templateText: '',
		templateButtons: [],
	});
	const [dynamicVariable, setDynamicVariable] = useState<string[]>([]);
	const [updatedDynamicVariable, setUpdatedDynamicVariable] = useState<
		updatedVariable[]
	>([]);
	const initialQuickReplyButtons = [
		{
			id: uniqid(),
			typeOfAction: '',
			fields: [
				{
					fieldName: translator('whatsapp.websiteButtonText'),
					type: 'text',
					placeholder: translator('whatsapp.websiteButtonTextPlaceholder'),
					value: '',
				},
			],
		},
	];
	const phoneNumberField = useMemo<callToActionFieldProps[]>(
		() => [
			{
				fieldName: translator('whatsapp.phoneButtonText'),
				type: 'text',
				placeholder: translator('whatsapp.phoneButtonTextPlaceholder'),
				value: '',
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
				value: '',
			},
		],
		[translator]
	);
	const initialFieldRow = {
		id: uniqid(),
		typeOfAction: 'phonenumber',
		fields: phoneNumberField,
	};
	const [quickReplyButtons, setQuickReplyButtons] = useState<
		quickReplyButtonProps[]
	>(initialQuickReplyButtons);
	const [callToActionFieldRows, setCallToActionFieldRows] =
		useState<callToActionProps>([initialFieldRow]);
	const [dynamicFieldCount, setDynamicFieldCount] = useState<number>(0);
	const [personalFields, setpersonalFields] = useState<personalFieldDataProps>(
		{}
	);
	const [landingPages, setLandingPages] = useState<landingPageDataProps[]>([]);
	const [phoneNumbersList, setPhoneNumbersList] = useState<string[]>([]);
	const [dynamicModalVariable, setDynamicModalVariable] = useState<number>(0);
	let updatedTemplateData: templateDataProps = {
		templateText: '',
		templateButtons: [],
	};
	let updatedButtonType: string = '';
	let updatedFileData: string = '';

	useEffect(() => {
		setAPIInboundChatStatus();
		getPhoneNumber();
		getSavedTemplateFields();
		if (!personalFields || landingPages?.length <= 0) {
			getDynamicModalValues();
		}
		/**
		 * we disable it because we want to run this code only when component loads
		 */
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const setWhatsappChatCoversationStatus = async (
		StatusId: number,
		Sendernumber: string,
		ClientNumber: string
	) => {
		const whatsAppChatConversationStatusData: any = await dispatch<any>(
			manageWhatsappChatCoversationStatus({
				ClientNumber,
				Sendernumber,
				StatusId,
			})
		);
		console.log(whatsAppChatConversationStatusData);
		// if (
		// 	whatsAppChatConversationStatusData.payload.Status === apiStatus.SUCCESS
		// ) {
		// 	setAllWhatsappChat(whatsAppChatConversationStatusData.payload.Data.Items);
		// } else {
		// 	setAllWhatsappChat([]);
		// }
	};

	const setAPIInboundChatStatus = async () => {
		const whatsAppChatSessionStatus: any = await dispatch<any>(
			getInboundWhatsappChatStatus({ activePhoneNumber, activeUserNumber })
		);
		console.log(whatsAppChatSessionStatus);
		if (whatsAppChatSessionStatus.payload.Status === apiStatus.SUCCESS) {
			setWhatsappChatSession(whatsAppChatSessionStatus.payload.Data);
		} else {
			setWhatsappChatSession([]);
		}
	};

	const setAPIWhatsAppChatContacts = async (activeUser: string) => {
		const whatsAppChatContactsData: APIWhatsappChatSidebarContactsProps =
			await dispatch<any>(getWhatsappChatContactsByPhoneNumber(activeUser));
		console.log(whatsAppChatContactsData);

		if (whatsAppChatContactsData.payload.Status === apiStatus.SUCCESS) {
			setSideChatContacts(whatsAppChatContactsData.payload.Data.Items);
			setFilteredSideChatContacts(whatsAppChatContactsData.payload.Data.Items);
		} else {
			setSideChatContacts([]);
			setFilteredSideChatContacts([]);
		}
	};

	const getPhoneNumber = async () => {
		const { payload: phoneNumberData }: phoneNumberAPIProps =
			await dispatch<any>(userPhoneNumbers());
		if (phoneNumberData?.Data?.length > 0) {
			setActiveUser(phoneNumberData?.Data[0]);
			setAPIWhatsAppChatContacts(phoneNumberData?.Data[0]);
		}
		setPhoneNumbersList(phoneNumberData?.Data);
	};

	const onActiveUserChange = (e: BaseSyntheticEvent) => {
		setActiveUser(e.target.value?.replace(/\D/g, ''));
		setAPIWhatsAppChatContacts(e.target.value?.replace(/\D/g, ''));
	};

	const getDynamicModalValues = async () => {
		const staticPersonalField: personalFieldDataProps = {
			Status: translator('common.Status'),
			SmsStatus: translator('common.smsStatus'),
			CreationDate: translator('client.subscribedOn'),
			FirstName: translator('smsReport.firstName'),
			LastName: translator('smsReport.lastName'),
			Email: translator('common.Mail'),
			Telephone: translator('common.telephone'),
			Cellphone: translator('common.Cellphone'),
			Address: translator('common.address'),
			BirthDate: translator('common.birthDate'),
			City: translator('common.city'),
			State: translator('common.state'),
			Country: translator('common.country'),
			Zip: translator('common.zip'),
			Company: translator('common.company'),
			ReminderDate: translator('recipient.reminderDate'),
		};
		const { payload: personalFieldData }: personalFieldAPIProps =
			await dispatch<any>(getAccountExtraData());
		const { payload: landingPageData }: landingPageAPIProps =
			await dispatch<any>(getPreviousLandingData());
		setLandingPages(landingPageData);
		setpersonalFields({ ...staticPersonalField, ...personalFieldData });
	};
	const getSavedTemplateFields = async () => {
		let savedTemplate: savedTemplateAPIProps = await dispatch<any>(
			getSavedTemplates({ templateStatus: 3 })
		);
		setSavedTemplateList(savedTemplate?.payload?.Data?.Items);
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
		updatedButtonType = buttonTypes.QUICK_REPLY;
		const buttonData = setButtonsData(
			buttonTypes.QUICK_REPLY,
			quickReplyData?.actions
		);
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
				updatedButtonType = buttonTypes.CALL_TO_ACTION;
				const buttonData = setButtonsData(
					buttonTypes.CALL_TO_ACTION,
					cardData?.actions
				);
				updatedTemplateData.templateButtons = buttonData ? buttonData : [];
			} else {
				updatedButtonType = buttonTypes.QUICK_REPLY;
				const buttonData = setButtonsData(
					buttonTypes.QUICK_REPLY,
					cardData?.actions
				);
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
	const onChoose = (
		template: savedTemplateListProps,
		templateText: string | null
	) => {
		setNewMessage(templateText || '');
		setIsTemplateModal(false);
		setSavedTemplate(template?.TemplateId);
		const templateData: savedTemplateDataProps = template?.Data;
		if (templateData) {
			setUpdatedTemplateData(templateData);
		}
		setFileData(updatedFileData);
		setButtonType(updatedButtonType);
		setTemplateData(updatedTemplateData);
		setDynamicVariable(getDynamicFields(updatedTemplateData.templateText));
		if (updatedButtonType === buttonTypes.QUICK_REPLY) {
			setQuickReplyButtons(updatedTemplateData.templateButtons);
		} else {
			setCallToActionFieldRows(updatedTemplateData.templateButtons);
		}
		if (templateData?.variables) {
			setDynamicFieldCount(Object.keys(templateData?.variables)?.length);
		}
	};
	const onDynamcFieldModalSave = (
		updatedDynamicVariable: updatedVariable[]
	) => {
		setUpdatedDynamicVariable(updatedDynamicVariable);
		setIsDynamcFieldModal(false);
	};

	const handleChatId = (e: BaseSyntheticEvent, contacts: any) => {
		e.preventDefault();
		setChatContacts(contacts);
		console.log('Chat Id', filteredSideChatContacts);
	};

	return (
		<>
			<DefaultScreen
				subPage={'chat'}
				currentPage='whatsapp'
				classes={classes}
				customPadding={false}
				containerClass={null}>
				<div className={`${classes.whatsappChat} app`}>
					<div className={`${classes.whatsappChat} app-content`}>
						<SideBar
							isMobileSideBar={isMobileSideBar}
							classes={classes}
							setIsMobileSideBar={() => setIsMobileSideBar(!isMobileSideBar)}
							handleChatId={handleChatId}
							activeUser={activeUser}
							setActiveUser={setActiveUser}
							getPhoneNumber={getPhoneNumber}
							onActiveUserChange={onActiveUserChange}
							sideChatContacts={sideChatContacts}
							filteredSideChatContacts={filteredSideChatContacts}
							setFilteredSideChatContacts={setFilteredSideChatContacts}
							phoneNumbersList={phoneNumbersList}
							handleUserStatus={handleUserStatus}
						/>
						<ChatUi
							isMobileSideBar={isMobileSideBar}
							classes={classes}
							setIsMobileSideBar={() => setIsMobileSideBar(!isMobileSideBar)}
							savedTemplateList={savedTemplateList}
							onChoose={(template, templateText) =>
								onChoose(template, templateText)
							}
							newMessage={newMessage}
							setNewMessage={setNewMessage}
							isTemplateModal={isTemplateModal}
							setIsTemplateModal={setIsTemplateModal}
							dynamicVariable={dynamicVariable}
							updatedDynamicVariable={updatedDynamicVariable}
							setIsDynamcFieldModal={setIsDynamcFieldModal}
							setDynamicModalVariable={setDynamicModalVariable}
							savedTemplate={savedTemplate}
							chatContacts={chatContacts}
							activeUser={activeUser}
							filteredSideChatContacts={filteredSideChatContacts}
							whatsappChatSession={whatsappChatSession}
							handleUserStatus={handleUserStatus}
						/>
					</div>
				</div>
				<DynamicModal
					classes={classes}
					isDynamcFieldModal={isDynamcFieldModal}
					onDynamcFieldModalClose={() => setIsDynamcFieldModal(false)}
					personalFields={personalFields}
					landingPageData={landingPages}
					dynamicModalVariable={dynamicModalVariable}
					onDynamcFieldModalSave={(updatedDynamicVariable) =>
						onDynamcFieldModalSave(updatedDynamicVariable)
					}
					dynamicVariable={updatedDynamicVariable}
				/>
			</DefaultScreen>
		</>
	);
};

export default WhatsappChat;

// const ChatMemo = React.memo(ChatUi);
