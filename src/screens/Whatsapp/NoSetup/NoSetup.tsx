import { Box, Button, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { NoSetupProps } from './Types/NoSetup.types';
import { Call, MailOutlineOutlined } from '@material-ui/icons';

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
					<Button className={classes.whatsappNoSetupContactButton}>
						<MailOutlineOutlined />
						<a href='mailto: sales@pulseem.com'>sales@pulseem.com</a>
					</Button>
					<Button className={classes.whatsappNoSetupContactButton}>
						<Call />
						<a href='tel:03-5240290'>03-5240290</a>
					</Button>
				</Box>
			</Box>
		</Grid>
	);
};

export default NoSetup;
