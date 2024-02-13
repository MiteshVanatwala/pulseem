import uniqid from 'uniqid';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { buttonsDataProps, callToActionProps, quickReplyButtonProps, savedTemplateCallToActionProps, savedTemplateCardProps, savedTemplateDataProps, savedTemplateMediaProps, savedTemplateQuickReplyProps, savedTemplateTextProps, templateDataProps, templateListAPIProps, toastProps } from "../../screens/Whatsapp/Editor/Types/WhatsappCreator.types";
import { getSavedTemplatesPreviewById } from "../../redux/reducers/whatsappSlice";
import { apiStatus, authenticationMockTemplate, authenticationTypes, resetToastData } from "../../screens/Whatsapp/Constant";
import WhatsappMobilePreview from "../../screens/Whatsapp/Editor/Components/WhatsappMobilePreview";
import { Loader } from "../Loader/Loader";
import Toast from "../Toast/Toast.component";
import { Box } from "@material-ui/core";
import { BaseDialog } from '../DialogTemplates/BaseDialog';

export class Props {
  classes: any;
  templateID: string = '';
  openPreview: boolean = false;
  closeModel: any = () => {}
}

export const WhatsappTemplatePreview = ({
  classes,
  templateID,
  openPreview,
  closeModel
}: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const ToastMessages = useSelector((state: { whatsapp: { ToastMessages: toastProps } }) => state.whatsapp.ToastMessages);
  const [isLoader, setIsLoader] = useState<boolean>(false);
  const [buttonType, setButtonType] = useState<string>('');
	const [fileData, setFileData] = useState<{
		fileLink: string;
		fileType: string;
	}>({
		fileLink: '',
		fileType: '',
	});
  const [templateData, setTemplateData] = useState<templateDataProps>({
		templateText: '',
		templateButtons: [],
	});
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
  const [toastMessage, setToastMessage] = useState<toastProps['SUCCESS']>(resetToastData);
  
  useEffect(() => {
    if (openPreview) {
      fetchPreviewDetail();
    } else {
      setTemplateData({
        templateText: '',
		    templateButtons: [],
      });
      setFileData({
        fileLink: '',
        fileType: '',
      });
      setButtonType('');
    }
  }, [openPreview]);

  const renderToast = () => {
		if (toastMessage.message?.length > 0) {
			setTimeout(() => {
				setToastMessage(resetToastData);
			}, 4000);
			return <Toast data={toastMessage} />;
		}
		return null;
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

  const fetchPreviewDetail = async () => {
    setIsLoader(true);
    const templateData: templateListAPIProps = await dispatch<any>(
      getSavedTemplatesPreviewById({
        templateId: templateID,
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
    } else {
      templateData?.payload?.Message
        ? setToastMessage({
          ...ToastMessages.ERROR,
          message: templateData?.payload?.Message,
        })
        : setToastMessage(ToastMessages.ERROR);

      closeModel(true);
    }
  }

  return (
    <>
      <BaseDialog
				title={`${t('whatsapp.alertModal.templateId')}: ${templateID}`}
        classes={classes}
        open={openPreview}
        onConfirm={() => closeModel(false)}
				onClose={() => closeModel(false)}
        onCancel={() => closeModel(false)}
				showDefaultButtons={false}
      >
				<Box className={classes.alertModalContentMobile}>
					<WhatsappMobilePreview
						classes={classes}
						templateData={templateData}
						buttonType={buttonType}
						fileData={fileData}
					/>
				</Box>
    	</BaseDialog>;
      <Loader isOpen={isLoader} showBackdrop={true} zIndex={99999} />
      {renderToast()}
    </>
  );
};
