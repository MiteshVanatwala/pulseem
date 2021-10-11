const shortcutEditLeft = {
    xs: '8%',
    sm: '18px',
    md: '15px',
    lg: '22px',
    xl: '28px'
}

const shortcutPaperHeight = {
    xs: '',
    sm: '100%',
    md: '100%',
    lg: '100%',
    xl: 'calc(100vh - 47px)'
}

const shortcutBoxWidth = {
    xs: 'auto',
    sm: '100%',
    md: '100%',
    lg: '100%',
    xl: 'auto'
}


export const getDashboardStyle = (windowSize, isRTL, theme) => ({
    mobileReportHead: {
        fontWeight: 'bold',
        marginTop: 15,
        marginInlineStart: 10
    },
    tabelCellPadding: {
        paddingBlock: 15
    },
    dashboard: {
        background: '#F2F2F2',
        padding: 0,
        maxHeight: 'unset',
    },
    chartLabelGreen: {
        position: 'absolute',
        top: 'calc(50% - 28px)',
        width: '100%',
        fontSize: 35,
        fontWeight: '500',
        textTransform: 'uppercase',
        color: '#65d638'
    },
    shortcutTitleSection: {
        width: '85%',
        marginTop: '2.1rem',
        marginBottom: 40
    },
    shortcutTitle: {
        fontSize: windowSize === 'xs' ? 23 : 25,
        fontWeight: 'bold'
    },
    shortcutSubtitle: {
        fontSize: windowSize === 'xs' ? 16 : 18,
    },
    shortcutBox: {
        position: windowSize !== 'xl' && windowSize !== 'xs' ? 'block' : 'sticky',
        top: windowSize !== 'xl' ? 47 : 0,
        right: isRTL ? 'auto' : 0,
        left: isRTL ? 0 : 'auto',
        width: shortcutBoxWidth[windowSize],
        height: shortcutPaperHeight[windowSize],
        [theme.breakpoints.down('xs')]: {
            margin: '10px 10px 10px 10px'
        },
        boxShadow: windowSize === 'xs' ? '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)' : isRTL && windowSize !== 'xs' ? '4px 0px 5px 0px rgba(0,0,0, 0.2)' : '-4px 0px 5px 0px rgba(0,0,0, 0.2)',
        borderRadius: windowSize === 'xs' ? 10 : 0,
        '& .MuiPaper-rounded': {
            scrollbarWidth: 'none',
            overflow: 'auto',
            '-ms-overflow-style': 'none' /* IE 11 */
        }
    },
    shortcutPaper: {
        [theme.breakpoints.down('xs')]: {
            borderRadius: 10,
        },
        height: shortcutPaperHeight[windowSize],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            width: '0px'
        },
        '&::-webkit-scrollbar-thumb': {
            'backgroundColor': 'darkgrey',
            borderRadius: '5px'
        },
        scrollbarWidth: 'none',
        overflow: 'auto',
        '-ms-overflow-style': 'none' /* IE 11 */
    },
    shortcutBtnBox: {
        position: 'relative',
        width: '100%',
        textAlign: 'center'
    },
    shortcutButton: {
        height: '92px',
        width: '85%',
        background: '#0371AD',
        borderRadius: '20px',
        marginBottom: windowSize === 'xs' ? 30 : 40,
        fontSize: '18px',
        position: 'relative',
        textTransform: 'capitalize',
        padding: '6px 30px'

    },
    shortcutDottedButton: {
        borderRadius: '20px',
        border: '1px dashed #0371AD',
        fontFamily: 'pulseemicons',
        height: '92px',
        fontSize: '30px',
        marginBottom: 45,
        width: '85%',
    },
    shortcutList: {
        maxWidth: 350,
        background: 'white',
        borderRadius: 10,
        margin: 10
    },
    shortcutEditIcon: {
        position: 'absolute',
        left: isRTL ? 'auto' : shortcutEditLeft[windowSize],
        right: isRTL ? shortcutEditLeft[windowSize] : 'auto',
        bottom: windowSize === 'xs' ? 40 : 50,
        fontFamily: 'pulseemicons',
        fontSize: 18,
        color: 'white'
    },
    shortcutLabel: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        marginTop: -5
    },
    deleteShortcut: {
        position: 'absolute',
        right: isRTL ? 'auto' : 40,
        left: isRTL ? 40 : 'auto',
        top: 5,
        zIndex: 100,
        color: '#fff',
        fontSize: 20,
        cursor: 'pointer',
        '&:hover': {
            textDecoration: 'none',
        }
    },
    dashboardTop: {
        [theme.breakpoints.down('sm')]: {
            order: 1
        },
    },
    dashboardSide: {
        [theme.breakpoints.down('sm')]: {
            order: 2
        },
    },
    transitionElem: {
        transition: ' ease-in-out .4s'
    },
    tabTitle: {
        color: '#006996',
        fontSize: 32,
        textAlign: 'center',
        lineHeight: '1.1'
    },
    createButton: {
        backgroundColor: '#27AE60',
        '&:hover': {
            backgroundColor: '#219150'
        }
    },
    paymentDialog: {
        maxWidth: 480,
        '& .MuiIconButton-colorSecondary': {
            color: '#0371ad'
        }
    },
    shoppingCartIcon: {
        fontSize: 24,
        marginBottom: -6
    }
});