import React, { useState, useEffect, useRef, createRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import {
  Box, Button, ListItem, ListItemText, Paper, Typography, Popper,
  List, Collapse, Divider, IconButton, CircularProgress, Link, ClickAwayListener
} from '@material-ui/core';
import clsx from 'clsx';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { getShortcuts, setShortcuts, deleteShortcuts } from '../../redux/reducers/shortcutSlice';
import { DASHBOARD_SHORTCUT } from '../../model/Shortcuts/DashboardShortcuts';
import useRedirect from '../../helpers/Routes/Redirect';
import { FlagIcon } from '../../assets/images/dashboard/index'
import { CgCloseO } from 'react-icons/cg';
import { sitePrefix } from '../../config';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';

const Shortcut = ({ classes, windowSize, t, isRTL }) => {
  const { shortcuts } = useSelector(state => state.shortcuts);
  const { accountFeatures } = useSelector(state => state.common)
  const shortcutRef = useRef();
  const [selectedCategory, setCategoryValue] = useState({});
  const [selectedPage, setPageValue] = useState({});
  const [anchorEl, setAnchorEl] = useState({});
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [pageOpen, setPageOpen] = useState(false);
  const [loading, setLoading] = useState({});
  const [activeShortcut, setActiveShortcut] = useState(null);
  const dispatch = useDispatch();
  const categories = { ...DASHBOARD_SHORTCUT };
  const Redirect = useRedirect();

  if (accountFeatures && !accountFeatures.error && accountFeatures !== null && accountFeatures?.indexOf(PulseemFeatures.NOTIFICATION) > -1) {
    categories['appBar.notifications.title'] = {
      title: 'appBar.notifications.title',
      pages: [
        {
          title: 'dashboard.createNotification',
          link: `${sitePrefix}Notification/create`
        },
        {
          title: 'dashboard.notificationManagement',
          link: `${sitePrefix}Notifications`
        }
      ]
    }
  }

  const initData = () => {
    dispatch(getShortcuts());
  }

  useEffect(() => {
    if (!shortcuts || shortcuts.length === 0)
      initData();

  }, [])

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
    let pageTitle = (selectedPage[num] && selectedPage[num].title) ?? '';
    let categoryTitle = (selectedCategory[num] && categories[selectedCategory[num]].title) ?? '';
    const open = Boolean(anchorEl[num]);

    if (shortcuts.length > 0) {
      const selectedShortcut = shortcuts.filter(e => { return e.ID === num })[0];
      if (selectedShortcut) {
        if (pageTitle === '' && categoryTitle === selectedShortcut.CategoryName) {
          pageTitle = selectedShortcut ? t(selectedShortcut.ShortcutName) : '';
        }
        else {
          pageTitle = t('common.SelectPage');
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
                    if (cat !== categoryTitle) {
                      return (
                        <ListItem
                          key={`category${Math.round(Math.random() * 999999999)}`}
                          button
                          className={clsx(classes.pt0, classes.pb0)}
                          onClick={() => handleCategoryChange(cat)}>
                          <ListItemText primary={t(categories[cat].title)} />
                        </ListItem>
                      )
                    }
                    return null;
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

  const deleteShortcut = async (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (activeShortcut !== null) {
      const sid = activeShortcut.replace('short_', '');
      await dispatch(deleteShortcuts(sid));
      initData();
    }
  }

  const handleShortcutMenuOpen = (event, num) => {
    let pageTitle = (selectedPage[num] && selectedPage[num].title) || '';
    let categoryTitle = (selectedCategory[num] && categories[selectedCategory[num]].title) || '';
    let refElement = event.currentTarget || event.current || '';
    if (!refElement) {
      return;
    }
    let data = {};
    data[num] = num === Object.keys(anchorEl) && anchorEl[num] ? null : refElement;
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
        <Button
          variant='contained'
          color='primary'
          // component="a"
          // href={data.ShortcutUrl}
          onClick={(e) => {
            e.preventDefault();
            if (e.target.nodeName !== 'svg' && e.target.nodeName !== 'SPAN') {
              Redirect({ url: data.ShortcutUrl })
            }
          }}
          classes={{
            label: classes.shortcutLabel,
            root: classes.shortcutButton
          }}>
          <Box className={clsx(classes.flex, classes.hAuto)}>
            <IconButton
              id="editIcon"
              style={{ opacity: activeShortcut === `short_${data.ID}` ? 1 : 0 }}
              className={clsx('shortcutEditIcon', classes.p5)}
              onClick={(e) => {
                e.preventDefault();
                handleShortcutMenuOpen(windowSize === 'xs' ? e : innerRef, data.ID, true, index);
              }}
            >
              {'\uE09C'}
            </IconButton>
            <Typography align='center' className={clsx(classes.categoryLabel, classes.mb5, classes.flex1,)} onClick={() => {
              Redirect({ url: data.ShortcutUrl })
            }}>{t(data.CategoryName)}</Typography>
            <Link className={clsx('deleteShortcut', classes.p5)} style={{ opacity: activeShortcut === `short_${data.ID}` ? 1 : 0 }}
              onClick={deleteShortcut}
            ><CgCloseO /></Link>
          </Box>
          <Divider />
          <Typography
            align='center'
            className={classes.pageTitle}
            component="a"
            href={data.ShortcutUrl}
            onClick={(e) => {
              e.preventDefault();
              Redirect({ url: data.ShortcutUrl })
            }}>{t(data.ShortcutName)}</Typography>
        </Button>
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
            onClick={(e) => handleShortcutMenuOpen(windowSize === 'xs' ? e : innerRef, index)}>
            {'\uE0E4'}
          </Button>
          {renderShortcutMenu(index)}
        </Box>
      )
    }

    return newShortcutButtons;
  }
  if ((shortcuts.length > 0 && windowSize === 'xs') || windowSize !== 'xs') {
    return (
      <Box className={classes.shortcutBox}>
        <Box className={clsx(classes.dashBoxtitleSection, classes.shortcutTitle, classes.flex)}>
          <FlagIcon className={clsx(classes.mleft5, classes.mr10)} />
          <Typography className={'title'}>{t('dashboard.myShortcuts')}</Typography>
        </Box>
        <Paper className={classes.shortcutPaper} ref={shortcutRef}>
          <Typography align='center' className={clsx(classes.shortcutSubtitle)}>{t('dashboard.addQuickButtons')}</Typography>
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