export const getDashboardStyle = (windowSize, isRTL, theme) => ({
    deleteShortcut: {
        position: 'absolute',
        right: isRTL ? 40 : 'auto',
        top: 5,
        zIndex: 100,
        color: '#fff',
        fontSize: 20,
        cursor: 'pointer',
        '&:hover': {
            textDecoration: 'none',
        }
    }
});