import React, { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { Sidebar } from './SideBar';
import { TopAppBar } from './TopAppBar';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 70;

interface MainLayoutProps {
  children: React.ReactNode;
  classes: any;
  currentPage?: string;
  showAppBar?: boolean;
  subPage?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    minHeight: '100vh',
  },
  content: {
    flexGrow: 1,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  contentShift: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      marginRight: 0,
      width: '100%',
    },
  },
  contentShiftRTL: {
    // marginRight: SIDEBAR_WIDTH,
    marginLeft: 0,
    width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
  },
  contentShiftLTR: {
    // marginLeft: SIDEBAR_WIDTH,
    marginRight: 0,
    width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
  },
  contentCollapsedRTL: {
    marginRight: SIDEBAR_COLLAPSED_WIDTH,
    marginLeft: 0,
    width: `calc(100% - ${SIDEBAR_COLLAPSED_WIDTH}px)`,
  },
  contentCollapsedLTR: {
    marginLeft: SIDEBAR_COLLAPSED_WIDTH,
    marginRight: 0,
    width: `calc(100% - ${SIDEBAR_COLLAPSED_WIDTH}px)`,
  },
  contentContainer: {
    // paddingInline: theme.spacing(3),
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      paddingInline: theme.spacing(2),
    },
    [theme.breakpoints.down('xs')]: {
      paddingInline: theme.spacing(1),
    },
  },
  topBarSpacer: {
    minHeight: 48,
    [theme.breakpoints.down('sm')]: {
      minHeight: 64,
    },
  },
}));

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  classes: externalClasses,
  currentPage = '',
  subPage = '',
  showAppBar = true
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { windowSize, isRTL } = useSelector((state: any) => state.core);

  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const getContentClasses = () => {
    if (isMobile) {
      return classes.content;
    }

    if (isSidebarCollapsed) {
      return `${classes.content} ${classes.contentShift} ${isRTL ? classes.contentCollapsedRTL : classes.contentCollapsedLTR}`;
    }

    return `${classes.content} ${classes.contentShift} ${isRTL ? classes.contentShiftRTL : classes.contentShiftLTR
      }`;
  };

  return (
    <div className={classes.root}>
      <Sidebar
        classes={externalClasses}
        currentPage={currentPage}
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
        isCollapsed={isSidebarCollapsed}
        subPage={subPage}
      />
      <main className={getContentClasses()}>
        <div className={classes.contentContainer} style={{ 
          marginTop: isMobile ? 56 : 0 
        }}>
          {/* Pass the toggle function to children via React.cloneElement */}
          {React.Children.map(children, child => {
            if (React.isValidElement(child) && typeof child.type === 'function' && child.type.name === 'TopMenu') {
              return React.cloneElement(child, { onMenuToggle: handleSidebarToggle });
            }
            return child;
          })}
        </div>
      </main>
    </div>
  );
};