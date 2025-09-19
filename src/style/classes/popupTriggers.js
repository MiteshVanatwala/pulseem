
export const getPopupTriggersStyle = (windowSize, isRTL = false, theme) => ({
  mainTitlePopupTrigger: {
    paddingBottom: '0px !important',
  },
  subtitlePopupTrigger: {
    marginBottom: theme.spacing(3),
    fontWeight: 500,
    fontSize: '1.125rem',
    color: '#000000de',
  },
  cardContainerPopupTrigger: {
    padding: 36,
  },
  cardPopupTrigger: {
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: theme.shape.borderRadius * 3.5,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  activeCardPopupTrigger: {
    border: `2px solid ${theme.palette.error.main}`,
    background: '#fff8f8',
  },
  cardHeaderPopupTrigger: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(3),
  },
  cardTitleContainerPopupTrigger: {
    display: 'flex',
    alignItems: 'center',
  },
  avatarPopupTrigger: {
    backgroundColor: '#fee2e2',
    color: theme.palette.error.main,
    marginRight: theme.spacing(2),
  },
  cardContentPopupTrigger: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  cardDescriptionPopupTrigger: {
    fontSize: '1rem',
    color: theme.palette.grey[900],
    fontWeight: 500,
  },
  cardFooterPopupTrigger: {
    padding: '16px 16px 16px 0px',
    fontSize: '0.875rem',
    color: theme.palette.grey[600],
    fontWeight: 500,
  },
  inputContainerPopupTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    '& p, input': {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    '&.MuiSelect-outlined .MuiSelect-outlined': {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
  },
  textFieldPopupTrigger: {
    width: '4rem',
    '& .MuiInputBase-input': {
      textAlign: 'center',
    },
  },
  sliderContainerPopupTrigger: {
    marginTop: theme.spacing(2),
  },
  sliderRootPopupTrigger: {
    height: 8,
    background: 'linear-gradient(90deg, #d0eb0f 0%, #ff3343 100%)',
    borderRadius: 4,
    padding: 0,
    margin: '0px 8px',
  },
  railPopupTrigger: {
    opacity: 0.3,
    backgroundColor: 'transparent',
  },
  trackPopupTrigger: {
    background: 'none',
  },
  thumbPopupTrigger: {
    border: '2px solid #FF0076',
    backgroundColor: '#f0f8ff',
    height: 18,
    width: 18,
  },
  sliderLabelPopupTrigger: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0px 0px 8px 2px',
  },
  selectPopupTrigger: {
    marginLeft: theme.spacing(1),
  },

  // Display Frequency styles
  paperPopupTrigger: {
    borderRadius: theme.shape.borderRadius * 2.5,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
  },
  sectionTitlePopupTrigger: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
  },
  toggleButtonGroupPopupTrigger: {
    backgroundColor: '#f0f0f0',
    borderRadius: theme.shape.borderRadius * 2,
    width: '100%',
    padding: 5,
    '& span': {
      color: '#757575',
    },
  },
  toggleButtonPopupTrigger: {
    flex: 1,
    textTransform: 'none',
    border: 'none',
    fontWeight: '700',
    padding: 13,
    '&.Mui-selected': {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.text.primary,
      borderRadius: theme.shape.borderRadius * 2,
      '&:hover': {
        backgroundColor: theme.palette.common.white,
      },
    },
    '& svg': {
      margin: isRTL ? '0px 0px 0px 8px' : '0px 8px 0px 0px',
    }
  },
  radioLabelPopupTrigger: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: theme.shape.borderRadius * 2,
    cursor: 'pointer',
    margin: 0,
    '&.selected': {
      borderColor: '#FF0076',
      borderWidth: 2,
    },
  },
  radioLabelContainerPopupTrigger: {
    width: '100%',
  },
  radioIconPopupTrigger: {
    color: theme.palette.grey[400],
  },
  infinityIcon: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.palette.grey[400],
  },

  // advance settings
  topHeaderPopupTrigger: {
    backgroundColor: theme.palette.grey[100],
    padding: isRTL ? '16px 32px 0px 0px' : '16px 0px 0px 32px',
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
  },
  accordionSummaryPopupTrigger: {
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius * 2.5,
    margin: '0px 36px',
    padding: '18px 18px 18px 32px',
    '& h6': {
      fontWeight: 'bold',
    },
  },
  formContainerPopupTrigger: {
    margin: '24px 36px',
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: theme.shape.borderRadius * 2.5,
  },
  radioLabelSelected: {
    borderColor: '#FF0076',
    borderWidth: '2px',
    padding: '11px',
  },
  radioLable: {
    width: '100%',
    margin: 0,
    '& span': {
      fontWeight: '500',
      fontSize: '20px',
    },
  }
});