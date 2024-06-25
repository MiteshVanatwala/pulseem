import { Box, Button, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { NoSetupProps } from './Types/NoSetup.types';
import { Call, MailOutlineOutlined } from '@material-ui/icons';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { Link } from '@mui/material';
import { WhiteLabelObject } from '../../../components/WhiteLabel/WhiteLabelMigrate';

const NoSetup = ({ classes, isCompact = false }: NoSetupProps) => {
	const { t: translator } = useTranslation();

	const { accountSettings } = useSelector((state: any) => state.common);

	return (
		<Grid container className={clsx(classes.whatsappNoSetupPage, isCompact ? classes.hAuto : '')}>
			<Box>
				<Box className={classes.whatsappNoSetupMessageWrapper}>
					<div>{translator('whatsappCampaign.setupMessage1')}</div>
					<div>{translator('whatsappCampaign.setupMessage2')}</div>
				</Box>
				<Box className={classes.whatsappNoSetupContactWrapper}>
					<Button className={classes.whatsappNoSetupContactButton}>
						<MailOutlineOutlined />
						{/* @ts-ignore */}
						{<Link href={`mailto:${WhiteLabelObject[accountSettings?.Account?.ReferrerID || 0]['Email']}`}>{WhiteLabelObject[accountSettings?.Account?.ReferrerID || 0]['Email']}</Link>}
					</Button>
					<Button className={classes.whatsappNoSetupContactButton}>
						<Call />
						{/* @ts-ignore */}
						{<Link href={`tel:${WhiteLabelObject[accountSettings?.Account?.ReferrerID || 0]['Telephone']}`}>{WhiteLabelObject[accountSettings?.Account?.ReferrerID || 0]['Telephone']}</Link>}
					</Button>
				</Box>
			</Box>
		</Grid>
	);
};

export default NoSetup;
