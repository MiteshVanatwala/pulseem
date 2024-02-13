import React from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { Button } from '@material-ui/core';
import { BsTrash } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import { ButtonsProps } from '../../Editor/Types/WhatsappCreator.types';
import { coreProps } from '../Types/WhatsappCampaign.types';
import { buttons } from '../../Constant';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';

const Buttons = ({
	classes,
	onFormButtonClick,
	displayBackButton,
	showSendButton = true,
	showContinueButton = false,
	isSummary = false
}: ButtonsProps) => {
	const { t: translator } = useTranslation();

	const { isRTL, windowSize } = useSelector(
		(state: { core: coreProps }) => state.core
	);
	const { campaignID } = useParams();
	const navigate = useNavigate();
	const queryParams = new URLSearchParams(window.location.search)
	let FromAutomation = queryParams.get("FromAutomation") || false
	if (FromAutomation === 'false') FromAutomation = false;
	const NodeToEdit = queryParams.get("NodeToEdit") || false
	let isSendCampaign = queryParams.get("new") || false
	if (isSendCampaign === 'false') isSendCampaign = false;

	const handlePreviousPage = () => {
		// if (locationState?.from === 'edit/page1' && campaignID) {
		// 	navigate(`/react/whatsapp/campaign/edit/page1/${campaignID}`, {
		// 		state: { from: 'edit/page1' },
		// 	});
		// } else {
		// 	navigate(-1);
		// }
		let isAutomation = '';
		if (!!FromAutomation) {
			isAutomation = `?FromAutomation=${FromAutomation}&NodeToEdit=${NodeToEdit}&fromreact=true&new=${isSendCampaign}`;
		}

		navigate(`/react/whatsapp/campaign/edit/page1/${campaignID}${isAutomation}`, {
			state: { from: `edit/page1/${campaignID}` },
		});
	};

	return (
		<div
			style={
				isRTL
					? { marginRight: 'auto' }
					: { marginLeft: 'auto', paddingBottom: 40 }
			}
			className={clsx(classes.baseButtonsContainer, 'baseButtonsContainer')}>
			<div className={classes.rightMostContainer}>
				{displayBackButton && (
					<Button
						variant='contained'
						size='medium'
						className={clsx(
							classes.btn,
							classes.btnRounded,
							isRTL && windowSize !== 'xs' && windowSize !== 'sm'
								? classes.marginLeftAuto
								: windowSize !== 'xs' && windowSize !== 'sm'
									? classes.marginRightAuto
									: null
						)}
						color='primary'
						style={{ margin: '8px' }}
						onClick={() => {
							handlePreviousPage();
						}}
						startIcon={isRTL ? <MdArrowForwardIos size={18} /> : <MdArrowBackIos size={18} />}
					>
						{translator('whatsappCampaign.back')}
					</Button>
				)}

				<Button
					variant='contained'
					size='medium'
					className={clsx(
						classes.btn,
            classes.btnRounded
					)}
					style={{ margin: '8px' }}
					onClick={(e) => onFormButtonClick(buttons.DELETE)}>
					<BsTrash size={18} style={{ marginLeft: 0 }} />
				</Button>

				<Button
					variant='contained'
					size='medium'
					className={clsx(
						classes.btn,
            classes.btnRounded
					)}
					color='primary'
					style={{ margin: '8px' }}
					onClick={(e) => onFormButtonClick(buttons.EXIT)}
					endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
				>
					<>{translator('whatsappCampaign.exit')}</>
				</Button>

				<Button
					variant='contained'
					size='medium'
					className={clsx(
						classes.btn,
            classes.btnRounded
					)}
					color='primary'
					style={{ margin: '8px' }}
					onClick={(e) => onFormButtonClick(buttons.SAVE)}
					endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
				>
					<>{translator('whatsappCampaign.save')}</>
				</Button>

				{
					(showSendButton || isSummary) && (
						<Button
							variant='contained'
							size='medium'
							className={clsx(
								classes.redButton,
								classes.btn,
								classes.btnRounded
							)}
							color='primary'
							style={{ margin: '8px' }}
							onClick={(e) => onFormButtonClick(buttons.SEND)}>
							{translator(isSummary ? 'whatsappCampaign.summary' : 'whatsappCampaign.send')}
						</Button>
					)
				}

				{
					showContinueButton && (
						<Button
							variant='contained'
							size='medium'
							className={clsx(
								classes.actionButton,
								classes.actionButtonLightGreen,
								classes.backButton
							)}
							color='primary'
							style={{ margin: '8px' }}
							onClick={(e) => onFormButtonClick(buttons.CONTINUE)}>
							<>{translator('common.continue')}</>
						</Button>
					)
				}
			</div>
		</div>
	);
};

export default React.memo(Buttons);
