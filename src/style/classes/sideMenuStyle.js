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
    margin: 0,
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
  }
});