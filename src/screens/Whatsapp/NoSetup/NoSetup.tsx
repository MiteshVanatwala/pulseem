import { Box, Button, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { NoSetupProps } from './Types/NoSetup.types';
import { Call, MailOutlineOutlined } from '@material-ui/icons';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { Link } from '@mui/material';

const NoSetup = ({ classes, isCompact = false }: NoSetupProps) => {
	const { t: translator } = useTranslation();

	const { accountSettings } = useSelector((state: any) => state.common);

	const wl_renderEmailElement = () => {
		switch (accountSettings?.Account?.ReferrerID) {
			case 4:
			case '4': {
				return <Link href={`mailto:${accountSettings?.Account?.Email}`}>{accountSettings?.Account?.Email}</Link>
			}
			default: {
				return <Link href={`mailto:sales@pulseem.com`}>sales@pulseem.com</Link>
			}
		}
	}

	const wl_renderPhoneElement = () => {
		switch (accountSettings?.Account?.ReferrerID) {
			case 4:
			case '4': {
				return <Link href={`mailto:${accountSettings?.Account?.Telephone}`}>{accountSettings?.Account?.Telephone}</Link>
			}
			default: {
				return <Link href={`tel:03-5240290`}>03-5240290</Link>
			}
		}
	}

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
						{wl_renderEmailElement()}
					</Button>
					<Button className={classes.whatsappNoSetupContactButton}>
						<Call />
						{wl_renderPhoneElement()}
					</Button>
				</Box>
			</Box>
		</Grid>
	);
};

export default NoSetup;
