import { Box, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { NoSetupProps } from './Types/NoSetup.types';

const NoSetup = ({ classes }: NoSetupProps) => {
	const { t: translator } = useTranslation();
	return (
		<Grid container className={classes.whatsappNoSetupPage}>
			<Box>
				<Box className={classes.whatsappNoSetupMessageWrapper}>
					<div>{translator('whatsappCampaign.setupMessage1')}</div>
					<div>{translator('whatsappCampaign.setupMessage2')}</div>
				</Box>
				<Box className={classes.whatsappNoSetupContactWrapper}>
					<a href = "mailto: sales@pulseem.com">sales@pulseem.com</a>
					<a href="tel:03-5240290">03-5240290</a>
				</Box>
			</Box>
		</Grid>
	);
};

export default NoSetup;
