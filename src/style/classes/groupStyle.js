export const getGroupStyle = (windowSize, isRTL, theme) => ({
    noBoxShadow: {
        boxShadow: 'none'
    },
    autoAlign: {
        textAlign: isRTL ? 'right' : 'left',
        '& p': {
            textAlign: isRTL ? 'right' : 'left',
        }
    }
});