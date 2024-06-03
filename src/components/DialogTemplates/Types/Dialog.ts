import { ClassesType } from '../../../screens/Classes.types';

export type DynamicContentProps = {
	classes: ClassesType['classes'];
    text: string;
    title: string;
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    onClose: () => void;
    confirmButtonText: string;
    cancelButtonText?: string;
};
