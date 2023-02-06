export const getGroupStyle = (windowSize, isRTL, theme) => ({
    noBoxShadow: {
        boxShadow: 'none'
    },
    autoAlign: {
        textAlign: isRTL ? 'right' : 'left',
        '& p': {
            textAlign: isRTL ? 'right' : 'left',
        }
    },
    noWrap: {
        whiteSpace: 'nowrap',
        '& p': {
            whiteSpace: 'nowrap',
        }
    },
    grpDataBoxText: {
        padding: '11px 0px',
        fontSize: '0.9rem!important',
        "@media screen and (max-width: 1350px)": {
            fontSize: '14px'
        }
    },
    date: {
        "@media screen and (max-width: 1160px)": {
            fontSize: '13px'
        }
    }
});