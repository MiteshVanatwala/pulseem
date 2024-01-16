const iconWidth = {
  xs: 20,
  sm: 20,
  md: 25,
  lg: 25,
  xl: 25,
};

const flex12 = {
  xs: 5,
  sm: 5,
  md: 7,
  lg: 6,
  xl: 6,
};
const blue = "#0371AD";

const iconPadding = {
  xs: "0.5rem 0.8rem 0.5em",
  sm: "0.8rem 1.1rem 0.2rem",
  md: "0.8rem 1.1rem 0.2rem",
  lg: "0.8rem 1.1rem 0.2rem",
  xl: "0.8rem 1.1rem 0.2rem",
};

const barHeight = {
  sm: "",
  md: "220px!important",
  lg: "230px!important",
  xl: "230px!important",
};

const tipsFontSize = {
  xs: 13,
  sm: 13,
  md: 11,
  lg: 13,
  xl: 13,
};

const shortcutFontSize = {
  category: {
    xs: 15,
    sm: 14,
    md: 15,
    lg: 15,
    xl: 15,
  },
  page: {
    xs: 15,
    sm: 14,
    md: 15,
    lg: 15,
    xl: 15,
  },
};

export const getManagmentStyle = (windowSize, isRTL, theme) => ({
  management: {
    maxWidth: 1500,
    '&.MuiContainer-root': {
      marginLeft: 207
    },
    '& .topSection': {
      marginTop: 37.870,
      border: '2px solid #F0F5FF',
      borderRadius: 10,
      paddingBottom: 31,
      '& .searchLine': {
        paddingLeft: 31
      },
      "@media screen and (max-width: 765px)": {
        paddingBottom: 17,
      },
      '&.onlyTitleBar': {
        paddingBottom: 0,
        marginBottom: 31,
      }
    }
  },
  managmentNarrow: {
    maxWidth: 1050,
  },
  mgmtTitleContainer: {
    width: 'auto !important',
    background: '#F0F5FF',
    padding: 15,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    "@media screen and (max-width: 475px)": {
      padding: 10,
    }
  },
  managementTitle: {
    fontSize: 20,
    fontFamily: "Assistant",
    whiteSpace: windowSize === "xs" ? "break-spaces" : null,
    fontWeight: 600,
    // color: '#4D4D4D',
    color: '#000',
    width: '100%',
    "@media screen and (max-width: 475px)": {
      maxWidth: '100%'
    }
  },
  tableRow: {
    marginBox: 20,
  },
  tableCellHead: {
    fontFamily: 'Assistant',
    fontWeight: 'bold',
    fontSize: 18,
    marginBlock: 0,
    borderBottom: 0,
    padding: "16px 10px!important",
  },
  tableCellBody: {
    borderInlineEnd: "2px solid #F0F5FF",
    marginBlock: 10,
    borderBottom: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  borderRight: {
    marginBlock: 20,
    borderBottom: 0,
    borderInlineEnd: "1px solid #797979",
  },
  flex: {
    display: "flex",
  },
  flexWrap: {
    flexWrap: 'wrap'
  },
  flexRow: {
    flexDirection: "row",
  },
  flexColumn: {
    flexDirection: "column",
  },
  minWidth75: {
    minWidth: "75px!important",
  },
  minWidth50: {
    minWidth: "50px!important",
  },
  maxWidth75: {
    maxWidth: "75px!important",
  },
  maxWidth275: {
    maxWidth: '275px !important'
  },
  maxWidth325: {
    maxWidth: '300px !important'
  },
  maxWidth450: {
    maxWidth: '450px !important'
  },
  maxWidth500: {
    maxWidth: '500px !important'
  },

  wFitContent: {
    width: 'fit-content'
  },
  paddingRightLeft10: {
    padding: "0 10px!important",
  },
  paddingHead: {
    padding: "20px 10px",
  },
  tableCellBodyNoBorder: {
    marginBlock: 20,
    borderBottom: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  tableCellRoot: {
    display: "flex",
    flexDirection: "column",
    minWidth: 50,
    padding: 10,
  },
  tableRowRoot: {
    display: "flex",
    justifyContent: "center",
    border: 'none',
    // borderBottom: "1px solid #797979",
    "&:last-child": {
      borderBottom: 0,
    },
    "&:nth-of-type(even)": {
      backgroundColor: "#f7faff",
    },
    "&.directEmailRow": {
      "&:nth-of-type(4n+3)": {
        backgroundColor: "#E3E9F0",
      },
    },
  },
  tableRowHead: {
    backgroundColor: "#E3E9F0",
    borderColor: "transparent",
  },
  tableCollapseHead: {
    fontWeight: "bold",
    borderBottom: "unset",
    fontSize: 16,
    // paddingBottom: 0,
  },
  tableRowCollapse: {
    "&.directEmailRowCollapse": {
      "&:nth-of-type(4n+4)": {
        backgroundColor: "#E3E9F0",
      },
    },
  },

  noBorderTableHead: {
    backgroundColor: "#ffffff",
  },

  cellExpand: {
    width: 30,
    padding: "8px 0px",
    borderBottom: "unset",
    display: "flex",
    alignItems: "center",
  },
  tableRowReportHead: {
    backgroundColor: "#F0F5FF",
    borderColor: "transparent",
  },

  whiteSpaceNoWrap: {
    whiteSpace: "nowrap",
  },

  middleText: {
    fontSize: windowSize === "xs" ? 15 : 18,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "#333",
    "@media screen and (max-width: 1366px)": {
      fontSize: 16,
    },
  },
  middleTxt: {
    fontSize: 18,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "#333",
    lineHeight: 1.1,
    "@media screen and (max-width: 1366px)": {
      fontSize: 16,
    },
  },
  middleWrapText: {
    fontSize: 18,
    overflow: "hidden",
    color: "#333",
    "@media screen and (min-width: 599px) and (max-width: 1280px)": {
      paddingLeft: 5,
      paddingRight: 5,
    },
    "@media screen and (max-width: 1366px)": {
      fontSize: 15,
    },
    "@media screen and (min-width: 600px) and (max-width: 1240px)": {
      fontSize: 13,
    },
    "@media screen and (min-width: 600px) and (max-width: 1100px)": {
      fontSize: 11,
    },
  },
  wrapText: {
    fontSize: 16,
    flexWrap: "wrap",
    textOverflow: "ellipsis",
    "@media screen and (min-width: 600px) and (max-width: 1366px)": {
      fontSize: 15,
    },
    "@media screen and (min-width: 600px) and (max-width: 1240px)": {
      fontSize: 13,
    },
    "@media screen and (min-width: 600px) and (max-width: 1100px)": {
      fontSize: 11,
    },
  },
  errorText: {
    color: "red !important",
  },
  paddingIcon: {
    padding: "0.8rem 0rem 0.2rem!important",
  },
  minWidth95: {
    minWidth: 95,
    padding: "0.8rem 0px!important",
  },
  managmentIconHide: {
    opacity: 0,
  },
  managmentIconContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    textDecoration: "none",
    width: "100%",
    padding: iconPadding[windowSize],
    color: "#333",
    "@media screen and (max-width: 768px) and (min-width: 480px)": {
      padding: 0,
    },
    '& .rowIcon': {
      alignSelf: 'center',
      padding: 2
    }
  },
  managmentIcon: {
    width: iconWidth[windowSize],
    margin: "auto",
  },
  iconWhite: {
    "& path": {
      stroke: "#fff",
    },
  },
  managmentUicon: {
    fontSize: 30,
    fontFamily: "pulseemicons",
    marginBottom: -15,
    marginTop: -15,
  },
  managmentIconDisable: {
    opacity: 0.5,
    // pointerEvents: "none",
    cursor: 'not-allowed'
  },
  managmentIconText: {
    textAlign: "center",
    alignSelf: "center",
    textTransform: "none",
    marginTop: 2,
    fontSize: windowSize === "xs" && 15,
  },
  sendIcon: {
    border: "1px solid #FF3343",
    borderRadius: 5,
    background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
    // paddingTop: 5,
    paddingBottom: 10,
    '& rowIconContainer div div': {
      background: 'transparent'
    },
    '& .rowIcon': {
      verticalAlign: 'middle',
      paddingTop: 10,
      paddingBottom: 5,
    },
    '& *': {
      color: '#fff !important',
      fill: '#fff'
    },
    '&:hover': {
      background: '#fff',
      '& *': {
        color: '#FF3343 !important',
        fill: '#FF3343'
      }
    }
  },
  sendIconText: {
    color: "#27AE60",
  },
  recipientsStatus: {
    fontSize: 18,
    color: "black",
  },
  statusStopped: {
    fontWeight: 700,
    color: "#E74C3C",
  },
  statusFailed: {
    fontWeight: 700,
    color: "#E74C3C",
  },
  statusCreated: {
    fontWeight: 700,
    color: "#0371AD",
  },
  statusDeleted: {
    fontWeight: 700,
    color: "#E74C3C",
  },
  statusSending: {
    fontWeight: 700,
    color: "#F59A23",
  },
  statusSent: {
    fontWeight: 700,
    color: "#27AE60",
  },
  statusPending: {
    fontWeight: 700,
    color: "#F59A23",
  },
  statusScheduled: {
    fontWeight: 700,
    color: "#F59A23",
  },
  recipientsStatusCreated: {
    color: "#0371AD",
    fontWeight: 700,
  },
  recipientsStatusSent: {
    color: "#27AE60",
    fontWeight: 700,
  },
  recipientsStatusSending: {
    color: "#F59A23",
    fontWeight: 700,
  },
  recipientsStatusCanceled: {
    color: "#E74C3C",
    fontWeight: 700,
  },
  recipientsStatusStopped: {
    color: "#E74C3C",
    fontWeight: 700,
  },
  textColorRed: {
    color: "#E74C3C",
  },
  actionButtonLightGreen: {
    backgroundColor: "#27AE60",
    // marginInlineEnd: '10px',
    "&:hover": {
      color: "#fff",
      backgroundColor: "#219150",
    },
  },
  actionButtonArchive: {
    textTransform: "capitalize",
    fontSize: 18,
    marginInline: 10,
    paddingBlock: 4,
    color: "#fff",
    fontWeight: 400,
  },
  textColorBlue: {
    color: "#3498DB",
  },
  textColorGrey: {
    color: "#959595",
  },
  actionButtonLightBlue: {
    backgroundColor: "#3498DB",
    // marginInlineEnd: '10px',
    "&:hover": {
      backgroundColor: "#3498DB",
    },
  },
  actionButtonDarkBlue: {
    backgroundColor: "#5088b5",
    "&:hover": {
      color: "#fff",
      backgroundColor: "#4477a2",
    },
  },
  actionButtonGreen: {
    backgroundColor: "#217346",
    "&:hover": {
      backgroundColor: "#1d633c",
    },
  },
  actionButtonRed: {
    backgroundColor: "#c9302c",
    "&:hover": {
      backgroundColor: "#ae2a27",
    },
  },

  addGroupTextField: {
    textTransform: "capitalize",
    "& .MuiOutlinedInput-input": {
      width: 220,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#a6a6a6",
    },
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": {
        borderColor: "#797979",
      },
      "&.Mui-focused fieldset": {
        border: "1px solid #797979",
      },
    },
  },

  // actionButtonOutlinedRed: {
  //   backgroundColor: '#fff',
  //   border: '1px solid #c9302c',
  //   color: '#c9302c',
  //   '&:hover': {
  //     backgroundColor: '#c9302c',
  //     color: '#fff'
  //   }
  // },
  // actionButtonOutlinedBlue: {
  //   backgroundColor: '#fff',
  //   border: '1px solid #3498DB',
  //   color: '#3498DB',
  //   '&:hover': {
  //     backgroundColor: '#3498DB',
  //     color: '#fff'
  //   }
  // },
  textField: {
    width: 180,
    textTransform: "capitalize",
    "& .MuiInputBase-root": {
      fontSize: 18,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#a6a6a6",
    },
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": {
        borderColor: "#797979",
      },
      "&.Mui-focused fieldset": {
        border: "1px solid #797979",
      },
    },
  },
  NoPaddingtextField: {
    '& .MuiInputBase-input':
    {
      height: 35,
      paddingInline: 10,
      paddingBottom: 3,
      paddingTop: 3,
      "@media screen and (max-width: 768px)": {
        height: 20,
      },
    }
  },
  selectField: {
    width: 180,
    "& .MuiSelect-root": {
      fontSize: 18,
      padding: "12px 30px",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#a6a6a6",
    },
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": {
        borderColor: "#797979",
      },
      "&.Mui-focused fieldset": {
        border: "1px solid #797979",
      },
    },
  },
  textFieldPlaceholder: {
    "& .MuiInputBase-root": {
      color: "rgba(0,0,0,0.40)",
    },
  },
  actionButton: {
    height: 35,
    display: 'inline-Block'
  },
  selectPlaceholder: {
    height: 0,
    padding: 0,
  },
  underlinedSelOptns: {
    paddingBlock: 5,
    marginInline: 12,
    borderBottom: '1px solid #d1d1d1',
    '&:hover': {
      cursor: 'pointer',
      color: '#ff3343'
    }
  },

  tableStyle: {
    overflowX: "clip",
    border: "2px solid #F0F5FF",
    borderRadius: 20
  },
  tableContainer: {
    width: "100%",
    background: '#fff',
    '& .MuiTableHead-root': {
      '& .MuiTableRow-root': {
        borderColor: 'transparent',
        backgroundColor: '#F0F5FF',
      }
    },
    '& .tableBodyContainer': {
      display: 'grid',
      // padding: '0 17px 32.8px 17px',
      '&.newsLetterReportTable': {
        '& .MuiTableBody-root': {
          '& .MuiTableCell-root': {
            flexWrap: 'wrap',
            '& .MuiGrid-container': {
              flexWrap: 'wrap'
            },
            '&:nth-Child(4)': {
              '& .MuiGrid-item': {
                '& .MuiBox-root': {
                  "@media screen and (max-width: 1420px)": {
                    paddingInline: 5
                  }
                }
              }
            },
            '&:nth-Child(5)': {
              '& .MuiGrid-item': {
                '& .MuiBox-root': {
                  "@media screen and (max-width: 1420px)": {
                    paddingInline: 5
                  }
                }
              }
            },
            '&:nth-Child(6)': {
              '& .MuiGrid-item': {
                '& .MuiBox-root': {
                  "@media screen and (max-width: 1420px)": {
                    paddingInline: 5
                  }
                }
              }
            },
          }
        }
      },
      '&.groupsTable': {
        '& .MuiTableBody-root': {
          '& .MuiTableCell-root': {
            '& .MuiGrid-grid-lg-3': {
              "@media screen and (max-width: 1420px)": {
                minWidth: '50%'
              }
            }
          }
        }
      },
    },
    '& .MuiTableCell-head': {
      fontWeight: 'bold',
      fontSize: 18
    },
    '& .MuiTableBody-root': {
      '& .MuiTableRow-root': {
        borderBottom: '1px solid #F0F5FF',
        '&:nth-child(even)': {
          '& .rowIconContainer': {
            '& div': {
              '& div': {
                background: '#fff',
              }
            },
            '& .sendIcon': {
              '& div': {
                background: 'transparent !important'
              }
            }
          }
        },
        '&:nth-child(odd)': {
          '& .rowIconContainer': {
            '& div': {
              '& div': {
                background: '#F0F5FF',
              }
            },
            '& .sendIcon': {
              '& div': {
                background: 'transparent !important'
              }
            }
          }
        },
        '& .MuiTableCell-root:last-child': {
          borderRight: 'none',
        },
        '& .rowTitle': {
          textAlign: 'center',
          alignItems: 'flex-start',
          "@media screen and (max-width: 768px)": {
            textAlign: 'start'
          },
        },
        '& .MuiTableCell-root': {

          marginTop: 0,
          marginBottom: 0,

          '& .rowIconContainer': {
            '& div': {
              '& div': {
                width: 25,
                height: 25,
                alignSelf: 'center',
                borderRadius: 20,
                padding: 4,
              }
            }
          },
          '& *.MuiTypography-root': {
            fontSize: 16,
          }
        }
      }
    }
  },
  flex2: {
    flex: 2,
  },
  flex3: {
    flex: 3,
    flexBasis: '1%',
    maxWidth: 450
  },
  flex4: {
    flex: 4,
    borderBottom: 0,
  },
  flex6: {
    flex: 6,
    borderBottom: 0,
  },
  flex7: {
    flex: 7,
  },
  flex15: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  flexHalf: {
    flex: 0.5,
  },
  flex5: {
    flex: 5,
    borderBottom: 0,
    justifyContent: "center",
  },
  flex12: {
    flex: flex12[windowSize] || 5,
    borderBottom: 0,
    justifyContent: "center",
  },
  cellIconsContainer: {
    justifyContent: windowSize === "xs" ? "flex-start" : "flex-end",
  },
  datePickerInput: {
    paddingBlock: 10,
  },
  datePickerButton: {
    right: isRTL ? 10 : -10,
    padding: 10,
  },
  groupsLableContainer: {
    justifyContent: windowSize === "xs" ? "start" : "flex-end",
    display: "flex",
    flex: 1,
  },
  groupsLable: {
    alignSelf: "center",
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#E3E9F0",
    color: "#333",
    paddingInline: 25,
    textTransform: "none",
    borderRadius: 6,
  },
  tablePaginationSelect: {
    '& svg': {
      color: '#F65026',
      marginLeft: -30,
      fontSize: 20,
      top: 5,
    },
    '& .MuiSelect-select': {
      '&:focus': {
        background: 'transparent'
      }
    },
    color: "#000",
    marginInlineStart: 15,
  },
  tablePadingtonSelect: {
    "& .MuiSelect-root": {
      padding: 0,
      paddingBlock: 2,
      paddingInline: 15,
      marginInlineStart: 10,
    },
    "& .MuiSelect-icon": {
      color: "#000",
      top: 0,
      marginInlineEnd: -5,
    },
    "& .MuiInput-underline": {
      "&:before": {
        borderBottom: 0,
      },
      "&:hover:not(.Mui-disabled):before": {
        borderBottom: 0,
      },
      "&:after": {
        borderBottom: 0,
      },
    },
  },
  tablePadingtonTextFeild: {
    marginInline: 10,
    width: 30,
    "& .MuiInputBase-root": {
      fontSize: 14,
      padding: 0,
      height: 30
    },
    "& .MuiOutlinedInput": {
      "&-input": {
        padding: 0,
        textAlign: "center",
        alignSelf: "center",
        "&[type=number]": {
          "-moz-appearance": "textfield",
        },
        "&::-webkit-outer-spin-button": {
          "-webkit-appearance": "none",
          margin: 0,
        },
        "&::-webkit-inner-spin-button": {
          "-webkit-appearance": "none",
          margin: 0,
        },
      },
      "&-inputMarginDense": {
        paddingTop: 0,
        paddingBottom: 0,
      },
      "&-notchedOutline": {
        borderColor: "#a6a6a6",
      },
      "&-root": {
        '& fieldset': {
          border: 'none',
        },
        "&:hover fieldset": {
          border: 'none',
        },
        "&.Mui-focused fieldset": {
          border: 'none',
        },
      },
    },
  },
  tablePadingtonArrow: {
    transform: isRTL ? "rotateY(0deg)" : "rotateY(180deg)",
    marginInlineStart: isRTL ? 0 : 10,
    padding: 10,
    color: '#F65026'
  },
  tablePadingtonArrowOppisite: {
    transform: isRTL ? "rotateY(180deg)" : "rotateY(0deg)",
    marginInlineEnd: 10,
    padding: 10,
    color: '#F65026'
  },
  tablePadingtonGridItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    // marginBottom: 50
  },
  tablePadingtonGridContainer: {
    paddingBlock: 10,
    '& input': {
      background: '#fff',
      height: 30,
      borderRadius: 5
    }
  },
  selectHideDefaultCaretIcon: {
    '& .arrow': {
      display: 'initial !important',
      '& .MuiSvgIcon-root': {
        display: 'none',
      }
    }
  },
  phoneSearchBar: {
    border: "1px solid #797979",
    borderRadius: "50px",
    overflow: "hidden",
    marginTop: "1rem",
    paddingInlineStart: 10,
    "&:before": {
      borderBottom: 0,
    },
    "&:hover:not(.Mui-disabled):before": {
      borderBottom: 0,
    },
    "&:after": {
      borderBottom: 0,
    },
  },
  phoneSearchBarRoot: {
    zIndex: 0,
  },
  phoneSearchBarIcon: {
    marginRight: isRTL ? 0 : -8,
    marginLeft: isRTL ? -8 : 0,
    backgroundColor: "#E3E9F0",
    padding: 10,
    "&:hover": {
      backgroundColor: "#dee5ed",
    },
  },
  linePadding: {
    paddingBlock: "25px",
    margin: '0px !important'
  },
  responsiveLinePadding: {
    paddingBlock: "1rem",
    "@media screen and (max-width: 768px)": {
      paddingBlock: 0
    },
  },
  lineTopMarging: {
    marginTop: "2rem",
  },

  customDialog: {
    "& .MuiDialog-paperScrollPaper": {
      padding: 20,
    },
  },
  customDialogInnerbox: {
    padding: 10,
    border: "2px #0371ad solid",
    width: "500px",
  },
  customDialogIconBox: {
    top: 0,
    left: 0,
    padding: 10,
    background: "#0371ad",
    borderRadius: "0% 0% 100% 0% / 0% 0% 100% 0%",
    maxWidth: "max-content",
    overflow: "overlay",
    color: "#fff",
    position: "absolute",
  },
  customDialogTitle: {
    marginLeft: 30,
    "& h2": { fontSize: 35 },
  },
  customDialogContentBox: {
    display: "flex",
    justifyContent: "space-around",
    "& *": {
      alignSelf: "center",
    },
    "& .MuiTextField-root": {
      // paddingRight: 0,
      "& .MuiOutlinedInput-root ": {
        padding: 0,
        "& .MuiOutlinedInput-input": {
          padding: 5,
        },
      },
    },
  },

  restoreDialogCheckBoxLable: {
    "& .MuiFormControlLabel-label": {
      fontWeight: "bold",
    },
    [theme.breakpoints.down('xs')]: {
      paddingBottom: 10,
    },
  },
  groupsTable: {
    border: "1px solid #ccc",
  },
  groupsTableHead: {
    padding: 0,
    background: "#ccc",
  },
  gruopsDialogText: {
    fontSize: 16,
  },
  gruopsDialogContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    width: 400,
    overflow: "auto",
    marginBlock: 10,
  },
  gruopsDialogButton: {
    alignSelf: "center",
    fontFamily: "OpenSansHebrew",
    textTransform: "capitalize",
    width: 400,
    fontSize: '0.875rem',
  },
  gruopsDialogBullet: {
    fontSize: 8,
    marginInlineEnd: 10,
  },
  restoreDialogCheckBox: {
    padding: 0,
    marginInlineStart: 10,
    marginInlineEnd: 5,
  },

  restorDialogContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    height: 300,
    width: 600,
    border: '2px solid #d9d9d9',
    padding: 15,
    overflowY: "auto",
    marginBlock: 10,
    [theme.breakpoints.down('xs')]: {
      width: 'initial',
    },
  },
  grayTextCell: {
    WebkitLineClamp: 1,
    color: "#7F7F7F",
    "@media screen and (max-width: 1366px)": {
      fontSize: 14,
    },
  },
  fontBold: {
    fontWeight: 700,
  },
  cardMedia: {
    height: "200px",
  },
  cardIcon: {
    width: "100px",
    height: "100%",
    minHeight: 85,
    backgroundSize: "contain",
  },
  searchWhite: {
    transform: "scale(1.5)",
    padding: 10,
    "& path": {
      fill: "white",
    },
  },
  confirmButton: {
    alignSelf: "center",
    fontFamily: "OpenSansHebrew",
    color: "#fff",
    textTransform: "capitalize",
    width: 167,
    fontSize: 16,
    borderRadius: 100,
  },
  formControl: {
    "&.MuiFormControl-root": {
      borderBottom: "1px solid #d6d1e6",
      "&:hover": {
        borderBottom: "1px solid #000"
      }
    },
    "& .MuiInputLabel-formControl": {
      top: -7,
    }
  },
  formControlSelect: {
    "& .MuiSelect-outlined.MuiSelect-outlined": {
      padding: "12px 32px",
    },
    "& .MuiSvgIcon-root.MuiSelect-icon.MuiSelect-iconOutlined": {
      left: !isRTL ? "auto !important" : "10px !important",
      right: !isRTL ? "10px !important" : "auto !important",
    },
  },
  dialogBox: {
    padding: 20,
  },
  directoryField: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 400,
  },
  radioGroup: {
    padding: "0 10px",
  },
  copyIcon: {
    fontFamily: "pulseemicons",
    fontSize: 10,
    padding: "0 5px",
  },
  avatarIcon: {
    fontFamily: "pulseemicons",
    color: "#fff",
    fontSize: 20,
  },
  checkIcon: {
    backgroundColor: "green",
    width: 14,
    height: 14,
  },
  redIcon: {
    backgroundColor: "darkred",
    width: 14,
    height: 14,
  },
  newLine: {
    whiteSpace: "pre-line",
  },
  contactUs: {
    fontSize: 12,
    marginTop: 20,
  },
  verifyLink: {
    paddingInlineStart: 5,
    fontSize: 12,
    textDecoration: "underline",
    cursor: "pointer",
    color: "#000",
    "&:hover": {
      color: "darkred",
    },
  },
  textEllipses: {
    whiteSpace: "nowrap",
    overflowX: "clip",
    textOverflow: "ellipsis",
  },
  nameEllipsis: {
    fontSize: 18,
    fontWeight: 700,
    color: "#333333",
    fontFamily: "Assistant",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "100%",
    maxWidth: 250,
    "@media screen and (max-width: 1366px)": {
      fontSize: 16,
    },
  },
  p10: {
    padding: 10,
  },
  p15: {
    padding: 15,
  },
  emptyImageLabel: {
    textAlign: "center",
    alignSelf: "center",
    textTransform: "none",
    fontWeight: 500,
  },
  mt_10: {
    marginTop: -10,
  },
  pictureIcon: {
    fontFamily: "pulseemicons",
    color: "#000",
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
  },
  f80: {
    fontSize: 80,
  },
  boxShadow: {
    boxShadow: "0px 5px 10px #888888",
  },
  chooseImageBtn: {
    width: "100%",
    padding: 0,
  },
  pictureBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "100px",
    height: "75px",
    padding: 0,
    border: "1px dashed #64a1bd!important",
  },
  pictureBoxBig: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "99%",
    minHeight: 200,
    padding: 0,
    border: "1px dashed #64a1bd!important",
    margin: "auto",
  },
  previewCardContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    minHeight: 115,
  },
  previewLabel: {
    background: "#a9a9a9",
    color: "white",
    margin: 5,
    padding: 5,
  },
  w100: {
    width: "100%",
  },
  scriptCode: {
    background: '#1e1b1b',
    color: '#ff9467',
    padding: 10,
    fontSize: 12,
    wordBreak: "break-all",
    overflow: "auto",
    borderRadius: 10
  },
  verificationTitle: {
    fontWeight: "bold",
    fontSize: 25,
  },
  green: {
    color: "#48a148",
  },
  white: {
    color: "white",
  },
  red: {
    color: "red!important",
  },
  verifySuccessIcon: {
    fontFamily: "pulseemicons",
    fontWeight: "bold",
    fontSize: 90,
    color: "#48a148",
  },
  borderRed: {
    borderColor: "red!important",
  },
  minWidth252: {
    minWidth: "150px!important",
  },
  minWidth192: {
    minWidth: "192px!important",
  },
  dropDownItem: {
    display: "flex",
    justifyContent: "center",
    maxHeight: 40,
  },
  verifyButton: {
    background: "green",
    textTransform: "capitalize",
    color: "white",
    "&:hover": {
      background: "darkgreen",
    },
  },
  verifyField: {
    "& .MuiOutlinedInput-input": {
      fontSize: 20,
    },
  },
  myGroupsTitleSection: {
    display: "flex",
    flexDirection: "row",
    paddingBottom: 0
  },
  languageSelect: {
    textTransform: "capitalize",
    color: "white",
    padding: 10,
    fontSize: 18,
    fontFamily: "OpenSansHebrew",
  },
  disabledCursor: {
    cursor: "not-allowed",
  },
  pointerShow: {
    "&.MuiButtonBase-root.Mui-disabled": {
      pointerEvents: "visible",
    },
  },
  exportButton: {
    color: "white",
    fontWeight: 400,
    paddingBlock: 4,
    textTransform: "capitalize",
  },
  reportPaperBgGray: {
    backgroundColor: "rgba(242, 242, 242, 1)",
    padding: 10,
    borderRadius: 0,
    border: "1px solid #ccc",
  },
  numberBox: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  phoneNumberList: {
    padding: 0,
    overflow: "auto",
    height: "calc(100vh - 500px)",
  },
  margin0: {
    margin: 0,
  },
  padding0: {
    padding: 0,
  },
  minWidth25: {
    minWidth: 25,
  },
  minWidth150: {
    minWidth: 150,
  },
  boldSize25: {
    fontWeight: "bold",
    fontSize: 25,
  },
  pt20: {
    paddingTop: 20,
  },
  link: {
    fontSize: 16,
    textDecoration: 'underline',
    margin: '0 5px',
    cursor: 'pointer',
    textUnderlineOffset: '4px',
    "&:hover": {
      textDecoration: 'none',
    }
  },
  popperPaper: {
    padding: "5px 0",
    width: 300,
    background: "#D7D7D7",
  },
  hideIndicator: {
    background: "none",
  },
  pageTitle: {
    fontSize: shortcutFontSize.page[windowSize],
    lineHeight: 1,
    color: '#FF0054',
    textDecoration: 'none',
    paddingInlineEnd:30,
    paddingInlineStart: 16
  },
  categoryLabel: {
    fontSize: shortcutFontSize.category[windowSize],
    lineHeight: 1
  },
  carouselPaper: {
    borderRadius: 10,
  },
  carouselChart: {
    "& .carousel-root": {
      width: "100%",
    },
    position: "relative",
    "& .control-arrow": {
      color: "#000 !important"
    },
    '& .carousel .control-next.control-arrow:before': {
      borderLeft: '15px solid #000',
    },
    '& .carousel .control-arrow:before, .carousel.carousel-slider .control-arrow:before': {
      margin: '0px 10px',
      borderTop: '15px solid transparent',
      borderBottom: '15px solid transparent'
    },
    '& .carousel.carousel-slider .control-arrow:before': {
      margin: '0px 10px',
      borderTop: '15px solid transparent',
      borderBottom: '15px solid transparent'
    },
    '& .carousel .control-prev.control-arrow:before': {
      borderRight: '15px solid #000'
    },
  },
  carouselArrows: {
    display: 'none',
  },
  carouselTipsArrows: {
    display: "flex",
    justifyContent: "space-between",
    width: "80%",
    position: "absolute",
    top: "calc(72% - 24px)",
    zIndex: 1,
  },
  carouselTips: {
    position: "relative",
    '& .control-dots': {
      bottom: 5
    },
    "& .control-dots .dot": {
      width: "18px!important",
      boxShadow: "unset!important",
      border: "1px solid #979797",
      marginTop: -5,
      height: '3px !important',
      background: '#979797 !important',
      marginInline: 3.5,
      borderRadius: 20
    },
    "& .control-dots .dot.selected": {
      border: "1px solid #ff0054",
      background: "#ff0054!important",
      borderRadius: 20
    },
  },
  doughnutGrid: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  barChart: {
    width: '100%',
    float: isRTL ? "right" : "left",
    "& canvas": {
      height: barHeight[windowSize],
    },
  },
  barContainer: {
    width: windowSize !== "xs" ? "450px !important" : "100%",
  },
  fontWrap: {
    fontSize: "10px",
  },
  emptyDoughnut: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor: "#F9F9F9",
    border: "1px solid #D7D7D7",
    width: 180,
    height: 180,
    margin: 10,
  },
  dashBoxtitleSection: {
    marginBottom: "0px",
    borderBottom: "none !important",
    background: '#F0F5FF',
    height: 50,
    maxHeight: 50,
    color: "#0371AD",
    fontSize: 18,
    padding: '10px',
    position: 'initial',
    [theme.breakpoints.down('xs')]: {
      padding: 10,
      height: 'auto',
    },
    '& .title': {
      fontSize: 20,
      fontWeight: 600,
      color: '#000'
    }

  },
  icon_Info: {
    color: '#FF0054 !important',
    fontSize: 18
  },
  noRecipients: {
    color: "#AAAAAA",
    marginTop: 40,
    fontSize: 20,
  },
  addRecipientsIcon: {
    fontFamily: "pulseemicons",
    fontSize: 20,
  },
  addRecipientsBtn: {
    textTransform: "capitalize",
    marginTop: -10,
  },
  tipsTitle: {
    maxHeight: 30
  },
  bulkStatusTitleSection: {
    marginBottom: "1rem",
    marginTop: "1rem",
  },
  statusBlue: {
    marginBottom: "1rem",
    padding: "3px 15px",
    borderRadius: ".9rem",
    background: "#0371AD",
    color: "white",
    border: "1px solid #0371AD",
  },
  bulkStatusBlue: {
    marginBottom: "1rem",
    padding: "3px 15px",
    borderRadius: ".9rem",
    background: "#0371AD",
    color: "white",
    border: "1px solid #0371AD",
    transition: "all ease-in-out 0.2s",
    "&:hover": {
      background: "white",
      color: "#0371AD",
      border: "1px solid #0371AD",
      "& a": {
        background: "transparent",
        color: "#0371AD",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
      },
    },
  },
  statusOutline: {
    marginBottom: "1rem",
    padding: "3px 15px",
    borderRadius: ".9rem",
    border: "1px solid #0371AD",
    background: "transparent",
    color: "#0371AD",
  },
  bulkOutline: {
    marginBottom: "1rem",
    padding: "3px 15px",
    borderRadius: ".9rem",
    border: "1px solid #0371AD",
    background: "transparent",
    color: "#0371AD",
    transition: "all ease-in-out 0.2s",
    // '&:hover': {
    //   border: '1px solid #0371AD',
    //   background: '#0371AD',
    //   color: '#fff',
    // }
  },
  bulkTitle: {
    fontWeight: 400,
    fontSize: '1.1rem',
    lineHeight: "2.1rem",
  },
  bulkContent: {
    fontWeight: 300,
    fontSize: "12",
    lineHeight: "2.1rem",
    textDecoration: "underline",
    color: "#0371AD",
  },
  dashboardUsername: {
    fontWeight: "bold",
    color: "#0371AD",
    fontSize: 20,
  },
  dashboardTopPaper: {
    [theme.breakpoints.up("lg")]: {
      minHeight: 330,
    },
    [theme.breakpoints.down("md")]: {
      paddingBottom: 0,
    },
    [theme.breakpoints.down("xs")]: {
      margin: "10px 10px 0px 10px",
    },
    margin: "30px 30px 0px 30px",
    borderRadius: 10,
    border: '3px solid #F0F5FF',
    '&.MuiPaper-elevation3': {
      boxShadow: 'none'
    }
  },
  dashboardBottomPaper: {
    [theme.breakpoints.up("lg")]: {
      // minHeight: 370,
    },
    [theme.breakpoints.down("xs")]: {
      margin: 10,
    },
    height: 'max-content',
    margin: 30,
    // paddingBottom: 25,
    borderRadius: 10,
    border: '3px solid #F0F5FF',
    '&.MuiPaper-elevation3': {
      boxShadow: 'none'
    }
  },
  bulkStatusContainer: {
    '& .MuiDivider-root': {
      width: '100%',
      border: '1px #F0F5FF solid',
      height: 0,
    },
    '& .bubbleNew': {
      marginTop: 0,
      position: 'absolute',
      right: isRTL ? '' : -15,
      left: isRTL ? 0 : '',
      '& .bubbleText': {
        color: '#000',
        position: 'absolute',
        zIndex: 10,
        fontSize: 14,
        left: 25,
        fontWeight: 'bold'
      }
    }
  },
  bulkMargin: {
    [theme.breakpoints.down("xs")]: {
      marginTop: 10,
    },
    [theme.breakpoints.up("lg")]: {
      marginInlineEnd: 0,
    },
  },
  tipMargin: {
    [theme.breakpoints.up("lg")]: {
      marginInlineEnd: 0,
    },
  },
  tipItem: {
    padding: "0 30px 20px 30px",
  },
  tipulseemMsg: {
    fontSize: tipsFontSize[windowSize],
    padding: "0px 20px 20px 20px",
    maxWidth: 204,
    textAlign: 'center',
    margin: 'auto',
    ['@media (max-width:1280px)']: {
      maxWidth: '65%',
      fontSize: '14px'
    },
  },
  lightBulb: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  activeTab: {
    background: blue,
    borderRadius: 5,
    color: "white",
  },
  tabText: {
    fontSize: 20,
    textTransform: "capitalize",
    padding: 2,
    minWidth: 170,
    minHeight: 40,
  },
  SMSLastReportGrid: {
    padding: "15px 20px 0px 20px",
  },
  newsletterLastReportGrid: {
    padding: "0px 20px 20px 20px",
  },
  newsletterItemBorder: {
    borderBottom: "1px solid #ccc",
  },
  phoneLastReportTitle: {
    marginBottom: "1.2rem",
    borderBottom: "1px solid #ccc",
  },
  lastReportItemText: {
    display: "flex",
    alignItems: "baseline",
  },
  lastReportTitleSection: {
    paddingTop: '0 !important',
    marginBottom: "1.2rem",
    borderBottom: "1px solid #ccc",
    [theme.breakpoints.down('xs')]: {
      height: 'auto',
      display: 'inline-table',
      marginBottom: 0,
      paddingBottom: 0,
      '& .MuiTabs-root': {
        marginLeft: 0,
        marginTop: 10
      }
    }
  },
  lastReportRowItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "5px 0px",
  },
  lastReportsTabPanels: {
    paddingTop: windowSize !== "xs" ? 10 : 0,
    paddingBottom: 25,
    paddingRight: windowSize !== "xs" ? 5 : 0,
    paddingLeft: windowSize !== "xs" ? 5 : 0,
    '& .MuiDivider-root': {
      width: '100%',
      border: '1px #F0F5FF solid',
      height: 0,
    },
  },
  tabPanel: {
    minHeight: 220,
    marginTop: 20,
  },

  directSendTabSection: {
    marginTop: 30,
    background: 'aliceblue',
    padding: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    '& .MuiTabs-root': {
      height: 48
    },
    [theme.breakpoints.down("xs")]: {
      padding: 10,
      '& .MuiTabs-root': {
        marginBottom: 5,
        width: '100%',
      },
    },
  },
  lastReportPadding: {
    [theme.breakpoints.down("md")]: {
      marginTop: 0,
    },
    [theme.breakpoints.down("xs")]: {
      marginTop: 20,
    },
    borderTop: 'none'
  },
  chartLabel: {
    position: "absolute",
    height: 55,
    top: 0,
    bottom: 0,
    width: "55%",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#000",
    right: 0,
    left: 0,
    margin: "auto",
    cursor: "pointer",
    textDecoration: "none",
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    "&:hover": {
      textDecoration: "none",
    },
    '& .centerText': {
      fontWeight: 500,
      fontSize: 15,
      marginBottom: 19,
    },
    '& .quantity': {
      fontWeight: 700,
      fontSize: 28.676,
      color: '#FF4D2A'
    },
    '& .MuiDivider-root': {
      height: 2.8,
      backgroundColor: '#CCFF00',
      width: 20.3,
    }
  },
  doughnutBox: {
    marginTop: 20,
    width: 200,
    height: 200,
    position: "relative",
    textAlign: "center",
  },
  doughnutGreenBox: {
    width: 180,
    height: 180,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    zIndex: 1,
  },
  bgLightGreen: {
    position: "absolute",
    background: "#E0FAC6",
    width: 145,
    height: 145,
    marginTop: 10,
    zIndex: -1,
  },
  duplicateSuccessMsg: {
    padding: "0 25px!important",
  },
  tooltipBlack: {
    backgroundColor: "black",
    maxWidth: 300,
    fontSize: "16px!important",
    textAlign: "center",
  },
  tooltipPlacement: {
    "&.MuiTooltip-tooltipPlacementTop": {
      margin: "10px 0px!important",
    },
  },
  tooltipArrow: {
    color: "black",
    left: isRTL ? "unset!important" : "2px!important",
    right: isRTL ? "2px!important" : "unset!important",
  },
  previewID: {
    fontSize: windowSize === "xs" ? 20 : 25,
    position: "absolute",
    top: 20,
    left: isRTL ? "unset" : 75,
    right: isRTL ? 75 : "unset",
  },
  listBgBrown: {
    backgroundColor: "#636363",
    color: "white",
  },
  smsGraph: {
    position: "relative",
    marginBottom: 50,
    "& .amcharts-amexport-item .amcharts-amexport-item-level-1 .amcharts-amexport-item-blank":
    {
      width: 150,
    },
    "& .amcharts-amexport-menu-level-1": {
      right: "15px!important",
      "&::after": {
        content: `''`,
        position: "absolute",
        top: "5px",
        left: "100%",
        zIndex: "1000",
        borderTop: "8px solid transparent",
        borderLeft: "8px solid #e2e2e2",
        borderRight: "8px solid transparent",
        borderBottom: "8px solid transparent",
      },
    },
  },
  smsGraphMenu: {
    width: 35,
    height: 35,
    background: "#fff",
    border: "1px solid #e2e2e2",
    "&:hover": {
      backgroundColor: "#636363",
    },
  },
  smsGraphMenuIcon: {
    padding: 0,
    color: "gray",
    "&:hover": {
      color: "white",
    },
  },
  smsGraphMenuPaper: {
    borderRadius: 0,
    boxShadow: "none",
    border: "1px solid #e2e2e2",
    "& .MuiListItem-button:hover": {
      backgroundColor: "#636363",
      color: "white",
    },
  },
  smsGraphMenuList: {
    padding: 0,
    position: "absolute",
    top: 0,
    right: 50,
    width: 140,
  },
  arrowRight: {
    "&::after": {
      content: `''`,
      position: "absolute",
      top: "13px",
      left: "100%",
      zIndex: "1000",
      border: "1px solid #e2e2e2",
      borderTop: "7px solid transparent",
      borderLeft: "7px solid #fff",
      borderRight: "7px solid transparent",
      borderBottom: "7px solid transparent",
    },
    "&::before": {
      content: `''`,
      position: "absolute",
      top: "12.5px",
      left: "100%",
      zIndex: "1000",
      borderTop: "7px solid transparent",
      borderLeft: "7.5px solid black",
      borderRight: "7.5px solid transparent",
      borderBottom: "7.5px solid transparent",
    },
  },
  modalText: {
    fontSize: "22px",
    marginTop: "5px",
  },
  cellText: {
    display: "flex",
    flexDirection: "column",
    "@media screen and (min-width: 599px) and (max-width: 958px)": {
      flexDirection: "row",
    },
    "& a, & p": {
      lineHeight: "1.1",
    },
  },
  tableCellRootResponsive: {
    "@media screen and (max-width: 1460px)": {
      padding: "0 5",
    },
  },
  responsiveFlex: {
    alignItems: "center",
    "@media screen and (max-width: 1460px)": {
      flexWrap: "nowrap",
    },
    "@media screen and (max-width: 1170px)": {
      flexDirection: "column",
    },
  },
  maxHeightReponsive: {
    "@media screen and (max-width: 1170px)": {
      // maxHeight: "150px !important",
      textAlign: isRTL ? "right" : "left",
    },
  },
  noPonSmallScreen: {
    "@media screen and (max-width: 1170px)": {
      padding: "0px !important",
    },
  },
  hideInMiddleScreen: {
    "@media screen and (max-width: 1170px) and (min-width: 958px)": {
      display: "none",
      minWidth: 0,
      padding: 0,
    },
  },
  hideOnSmallScreen: {
    "@media screen and (max-width: 1170px)": {
      display: "none",
      minWidth: 0,
      padding: 0,
    },
  },
  showTitleInline: {
    display: "none",
    "@media screen and (max-width: 1170px)": {
      display: "inline-block",
    },
  },
  reponsivePB5: {
    "& $middleWrapText": {
      display: "flex",
      flexFlow: "column wrap",
      fontSize: 16,
    },
    padding: "0 !important",
    "@media screen and (max-width: 1170px)": {
      paddingBottom: "10px !important",
    },
  },
  fullFlexItem: {
    width: "100%",
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    "& .MuiGrid-container": {
      justifyContent: windowSize !== "xs" ? "space-around" : null,
    },
  },
  expandTableRow: {
    display: "flex",
    justifyContent: "center",
    "& td": {
      // paddingTop: 0,
      paddingRight: 0,
      paddingLeft: 0,
    },
  },
  directPreview: {
    top: 5,
    position: "absolute",
    left: 0,
    right: 0,
  },
  redLink: {
    color: "red",
    fontWeight: 600,
    cursor: "pointer",
  },
  emailAttachment: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingInline: 10,
  },
  groupsAutoComplete: {
    '& .MuiAutocomplete-listbox': {
      overflowX: 'hidden',
      overflowY: 'scroll',
      maxHeight: 150,
      '& :hover': {
        color: '#ff3343'
      },
      '&::-webkit-scrollbar': {
        width: '6px',

      },
      '&::-webkit-scrollbar-track': {
        'boxShadow': 'inset 0 0 5px #e9e9e9',
        'borderRadius': '10px',
      },

      '&::-webkit-scrollbar-thumb': {
        background: '#ff3343',
        borderRadius: '10px'
      },

      '&::-webkit-scrollbar-thumb:hover': {
        background: '#ef2c3c'
      }
    }
  },
  addRecipientDialog: {

    "& .MuiDialog-scrollPaper": {
      "& .MuiDialog-paperScrollPaper ": {
        width: '640px !important',
        "@media screen and (max-width: 768px)": {
          width: '80% !important'
        },
        "@media screen and (max-width: 500px)": {
          width: "100% !important",
        },
      }
    }
  },
  importButtonBlue: {
    backgroundColor: '#3498DB',
    '&:hover': {
      backgroundColor: '#3291d1'
    }
  },
  removedPaddingAutoComplete: {
    minWidth: 200,
    '& .MuiTextField-root': {
      '& .MuiAutocomplete-inputRoot': {
        padding: '0 65px 0 0', margin: 9,
      }
    }
  },
  unSubAdvanceOptns: {
    '& span': {
      padding: '2px 9px',
      '&.Mui-checked': {
        color: '#ff3343'
      }
    }
  },
  carouselContainer: {
    display: 'flex',
    flexDirection: 'row !important',
    flexWrap: 'nowrap',
    overflowX: 'hidden',
    height: 'min-content',
    paddingBottom: 10
  },
  carouselItem: {
    minWidth: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  T05S: {
    transition: '.5s cubic-bezier(0.39, 0.575, 0.565, 1)'
  },
  T10S: {
    transition: '1s cubic-bezier(0.39, 0.575, 0.565, 1)'
  },
  hAuto: {
    height: 'auto !important'
  },

  emailVerItemContainer: {
    '& .error': {
      marginTop: 5,
      color: 'red',
      height: 26
    },
    '& .success': {
      marginTop: 7,
      color: 'green',
      height: 26
    },
    '& .cSlide': {
      width: "100%",
      height: '100%',
      position: "relative",
      padding: 10,
      '&.firstSlide': {
        '& .contactDataBox': {
          overflowX: 'clip',
          overflowY: 'auto',
          height: 'calc(100% - 80px)'
        },
        '& .emailBox': {
          '& span': {
            paddingInline: 2,
            fontSize: 18,
            marginTop: 2
          },
          '& .emailText': {
            paddingInline: 4,
            maxWidth: 320,
            minWidth: 160,
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
          '& .emailVerLink': {
            paddingInline: 3
          }
        }
        ,
        // '& .btnVerifyNewLtr': {
        //   position: "absolute",
        //   top: 0,
        //   right: 10
        // },
        // '& .btnVerifyNewRtl': {
        //   position: "absolute",
        //   top: 0,
        //   left: 10
        // },
        '& .MuiDivider-root': {
          marginTop: 6,
          height: '1.3px',
          backgroundColor: '#cdcdcd'
        }
      }
    },
    '& .cFlexSlide': {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: "100%",
      height: '100%',
      textAlign: 'center',
      '&.secondSlide': {
        '& div': {
          width: '100%',
        },
        '& .titleDescBox': {
          '& .mt20': {
            marginTop: 20
          },
          '& .desc': {
            marginTop: 20,
          }
        }
      }
    },
  },
  imgFluid: {
    maxWidth: '100%',
    height: '100%'
  },
  smallIcon: {
    width: 14
  },
  smsReplies: {
    '& .MuiOutlinedInput-root': {
      padding: '4px !important'
    },
    '& .MuiInputBase-root': {
      '& .MuiInputBase-input': {
        maxWidth: '70% !important',
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    },
    '& .MuiAutocomplete-endAdornment': {
      right: isRTL ? 'auto !important' : '0 !important',
      left: isRTL ? '0 !important' : 'auto !important'
    }
  },
  implementButtonFlex: {
    maxHeight: '45',
    marginTop: 'auto',
    marginInlineStart: 'auto',
    lineHeight: windowSize === 'xs' ? 1 : null,
    "@media screen and (max-width: 540px)": {
      marginTop: 5,
      marginLeft: 38
    },
  },
  tablePadington: {
    '& .MuiSelect-select.MuiSelect-select': {
      paddingRight: !isRTL ? 25 : 0,
      paddingLeft: 0,
      // paddingInlineEnd: isRTL ? 0 : 15,
      width: 50,
      textAlign: 'center'
    }
  }
});
