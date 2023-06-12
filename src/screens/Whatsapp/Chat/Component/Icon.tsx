import Icons from '../assets/icons';
import {
	AllIconComponentProps,
	AllIconProps,
} from '../Types/WhatsappChat.type';
const allIcons: AllIconProps = Icons;

const Icon = ({ id, className }: AllIconComponentProps) => {
	const selectedIcon = allIcons[id];
	return selectedIcon ? selectedIcon({ id, className }) : null;
};

export default Icon;
