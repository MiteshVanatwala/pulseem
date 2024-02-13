import { ChatHeaderContentProps, Timer } from '../Types/WhatsappChat.type';
import { useEffect, useState } from 'react';

const ChatHeaderContent = ({
	classes,
	whatsappChatSession,
	setWhatsappChatSession,
}: ChatHeaderContentProps) => {
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
			IsNewMessage: false,
		});
	};

	return (
		<>
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
