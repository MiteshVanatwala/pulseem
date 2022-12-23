import ChatUi from './ChatUi';
import SideBar from './SideBar';
import './css/index.css';
import './css/App.css';
import DefaultScreen from '../../DefaultScreen';
import { WhatsappChatProps } from './WhatsappChat.type';

const WhatsappChat = ({ classes }: WhatsappChatProps) => {
	return (
		<>
			<DefaultScreen
				subPage={'chat'}
				currentPage='whatsapp'
				classes={classes}
				customPadding={false}>
				<div className='app'>
					<p className='app__mobile-message'> Only available on desktop 😊. </p>
					<div className='app-content'>
						<SideBar />
						<ChatUi />
					</div>
				</div>
			</DefaultScreen>
		</>
	);
};

export default WhatsappChat;
