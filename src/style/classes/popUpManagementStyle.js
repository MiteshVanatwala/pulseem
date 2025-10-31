
export const getPopUpManagementStyle = (windowSize, isRTL, theme) => ({
  statCard: {
    height: '100%',
    borderRadius: '16px',
    borderLeft: `3px solid #F65026`,
  },
  responsiveActions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'stretch',
      '& button': {
        width: '100%',
      },
    },
  },
  popupCard: {
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: '12px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  },
  popupTitle: {
    fontWeight: 600,
    fontSize: '1.1rem'
  },
  statsContainer: {
    borderTop: `1px solid ${theme.palette.grey[200]}`,
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
    padding: theme.spacing(1, 0),
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    margin: '8px 0',
  },
  actionsContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    paddingTop: theme.spacing(1),
    gap: theme.spacing(0.5),
  },
  actionButtonPopupManagement: {
    textTransform: 'none',
    color: theme.palette.grey[600],
    border: '1px solid #eeeeee',
    margin: isRTL ? '0 0 0 16px' : '0 16px 0 0',
    padding: '4px 8px',
    borderRadius: '8px',
    '& .MuiSvgIcon-root': {
      fontSize: '1.2rem',
    }
  },
  activeChip: {
    backgroundColor: '#E5F7F0',
    color: '#00875A',
  },
  inactiveChip: {
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.grey[700],
  },
  draftChip: {
    backgroundColor: '#DEEBFF',
    color: '#0747A6',
  },
  tableBodyRow: {
    padding: 36,
  },
  actionIconsContainer: {
    '& svg': {
      height: 18,
      width: 20,
    }
  },
  tableActionContainerCell: {
    maxWidth: '500px !important',
  },
  // Popup Preview Modal Styles
  popupPreviewDialogPaper: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    overflow: 'visible',
    maxHeight: '90vh',
    width: 'auto',
    margin: '32px',
  },
  popupPreviewContainer: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'auto',
    maxHeight: '90vh',
    minWidth: '400px',
    maxWidth: '90vw',
    transition: 'width 0.3s ease',
  },
  popupPreviewCloseButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
  },
  popupPreviewLoaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  popupPreviewContent: {
    maxWidth: '100%',
    margin: '0 auto',
    position: 'relative',
    direction: 'ltr',
    minHeight: '400px',
  },
});