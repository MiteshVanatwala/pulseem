import { savedTemplateListProps } from './Editor/Types/WhatsappCreator.types';

//This regex will test dynamic field having two digits in side (i.e. {{10}});
const dynamicFieldL6 = new RegExp('^({{)[0-9][0-9](}})$');
//This regex will test dynamic field having one digits in side (i.e. {{1}});
const dynamicFieldL5 = new RegExp('^({{)[0-9](}})$');

export const getDynamicFields = (text: string) => {
	let indices = [];
	for (let i = 0; i < text.length; i++) {
		if (dynamicFieldL5.test(text.slice(i, i + 5))) {
			indices.push(text.slice(i, i + 5));
		}
		if (dynamicFieldL6.test(text.slice(i, i + 6))) {
			indices.push(text.slice(i, i + 6));
		}
	}
	return indices;
};

export const getDynamicFieldIndex = (text: string) => {
	let indices = [];
	for (let i = 0; i < text.length; i++) {
		if (
			dynamicFieldL5.test(text.slice(i, i + 5)) ||
			dynamicFieldL6.test(text.slice(i, i + 6))
		) {
			indices.push(i);
		}
	}
	return indices;
};

export const getLastDynamicFieldValue = (text: string) => {
	let str = text;
	let indices: string[] = [];
	for (let i = 0; i < str.length; i++) {
		if (dynamicFieldL5.test(str.slice(i, i + 5))) {
			indices.push(str.slice(i, i + 5).replace(/[{}]/g, ''));
		} else if (dynamicFieldL6.test(str.slice(i, i + 6))) {
			indices.push(str.slice(i, i + 6).replace(/[{}]/g, ''));
		}
	}
	return indices?.length > 0 ? indices[indices?.length - 1] : '0';
};

export const getLastDynamicFieldByValue = (value: string) => {
	return `{{${(Number(value) + 1).toString()}}}`;
};

export const getVariableValue = (variable: string) => {
	return variable?.replace(/[{}]/g, '');
};

export const getTemplateIdByName = (
	savedTemplateList: savedTemplateListProps[],
	templateName: string
) => {
	return (
		savedTemplateList?.find(
			(template: savedTemplateListProps) =>
				template.TemplateName === templateName
		)?.TemplateId || null
	);
};

export const getTemplateNameById = (
	savedTemplateList: savedTemplateListProps[],
	templateId: string
) => {
	return (
		savedTemplateList?.find(
			(template: savedTemplateListProps) =>
				template.TemplateId === templateId
		)?.TemplateName || null
	);
};
