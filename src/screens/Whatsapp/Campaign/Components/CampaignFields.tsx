import {
	Box,
	TextField,
	Typography,
	MenuItem,
	Grid,
	Select,
	ListSubheader,
	InputAdornment,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { campaignFielsProps, coreProps } from '../Types/WhatsappCampaign.types';
import clsx from 'clsx';
import { BaseSyntheticEvent } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { useState, useMemo } from 'react';
import SearchIcon from '@mui/material/IconButton/IconButton';

const containsText = (text: string, searchText: string) =>
	text.toLowerCase().indexOf(searchText.toLowerCase()) > -1;

const CampaignFields = ({
	classes,
	savedTemplateList,
	savedTemplate,
	onSavedTemplateChange,
	campaignName,
	onCampaignNameChange,
	from,
	onFromChange,
	showValidation,
	phoneNumbersList,
}: campaignFielsProps) => {
	const { t: translator } = useTranslation();
	const { windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const [searchText, setSearchText] = useState<string>('');
	const [selectedOption, setSelectedOption] = useState<string>('');

	const displayedOptions = useMemo(
		() =>
			savedTemplateList.filter((template) =>
				containsText(template.TemplateName, searchText)
			),
		[searchText]
	);
	console.log(displayedOptions);
	return (
		<Grid container spacing={windowSize === 'xs' ? 0 : 2}>
			<Grid item xs={12} md={6} sm={12} className={classes.buttonForm}>
				<Typography className={classes.buttonHead}>
					<>{translator('whatsappCampaign.campaignName')}</>
				</Typography>
				<TextField
					required
					id='campaignName'
					type='text'
					placeholder={translator('whatsappCampaign.campaignNamePlaceholder')}
					className={
						showValidation && campaignName?.length === 0
							? clsx(classes.buttonField, classes.error)
							: clsx(classes.buttonField, classes.success)
					}
					onChange={(e: BaseSyntheticEvent) =>
						onCampaignNameChange(e.target.value)
					}
					value={campaignName}
				/>
				<Typography className={classes.WhatsappCampainButtonContent}>
					<>{translator('whatsappCampaign.campaignDesc')}</>
				</Typography>
			</Grid>
			<Grid item xs={12} md={6} sm={12} className={classes.buttonForm}>
				<Box className={classes.inputCampDiv}>
					<Typography className={classes.buttonHead}>
						<>{translator('whatsappCampaign.from')}</>
					</Typography>
				</Box>
				{phoneNumbersList?.length === 1 ? (
					<TextField
						required
						type='text'
						disabled
						className={clsx(classes.buttonField)}
						onChange={(e: BaseSyntheticEvent) =>
							onFromChange(e.target.value?.replace(/\D/g, ''))
						}
						value={from}
					/>
				) : (
					<TextField
						select
						type='text'
						className={classes.buttonField}
						onChange={(e: BaseSyntheticEvent) =>
							onFromChange(e.target.value?.replace(/\D/g, ''))
						}
						value={from}>
						{phoneNumbersList?.length > 0 ? (
							phoneNumbersList?.map((phone: string, index: number) => (
								<MenuItem key={index} value={phone}>
									{phone}
								</MenuItem>
							))
						) : (
							<MenuItem key={'no-data-template'} disabled>
								<>{translator('whatsapp.noTemplateAaliable')}</>
							</MenuItem>
						)}
					</TextField>
				)}
			</Grid>

			<Grid item xs={12} md={12} sm={12} className={classes.buttonForm}>
				<Typography className={classes.buttonHead}>
					<>{translator('whatsappCampaign.chooseTemplate')}</>
				</Typography>

				{/* <TextField
					select
					required
					id='selectSavedTemplate'
					type='text'
					className={
						showValidation && savedTemplate?.length === 0
							? clsx(classes.buttonField, classes.error)
							: clsx(classes.buttonField, classes.success)
					}
					onChange={onSavedTemplateChange}
					value={savedTemplate}>
					{savedTemplateList?.length > 0 ? (
						savedTemplateList.map((template) => (
							<MenuItem key={template.TemplateId} value={template.TemplateId}>
								{template.TemplateName}
							</MenuItem>
						))
					) : (
						<MenuItem key={'no-data-template'} disabled>
							<>{translator('whatsapp.noTemplateAaliable')}</>
						</MenuItem>
					)}
				</TextField> */}
				{/* <Autocomplete
					disablePortal
					id='combo-box-demo'
					className={
						showValidation && savedTemplate?.length === 0
							? clsx(classes.buttonField, classes.error)
							: clsx(classes.buttonField, classes.success)
					}
					options={savedTemplateList.map((template) => template.TemplateName)}
					renderInput={(params) => <TextField {...params} />}
					onChange={onSavedTemplateChange}
					value={savedTemplate}
				/> */}

				<Select
					// Disables auto focus on MenuItems and allows TextField to be in focus
					MenuProps={{ autoFocus: false }}
					labelId='search-select-label'
					id='search-select'
					value={savedTemplate}
					label='Options'
					onChange={onSavedTemplateChange}
					onClose={() => setSearchText('')}
					// This prevents rendering empty string in Select's value
					// if search text would exclude currently selected option.
					// renderValue={() => selectedOption}
				>
					{/* TextField is put into ListSubheader so that it doesn't
              act as a selectable item in the menu
              i.e. we can click the TextField without triggering any selection.*/}
					<ListSubheader>
						<TextField
							size='small'
							// Autofocus on textfield
							autoFocus
							placeholder='Type to search...'
							fullWidth
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<SearchIcon />
									</InputAdornment>
								),
							}}
							onChange={(e) => setSearchText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key !== 'Escape') {
									// Prevents autoselecting item while typing (default Select behaviour)
									e.stopPropagation();
								}
							}}
						/>
					</ListSubheader>
					{savedTemplateList.map((template, i) => (
						<MenuItem key={i} value={template.TemplateId}>
							{template.TemplateName}
						</MenuItem>
					))}
				</Select>

				<Typography className={classes.WhatsappCampainButtonContent}>
					<>{translator('whatsappCampaign.chooseTemplateDesc')}</>
				</Typography>
			</Grid>
		</Grid>
	);
};

const top100Films = [
	{ label: 'The Shawshank Redemption', year: 1994 },
	{ label: 'The Godfather', year: 1972 },
	{ label: 'The Godfather: Part II', year: 1974 },
	{ label: 'The Dark Knight', year: 2008 },
	{ label: '12 Angry Men', year: 1957 },
	{ label: "Schindler's List", year: 1993 },
	{ label: 'Pulp Fiction', year: 1994 },
	{
		label: 'The Lord of the Rings: The Return of the King',
		year: 2003,
	},
	{ label: 'The Good, the Bad and the Ugly', year: 1966 },
	{ label: 'Fight Club', year: 1999 },
	{
		label: 'The Lord of the Rings: The Fellowship of the Ring',
		year: 2001,
	},
	{
		label: 'Star Wars: Episode V - The Empire Strikes Back',
		year: 1980,
	},
	{ label: 'Forrest Gump', year: 1994 },
	{ label: 'Inception', year: 2010 },
	{
		label: 'The Lord of the Rings: The Two Towers',
		year: 2002,
	},
	{ label: "One Flew Over the Cuckoo's Nest", year: 1975 },
	{ label: 'Goodfellas', year: 1990 },
	{ label: 'The Matrix', year: 1999 },
	{ label: 'Seven Samurai', year: 1954 },
	{
		label: 'Star Wars: Episode IV - A New Hope',
		year: 1977,
	},
	{ label: 'City of God', year: 2002 },
	{ label: 'Se7en', year: 1995 },
	{ label: 'The Silence of the Lambs', year: 1991 },
	{ label: "It's a Wonderful Life", year: 1946 },
	{ label: 'Life Is Beautiful', year: 1997 },
	{ label: 'The Usual Suspects', year: 1995 },
	{ label: 'Léon: The Professional', year: 1994 },
	{ label: 'Spirited Away', year: 2001 },
	{ label: 'Saving Private Ryan', year: 1998 },
	{ label: 'Once Upon a Time in the West', year: 1968 },
	{ label: 'American History X', year: 1998 },
	{ label: 'Interstellar', year: 2014 },
	{ label: 'Casablanca', year: 1942 },
	{ label: 'City Lights', year: 1931 },
	{ label: 'Psycho', year: 1960 },
	{ label: 'The Green Mile', year: 1999 },
	{ label: 'The Intouchables', year: 2011 },
	{ label: 'Modern Times', year: 1936 },
	{ label: 'Raiders of the Lost Ark', year: 1981 },
	{ label: 'Rear Window', year: 1954 },
	{ label: 'The Pianist', year: 2002 },
	{ label: 'The Departed', year: 2006 },
	{ label: 'Terminator 2: Judgment Day', year: 1991 },
	{ label: 'Back to the Future', year: 1985 },
	{ label: 'Whiplash', year: 2014 },
	{ label: 'Gladiator', year: 2000 },
	{ label: 'Memento', year: 2000 },
	{ label: 'The Prestige', year: 2006 },
	{ label: 'The Lion King', year: 1994 },
	{ label: 'Apocalypse Now', year: 1979 },
	{ label: 'Alien', year: 1979 },
	{ label: 'Sunset Boulevard', year: 1950 },
	{
		label:
			'Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb',
		year: 1964,
	},
	{ label: 'The Great Dictator', year: 1940 },
	{ label: 'Cinema Paradiso', year: 1988 },
	{ label: 'The Lives of Others', year: 2006 },
	{ label: 'Grave of the Fireflies', year: 1988 },
	{ label: 'Paths of Glory', year: 1957 },
	{ label: 'Django Unchained', year: 2012 },
	{ label: 'The Shining', year: 1980 },
	{ label: 'WALL·E', year: 2008 },
	{ label: 'American Beauty', year: 1999 },
	{ label: 'The Dark Knight Rises', year: 2012 },
	{ label: 'Princess Mononoke', year: 1997 },
	{ label: 'Aliens', year: 1986 },
	{ label: 'Oldboy', year: 2003 },
	{ label: 'Once Upon a Time in America', year: 1984 },
	{ label: 'Witness for the Prosecution', year: 1957 },
	{ label: 'Das Boot', year: 1981 },
	{ label: 'Citizen Kane', year: 1941 },
	{ label: 'North by Northwest', year: 1959 },
	{ label: 'Vertigo', year: 1958 },
	{
		label: 'Star Wars: Episode VI - Return of the Jedi',
		year: 1983,
	},
	{ label: 'Reservoir Dogs', year: 1992 },
	{ label: 'Braveheart', year: 1995 },
	{ label: 'M', year: 1931 },
	{ label: 'Requiem for a Dream', year: 2000 },
	{ label: 'Amélie', year: 2001 },
	{ label: 'A Clockwork Orange', year: 1971 },
	{ label: 'Like Stars on Earth', year: 2007 },
	{ label: 'Taxi Driver', year: 1976 },
	{ label: 'Lawrence of Arabia', year: 1962 },
	{ label: 'Double Indemnity', year: 1944 },
	{
		label: 'Eternal Sunshine of the Spotless Mind',
		year: 2004,
	},
	{ label: 'Amadeus', year: 1984 },
	{ label: 'To Kill a Mockingbird', year: 1962 },
	{ label: 'Toy Story 3', year: 2010 },
	{ label: 'Logan', year: 2017 },
	{ label: 'Full Metal Jacket', year: 1987 },
	{ label: 'Dangal', year: 2016 },
	{ label: 'The Sting', year: 1973 },
	{ label: '2001: A Space Odyssey', year: 1968 },
	{ label: "Singin' in the Rain", year: 1952 },
	{ label: 'Toy Story', year: 1995 },
	{ label: 'Bicycle Thieves', year: 1948 },
	{ label: 'The Kid', year: 1921 },
	{ label: 'Inglourious Basterds', year: 2009 },
	{ label: 'Snatch', year: 2000 },
	{ label: '3 Idiots', year: 2009 },
	{ label: 'Monty Python and the Holy Grail', year: 1975 },
];

export default CampaignFields;
