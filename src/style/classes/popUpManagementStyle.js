
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
});