// const shortcutEditLeft = {
//     xs: '8%',
//     sm: '36px',
//     md: '33px',
//     lg: '40px',
//     xl: '42px'
// }

// const shortcutPaperHeight = {
//     xs: '',
//     sm: '100%',
//     md: '100%',
//     lg: '100%',
//     xl: 'calc(100vh - 40px)'
// }

const shortcutBoxWidth = {
    xs: 'auto',
    sm: '92.1%',
    md: '92.1%',
    lg: '92.1%',
    xl: 'auto'
}


export const getDashboardStyle = (windowSize, isRTL, theme) => ({
        dashboardTablet: {
            background: '#fff',
            padding: windowSize === 'xs' ? '8px' : '16px',
            borderRadius: '18px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            maxWidth: '900px',
            margin: '0 auto',
            minHeight: 'calc(100vh - 32px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
        },
    mobileReportHead: {
        fontWeight: 'bold',
        marginTop: 10,
        // marginInlineStart: 10
    },
    tabelCellPadding: {
        paddingBlock: 15
    },
    dashboard: {
        background: 'transparent',
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
        maxHeight: 30,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginBottom: 10,
    },
    shortcutSubtitle: {
        fontSize: windowSize === 'xs' ? 16 : 18,
        padding: '0 10px 0 10px',
        marginBottom: 15,
        maxHeight: '10%'
    },
    shortcutBox: {
        borderRadius: 20,
        background: '#fff',
        marginBottom: 19,
        overflow: 'hidden',
        // position: windowSize !== 'xl' && windowSize !== 'xs' ? 'block' : 'sticky',
        // top: windowSize !== 'xl' ? 47 : 0,
        // right: isRTL ? 'auto' : 0,
        // left: isRTL ? 0 : 'auto',
        width: shortcutBoxWidth[windowSize],
        height: '100%',
        maxHeight: '730px',
        margin: '30px auto 19px',
        marginTop: windowSize !== 'xs' ? 30 : '',
        [theme.breakpoints.down('xs')]: {
            margin: '10px 10px 10px 10px',
            maxHeight: 'calc(100% - 50px)',
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
        height: '100%',
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
        '-ms-overflow-style': 'none', /* IE 11 */
        ['@media (max-width:1280px)']: {
            height: '100%',
            overflow: 'hidden'
        },
    },
    shortcutBtnBox: {
        position: 'relative',
        width: '100%',
        textAlign: 'center'
    },
    shortcutButton: {
        height: 90,
        width: '85%',
        background: '#fff',
        borderRadius: '20px',
        marginBottom: windowSize === 'xs' ? 30 : 25,
        fontSize: '18px',
        position: 'relative',
        textTransform: 'capitalize',
        // padding: '6px 30px',
        color: '#FF0054',
        border: '3px solid #FF0076',
        boxShadow: 'none',
        '& .MuiDivider-root': {
            width: '100%',
            border: '1px #FF0054 solid',
            height: 0,
            margin: '5px 0'
        },
        '& .shortcutEditIcon': {
            fontFamily: 'pulseemicons',
            fontSize: 16,
            color: '#FF0054',
            padding: 0,
            '&:hover': {
                textDecoration: 'none',
            }
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
        height: 90,
        fontSize: '30px',
        marginBottom: 25,
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
    shortcutLabel: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        marginTop: -5
    },
    shortcutStripBox: {
        margin: '0 30px',
        borderRadius: 20,
        border: '3px solid #F0F5FF',
        background: '#fff',
        overflow: 'hidden',
        [theme.breakpoints.down('xs')]: {
            margin: '10px',
        },
    },
    shortcutStripHeader: {
        marginBottom: 0,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    shortcutStripSubtitle: {
        fontSize: windowSize === 'xs' ? 14 : 16,
        color: '#4f4f4f',
        padding: '14px 18px 4px',
    },
    shortcutStripScroller: {
        display: 'flex',
        gap: 14,
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '10px 18px 18px',
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
            height: 8,
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#d6ddeb',
            borderRadius: 999,
        },
    },
    shortcutStripItem: {
        flex: '0 0 220px',
        minWidth: 220,
        position: 'relative',
        [theme.breakpoints.down('xs')]: {
            flexBasis: 180,
            minWidth: 180,
        },
    },
    shortcutStripCard: {
        width: '100%',
        minHeight: 99,
        borderRadius: 30,
        border: '2px solid #E83D78',
        background: '#fff',
        boxShadow: 'none',
        textTransform: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        //padding: '6px 26px 7px',
        color: '#111',
        '&:hover': {
            background: '#fff',
            boxShadow: 'none',
        },
        '& .shortcutEditIcon': {
            fontFamily: 'pulseemicons',
            fontSize: 16,
            color: '#FF0054',
            padding: 0,
        },
        '& .deleteShortcut': {
            color: '#707070',
            fontSize: 20,
            cursor: 'pointer',
        },
    },
    shortcutStripLabel: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
    },
    shortcutStripAddLabel: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shortcutStripTopRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        position: 'relative',
        paddingRight: 56,
    },
    shortcutStripMeta: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
        width: '100%',
    },
    shortcutStripIcon: {
        flex: '0 0 auto',
    },
    shortcutStripCategory: {
        fontSize: 15,
        fontWeight: 500,
        color: '#FF477E',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: 'center',
    },
    shortcutStripActions: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        minHeight: 20,
        width: 30,
        justifyContent: 'space-between',
        position: 'absolute',
        top: 6,
        right: 45,
        zIndex: 1,
        '& .shortcutEditIcon': {
            width: 0,
            height: 14,
            minWidth: 14,
            fontSize: 15,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 !important',
        },
        '& .deleteShortcut': {
            width: 14,
            height: 14,
            fontSize: 15,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 0,
            padding: '0 !important',
        },
    },
    shortcutStripDivider: {
        width: '100%',
        borderTop: '2px solid #E83D78',
        margin: '14px 0 16px',
    },
    shortcutStripTitle: {
        fontSize: windowSize === 'xs' ? 14 : 15,
        lineHeight: 1.25,
        fontWeight: 500,
        color: '#FF477E',
        textAlign: 'center',
        textDecoration: 'none',
        whiteSpace: 'normal',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        width: '100%',
    },
    shortcutStripAddCard: {
        width: '100%',
        minHeight: 99,
        borderRadius: 30,
        border: '2px dashed #FF2D76',
        background: '#fff',
        boxShadow: 'none',
        color: '#FF2D76',
        fontFamily: 'pulseemicons',
        fontSize: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 26px',
        '&:hover': {
            background: '#fff7fb',
            boxShadow: 'none',
        },
    },

    dashboardTop: {
        [theme.breakpoints.down('sm')]: {
            order: 1
        },
    },
    dashboardSide: {
        // paddingRight: isRTL ? 0 : 30,
        // paddingLeft: !isRTL ? 0 : 30,
        [theme.breakpoints.down('sm')]: {
            order: 2,
            padding: 0,
            display: 'flex',
            justifyContent: 'center'
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