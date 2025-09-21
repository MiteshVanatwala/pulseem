
export const getPopupTriggersStyle = (windowSize, isRTL = false, theme) => ({
  mainTitlePopupTrigger: {
    paddingBottom: '0px !important',
  },
  subtitlePopupTrigger: {
    marginBottom: theme.spacing(2),
    fontWeight: 500,
    fontSize: '1.125rem',
    color: '#555',
  },
  cardContainerPopupTrigger: {
    padding: windowSize === 'xs' || windowSize === 'sm' ? 18 : 36,
  },
  cardPopupTrigger: {
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: theme.shape.borderRadius * 3.5,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  activeCardPopupTrigger: {
    border: `2px solid #FF0076`,
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
    margin: isRTL ? '0px 0px 0px 16px' : '0px 16px 0px 0px',
  },
  cardContentPopupTrigger: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  cardDescriptionPopupTrigger: {
    fontSize: '1rem',
    color: '#333',
    fontWeight: 500,
  },
  cardFooterPopupTrigger: {
    padding: '16px 16px 16px 0px',
    fontSize: '1rem',
    color: '#7F7F7F',
    fontWeight: 500,
  },
  inputContainerPopupTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    '& p, input': {
      fontWeight: 500,
      fontSize: '1.125rem',
    },
    '&.MuiSelect-outlined .MuiSelect-outlined': {
      fontWeight: 500,
      fontSize: '1.125rem',
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
    margin: 20,
  },
  sectionTitlePopupTrigger: {
    marginBottom: theme.spacing(2),
  },
  toggleButtonGroupPopupTrigger: {
    backgroundColor: '#e4e4e4',
    borderRadius: theme.shape.borderRadius * 2,
    width: '100%',
    padding: 5,
    '& span': {
      color: '#000',
      fontSize: '20px',
      fontWeight: '500',
    },
  },
  sectionTitlePageTargetting: {
    fontSize: '20px !important',
  },
  toggleButtonPopupTrigger: {
    flex: 1,
    textTransform: 'none',
    border: 'none',
    fontWeight: '700',
    padding: 13,
    '&.Mui-selected': {
      background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
      borderBottom: '4px solid #ff2c44',
      borderRadius: theme.shape.borderRadius * 2,
      '& svg, span': {
        color: '#fff',
      },
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

  // page targeting
  pageTargetingResponsiveContainer: {
    margin: 24,
    [theme.breakpoints.down("sm")]: {
      margin: 16,
    },
  },
  pageTargetingResponsiveHeader: {
    [theme.breakpoints.down("sm")]: {
      padding: 16,
    },
  },
  pageTargetingResponsiveDashedBox: {
    border: "2px dashed #e0e0e0",
    borderRadius: 8,
    padding: 24,
    margin: "0 32px",
    [theme.breakpoints.down("sm")]: {
      padding: 16,
      margin: "0 16px",
    },
  },
  pageTargetingResponsiveRuleItem: {
    display: "flex",
    gap: 16,
    padding: 12,
    backgroundColor: "#fafafa",
    borderRadius: 4,
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "stretch",
      padding: 8,
    },
  },
  pageTargetingResponsiveFormControls: {
    display: "flex",
    gap: 16,
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  pageTargetingSelectField: {
    flex: 1,
    minWidth: 200,
    backgroundColor: "#fff",
    borderRadius: 4,
    border: '1px solid #0000003b',
    "& .MuiSelect-select": {
      fontSize: "1rem",
      fontWeight: 400,
      fontFamily: "Assistant, sans-serif",
      padding: '10px 12px',
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      minWidth: "auto",
    },
  },
  pageTargetingTextField: {
    flex: 2,
    backgroundColor: "#fff",
    "& .MuiInputBase-input": {
      fontSize: "1rem",
      fontWeight: 400,
      fontFamily: "Assistant, sans-serif",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  pageTargetingMenuItem: {
    fontSize: "1rem",
    fontWeight: 400,
    fontFamily: "Assistant, sans-serif",
  },
  pageTargetingDeleteButton: {
    borderRadius: 5,
    padding: 8,
    "& svg": {
      height: 22,
      width: 24,
      padding: 6,
    },
    [theme.breakpoints.down("sm")]: {
      alignSelf: "center",
    },
  },
  pageTargetingResponsiveExamples: {
    marginTop: 16,
    marginLeft: 32,
    marginRight: 32,
    [theme.breakpoints.down("sm")]: {
      margin: "12px 16px 8px 16px",
    },
  },
  pageTargetingResponsiveGap: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    [theme.breakpoints.down("sm")]: {
      gap: 12,
    },
  },
  pageTargetingCard: {
    borderRadius: 8,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  addRuleButton: {
    margin: isRTL ? '12px 8px 0px 0px' : '12px 0px 0px 8px',
    alignItems: 'center',
    [theme.breakpoints.down("sm")]: {
      margin: "12px auto",
    },
    '& span': {
      margin: '0px 0px 0px 0px',
    },
  },
  pageTargetingCardContent: {
    padding: 0,
  },
  mobileFullWidth: {
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },

  // advance settings
  topHeaderPopupTrigger: {
    backgroundColor: '#F0F5FF',
    padding: isRTL ? '16px 32px 0px 0px' : '16px 16px 0px 32px',
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
  },
  accordionSummaryPopupTrigger: {
    backgroundColor: '#F0F5FF',
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
      fontWeight: '700',
      fontSize: '17px',
    },
  }
});