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
        [theme.breakpoints.down('xs')]: {
            width: '100%',
            height: 82,
            marginBottom: 18,
            borderRadius: 12,
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
        ,
        [theme.breakpoints.down('xs')]: {
            width: '100%',
            height: 82,
            marginBottom: 18,
            borderRadius: 12,
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
        margin: '30px 30px 0 30px',
        borderRadius: 20,
        border: '3px solid #F0F5FF',
        background: '#fff',
        overflow: 'hidden',
        display: 'block',
        [theme.breakpoints.down('xs')]: {
            margin: '10px 10px 0 10px',
        },
    },
    shortcutStripHeader: {
        marginBottom: 0,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        height: '20% !important',
        maxHeight: 'none !important',
        padding: '6px 10px !important',
    },
    // Pill / chip styles
    pillScroller: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        padding: '12px 14px 16px',
        boxSizing: 'border-box',
        ['@media (min-width:1300px)']: {
            flexDirection: 'column',
            flexWrap: 'nowrap',
        },
    },
    pillItem: {
        position: 'relative',
        width: 'calc(50% - 4px)',
        minWidth: 0,
        boxSizing: 'border-box',
        ['@media (min-width:1300px)']: {
            width: '100%',
        },
        [theme.breakpoints.down('xs')]: {
            width: '100%'
        },
    },
    pillChip: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minHeight: 42,
        borderRadius: 999,
        border: '2px solid',
        padding: '4px 10px',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'box-shadow 0.15s, transform 0.15s',
        '&:hover': {
            boxShadow: '0 4px 14px rgba(0,0,0,0.10)',
            transform: 'translateY(-2px)',
        },
    },
    pillIconCircle: {
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    pillTextBlock: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minWidth: 0,
        flex: 1,
        overflow: 'hidden',
    },
    pillCategory: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
    },
    pillTitle: {
        fontSize: 12,
        fontWeight: 500,
        color: '#333',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        lineHeight: 1.3,
    },
    pillActions: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        marginLeft: 4,
        transition: 'opacity 0.15s',
        '& .shortcutEditIcon': {
            fontFamily: 'pulseemicons',
            fontSize: 13,
            color: '#888',
            padding: 2,
            '&:hover': { color: '#333' },
        },
        '& .deleteShortcut': {
            fontSize: 13,
            color: '#888',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: 2,
            '&:hover': { color: '#e63946' },
        },
    },
    pillActionBtn: {
        padding: '2px !important',
        minWidth: 'unset',
    },
    pillMoreBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        minHeight: 42,
        borderRadius: 999,
        border: '2px solid #6C63FF',
        background: '#F0EEFF',
        padding: '4px 10px',
        width: '100%',
        boxSizing: 'border-box',
        cursor: 'pointer',
        transition: 'background 0.15s',
        '&:hover': {
            background: '#e4e1ff',
        },
    },
    pillMoreLabel: {
        fontSize: 12,
        fontWeight: 700,
        color: '#6C63FF',
        whiteSpace: 'nowrap',
    },
    pillPopoverPaper: {
        padding: '10px 10px 6px',
        width: 280,
        maxHeight: 300,
        overflowY: 'auto',
        borderRadius: '14px !important',
        boxShadow: '0 8px 32px rgba(0,0,0,0.16) !important',
        border: '1px solid #ececec',
        marginInlineStart: 8,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { background: '#d6ddeb', borderRadius: 999 },
        scrollbarWidth: 'thin',
    },
    pillPopoverTitle: {
        fontSize: 10,
        fontWeight: 700,
        color: '#aaa',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 8,
        paddingInlineStart: 4,
    },
    pillPopoverList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
    },
    pillPopoverChip: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minHeight: 42,
        borderRadius: 999,
        border: '2px solid',
        padding: '4px 10px',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
        '&:hover': {
            boxShadow: '0 4px 14px rgba(0,0,0,0.10)',
        },
    },
    pillPopoverItem: {
        position: 'relative',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
    },
    pillAddChip: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 42,
        borderRadius: 999,
        border: '2px dashed #FF2D76',
        padding: '4px 10px',
        width: '100%',
        boxSizing: 'border-box',
        cursor: 'pointer',
        transition: 'background 0.15s',
        '&:hover': {
            background: '#fff7fb',
        },
    },
    pillAddLabel: {
        fontSize: 12,
        fontWeight: 600,
        color: '#FF2D76',
        whiteSpace: 'nowrap',
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