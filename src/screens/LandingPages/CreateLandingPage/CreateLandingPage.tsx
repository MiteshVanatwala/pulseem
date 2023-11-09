import { useState } from 'react';
import clsx from 'clsx';
import DefaultScreen from '../../DefaultScreen';
import { Title } from '../../../components/managment/Title';
import { useTranslation } from 'react-i18next';
import { Box, Button, Grid } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { Loader } from '../../../components/Loader/Loader';
import { ClassesType } from '../../Classes.types';
import { coreProps } from '../../Whatsapp/Campaign/Types/WhatsappCampaign.types';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import WizardActions from '../../../components/Wizard/WizardActions';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';

const CreateLandingPage = ({ classes }: ClassesType) => {
	const { t: translator } = useTranslation();
	const { isRTL, windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const [isLoader, setIsLoader] = useState<boolean>(false);
	const [dialogType, setDialogType] = useState<{
		type: string;
	} | null>(null);
	const [confirmExit, setConfirmExit] = useState<boolean>(false);
	
	const renderDialog = () => {
		const { type } = dialogType || {}
		let currentDialog: any = {};
		if (type === 'delete') {
			// currentDialog = getDeleteDialog();
		}

		if (type) {
			return (
				dialogType && <BaseDialog
					classes={classes}
					open={dialogType}
					onCancel={() => setDialogType(null)}
					onClose={() => setDialogType(null)}
					renderButtons={currentDialog?.renderButtons || null}
					{...currentDialog}>
					{currentDialog?.content}
				</BaseDialog>
			)
		}
	}

	const renderHeader = () => {
    return (
      <Box className={clsx('stepHead', classes.notificationTitle)}>
				<span className={'stepTitle'}>
					{translator('notifications.createContent')}
				</span>
      </Box>
    )
  }

	const renderButtons = () => {
		const wizardButtons = [];

		wizardButtons.push(
			<Button
				onClick={() => {}}
				className={clsx(
						classes.btn,
						classes.btnRounded,
						classes.backButton
				)}
				style={{ margin: '8px' }}
				endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
			>
				{translator('common.saveAndContinue')}
			</Button>
		);

		wizardButtons.push(
			<Button
				onClick={() => {}}
				className={clsx(
						classes.btn,
						classes.btnRounded,
						classes.backButton
				)}
				style={{ margin: '8px' }}
				endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
			>
				{translator('master.continueToNewEditor')}
			</Button>
		);
		return wizardButtons.map((b) => b);
	}

	const renderTemplateButtons = () => {
		return (
			<Button 
				onClick={() => {}}
				className={clsx(classes.btn, classes.btnRounded )}
				style={{ margin: '8px' }}
			>
				{translator('common.templates')}
			</Button>
		);
	}

	return (
		<DefaultScreen
			currentPage="newsletter"
			subPage={"newsletterInfo"}
			classes={classes}
			customPadding={true}
			containerClass={clsx(classes.mb50, classes.editorCont)}
		>
			<Box className="head">
				<Title Text={translator("landingPages.createLandingPage")} classes={classes} />
			</Box>
			<Box className={"containerBody"}>
					<Grid container spacing={3} className={clsx(classes.p15)}>
						1
					</Grid>

					<Box className={classes.flex}>
							<WizardActions
									classes={classes}
									// @ts-ignore
									onBack={{
											callback: () => { setConfirmExit(true) }
									}}
									// onDelete={id > 0 && !isFromAutomation && getDeleteStatus}
									// @ts-ignore
									additionalButtons={renderButtons()}
									// @ts-ignore
									additionalButtonsOnStart={renderTemplateButtons()}
							/>
					</Box>
				<Loader isOpen={isLoader} />
			</Box>
			{renderDialog()}
		</DefaultScreen>
	);
};

export default CreateLandingPage;
