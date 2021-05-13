const iconWidth={
  sm: 20,
  md: 25,
  lg: 25
}

const flex12={
  sm: 5,
  md: 7,
  lg: 6
}

export const getManagmentStyle=(windowSize,isRTL,theme) => ({
  managementTitle: {
    fontSize: '2rem',
    color: '#333333',
    paddingBlock: '0.5rem',
    fontFamily: "Assistant",
    fontWeight: 'bold'
  },
  tableRow: {
    marginBox: 20
  },
  tableCellHead: {
    fontFamily: 'Assistant',
    fontWeight: 'bold',
    fontSize: 20,
    marginBlock: 0,
    borderBottom: 0,
    padding: '16px!important'
  },
  tableCellBody: {
    borderInlineEnd: '1px solid #797979',
    marginBlock: 20,
    borderBottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  borderRight: {
    marginBlock: 20,
    borderBottom: 0,
    borderInlineEnd: '1px solid #797979',
  },
  flex: {
    display: 'flex',
  },
  paddingRightLeft10: {
    padding: '0 10px'
  },
  paddingHead: {
    padding: '20px 10px'
  },
  tableCellBodyNoBorder: {
    marginBlock: 20,
    borderBottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  tableCellRoot: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 100,
    padding: '0 16px'
  },
  tableRowRoot: {
    display: 'flex',
    justifyContent: 'center',
    borderBottom: '1px solid #797979',
    '&:last-child': {
      borderBottom: 0
    },
    '&:nth-of-type(even)': {
      backgroundColor: '#E3E9F0',
    }
  },
  tableRowHead: {
    backgroundColor: '#E3E9F0',
    borderColor: 'transparent',
  },
  middleText: {
    fontSize: 18,
    whiteSpace: 'nowrap',
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: '#333'
  },
  wrapText: {
    fontSize: 16,
    flexWrap: "wrap",
    textOverflow: "ellipsis",
  },
  errorText: {
    color: 'red'
  },
  managmentIconHide: {
    opacity: 0
  },
  managmentIconContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '1.8rem',
    padding: '0.8rem 1.1rem 0.2rem'
  },
  managmentIcon: {
    width: iconWidth[windowSize],
    margin: 'auto'
  },
  managmentIconDisable: {
    opacity: 0.5
  },
  managmentIconText: {
    textAlign: 'center',
    alignSelf: 'center',
    textTransform: 'none',
    marginTop: 2
  },
  sendIcon: {
    border: '1px solid #27AE60',
    borderRadius: 5
  },
  sendIconText: {
    color: '#27AE60'
  },
  recipientsStatus: {
    fontSize: 17,
    color: 'black'
  },
  statusFailed: {
    fontWeight: 700,
    color: '#E74C3C'
  },
  statusDraft: {
    fontWeight: 700,
    color: '#0371AD'
  },
  statusDeleted: {
    fontWeight: 700,
    color: '#E74C3C'
  },
  statusSending: {
    fontWeight: 700,
    color: '#F59A23'
  },
  statusSent: {
    fontWeight: 700,
    color: '#27AE60'
  },
  statusPending: {
    fontWeight: 700,
    color: '#F59A23'
  },
  statusScheduled: {
    fontWeight: 700,
    color: '#F59A23'
  },
  recipientsStatusCreated: {
    color: '#0371AD',
    fontWeight: 700
  },
  recipientsStatusSent: {
    color: '#27AE60',
    fontWeight: 700
  },
  recipientsStatusSending: {
    color: '#F59A23',
    fontWeight: 700
  },
  recipientsStatusCanceled: {
    color: '#E74C3C',
    fontWeight: 700
  },
  recipientsStatusStopped: {
    color: '#E74C3C',
    fontWeight: 700
  },
  actionButton: {
    color: 'white',
    fontSize: 18,
    textTransform: 'none'
  },
  actionButtonLightGreen: {
    backgroundColor: '#27AE60',
    '&:hover': {
      backgroundColor: '#219150'
    }
  },
  actionButtonLightBlue: {
    backgroundColor: '#3498DB',
    '&:hover': {
      backgroundColor: '#2283c3'
    }
  },
  actionButtonDarkBlue: {
    backgroundColor: '#5088b5',
    '&:hover': {
      backgroundColor: '#4477a2'
    }
  },
  actionButtonGreen: {
    backgroundColor: '#217346',
    '&:hover': {
      backgroundColor: '#1d633c'
    }
  },
  actionButtonRed: {
    backgroundColor: '#c9302c',
    '&:hover': {
      backgroundColor: '#ae2a27'
    }
  },
  textField: {
    width: 180,
    textTransform: 'capitalize',
    '& .MuiInputBase-root': {
      fontSize: 18,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#a6a6a6'
    },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#797979'
      },
      '&.Mui-focused fieldset': {
        border: '1px solid #797979',
      }
    }
  },
  selectField: {
    width: 180,
    '& .MuiSelect-root': {
      fontSize: 18,
      padding: '12px 30px'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#a6a6a6'
    },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#797979'
      },
      '&.Mui-focused fieldset': {
        border: '1px solid #797979',
      }
    }
  },
  textFieldPlaceholder: {
    '& .MuiInputBase-root': {
      color: 'rgba(0,0,0,0.40)'
    }
  },
  selectPlaceholder: {
    height: 0,
    padding: 0
  },
  tableStyle: {
    overflowX: 'visible'
  },
  tableContainer: {
    border: '1px solid #7F7F7F',
  },
  flex7: {
    flex: 7
  },
  flex3: {
    flex: 3
  },
  flex15: {
    flex: 1
  },
  flex1: {
    flex: 1
  },
  flex5: {
    flex: 4,
    borderBottom: 0,
    justifyContent: 'center'
  },
  flex12: {
    flex: flex12[windowSize]||5,
    borderBottom: 0,
    justifyContent: 'center'
  },
  cellIconsContainer: {
    justifyContent: windowSize==='xs'? 'flex-start':'flex-end',
  },
  datePickerInput: {
    paddingBlock: 10
  },
  datePickerButton: {
    right: isRTL? 10:-10,
    padding: 10
  },
  groupsLableContainer: {
    justifyContent: 'flex-end',
    display: 'flex',
    flex: 1
  },
  groupsLable: {
    alignSelf: 'center',
    fontSize: 16
  },
  searchButton: {
    backgroundColor: '#E3E9F0',
    color: '#333',
    paddingInline: 25,
    textTransform: 'none',
    borderRadius: 6
  },
  tablePadingtonSelect: {
    '& .MuiSelect-root': {
      padding: 0,
      paddingBlock: 2,
      paddingInline: 15,
      marginInlineStart: 5
    },
    '& .MuiSelect-icon': {
      color: '#000',
      top: 0,
      marginRight: -5
    },
    '& .MuiInput-underline': {
      '&:before': {
        borderBottom: 0
      },
      '&:hover:not(.Mui-disabled):before': {
        borderBottom: 0
      },
      '&:after': {
        borderBottom: 0,
      }
    }
  },
  tablePadingtonTextFeild: {
    marginInline: 10,
    width: 30,
    '& .MuiInputBase-root': {
      fontSize: 14,
      padding: 0,
      height: 30,
    },
    '& .MuiOutlinedInput': {
      '&-input': {
        padding: 0,
        textAlign: 'center',
        alignSelf: 'center',
        '&[type=number]': {
          '-moz-appearance': 'textfield',
        },
        '&::-webkit-outer-spin-button': {
          '-webkit-appearance': 'none',
          margin: 0,
        },
        '&::-webkit-inner-spin-button': {
          '-webkit-appearance': 'none',
          margin: 0,
        },
      },
      '&-inputMarginDense': {
        paddingTop: 0,
        paddingBottom: 0
      },
      '&-notchedOutline': {
        borderColor: '#a6a6a6'
      },
      '&-root': {
        '&:hover fieldset': {
          borderColor: '#797979'
        },
        '&.Mui-focused fieldset': {
          border: '1px solid #797979',
        }
      }
    }
  },
  tablePadingtonArrow: {
    transform: isRTL? 'rotateY(0deg)':'rotateY(180deg)',
    marginInlineStart: 10,
    padding: 5
  },
  tablePadingtonArrowOppisite: {
    transform: isRTL? 'rotateY(180deg)':'rotateY(0deg)',
    marginInlineEnd: 10,
    padding: 5
  },
  tablePadingtonGridItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 100
  },
  tablePadingtonGridContainer: {
    paddingBlock: 10,
  },
  phoneSearchBar: {
    border: '1px solid #797979',
    borderRadius: '50px',
    overflow: 'hidden',
    marginTop: '1rem',
    paddingInlineStart: 10,
    '&:before': {
      borderBottom: 0
    },
    '&:hover:not(.Mui-disabled):before': {
      borderBottom: 0
    },
    '&:after': {
      borderBottom: 0
    }
  },
  phoneSearchBarRoot: {
    zIndex: 0
  },
  phoneSearchBarIcon: {
    backgroundColor: '#E3E9F0',
    '&:hover': {
      backgroundColor: '#dee5ed'
    }
  },
  linePadding: {
    paddingBlock: '1rem'
  },
  lineTopMarging: {
    marginTop: '1rem'
  },
  restoreDialogCheckBoxLable: {
    '& .MuiFormControlLabel-label': {
      fontWeight: 'bold'
    }
  },
  groupsTable: {
    border: '1px solid #ccc'
  },
  groupsTableHead: {
    padding: 0,
    background: '#ccc'

  },
  gruopsDialogText: {
    fontSize: 16
  },
  gruopsDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: 400,
    overflow: 'auto',
    marginBlock: 10
  },
  gruopsDialogButton: {
    alignSelf: 'center',
    fontFamily: 'OpenSansHebrew',
    color: '#fff',
    textTransform: 'capitalize',
    width: 400,
    fontSize: 16,
    borderRadius: 100
  },
  gruopsDialogBullet: {
    fontSize: 8,
    marginInlineEnd: 10
  },
  restoreDialogCheckBox: {
    padding: 0,
    marginInlineStart: 10,
    marginInlineEnd: 5
  },

  restorDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: 300,
    width: 450,
    border: '1px solid #8b8b8b',
    overflowY: 'auto',
    padding: 5,
    marginBlock: 10
  },
  grayTextCell: {
    'WebkitLineClamp': 1,
    color: '#7F7F7F'
  },
  fontBold: {
    fontWeight: 700
  },
  cardMedia: {
    height: '140px',
    '&.MuiCardMedia-root': {
      backgroundSize: 'unset'
    }
  },
  searchWhite: {
    transform: 'scale(1.5)',
    padding: 10,
    '& path': {
      fill: 'white',
    }
  },
  confirmButton: {
    alignSelf: 'center',
    fontFamily: 'OpenSansHebrew',
    color: '#fff',
    textTransform: 'capitalize',
    width: 167,
    fontSize: 16,
    borderRadius: 100
  },
  formControl: {
    '& .MuiInputLabel-formControl': {
      top: -7
    }
  },
  formControlSelect: {
    '& .MuiSelect-outlined.MuiSelect-outlined': {
      padding: '12px 32px'
    }
  },
  dialogBox: {
    paddingBottom: 20
  },
  directoryField: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 400
  },
  radioGroup: {
    padding: '0 10px'
  },
  copyIcon: {
    fontFamily: 'pulseemicons',
    fontSize: 10,
    padding: '0 5px'
  },
  avatarIcon: {
    fontFamily: 'pulseemicons',
    color: '#fff',
    fontSize: 15
  },
  checkIcon: {
    backgroundColor: 'green',
    width: 14,
    height: 14
  },
  redIcon: {
    backgroundColor: 'darkred',
    width: 14,
    height: 14
  },
  newLine: {
    whiteSpace: 'pre-line'
  },
  contactUs: {
    fontSize: 12,
    marginTop: 20
  },
  verifyLink: {
    paddingInlineStart: 5,
    fontSize: 12,
    textDecoration: 'underline',
    color: '#000',
    '&:hover': {
      color: 'darkred'
    }
  }

})