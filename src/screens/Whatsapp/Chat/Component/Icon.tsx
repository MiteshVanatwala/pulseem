import Icons from '../assets/icons';
console.log(Icons)
const allIcons: any = Icons;

const Icon = ({ id, ...props }: any) => {
	const selectedIcon: any = allIcons[id];
	return selectedIcon ? selectedIcon(props) : null;
};

export default Icon;
