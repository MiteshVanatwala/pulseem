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
const pulseDialogWidth = {
    sm: '100%',
    md: 450,
    lg: 550,
    xl: 650
}
const summaryWidth = {
    sm: '100%',
    md: 450,
    lg: 740,
    xl: 800
}

const flexDirection = {
    xs: 'column-reverse',
    sm: 'column-reverse',
    md: 'row',
    lg: 'row',
    xl: 'row',
}

const clientIframeSize = {
    xs: '100%',
    sm: '100%',
    md: 680,
    lg: 680,
    xl: 680
}

export const getSmsStyle = (windowSize, isRTL, theme) => ({
    sectionTitle: {
        marginTop: 45,
        fontWeight: '500',
        color: '#555',
        fontSize: '22px',
        [theme.breakpoints.down('xs')]: {
            fontSize: 18,
            marginBottom: 0,
        },
    },
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
            background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
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
        maxWidth: 300,
        width: '100%',
        [theme.breakpoints.down('xs')]: {
            width: 'auto',
        },
    },
    inputLabel: {
        fontSize: 20,
        marginInlineEnd: 10,
        whiteSpace: 'nowrap'
    },
    textInput: {
        border: '1px solid #ddd',
        outline: 'none',
        paddingRight: 10,
        borderRadius: 4,
        paddingLeft: 10
    },
    tableColumn: {
        border: "1px solid #ddd",
        padding: 10,
        maxWidth: 280,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: "center",
        minWidth: 150
    },
    pulseDialog: {
        width: pulseDialogWidth[windowSize]
    },
    groupInput:
    {
        padding: "10px",
        outline: "none",
        border: "1px solid #efefef",
        marginInlineStart: "10px"

    },
    saveBtn:
    {
        marginInlineStart: "5px",
        color: '#007bff',
        border: '1px solid #007bff',
        // padding: "8px",
        borderRadius: "5px",
        cursor: "pointer"
    },
    blueDoc:
    {
        border: "1px solid #FF3343",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FF3343",
        minWidth: 30,
        minHeight: 30
    },
    redDoc: {
        border: "1px solid #ff3343",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ff3343",
        minWidth: 30,
        minHeight: 30
    },
    greenDoc:
    {
        border: "1px solid #ff3343",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#3DA6F7",
        minWidth: 30,
        minHeight: 30
    },
    reactSwitch: {
        verticalAlign: 'middle',
        marginInlineEnd: '8px'
    },
    reactSwitchHe: {
        verticalAlign: 'middle',
        marginInlineStart: '8px',
        transform: 'rotateY(180deg)'
    },
    icn:
    {
        fontSize: "30px",
        color: "#fff",
        'path':
        {
            stroke: "#fff"
        }
    },
    baseSum:
    {
        display: "grid",
        gridTemplateColumns: "50% 50%",
        width: summaryWidth[windowSize],
        marginTop: "15px",
        "& $wrapChat": {
            width: 270,
            right: 40
        },
        "@media screen and (max-width: 1366px)": {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 20,
            width: 740,
        },
        "@media screen and (max-width: 768px)": {
            display: 'flex',
            flexDirection: 'column',
            width: 'auto',
            height: 'auto',
        }
    },
    sumLeft:
    {
        marginTop: "10px"
    },
    sumRight:
    {

    },
    sumChild:
    {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        marginBottom: "25px"
    },
    spanSum:
    {
        fontSize: 20,
        color: "#ff3343",
        marginBottom: "7px"
    },
    bodySum:
    {
        fontWeight: "700",
        fontSize: '1rem'
    },
    smsSummaryText: {
        fontSize: '1rem',
        color: '#6c757d'
    },
    sumList: {
        paddingRight: 20,
        paddingLeft: 20,
        marginTop: 0,
        fontSize: '1rem',
        fontWeight: 700
    },
    listTitle: {
        fontSize: "16px",
        fontWeight: "700",
        marginBottom: "2px",
        cursor: "pointer",
        color: "#0371ad",
        paddingBottom: "5px",
    },
    summaryFilterItem: {
        display: "flex",
        alignItems: "center",
        padding: "8px 15px 8px 15px",
        borderTop: "1px solid #E5E5E5",
        fontSize: 16,
        "&:last-child": {
            borderBottom: "1px solid #e5e5e5"
        }
    },
    summaryListItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        fontSize: "16px",
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        '&:last-child': {
            borderBottom: 'none'
        }
    },
    summaryDetailsSpan: {
        padding: "5px 20px",
        fontSize: 18,
        color: "#1c82b2"
    },
    summaryDetailsSpanBold: {
        marginLeft: 5,
        marginRight: 5,
        fontWeight: 700,
        color: '#000'
    },
    pulseInsert:
    {
        width: 70,
        border: "2px solid #efefef",
        height: 36,
        borderRadius: 5,
        textAlign: 'center',
        "@media screen and (max-width: 560px)": {
            width: 50
        }
    },
    pulseActive:
    {
        width: 70,
        border: "2px solid #e9ecef",
        height: 36,
        borderRadius: 5,
        outline: "none",
        textAlign: 'center',
        "@media screen and (max-width: 414px)": {
            width: 50
        },
    },
    toggleEnd: {
        display: "flex",
        width: "72px",
        alignItems: "center",
        justifyContent: "center",
        borderBottomLeftRadius: "4px",
        borderTopLeftRadius: "4px",
        border: "1px solid #efefef",
        height: 40,
        color: "#A7A7A7",
        cursor: "pointer",
        paddingRight: 10,
        paddingLeft: 10,
        "@media screen and (max-width: 560px)": {
            fontSize: 12
        },
        "@media screen and (max-width: 375px)": {
            width: 42,
        }
    },
    toggleStart: {
        display: "flex",
        width: "72px",
        alignItems: "center",
        justifyContent: "center",
        borderBottomRightRadius: "4px",
        borderTopRightRadius: "4px",
        border: "1px solid #efefef",
        height: 40,
        color: "#A7A7A7",
        cursor: "pointer",
        paddingRight: 10,
        paddingLeft: 10,
        "@media screen and (max-width: 560px)": {
            fontSize: 12
        },
        "@media screen and (max-width: 375px)": {
            width: 42,
        }
    },
    toggleActive: {
        display: "flex",
        width: "72px",
        alignItems: "center",
        justifyContent: "center",
        borderBottomLeftRadius: "4px",
        borderTopLeftRadius: "4px",
        border: "1px solid #FF3343",
        height: 40,
        color: "#FF3343",
        cursor: "pointer",
        paddingRight: 10,
        paddingLeft: 10,
        "@media screen and (max-width: 375px)": {
            width: 42,
        }
    },
    percentTrue: {
        display: "flex",
        width: "72px",
        alignItems: "center",
        justifyContent: "center",
        borderBottomLeftRadius: "4px",
        borderTopLeftRadius: "4px",
        border: "1px solid #FF3343",
        height: 40,
        color: "#ffffff",
        backgroundColor: " #FF3343",
        cursor: "pointer",
        paddingRight: 10,
        paddingLeft: 10,
        "@media screen and (max-width: 375px)": {
            width: 42,
        }
    },
    reciActive: {
        display: "flex",
        width: "72px",
        alignItems: "center",
        justifyContent: "center",
        borderBottomRightRadius: "4px",
        borderTopRightRadius: "4px",
        borderLeft: "none",
        border: "1px solid #FF3343",
        height: 40,
        color: "#FF3343",
        cursor: "pointer",
        paddingRight: 10,
        paddingLeft: 10,
        "@media screen and (max-width: 375px)": {
            width: 42,
        }
    },
    percentActivetrue: {
        display: "flex",
        width: "72px",
        alignItems: "center",
        justifyContent: "center",
        borderBottomLeftRadius: "4px",
        borderTopLeftRadius: "4px",
        border: "1px solid #FF3343",
        height: 40,
        color: "#ffffff",
        backgroundColor: "#FF3343"
    },
    reciTrue: {
        display: "flex",
        width: "72px",
        alignItems: "center",
        justifyContent: "center",
        borderBottomRightRadius: "4px",
        borderTopRightRadius: "4px",
        borderLeft: "none",
        border: "1px solid #FF3343",
        height: 40,
        color: "#ffffff",
        backgroundColor: " #FF3343",
        cursor: "pointer",
        paddingRight: 10,
        paddingLeft: 10,
        "@media screen and (max-width: 375px)": {
            width: 42,
        }
    },
    reciActivetrue: {
        display: "flex",
        width: "72px",
        alignItems: "center",
        justifyContent: "center",
        borderBottomRightRadius: "4px",
        borderTopRightRadius: "4px",
        borderLeft: "none",
        border: "1px solid #FF3343",
        height: 40,
        color: "#ffffff",
        backgroundColor: "#FF3343",
        paddingRight: 10,
        paddingLeft: 10,
        "@media screen and (max-width: 375px)": {
            width: 42,
        }
    },
    reciMain:
    {
        height: 40,
        marginTop: "10px",
        border: "1px solid #efefef",
        boxShadow: "none",
        borderRadius: "none !important",
        overflow: 'hidden',
        width: '100%'

    },
    reciList:
    {
        display: "flex",
        height: "40px",
        width: "100%",
        maxWidth: 700,
        flexWrap: "wrap",
        overflowY: "auto",
        border: "1px solid #efefef"
    },
    manualModal: {
        display: "flex",
        height: "40px",
        marginTop: "15px",
        marginBottom: "20px",
        width: "100%",

    },
    adjustP:
    {
        position: "relative",
        width: "100%",
        // display:"flex",
        // alignItems:"center",
        // justifyContent:"center"
    },
    bgBlack: {
        backgroundColor: 'black'
    },
    fBlack: {
        color: 'black !important'
    },
    black: {
        color: '#626262'
    },
    white: {
        color: 'white'
    },
    management: {
        maxWidth: 1600,
        '&.MuiContainer-root': {
            // marginLeft: 207
        },
        '& .topSection': {
            marginTop: 37.870,
            border: '2px solid #F0F5FF',
            borderRadius: 10,
            paddingBottom: 31,
            background: '#fff',
            '& .searchLine': {
                paddingInlineStart: 31,
                '& .MuiGrid-item': {
                    marginRight: 27.42,
                    "@media screen and (max-width: 414px)": {
                        marginRight: 10
                    }
                }
            },
            "@media screen and (max-width: 765px)": {
                paddingBottom: 17,
            },
            '&.onlyTitleBar': {
                paddingBottom: 0,
                marginBottom: 31,
            }
        },
    },
    adjustC:
    {
        position: "absolute",
        // height:"80px",

        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid #ddd",
        borderRight: "1px solid #ddd",
        borderBottom: "1px solid #ddd",
        zIndex: "99",
        backgroundColor: "#fff"


    },
    grouping:
    {
        padding: "10px",
        textAlign: "center",
        borderBottom: "1px solid #ddd",
        zIndex: "9",
        cursor: "pointer",
        borderTop: "1px solid #ddd",

        '&:hover':
        {
            background: "linear-gradient(90deg, #FF0076 0%, #FF0054 23.8%, #FF4D2A 100%)",
            color: "#fff",
            zIndex: "9"
        }
    },
    grayGroup:
    {
        padding: "10px",
        textAlign: "center",
        borderBottom: "1px solid #ddd",
        zIndex: "9",
        cursor: "not-allowed",
        pointerEvents: "none",
        color: '#c4b3b3'
    },
    manualChild:
    {
        display: "flex",
        alignItems: "center",
        marginTop: "15px",
        [theme.breakpoints.down('xs')]: {
            display: "block",
            paddingBottom: 10,
            textAlign: 'center',
            '& button': {
                marginBottom: 10,
            }
        },
    },
    listValues:
    {
        fontSize: "20px", color: "red", fontWeight: "600"
    },
    campNameLi:
    {
        marginBottom: "8px"
    },
    inputCampDiv:
    {
        display: "flex", justifyContent: "space-between"
    },
    restoreBtn:
    {
        fontSize: "18px",
        color: "rgb(170, 170, 170)",
        cursor: "pointer",
        textDecoration: "underline"
    },
    selectedGroupsDiv: {
        display: "flex",
        alignItems: "center",
        color: "#fff",
        backgroundColor: "#ff3343",
        borderRadius: "20px",
        justifyContent: "center",
        padding: "5px",
        marginInlineStart: "5px",
        marginBottom: 5,
        paddingInline: 10,
        maxWidth: '95%'
    },
    reciFilterDiv:
    {
        height: 50,
        borderBottom: "1px solid black"
    },
    reciCheckoxContainer:
    {
        fontSize: 13,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        "@media screen and (max-width: 375px)": {
            marginBottom: 20
        }
    },
    bubbleReciDiv:
    {
        color: 'white',
        display: 'flex',
        padding: 6,
        alignItems: 'center',
        borderRadius: 25,
        marginTop: 4,
        backgroundColor: '#ff3343',
        marginInlineStart: 4,
        justifyContent: 'center',
        height: 20,
        fontSize: 14,
        paddingRight: isRTL ? 10 : 0,
        paddingLeft: !isRTL ? 10 : 0
    },
    nameGroup:
    {
        marginInlineEnd: "4px",
        maxWidth: '95%'
    },
    groupCloseicn:
    {
        color: "#fff",
        cursor: "pointer",
        alignItems: "center"
    },
    editorLink: {
        marginInlineEnd: "5px",
        cursor: "pointer"
    },
    addBtn:
    {
        marginInlineEnd: "3px",
        border: "2px solid #17a2b8",
        borderRadius: "50%",
        padding: "5px",
        width: "12px",
        height: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#17a2b8",
        fontSize: "19px",
        fontWeight: "700",
    },
    plusIcn:
    {
        marginBottom: "3px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    contactGroupDiv:
    {
        width: "100%",
        padding: "7px",
        paddingBottom: 6,
        borderBottom: "1px solid #d6d1e6",
        color: "#bbb",
        maxHeight: 75,
        overflow: 'auto',
        minHeight: 20,
        fontSize: 14
    },
    newIcn:
    {
        backgroundColor: "#dc3545",
        padding: 5,
        fontSize: 16,
        color: "#fff",
        borderRadius: 5,
        fontWeight: 400,
        marginInlineStart: "3px"
    },
    mappedGroup:
    {
        display: "flex",
        flexWrap: "wrap",
        // marginTop: "5px",
    },
    bubbleGroups:
    {
        width: "70px",
        padding: "6px",
        borderRadius: "20px",
        backgroundColor: "#ff3343",
        marginInlineEnd: "4px",
        marginBottom: "4px",
        color: "white",
    },
    phoneImg:
    {
        width: "100%",
        height: windowSize !== 'xs' ? "415px" : 'auto',
        borderBottom: "1px solid #ccc"
    },
    groupsFilterList:
    {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "calc(100% - 70px)",
        cursor: "pointer",
        "& span": {
            whiteSpace: 'nowrap'
        }
    },
    camapignsDiv:
    {
        display: "flex",
        justifyContent: "space-between",
        // alignItems: "center",
        flexDirection: "column",
        marginTop: "15px"
    },
    createGroupSpan:
    {
        color: "black",
        fontSize: "14px",
        fontWeight: "500"
    },
    createGroupSpanDisabled:
    {
        color: "#808080",
        fontSize: "14px",
        fontWeight: "500"
    },
    iconNew:
    {
        backgroundColor: "#CA332F",
        display: "flex",
        color: "#fff",
        padding: "5px",
        borderRadius: "5px",
        justifyContent: "space-between",
        alignItems: "center",
        margin: "0 5px",
        // marginTop: "15px"
    },
    pulseParentDiv:
    {
        height: "60px", borderBottom: "1px solid black"
    },
    pulseChildDiv:
    {
        fontSize: "16px",
        fontWeight: "700",
        marginTop: "10px",
        marginBottom: "10px",
    },
    topPulseDiv:
    {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "2px solid #efefef",
        paddingBottom: "30px",
        "@media screen and (max-width: 800px)": {
            flexDirection: 'column'
        },
        "@media screen and (max-width: 414px)": {
            alignItems: 'flex-start'
        }
    },
    noOfReci:
    {
        fontSize: 18,
        fontWeight: 400,
        marginTop: 15,
        marginBottom: 15,
        "@media screen and (max-width: 560px)": {
            fontSize: 14,
        }
    },
    inputFieldDiv:
    {
        display: "flex",
        alignItems: "flex-start",
        marginTop: "10px",
    },
    commonFieldPulse:
    {
        display: "flex",
        alignItems: "center",
        "@media screen and (max-width: 414px)": {
            fontSize: 12
        }
    },
    randomSendDiv:
    {
        fontSize: "16px",
        fontWeight: "700",
        marginTop: "10px",
        marginBottom: "10px",
    },
    randomRows: {
        "@media screen and (max-width: 375px)": {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            whiteSpace: 'nowrap'
        }
    },
    randomReciSpan:
    {
        fontSize: 18,
        fontWeight: 400,
        marginTop: 10,
        marginBottom: 10,
        "@media screen and (max-width: 560px)": {
            fontSize: 14,
        }
    },
    confirmDiv:
    {
        height: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    deleteModalDiv:
    {
        height: "60px", borderBottom: "1px solid #DEE2E7"
    },
    subDeleteDiv:
    {
        fontSize: "22px",
        marginTop: "5px"
    },
    numberChnageModal:
    {
        height: "60px",
        borderBottom: "1px solid #DEE2E7"
    },

    creatorButtons:
    {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        position: "relative",
        bottom: "10px",
        "@media screen and (max-width: 768px)": {
            display: "block"
        },
    },
    rightMostContainer:
    {
        display: "flex",
        justifyContent: 'flex-end',
        flexDirection: 'row',
        width: '100%',
        "@media screen and (max-width: 768px)": {
            flexDirection: 'column-reverse',
        }
    },
    mobileGrid: {
        padding: "0px 10px !important",
        margin: "0px !important"
    },
    report: {
        maxWidth: 1920
    },
    italic: {
        fontStyle: 'italic'
    },
    ellipsisText: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    radioButtonActive:
    {
        color: "#007bff"
    },
    radioButtonDisabled:
    {
        color: "#d3d3d3"
    },
    grDoc:
    {
        border: "1px solid #ff3343",
        color: "#ff3343",
        borderRadius: "50%",
        padding: "10px",
        display: "flex"
    }, verificationBoxSMS:
    {
        borderBottom: "1px solid #dee2e6",
        padding: "4px"
    },
    verificationBodySMS:
    {
        marginTop: "15px",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        textAlign: "center"
    },
    fontSmsRegulations:
    {
        fontSize: "18px"
    },
    OtpPhoneNumberInput:
    {
        border: "1px solid #bbb",
        borderRadius: "5px",
        marginTop: "30px",
        width: "200px",
        alignContent: "center",
        marginBottom: "30px",
        padding: "5px",
        '& input': {
            textAlign: 'center',
            fontSize: 20
        }
    },
    OtpPhoneNumberConfirm:
    {
        border: "1px solid #bbb",
        borderRadius: "5px",
        marginTop: "30px",
        width: "300px",
        textAlign: "center",
        padding: "5px",
        "&::placeholder":
        {
            textAlign: "center"
        }
    },
    OtpPhoneNumberConfirmSuccess:
    {
        border: "1px solid #bbb",
        borderRadius: "5px",
        marginTop: "30px",
        width: "300px",
        textAlign: "center",
        padding: "5px",
        marginBottom: "30px",
        "&::placeholder":
        {
            textAlign: "center"
        }
    },
    otpContactUs:
    {
        marginTop: "30px", fontSize: "14px"
    },
    tabsSwitcher:
    {
        width: "100%",
        "@media screen and (max-width: 768px)": {
            width: "320px"
        },
    },
    groupsFooter: {
        marginTop: 12,
        display: "flex",
        justifyContent: "space-between",
        flexDirection: flexDirection[windowSize],
        [theme.breakpoints.down('xs')]: {
            paddingBottom: 20
        },
    },
    createGroupContainer:
    {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "@media screen and (max-width: 414px)": {
            "& $bodyInfo": {
                width: 23
            }
            // display: "none"
        },
    },
    addOptionsIcon:
    {
        fontSize: "18px", color: "#fff", marginInlineEnd: "10px"
    },
    testSendContaier:
    {
        display: "flex", flexDirection: "column", width: "250px"
    },
    testSendDescriptionLabel:
    {
        width: "200px",
        fontSize: "15px",
        marginTop: "5px",
        color: "#B5B5B5",
    },
    quickSendContainer:
    {
        display: "flex", flexDirection: "column", width: '100%',
        mobilePreviewContainer: {
            "@media screen and (max-width: 768px)": {
                marginTop: 25
            }
        }
    },
    manualHeader: {
        border: "1px solid #ddd",
        padding: "10px",
        width: "160px",
        maxWidth: "280px",
    },
    editClientIframe: {
        minWidth: clientIframeSize[windowSize],
        minHeight: 610,
        border: 'none'
    },
    breakSpaces: {
        textAlign: 'center',
        width: 'min-content',
        whiteSpace: 'pre-line',
        marginLeft: 'auto',
        marginRight: 'auto',
        fontSize: 12
    },
    filterButtonsContainer: {
        [theme.breakpoints.down('xs')]: {
            paddingBottom: 10
        },
        // paddingBottom: 5,
        '& *:not(svg):not(span)': {
            marginInlineEnd: 5
        },
        '& .MuiButton-root': {
            minWidth: 50
        },
        '& div.MuiInput-formControl': {
            paddingInline: '0 !important',
        },
        '& .MuiButton-text': {
            paddingInline: 10
        },
        "@media screen and (max-width: 480px)": {
            marginInline: 10,
        },
        '& .MuiInputBase-formControl': {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingInline: 10,

            '& .MuiSelect-selectMenu': {
                paddingInline: 14
            },
            '& .MuiSelect-icon': {
                left: !isRTL ? 'auto' : 0,
                right: isRTL ? 'auto' : 0
            }
        }
    },
    twoLineButton: {
        borderColor: '#ff3343',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: 'transparent'
        },
        '& label, & span': {
            fontSize: 16,
            cursor: 'pointer',
            color: '#ff3343',
            lineHeight: 1.5,
            textTransform: 'capitalize',
            fontWeight: 400
        }
    },
    buttonActiveGreen: {
        borderColor: '#1c82b2',
        backgroundColor: '#1c82b2',
        '&:hover': {
            borderColor: '#1c82b2',
            backgroundColor: '#1c82b2',
        },
        '& label, & span': {
            fontSize: 16,
            cursor: 'pointer',
            color: '#fff',
            lineHeight: 1.5,
            textTransform: 'capitalize',
            fontWeight: 400
        }
    },
    buttonActiveRed: {
        borderColor: '#ff2747',
        backgroundColor: '#ff2747',
        '&:hover': {
            borderColor: '#ff2747',
            backgroundColor: '#ff2747',
        },
        '& label, & span': {
            fontSize: 16,
            cursor: 'pointer',
            color: '#fff',
            lineHeight: 1.5,
            textTransform: 'capitalize',
            fontWeight: 400
        }
    },
    customWidth: {
        maxWidth: 250,
        backgroundColor: "black",
        fontSize: "14px",
        textAlign: 'center',
        direction: isRTL ? 'rtl' : 'ltr'
    },
    noMaxWidth: {
        maxWidth: "none",
    },
    snackBarSuccess:
    {
        backgroundColor: "#AFE1AF",
        color: "black",
        minWidth: "200px",
        height: "30px",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        fontWeight: 700
    },
    snackBarSevere: {
        backgroundColor: "#F6B2B2",
        color: "black",
        minWidth: "200px",
        height: "30px",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: 'center',
        fontWeight: 700,
        boxShadow: '1px ​1px 10px 2px black'
    },
    expandTextLink: {
        textDecoration: 'underline',
        marginTop: "6px",
        fontSize: "16px",
        color: "gray",
        width: "50px",
        cursor: "pointer"
    },
    summaryExpandRecipientFilter: {
        borderTop: '1px solid #ccc',
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    }

});