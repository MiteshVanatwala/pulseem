import {
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
} from '../../screens/Whatsapp/Editor/WhatsappCreator.types';

export const getValueByFieldName = (
	button: quickReplyButtonProps,
	fieldName: string
) => {
	return button.fields.find((field: quickReplyButtonsFieldProps) => {
		return field.fieldName === fieldName;
	})?.value;
};
