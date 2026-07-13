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
import { FlagIcon, NewsletterIcon, SmsIcon, WhatsappIcon, NotesIcon, ChartIcon, HornIcon, CardIcon, BellIcon } from '../../assets/images/dashboard/index'
import { CgCloseO } from 'react-icons/cg';
import { sitePrefix } from '../../config';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import { getIsBeeperAccount } from '../WhiteLabel/WhiteLabelMigrate';

const BEEPER_HIDDEN_SHORTCUT_CATEGORIES = new Set([
  'appBar.newsletter.title',
  'appBar.whatsapp.title',
  'appBar.automation.title',
  'appBar.mms.title',
]);

const CATEGORY_CONFIG = {
  'appBar.newsletter.title':    { icon: NewsletterIcon, color: '#FF1744', bg: '#FFF0F3' },
  'appBar.sms.title':           { icon: SmsIcon,        color: '#FF1744', bg: '#FFF0F3' },
  'appBar.whatsapp.title':      { icon: WhatsappIcon,   color: '#FF1744', bg: '#FFF0F3' },
  'appBar.groups.title':        { icon: NotesIcon,      color: '#FF1744', bg: '#FFF0F3' },
  'appBar.reports.title':       { icon: ChartIcon,      color: '#FF1744', bg: '#FFF0F3' },
  'appBar.automation.title':    { icon: HornIcon,       color: '#FF1744', bg: '#FFF0F3' },
  'appBar.landingPages.title':  { icon: CardIcon,       color: '#FF1744', bg: '#FFF0F3' },
  'appBar.mms.title':           { icon: CardIcon,       color: '#FF1744', bg: '#FFF0F3' },
  'appBar.notifications.title': { icon: BellIcon,       color: '#FF1744', bg: '#FFF0F3' },
};

const getCategoryConfig = (categoryName) =>
  CATEGORY_CONFIG[categoryName] || { icon: FlagIcon, color: '#FF477E', bg: '#FFF0F5' };

const Shortcut = ({ classes, windowSize, t, isRTL, variant = 'panel' }) => {
  const { shortcuts } = useSelector(state => state.shortcuts);
  const { accountFeatures, accountSettings } = useSelector(state => state.common)
  const { userRoles } = useSelector(state => state.core)
  const isBeeperAccount = getIsBeeperAccount(accountSettings);
  const shortcutRef = useRef();
  const [selectedCategory, setCategoryValue] = useState({});
  const [selectedPage, setPageValue] = useState({});
  const [anchorEl, setAnchorEl] = useState({});
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [pageOpen, setPageOpen] = useState(false);
  const [loading, setLoading] = useState({});
  const [activeShortcut, setActiveShortcut] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef();
  const dispatch = useDispatch();
  const allCategories = { ...DASHBOARD_SHORTCUT };
  const categories = isBeeperAccount
    ? Object.fromEntries(Object.entries(allCategories).filter(([key]) => !BEEPER_HIDDEN_SHORTCUT_CATEGORIES.has(key)))
    : allCategories;
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

  const initData = async () => {
    await dispatch(getShortcuts());
  }

  useEffect(() => {
    if (!shortcuts || shortcuts?.length === 0)
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

    if (shortcuts?.length > 0) {
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
    if (shortcuts?.length > 0) {
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
            {!userRoles?.HideRecipients && <IconButton
              id="editIcon"
              style={{ opacity: activeShortcut === `short_${data.ID}` ? 1 : 0 }}
              className={clsx('shortcutEditIcon', classes.p5)}
              onClick={(e) => {
                e.preventDefault();
                handleShortcutMenuOpen(windowSize === 'xs' ? e : innerRef, data.ID, true, index);
              }}
            >
              {'\uE09C'}
            </IconButton>}
            <Typography align='center' className={clsx(classes.categoryLabel, classes.mb5, classes.flex1,)} onClick={() => {
              Redirect({ url: data.ShortcutUrl })
            }}>{t(data.CategoryName)}</Typography>
            {userRoles?.AllowDelete && <Link className={clsx('deleteShortcut', classes.p5)} style={{ opacity: activeShortcut === `short_${data.ID}` ? 1 : 0 }}
              onClick={deleteShortcut}
            ><CgCloseO /></Link>}
          </Box>
          <Divider />
          <Typography
            align='center'
            className={classes.shortCutTitle}
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

  const renderHorizontalShortcutButton = (data, index, inPopover = false) => {
    if (loading[index]) {
      return (
        <Box className={inPopover ? classes.pillPopoverItem : classes.pillItem} key={`shortcutStripLoading${index}`}>
          <Box className={inPopover ? classes.pillPopoverChip : classes.pillChip} style={{ justifyContent: 'center' }}>
            <CircularProgress size={16} />
          </Box>
        </Box>
      );
    }

    const innerRef = createRef();
    const isActive = activeShortcut === `short_${data.ID}`;
    const cfg = getCategoryConfig(data.CategoryName);
    const IconComponent = cfg.icon;

    return (
      <Box
        onMouseEnter={() => setActiveShortcut(`short_${data.ID}`)}
        onMouseLeave={() => setActiveShortcut(null)}
        key={`shortcutStripButton${index}`}
        ref={innerRef}
        className={inPopover ? classes.pillPopoverItem : classes.pillItem}
      >
        <Box
          className={inPopover ? classes.pillPopoverChip : classes.pillChip}
          style={{ borderColor: cfg.color, background: cfg.bg, cursor: 'pointer' }}
          onClick={(e) => {
            if (!['svg', 'path', 'button'].includes(e.target.nodeName.toLowerCase())) {
              Redirect({ url: data.ShortcutUrl });
            }
          }}
        >
          {/* icon */}
          <Box className={classes.pillIconCircle} style={{ backgroundColor: '#FFFFFF' }}>
            <IconComponent style={{ width: 16, height: 16, color: '#6C757D' }} />
          </Box>

          {/* text */}
          <Box className={classes.pillTextBlock}>
            <Typography className={classes.pillCategory} style={{ color: cfg.color }}>
              {t(data.CategoryName)}
            </Typography>
            <Typography className={classes.pillTitle}>
              {t(data.ShortcutName)}
            </Typography>
          </Box>

          {/* action buttons */}
          <Box className={classes.pillActions} style={{ opacity: isActive ? 1 : 0 }}>
            {!userRoles?.HideRecipients && (
              <IconButton
                id="editIcon"
                className={clsx('shortcutEditIcon', classes.pillActionBtn)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleShortcutMenuOpen(windowSize === 'xs' ? e : innerRef, data.ID, true, index);
                }}
              >
                {'\uE09C'}
              </IconButton>
            )}
            {userRoles?.AllowDelete && (
              <Link
                className={clsx('deleteShortcut', classes.pillActionBtn)}
                onClick={deleteShortcut}
              >
                <CgCloseO />
              </Link>
            )}
          </Box>
        </Box>
        {renderShortcutMenu(data.ID, true, index)}
      </Box>
    );
  }

  const renderNewShortcutButtons = () => {
    let newShortcutButtons = [];
    for (let index = shortcuts?.length; index < 5; index++) {
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

  const renderHorizontalNewShortcutButtons = () => {
    const innerRef = createRef();
    const idx = shortcuts?.length || 0;
    return (
      <Box className={classes.pillItem} key={`emptyShortcutStripBtn`} ref={innerRef}>
        <Box
          id="btnSelectNew"
          className={classes.pillAddChip}
          onClick={(e) => handleShortcutMenuOpen(windowSize === 'xs' ? e : innerRef, idx)}
        >
          <Typography style={{ fontFamily: 'pulseemicons', fontSize: 20, color: '#FF1744', lineHeight: 1, marginRight: 6 }}>
            {'\uE0E4'}
          </Typography>
          <Typography className={classes.pillAddLabel}>{t('dashboard.addShortcut') || '+ Add Shortcut'}</Typography>
        </Box>
        {renderShortcutMenu(idx)}
      </Box>
    );
  }

  const renderHorizontalShortcutStrip = () => {
    const visibleShortcuts = shortcuts ? shortcuts.slice(0, 4) : [];
    const hiddenShortcuts = shortcuts ? shortcuts.slice(4) : [];
    const hasMore = hiddenShortcuts.length > 0;

    return (
      <Box className={classes.shortcutStripBox}>
        <Box className={clsx(classes.dashBoxtitleSection, classes.shortcutStripHeader, classes.flex)}>
          <FlagIcon className={clsx(classes.marginInlineEnd15, classes.marginInlineStart5)} />
          <Typography className={'title'}>{t('dashboard.myShortcuts')}</Typography>
        </Box>
        <Box className={classes.pillScroller} ref={shortcutRef}>
          {visibleShortcuts.map((item, index) => renderHorizontalShortcutButton(item, index))}

          {/* +N More button with Popper */}
          {hasMore && (
            <Box className={classes.pillItem} ref={moreRef}>
              <Box
                className={classes.pillMoreBtn}
                onClick={() => setMoreOpen(prev => !prev)}
              >
                <Typography className={classes.pillMoreLabel}>
                  +{hiddenShortcuts.length} {t('dashboard.more')}
                </Typography>
              </Box>
              <Popper
                open={moreOpen}
                anchorEl={moreRef.current}
                placement={isRTL ? 'bottom-end' : 'bottom-start'}
                style={{ zIndex: 10 }}
              >
                <ClickAwayListener onClickAway={() => setMoreOpen(false)}>
                  <Paper className={classes.pillPopoverPaper}>
                    <Typography className={classes.pillPopoverTitle}>
                      {t('dashboard.myShortcuts')}
                    </Typography>
                    <Box className={classes.pillPopoverList}>
                      {hiddenShortcuts.map((item, index) => (
                        <Box key={`popover_${item.ID}`} className={classes.pillPopoverItem}>
                          {renderHorizontalShortcutButton(item, index + 4, true)}
                        </Box>
                      ))}
                      <Box className={classes.pillPopoverItem}>
                        {renderHorizontalNewShortcutButtons()}
                      </Box>
                    </Box>
                  </Paper>
                </ClickAwayListener>
              </Popper>
            </Box>
          )}

          {!hasMore && renderHorizontalNewShortcutButtons()}
        </Box>
      </Box>
    );
  }

  if (variant === 'horizontal') {
    return renderHorizontalShortcutStrip();
  }

  if ((shortcuts?.length > 0 && windowSize === 'xs') || windowSize !== 'xs') {
    return (
      <Box className={classes.shortcutBox}>
        <Box className={clsx(classes.dashBoxtitleSection, classes.shortcutTitle, classes.flex)}>
          <FlagIcon className={clsx(classes.marginInlineEnd15, classes.marginInlineStart5)} />
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