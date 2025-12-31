import React, { useState, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  HelpOutline,
  Code,
  Home as HomeIcon,
  FiberNew as NewsIcon,
  Close as CloseIcon,
  Message,
  ContactMail,
} from '@material-ui/icons';
import clsx from 'clsx';
import { closeHelpDrawer } from '../../redux/reducers/helpDrawerSlice';
import { MdAutoAwesome } from 'react-icons/md';
import { ContactSupportDialog } from './ContactSupportDialog'; // Adjust path as needed

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: 420,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 420,
    backgroundColor: '#f5f7fa',
    height: '100vh',
    border: 'none',
    boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  header: {
    padding: theme.spacing(3),
    position: 'relative',
    background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)'
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
    color: '#fff',
  },
  closeButtonRTL: {
    right: 'auto',
    left: theme.spacing(2),
  },
  title: {
    fontWeight: 600,
    fontSize: '1.5rem',
    marginBottom: theme.spacing(0.5),
    color: '#fff',
  },
  subtitle: {
    color: '#fff',
    fontSize: '0.9rem',
  },
  searchBox: {
    padding: theme.spacing(2),
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: theme.spacing(1),
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#e2e8f0',
      },
      '&:hover fieldset': {
        borderColor: '#cbd5e0',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2e7d32',
      },
    },
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  tab: {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    minWidth: 120,
  },
  tabsIndicator: {
    backgroundColor: '#2e7d32',
  },
  content: {
    padding: theme.spacing(2),
    overflowY: 'auto',
    height: 'calc(100vh - 240px)',
    paddingBottom: theme.spacing(4),
  },
  menuItem: {
    backgroundColor: '#fff',
    marginBottom: theme.spacing(1),
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f8f9fa',
      transform: 'translateX(-4px)',
    },
  },
  menuItemRTL: {
    '&:hover': {
      transform: 'translateX(4px)',
    },
  },
  menuIcon: {
    minWidth: 40,
    color: ' #ff3343',
    alignSelf: 'flex-start',
    paddingTop: theme.spacing(1),
  },
  menuTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  menuDescription: {
    fontSize: '0.85rem',
    color: '#718096',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    justifyContent: 'space-around',
    padding: theme.spacing(2),
  },
  bottomNavItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    position: 'relative',
    '&:hover': {
      opacity: 0.7,
    },
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e53e3e',
    color: '#fff',
    borderRadius: '50%',
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 'bold',
  },
  newsContent: {
    backgroundColor: '#fff',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  newsTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  newsDate: {
    fontSize: '0.85rem',
    color: '#718096',
    marginBottom: theme.spacing(1),
  },
  newsDescription: {
    fontSize: '0.9rem',
    color: '#4a5568',
  },
  actionButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    flexDirection: 'row',
  },
  actionButton: {
    padding: '2px 10px',
    fontWeight: 'bold',
    background: '#fff',
    minHeight: 34,
    color: '#000',
    borderRadius: 28,
    border: '2px solid #F65026',
    '& path': {
      stroke: 'inherit',
    },
    "@media screen and (max-width: 400px)": {
      '& .MuiButton-startIcon': {
        width: 'initial'
      }
    },
    '&:hover': {
      background: 'linear-gradient(90deg, #FF0076 0%, #FF0054 23.8%, #FF4D2A 100%)',
      color: '#fff',
      '& svg': {
        color: '#fff',
        fill: '#fff'
      }
    },
  },
}));

export const HelpDrawer: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isRTL, language } = useSelector((state: any) => state.core);
  const { isOpen } = useSelector((state: any) => state.helpDrawer);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const handleClose = () => {
    dispatch(closeHelpDrawer());
  };

  const getHelpCenterUrl = useMemo(() => {
    switch (language) {
      case 'he':
        return 'https://site.pulseem.co.il/%D7%9E%D7%93%D7%A8%D7%99%D7%9B%D7%99%D7%9D/';
      case 'pl':
        return 'https://pulseem.pl/?_gl=1%2A10nqxrj%2A_gcl_au%25';
      case 'en':
      default:
        return 'https://site.pulseem.com/?_gl=1%2Aaum0k9%2A_gcl_au%25';
    }
  }, [language]);

  const handleOpenSupportChat = () => {
    // handleClose();

    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).Tawk_API) {
        (window as any).Tawk_API.maximize();
      }
    }, 300);
  };

  const handleOpenContactForm = () => {
  setContactDialogOpen(true);
};

  const supportItems = [
    {
      icon: <HelpOutline />,
      title: t('dashboard.helpDrawer.support.helpCenter.title'),
      description: t('dashboard.helpDrawer.support.helpCenter.description'),
      action: () => window.open(getHelpCenterUrl, '_blank'),
    },
    {
      icon: <MdAutoAwesome />,
      title: t('dashboard.helpDrawer.support.pulseemGPT.title'),
      description: t('dashboard.helpDrawer.support.pulseemGPT.description'),
      action: () => window.open('https://chatgpt.com/g/g-683fe7903e188191b223275d68aa42ed-pulseem-support', '_blank'),
    },
      {
      icon: <Message />,
      title: t('dashboard.helpDrawer.support.supportChat.title'),
      description: t('dashboard.helpDrawer.support.supportChat.description'),
      action: handleOpenSupportChat,
    },
    {
      icon: <ContactMail />,
      title: t('dashboard.helpDrawer.support.contactUs.title'),
      description: t('dashboard.helpDrawer.support.contactUs.description'),
      action: handleOpenContactForm,
    },
    {
      icon: <Code />,
      title: t('dashboard.helpDrawer.support.APIIcon.title'),
      hasButtons: true,
    },
  ];

  const newsItems = [
    {
      title: t('helpDrawer.news.item1.title', 'New Feature: AI-Powered Campaigns'),
      date: '2025-12-15',
      description: t('helpDrawer.news.item1.description', 'We\'ve launched a new AI feature to help you create better campaigns with personalized content suggestions.'),
    },
    {
      title: t('helpDrawer.news.item2.title', 'System Maintenance Scheduled'),
      date: '2025-12-10',
      description: t('helpDrawer.news.item2.description', 'Scheduled maintenance on December 25th from 2 AM to 4 AM EST. Services may be temporarily unavailable.'),
    },
    {
      title: t('helpDrawer.news.item3.title', 'Enhanced Analytics Dashboard'),
      date: '2025-12-05',
      description: t('helpDrawer.news.item3.description', 'Check out our newly redesigned analytics dashboard with more insights and better visualization.'),
    },
  ];

  const filteredSupportItems = supportItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredNewsItems = newsItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Drawer
      anchor={isRTL ? 'left' : 'right'}
      open={isOpen}
      onClose={handleClose}
      className={classes.drawer}
      classes={{
        paper: classes.drawerPaper,
      }}
      ModalProps={{
        keepMounted: true,
        BackdropProps: {
          invisible: true,
        },
      }}
      elevation={16}
      SlideProps={{
        direction: isRTL ? 'right' : 'left'
      }}
      PaperProps={{
        style: {
          position: 'fixed',
          left: isRTL ? 0 : 'auto',
          right: isRTL ? 'auto' : 0,
          direction: isRTL ? 'rtl' : 'ltr',
        }
      }}
    >
      <Box style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        {/* Header */}
        <Box className={classes.header}>
          <IconButton
            className={clsx(classes.closeButton)}
            onClick={handleClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
          <Typography className={classes.title}>
            {t('dashboard.helpDrawer.title')}
          </Typography>
          <Typography className={classes.subtitle}>
            {t('dashboard.helpDrawer.subtitle')}
          </Typography>
        </Box>

        {/* Content */}
        <Box className={classes.content}>
          {activeTab === 0 ? (
            // Support Tab
            <List>
              {filteredSupportItems.map((item, index) => (
                <Paper
                  key={index}
                  className={clsx(classes.menuItem, isRTL && classes.menuItemRTL)}
                  elevation={0}
                  onClick={item.action}
                >
                  <ListItem disableGutters>
                    <ListItemIcon className={classes.menuIcon}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography className={classes.menuTitle}>
                          {item.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography className={classes.menuDescription}>
                            {item.description}
                          </Typography>
                          {item.hasButtons && (
                            <Box className={classes.actionButtons}>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                className={classes.actionButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open('https://ui-api.pulseem.com/swagger/index.html', '_blank');
                                }}
                              >
                                {t('dashboard.helpDrawer.support.APIIcon.UPIAPI')}
                              </Button>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                className={classes.actionButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open('https://api.pulseem.com/swagger/index.html', '_blank');
                                }}
                              >
                                {t('dashboard.helpDrawer.support.APIIcon.DirectSendAPI')}
                              </Button>
                            </Box>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            // What's New Tab
            <Box>
              {filteredNewsItems.map((item, index) => (
                <Paper key={index} className={classes.newsContent} elevation={0}>
                  <Typography className={classes.newsTitle}>
                    {item.title}
                  </Typography>
                  <Typography className={classes.newsDate}>
                    {new Date(item.date).toLocaleDateString()}
                  </Typography>
                  <Typography className={classes.newsDescription}>
                    {item.description}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>

        {/* Bottom Navigation */}
        {/* <Box className={classes.bottomNav}>
          <Box className={classes.bottomNavItem} onClick={() => setActiveTab(0)}>
            <HomeIcon className={classes.menuIcon} />
            <Typography variant="caption" style={{ marginTop: 4 }}>
              {t('helpDrawer.bottomNav.resourceCenter', 'Resource Center')}
            </Typography>
          </Box>
          <Box className={classes.bottomNavItem} onClick={() => setActiveTab(1)}>
            <NewsIcon className={classes.menuIcon} />
            <Typography variant="caption" style={{ marginTop: 4 }}>
              {t('helpDrawer.bottomNav.news', 'News')}
            </Typography>
            <Box className={classes.badge}>1</Box>
          </Box>
        </Box> */}
      </Box>
      <ContactSupportDialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
      />
    </Drawer>
  );
};

export default HelpDrawer;
