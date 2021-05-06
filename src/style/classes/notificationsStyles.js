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
        alignItems: 'center',
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
        marginRight: '10px',
        marginLeft: '10px',
        marginBottom: '10px',
        marginTop: '10px',
        width: '100%',
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
    }

})
