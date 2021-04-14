const drawerWidth='15.8rem';

export const getDrawerStyle=(windowSize,isRTL=false,theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    backgroundColor: '#0371AD',
    borderRight: '2px solid #000',
    transition: theme.transitions.create('width',{
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    backgroundColor: '#0371AD',
    borderRight: '2px solid #000',
    justifyContent: 'center',
    transition: theme.transitions.create('width',{
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    drawerItem: {
      color: '#fff'
    },
    overflowX: 'hidden',
    width: theme.spacing(7)+1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9)+1,
    },
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  divider: {
    backgroundColor: 'white',
    marginBlock: 10
  },
  bottomToolbar: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBottom: 20
  },
  contactIconStyle: {
    color: 'white'
  },
  logoutIconStyle: {
    width: '1.9rem'
  },
  borgerContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '2.8rem',
    height: '1.8rem !important',
    cursor: 'pointer',
    marginInlineStart: 10,
    alignSelf: 'flex-start',
    paddingBlockStart: 10,
    paddingBlockEnd: 20,
  },
  borgerLine: {
    width: '100%',
    height: '0.4rem',
    //marginBottom: 4,
    borderRadius: 2,
    backgroundColor: 'white'
  },
  drawerItemHover: {
    borderLeft: isRTL? 0:'5px solid #fff',
    borderRight: isRTL? '5px solid #fff':0

  },
  drawerItemTextStyle: {
    color: 'white',
    fontSize: '1.2rem',
    fontFamily: 'Assistant'
  },
  drawerItemTextHoverStyle: {
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Assistant',
    fontSize: '1.2rem'
  },
  drawerItemList: {
    backgroundColor: 'rgba(242, 242, 242, 0.83)'
  },
  drawerItemInnerTextStyle: {
    color: '#555555',
    marginInlineStart: 10,
    fontSize: '0.9rem',
    fontFamily: 'Assistant'
  },
  drawerItemInnerTextHoverStyle: {
    color: '#555555',
    marginInlineStart: 10,
    fontSize: '0.9rem',
    fontWeight: 'bold',
    fontFamily: 'Assistant'
  },
})