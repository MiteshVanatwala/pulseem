import { SyntheticEvent, useState } from 'react';
import Picker, { IEmojiData } from 'emoji-picker-react';
import { Tooltip, ClickAwayListener } from '@material-ui/core';
import Emoj from '../../assets/images/smile.png';
import { Box, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
	customWidth: {
		maxWidth: 200,
		backgroundColor: 'black',
		fontSize: '14px',
		textAlign: 'center',
	},
	noMaxWidth: {
		maxWidth: 'none',
	},
	root: {
		'& .emoji-picker-react': {
			top: 0
		}

	}
});

export type PickerObject = {
	classes: any;
	boxStyles: any;
	OnSelectEmoji: any;
};

const EmojiPicker = ({ classes, boxStyles, OnSelectEmoji }: PickerObject) => {
	const [showEmoji, setShowEmoji] = useState(false);
	const { t } = useTranslation();
	const localClasses = useStyles();

	const handleClickOutsideEmoji = () => {
		setShowEmoji(false);
	};

	return (
		<ClickAwayListener onClickAway={handleClickOutsideEmoji}>
			<Box
				className={classes.pickerEmoji}
				style={{ alignItems: 'flex-start', ...boxStyles }}>
				{showEmoji ? (
					<Picker
						onEmojiClick={(event, emojiObject: IEmojiData) => {
							OnSelectEmoji(emojiObject?.emoji);
						}}
						groupNames={{
							smileys_people: t('emoji.smiles'),
							animals_nature: t('emoji.nature'),
							food_drink: t('emoji.foodAndDrinks'),
							travel_places: t('emoji.places'),
							activities: t('emoji.activities'),
							objects: t('emoji.objects'),
							symbols: t('emoji.symbols'),
							recently_used: t('emoji.recently'),
						}}
						groupVisibility={{
							flags: false,
							recently_used: false,
						}}
					/>
				) : null}
				<Tooltip
					disableFocusListener
					title={`${t('mainReport.emoji')}`}
					classes={{ tooltip: localClasses.customWidth }}
					placement='top-start'
					arrow>
					<img
						alt='emoji picker'
						src={Emoj}
						style={{
							width: 36,
							height: 29,
						}}
						onClick={() => {
							setShowEmoji(!showEmoji);
						}}
					/>
				</Tooltip>
			</Box>
		</ClickAwayListener>
	);
};

export default EmojiPicker;
