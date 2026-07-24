import React, { useState, useEffect } from 'react';
import { useTheme, useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import { setSidebarCollapsed } from '../../../redux/reducers/coreSlice';
import { Sidebar } from './SideBar';
import TopMenu from '../TopMenu/TopMenu';
import type { TopMenuProps } from '../TopMenu/TopMenu';
import { getCookie } from '../../../helpers/Functions/cookies';

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
    minWidth: 0,
    transition: theme.transitions.create(['margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    display: 'flex',
    flexDirection: 'column',
  },
  contentShift: {
    transition: theme.transitions.create(['margin'], {
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
    marginLeft: 0,
  },
  contentShiftLTR: {
    marginRight: 0,
  },
  contentCollapsedRTL: {
    marginLeft: 0,
  },
  contentCollapsedLTR: {
    marginRight: 0,
  },
  contentContainer: {
    paddingInline: theme.spacing(2),
    flexGrow: 1,
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
  // theme.breakpoints.down('md') resolves against a hardcoded key list that doesn't know about
  // the custom 'sl' breakpoint, so it would treat 1300-1366px as mobile too (matches Sidebar.tsx's
  // own isMobile cutoff instead, which is the actual "sidebar closes below 1300px" boundary).
  // 1300 is theme.js's 'sl' value; passed as a number since the Breakpoint type doesn't know 'sl'.
  const isMobile = !useMediaQuery(theme.breakpoints.up(1300));

  const { isRTL } = useSelector((state: any) => state.core);
  const dispatch = useDispatch();

  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const cookie = getCookie('SidebarCollapsed');
    if (cookie !== null) return cookie === 'true';
    return false;
  });

  // Handle responsive behavior
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    dispatch(setSidebarCollapsed(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const handleSidebarToggle = (newState?: boolean) => {
    if (isMobile) {
      setIsSidebarOpen(typeof newState === 'boolean' ? newState : !isSidebarOpen);
    } else {
      setIsSidebarCollapsed(typeof newState === 'boolean' ? newState : !isSidebarCollapsed);
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
          marginTop: isMobile ? 76 : 0 
        }}>
          {/* Pass the toggle function to children via React.cloneElement */}
          {React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === TopMenu) {
              return React.cloneElement(
                child as React.ReactElement<TopMenuProps>,
                { onMenuToggle: handleSidebarToggle }
              );
            }
            return child;
          })}
        </div>
      </main>
    </div>
  );
};