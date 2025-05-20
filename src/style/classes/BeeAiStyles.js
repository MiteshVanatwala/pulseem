import { pink, red } from '@material-ui/core/colors';

export const BeeAiStyles = (windowSize, isRTL, theme) => ({
  aiContainer: {
    maxWidth: 800,
    margin: '0 auto',
  },
  textArea: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
    fontSize: '1rem',
    color: '#333'
  },
  submitButton: {
    backgroundColor: pink[500],
    color: 'white',
    '&:hover': {
      backgroundColor: pink[700],
    },
    borderRadius: 25,
    padding: '8px 20px',
    marginTop: theme.spacing(2),
    height: 40
  },
  checkboxLabel: {
    fontSize: '1rem',
  },
  checkboxDesc: {
    fontSize: 14,
    whiteSpace: 'nowrap'
  },
  optionBox: {
    backgroundColor: '#f9f9f9',
    padding: theme.spacing(2),
    borderRadius: 4,
  },
  icon: {
    marginInlineEnd: 5,
    color: '#ff7777',
  },
  // New styles for file upload
  uploadButton: {
    margin: theme.spacing(1, 0),
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    padding: theme.spacing(1, 2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '1px dashed #ccc',
    '&:hover': {
      backgroundColor: '#e5e5e5',
    },
  },
  uploadIcon: {
    marginInlineEnd: theme.spacing(1),
    color: '#555',
  },
  filePreview: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: '#eee',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeIcon: {
    cursor: 'pointer',
    color: '#777',
    '&:hover': {
      color: red[500],
    },
  },
  // New styles for color picker
  colorBox: {
    width: 30,
    height: 30,
    margin: theme.spacing(0.5),
    cursor: 'pointer',
    borderRadius: 4,
    display: 'inline-block',
    position: 'relative',
    border: '1px solid #ddd',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
  colorSelected: {
    border: '2px solid #333',
    '&::after': {
      content: '"✓"',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: '#fff',
      textShadow: '0px 0px 2px #000',
    },
  },
  colorPaletteButton: {
    margin: theme.spacing(1, 0),
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    padding: theme.spacing(1, 2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '1px dashed #ccc',
    '&:hover': {
      backgroundColor: '#e5e5e5',
    },
  },
  colorChip: {
    margin: theme.spacing(0.5),
    direction: 'ltr',
  },
  newFeatureSection: {
    marginBottom: theme.spacing(2),
  },
  newFeatureTitle: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
  },
  historyContainer: {
    marginBottom: theme.spacing(3),
  },
  fullWidth: {
    width: '100%',
  },
  accordionSummary: {
    backgroundColor: theme.palette.grey[100],
  },
  accordionTitle: {
    fontWeight: 500,
  },
  accordionDetails: {
    display: 'block',
    padding: theme.spacing(2),
  },
  radioGroup: {
    width: '100%',
  },
  historyItem: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
  },
  historyItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  historyDate: {
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  historyItemContent: {
    marginLeft: theme.spacing(3),
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  historyMessage: {
    maxHeight: '100px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    fontSize: '0.875rem',
    color: theme.palette.text.primary,
  },
  revertButton: {
    minWidth: 150,
    direction: isRTL ? 'rtl' : 'ltr',
  },
})