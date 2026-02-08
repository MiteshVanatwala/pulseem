export const getWhatsappStyle = (windowSize, isRTL, theme) => ({
	whatsappCampaignTitle: {
		fontSize: windowSize === 'xs' ? '25px' : '30px',
		color: '#333333',
		paddingBlock: '0.5rem',
		fontFamily: 'Assistant',
		fontWeight: 'bold',
		marginTop: 0,
		whiteSpace: windowSize === 'xs' ? 'break-spaces' : null,
	},
	whatsappTemplateTitle: {
		fontSize: windowSize === 'xs' ? '25px' : '36px',
		color: '#333333',
		paddingBlock: '0.5rem',
		fontFamily: 'Assistant',
		fontWeight: 'bold',
		marginTop: 20,
		whiteSpace: windowSize === 'xs' ? 'break-spaces' : null,
	},
	whatsappSmallInfoDiv: {
		display: 'flex',
		width: '100%',
		boxSizing: 'border-box',
		position: 'relative',
		top: '-4px',
		justifyContent: 'flex-end',
		alignItems: 'center',
		color: '#1c82b2',
		fontSize: '12px',
		padding: '14px 10px',
		border: '1px solid #ced4da',
		borderTop: 'none',
	},
	whatsappFuncDiv: {
		width: '100%',
		height: '60px',
		boxSizing: 'border-box',
		display: 'inline-block',
		gridTemplateColumns: '64px auto',
		position: 'relative',
		top: '-4px',
		padding: 5,
		border: '1px solid #ced4da',
		borderTop: 'none',
		alignItems: 'center',
		borderBottomLeftRadius: '.25rem',
		borderBottomRightRadius: '.25rem',
		'@media screen and (max-width: 768px)': {
			height: '110px',
		},
		'@media screen and (max-width: 556px)': {
			display: 'flex',
			height: 'auto',
		},
	},
	whatsappEmoji: {
		'@media screen and (max-width: 556px)': {
			flexDirection: 'unset',
			paddingLeft: '10px',
		},
	},
	whatsappBaseButtons: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-evenly',
		height: '100%',
		'& button': {
			marginRight: 5,
		},
		'@media screen and (max-width: 540px)': {
			flexDirection: 'column-reverse',
			paddingInlineEnd: '8px',
		},
		'@media screen and (max-width: 556px)': {
			display: 'inline',
			flexDirection: 'unset',
			textAlign: 'center',
			marginTop: 5,
			'& button': {
				marginBottom: 5,
				marginRight: 5,
			}
		},
	},
	WhatsappTextareaWrapper: {
		border: '1px solid #ced4da',
		height: '240px',
		maxHeight: '240px',
		overflowY: 'auto',
		borderBottom: '0px',
		borderTopLeftRadius: '0.25rem',
		borderTopRightRadius: '0.25rem',
		'& textarea': {
			border: 'none',
			height: 'auto',
		},
	},
	whatsappActionButtonsWrapper: {
		paddingTop: '10px',
	},
	whatsappActionButtonsBox: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'center',
		padding: '4px 8px',
	},
	whatsappActionButtons: {
		backgroundColor: '#fff',
		color: '#ff3343',
		borderRadius: '6px',
		padding: '0px 14px',
		textTransform: 'none',
		fontWeight: '600',
		cursor: 'pointer',
		border: 'solid 1px #ff3343',
		'&:hover': {
			backgroundColor: '#ff3343',
			color: '#fff',
			cursor: 'pointer'
		},
	},
	whatsappInfoButtons: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 20,
		fontWeight: 600,
		color: 'white',
		backgroundColor: '#1c82b2',
		cursor: 'pointer',
		borderColor: '#1c82b2',
		textTransform: 'none',
		marginInlineStart: 1,
		marginInlineEnd: 1,
		padding: '5px 14px',
		fontSize: '14px',
		'&$disabled': {
			cursor: 'not-allowed !important',
		},
		'&:hover': {
			backgroundColor: '#1c82b2',
		},
		'@media screen and (max-width: 1366px)': {
			fontSize: 11,
		},
		'@media screen and (max-width: 768px)': {
			width: '110px',
			padding: '8px',
			marginBottom: 5,
			fontSize: 11,
		},
		'@media screen and (max-width: 530px)': {
			'&:first-child': {
				marginInlineStart: 0,
				marginInlineEnd: 0,
			},
			'&:nth-child(2)': {
				marginInlineStart: 0,
				marginInlineEnd: 0,
			},
		},
		'@media screen and (max-width: 375px)': {
			'&:first-child': {
				marginInlineStart: 5,
				marginInlineEnd: 0,
			},
			'&:nth-child(2)': {
				marginInlineStart: 5,
				marginInlineEnd: 0,
			},
		},
	},
	textInfo: {
		marginLeft: isRTL ? '0px' : '4px',
		marginRight: isRTL ? '4px' : '0px',
		color: '#8b8b8b',
	},
	textInfoWrapper: {
		fontSize: '14px',
		fontWeight: '400',
		marginRight: '10px',
		color: '#1c82b2',
		'&.limit-exceed': {
			color: '#c9302c',
		},
	},
	callToActionDialogHeaderDescription: {
		fontSize: 16,
		// fontFamily: 'OpenSansHebrew',
		// marginTop: '-8px',
		textAlign: isRTL ? 'right' : 'left',
	},
	callToActionDialogHeaderTitle: {
		fontSize: 14,
		fontFamily: 'OpenSansHebrew-Bold',
		color: '#0371ad',
		paddingBottom: '0px',
		textAlign: isRTL ? 'right' : 'left',
	},
	callToActionDialogClose: {
		position: 'absolute',
		top: 0,
		left: isRTL ? 0 : 'unset',
		right: isRTL ? 'unset' : 0,
	},
	callToActionFields: {
		direction: isRTL ? 'rtl' : 'ltr',
		'& .keep-track': {
			paddingTop: 5
		},
		'& .keep-track-desc': {
			color: '#aaa'
		},
		'& .MuiGrid-container': {
			paddingBottom: 20
		}
	},
	quickReplyDelete: {
		alignItems: 'center',
		color: '#ff0000',
		cursor: 'pointer',
		paddingTop: '22px',
		paddingLeft: isRTL ? '0px' : '10px',
		paddingRight: isRTL ? '10px' : '0px',
	},
	quickReplayDialog: {
		direction: isRTL ? 'rtl' : 'ltr',
	},
	quickReplayDialogClose: {
		position: 'absolute',
		top: 0,
		left: isRTL ? 0 : 'unset',
		right: isRTL ? 'unset' : 0,
	},
	quickReplayDialogHeader: {
		fontSize: 14,
		fontFamily: 'OpenSansHebrew-Bold',
		color: '#0371ad',
		paddingBottom: '0px',
		textAlign: isRTL ? 'right' : 'left',
	},
	quickReplayDialogHeaderDescription: {
		fontSize: 12,
		fontFamily: 'OpenSansHebrew',
		marginTop: '-8px',
		textAlign: isRTL ? 'right' : 'left',
	},
	quickReplayButtonGridWrapper: {
		padding: '4px 0px',
	},
	quickReplayButtonWrapper: {
		border: '1px solid #bbb',
		borderRadius: '5px',
		outline: 'none',
	},
	quickReplaybuttonField: {
		outline: 'none',
		padding: '8px 12px 8px 4px',
		fontSize: '16px',
	},
	quickReplayValidationCounter: {
		border: '0px',
		borderRight: isRTL ? '1px solid rgba(0, 0, 0, 0.23)' : '0px',
		borderLeft: isRTL ? '0px' : '1px solid rgba(0, 0, 0, 0.23)',
		backgroundColor: '#ededed',
		cursor: 'auto',
		height: '100%',
		'&:hover': {
			backgroundColor: '#ededed',
		},
	},
	quickReplySave: {
		backgroundColor: 'green',
		color: 'white',
		'&:hover': {
			backgroundColor: 'green',
		},
	},
	/* WhatsApp Mobile Main Page Section */

	whatsappMobileSection: {
		width: '100%',
		height: '425px',
		overflow: 'hidden',
		display: 'flex',
		alignItems: 'flex-start',
		justifyContent: 'center',
		'@media screen and (max-width: 768px)': {
			alignItems: 'flex-start',
		},
	},
	whatsappMobilePreviewWrapper: {
		maxWidth: '416px',
		margin: '0 auto',
		marginTop: '-85px',
		'@media screen and (max-width: 1279px)': {
			marginTop: '-63px',
		},
		'@media screen and (max-width: 959px)': {
			marginTop: '0px',
		},
	},
	whatsappPhoneImg: {
		width: '100%',
		height: '100%',
		borderBottom: '1px solid #ccc',
	},
	/* Status Bar */

	whatsappMobileStatusBar: {
		height: '25px',
		background: '#004e45',
		color: '#fff',
		fontSize: '14px',
		padding: '0 8px',
		'&:after': { content: '', display: 'table', clear: 'both' },
		'& div': {
			float: isRTL ? 'left' : 'right',
			position: 'relative',
			top: '50%',
			transform: 'translateY(-50%)',
			margin: '0 0 0 8px',
			fontWeight: '600',
		},
	},
	/* Chat */

	whatsappMobileChat: {
		height: 'calc(100% - 69px)',
	},

	whatsappMobileChatContainer: {
		height: '100%',
	},
	/* User Bar */

	whatsappMobileUserBar: {
		height: '55px',
		background: '#005e54',
		color: '#fff',
		padding: '0 8px',
		fontSize: '24px',
		position: 'relative',
		zIndex: '1',
		'& .navigation-arrow': {
			transform: isRTL ? 'rotateY(180deg)' : '',
		},
		'&:after': { content: '', display: 'table', clear: 'both' },
		'& div': {
			float: isRTL ? 'right' : 'left',
			transform: 'translateY(-50%)',
			position: 'relative',
			top: '50%',
		},
		'& .actions': {
			float: isRTL ? 'left' : 'right',
			margin: isRTL ? '5px 0 0 0' : '5px 0 0 10px',
			'& img': {
				height: '28px',
			},
			'&.more': {
				margin: isRTL ? '0 20px 0 12px' : '0 12px 0 20px',
			},
			'&.attachment': {
				margin: isRTL ? '0 20px 0 0' : '0 0 0 20px',
				'& i': { display: 'block' },
			},
		},
		'& .avatar': {
			margin: isRTL ? '0 5px 0 5px' : '0 0 0 5px',
			width: '36px',
			height: '36px',
			'& img': {
				borderRadius: '50%',
				boxShadow: '0 1px 0 rgba(255, 255, 255, 0.1)',
				display: 'block',
				width: '100%',
			},
		},
		'& .name': {
			fontSize: '17px',
			fontWeight: '600',
			textOverflow: 'ellipsis',
			letterSpacing: '0.3px',
			margin: isRTL ? '0 8px 0 0' : '0 0 0 8px',
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			width: 'calc(100% - 177px)',
		},
		'& .status': {
			display: 'block',
			fontSize: '13px',
			fontWeight: '400',
			letterSpacing: '0',
		},
	},
	/* Message */

	whatsappMobileMessage: {
		color: '#000',
		clear: 'both',
		lineHeight: '18px',
		fontSize: '15px',
		position: 'relative',
		margin: '8px 0',
		maxWidth: '85%',
		wordWrap: 'break-word',
		'&::after': {
			position: 'absolute',
			content: '',
			width: '0',
			height: '0',
			borderStyle: 'solid',
		},
		'&.sent': {
			float: isRTL ? 'right' : 'left',
			'&::after': {
				borderWidth: '0px 10px 10px 0px',
				borderColor: 'transparent transparent transparent #e1ffc7',
				top: '0',
				left: '-10px',
			},
			'& pre': {},
		},
		'&.whatsapp-chat': {
			margin: '0',
			maxWidth: '100%',
		},
		'&.quick-reply-button': {
			backgroundColor: '#b7b7b7',
			color: '#1c82b2',
		},
		'&. pushMessage': {
			background: '#fff',
			borderRadius: '5px 5px 5px 5px',
			margin: '10px 12px',
			color: '#337ab7',
			float: 'none',
			textAlign: 'center',
			'&:after': {
				borderWidth: '0px 0px 10px 10px',
				borderColor: 'transparent #fff transparent transparent',
				top: '0',
				right: '-10px',
			},
		},
	},
	whatsappMobileMessageTextAndImage: {
		margin: '0px',
		fontFamily: 'Assistant',
		whiteSpace: 'pre-line',
		background: '#dbf8c6',
		padding: '8px',
		borderRadius: isRTL ? '5px 0px 5px 5px' : '0px 5px 5px 5px',
		'&.transparent-background': {
			background: 'transparent',
			padding: '0px',
		},
		'& pre': {
			wordWrap: 'break-word',
			whiteSpace: 'pre-line',
			margin: '0px',
			fontFamily: 'Assistant',
		},
		'&.whatsapp-chat': {
			padding: '0px',
		},
		'& img': {
			width: '100%',
			borderRadius: '4px',
			'&.video-preview-img': {
				width: '100%',
				background: 'white',
				padding: '12px 0px',
				height: '139px',
			},
			'&.pdf-preview-img': {
				width: '38px',
				padding: '4px',
				paddingLeft: '0px',
			},
			'&.download-preview-img': {
				width: '28px',
				padding: '4px',
				marginTop: '5px',
			},
		},
	},
	callToActionButtonsWrapper: {
		borderTop: '1px solid #cbcbcb',
		textAlign: 'center',
		'& a': {
			display: 'flex',
			flexDirection: 'row',
			textDecoration: 'none',
			color: '#1c82b2',
			alignItems: 'self-end',
			background: '#b7b7b7',
			borderRadius: '4px',
			padding: '2px 5px',
			marginTop: '3px',
			justifyContent: 'center',
		},
	},
	callToActionButton: {
		color: '#1c82b2',
		cursor: 'pointer',
	},
	callToActionButtonText: {
		paddingLeft: isRTL ? '0' : '8px',
		paddingRight: isRTL ? '8px' : '0',
	},
	quickReplyButtonWrapper: {
		textAlign: 'center',
		cursor: 'pointer',
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
	},
	quickReplyButtonText: {
		color: '#1c82b2',
	},
	/* Marvel Device */

	whatsappMobileMarvelDevice: {
		display: 'inline-block',
		position: 'relative',
		webkitBoxSizing: 'content-box !important',
		boxSizing: 'content-box !important',
		'& .screen': {
			width: '100%',
			position: 'relative',
			height: 'calc(100% - 2px)',
			zIndex: '3',
			background: 'white',
			overflow: 'hidden',
			display: 'block',
			borderRadius: '1px',
			webkitBoxShadow: '0 0 0 3px #111',
			boxShadow: '0 0 0 3px #111',
		},
		'&.nexus5': {
			padding: '50px 15px 50px 15px',
			width: 'calc(100% - 31px)',
			height: '100%',
			background: '#1e1e1e',
			borderRadius: '20px',
			'@media (max-width: 768px)': {
				maxWidth: 'none',
				width: '100%',
			},
			'&:before': {
				borderRadius: '600px / 50px',
				background: 'inherit',
				content: '',
				position: 'absolute',
				height: '103.1%',
				width: 'calc(100% - 26px)',
				top: '50%',
				left: '50%',
				webkitTransform: 'translateX(-50%) translateY(-50%)',
				transform: 'translateX(-50%) translateY(-50%)',
			},
			'& .top-bar': {
				width: 'calc(100% - 8px)',
				height: 'calc(100% - 6px)',
				position: 'absolute',
				top: '3px',
				left: '4px',
				borderRadius: '20px',
				background: '#181818',
				'&:before': {
					borderRadius: '600px / 50px',
					background: 'inherit',
					content: '',
					position: 'absolute',
					height: '103%',
					width: 'calc(100% - 26px)',
					top: '50%',
					left: '50%',
					webkitTransform: 'translateX(-50%) translateY(-50%)',
					transform: 'translateX(-50%) translateY(-50%)',
				},
			},
			'& .sleep': {
				width: '3px',
				position: 'absolute',
				left: '-3px',
				top: '110px',
				height: '100px',
				background: 'inherit',
				borderRadius: '2px 0px 0px 2px',
			},
			'& .volume': {
				width: '3px',
				position: 'absolute',
				right: '-3px',
				top: '70px',
				height: '45px',
				background: 'inherit',
				borderRadius: '0px 2px 2px 0px',
			},
			'& .camera': {
				background: '#3c3d3d',
				width: '10px',
				height: '10px',
				position: 'absolute',
				top: '18px',
				left: '50%',
				zIndex: '3',
				marginLeft: '-5px',
				borderRadius: '100%',
				'&:before': {
					background: '#3c3d3d',
					width: '6px',
					height: '6px',
					content: '',
					display: 'block',
					position: 'absolute',
					top: '2px',
					left: '-100px',
					zIndex: '3',
					borderRadius: '100%',
				},
			},
		},
	},
	/* Screen Container */

	whatsappMobileScreenContainer: {
		height: '100%',
	},
	/* Conversation */

	whatsappMobileConversation: {
		height: 'calc(100% - 12px)',
		position: 'relative',
		background: "url('https://i.ibb.co/3s1f9Jq/default-wallpaper.png') repeat",
		zIndex: '0',
		'&::-webkit-scrollbar': {
			transition: 'all 0.5s',
			width: '5px',
			height: '1px',
			zIndex: '10',
		},
		'&::-webkit-scrollbar-track': {
			background: 'transparent',
		},
		'&::-webkit-scrollbar-thumb': {
			background: '#b3ada7',
		},
		'& .conversation-container': {
			height: 'calc(100% - 68px)',
			boxShadow: 'inset 0 10px 10px -10px #000000',
			overflowX: 'hidden',
			padding: '0 16px',
			marginBottom: '19px',
			'&:after': {
				content: '',
				display: 'table',
				clear: 'both',
			},
			'&::-webkit-scrollbar': {
				width: '4px',
			},
			'&::-webkit-scrollbar-track': {
				background: '#f1f1f1',
			},
			'&::-webkit-scrollbar-thumb': {
				background: '#888',
			},
			'&::-webkit-scrollbar-thumb:hover': {
				background: '#555',
			},
		},
	},
	/* Compose */

	whatsappMobileConversationCompose: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-end',
		overflow: 'hidden',
		height: '40px',
		width: '100%',
		zIndex: '2',
		'& div': {
			background: '#fff',
			height: '100%',
		},
		'& input': {
			background: '#fff',
			height: '100%',
		},
		'& .emoji': {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			background: 'white',
			borderRadius: isRTL ? '0 50% 50% 0' : '50% 0 0 50%',
			flex: '0 0 auto',
			marginLeft: isRTL ? '0' : '8px',
			marginRight: isRTL ? '8px' : '0',
			width: '38px',
			height: '38px',
		},
		'& .input-msg': {
			border: '0',
			flex: '1 1 auto',
			fontSize: '14px',
			margin: '0',
			outline: 'none',
			minWidth: '50px',
			height: '36px',
		},
		'& .photo': {
			flex: '0 0 auto',
			borderRadius: isRTL ? '30px 0 0 30px' : '0 30px 30px 0',
			textAlign: 'center',
			width: 'auto',
			display: 'flex',
			paddingRight: isRTL ? '0' : '6px',
			paddingLeft: isRTL ? '18px' : '0',
			height: '38px',
			'& img': {
				display: 'block',
				color: '#7d8488',
				fontSize: '24px',
				transform: 'translate(-50%, -50%)',
				position: 'relative',
				top: '50%',
				marginLeft: '10px',
			},
		},
		'& .send': {
			background: 'transparent',
			border: '0',
			cursor: 'pointer',
			flex: '0 0 auto',
			marginRight: '8px',
			padding: '0',
			position: 'relative',
			outline: 'none',
			marginLeft: '0.5rem',
			transform: isRTL ? 'rotateY(180deg)' : '',
			'& .circle': {
				background: '#008a7c',
				borderRadius: '50%',
				color: '#fff',
				position: 'relative',
				width: '38px',
				height: '38px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				'& i': {
					fontSize: '24px',
					marginLeft: '1px',
				},
			},
		},
	},
	fileUpload: {
		marginTop: '12px',
	},
	customFileUpload: {
		border: '1px solid #ccc',
		display: 'inline-flex',
		flexDirection: 'row-reverse',
		textAlign: 'center',
		padding: '14px 15px 12px 7px',
		cursor: 'pointer',
		borderRadius: '5px',
		borderBottom: '1px solid green',
		height: '100%',
		"& [type='file']": { display: 'none' },
	},
	formFieldInput: {
		appearance: 'none',
		background: 'transparent',
		border: '0',
		color: '#333',
		display: 'block',
		fontSize: '1.2rem',
		marginTop: '24px',
		outline: '0',
		padding: '6px 0px 7px 0px',
		width: '100%',
	},
	whatsappTipsWrapper: {
		border: '1px solid #ced4da',
		borderRadius: '4px',
		padding: '8px',
		fontFamily: 'OpenSansHebrew',
		fontSize: '14px',
		color: '#c9302c',
		height: 'calc(100% - 18px)',
		'& .title': {
			fontFamily: 'OpenSansHebrew-Bold',
		},
		'& p': {
			margin: '12px 0px',
			lineHeight: '15px',
			display: 'list-item',
			marginLeft: isRTL ? '0px' : '17px',
			marginRight: isRTL ? '17px' : '0px',
		},
	},

	alertModal: {
		border: '2px solid #0371ad',
		margin: '18px',
		borderRadius: '4px',
		padding: '14px 26px',
		direction: isRTL ? 'rtl' : 'ltr',
		position: 'relative',
	},
	alertModalClose: {
		position: 'absolute',
		top: '-11px',
		right: isRTL ? 'auto' : '-11px',
		left: isRTL ? '-11px' : 'auto',
		backgroundColor: '#0371ad',
		color: 'white',
		cursor: 'pointer',
		borderRadius: '42px',
		paddingTop: '0px',
		height: '20px',
		width: '20px',
		textAlign: 'center',
	},
	alertModalInfoWrapper: {
		position: 'absolute',
		top: isRTL ? '24px' : '-65px',
		right: isRTL ? '24px' : 'auto',
		left: isRTL ? 'auto' : '-65px',
		backgroundColor: '#0371ad',
		color: 'white',
		cursor: 'pointer',
		borderRadius: '42px',
		paddingTop: '0px',
		height: isRTL ? 'auto' : '90px',
		width: isRTL ? 'auto' : '90px',
		textAlign: 'center',
	},
	alertModalInfo: {
		position: 'absolute',
		bottom: '15px',
		right: isRTL ? 'auto' : '15px',
		left: isRTL ? '15px' : 'auto',
		backgroundColor: '#0371ad',
		color: 'white',
		cursor: 'pointer',
		borderRadius: '42px',
		paddingTop: '0px',
		height: '20px',
		width: '20px',
		textAlign: 'center',
	},
	alertModalActionWrapper: {
		overflow: 'auto',
	},
	alertModalTitle: {
		fontFamily: 'OpenSansHebrew-Bold',
		padding: '4px',
		color: '#0371ad',
		fontSize: '24px',
		borderBottom: '1px solid #dfdfdf',
		textAlign: isRTL ? 'right' : 'left',
	},
	alertModalContent: {
		padding: '8px 4px 0px 4px',
		color: '#525252',
		fontFamily: 'OpenSansHebrew',
		fontSize: '12px',
		minWidth: '332px',
	},
	testGroupModalContent: {
		padding: '8px 4px 0px 4px',
		color: '#525252',
		fontFamily: 'OpenSansHebrew',
		fontSize: '12px',
		width: '100%',
		height: '100%',
	},

	templateListWrapper: {},
	templateListModal: {
		border: '2px solid #0371ad',
		margin: '18px',
		borderRadius: '4px',
		padding: '14px 26px',
		direction: isRTL ? 'rtl' : 'ltr',
		position: 'relative',
	},
	templateListModalContent: {
		padding: '8px 4px 0px 4px',
		color: '#525252',
		fontFamily: 'OpenSansHebrew',
		fontSize: '12px',
	},

	filterModal: {
		border: '2px solid #0371ad',
		margin: '18px',
		borderRadius: '4px',
		padding: '14px 26px',
		direction: isRTL ? 'rtl' : 'ltr',
		position: 'relative',
	},
	filterModalClose: {
		position: 'absolute',
		top: '-11px',
		right: isRTL ? 'auto' : '-11px',
		left: isRTL ? '-11px' : 'auto',
		backgroundColor: '#0371ad',
		color: 'white',
		cursor: 'pointer',
		borderRadius: '42px',
		paddingTop: '0px',
		height: '20px',
		width: '20px',
		textAlign: 'center',
	},
	filterModalInfoWrapper: {
		position: 'absolute',
		top: isRTL ? '24px' : '-65px',
		right: isRTL ? '24px' : 'auto',
		left: isRTL ? 'auto' : '-65px',
		backgroundColor: '#0371ad',
		color: 'white',
		cursor: 'pointer',
		borderRadius: '42px',
		paddingTop: '0px',
		height: isRTL ? 'auto' : '90px',
		width: isRTL ? 'auto' : '90px',
		textAlign: 'center',
	},
	filterModalInfo: {
		position: 'absolute',
		bottom: '15px',
		right: isRTL ? 'auto' : '15px',
		left: isRTL ? '15px' : 'auto',
		backgroundColor: '#0371ad',
		color: 'white',
		cursor: 'pointer',
		borderRadius: '42px',
		paddingTop: '0px',
		height: '20px',
		width: '20px',
		textAlign: 'center',
	},
	filterModalActionWrapper: {
		overflow: 'auto',
	},
	filterModalTitle: {
		fontFamily: 'OpenSansHebrew-Bold',
		padding: '4px',
		color: '#0371ad',
		fontSize: '24px',
		borderBottom: '1px solid #dfdfdf',
		textAlign: isRTL ? 'right' : 'left',
	},
	filterModalContent: {
		padding: '8px 4px 0px 4px',
		color: '#525252',
		fontFamily: 'OpenSansHebrew',
		fontSize: '12px',
	},

	columnAdjustmentModal: {
		border: '2px solid #0371ad',
		margin: '18px',
		borderRadius: '4px',
		padding: '14px 26px',
		direction: isRTL ? 'rtl' : 'ltr',
		position: 'relative',
	},
	columnAdjustmentModalClose: {
		position: 'absolute',
		top: '-11px',
		right: isRTL ? 'auto' : '-11px',
		left: isRTL ? '-11px' : 'auto',
		backgroundColor: '#0371ad',
		color: 'white',
		cursor: 'pointer',
		borderRadius: '42px',
		paddingTop: '0px',
		height: '20px',
		width: '20px',
		textAlign: 'center',
	},
	columnAdjustmentModalInfoWrapper: {
		position: 'absolute',
		top: isRTL ? '24px' : '-65px',
		right: isRTL ? '24px' : 'auto',
		left: isRTL ? 'auto' : '-65px',
		backgroundColor: '#0371ad',
		color: 'white',
		cursor: 'pointer',
		borderRadius: '42px',
		paddingTop: '0px',
		height: isRTL ? 'auto' : '90px',
		width: isRTL ? 'auto' : '90px',
		textAlign: 'center',
	},
	columnAdjustmentModalInfo: {
		position: 'absolute',
		bottom: '15px',
		right: isRTL ? 'auto' : '15px',
		left: isRTL ? '15px' : 'auto',
		backgroundColor: '#0371ad',
		color: 'white',
		cursor: 'pointer',
		borderRadius: '42px',
		paddingTop: '0px',
		height: '20px',
		width: '20px',
		textAlign: 'center',
	},
	columnAdjustmentModalActionWrapper: {
		overflow: 'auto',
	},
	columnAdjustmentModalTitle: {
		fontFamily: 'OpenSansHebrew-Bold',
		padding: '4px',
		color: '#0371ad',
		fontSize: '24px',
		borderBottom: '1px solid #dfdfdf',
		textAlign: isRTL ? 'right' : 'left',
	},
	columnAdjustmentModalContent: {
		padding: '8px 4px 0px 4px',
		color: '#525252',
		fontFamily: 'OpenSansHebrew',
		fontSize: '12px',
	},

	testGroupModalContentWrapper: {
		padding: '0 4px',
	},
	testGroupModalContentSearch: {
		marginBottom: '10px',
	},
	testGroupModalGroupList: {
		minHeight: '253px',
		maxHeight: '253px',
		overflowY: 'auto',
	},
	testGroupModalGroupDiv: {
		width: '90%',
		cursor: 'pointer',
		display: 'flex',
		justifyContent: 'space-between',
		fontSize: '14px',
		fontFamily: 'OpenSansHebrew',
		paddingLeft: isRTL ? '0px' : '18px',
		paddingRight: isRTL ? '18px' : '0px',
	},
	testGroupModalContentSearchField: {
		boxShadow: '5px 5px 5px rgb(0 0 0 / 35%)',
	},
	alertModalContentText: {
		wordBreak: 'break-word',
	},
	alertModalContentChildren: {
		padding: '12px 0px',
	},
	alertModalContentMobile: {
		width: '358px',
		margin: '0 auto',
		'@media screen and (max-width: 500px)': {
			width: '300px',
		},
	},
	alertModalAction: {
		paddingBottom: 15,
		justifyContent: 'center',
		'& button': {
			// width: '120px',
			marginInlineEnd: 15
		},
		'& .ok-button': {
			border: '1px solid #345233',
			maxWidth: '250px',
			borderTop: '0px solid #345233',
			boxShadow: '0px 3px 3px #345233',
			backgroundImage: 'linear-gradient(to bottom, #5cb85c 0%, #449d44 100%)',
			backgroundRepeat: 'repeat-x',
			'&:disabled': {
				backgroundImage: 'none',
				boxShadow: '0px 3px 3px #4d4d4d',
				backgroundColor: 'gray',
				color: 'white',
				cursor: 'not-allowed',
				border: '1px solid #565656',
			},
		},
		'& .cancel-button': {
			border: '1px solid darkred',
			maxWidth: '150px',
			background: '#c9302c',
			borderTop: '0px solid darkred',
			boxShadow: '0px 3px 3px darkred',
			backgroundImage: 'linear-gradient(to bottom, #d9534f 0%, #c9302c 100%)',
		},
		'& .confirm-button': {
			border: '1px solid #345233',
			maxWidth: '250px',
			borderTop: '0px solid #345233',
			boxShadow: '0px 3px 3px #345233',
			backgroundImage: 'linear-gradient(to bottom, #5cb85c 0%, #449d44 100%)',
			backgroundRepeat: 'repeat-x',
		},
	},

	validationAlertModalUl: {
		padding: '0px',
		margin: '15px 15px',
	},
	validationAlertModalLi: {
		padding: '2px 0px 0px 0px',
		// color: '#ff0000',
		listStyle: 'disc !important'
	},
	infoAlertModalLi: {
		padding: '2px 0px 0px 0px',
	},

	/* Send Campaign */

	WhatsappCampainHeaderWrapper: {
		'@media screen and (max-width: 964px)': {
			display: 'inline',
		},
		'& div': {
			flex: isRTL ? 1 : 'unset',
		},
	},

	WhatsappCampainP1Title: {
		fontSize: windowSize === 'xs' ? '25px' : '36px',
		color: '#333333',
		paddingBlock: '0.5rem',
		fontFamily: 'Assistant',
		fontWeight: 'bold',
		marginTop: 20,
		whiteSpace: windowSize === 'xs' ? 'break-spaces' : null,
	},
	WhatsappCampainHeader: {
		width: '100%',
	},
	WhatsappCampainNotice: {
		textAlign: 'center',
		fontFamily: 'Assistant',
		color: '#b11515',
		fontSize: '17px',
		letterSpacing: '0.5px',
		lineHeight: '16px',
		width: '100%',
		flex: isRTL ? '2 !important' : 'unset',
		'@media screen and (max-width: 964px)': {
			paddingRight: '0px',
			paddingTop: '12px',
		},
		'& .note': {
			lineHeight: '30px',
			color: '#b11515',
			fontWeight: 'bolder',
		},
		'& a': {
			color: '#0371ad',
			fontWeight: 'bolder',
			textDecoration: 'underline',
		},
	},
	WhatsappCampainP1: {
		'@media screen and (max-width: 786px)': {
			flexDirection: 'column',
		},
	},
	WhatsappCampainP1Left: {
		padding: '0px 8px 0px 8px',
	},
	WhatsappCampainP1Right: {
		padding: '0px',
	},
	WhatsappCampainButtonContent: {
		fontFamily: 'OpenSansHebrew',
		fontSize: '12px',
		color: '#959595',
		'&.red': {
			color: '#ca332f',
		},
	},
	WhatsappCampainFields: {
		marginBottom: '18px',
	},
	WhatsappCampainTextarea: {
		'@media screen and (max-width: 959px)': {
			width: '100%',
		},
	},
	WhatsappCampainRadioButton: {
		color: '#f74f26',
		'&.Mui-checked': {
			color: '#f74f26',
		},
	},
	WhatsappCampainSwitch: {
		'& span': {
			color: '#ffffff',
			'&.Mui-checked': {
				color: '#ffffff',
			},
		},
		'& .MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track': {
			backgroundColor: '#FF3343',
			opacity: '1',
		},
	},
	whatsappCampaignDynamicFieldTitle: {
		color: '#157eaf',
		fontFamily: 'OpenSansHebrew',
		fontSize: '20px',
		fontWeight: '600',
		padding: '12px 18px',
		textAlign: isRTL ? 'right' : 'left',
	},
	whatsappCampaignDynamicFieldClose: {
		position: 'absolute',
		top: '0',
		right: isRTL ? 'auto' : '0',
		left: isRTL ? '0' : 'auto',
	},
	whatsappCampaignDynamicFieldContent: {
		direction: isRTL ? 'rtl' : 'ltr',
		width: '558px',
		padding: '0 18px 0 18px',
		'@media screen and (max-width: 1200px)': {
			width: '100%',
		},
	},
	whatsappCampaignDynamicFieldContentText: {
		padding: '0px 0px 6px 0px',
	},
	whatsappCampaignDynamicFieldButton: {
		textTransform: 'capitalize',
		fontSize: '14px',
	},
	whatsappCampaignDynamicFieldButtonActive: {
		textTransform: 'capitalize',
		fontSize: '14px',
		backgroundColor: '#ff3343',
		color: '#ffffff',
		'&:hover': {
			textTransform: 'capitalize',
			fontSize: '14px',
			backgroundColor: '#ff3343',
			color: '#ffffff',
		},
	},
	whatsappCampaignDynamicFieldPersonalField: {
		fontSize: '14px',
		width: 'calc(100% - 288px)',
		'@media screen and (max-width: 1200px)': {
			width: '100%',
		},
		'& .MuiSelect-select.MuiSelect-select': {
			padding: '10px 4px',
		},
	},
	whatsappCampaignDynamicFieldTextarea: {
		width: 'calc(100% - 220px)',
		height: '122px',
		fontFamily: 'OpenSansHebrew',
		fontSize: '14px',
		padding: '8px',
		resize: 'none',
		border: '1px solid #c9c9c9',
		borderRadius: '4px',
		'@media screen and (max-width: 1200px)': {
			width: '100%',
		},
	},
	whatsappCampaignDynamicFieldLink: {
		width: '100%',
		'& .keep-track': {
			fontFamily: 'OpenSansHebrew',
			fontSize: '12px',
			fontWeight: '600',
			paddingTop: '11px',
		},
		'& .keep-track-desc': {
			width: '200px',
			color: '#C2C2C2',
			fontFamily: 'OpenSansHebrew',
			fontSize: '12px',
		},
		'& .dynamic-link-switch': {
			'& .MuiSwitch-thumb': {
				color: '#ffffff',
			},
			'& .MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track': {
				backgroundColor: '#FF3343',
				opacity: '1',
			},
		},
		'& .link-input': {
			width: 'calc(100% - 208px)',
			'@media screen and (max-width: 1200px)': {
				width: '100%',
			},
			'& input': {
				fontFamily: 'OpenSansHebrew',
				fontSize: '14px',
				padding: '14px 14px',
			},
		},
	},
	whatsappCampaignDynamicFieldLandingPage: {
		fontSize: '14px',
		width: 'calc(100% - 288px)',
		'@media screen and (max-width: 1200px)': {
			width: '100%',
		},
		'& .MuiSelect-select.MuiSelect-select': {
			padding: '10px 4px',
		},
	},
	whatsappCampaignDynamicFieldNavigationSelect: {
		fontSize: '14px',
		marginBottom: '12px',
		width: 'calc(100% - 288px)',
		'@media screen and (max-width: 1200px)': {
			width: '100%',
		},
		'& .MuiSelect-select.MuiSelect-select': {
			padding: '10px 4px',
		},
	},
	whatsappCampaignDynamicFieldNavigationText: {
		fontSize: '12px',
		width: 'calc(100% - 208px)',
		'@media screen and (max-width: 1200px)': {
			width: '100%',
		},
		'& input': {
			fontFamily: 'OpenSansHebrew',
			fontSize: '13px',
			padding: '9px',
		},
	},
	whatsappCampainHighlightContent: {
		height: '240px',
		border: '1px solid #ced4da',
		borderBottom: '0px',
		borderTopLeftRadius: '0.25rem',
		borderTopRightRadius: '0.25rem',
		padding: '8px',
	},
	whatsappCampainHighlightTextWrapper: {
		wordBreak: 'break-word',
		overflowY: 'auto',
		maxHeight: '124px',
		// direction: isRTL ? 'rtl' : 'ltr',
	},
	whatsappCampainHighlightText: {
		backgroundColor: '#ff3343',
		color: '#ffffff',
		padding: '0px 2px',
		borderRadius: '4px',
		cursor: 'pointer',
		'&.updated': {
			backgroundColor: '#2ca861',
		},
	},
	whatsappCampaignActionButtonsBox: {
		display: 'flex',
		padding: '4px 8px 0px 0px',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	whatsappCampaignActionButtonsWrapper: {
		marginTop: '10px',
		height: '100px',
		maxHeight: '100px',
		overflowY: 'auto',
	},
	testSendNewTag: {
		backgroundColor: '#c9302c',
		color: '#ffffff',
		height: '22px',
		borderRadius: '4px',
		padding: '2px 4px',
	},
	testSendRadio: {
		padding: '8px 12px 0px 12px',
		'& p': {
			fontFamily: 'OpenSansHebrew',
		},
	},
	testOneContactSendButton: {
		fontFamily: 'OpenSansHebrew',
		color: '#009f00',
		border: '1px solid #009f00',
		marginRight: isRTL ? '8px !important' : '0px',
		marginLeft: isRTL ? '0px' : '8px !important',
		'&:hover': {
			border: '1px solid #009f00',
		},
	},
	columnAdjustmentModalTableWrapper: {
		width: '450px',
		overflow: 'auto',
		'& table': {
			maxWidth: '100%',
			borderCollapse: 'collapse',
		},
	},

	campaignSummaryTextWrapper: {
		display: 'grid',
		marginBottom: '20px',
		justifyContent: 'space-between',
	},
	campaignSummaryTextTitle: {
		fontFamily: 'Assistant',
		fontWeight: '600',
		color: '#1771ad',
		fontSize: '20px',
		marginBottom: '7px',
	},
	campaignSummaryTextDesc: {
		fontFamily: 'OpenSansHebrew-Bold',
		fontSize: '1rem',
		fontWeight: 700,
		padding: isRTL ? '0px 0px 0px 24px' : '0px 43px 0px 0px',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		minHeight: '22px',
	},
	campaignSummaryTextDetail: {
		'& a': {
			textDecoration: 'underline',
			marginTop: '6px',
			fontSize: '16px',
			color: 'gray',
			width: '50px',
			cursor: 'pointer',
		},
	},
	summaryModal: {
		direction: isRTL ? 'rtl' : 'ltr',
		position: 'relative',
		width: '786px',
	},
	campaignSummaryImportantText: {
		textAlign: 'center',
		color: '#DC3D1B',
		fontSize: '16px',
		'& span': {
			'& a': {
				color: '#0371ad',
				fontWeight: 'bolder',
				textDecoration: 'underline',
			},
		},
	},

	/* Management and report pages */

	manageWhatsappTemplates: {},
	manageTemplatesHeaderButtons: {
		justifyContent: 'space-between',
		'& button': {
			// 	background: 'blue',
			// 	color: 'white',
			margin: '4px 8px',
			// 	textTransform: 'none',
			// 	fontSize: '16px',
		},
		// '& .green': {
		// 	background: '#27AE60',
		// },
		// '& .blue': {
		// 	background: '#3498DB',
		// },
	},
	manageTemplatesCreate: {
		marginTop: '10px',
	},
	manageCampaignCreateAndRestore: {
		marginTop: '10px',
	},
	manageTemplatesCampaignCount: {
		marginTop: '25px',
		fontSize: '14px',
		marginRight: '10px',
	},
	manageTemplatesTableWrapper: {
		marginTop: '17px',
		padding: '0 8px',
		'@media screen and (max-width: 1024px)': {
			'& table': {
				minWidth: '860px',
				overflowX: 'auto',
			},
		},
	},
	manageTemplatesTableWrapperPadding: {
		padding: '0px 220px',
		'@media screen and (max-width: 1264px)': {
			padding: '0px 160px',
		},
		'@media screen and (max-width: 1170px)': {
			padding: '0 8px',
		},
	},

	whatsappReportHeaderButtons: {
		marginTop: '18px',
		justifyContent: 'space-between',
		'& button': {
			background: 'blue',
			color: 'white',
			margin: '4px 8px',
			textTransform: 'none',
			fontSize: '16px',
		},
		'& .green': {
			background: '#27AE60',
		},
		'& .blue': {
			background: '#3498DB',
		},
	},
	whatsappReportHeaderExportButton: {
		'& img': {
			width: '24px',
			height: '24px',
		},
		'& button': {
			background: '#1d683f',
			'&:hover': {
				background: '#1d683f',
			},
		},
	},
	whatsappReportCampaignCount: {
		marginTop: '25px',
		fontSize: '14px',
		marginRight: '10px',
	},
	whatsappReportTableWrapper: {
		marginTop: '17px',
		padding: '0 8px',
		'& table': {
			minWidth: '918px',
			'& tr': {
				'& th': {
					fontWeight: 'bolder',
					'& div': {
						fontWeight: '700',
					},
					'&:nth-child(3)': {
						color: '#26BE35',
					},
				},
				'& td': {
					'&:nth-child(1)': {
						'& p': {
							textDecoration: 'none',
						},
					},
					'&:nth-child(3)': {
						'& p': {
							color: '#26BE35',
							'&.value-cell': {
								textDecoration: 'underline',
								textDecorationColor: '#26BE35',
							},
						},
					},
					'&:nth-child(4)': {
						'& p': {
							color: '#3498DB',
							'&.value-cell': {
								textDecoration: 'underline',
								textDecorationColor: '#3498DB',
							},
						},
					},
					'&:nth-child(5)': {
						'& p': {
							color: '#E74C3C',
							'&.value-cell': {
								textDecoration: 'underline',
								textDecorationColor: '#E74C3C',
							},
						},
					},
					'&:nth-child(6)': {
						'& p': {
							// color: '#3498DB',
						},
					},
					'&:nth-child(7)': {
						'& p': {
							color: '#333',
							'&.value-cell': {
								textDecoration: 'underline',
								textDecorationColor: '#333',
							},
						},
					},
					'&.underline': {
						textDecoration: 'underline',
						cursor: 'pointer',
					},
					'& .underline': {
						textDecoration: 'underline',
						cursor: 'pointer',
					},
					'& p': {
						fontFamily: 'Assistant',
						fontSize: '18px',
						fontWeight: '400',
						lineHeight: '1.5',
					},
				},
			},
		},
	},
	whatsappCampaignDynamicFieldLinkRemoval: {
		textTransform: 'capitalize',
		fontSize: '14px',
		backgroundColor: '#ff3343',
		color: '#ffffff',
		marginTop: '6px',
		marginLeft: isRTL ? '0px' : '10px',
		marginRight: isRTL ? '10px' : '0px',
		padding: '3px 9px',
		borderRadius: '20px',
		'&:hover': {
			textTransform: 'capitalize',
			fontSize: '14px',
			backgroundColor: '#ff3343',
			color: '#ffffff',
		},
	},
	restoreDeletedModalFormGroup: {
		maxHeight: '216px',
		overflowX: 'auto',
		display: 'grid',
	},
	restoreDeletedModalFormLabel: {
		margin: '0px',
		'& span': {
			padding: '2px',
			'& svg': {
				color: '#0371ad',
			},
		},
	},
	groupListRow: {
		'&:hover': {
			backgroundColor: '#f1f1f1',
		},
	},
	whatsappDatePicker: {
		border: '1px solid #0000003b',
		borderRadius: '4px',
		padding: '3px 0px 2px 10px',
		background: 'url(../../../../assets/images/managment/calendar.svg)',
	},
	whatsappManagementbuttonField: {
		borderRadius: '5px',
		border: '1px solid #bbb',
		outline: 'none',
		padding: '3px 11px 3px 10px',
		fontSize: '16px',
		height: '32px',
		width: '100%',
		'&::placeholder': {
			fontSize: '16px',
		},
		'& label': {
			marginTop: '0px',
		},
		'& label + .MuiInput-formControl': {
			marginTop: '0px',
		},
		'& .MuiInputLabel-formControl': {
			transform: 'none',
			top: '10px',
			left: isRTL ? '0px' : '12px',
			right: isRTL ? '12px' : '0px',
		},
		'& .MuiSelect-select:focus': {
			backgroundColor: 'transparent',
		},
	},
	whatsappManagementbuttonFieldFlexWrapper: {
		display: 'flex',
	},

	/* WhatsApp Chat */

	whatsappChat: {
		// '@import url(./App.darktheme.css)': true,
		//App
		'&.app': {
			marginTop: 20,
			width: '100%',
			background: '#dddbd1',
			position: 'relative',
			'&::before': {
				width: '100%',
				height: '120px',
				top: '0',
				left: '0',
				background: 'rgb(0, 150, 136)',
				position: 'absolute',
				content: "''",
				zIndex: 1,
			},
		},
		'&.app__mobile-message': { display: 'none' },
		'&.app-content': {
			width: '100%',
			height: 'calc(100vh - 100px)',
			margin: '0 auto',
			boxShadow:
				'0 1px 1px 0 rgba(0, 0, 0, 0.06), 0 2px 5px 0 rgba(0, 0, 0, 0.2)',
			position: 'relative',
			zIndex: 100,
			display: 'flex',
			overflow: 'hidden',
		},
		'@media screen and (min-width: 1450px)': {
			'&.app': {},
			'&.app-content': {},
		},

		// Common
		'&.underline': {
			textDecoration: 'underline',
		},

		'&.cursor-pointer': {
			cursor: 'pointer',
		},

		'&.pos-rel': {
			position: 'relative',
		},

		'&.sb': {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
		},

		'&.flex-1': {
			flex: '1',
		},

		'&.js-focus-visible :focus:not(.focus-visible)': {
			outline: 'none',
		},

		'&.focus-visible': {
			outlineColor: 'rgba(129, 202, 231, 0.3)',
		},

		'&.header': {
			background: 'rgb(237, 237, 237)',
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			height: '60px',
			// padding: '0px 10px',
			/* Fix for height bug with chat sidebar */
			minHeight: '60px',
			'&.left': {
				// '@media screen and (max-width: 759px)': {
				// 	display: 'none',
				// },
			},
		},

		'&.avatar': {
			borderRadius: '50%',
			height: '100%',
			width: '100%',
			objectFit: 'cover',
		},

		'&.emoji': {
			/* background: url(../../assets/images/emoji-sprite.png) transparent, */
			width: '40px',
			height: '40px',
			backgroundSize: '400px',
			backgroundRepeat: 'no-repeat',
			// width: '50px',
			// height: '50px',
			// backgroundSize: '500px',
		},

		/* Begin search input  */

		'&.search-wrapper': {
			fontFamily: 'OpenSansHebrew',
			padding: '7px 10px',
			height: '34px',
			background: '#f6f6f6',
			position: 'relative',
			display: 'flex',
			'&:focus-within': {
				background: 'white',
			},
			// '@media screen and (max-width: 759px)': {
			// 	display: 'none',
			// },
		},

		// '&.search-wrapper:focus-within': {
		// 	background: 'white',
		// },

		'&.search': {
			fontFamily: 'OpenSansHebrew',
			fontWeight: '400',
			background: 'white',
			color: 'rgb(74, 74, 74)',
			paddingLeft: isRTL ? 'unset' : '60px',
			paddingRight: isRTL ? '60px' : 'unset',
			borderRadius: '18px',
			width: '100%',
			height: '100%',
			'&::placeholder': {
				color: 'rgb(153, 153, 153)',
			},
		},

		// '&.search::placeholder': {
		// 	color: 'rgb(153, 153, 153)',
		// },

		'&.search-icons': {
			color: '#919191',
			position: 'absolute',
			left: isRTL ? 'unset' : '20px',
			right: isRTL ? '20px' : 'unset',
			top: '50%',
			transform: 'translateY(-50%)',
			width: '24px',
			height: '24px',
			overflow: 'hidden',
		},

		'&.search-icon,\n&.search__back-btn': {
			position: 'absolute',
			width: '100%',
			height: '100%',
			transition: 'all 0.8s ease',
		},

		'&.search-icon': {
			opacity: 1,
			transitionDelay: '0.3s',
		},

		'&.search__back-btn': {
			opacity: 0,
			transitionDelay: '0.3s',
			color: 'rgb(51, 183, 246)',
		},

		'&.search-wrapper:focus-within &.search-icon': {
			opacity: '0',
			transitionDelay: '0s',
		},

		'&.search-wrapper:focus-within &.search__back-btn': {
			transform: 'rotate(360deg)',
			opacity: '1',
			transitionDelay: '0s',
		},

		/* End search input  */

		// '@import url(./darktheme.css)': true,

		//MainChat
		'&.chat': { display: 'flex', position: 'relative' },
		'&.chat__body': {
			minWidth: '300px',
			flex: '40%',
			borderRight: '1px solid #dadada',
			display: 'flex',
			flexDirection: 'column',
			position: 'relative',
			zIndex: '1',
		},
		'&.chat__bg': {
			top: '0',
			right: '0',
			left: '0',
			bottom: '0',
			opacity: '0.05',
			zIndex: '1',
			background: '#e4dcd4',
		},
		'&.chat__header,\n&.chat__footer,\n&.chat__date-wrapper,\n&.chat__msg-group,\n.&chat__encryption-msg':
		{
			zIndex: '10',
		},
		'&.chat__header': {
			zIndex: '20',
			paddingInline: 15
		},
		'&.chat__avatar-wrapper': {
			width: '50px',
			height: '40px',
			marginRight: isRTL ? 'unset' : '10px',
			marginLeft: isRTL ? '10px' : 'unset',
			cursor: 'pointer',
		},
		'&.chat__contact-wrapper': {
			flex: '1',
			cursor: 'pointer',
			display: 'flex',
			alignItems: 'center',
		},
		'&.chat__contact-name,\n&.chat__contact-desc': {
			fontFamily: 'Assistant',
			fontWeight: '400',
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
		},
		'&.chat__contact-name': {
			fontFamily: 'OpenSansHebrew',
			fontWeight: '500',
			color: '#000000',
			fontSize: '1rem',
			margin: '0px',
		},
		'&.chat__contact-desc': { color: '#00000099', fontSize: '0.75rem' },
		'&.chat__actions': {
			// marginRight: '20px',
			display: 'flex',
			alignItems: 'center',
			height: '100%'
		},
		'&.chat__action': { cursor: 'pointer' },
		'&.chat__action:not(.options-btn)': { display: 'inline-block' },
		'&.chat__action-icon': { color: 'rgb(145, 145, 145)', paddingRight: 10 },
		'&.chat__action-icon--search': { width: '30px', height: '30px' },
		'&.chat__content': {
			flex: 1,
			position: 'relative',
			background: '#e4dcd4',
			overflowY: 'scroll',
			overflowX: 'hidden',
			padding: '20px 5% 2pc',
		},
		'&.chat__date-wrapper': {
			textAlign: 'center',
			margin: '10px 0 14px',
			position: 'relative',
		},
		'&.chat__date': {
			background: '#e1f2fa',
			display: 'inline-block',
			color: '#000000',
			fontSize: '0.75rem',
			padding: '7px 10px',
			borderRadius: '5px',
		},
		'&.chat__encryption-msg': {
			background: '#fdf4c5',
			color: '#000000',
			fontSize: '0.77rem',
			textAlign: 'center',
			padding: '5px 10px',
			position: 'relative',
			marginBottom: '8px',
			borderRadius: '5px',
			lineHeight: '20px',
		},
		'&.chat__encryption-icon': {
			color: '#8c866c',
			marginRight: isRTL ? '0px' : '5px',
			marginLeft: isRTL ? '5px' : '0px',
			marginBottom: '-1px',
		},
		'&.chat__msg-group': {
			display: 'flex',
			flexDirection: 'column',
			marginBottom: '12px',
			position: 'relative',
		},
		'&.chat__msg': {
			padding: '6px 7px 8px 9px',
			margin: '0px 0px 12px 0px',
			fontSize: '0.85rem',
			color: '#000000',
			width: 'fit-content',
			maxWidth: '95%',
			minHeight: '22px',
			lineHeight: '20px',
			borderRadius: '5px',
			position: 'relative',
			whiteSpace: 'pre-line',
			// display: 'flex',
			wordBreak: 'break-word',
			'& .rhap_container': {
				boxShadow: 'none',
				padding: '0px',
				'& .rhap_progress-section': {
					'& .rhap_progress-container': {
						width: '160px',
					},
					'& .rhap_progress-indicator': {
						background: '#0371ad',
					},
					'& .rhap_progress-filled': {
						backgroundColor: '#0371ad',
					},
					'& .rhap_download-progress': {
						backgroundColor: '#c5d7e1',
					},
				},
				'& .rhap_controls-section': {
					'& .rhap_additional-controls': {
						display: 'none',
					},
					'& .rhap_volume-controls': {
						display: 'none',
					},
					'& .rhap_play-pause-button': {
						color: '#0371ad',
					},
				},
			},
		},
		'&.chat__msg.chat__img-wrapper': { padding: '4px', width: '95%' },
		'&.chat__msg--sent': {
			background: '#dbf8c6',
			alignSelf: 'flex-end',
		},
		'&.chat__msg--rxd': {
			background: 'white',
			alignSelf: 'flex-start',
		},

		'&.chat__msg-group > *:nth-child(1):not(.chat__msg--sent)::before,\n&.chat__msg--sent + .chat__msg--rxd::before':
		{
			content: "''",
			position: 'absolute',
			width: '0',
			height: '0',
			top: '0',
			left: '-8px',
			borderTop: isRTL ? '0px' : '6px solid white',
			borderRight: isRTL ? '0px' : '6px solid white',
			borderBottom: isRTL ? '0px' : '6px solid transparent',
			borderLeft: isRTL ? '0px' : '6px solid transparent',
		},
		'&.chat__msg-group > *:nth-child(1):not(.chat__msg--rxd)::before,\n&.chat__msg--rxd + .chat__msg--sent::before':
		{
			right: '-8px',
			content: "''",
			position: 'absolute',
			width: '0',
			height: '0',
			top: '0',
			borderTop: isRTL ? '0px' : '6px solid #dbf8c6',
			borderRight: isRTL ? '0px' : '6px solid transparent',
			borderBottom: isRTL ? '0px' : '6px solid transparent',
			borderLeft: isRTL ? '0px' : '6px solid #dbf8c6',
		},

		'&.chat__msg-group > *:nth-child(1):not(.chat__msg--sent)::after,\n&.chat__msg--sent + .chat__msg--rxd::after':
		{
			content: "''",
			position: 'absolute',
			width: '0',
			height: '0',
			top: '0',
			right: '-6px',
			borderTop: isRTL ? '6px solid white' : '0px',
			borderRight: isRTL ? '6px solid transparent' : '0px',
			borderBottom: isRTL ? '6px solid transparent' : '0px',
			borderLeft: isRTL ? '6px solid transparent' : '0px',
		},
		'&.chat__msg-group > *:nth-child(1):not(.chat__msg--rxd)::after,\n&.chat__msg--rxd + .chat__msg--sent::after':
		{
			left: '-6px',
			content: "''",
			position: 'absolute',
			width: '0',
			height: '0',
			top: '0',
			borderTop: isRTL ? '6px solid #dbf8c6' : '0px',
			borderRight: isRTL ? '6px solid transparent' : '0px',
			borderBottom: isRTL ? '6px solid transparent' : '0px',
			borderLeft: isRTL ? '6px solid transparent' : '0px',
		},

		'&.chat__img': { width: '100%', height: '100%', objectFit: 'cover' },
		'&.chat__msg-filler': {
			width: '65px',
			display: 'inline-block',
			height: '3px',
			background: 'transparent',
		},
		'&.chat__msg-footer': {
			position: 'absolute',
			display: 'flex',
			alignItems: 'center',
			right: isRTL ? 'unset' : '7px',
			left: isRTL ? '7px' : 'unset',
			bottom: '3px',
			color: 'rgba(0, 0, 0, 0.45)',
			fontSize: '0.7rem',
			fontWeight: '500',
		},
		'&.chat__msg-status-icon': {
			color: '#b3b3b3',
			marginLeft: isRTL ? '0px' : '3px',
			marginRight: isRTL ? '3px' : '0px',
		},
		'&.chat__msg-status-icon--blue': { color: '#0da9e5' },
		'&.chat__img-wrapper .chat__msg-footer,\n&.chat__img-wrapper .chat__msg-options-icon,\n&.chat__img-wrapper .chat__msg-status-icon':
		{
			color: 'white',
		},
		'&.chat__msg-options': {
			opacity: '0',
			position: 'absolute',
			right: isRTL ? 'unset' : '5px',
			left: isRTL ? '5px' : 'unset',
			top: '3px',
			pointerEvents: 'none',
			transition: 'all 0.2s',
		},
		'&.chat__msg--rxd .chat__msg-options': { background: 'white' },
		'&.chat__msg--sent .chat__msg-options': { background: '#dbf8c6' },
		'&.chat__img-wrapper .chat__msg-options': { background: 'transparent' },
		'&.chat__msg:hover .chat__msg-options': {
			opacity: '1',
			pointerEvents: 'unset',
			background: 'transparent',
		},
		'&.chat__msg-options-icon': {
			color: 'rgb(145, 145, 145)',
			width: '20px',
			height: '20px',
		},
		'&.chat__footer': {
			background: 'rgb(240, 240, 240)',
			position: 'relative',
		},
		'&.chat__scroll-btn': {
			position: 'absolute',
			right: '15px',
			bottom: '80px',
			width: '42px',
			height: '42px',
			zIndex: '-1',
			borderRadius: '50%',
			color: 'rgb(145, 145, 145)',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			background: '#ffffff',
			boxShadow:
				'0 1px 1px 0 rgba(0, 0, 0, 0.06), 0 2px 5px 0 rgba(0, 0, 0, 0.2)',
		},
		'&.emojis__wrapper': {
			width: '100%',
			overflow: 'hidden',
			display: 'flex',
			flexDirection: 'column',
			height: '0',
			minHeight: '0',
			transition: 'all 0.4s ease',
			background: 'inherit',
		},
		'&.emojis__wrapper--active': {
			height: '40vh',
			minHeight: '350px',
			transition: 'all 0.4s ease',
		},
		'&.emojis__tabs': { display: 'flex', alignItems: 'center', height: '50px' },
		'&.emojis__tab': {
			flex: '1',
			padding: '10px 5px 10px',
			textAlign: 'center',
			position: 'relative',
		},
		'&.emojis__tab--active::after': {
			content: "''",
			position: 'absolute',
			height: '4px',
			width: '100%',
			bottom: '0',
			left: '0',
			background: 'rgb(0, 150, 136)',
		},
		'&.emojis__tab-icon': { color: 'rgba(0, 0, 0, 0.32)' },
		'&.emojis__tab--active .emojis__tab-icon': { color: 'rgba(0, 0, 0, 0.6)' },
		'&.emojis__content': { overflowY: 'scroll', padding: '5px 20px', flex: 1 },
		'&.emojis__search': {
			height: '40px',
			background: '#e6e6e6',
			width: '100%',
			borderRadius: '5px',
			padding: '5px 10px',
			color: 'rgb(74, 74, 74)',
			fontSize: '0.9rem',
		},
		'&.emojis__search::placeholder': { color: '#989898' },
		'&.emojis__label': {
			marginTop: '15px',
			marginBottom: '5px',
			fontWeight: '500',
			color: 'rgba(0, 0, 0, 0.45)',
			fontSize: '0.85rem',
		},
		'&.emojis__grid': {
			display: 'flex',
			flexWrap: 'wrap',
			marginBottom: '25px',
		},
		'&.emojis__emoji': {
			marginRight: '3px',
			marginTop: '3px',
			cursor: 'pointer',
		},
		'&.chat__input-wrapper': {
			padding: '4px',
			minHeight: '60px',
			position: 'relative',
			display: 'flex',
			alignItems: 'center',
			'& button': {
				padding: '0px',
			},
		},
		'&.chat__input-icon': {
			color: '#919191',
			marginLeft: '8px',
			marginRight: '8px',
			width: '28px',
			height: '28px',
			padding: '3px',
			borderRadius: '50%',
		},
		'&.chat__send-icon': {
			color: '#919191',
			marginLeft: '8px',
			marginRight: '8px',
			width: '28px',
			height: '28px',
			padding: '3px',
			borderRadius: '50%',
			transform: isRTL ? 'rotate(180deg)' : 'rotate(0deg)',
		},
		'&.chat__delete-icon': {
			color: '#f35f5f',
			marginLeft: '8px',
			marginRight: '8px',
			width: '28px',
			height: '28px',
			padding: '3px',
			borderRadius: '50%',
		},
		'&.chat__input-icon--highlight': { color: 'teal' },
		'&.chat__attach': {
			display: 'flex',
			flexDirection: 'column',
			position: 'absolute',
			bottom: '50px',
		},
		'&.chat__attach-btn': {
			transform: 'scale(0)',
			opacity: '0',
			transition: 'all 0.5s ease',
			marginBottom: '10px',
		},
		'&.chat__attach-btn:nth-of-type(1)': { transitionDelay: '0.5s' },
		'&.chat__attach-btn:nth-of-type(2)': { transitionDelay: '0.4s' },
		'&.chat__attach-btn:nth-of-type(3)': { transitionDelay: '0.3s' },
		'&.chat__attach-btn:nth-of-type(4)': { transitionDelay: '0.2s' },
		'&.chat__attach-btn:nth-of-type(5)': { transitionDelay: '0.1s' },
		'&.chat__attach--active .chat__attach-btn': {
			transform: 'scale(1)',
			opacity: '1',
		},
		'&.chat__input-icon--pressed': { background: 'rgba(0, 0, 0, 0.1)' },
		'&.chat__input': {
			background: 'white',
			color: 'rgb(74, 74, 74)',
			padding: '11px 10px',
			borderRadius: '22px',
			flex: '1',
			fontFamily: 'Assistant',
			lineHeight: '13px',
			fontWeight: '600',
			height: '17px',
			fontSize: '14px',
			resize: 'none',
			maxHeight: '172px',
			overflowY: 'auto',
			outline: 'none',
			wordBreak: 'break-word',
			border: '1px solid #e0e0e0',
		},
		'&.chat__input::placeholder': {
			color: 'rgb(153, 153, 153)',
			fontSize: '0.9rem',
		},
		'&.chat-sidebar': {
			width: '0',
			minWidth: '0',
			display: 'flex',
			flexDirection: 'column',
			transition: 'all 0.1s ease',
			overflowX: 'hidden',
			overflowY: 'auto',
		},
		'&.chat-sidebar--active': { flex: '30%' },
		'&.chat-sidebar__header-icon': {
			marginRight: '20px',
			color: 'rgb(145, 145, 145)',
		},
		'&.chat-sidebar__heading': {
			flex: '1',
			color: '#000000',
			fontSize: '1rem',
			marginBottom: '2px',
		},
		'&.chat-sidebar__content': { flex: '1', fontFamily: 'OpenSansHebrew' },
		'&.chat-sidebar__search-results': {
			background: 'white',
			height: '100%',
			paddingTop: '5pc',
			color: '#00000099',
			textAlign: 'center',
			fontSize: '0.85rem',
		},
		'&.profile': { background: 'rgb(237, 237, 237)', paddingBottom: '2pc' },
		'&.profile__section': {
			background: 'white',
			marginBottom: '10px',
			boxShadow: 'rgba(0, 0, 0, 0.08) 0px 1px 3px 0px',
			padding: '10px 20px',
		},
		'&.profile__section--personal': {
			display: 'flex',
			justifyContent: 'center',
			flexDirection: 'column',
			alignItems: 'center',
			padding: '30px 20px',
		},
		'&.profile__avatar-wrapper': {
			width: ['200px', '200px'],
			marginBottom: '20px',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		},
		'&.profile__name': {
			flex: 1,
			color: '#000000',
			fontSize: '1.2rem',
			alignSelf: 'flex-start',
		},
		'&.profile__heading-wrapper': { marginTop: '5px', marginBottom: '10px' },
		'&.profile__heading': {
			color: 'rgb(0, 150, 136)',
			fontSize: '0.85rem',
			flex: '1',
		},
		'&.profile__heading-icon': { color: 'rgb(145, 145, 145)' },
		'&.profile__media-wrapper': {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		'&.profile__media': { width: '32%' },
		'&.profile__action,\n&.profile__about-item': {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			padding: '15px 0',
			marginBottom: '5px',
			cursor: 'pointer',
		},
		'&.profile__action:not(:last-of-type),\n&.profile__about-item:not(:last-of-type),\n&.profile__group:not(:last-of-type)':
		{
			borderBottom: '1px solid #ebebeb',
		},
		'&.profile__action-left': { flex: '1' },
		'&.profile__action-text': { display: 'block' },
		'&.profile__action-text--top,\n.profile__about-item': {
			fontWeight: '500',
			marginBottom: '5px',
		},
		'&.profile__action-text--bottom': {
			fontSize: '0.85rem',
			color: 'rgba(0, 0, 0, 0.45)',
		},
		'&.profile__section--groups': { paddingLeft: '0', paddingRight: '0' },
		'&.profile__group,\n&.profile__group-heading': {
			paddingLeft: '20px',
			paddingRight: '20px',
		},
		'&.profile__group': {
			display: 'flex',
			alignItems: 'center',
			paddingTop: '10px',
			paddingBottom: '10px',
			cursor: 'pointer',
		},
		'&.profile__group:hover': { backgroundColor: '#ebebeb' },
		'&.profile__group-content': { flex: '1', overflow: 'hidden' },
		'&.profile__group-avatar-wrapper': {
			width: '50px',
			height: '50px',
			marginRight: '10px',
		},
		'&.profile__group-text': {
			flex: '1',
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
		},
		'&.profile__group-text--top': {
			color: '#000000',
			fontSize: '1rem',
			fontWeight: '500',
			marginBottom: '5px',
		},
		'&.profile__group-text--bottom': {
			color: '#00000099',
			fontSize: '0.85rem',
			overflow: 'hidden',
		},
		'&.profile__section--danger': {
			color: 'rgb(223, 51, 51)',
			display: 'flex',
			alignItems: 'center',
			paddingTop: '20px',
			paddingBottom: '20px',
		},
		'&.profile__danger-icon': { marginRight: '20px' },
		'&.profile__danger-text': { flex: '1' },
		'@media screen and (min-width: 1301px)': {
			'&.chat__msg': { maxWidth: '65%' },
			'&.sidebar': { flex: '30%' },
			'&.sidebar~div': { flex: '70%' },
		},
		'@media screen and (min-width: 1000px) and (max-width: 1300px)': {
			'&.chat__msg': { maxWidth: '75%' },
			'&.sidebar': { flex: '35%' },
			'&.sidebar~div': { flex: '65%' },
		},
		'@media screen and (min-width: 900px) and (max-width: 1000px)': {
			'&.chat__msg': { maxWidth: '85%' },
		},
		'@media screen and (max-width: 1000px)': {
			'&.chat-sidebar': {
				transition: 'transform 0.1s ease',
				transform: 'translateX(120vw)',
				position: 'absolute',
				left: '0',
				width: '100%',
				height: '100%',
				zIndex: '10',
			},
			'&.chat-sidebar--active': {
				transform: 'translateX(0)',
				transition: 'transform 0.1s ease',
			},
		},
		'@media screen and (min-width: 750px)': {
			'&.chat__msg.chat__img-wrapper': {
				width: '40%',
				minWidth: '300px',
				maxWidth: '400px',
			},
		},

		//WhatsappChat Sidebar

		// '@import url(./darktheme.css)': true,
		'&.sidebar': {
			minWidth: '300px',
			flex: '40%',
			borderRight: '1px solid #DADADA',
			display: 'flex',
			flexDirection: 'column',
			'@media screen and (max-width: 759px)': {
				display: 'none',
				position: 'absolute',
				zIndex: '9999',
				width: '299px',
				height: 'inherit',
				'&.mobile-side-bar': {
					display: 'flex',
				},
			},
		},
		'&.tab-wrapper': {
			background: '#f6f6f6',
			padding: '4px 8px 0px 8px',
			justifyContent: 'center',
		},
		'&.tab-container': {
			backgroundColor: '#fff',
			marginTop: 4,
			borderRadius: 16,
			width: '100%',
		},
		'&.custom-tab': {
			textTransform: 'none',
			minWidth: '25%',
			padding: theme.spacing(.75, 1),
			borderRadius: theme.shape.borderRadius * 2.5,
			fontWeight: 'bold',
			'@media screen and (max-width: 1023px)': {
				minWidth: 56,
			},
			'& h2': {
				color: '#000000',
				lineHeight: '16px',
				margin: '0px 0px 4px 0px',
				fontWeight: 'bold',
			},
			'& h6': {
				color: '#0000008a',
				lineHeight: '14px',
				margin: '0px 0px 2px 0px',
			},
			'&.Mui-selected': {
				background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
				'& h2': {
					color: '#fff',
				},
				'& h6': {
					color: '#e6e6e6',
				},
			},
		},
		'&.sidebar__avatar-wrapper': { width: '40px', height: '40px' },
		'&.sidebar__actions': { marginRight: '20px' },
		'&.sidebar__actions>*': {
			display: 'inline-block',
			marginLeft: '25px',
			cursor: 'pointer',
		},
		'&.sidebar__action-icon': { color: 'rgb(145, 145, 145)' },
		'&.sidebar__alert': {
			minHeight: '85px',
			padding: '20px',
			display: 'flex',
			alignItems: 'center',
		},
		'&.sidebar__alert--warning': { background: '#FED859' },
		'&.sidebar__alert--info': { background: '#9DE1FE' },
		'&.sidebar__alert--danger': { background: '#F3645B' },
		'&.sidebar__alert-icon-wrapper': { marginRight: '10px' },
		'&.sidebar__alert-icon': { color: 'white' },
		'&.sidebar__alert-texts': { flex: '1' },
		'&.sidebar__alert-text:first-of-type': {
			fontSize: '1rem',
			marginBottom: '5px',
			color: '#343738',
		},
		'&.sidebar__alert-text:last-of-type': {
			fontSize: '0.85rem',
			color: '#414A4E',
			lineHeight: '17px',
		},
		'&.sidebar__alert--danger .sidebar__alert-text:first-of-type, .sidebar__alert--danger .sidebar__alert-text:last-of-type':
		{
			color: 'white',
		},
		'&.sidebar__search-wrapper': {
			padding: '7px 10px',
			height: '50px',
			background: '#F6F6F6',
			position: 'relative',
		},
		'&.sidebar__contacts': {
			flex: 1,
			overflowY: 'scroll',
			background: '#F5F5F5',
			borderTop: '1px solid #DADADA',
		},
		'&.sidebar-contact': {
			fontFamily: 'Assistant',
			textDecoration: 'none',
			height: '100px',
			padding: '0px 20px',
			display: 'flex',
			alignItems: 'center',
			borderBottom: '1px solid #EBEBEB',
			cursor: 'pointer',
			'&.active-contact': {
				background: '#e7e7e7',
			},
		},
		'&.sidebar-contact:hover': { backgroundColor: '#EBEBEB' },
		'&.sidebar-contact__avatar-wrapper': {
			width: '50px',
			height: '50px',
			marginRight: isRTL ? 'unset' : '10px',
			marginLeft: isRTL ? '10px' : 'unset',
		},
		'&.sidebar-contact__content': { overflow: 'hidden', flex: '1' },
		'&.sidebar-contact__top-content, .sidebar-contact__bottom-content, .sidebar-contact__message-wrapper':
		{
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		'&.sidebar-contact__name, .sidebar-contact__message': {
			flex: 1,
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			margin: '0px',
		},
		'&.sidebar-contact__top-content': { marginBottom: '0px' },
		'&.sidebar-contact__name': {
			color: '#000000',
			fontSize: '18px',
			fontFamily: 'Assistant',
			fontWeight: '600',
			lineHeight: '21px',
		},
		'&.sidebar-contact__time': {
			fontFamily: 'OpenSansHebrew',
			fontSize: '11px',
			color: 'rgba(0, 0, 0, 0.45)',
		},
		'&.sidebar-contact__message-wrapper': {
			color: '#00000099',
			fontSize: '14px',
			fontWeight: '500',
			fontFamily: 'Assistant',
			margin: '0px 3px 0px 0px',
			overflow: 'hidden',
		},
		'&.sidebar-contact__message-icon': { color: '#B3B3B3', marginRight: '3px' },
		'&.sidebar-contact__message-icon--blue': { color: '#0DA9E5' },
		'&.sidebar-contact__message--unread': {
			color: '#000000',
			fontWeight: '500',
		},
		'&.sidebar-contact__icons, .sidebar-contact:not(:focus) .sidebar-contact__icons':
		{
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			transform: isRTL ? 'translateX(-32px)' : 'translateX(24px)',
			transition: 'transform 0.5s ease',
		},
		'&.sidebar-contact:hover .sidebar-contact__icons': {
			transform: 'translateX(0)',
		},
		'&.sidebar-contact__icons>*': { marginLeft: '8px', color: '#B3B3B3' },
		'&.sidebar-contact__unread': {
			display: 'inline-block',
			color: 'white',
			backgroundColor: 'rgb(6, 215, 85)',
			borderRadius: '18px',
			minWidth: '18px',
			height: '18px',
			padding: '0 3px',
			lineHeight: '18px',
			verticalAlign: 'middle',
			textAlign: 'center',
			fontSize: '0.75rem',
			fontWeight: '500',
		},
	},
	whatsappDateTime: {
		display: 'inline-grid',
		textAlign: isRTL ? 'left' : 'right'
	},
	whatsappChatBarButton: {
		'& svg': { color: '#848484' },
		'@media screen and (min-width: 760px)': {
			display: 'none !important',
		},
	},
	whatsappChatEmojiPickerWrapper: {
		position: 'absolute',
		marginLeft: isRTL ? '0px' : '2px',
		marginRight: isRTL ? '2px' : '0px',
		bottom: '63px',
		'@media screen and (max-width: 446px)': {
			bottom: '68px',
			margin: '0px',
			paddingLeft: isRTL ? '22px' : '0px',
			paddingRight: isRTL ? '0px' : '36px',
		},
	},
	'& .EmojiPickerReact': {
		position: 'absolute',
		bottom: '3px',
	},
	chatTemplateModalTemplateDataWrapper: {
		display: 'flex',
		flexWrap: 'unset',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	chooseTemplateModalUl: {
		overflowY: 'auto',
		padding: '0px',
	},
	noDataRow: {
		height: 50,
	},
	whatsappDropDown: {
		marginRight: 5,
		alignSelf: 'flex-end',
		border: '1px solid #ff3343',
		color: '#ff3343',
		borderRadius: '.2rem',
		padding: '1px 4px',
		'& .MuiSelect-selectMenu': {
			color: '#ff3343 !important',
			'&:focus': {
				// backgroundColor: '#fff'
			},
		},
		'& .MuiSelect-icon': {
			color: '#ff3343 !important',
		},
	},
	whatsappAreaManual: {
		border: '2px dashed rgba(0,0,0,.2)',
		minHeight: '439px',
		backgroundColor: 'white !important',
		'@media screen and (max-width: 768px)': {
			width: 'auto',
		},
	},
	whatsappGreenManual: {
		border: '2px dashed #4BB543',
		minHeight: '439px',
		backgroundColor: '#CCFFE5',
		'@media screen and (max-width: 768px)': {
			width: 'auto',
		},
	},

	whatsappTemplatesStatus: {
		fontSize: 18,
		color: 'black',
		width: '100%',
		'& p': {
			wordBreak: 'break-all',
			whiteSpace: 'normal',
		},
		'& span': {
			fontWeight: 700,
		},
	},
	whatsappTemplateStatusCreated: {
		color: '#0371AD',
		fontWeight: 700,
	},
	whatsappTemplateStatusApproved: {
		color: '#27AE60',
		fontWeight: 700,
	},
	whatsappTemplateStatusReceived: {
		color: '#0371AD',
		fontWeight: 700,
	},
	whatsappTemplateStatusRejected: {
		color: '#E74C3C',
		fontWeight: 700,
	},
	whatsappTemplateStatusPending: {
		color: '#F59A23',
		fontWeight: 700,
	},
	whatsappTemplateStatusRejectedReason: {
		color: '#E74C3C',
		fontWeight: 400,
		fontSize: '14px',
		textDecoration: 'underline',
	},
	WhatsappCampainMobilePreviewBox: {
		maxWidth: '370px',
		margin: '0 auto',
		paddingTop: 40,
	},
	testSendWrapper: {
		fontFamily: 'Assistant',
		fontWeight: '500',
		'& p': {
			fontFamily: 'Assistant',
		},
	},
	whatsappDescSwitch: {
		width: '200px',
		fontSize: '16px',
		marginTop: '-1px',
		color: '#C2C2C2',
		fontWeight: '400',
		'@media screen and (max-width: 768px)': {
			width: '100%',
		},
	},
	whatsappCampaignStatus: {
		fontSize: 18,
		color: 'black',
	},
	whatsappCampaignStatusCreated: {
		color: '#0371AD',
		fontWeight: 700,
	},
	whatsappCampaignStatusFinished: {
		color: '#27AE60',
		fontWeight: 700,
	},
	whatsappCampaignStatusCanceled: {
		color: '#E74C3C',
		fontWeight: 700,
	},
	whatsappCampaignStatusStopped: {
		color: '#E74C3C',
		fontWeight: 700,
	},
	whatsappCampaignStatusSending: {
		color: '#F59A23',
		fontWeight: 700,
	},
	whatsappChatStatusSelect: {
		borderRadius: '22px',
		paddingLeft: '12px',
		textAlign: 'center',
		fontWeight: 'bold',
		minWidth: '77px',
		'& .MuiSelect-select.MuiSelect-select': {
			padding: isRTL ? '2px 0px 2px 0px' : '2px 24px 2px 0px',
		},
		'&.open': {
			backgroundColor: '#F6DDE1',
			color: '#FD4445',
			'& .MuiSelect-icon': {
				color: '#FD4445',
			},
		},
		'&.pending': {
			backgroundColor: '#F6EFE0',
			color: '#FEBF1E',
			'& .MuiSelect-icon': {
				color: '#FEBF1E',
			},
		},
		'&.solved': {
			backgroundColor: '#DCEDE7',
			color: '#3AAD67',
			'& .MuiSelect-icon': {
				color: '#3AAD67',
			},
		},
	},
	whatsappMainChatStatusSelect: {
		borderRadius: '22px',
		backgroundColor: '#c0c0c0',
		paddingLeft: '8px',
		textAlign: 'center',
		fontWeight: 'bold',
		minWidth: '80px',
		color: '#5A5A5A',
		'& .MuiSelect-icon': {
			color: '#5A5A5A',
		},
		'& .MuiSelect-select.MuiSelect-select': {
			padding: isRTL ? '8px 0px 8px 0px' : '8px 24px 8px 0px',
		},
	},
	whatsappSidebarStatusPadding: {
		paddingRight: isRTL ? 'unset' : '10px',
		paddingLeft: isRTL ? '10px' : 'unset',
	},
	whatsappChatUiStatusPadding: {
		paddingLeft: isRTL ? 'unset' : 12,
		paddingRight: isRTL ? 12 : 'unset',
		display: 'flex',
		alignItems: 'center',
		gap: 15
	},
	pdfFileName: {
		wordWrap: 'break-word',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
		overflow: 'hidden',
		'&.inbound': {
			fontFamily: 'OpenSansHebrew',
			padding: '0px 2px',
			paddingRight: '8px',
		},
	},
	summaryModalAccordion: {
		color: '#1771ad',
		fontFamily: 'OpenSansHebrew',
		'& .MuiAccordionSummary-content': {
			'& p': {
				fontWeight: '500',
				fontSize: '18px',
			},
		},
		'& .MuiAccordionSummary-expandIcon': {
			'& img': {
				width: '24px',
			},
		},
	},
	summaryModalAccordionWrapper: {},
	summaryModalAccordionDetails: {
		listStyle: 'circle',
		paddingLeft: '16px',
		'& li': {
			padding: '2px 0px 2px 2px',
		},
	},
	summaryModalAccordionUl: {
		color: '#0371ad',
		fontFamily: 'OpenSansHebrew-Bold',
		fontSize: '16px',
		listStyle: 'disc',
		paddingLeft: '22px',
	},
	summaryModalAccordionLi: {
		padding: '0px 6px 0px 6px',
	},
	summaryModalAccordionUlImage: {
		width: '17px',
	},
	summaryModalAccordionLiContentTitle: {
		padding: '10px 8px 8px 0px',
	},
	summaryModalAccordionLiContent: {
		fontFamily: 'Assistant',
		fontSize: '15px',
		color: '#000000de',
		fontWeight: '600',
		display: 'flex',
		padding: '8px 0px 8px 0px',
		borderTop: '1px solid rgba(0,0,0,0.1)',
	},
	summaryModalContent: {
		maxHeight: '550px',
		padding: '8px 4px 0px 4px',
		color: '#525252',
		fontFamily: 'OpenSansHebrew',
		fontSize: '12px'
	},
	recipientsStatistics: {
		fontSize: '12px',
		padding: '2px 0px 2px 0px',
	},
	summaryModalInvalidRecipients: {
		marginBottom: '12px',
	},
	recipientsStatisticsData: {
		color: '#101010',
	},
	summaryModalAccordionGroupFilter: {
		padding: '14px 0px 14px 0px',
		borderTop: '1px solid rgba(0,0,0,0.1)',
	},
	summaryModalAccordionCampaignFilter: {
		padding: '14px 0px 14px 0px',
		borderTop: '1px solid rgba(0,0,0,0.1)',
	},
	buttonWhatsappAutocomplete: {
		padding: '10px 12px 10px 4px',
		borderBottom: 'solid 1px #ced4da',
		'& .MuiAutocomplete-endAdornment': {
			right: isRTL ? 'unset' : '0px',
			left: isRTL ? '0px' : 'unset',
		},
		'& .MuiInputBase-root.MuiInput-root.MuiInput-underline.MuiAutocomplete-inputRoot.MuiInputBase-fullWidth.MuiInput-fullWidth.MuiInputBase-formControl.MuiInput-formControl.MuiInputBase-adornedEnd':
		{
			paddingRight: isRTL ? '0px !important' : '0px',
		},
	},
	buttonCallToActionAutocomplete: {
		padding: '14px 12px 12px 4px',
	},
	calltoActionButtonChatWrapper: {
		margin: '8px 0px 0px 0px',
	},
	calltoActionButtonChat: {
		margin: '2px 0px 0px',
		borderRadius: '5px',
		padding: '3px 8px',
		width: 'auto',
		color: '#1c82b2',
		backgroundColor: '#b7b7b7',
		fontSize: '15px',
		textDecoration: 'none',
		'&:hover': {
			color: '#1c82b2',
			fontSize: '15px',
		},
	},
	noContactDiv: {
		textAlign: 'center',
		paddingTop: '12px',
		color: '#00000099',
	},
	whatsappImageErrorMsg: {
		color: '#0371ad',
		fontWeight: 'bolder',
		textDecoration: 'underline',
		'&:hover': {
			color: '#0371ad',
			fontWeight: 'bolder',
			textDecoration: 'underline',
		},
	},
	whatsappOppsMsg: {
		color: '#FD4445',
	},
	tableCellNoBorder: {
		border: '0px',
	},
	revenueTableCell: {
		'& p': {
			fontWeight: '900 !important',
		},
	},
	revenueTableCellPointer: {
		'& p': {
			cursor: 'pointer',
			textDecoration: 'underline'
		},
	},
	whatsappChatSendTemplateButton: {
		padding: '10px 10px',
	},
	whatsappNoSetupPage: {
		height: 'calc(100vh - 97px)',
		alignItems: 'center',
		fontFamily: 'OpenSansHebrew',
		justifyContent: 'center',
		textAlign: 'center',
	},
	whatsappNoSetupMessageWrapper: {
		'& div': {
			width: '100%',
			fontSize: '24px',
			fontWeight: '600',
			color: '#ff164f',
			'@media screen and (max-width: 768px)': {
				fontSize: '20px',
			},
			'@media screen and (max-width: 556px)': {
				fontSize: '16px',
			},
		},
	},
	whatsappNoSetupContactWrapper: {
		marginTop: '24px',
		'@media screen and (max-width: 768px)': {
			marginTop: '12px',
		},
		display: 'grid',
		'& a': {
			fontSize: '24px',
			fontWeight: '600',
			color: '#1c82b2',
			textDecoration: 'none',
			cursor: 'pointer',
			width: '100%',
			'@media screen and (max-width: 768px)': {
				fontSize: '20px',
			},
			'@media screen and (max-width: 556px)': {
				fontSize: '20px',
			},
		},
	},
	whatsappNoSetupContactButton: {
		fontFamily: 'OpenSansHebrew',
		backgroundColor: '#ff164f',
		cursor: 'pointer',
		margin: '7px 54px',
		'&:hover': {
			backgroundColor: '#ff164f',
		},
		'& span': {
			fontFamily: 'OpenSansHebrew',
			fontWeight: '600',
			color: '#ffffff',
			textDecoration: 'none',
			cursor: 'pointer',
			width: '100%',
			'@media screen and (max-width: 768px)': {
				fontSize: '20px',
			},
			'@media screen and (max-width: 556px)': {
				fontSize: '20px',
			},
			'& a': {
				fontSize: '18px',
				color: '#ffffff',
				textTransform: 'none',
			},
		},
	},
	whatsappReportErrorCell: {
		wordBreak: 'break-word',
	},
	whatsappSaveBtn: {
		marginInlineStart: '5px',
		color: '#007bff',
		border: '1px solid #007bff',
		// padding: "8px",
		borderRadius: '5px',
		cursor: 'pointer',
		padding: '7px 6px',
	},
	whatsappSaveGroupWrapper: {
		display: 'flex',
		alignItems: 'center',
	},
	// greenTextColor: {
	// 	'& p': {
	// 		color: '#27AE60 !important',
	// 		textDecorationColor: '#25af60 !important',
	// 	},
	// },
	whatsappTextEditorWrapper: {
		width: '62.49%',
		'@media screen and (max-width: 1279px)': {
			width: '50%',
		},
		'@media screen and (max-width: 959px)': {
			width: '100%',
		},
	},
	whatsappPreviewWrapper: {
		width: '37.51%',
		'@media screen and (max-width: 1279px)': {
			width: '50%',
		},
		'@media screen and (max-width: 959px)': {
			width: '100%',
		},
	},
	whatsappFileUploadWrapper: {
		'@media screen and (max-width: 1279px)': {
			width: '100%',
		},
	},
	accountSettingCheckYourTier: {
		fontFamily: 'Assistant',
		fontSize: '16px',
		color: '#0371ad',
	},
	campaignSummaryExceedLimitWrapper: {},
	campaignSummaryExceedLimitText: {
		color: '#DC3D1B',
		fontSize: '16px',
		fontWeight: 'bolder',
	},
	campaignSummaryExceedLimitSendRandomlyText: {
		fontSize: '16px',
		color: '#0371ad',
		fontWeight: 'bolder',
		textDecoration: 'underline',
		marginTop: '20px',
	},
	campaignSummaryExceedLimitSendRandomlyInsert: {
		display: 'flex',
		alignItems: 'center',
		marginTop: '20px',
	},
	campaignSummaryExceedLimitSendRandomlyInsertInput: {
		padding: '0 14px',
		borderRadius: '0px',
		width: '40px',
		color: '#000',
		border: '1px solid #000',
		'& input': {
			textAlign: 'center',
		}
	},
	campaignSummaryExceedLimitSendRandomlyRecipients: {
		paddingLeft: isRTL ? '0px' : '8px',
		paddingRight: isRTL ? '8px' : '0px',
	},
	campaignSummaryExceedLimitTierInfo: {
		display: 'flex',
		alignItems: 'center',
		fontSize: '17px',
		fontFamily: 'Assistant',
		fontWeight: 'bolder',
		marginBottom: '20px',
	},
	tierAlertModalWrapper: {},
	whatsappSpecialDateBefore: {
		display: 'flex',
		width: '72px',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: isRTL ? '4px 0px 0px 4px' : '0px 4px 4px 0px',
		border: '1px solid #277BFF',
		padding: '10px',
		marginBottom: '8px',
		color: '#277BFF',
		cursor: 'pointer',
	},
	whatsappSpecialDateAfter: {
		display: 'flex',
		width: '72px',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: isRTL ? '0px 4px 4px 0px' : '0px 4px 4px 0px',
		// borderLeft: "none",
		border: '1px solid #277BFF',
		padding: '10px',
		marginBottom: '8px',
		color: '#277BFF',
		cursor: 'pointer',
	},
	whatsappSpecialDateBeforeActive: {
		display: 'flex',
		width: '72px',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: isRTL ? '4px 0px 0px 4px' : '0px 4px 4px 0px',
		border: '1px solid #277BFF',
		padding: '10px',
		marginBottom: '8px',
		backgroundColor: '#277BFF',
		color: '#ffffff',
		cursor: 'pointer',
	},
	whatsappSpecialDateAfterActive: {
		display: 'flex',
		width: '72px',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: isRTL ? '0px 4px 4px 0px' : '0px 4px 4px 0px',
		borderLeft: 'none',
		border: '1px solid #277BFF',
		padding: '10px',
		marginBottom: '8px',
		backgroundColor: '#277BFF',
		color: '#ffffff',
		cursor: 'pointer',
	},
	greenTextColor: {
		textDecorationColor: '#25af60 !important',
		color: '#27AE60 !important',
		'& p': {
			color: '#27AE60 !important'
		},
	},
	blueTextColor: {
		textDecorationColor: '#25af60 !important',
		color: '#3498DB !important',
		'& p': {
			color: '#3498DB !important'
		},
	},
	redTextColor: {
		textDecorationColor: '#ca332f !important',
		color: '#ca332f !important',
		'& p': {
			color: '#ca332f !important'
		},
	},
	agentSelectorContainer: {
		borderRadius: 25,
		// backgroundColor: '#5da15d',
		background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
		marginInlineEnd: 'auto',
		color: '#fff !important',
		display: 'flex',
		alignItems: 'center',
		height: 35,
		paddingLeft: isRTL ? '' : 16,
		paddingRight: isRTL ? 16 : '',
		'& .MuiSelect-select': {
			color: '#fff',
		},
		'& .MuiInput-underline:before': {
			borderBottomColor: '#fff',
		},
		'& .MuiInput-underline:after': {
			borderBottomColor: '#fff',
		},
		'& .MuiSelect-icon': {
			color: '#fff',
		},
		'& .MuiButton-root': {
			color: '#fff',
		}
	}
});
