import { useState } from 'react';
import clsx from 'clsx';
import DefaultScreen from '../../DefaultScreen';
import { Title } from '../../../components/managment/Title';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { Loader } from '../../../components/Loader/Loader';
import { ClassesType } from '../../Classes.types';
import { coreProps } from '../../Whatsapp/Campaign/Types/WhatsappCampaign.types';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';

const CreateLandingPage = ({ classes }: ClassesType) => {
	const { t: translator } = useTranslation();
	const { isRTL, windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const [isLoader, setIsLoader] = useState<boolean>(false);
	const [dialogType, setDialogType] = useState<{
		type: string;
	} | null>(null);
	
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

	return (
		<DefaultScreen
			subPage={'create'}
			currentPage='whatsapp'
			classes={classes}
			containerClass={classes.editorCont}
		>
			<Box className={"head"}>
				{/* {renderToast()} */}
				<Box className={'topSection'}>
					<Title
						Text={translator('landingPages.createLandingPage')}
						classes={classes}
					/>
				</Box>

				<Box className={'containerBody'}>
					<div className={clsx(classes.mb8)}>
						<div className={clsx(classes.f18, classes.bold, classes.borderBottom1, classes.pb10)}>
							{translator('landingPages.formProperties')}
							({translator('common.Required')})
						</div>
					</div>

					<div className={clsx(classes.mb8)}>
						<div className={clsx(classes.f18, classes.bold, classes.borderBottom1, classes.pb10)}>{translator('landingPages.formProperties')}</div>
					</div>
				</Box>
			</Box>
			{renderDialog()}
			<Loader isOpen={isLoader} showBackdrop={true} />
		</DefaultScreen>
	);
};

export default CreateLandingPage;
