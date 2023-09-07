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
	return array?.reduce(function (carry: any, item: any) {
		if (item[key] && !~carry.indexOf(item[key])) carry.push(item[key]);
		return carry;
	}, []);
}

export const convertHyphensToword = (input: any) => {
	return input.split('-').reduce((accumulator: any, item: any) => {
		if (item.trim()) {
			const name = item ? item.replace(/-/g, '') : item;
			accumulator.push(name.charAt(0).toUpperCase() + name.slice(1));
			return accumulator;
		}
		return accumulator;
	}, []).join(' ')
}

export const validatePhoneNumber = (phone: any) => /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone); 
