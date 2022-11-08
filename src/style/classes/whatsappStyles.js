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


export const getWhatsappStyle = (windowSize, isRTL, theme) => ({
    whatsappTemplateTitle: {
        fontSize: windowSize === "xs" ? "25px" : "36px",
        color: "#333333",
        paddingBlock: "0.5rem",
        fontFamily: "Assistant",
        fontWeight: "bold",
        marginTop: 20,
        whiteSpace: windowSize === "xs" ? "break-spaces" : null,
    },
});