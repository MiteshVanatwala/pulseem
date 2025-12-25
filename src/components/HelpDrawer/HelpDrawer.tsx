import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Close as CloseIcon, Search as SearchIcon } from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  HelpOutline, 
  ContactSupport, 
  Description, 
  Code, 
  Group,
  Home as HomeIcon,
  FiberNew as NewsIcon
} from '@material-ui/icons';
import clsx from 'clsx';
import { closeHelpDrawer } from '../../redux/reducers/helpDrawerSlice';

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
    backgroundColor: '#e8f5e9',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
  closeButtonRTL: {
    right: 'auto',
    left: theme.spacing(2),
  },
  title: {
    fontWeight: 600,
    fontSize: '1.5rem',
    marginBottom: theme.spacing(0.5),
    color: '#2e7d32',
  },
  subtitle: {
    color: '#4a5568',
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
    height: 'calc(100vh - 280px)',
    paddingBottom: theme.spacing(10),
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
    color: '#2e7d32',
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
}));

export const HelpDrawer: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isRTL } = useSelector((state: any) => state.core);
  const { isOpen } = useSelector((state: any) => state.helpDrawer);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleClose = () => {
    dispatch(closeHelpDrawer());
  };

  const supportItems = [
    {
      icon: <HelpOutline />,
      title: t('helpDrawer.helpCenter.title', 'Help Center'),
      description: t('helpDrawer.helpCenter.description', 'Find answers, tips, and troubleshooting in our articles.'),
      action: () => window.open('https://help.pulseem.com', '_blank'),
    },
    {
      icon: <ContactSupport />,
      title: t('helpDrawer.supportTickets.title', 'Support and Tickets'),
      description: t('helpDrawer.supportTickets.description', 'Make a request to our support team to get help, and find all your tickets.'),
      action: () => console.log('Support tickets'),
    },
    {
      icon: <Group />,
      title: t('helpDrawer.hireAgency.title', 'Hire an agency'),
      description: t('helpDrawer.hireAgency.description', 'Looking for help with a project? We can match you with the right certified Agency partner.'),
      action: () => console.log('Hire agency'),
    },
    {
      icon: <Code />,
      title: t('helpDrawer.apiDocs.title', 'API documentation'),
      description: t('helpDrawer.apiDocs.description', 'Use our APIs to unlock the power of Pulseem.'),
      action: () => window.open('https://api.pulseem.com', '_blank'),
    },
    {
      icon: <Description />,
      title: t('helpDrawer.community.title', 'Community'),
      description: t('helpDrawer.community.description', 'Discuss with other users to know how to get the best out of Pulseem.'),
      action: () => console.log('Community'),
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

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  const filteredSupportItems = supportItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
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
    >
      <Box>
        {/* Header */}
        <Box className={classes.header}>
          <IconButton
            className={clsx(classes.closeButton, isRTL && classes.closeButtonRTL)}
            onClick={handleClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
          <Typography className={classes.title}>
            {t('helpDrawer.title', 'Need help?')}
          </Typography>
          <Typography className={classes.subtitle}>
            {t('helpDrawer.subtitle', 'We\'ve got everything you need right here.')}
          </Typography>
        </Box>

        {/* Tabs */}
        <Box className={classes.tabsContainer}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            classes={{
              indicator: classes.tabsIndicator,
            }}
          >
            <Tab label={t('helpDrawer.tabs.support', 'Support')} className={classes.tab} />
            <Tab label={t('helpDrawer.tabs.whatsNew', 'What\'s New')} className={classes.tab} />
          </Tabs>
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
                        <Typography className={classes.menuDescription}>
                          {item.description}
                        </Typography>
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
        <Box className={classes.bottomNav}>
          <Box className={classes.bottomNavItem} onClick={() => setActiveTab(0)}>
            <HomeIcon />
            <Typography variant="caption" style={{ marginTop: 4 }}>
              {t('helpDrawer.bottomNav.resourceCenter', 'Resource Center')}
            </Typography>
          </Box>
          <Box className={classes.bottomNavItem} onClick={() => setActiveTab(1)}>
            <NewsIcon />
            <Typography variant="caption" style={{ marginTop: 4 }}>
              {t('helpDrawer.bottomNav.news', 'News')}
            </Typography>
            <Box className={classes.badge}>1</Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default HelpDrawer;
