import ChatUi from './Component/ChatUi';
import SideBar from './Component/SideBar';
import './css/index.css';
// import './css/App.css';
import DefaultScreen from '../../DefaultScreen';
import { WhatsappChatProps } from './Types/WhatsappChat.type';
import { useEffect, useState } from 'react';
import {
	savedTemplateAPIProps,
	savedTemplateListProps,
} from '../Editor/Types/WhatsappCreator.types';
import { useDispatch } from 'react-redux';
import { getSavedTemplates } from '../../../redux/reducers/whatsappSlice';

const WhatsappChat = ({ classes }: WhatsappChatProps) => {
	const dispatch = useDispatch();
	const [isMobileSideBar, setIsMobileSideBar] = useState<boolean>(false);
	const [isTemplateModal, setIsTemplateModal] = useState<boolean>(false);
	const [newMessage, setNewMessage] = useState<string>('');
	const [savedTemplateList, setSavedTemplateList] = useState<
		savedTemplateListProps[]
	>([]);
	useEffect(() => {
		getSavedTemplateFields();
	}, []);
	const getSavedTemplateFields = async () => {
		let savedTemplate: savedTemplateAPIProps = await dispatch<any>(
			getSavedTemplates({ templateStatus: 3 })
		);
		setSavedTemplateList(savedTemplate.payload.Data.Items);
	};
	const onChoose = (
		_template: savedTemplateListProps,
		templateText: string | null
	) => {
		setNewMessage(templateText || '');
		setIsTemplateModal(false);
	};
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
							savedTemplateList={savedTemplateList}
							onChoose={(template, templateText) =>
								onChoose(template, templateText)
							}
							newMessage={newMessage}
							setNewMessage={setNewMessage}
							isTemplateModal={isTemplateModal}
							setIsTemplateModal={setIsTemplateModal}
						/>
					</div>
				</div>
			</DefaultScreen>
		</>
	);
};

export default WhatsappChat;
