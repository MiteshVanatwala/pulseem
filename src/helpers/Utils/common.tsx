import {
	quickReplyButtonProps,
	quickReplyButtonsFieldProps,
} from '../../screens/Whatsapp/Editor/Types/WhatsappCreator.types';

export const getValueByFieldName = (
	button: quickReplyButtonProps,
	fieldName: string
) => {
	const value = button.fields.find((field: quickReplyButtonsFieldProps) => {
		return field.fieldName === fieldName;
	})?.value;

	return value ? value : '';
};
