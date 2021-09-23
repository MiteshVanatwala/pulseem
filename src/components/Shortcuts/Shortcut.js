import React, { useState, useEffect, useRef, createRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import {
  Box, Button, ListItem, ListItemText, Paper, Typography, Popper,
  List, Collapse, Divider, IconButton, CircularProgress, Link, ClickAwayListener
} from '@material-ui/core';
import clsx from 'clsx';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { getShortcuts, setShortcuts, deleteShortcuts } from '../../redux/reducers/shortcutSlice';

const Shortcut = ({ classes, windowSize, t, isRTL }) => {
  const { shortcuts, shortCutsError } = useSelector(state => state.shortcuts);
  const { accountFeatures } = useSelector(state => state.core)
  const shortcutRef = useRef();
  const [selectedCategory, setCategoryValue] = useState({});
  const [selectedPage, setPageValue] = useState({});
  const [anchorEl, setAnchorEl] = useState({});
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [pageOpen, setPageOpen] = useState(false);
  const [bool, setbool] = useState([]);
  const [loading, setLoading] = useState({});
  const [activeShortcut, setActiveShortcut] = useState(null);
  const dispatch = useDispatch();
  const categories = {
    'appBar.groups.title': {
      title: 'appBar.groups.title',
      pages: [
        {
          title: 'dashboard.createGroup',
          link: '/Pulseem/Groups.aspx?NewGroup=true'
        },
        {
          title: 'appBar.groups.manageRecipients',
          link: '/Pulseem/Groups.aspx'
        },
        {
          title: 'appBar.groups.dynamicGroups',
          link: '/Pulseem/DynamicGroups.aspx'
        },
        {
          title: 'appBar.groups.search',
          link: '/Pulseem/ClientSearch.aspx'
        },
        // {
        //   title: 'dashboard.advanceSearch',
        //   link: '/Pulseem/ClientAdvancedSearch.aspx'
        // },
        {
          title: 'appBar.groups.fileUploads',
          link: '/Pulseem/FileUploads.aspx'
        }
      ]
    },
    'appBar.newsletter.title': {
      title: 'appBar.newsletter.title',
      pages: [
        {
          title: 'campaigns.create',
          link: '/Pulseem/Editor/CampaignInfo?new=1&fromreact=true'
        },
        {
          title: 'master.RadMenuItemResource9.Text',
          link: '/react/Campaigns'
        },
        {
          title: 'dashboard.createABTest',
          link: '/Pulseem/CampaignsByResults.aspx'
        },
        {
          title: 'master.linkAbTestingsResource1.Text',
          link: '/Pulseem/CampaignsAbTestings.aspx'
        },
        {
          title: 'master.RadMenuItemResource9a.Text',
          link: '/Pulseem/AutoSendPlans.aspx'
        },
        {
          title: 'master.RadMenuItemResource10.Text',
          link: '/Pulseem/CampaignTemplates.aspx'
        },
        {
          title: 'master.newslatterBasicEditor',
          link: '/Pulseem/CampaignEdit.aspx?NewsLetterType=Basic'
        }
      ]
    },
    'appBar.sms.title': {
      title: 'appBar.sms.title',
      pages: [
        {
          title: 'common.CreateSMS',
          link: '/Pulseem/SMSCampaignEdit.aspx'
        },
        {
          title: 'dashboard.smsManagement',
          link: '/react/SMSCampaigns'
        },
        {
          title: 'master.chatbotSMS',
          link: '/Pulseem/SMSSmartResponses.aspx'
        },
        {
          title: 'master.linkSMSResponsesReport.Text',
          link: '/Pulseem/ResponsesReport.aspx'
        }
      ]
    },
    'appBar.mms.title': {
      title: "appBar.mms.title",
      pages: [
        {
          title: 'common.CreateMMS',
          link: '/Pulseem/MmsCampaignEdit.aspx'
        },
        {
          title: 'dashboard.mmsManagement',
          link: '/react/MmsCampaigns'
        }
      ],
    },
    'appBar.landingPages.title': {
      title: "appBar.landingPages.title",
      pages: [
        {
          title: 'landingPages.CreateNewResource.Text',
          link: '/Pulseem/LandingPageWizard.aspx'
        },
        {
          title: 'landingPages.logPageHeaderResource1.Text',
          link: '/react/EditRegistrationPage'
        }
      ]
    },
    'appBar.reports.title': {
      title: 'appBar.reports.title',
      pages: [
        {
          title: 'master.RadMenuItemResource13.Text',
          link: '/Pulseem/MainReport.aspx'
        },
        {
          title: 'master.RadMenuItemResource24.Text',
          link: '/Pulseem/SMSMainReport.aspx'
        },
        {
          title: 'master.MmsMainReport.Text',
          link: '/Pulseem/MmsMainReport.aspx'
        },
        {
          title: 'master.AbTestsReport.Text',
          link: '/Pulseem/AbTestsReport.aspx'
        },
        {
          title: 'master.RadMenuItemResource15.Text',
          link: '/Pulseem/AccountReport.aspx'
        },
        {
          title: 'master.RadMenuItemResource18.Text',
          link: '/Pulseem/ClientReport.aspx'
        },
        {
          title: 'master.RadMenuItemResource30.Text',
          link: '/Pulseem/EmailAutoReports.aspx'
        },
        {
          title: 'dashboard.unsubscribeReports',
          link: '/Pulseem/RemovedStats.aspx'
        },
        {
          title: 'master.DirectReportsResource1.Text',
          link: '/Pulseem/DirectEmailReport.aspx'
        },
        {
          title: 'master.DirectSmsReport.Text',
          link: '/Pulseem/DirectSmsReport.aspx'
        },
        {
          title: 'dashboard.openedClickedReport',
          link: '/Pulseem/EmailCampaignStatistics.aspx'
        }

      ]
    },
    'appBar.automation.title': {
      title: 'appBar.automation.title',
      pages: [
        {
          title: 'automations.createResource.Text',
          link: '/Pulseem/CreateAutomations.aspx'
        },
        {
          title: 'dashboard.automationManagement',
          link: '/react/Automations'
        }
      ]
    }
  };

  if (accountFeatures && !accountFeatures.error && accountFeatures !== null && accountFeatures.indexOf('35') > -1) {
    categories['appBar.notifications.title'] = {
      title: 'appBar.notifications.title',
      pages: [
        {
          title: 'dashboard.createNotification',
          link: '/react/Notification/create'
        },
        {
          title: 'dashboard.notificationManagement',
          link: '/react/Notifications'
        }
      ]
    }
  }

  const initData = async () => {
    let r = await dispatch(getShortcuts());
  }

  useEffect(() => {
    initData();
  }, [dispatch])

  const handlePageChange = useCallback((title, href, update, num, index) => {
    const data = {
      ID: update && num,
      CategoryName: categories[selectedCategory[num]].title,
      ShortcutName: title,
      ShortcutUrl: href
    };
    let loading = {};
    loading[index] = true;
    setAnchorEl({});
    setCategoryValue({});
    setPageOpen(false);
    setLoading(loading);
    dispatch(setShortcuts(data)).then(() => {

      dispatch(getShortcuts());
      setLoading({});
    })
  });

  const handleClickOutsideShortcut = (event) => {
    if (event && event.target
      && event.target.id !== 'shortcutToggle'
      && event.target.id !== 'shortcutMenu'
      && event.target.parentNode.id !== 'editIcon'
      && event.target.parentNode.id !== 'btnSelectNew') {
      setAnchorEl({});
      setCategoryValue({});
      setPageOpen(false);
    }
  }

  const renderShortcutMenu = (num, update, index) => {
    let pageTitle = selectedPage[num] && selectedPage[num].title || '';
    let categoryTitle = selectedCategory[num] && categories[selectedCategory[num]].title || '';
    const open = Boolean(anchorEl[num]);

    if (shortcuts.length > 0) {
      const selectedShortcut = shortcuts.filter(e => { return e.ID === num })[0];
      if (selectedShortcut) {
        if (pageTitle === '') {
          pageTitle = selectedShortcut ? t(selectedShortcut.ShortcutName) : '';
        }
        if (categoryTitle === '') {
          categoryTitle = selectedShortcut ? selectedShortcut.CategoryName : '';
          let category = {};
          category[num] = selectedShortcut.CategoryName
        }
      }
    }

    const handleCategoryChange = (val) => {
      let page = selectedPage;
      let category = selectedCategory;
      page[num] = null;
      category[num] = val;

      setPageValue(page);
      setCategoryValue(category);
      setCategoryOpen(false);
      setPageOpen(false);
    }

    // let placementPopper = 'left-start';
    // if (windowSize === 'xs') {
    //   placementPopper = 'bottom-start'
    // }
    // else {
    //   if (!index && num > 2 || index > 2) {
    //     placementPopper = isRTL ? 'right-end' : 'left-end';
    //   }
    // }


    return (
      <ClickAwayListener onClickAway={handleClickOutsideShortcut}>
        <Popper
          transition
          id="shortcutMenu"
          key={`shortcutMenu${index}`}
          open={open}
          anchorEl={anchorEl[num]}
          placement={isRTL ? 'right-start' : 'left-start'}
          // disablePortal={false}
          style={{ zIndex: 2 }}>

          <Paper className={classes.popperPaper}>
            <List component="nav" className={classes.shortcutList}>
              <ListItem
                key={`selectCategory`}
                button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className={clsx(classes.pt0, classes.pb0)}>
                <ListItemText primary={categoryTitle ? t(categoryTitle) : t('common.SelectCategory')} />
                {categoryOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={categoryOpen} timeout="auto" unmountOnExit>
                <Divider />
                <List component="div">
                  {Object.keys(categories).map(cat => {
                    return (
                      <ListItem
                        key={`category${Math.round(Math.random() * 999999999)}`}
                        button
                        className={clsx(classes.pt0, classes.pb0)}
                        onClick={() => handleCategoryChange(cat)}>
                        <ListItemText primary={t(categories[cat].title)} />
                      </ListItem>
                    )
                  })}
                </List>
              </Collapse>
            </List>
            <List component="nav" className={classes.shortcutList}>
              <ListItem
                key={`selectPage`}
                button
                onClick={() => setPageOpen(!pageOpen)}
                className={clsx(classes.pt0, classes.pb0)}
                disabled={!selectedCategory[num] && pageTitle === ''}>
                <ListItemText primary={pageTitle ? pageTitle : t('common.SelectPage')} />
                {pageOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              {selectedCategory[num] ?
                <Collapse in={pageOpen} timeout="auto" unmountOnExit>
                  <Divider />
                  <List component="div">
                    {categories[selectedCategory[num]].pages.map(page => {
                      return (
                        <ListItem
                          key={`pageItem${Math.round(Math.random() * 999999999)}`}
                          button
                          className={clsx(classes.pt0, classes.pb0)}
                          onClick={() => handlePageChange(page.title, page.link, update, num, index)}>
                          <ListItemText primary={t(page.title)} style={{ direction: isRTL ? 'rtl' : null }} />
                        </ListItem>
                      )
                    })}
                  </List>
                </Collapse>
                : null}
            </List>
          </Paper>
        </Popper>
      </ClickAwayListener>
    );
  }

  const deleteShortcut = async () => {
    if (activeShortcut !== null) {
      const sid = activeShortcut.replace('short_', '');
      await dispatch(deleteShortcuts(sid));
      initData();
    }
  }

  const handleShortcutMenuOpen = (event, num, update, index) => {
    let pageTitle = selectedPage[num] && selectedPage[num].title || '';
    let categoryTitle = selectedCategory[num] && categories[selectedCategory[num]].title || '';
    let refElement = event.currentTarget || event.current || '';
    if (!refElement) {
      return;
    }
    let data = {};
    data[num] = num == Object.keys(anchorEl) && anchorEl[num] ? null : refElement;
    if (shortcuts.length > 0) {
      const selectedShortcut = shortcuts.filter(e => { return e.ID === num })[0];
      if (selectedShortcut) {
        if (pageTitle === '') {
          pageTitle = selectedShortcut ? t(selectedShortcut.ShortcutName) : '';
        }
        if (categoryTitle === '') {
          categoryTitle = selectedShortcut ? selectedShortcut.CategoryName : '';
          let category = {};
          category[num] = selectedShortcut.CategoryName

          setCategoryValue(category);
        }
      }
    }
    setAnchorEl(data);
    setPageOpen(false);
    setCategoryOpen(false);
  };

  const renderShortcutButton = (data, index) => {
    if (loading[index]) {
      return (
        <Box className={classes.shortcutBtnBox} key={`shortcutLoading${index}`}>
          <Button
            variant='contained'
            color='primary'
            classes={{
              label: classes.shortcutLabel,
              root: classes.shortcutButton
            }}>
            <CircularProgress className={classes.white} />
          </Button>
        </Box>
      );
    }

    const innerRef = createRef();
    return (
      <Box
        onMouseEnter={() => setActiveShortcut(`short_${data.ID}`)}
        onMouseLeave={() => setActiveShortcut(null)}
        key={`shortcutButton${index}`} ref={innerRef} className={classes.shortcutBtnBox}>
        {activeShortcut === `short_${data.ID}` && <Link className={classes.deleteShortcut}
          onClick={deleteShortcut}
        >x</Link>}
        <Button
          variant='contained'
          color='primary'
          href={data.ShortcutUrl}
          classes={{
            label: classes.shortcutLabel,
            root: classes.shortcutButton
          }}>
          <Typography align='center' className={clsx(classes.categoryLabel, classes.mb5)}>{t(data.CategoryName)}</Typography>
          <Typography align='center' className={classes.pageTitle}>{t(data.ShortcutName)}</Typography>
        </Button>
        {windowSize !== 'xs' && windowSize !== 'sm' && <IconButton
          id="editIcon"
          className={classes.shortcutEditIcon}
          onClick={(e) => handleShortcutMenuOpen(windowSize == 'xs' ? e : innerRef, data.ID, true, index)}>
          {'\uE09C'}
        </IconButton>
        }
        {renderShortcutMenu(data.ID, true, index)}
      </Box>
    );
  }

  const renderNewShortcutButtons = () => {
    let newShortcutButtons = [];
    for (let index = shortcuts.length; index < 5; index++) {
      const innerRef = createRef();
      newShortcutButtons.push(
        <Box className={classes.shortcutBtnBox} key={`emptyShortcutBtn${index}`} ref={innerRef}>
          <Button
            id="btnSelectNew"
            color='primary'
            fullWidth
            className={classes.shortcutDottedButton}
            onClick={(e) => handleShortcutMenuOpen(windowSize == 'xs' ? e : innerRef, index)}>
            {'\uE0E4'}
          </Button>
          {renderShortcutMenu(index)}
        </Box>
      )
    }

    return newShortcutButtons;
  }
  if (shortcuts.length > 0 && windowSize === 'xs' || windowSize !== 'xs') {
    return (
      <Box className={classes.shortcutBox}>
        <Paper elevation={windowSize == 'xs' ? 3 : 0} className={classes.shortcutPaper} ref={shortcutRef}>
          <Box className={classes.shortcutTitleSection}>
            <Typography align='center' className={classes.shortcutTitle}>{t('dashboard.myShortcuts')}</Typography>
            <Typography align='center' className={classes.shortcutSubtitle}>{t('dashboard.addQuickButtons')}</Typography>
          </Box>
          {shortcuts && shortcuts.map((item, index) => {
            return renderShortcutButton(item, index)
          })}
          {windowSize !== 'xs' && renderNewShortcutButtons()}
        </Paper>
      </Box>
    )
  }
  return (<></>)

}


export default React.memo(Shortcut);