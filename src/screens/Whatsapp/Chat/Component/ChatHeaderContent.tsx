import {
	ChatHeaderContentProps,
	displayCountDown,
} from '../Types/WhatsappChat.type';
import clsx from 'clsx';
import { MenuItem, Select, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import Countdown from 'react-countdown';
import { user } from './data';

const ChatHeaderContent = ({
	classes,
	whatsappChatSession,
	chatContacts,
	getStatusClass,
	handleUserStatus,
	setWhatsappChatSession,
}: ChatHeaderContentProps) => {
	const { t: translator } = useTranslation();

	const useStyles = makeStyles(() => ({
		selectRoot: {
			fontSize: '18px',
			'&:focus': {
				backgroundColor: 'rgba(0,0,0,0)',
			},
		},
		selectSection: {
			'&:focus': {
				backgroundColor: 'rgba(0,0,0,0)',
			},
		},
	}));
	const muiclasses = useStyles();

	const countDown = ({ formatted }: displayCountDown) => {
		return (
			<span>
				{formatted?.hours}:{formatted?.minutes}:{formatted?.seconds}
			</span>
		);
	};

	const onTimerComplete = (data: any) => {
		return (
			<span>
				{/* {formatted?.hours}:{formatted?.minutes}:{formatted?.seconds} */}
			</span>
		);
	};

	return (
		<>
			<div className={`${classes.whatsappChat} chat__contact-wrapper`}>
				<h2 className={`${classes.whatsappChat} chat__contact-name`}>
					{' '}
					{chatContacts.UserName || chatContacts.PhoneNumber || 'Pulseem'}
					<span className={classes.whatsappChatUiStatusPadding}>
						<Select
							classes={{ root: muiclasses.selectSection }}
							className={clsx(
								classes.whatsappChatStatusSelect,
								getStatusClass(chatContacts.ConversationStatusId)
							)}
							autoWidth
							value={chatContacts.ConversationStatusId || ''}
							variant='standard'
							style={
								chatContacts.ConversationStatusId
									? {
											fontSize: '12px',
											padding: '8px 0px 8px 8px',
											position: 'absolute',
											borderRadius: '10px',
											textAlign: 'center',
									  }
									: {
											display: 'none',
									  }
							}
							onChange={(e) => handleUserStatus(e, chatContacts.PhoneNumber)}>
							<MenuItem value={1}>{translator('whatsappChat.open')}</MenuItem>
							<MenuItem value={2}>
								{translator('whatsappChat.pending')}
							</MenuItem>
							<MenuItem value={3}>{translator('whatsappChat.solved')}</MenuItem>
						</Select>
					</span>
				</h2>
				<p className={`${classes.whatsappChat} chat__contact-desc`}>
					{user.typing
						? translator('whatsappChat.type')
						: translator('whatsappChat.online')}
				</p>
			</div>

			{whatsappChatSession.IsIn24Window && (
				<div className={`${classes.whatsappChat} chat__actions`}>
					<div
						className={`${classes.whatsappChat} chat__action chat__action-icon`}>
						<Countdown
							date={whatsappChatSession?.ExpiryTime}
							renderer={countDown}
							onComplete={onTimerComplete}
						/>
					</div>
				</div>
			)}
		</>
	);
};

export default ChatHeaderContent;
