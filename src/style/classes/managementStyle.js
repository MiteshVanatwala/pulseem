const iconWidth={
  sm: 20,
  md: 30,
  lg: 30
}

const flex12={
  sm: 5,
  md: 7,
  lg: 12
}

export const getManagmentStyle=(windowSize,isRTL,theme) => ({
  managementTitle: {
    fontSize: '2.5rem',
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
    fontSize: '1rem',
    marginBlock: 0,
    borderBottom: 0
  },
  tableCellBody: {
    borderInlineEnd: '1px solid #797979',
    marginBlock: 20,
    borderBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  tableCellRoot: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 100
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
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: "hidden",
    textOverflow: "ellipsis",
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
    width: iconWidth[windowSize]
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
  actionButton: {
    color: 'white',
    fontSize: 16,
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
  actionButtonGreen: {
    backgroundColor: '#217346',
    '&:hover': {
      backgroundColor: '#1d633c'
    }
  },
  textField: {
    width: 180,
    textTransform: 'capitalize',
    '& .MuiInputBase-root': {
      fontSize: 16,
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
  tableContainer: {
    border: '1px solid #7F7F7F'
  },
  flex3: {
    flex: 3
  },
  flex1: {
    flex: 1
  },
  flex12: {
    flex: flex12[windowSize]||12,
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
      top: 0
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
    marginInlineStart: 10
  },
  tablePadingtonArrowOppisite: {
    transform: isRTL? 'rotateY(180deg)':'rotateY(0deg)',
    marginInlineEnd: 10
  },
  tablePadingtonGridItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
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

  gruopsDialogText: {
    fontSize: 16
  },
  gruopsDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: 100,
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
  }

})