import { Box, Button, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { NoSetupProps } from './Types/NoSetup.types';
import { Call, MailOutlineOutlined } from '@material-ui/icons';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { Link } from '@mui/material';
import { WhiteLabelObject } from '../../../components/WhiteLabel/WhiteLabelMigrate';
import { useEffect, useState } from 'react';

const NoSetup = ({ classes, isCompact = false, customMessage = '' }: NoSetupProps) => {
	const { t: translator } = useTranslation();
	const { windowSize } = useSelector((state: any) => state.core);
	const { accountSettings } = useSelector((state: any) => state.common);
	const [isWhiteLabel, setIsWhiteLabel] = useState<boolean>(false);

	useEffect(() => {
		//@ts-ignore
		setIsWhiteLabel(accountSettings?.Account?.ReferrerID > 0 && WhiteLabelObject[accountSettings?.Account?.ReferrerID] !== undefined);
	}, [accountSettings])

	return (
		<Grid container className={clsx(classes.whatsappNoSetupPage, isCompact ? classes.hAuto : '')}>
			<Box className={clsx(windowSize !== 'xs' ? classes.w30 : null)}>
				<Box className={classes.whatsappNoSetupMessageWrapper}>
					{
						customMessage !== '' ? (
							<div>{customMessage}</div>
						) : (
							<>
								<div>{translator('whatsappCampaign.setupMessage1')}</div>
								<div>{translator('whatsappCampaign.setupMessage2')}</div>
							</>
						)
					}
				</Box>
				<Box className={classes.whatsappNoSetupContactWrapper}>
					<Button className={classes.whatsappNoSetupContactButton}>
						<MailOutlineOutlined />
						{/* @ts-ignore */}
						{<Link href={`mailto:${WhiteLabelObject[isWhiteLabel ? accountSettings?.Account?.ReferrerID : 0]['Email']}`}>{WhiteLabelObject[isWhiteLabel ? accountSettings?.Account?.ReferrerID : 0]['Email']}</Link>}
					</Button>
					<Button className={classes.whatsappNoSetupContactButton}>
						<Call />
						{/* @ts-ignore */}
						{<Link href={`tel:${WhiteLabelObject[isWhiteLabel ? accountSettings?.Account?.ReferrerID : 0]['Phone']}`}>{WhiteLabelObject[isWhiteLabel ? accountSettings?.Account?.ReferrerID : 0]['Phone']}</Link>}
					</Button>
				</Box>
			</Box>
		</Grid>
	);
};

export default NoSetup;
