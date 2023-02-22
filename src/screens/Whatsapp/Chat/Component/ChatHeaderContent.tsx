import {
	ChatHeaderContentProps,
	Timer,
} from '../Types/WhatsappChat.type';
import clsx from 'clsx';
import { MenuItem, Select, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { user } from './data';
import { useEffect, useState } from 'react';

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
	const [isTimerover, setIsTimerOver] = useState<boolean>(false);
	const [timer, setTimer] = useState<Timer>({
		Hour: Number(whatsappChatSession?.Hour),
		Minute: Number(whatsappChatSession?.Minute),
		Second: Number(whatsappChatSession?.Second),
	});

	useEffect(() => {
		let timerID = setInterval(() => tickTimer(), 1000);
		return () => clearInterval(timerID);
	});

	useEffect(() => {
		setTimer({
			Hour: Number(whatsappChatSession?.Hour),
			Minute: Number(whatsappChatSession?.Minute),
			Second: Number(whatsappChatSession?.Second),
		});
	}, [whatsappChatSession]);

	useEffect(() => {
		if (isTimerover) {
			onTimerComplete();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isTimerover]);

	const tickTimer = () => {
		if (isTimerover) return;
		if (timer.Hour === 0 && timer.Minute === 0 && timer.Second === 0)
			setIsTimerOver(true);
		else if (timer.Minute === 0 && timer.Second === 0)
			setTimer({
				Hour: timer.Hour - 1,
				Minute: 59,
				Second: 59,
			});
		else if (timer.Second === 0)
			setTimer({
				Hour: timer.Hour,
				Minute: timer.Minute - 1,
				Second: 59,
			});
		else
			setTimer({
				Hour: timer.Hour,
				Minute: timer.Minute,
				Second: timer.Second - 1,
			});
	};

	const countDown = () => {
		return (
			<span>
				{timer?.Hour?.toString()?.padStart(2, '0')}:
				{timer?.Minute?.toString()?.padStart(2, '0')}:
				{timer?.Second?.toString()?.padStart(2, '0')}
			</span>
		);
	};

	const onTimerComplete = () => {
		setWhatsappChatSession({
			ExpiryTime: '',
			IsIn24Window: false,
			Hour: '0',
			Minute: '0',
			Second: '0',
		});
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
						{countDown()}
					</div>
				</div>
			)}
		</>
	);
};

export default ChatHeaderContent;
