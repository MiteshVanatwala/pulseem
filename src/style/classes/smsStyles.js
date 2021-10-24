const mobileWidth = {
    sm: 180,
    md: 250,
    lg: 350,
    xl: 350
}
const mobileHeight = {
    sm: 'auto',
    md: 'auto',
    lg: 370,
    xl: 370
}

const phoneTopPosition = {
    sm: 51,
    md: 51,
    lg: 90,
    xl: 90
}

export const getSmsStyle = (windowSize, isRTL, theme) => ({
    mobilePreviewSummary: {
        width: mobileWidth[windowSize],
        height: mobileHeight[windowSize],
        marginTop: "10px",
        borderBottom: "1px solid #efefef",
    },
    phoneNumberSum: {
        display: 'flex',
        position: 'absolute',
        justifyContent: 'center',
        top: phoneTopPosition[windowSize],
        left: 0,
        right: 0,
        fontSize: 14,
        fontWeight: 'bold'
    },
    tagSelected: {
        '& .MuiAutocomplete-tag': {
            marginTop: 5,
            backgroundColor: '#1c82b2',
            '& .MuiChip-label': {
                color: '#fff !important'
            },
            '& .MuiChip-deleteIcon': {
                color: '#fff !important'
            }
        },
        '& .MuiAutocomplete-inputRoot': {
            paddingRight: !isRTL ? '56 !important' : '0 !important',
            paddingLeft: isRTL ? '56 !important' : '0 !important',
        },
        '& .MuiAutocomplete-endAdornment': {
            right: !isRTL ? 0 : 'auto',
            left: !isRTL ? 'auto' : 0
        }
    },
    bottomShadow: {
        boxShadow: 'inset 0 -10px 10px -10px rgb(0 0 0 / 10%)',
        overflowY: 'auto',
        overflowX: 'hidden',
        minHeight: 45
    },
    dateBox: {
        paddingRight: isRTL ? 30 : "",
        paddingLeft: isRTL ? "" : 30,
        maxWidth: 300
    }
});