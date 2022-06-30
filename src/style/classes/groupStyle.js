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
    groupName: {
        "@media screen and (max-width: 1160px)": {
            fontSize: '16px'
        }
    },
    noWrap: {
        whiteSpace: 'nowrap',
        '& p': {
            whiteSpace: 'nowrap',
        }
    },
    dataBox: {
        whiteSpaces: 'nowrap',
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