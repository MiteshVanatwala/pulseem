const shortcutEditLeft = {
  xs: "8%",
  sm: "18px",
  md: "15px",
  lg: "22px",
  xl: "28px",
};

const shortcutPaperHeight = {
  xs: "",
  sm: "100%",
  md: "100%",
  lg: "100%",
  xl: "calc(100vh - 47px)",
};

const shortcutBoxWidth = {
  xs: "auto",
  sm: "100%",
  md: "100%",
  lg: "100%",
  xl: "auto",
};

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
    whatsappFuncDiv: {
        width: "100%",
        height: "60px",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "64px auto",
        position: "relative",
        top: "-4px",
        padding: 5,
        border: "1px solid #ced4da",
        borderTop: "none",
        alignItems: "center",
        borderBottomLeftRadius: ".25rem",
        borderBottomRightRadius: ".25rem",
        "@media screen and (max-width: 768px)": {
          height: "110px",
        },
    },
    whatsappBaseButtons: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        height: "100%",
        "@media screen and (max-width: 540px)": {
            flexDirection: "column-reverse",
            paddingInlineEnd: "8px",
        },
    },
    whatsappActionButtonsWrapper: {
        top: "-4px",
        position: "relative",
        borderRight: '1px solid #ced4da',
        borderLeft: '1px solid #ced4da'
    },
    whatsappActionButtonsBox: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: '4px 8px',
    },
    whatsappActionButtons: {
        backgroundColor: '#b7b7b7',
        color: '#1c82b2',
        borderRadius: '6px',
        padding: '0px 14px',
        textTransform: 'none',
        fontWeight: "600",
        cursor: "unset",
        "&:hover": {
            backgroundColor: '#b7b7b7',
            color: '#1c82b2',
          },
    },
    whatsappInfoButtons: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        fontWeight: 600,
        color: "white",
        backgroundColor: "#1c82b2",
        cursor: "pointer",
        borderColor: "#1c82b2",
        textTransform: "none",
        marginInlineStart: 1,
        marginInlineEnd: 1,
        padding: "3px",
        "&$disabled": {
          cursor: "not-allowed !important",
        },
        "&:hover": {
          backgroundColor: "#1c82b2",
        },
        "@media screen and (max-width: 1366px)": {
          fontSize: 11,
        },
        "@media screen and (max-width: 768px)": {
          width: "110px",
          padding: "8px",
          marginBottom: 5,
          fontSize: 11,
        },
        "@media screen and (max-width: 530px)": {
          "&:first-child": {
            marginInlineStart: 0,
            marginInlineEnd: 0,
          },
          "&:nth-child(2)": {
            marginInlineStart: 0,
            marginInlineEnd: 0,
          },
        },
        "@media screen and (max-width: 375px)": {
          "&:first-child": {
            marginInlineStart: 5,
            marginInlineEnd: 0,
          },
          "&:nth-child(2)": {
            marginInlineStart: 5,
            marginInlineEnd: 0,
          },
        },
      },
      textInfo: {
        marginLeft: "4px",
        color: "#8b8b8b"
      },
      textInfoWrapper: {
        fontSize: "14px",
        fontWeight: "400",
        "&:not(:last-child)": {
            marginRight: "10px"
        }
      },
      quickReplyDelete: {
        alignItems: 'center',
        color: "#ff0000",
        cursor: "pointer",
        paddingTop: "22px",
        paddingLeft: isRTL ? '0px' : '10px',
        paddingRight: isRTL ? '10px' : '0px',
      },
      quickReplayDialog: {
        direction: isRTL ? 'rtl' : 'ltr'
      },
      quickReplayDialogClose: {
        position: 'absolute',
        top: 0,
        left: isRTL ? 0 : 'unset',
        right: isRTL ? 'unset' : 0
      },
      quickReplayDialogHeader: {
        fontSize: 14,
        fontFamily: 'OpenSansHebrew-Bold',
        color: "#0371ad",
        paddingBottom: '0px',
        textAlign: isRTL ? 'right' : 'left'
      },
      quickReplayDialogHeaderDescription: {
        fontSize: 12,
        fontFamily: 'OpenSansHebrew',
        marginTop: '-8px',
        textAlign: isRTL ? 'right' : 'left'
      },
      quickReplayButtonGridWrapper: {
        padding: '4px 0px'
      },
      quickReplayButtonWrapper: {
        border: '1px solid #bbb',
        borderRadius: '5px',
        outline: 'none'
      },
      quickReplaybuttonField:{
        outline: 'none',
        padding: '8px 12px 8px 4px',
        fontSize: '16px'
      },
      quickReplayValidationCounter: {
        border: '0px',
        borderRight: isRTL ? '1px solid rgba(0, 0, 0, 0.23)' : '0px',
        borderLeft: isRTL ? '0px' : '1px solid rgba(0, 0, 0, 0.23)',
        backgroundColor: "#ededed",
        cursor: 'auto',
        "&:hover": {
          backgroundColor: "#ededed",
        },
      },
      quickReplySave: {
        backgroundColor: "green", 
        color: "white"
      }
});
