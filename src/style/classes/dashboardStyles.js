const shortcutEditLeft = {
    xs: '8%',
    sm: '36px',
    md: '33px',
    lg: '40px',
    xl: '42px'
}

const shortcutPaperHeight = {
    xs: '',
    sm: '100%',
    md: '100%',
    lg: '100%',
    xl: 'calc(100vh - 40px)'
}

const shortcutBoxWidth = {
    xs: 'auto',
    sm: '92.1%',
    md: '92.1%',
    lg: '92.1%',
    xl: 'auto'
}


export const getDashboardStyle = (windowSize, isRTL, theme) => ({
    mobileReportHead: {
        fontWeight: 'bold',
        marginTop: 10,
        // marginInlineStart: 10
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
    shortcutTitle: {
        maxHeight: 39,
        maxWidth: 285,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    shortcutSubtitle: {
        fontSize: windowSize === 'xs' ? 16 : 18,
        padding: '0 10px 0 10px',
        marginBottom: 15
    },
    shortcutBox: {
        borderRadius: 20,
        marginBottom: 19,
        marginTop: 28,
        position: windowSize !== 'xl' && windowSize !== 'xs' ? 'block' : 'sticky',
        top: windowSize !== 'xl' ? 47 : 0,
        right: isRTL ? 'auto' : 0,
        left: isRTL ? 0 : 'auto',
        width: shortcutBoxWidth[windowSize],
        height: '92.1%',
        [theme.breakpoints.down('xs')]: {
            margin: '10px 10px 10px 10px'
        },
        border: '3px solid #F0F5FF',
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
        // height: shortcutPaperHeight[windowSize],
        height: 'calc(95vh - 47px)',
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
        background: '#fff',
        borderRadius: '20px',
        marginBottom: windowSize === 'xs' ? 30 : 40,
        fontSize: '18px',
        position: 'relative',
        textTransform: 'capitalize',
        padding: '6px 30px',
        color: '#FF0054',
        border: '3px solid #FF0076',
        boxShadow: 'none',
        '& .MuiDivider-root': {
            width: '100%',
            border: '1px #FF0054 solid',
            height: 0,
            margin: '5px 0'
        },
        '& .deleteShortcut': {
            maxHeight: 20,
            zIndex: 100,
            opacity: 0,
            PointerEvent: 'none',
            marginTop: -15,
            color: '#707070',
            fontSize: 20,
            cursor: 'pointer',
            '&:hover': {
                textDecoration: 'none',
            }
        },
        '&:hover': {
            background: '#fff',
            boxShadow: 'none',
            '& .deleteShortcut': {
                opacity: 1,
                PointerEvent: 'all',
            }
        },

    },
    shortcutDottedButton: {
        borderRadius: '20px',
        color: '#FF0076',
        border: '1px dashed #FF0076',
        fontFamily: 'pulseemicons',
        height: '92px',
        fontSize: '30px',
        marginBottom: 45,
        width: '85%',
        '&:hover': {
            background: 'none'
        }
    },
    shortcutList: {
        maxWidth: 350,
        background: 'white',
        borderRadius: 10,
        margin: 10
    },
    shortcutEditIcon: {
        fontFamily: 'pulseemicons',
        fontSize: 18,
        color: '#FF0054',
        padding: 0,
    },
    shortcutLabel: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        marginTop: -5
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
        color: '#000',
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
        },
        '& .MuiFormControlLabel-root': {
            marginRight: 0
        }
    },
    shoppingCartIcon: {
        fontSize: 24,
        marginBottom: -6
    }
});