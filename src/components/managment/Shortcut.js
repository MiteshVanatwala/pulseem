import React,{useState,useEffect, useRef, createRef} from 'react';
import {useTranslation} from 'react-i18next'
import {useSelector,useDispatch} from 'react-redux'
import { 
  Box, Button, ListItem, ListItemText, Paper, Typography, Popper, Fade, 
  List, Collapse, Divider, IconButton, CircularProgress 
} from '@material-ui/core';
import clsx from 'clsx';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { getShortcuts, setShortcuts } from '../../redux/reducers/dashboardSlice';

export const Shortcut=({classes}) => {
  const {windowSize}=useSelector(state => state.core);
  const {shortcuts,shortCutsError }=useSelector(state => state.dashboard);
  const shortcutRef=useRef();
  const [selectedCategory, setCategoryValue]=useState({});
  const [selectedPage, setPageValue]=useState({});
  const [anchorEl, setAnchorEl] = useState({});
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [pageOpen, setPageOpen] = useState(false);
  const {t}=useTranslation();
  const dispatch=useDispatch();
  const categories = {
    Groups: {
      title: 'appBar.groups.title', 
      pages: [
        {
          title: 'dashboard.createGroup',
          link: 'https://www.pulseem.co.il/Pulseem/Groups.aspx?NewGroup=true'
        },
        {
          title: 'appBar.groups.manageRecipients',
          link: 'https://www.pulseem.co.il/Pulseem/Groups.aspx'
        },
        {
          title: 'appBar.groups.dynamicGroups',
          link: 'https://www.pulseem.co.il/Pulseem/DynamicGroups.aspx'
        },
        {
          title: 'appBar.groups.search',
          link: 'https://www.pulseem.co.il/Pulseem/ClientSearch.aspx'
        },
        {
          title: 'dashboard.advanceSearch',
          link: 'https://www.pulseem.co.il/Pulseem/ClientAdvancedSearch.aspx'
        },
        {
          title: 'appBar.groups.fileUploads',
          link: 'https://www.pulseem.co.il/Pulseem/FileUploads.aspx'
        }
      ]
    },
    Newsletter: {
      title: 'appBar.newsletter.title',
      pages: [
        {
          title: 'campaigns.create',
          link: 'https://www.pulseem.co.il/Pulseem/CampaignEdit.aspx'
        },
        {
          title: 'master.RadMenuItemResource9.Text',
          link: 'https://www.pulseem.co.il/Pulseem/Campaigns.aspx'
        },
        {
          title: 'Create A/B Test',
          link: 'https://www.pulseem.co.il/Pulseem/CampaignsByResults.aspx'
        },
        {
          title: 'master.linkAbTestingsResource1.Text',
          link: 'https://www.pulseem.co.il/Pulseem/CampaignsAbTestings.aspx'
        },
        {
          title: 'master.RadMenuItemResource9a.Text',
          link: 'https://www.pulseem.co.il/Pulseem/AutoSendPlans.aspx'
        },
        {
          title: 'master.RadMenuItemResource10.Text',
          link: 'https://www.pulseem.co.il/Pulseem/CampaignTemplates.aspx'
        }
      ]
    },
    SMS: {
      title: 'appBar.sms.title', 
      pages: [
        {
          title: 'common.CreateSMS',
          link: 'https://www.pulseem.co.il/Pulseem/SMSCampaignEdit.aspx'
        },
        {
          title: 'dashboard.smsManagement',
          link: 'https://www.pulseem.co.il/Pulseem/SMSCampaigns.aspx'
        },
        {
          title: 'master.chatbotSMS',
          link: 'https://www.pulseem.co.il/Pulseem/SMSSmartResponses.aspx'
        },
        {
          title: 'master.linkSMSResponsesReport.Text',
          link: 'https://www.pulseem.co.il/Pulseem/ResponsesReport.aspx'
        }
      ]
    },
    MMS: {
      title: "appBar.mms.title",
      pages: [
        {
          title: 'common.CreateMMS',
          link: 'https://www.pulseem.co.il/Pulseem/MmsCampaignEdit.aspx'
        },
        {
          title: 'dashboard.mmsManagement',
          link: 'https://www.pulseem.co.il/Pulseem/MmsCampaigns.aspx'
        }
      ],
    },
    LandingPages: {
      title: "appBar.landingPages.title",
      pages: [
        {
          title: 'landingPages.CreateNewResource.Text',
          link: 'https://www.pulseem.co.il/Pulseem/LandingPageWizard.aspx'
        },
        {
          title: 'landingPages.logPageHeaderResource1.Text',
          link: 'https://www.pulseem.co.il/Pulseem/EditRegistrationPage.aspx'
        }
      ]
    },
    Reports: {
      title: 'appBar.reports.title',
      pages: [
        {
          title: 'master.RadMenuItemResource13.Text',
          link: 'https://www.pulseem.co.il/Pulseem/MainReport.aspx'
        },
        {
          title: 'master.RadMenuItemResource24.Text',
          link: 'https://www.pulseem.co.il/Pulseem/SMSMainReport.aspx'
        },
        {
          title: 'master.MmsMainReport.Text',
          link: 'https://www.pulseem.co.il/Pulseem/MmsMainReport.aspx'
        },
        {
          title: 'master.AbTestsReport.Text',
          link: 'https://www.pulseem.co.il/Pulseem/AbTestsReport.aspx'
        },
        {
          title: 'master.RadMenuItemResource15.Text',
          link: 'https://www.pulseem.co.il/Pulseem/AccountReport.aspx'
        },
        {
          title: 'master.RadMenuItemResource18.Text',
          link: 'https://www.pulseem.co.il/Pulseem/ClientReport.aspx'
        },
        {
          title: 'master.RadMenuItemResource30.Text',
          link: 'https://www.pulseem.co.il/Pulseem/EmailAutoReports.aspx'
        },
        {
          title: 'dashboard.unsubscribeReports',
          link: 'https://www.pulseem.co.il/Pulseem/RemovedStats.aspx'
        },
        {
          title: 'master.DirectReportsResource1.Text',
          link: 'https://www.pulseem.co.il/Pulseem/DirectEmailReport.aspx'
        },
        {
          title: 'master.DirectSmsReport.Text',
          link: 'https://www.pulseem.co.il/Pulseem/DirectSmsReport.aspx'
        },
        {
          title: 'dashboard.openedClickedReport',
          link: 'https://www.pulseem.co.il/Pulseem/EmailCampaignStatistics.aspx'
        }

      ]
    },
    Automations: {
      title: 'appBar.automation.title',
      pages: [
        {
          title: 'automations.createResource.Text',
          link: 'https://www.pulseem.co.il/Pulseem/CreateAutomations.aspx'
        },
        {
          title: 'dashboard.automationManagement',
          link: 'https://www.pulseem.co.il/Pulseem/Automations.aspx'
        }
      ]
    },
    Notifications: {
      title: 'appBar.notifications.title',
      pages: [
        {
          title: 'Create Notification',
          link: 'https://www.pulseem.co.il/Pulseem/Notification.aspx?t=main'
        },
        {
          title: 'Notification Management',
          link: 'https://www.pulseem.co.il/Pulseem/Notification.aspx?t=main'
        }
      ]
    }
    
  };

  const initData=()=>{
    dispatch(getShortcuts());
  }
  useEffect(initData,[dispatch])

  const renderShortcutMenu=(num, update)=>{
    const pageTitle = selectedPage[num] && selectedPage[num].title || '';
    const categoryTitle = selectedCategory[num] && categories[selectedCategory[num]].title || '';
    const open = Boolean(anchorEl[num]);

    const handleCategoryChange=(val)=>{
      let page = selectedPage;
      let category = selectedCategory;
      page[num]=null;
      category[num]=val;

      setPageValue(page);
      setCategoryValue(category);
      setCategoryOpen(false);
      setPageOpen(false);
    }

    const handlePageChange=async (title, href)=>{
      const data={
        ID: update&&num,
        CategoryName: categories[selectedCategory[num]].title, 
        ShortcutName: title, 
        ShortcutUrl: href
      };
      setAnchorEl({});
      setCategoryValue({});
      setPageOpen(false);
      await dispatch(setShortcuts(data));
      await dispatch(getShortcuts());
    }

    return(
      <Popper  
        open={open} 
        anchorEl={anchorEl[num]} 
        placement={windowSize==='xs'?'bottom-start':'left-start'} 
        transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper className={classes.popperPaper}>
              <List component="nav" className={classes.shortcutList}>
                <ListItem 
                  key={`selectCategory`}
                  button 
                  onClick={()=>setCategoryOpen(!categoryOpen)} 
                  className={clsx(classes.pt0, classes.pb0)}>
                  <ListItemText primary={categoryTitle? t(categoryTitle):t('common.SelectCategory')} />
                  {categoryOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={categoryOpen} timeout="auto" unmountOnExit>
                  <Divider />
                  <List component="div" disablePadding>
                    {Object.keys(categories).map((cat, index)=>{
                      return (
                        <ListItem 
                          key={`category${index}`}
                          button 
                          className={clsx(classes.pt0, classes.pb0)} 
                          onClick={()=>handleCategoryChange(cat)}>
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
                  onClick={()=>setPageOpen(!pageOpen)} 
                  className={clsx(classes.pt0, classes.pb0)}
                  disabled={!selectedCategory[num]}>
                  <ListItemText primary={pageTitle? pageTitle: t('common.SelectPage')} />
                  {pageOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                {selectedCategory[num]?
                  <Collapse in={pageOpen} timeout="auto" unmountOnExit>
                    <Divider />
                    <List component="div" disablePadding>
                      {categories[selectedCategory[num]].pages.map((page, index)=>{
                        return (
                          <ListItem 
                            key={`pageItem${index}`}
                            button 
                            className={clsx(classes.pt0, classes.pb0)} 
                            onClick={()=>handlePageChange(page.title, page.link)}>
                            <ListItemText primary={t(page.title)} />
                          </ListItem>
                        )
                      })}
                    </List>
                  </Collapse>
                  :null}
              </List>
            </Paper>
          </Fade>
        )}
      </Popper>
    );
  }

  const handleShortcutMenuOpen=(event, num)=>{
    let refElement = event.currentTarget || event.current || '';
    if (!refElement) {
      return;
    }

    let data = {};
    data[num] = num == Object.keys(anchorEl) && anchorEl[num]? null:refElement;
    setAnchorEl(data);
    setPageOpen(false);
    setCategoryOpen(false);
  };

  const renderShortcutButton=(data, innerRef)=>{
    if (data.loading) {
      return (
        <CircularProgress />
      );
    }

    return (
      <>
        <Box className={classes.shortcutBtnBox} ref={innerRef}>
          <Button 
            variant='contained' 
            color='primary' 
            href={data.ShortcutUrl}
            classes={{
              label:classes.shortcutLabel,
              root: classes.shortcutButton}}>
            <Typography align='center' className={classes.categoryLabel}>{t(data.CategoryName)}</Typography>
            <Typography align='center' className={classes.pageTitle}>{t(data.ShortcutName)}</Typography>
          </Button>
          <IconButton  
            className={classes.shortcutEditIcon} 
            onClick={(e)=>handleShortcutMenuOpen(windowSize=='xs'?e:innerRef, data.ID)}>
            {'\uE09C'}
          </IconButton>
        </Box>
        {renderShortcutMenu(data.ID, true)}
      </>
    );
  }

  const renderNewShortcutButtons=()=>{
    let newShortcutButtons = [];
    for (let index = shortcuts.length; index < 5; index++) {
      newShortcutButtons.push(
        <Box className={classes.shortcutBtnBox}>
          <Button 
            color='primary' 
            fullWidth 
            className={classes.shortcutDottedButton}
            onClick={(e)=>handleShortcutMenuOpen(e,index)}>{'\uE0E4'}
          </Button>
          {renderShortcutMenu(index)}
        </Box>
      ) 
    }

    return newShortcutButtons;
  }

  return (
      <Box className={classes.shortcutBox}>
        <Paper elevation={windowSize=='xs'?3:0} className={classes.shortcutPaper} ref={shortcutRef}>
          <Box className={classes.shortcutTitleSection}>
            <Typography align='center' className={classes.shortcutTitle}>{t('dashboard.myShortcuts')}</Typography>
            <Typography align='center' className={classes.shortcutSubtitle}>{t('dashboard.addQuickButtons')}</Typography>
          </Box>
          {shortcuts.map(item=>{
            const innerRef = createRef();
            return renderShortcutButton(item, innerRef)
          })}
          {renderNewShortcutButtons()}
        </Paper>
      </Box>
  );
}