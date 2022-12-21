import { ClassesType } from '../../Classes.types';
import DefaultScreen from '../../DefaultScreen';
import WizardTitle from '../../../components/Wizard/WizardTitle';
import { Grid } from '@material-ui/core';
import { WhatsappCampaignSecondProps } from './WhatsappCampaign.types';
import { useTranslation } from 'react-i18next';
import GroupsList from './GroupsList';
import RightPane from './RightPane';
import FilterRecipientsDialog from './FilterRecipientsDialog';

const SendCampaign = ({
	classes,
}: ClassesType & WhatsappCampaignSecondProps) => {
	const { t: translator } = useTranslation();

	return (
		<DefaultScreen
			subPage={'send2'}
			currentPage='whatsapp'
			classes={classes}
			customPadding={true}>
			<div>
				<FilterRecipientsDialog classes={classes} />
				<div>
					<WizardTitle
						title={translator('mainReport.smsCampaign')}
						classes={classes}
						stepNumber={2}
						subTitle={translator('mainReport.sendSetting')}
					/>
					<Grid container style={{ marginBottom: '40px' }}>
						<Grid item md={7} xs={12}>
							<GroupsList classes={classes} />
						</Grid>
						<Grid item md={1} xs={12}></Grid>
						<Grid item md={4} xs={12}>
							<RightPane classes={classes} />
						</Grid>
					</Grid>
				</div>
			</div>
		</DefaultScreen>
	);
};

export default SendCampaign;
