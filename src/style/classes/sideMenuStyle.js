const appBarTitleTextSize = { xs: 13, sm: 14, md: 10, lg: 16, xl: 14 }

const SIDEBAR_WIDTH = 280;
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
    borderBottomLeftRadius: isRTL ? 15 : 0,
    borderTopLeftRadius: isRTL ? 15 : 0,
    borderBottomRightRadius: isRTL ? 0 : 15,
    borderTopRightRadius: isRTL ? 0 : 15
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
  },
  sidebarNav: {
    flex: 1,
    padding: theme.spacing(1, 0),
  },
  sidebarItem: {
    margin: '6px 4px',
    margintop: '4px',
    paddingInlineStart: 5,
    paddingInlineEnd: 5,
    borderRadius: 0,
    justifyContent: 'center',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    '&.active': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    paddingInlineEnd: 15,
    justifyContent: 'center'
  },
  sidebarItemText: {
    '& .MuiListItemText-primary': {
      fontSize: '0.9rem',
      fontWeight: 500,
    },
  },
  sidebarSubmenu: {
    backgroundColor: 'rgb(255 120 120 / 45%)',
    color: '#fff',
    '& $sidebarItem': {
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)', //'linear-gradient(90deg, #FF0076 0%, #FF0054 23.8%, #FF4D2A 100%)',
        color: "#fff"
      }
    },
    '& .MuiListItem-root': {
      paddingLeft: theme.spacing(4),
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
    padding: theme.spacing(2),
    margin: theme.spacing(2, 2, 1, 2),
    borderRadius: 16,
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    color: '#ffffff',
    whiteSpace: 'normal',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.12)',
      borderColor: 'rgba(255, 255, 255, 0.25)',
      boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.25)',
      transform: 'translateY(-2px)',
    }
  },
  sidebarPlanCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
  },
  sidebarPlanTitle: {
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  sidebarPlanHeaderIcon: {
    color: '#FFEA79',
    fontSize: '1.1rem',
  },
  sidebarPlanName: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#FFEA79',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
    letterSpacing: '0.5px',
    marginBottom: theme.spacing(1.5),
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
    padding: theme.spacing(1.5),
    margin: theme.spacing(1, 'auto'),
    borderRadius: '50%',
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      transform: 'scale(1.05)',
    },
  },
  sidebarUpgradeBtn: {
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(0.6, 2),
    borderRadius: 20,
    backgroundColor: '#ffffff',
    color: '#FF0054',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    border: 'none',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease-in-out',
    alignSelf: isRTL ? 'flex-start' : 'flex-end',
    '&:hover': {
      backgroundColor: '#FF0054',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
  }
});