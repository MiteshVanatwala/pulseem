import mobileBg from '../../assets/images/mobile.png'

export const getNotificationStyle = (windowSize, isRTL, theme) => ({
    roundedCircle: {
        borderRadius: '100%',
        paddingRight: '.5em',
        paddingLeft: '.5em',
        backgroundColor: '#1c82b2',
        color: '#fff',
        marginLeft: '0 !important',
        fontSize: '25px',
        border: '1px solid'
    },
    notification: {
        right: '25px',
        bottom: '25px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 10px 0 rgb(0 0 0 / 50%)',
        maxWidth: '350px',
        fontFamily: 'Assistant'
    },
    textArea: {
        fontFamily: 'Assistant'
    },
    notificationContainer: {
        direction: 'rtl',
        position: 'relative',
        backgroundSize: 'cover',
        width: '100%',
        height: '100%',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        minHeight: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer'
    },
    borderSign: {
        display: 'flex',
        justifyContent: 'center'
    },
    dashed: {
        border: '1px dashed #64a1bd'
    },
    notificationTop: {
        justifyItems: 'flex-start'
    },
    textField: {
        width: '100%'
    },
    flex: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap'
    },
    flexCenter: {
        justifyContent: 'center',
        flexWrap: 'nowrap'
    },
    flexColumn: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    absTopRight: {
        opacity: '0',
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '25px',
        height: '25px',
        top: '5px',
        right: '5px',
        backgroundColor: '#c9302c',
        color: '#fff',
        borderRadius: '25px',
        transition: 'all .4s ease-in-out',
        '-webkit-transition': 'all .4s ease-in-out',
        '-o-transition': 'all ease-in-out .4s',
        '-moz-transition': 'all ease-in-out .4s'
    },
    hidden: {
        display: 'none !important'
    },
    footerWrapper: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        minHeight: '115px',
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
    },
    iconWrapper: {
        margin: '15px',
        minWidth: '100px',
    },
    icon: {
        direction: 'rtl',
        position: 'relative',
        backgroundSize: 'cover',
        width: '100px',
        height: '100%',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        maxHeight: '112px',
        minHeight: '85px',
        cursor: 'pointer',
    },
    notificationContent: {
        padding: '15px 0',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        width: '100%',
        maxWidth: '100%',
        marginRight: '15px',
        marginLeft: '15px',
        overflow: 'hidden',
        borderBottom: 'none !important'
    },
    notificationTitle: {

    },
    notificationText: {
        marginTop: '5px',
        resize: 'none',
        height: '45px !important',
        overflow: 'hidden',
        textAlign: 'right'
    },
    RedirectButtonText: {
        padding: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    dialogButtonsContainer: {
        marginTop: '25px',
        justifyContent: 'flex-start !important'
    },
    previewTitle: {
        marginTop: '0px'
    },
    deviceSelectorPanel: {
        maxWidth: '200px',
        backgroundColor: 'transparent',
        boxShadow: 'none'
    },
    deviceSelector: {
        minWidth: 'unset !important'
    },
    expandNotification: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'transparent',
        border: 'none',
        zIndex: '999',
        cursor: 'pointer'
    },
    notificationSiteAddress: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: '30px',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '5px'
    },
    wizardButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '50px',
        width: '90%',
        display: 'flex'
    },
    mobileBG: {
        backgroundImage: `url(${mobileBg})`,
        width: '450px',
        height: '100%',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        minHeight: '400px',
        position: 'relative'
    },
    mobileNotification: {
        width: '100%',
        maxWidth: '350px',
        boxShadow: '0 5px 5px 1px rgb(0 0 0 / 50%)',
        fontFamily: 'Assistant',
        top: '50px',
        borderRadius: '5px',
        position: 'absolute',
        right: '50px',
        maxHeight: 'calc(100% - 80px)'
    },
    chromeNotification: {
        backgroundColor: '#282828 !important',
        color: '#fff'
    },
    chromeRedirectButtonText: {
        backgroundColor: '#282828 !important',
        color: '#fff'
    },
    chromeRedirectInnerButton: {
        padding: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#535353',
        color: '#fff',
        width: '100%'
    },
    directionRadio: {
        flexDirection: 'row !important'
    },
    emojiIcon: {
        backgroundImage: 'url(data:image/png;base64,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)',
        backgroundSize: 'cover',
        border: 'none',
        backgroundColor: 'transparent',
        backgroundPosition: 'center',
        width: 30,
        height: 30,
        marginTop: 5
    }
})
