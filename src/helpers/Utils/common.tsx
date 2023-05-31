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

export const getUniqueValuesOfKey = (array: any, key: string) => {
	return array.reduce(function (carry: any, item: any) {
		if (item[key] && !~carry.indexOf(item[key])) carry.push(item[key]);
		return carry;
	}, []);
}