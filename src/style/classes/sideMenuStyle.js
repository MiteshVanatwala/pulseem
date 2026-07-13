const appBarTitleTextSize = { xs: 13, sm: 14, md: 10, lg: 16, xl: 14 }

const SIDEBAR_WIDTH = 224;
const SIDEBAR_COLLAPSED_WIDTH = 70;

export const sideMenuStyle = (windowSize, isRTL, theme) => ({
  menuSidebar: {
    width: SIDEBAR_WIDTH,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  sidebarCollapsed: {
    width: SIDEBAR_COLLAPSED_WIDTH,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    '& $sidebarItemIcon': {
      paddingInlineEnd: '0 !important'
    }
  },
  sidebarPaper: {
    width: SIDEBAR_WIDTH,
    background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
    color: '#ffffff',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
    // Hide scrollbar globally for the wrapper
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',
    'scrollbar-width': 'none',
  },
  sidebarPaperCollapsed: {
    width: SIDEBAR_COLLAPSED_WIDTH,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    minHeight: 64,
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  sidebarLogo: {
    maxHeight: 40,
    maxWidth: 150,
  },
  toggleButton: {
    color: '#ffffff',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  sidebarContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
    // Hide scrollbar globally for the scrollable container
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',
    'scrollbar-width': 'none',
  },
  sidebarNav: {
    flex: 1,
    padding: theme.spacing(1, 0),
  },
  sidebarItem: {
    margin: '6px 4px',
    marginTop: '4px',
    paddingInlineStart: 5,
    paddingInlineEnd: 5,
    borderRadius: 0,
    justifyContent: 'center',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    '&.active': {
      color: '#fff',
      '$sidebarItemIcon, & svg': {
        color: '#fff',
      },
      '& .MuiListItemText-primary': {
        fontWeight: 600,
      },
    },
  },
  sidebarItemIcon: {
    color: '#ffffff',
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    paddingInlineEnd: 15,
  },
  sidebarItemText: {
    '& .MuiListItemText-primary': {
      fontSize: '0.9rem',
      fontWeight: 500,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  sidebarSubmenu: {
    backgroundColor: 'rgb(255 120 120 / 45%)',
    color: '#fff',
    '& $sidebarItem': {
      margin: 0,
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: "#fff"
      }
    },
    '& .MuiListItem-root': {
      paddingLeft: isRTL ? 18 : 40,
      paddingRight: isRTL ? 38 : 18,
    },
  },
  sidebarFooter: {
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    padding: theme.spacing(1, 0),
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
  },
  languageSelector: {
    margin: theme.spacing(0.5),
    color: '#000',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    '&:hover': {
      borderColor: '#FF0054',
      color: '#FF0054',
    },
  },
  userSection: {
    padding: theme.spacing(1),
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: theme.spacing(1),
  },
  tooltip: {
    backgroundColor: '#333',
    color: '#fff',
    fontSize: '0.8rem',
  },
  tooltipArrow: {
    color: '#333',
  },
  planTooltipCard: {
    padding: '4px 2px',
    minWidth: 0,
  },
  planTooltipLabel: {
    fontSize: '0.68rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
    display: 'block',
  },
  planTooltipName: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#FFD23F',
    display: 'block',
    marginBottom: 8,
  },
  planTooltipDivider: {
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
    marginBottom: 8,
  },
  planTooltipDatesRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
  },
  planTooltipDateCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  planTooltipDateLabel: {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  planTooltipDateValue: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#ffffff',
  },
  // Mobile styles
  mobileOverlay: {
    [theme.breakpoints.down('sm')]: {
      '& .MuiDrawer-paper': {
        width: '100%',
        maxWidth: 320,
      },
    },
  },
  userSettings: {
    background: 'none',
    fontWeight: '800',
    '&:hover': {
      background: 'none',
      borderColor: '#FF0054',
      color: '#FF0054',
    },
  },
  userSettingsContainerPopper: {
    // bottom: 90,
    width: 200,
    zIndex: 600
  },
  lastItemBorderRadius: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10
  },
  sidebarPlanSection: {
    padding: theme.spacing(1.2, 1.5),
    margin: theme.spacing(2, 1.5, 1, 1.5),
    borderRadius: 14,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 24px 0 rgba(0, 0, 0, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    color: '#ffffff',
    whiteSpace: 'normal',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.08) 100%)',
      borderColor: 'rgba(255, 255, 255, 0.28)',
      boxShadow: '0 12px 32px 0 rgba(0, 0, 0, 0.18)',
      transform: 'translateY(-2px)',
    }
  },
  sidebarPlanCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(0.8),
  },
  sidebarPlanTitle: {
    fontSize: '0.68rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  sidebarPlanHeaderIcon: {
    color: '#FFD23F',
    fontSize: '1rem',
  },
  sidebarPlanNameRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 6,
    minWidth: 0,
  },
  sidebarPlanName: {
    fontSize: '1.1rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #FFFBD4 0%, #FFD23F 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
    filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.15))',
    letterSpacing: '0.5px',
    marginBottom: 0,
    flexShrink: 1,
  },
  sidebarPlanDatesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: theme.spacing(2),
    paddingTop: theme.spacing(1.5),
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  sidebarPlanDateRow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.88rem',
    fontWeight: 400,
    color: '#ffffff',
    lineHeight: 1.4,
    '& strong': {
      color: '#ffffff',
      fontWeight: 600,
      marginInlineStart: 4,
    }
  },
  sidebarPlanCollapsedIcon: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(1),
    margin: theme.spacing(2, 'auto', 0, 'auto'),
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
  },
  sidebarUpgradeBtn: {
    padding: theme.spacing(0.4, 1),
    borderRadius: 20,
    backgroundColor: '#ffffff',
    color: '#FF0054',
    fontSize: '0.62rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    border: 'none',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    flexShrink: 0,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#FF0054',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(255, 0, 84, 0.25)',
      transform: 'scale(1.03)',
    },
    '&:active': {
      transform: 'scale(0.97)',
    }
  }
});