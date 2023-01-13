import ChatUi from './Component/ChatUi';
import SideBar from './Component/SideBar';
import './css/index.css';
// import './css/App.css';
import DefaultScreen from '../../DefaultScreen';
import { WhatsappChatProps } from './Types/WhatsappChat.type';
import { useState } from 'react';

const WhatsappChat = ({ classes }: WhatsappChatProps) => {
	const [isMobileSideBar, setIsMobileSideBar] = useState<boolean>(false);
	return (
		<>
			<DefaultScreen
				subPage={'chat'}
				currentPage='whatsapp'
				classes={classes}
				customPadding={false}>
				<div className={`${classes.whatsappChat} app`}>
					<div className={`${classes.whatsappChat} app-content`}>
						<SideBar
							isMobileSideBar={isMobileSideBar}
							classes={classes}
							setIsMobileSideBar={() => setIsMobileSideBar(!isMobileSideBar)}
						/>
						<ChatUi
							isMobileSideBar={isMobileSideBar}
							classes={classes}
							setIsMobileSideBar={() => setIsMobileSideBar(!isMobileSideBar)}
						/>
					</div>
				</div>
			</DefaultScreen>
		</>
	);
};

export default WhatsappChat;
