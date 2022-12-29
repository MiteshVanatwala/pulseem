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
		display: 'grid',
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
	},
	whatsappBaseButtons: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-evenly',
		height: '100%',
		'@media screen and (max-width: 540px)': {
			flexDirection: 'column-reverse',
			paddingInlineEnd: '8px',
		},
	},
	WhatsappTextareaWrapper: {
		border: '1px solid #ced4da',
		height: '240px',
		borderBottom: '0px',
		borderTopLeftRadius: '0.25rem',
		borderTopRightRadius: '0.25rem',
		'& textarea': {
			border: 'none',
			height: 'auto',
		},
	},
	whatsappActionButtonsWrapper: {
		top: '-4px',
		position: 'relative',
	},
	whatsappActionButtonsBox: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'center',
		padding: '4px 8px',
	},
	whatsappActionButtons: {
		backgroundColor: '#b7b7b7',
		color: '#1c82b2',
		borderRadius: '6px',
		padding: '0px 14px',
		textTransform: 'none',
		fontWeight: '600',
		cursor: 'unset',
		'&:hover': {
			backgroundColor: '#b7b7b7',
			color: '#1c82b2',
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
		padding: '3px',
		fontSize: '12px',
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
		marginLeft: '4px',
		color: '#8b8b8b',
	},
	textInfoWrapper: {
		fontSize: '14px',
		fontWeight: '400',
		'&:not(:last-child)': {
			marginRight: '10px',
		},
	},
	callToActionDialogHeaderDescription: {
		fontSize: 12,
		fontFamily: 'OpenSansHebrew',
		marginTop: '-8px',
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
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		'@media screen and (max-width: 768px)': {
			alignItems: 'flex-start',
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
			width: 'auto',
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
		background: '#e1ffc7',
		padding: '8px',
		borderRadius: isRTL ? '5px 0px 5px 5px' : '0px 5px 5px 5px',
		'& pre': {
			wordWrap: 'break-word',
			whiteSpace: 'pre-line',
			margin: '0px',
			fontFamily: 'Assistant',
		},
		'& img': {
			width: '100%',
			borderRadius: '4px',
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
			height: '340px',
			background: '#1e1e1e',
			borderRadius: '20px',
			'@media (max-width: 768px)': {
				// borderRadius: '0',
				// flex: 'none',
				// padding: '0',
				maxWidth: 'none',
				// overflow: 'hidden',
				height: '100%',
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
		fontSize: '12px',
		height: 'calc(100% - 16px)',
		'& .title': {
			fontFamily: 'OpenSansHebrew-Bold',
		},
		'& p': {
			margin: '9px 0px',
			lineHeight: '15px',
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
		marginTop: '24px',
	},
	testGroupModalGroupList: {
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
	alertModalContentText: {},
	alertModalContentChildren: {
		padding: '12px 0px',
	},
	alertModalContentMobile: {
		width: '300px',
		margin: '0 auto',
	},
	alertModalAction: {
		justifyContent: 'center',
		'& button': {
			color: '#fff',
			width: '120px',
			fontSize: '18px',
			fontFamily: 'OpenSansHebrew',
			borderRadius: '50px',
			textTransform: 'capitalize',
			margin: '6px 10px 0 10px',
			padding: '2px 0px',
		},
		'& .ok-button': {
			border: '1px solid #345233',
			maxWidth: '250px',
			borderTop: '0px solid #345233',
			boxShadow: '0px 3px 3px #345233',
			backgroundImage: 'linear-gradient(to bottom, #5cb85c 0%, #449d44 100%)',
			backgroundRepeat: 'repeat-x',
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
		color: '#ff0000',
	},

	/* Send Campaign */

	WhatsappCampainP1Title: {
		fontSize: windowSize === 'xs' ? '25px' : '36px',
		color: '#333333',
		paddingBlock: '0.5rem',
		fontFamily: 'Assistant',
		fontWeight: 'bold',
		marginTop: 20,
		whiteSpace: windowSize === 'xs' ? 'break-spaces' : null,
	},
	WhatsappCampainP1: {},
	WhatsappCampainP1Left: {
		padding: '0px 8px 0px 8px',
	},
	WhatsappCampainP1Right: {
		padding: '0px 108px 0px 204px',
		'@media screen and (max-width: 768px)': {
			padding: '0px',
		},
	},
	WhatsappCampainButtonContent: {
		fontFamily: 'OpenSansHebrew',
		fontSize: '12px',
		color: '#959595',
	},
	WhatsappCampainFields: {
		marginBottom: '18px',
	},
	WhatsappCampainTextarea: {},
	WhatsappCampainRadioButton: {
		color: '#0677fa',
		'&.Mui-checked': {
			color: '#0677fa',
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
			backgroundColor: '#19762b',
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
		backgroundColor: '#0371ad',
		color: '#ffffff',
		'&:hover': {
			textTransform: 'capitalize',
			fontSize: '14px',
			backgroundColor: '#0371ad',
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
				backgroundColor: '#2f9d1a',
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
	whatsappCampainHighlightTextWrapper: {},
	whatsappCampainHighlightText: {
		backgroundColor: '#169bd5',
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
	},
	testSendNewTag: {
		backgroundColor: '#c9302c',
		color: '#ffffff',
		height: '22px',
		borderRadius: '4px',
		padding: '2px 4px',
	},
	testSendRadio: {
		padding: '0 12px',
	},
	testOneContactSendButton: {
		color: '#009f00',
		border: '1px solid #009f00',
		marginRight: isRTL ? '8px !important' : '0px',
		marginLeft: isRTL ? '0px' : '8px !important',
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
		color: '#1771ad',
		fontSize: '20px',
		marginBottom: '7px',
	},
	campaignSummaryTextDesc: {
		fontSize: '1rem',
		fontWeight: 700,
	},
	campaignSummaryTextDetail: {},
	summaryModal: {
		border: '2px solid #0371ad',
		margin: '18px',
		borderRadius: '4px',
		padding: '14px 26px',
		direction: isRTL ? 'rtl' : 'ltr',
		position: 'relative',
	},
	campaignSummaryImportantText: {
		textAlign: 'center',
		color: '#DC3D1B',
	},

	/* Management and report pages */

	manageWhatsappTemplates: {},
	manageTemplatesHeaderButtons: {
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
	manageTemplatesCampaignCount: {
		marginTop: '25px',
		fontSize: '14px',
		marginRight: '10px',
	},
	manageTemplatesTableWrapper: {
		marginTop: '17px',
		padding: '0 8px',
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
			'& tr': {
				'& th': {
					'&:nth-child(1)': {
						width: '270px',
					},
					'&:nth-child(2)': {
						width: '160px',
					},
					'&:nth-child(3)': {
						width: '70px',
						color: '#26BE35',
					},
					'&:nth-child(4)': {
						width: '140px',
					},
					'&:nth-child(5)': {
						width: '70px',
					},
					'&:nth-child(6)': {
						width: '160px',
					},
					'&:nth-child(7)': {
						width: '160px',
					},
				},
				'& td': {
					'&:nth-child(1)': {
						width: '270px',
						'& p': {
							textDecoration: 'none',
						},
					},
					'&:nth-child(2)': {
						width: '160px',
					},
					'&:nth-child(3)': {
						width: '70px',
						'& p': {
							color: '#26BE35',
						},
					},
					'&:nth-child(4)': {
						width: '140px',
						'& p': {
							color: '#6464FF',
						},
					},
					'&:nth-child(5)': {
						width: '70px',
						'& p': {
							color: '#6464FF',
						},
					},
					'&:nth-child(6)': {
						width: '160px',
						'& p': {
							color: 'red',
						},
					},
					'&:nth-child(7)': {
						width: '160px',
					},
					'& p': {
						textDecoration: 'underline',
						fontFamily: 'Assistant',
						fontWeight: '500',
					},
				},
			},
		},
	},
	whatsappCampaignDynamicFieldLinkRemoval: {
		textTransform: 'capitalize',
		fontSize: '14px',
		backgroundColor: '#0371ad',
		color: '#ffffff',
		marginTop: '6px',
		marginLeft: '10px',
		padding: '3px 9px',
		borderRadius: '20px',
		'&:hover': {
			textTransform: 'capitalize',
			fontSize: '14px',
			backgroundColor: '#0371ad',
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
});
