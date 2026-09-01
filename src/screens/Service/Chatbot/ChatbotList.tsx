import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Tooltip,
  Grid,
  TextField,
  Table,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableContainer,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import SmartToyIcon from '@material-ui/icons/Android';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import clsx from 'clsx';
import DefaultScreen from '../../DefaultScreen';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import Toast from '../../../components/Toast/Toast.component';
import { sitePrefix } from '../../../config';
import { getChatbots, deleteChatbot, toggleChatbot } from '../../../redux/reducers/chatbotSlice';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { ChatbotTrigger, IChatbotListItem } from '../../../Models/Service/Chatbot';
import { Switch, ManagmentIcon, TablePagination } from '../../../components/managment';
import { Title } from '../../../components/managment/Title';
import { EditIcon, DeleteIcon } from '../../../assets/images/managment';
import { Loader } from '../../../components/Loader/Loader';
import UsageCounter from '../../../components/Service/UsageCounter';
import UpgradePrompt from '../../../components/Service/UpgradePrompt';
import { useServicePlanLimits } from '../../../hooks/useServicePlanLimits';
// TypeScript may not have declarations for CSS imports in this project setup.
// @ts-ignore
import './chatbot.css';

const ROWS_PER_PAGE_OPTIONS = [6, 10, 20, 50];

const TRIGGER_LABEL: Record<ChatbotTrigger, string> = {
  any: 'Any Message',
  whatsapp: 'WhatsApp only',
  widget: 'Widget only',
};

const TRIGGER_KEY: Record<ChatbotTrigger, string> = {
  any: 'chatbot_any_message',
  whatsapp: 'chatbot_trigger_whatsapp',
  widget: 'chatbot_trigger_widget',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

// dispatch(thunk).unwrap() throws the raw value passed to rejectWithValue(...)
// directly - a plain string here, not an Error - so reading err.message on it
// is always undefined. This pulls the real backend message out regardless of
// which shape the rejection actually took.
const getErrorMessage = (err: any, fallbackKey: string): string => {
  if (typeof err === 'string' && err) return err;
  if (err?.message) return err.message;
  if (err?.Message) return err.Message;
  return fallbackKey;
};

const ChatbotList = ({ classes }: { classes?: any }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const { list, tierLimit, loadingList, mutating } = useSelector((s: any) => s.chatbot);
  const { isRTL, windowSize, rowsPerPage } = useSelector((s: any) => s.core);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingToggle, setPendingToggle] = useState<IChatbotListItem | null>(null);
  const [nameSearch, setNameSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isSearching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<IChatbotListItem[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<any>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    dispatch(getChatbots());
  }, [dispatch]);

  // PR-3179: plan limit now sourced from useServicePlanLimits (src/config/
  // servicePlanLimits.ts) rather than the per-account backend value the chatbot
  // slice used to carry. chatbotLimitReached gates chatbot creation (total count,
  // per the PR-3179 spec); atLimit keeps gating the enable/disable toggle against
  // the enabled count specifically, since disabling doesn't free up a "total count" slot.
  const { limits, isAtLimit } = useServicePlanLimits();
  const activeCount = list.filter((bot: IChatbotListItem) => bot.enabled).length;
  const chatbotLimitReached = isAtLimit('maxChatbots', list.length);
  const atLimit = isAtLimit('maxChatbots', activeCount);
  // Plan Downgrade Handling: nothing gets auto-disabled on downgrade (see
  // FeatureTierLogic.DowngradePlan) - existing chatbots stay active, so a downgrade
  // can leave the account strictly OVER its new limit, not just at it. Distinct from
  // chatbotLimitReached (>=, blocks new creation) - this is specifically >, surfaced
  // as a standing warning until the user manually removes the excess.
  const overLimit = limits.maxChatbots !== -1 && list.length > limits.maxChatbots;
  const visibleList: IChatbotListItem[] = isSearching ? (searchResults as IChatbotListItem[]) : list;
  const rpp = parseInt(rowsPerPage, 10);
  const pagedList = visibleList.slice((page - 1) * rpp, (page - 1) * rpp + rpp);

  const handleSearch = () => {
    const query = nameSearch.trim().toLowerCase();
    setSearchLoading(true);
    // Filtering itself is instant (in-memory), but without a beat before
    // resolving, React batches the true->false loading flip into one render
    // and the spinner never actually paints - the timeout is what makes it visible.
    setTimeout(() => {
      setSearchResults(list.filter((bot: IChatbotListItem) => bot.name.toLowerCase().includes(query)));
      setSearching(true);
      setPage(1);
      setSearchLoading(false);
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13 || e.code === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchLoading(true);
    setTimeout(() => {
      // isSearching must flip off before searchResults is nulled - visibleList
      // reads searchResults only while isSearching is true, so the reverse order
      // renders visibleList=null (searchResults) for a tick and crashes on .slice.
      setSearching(false);
      setNameSearch('');
      setSearchResults(null);
      setPage(1);
      setSearchLoading(false);
    }, 300);
  };

  const handleRowsPerPageChange = (val: number) => {
    dispatch(setRowsPerPage(val));
  };

  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot };

  const goCreate = () => navigate(`${sitePrefix}Chatbots/create`);
  const goEdit = (id: string) => navigate(`${sitePrefix}Chatbots/${id}`);

  // Opens the confirm popup instead of toggling immediately - same
  // confirm-before-activate/deactivate pattern as AutomationsManagment.js. Disabling is
  // always allowed; enabling is blocked client-side once the active cap is hit (the
  // backend enforces this too - see ChatbotLogic.SaveChatbot / ToggleChatbot - this just
  // avoids a round trip for the common case).
  const handleToggle = (bot: IChatbotListItem) => {
    if (!bot.enabled && atLimit) {
      setToastMessage({
        severity: 'error',
        color: 'error',
        message: t(
          'chatbot_active_limit_reached',
          'Active chatbot limit reached ({{limit}}). Disable another chatbot first.',
          { limit: limits.maxChatbots },
        ),
      });
      return;
    }
    setPendingToggle(bot);
  };

  const confirmToggle = async () => {
    if (!pendingToggle) return;
    const bot = pendingToggle;
    setPendingToggle(null);
    // Same as Newsletter's delete/restore confirms - drop out of search mode
    // rather than trying to keep the frozen searchResults snapshot in sync, so
    // the list view (now showing the live `list`) reflects the change immediately.
    clearSearch();
    try {
      await dispatch(toggleChatbot({ id: bot.id, enabled: !bot.enabled })).unwrap();
    } catch (err: any) {
      setToastMessage({ severity: 'error', color: 'error', message: getErrorMessage(err, 'chatbot_action_failed') });
    }
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setPendingDeleteId(null);
    clearSearch();
    try {
      await dispatch(deleteChatbot(pendingDeleteId)).unwrap();
      setToastMessage({ severity: 'success', color: 'success', message: 'chatbot_delete_success' });
    } catch (err: any) {
      setToastMessage({ severity: 'error', color: 'error', message: getErrorMessage(err, 'chatbot_action_failed') });
    }
  };

  const renderCellIcons = (bot: IChatbotListItem) => {
    const iconsMap = [
      {
        key: 'edit',
        icon: undefined,
        uIcon: EditIcon,
        lable: t('common.edit', 'Edit'),
        rootClass: classes.paddingIcon,
        onClick: () => goEdit(bot.id),
      },
      {
        key: 'delete',
        icon: undefined,
        uIcon: DeleteIcon,
        lable: t('common.delete', 'Delete'),
        rootClass: classes.paddingIcon,
        onClick: () => setPendingDeleteId(bot.id),
      },
    ];
    return (
      <Grid container direction="row" justifyContent={windowSize === 'xs' ? 'flex-start' : 'flex-end'}>
        {iconsMap.map((icon) => (
          <Grid key={icon.key} item className="rowIconContainer">
            <ManagmentIcon
              classes={classes}
              {...icon}
              uIcon={<icon.uIcon width={18} height={20} className="rowIcon" />}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderStatusCell = (bot: IChatbotListItem) => (
    <Box>
      <Tooltip
        title={
          !bot.enabled && atLimit
            ? (t(
                'chatbot_active_limit_reached',
                'Active chatbot limit reached ({{limit}}). Disable another chatbot first.',
                { limit: limits.maxChatbots },
              ) as string)
            : ''
        }
      >
        <span>
          <Switch checked={bot.enabled} onChange={() => handleToggle(bot)} />
        </span>
      </Tooltip>
      <Typography
        className={clsx(classes.middleText, classes.txtCenter, {
          [classes.switchActive]: bot.enabled,
          [classes.switchInactive]: !bot.enabled,
        })}
      >
        {bot.enabled ? t('chatbot_enabled', 'Enabled') : t('chatbot_disabled', 'Disabled')}
      </Typography>
    </Box>
  );

  const renderNameCell = (bot: IChatbotListItem) => (
    <>
      <Typography className={classes.nameEllipsis}>{bot.name}</Typography>
      <Typography className={classes.grayTextCell}>
        {t('chatbot_step_count', '{{count}} steps', { count: bot.stepCount })}
        {bot.cooldownEnabled
          ? ` · ${t('chatbot_cooldown_hours', '{{hours}}h cooldown', { hours: bot.cooldownHours })}`
          : ` · ${t('chatbot_no_cooldown', 'no cooldown')}`}
      </Typography>
    </>
  );

  const renderTableHead = () => (
    <TableHead>
      <TableRow classes={rowStyle}>
        <TableCell classes={cellStyle} className={classes.flex3} align="center">
          {t('chatbot_col_name', 'Name')}
        </TableCell>
        <TableCell classes={cellStyle} className={classes.flex1} align="center">
          {t('chatbot_trigger', 'Trigger')}
        </TableCell>
        <TableCell classes={cellStyle} className={classes.flex1} align="center">
          {t('chatbot_col_modified', 'Last modified')}
        </TableCell>
        <TableCell classes={cellStyle} className={classes.flex1} align="center">
          {t('chatbot_col_status', 'Status')}
        </TableCell>
        <TableCell classes={{ root: classes.tableCellRoot }} className={classes.flex2} />
      </TableRow>
    </TableHead>
  );

  const renderRow = (bot: IChatbotListItem) => (
    <TableRow key={bot.id} classes={rowStyle}>
      <TableCell classes={cellStyle} align="center" className={classes.flex3}>
        {renderNameCell(bot)}
      </TableCell>
      <TableCell classes={cellStyle} align="center" className={classes.flex1}>
        <Typography className={classes.middleText}>
          {t(TRIGGER_KEY[bot.trigger], TRIGGER_LABEL[bot.trigger])}
        </Typography>
      </TableCell>
      <TableCell classes={cellStyle} align="center" className={classes.flex1}>
        <Typography className={classes.middleText}>{formatDate(bot.updatedAt)}</Typography>
      </TableCell>
      <TableCell classes={cellStyle} align="center" className={classes.flex1}>
        {renderStatusCell(bot)}
      </TableCell>
      <TableCell component="th" scope="row" classes={{ root: classes.tableCellRoot }} className={classes.flex2}>
        {renderCellIcons(bot)}
      </TableCell>
    </TableRow>
  );

  const renderPhoneRow = (bot: IChatbotListItem) => (
    <TableRow key={bot.id} component="div" classes={rowStyle}>
      <TableCell classes={{ root: clsx(classes.tableCellRoot, classes.flex1, classes.tabelCellPadding) }}>
        <Box className={classes.justifyBetween}>
          <Box className={classes.inlineGrid}>
            <Typography className={classes.nameEllipsis}>{bot.name}</Typography>
            <Typography className={classes.grayTextCell}>
              {t(TRIGGER_KEY[bot.trigger], TRIGGER_LABEL[bot.trigger])} · {formatDate(bot.updatedAt)}
            </Typography>
            <Typography className={classes.grayTextCell}>
              {t('chatbot_step_count', '{{count}} steps', { count: bot.stepCount })}
              {bot.cooldownEnabled
                ? ` · ${t('chatbot_cooldown_hours', '{{hours}}h cooldown', { hours: bot.cooldownHours })}`
                : ` · ${t('chatbot_no_cooldown', 'no cooldown')}`}
            </Typography>
          </Box>
          <Box>{renderStatusCell(bot)}</Box>
        </Box>
        {renderCellIcons(bot)}
      </TableCell>
    </TableRow>
  );

  const renderTable = () => (
    <TableContainer className={classes.tableStyle}>
      <Table className={classes.tableContainer}>
        {windowSize !== 'xs' && renderTableHead()}
        <Box className="tableBodyContainer">
          <TableBody>{pagedList.map((bot) => (windowSize === 'xs' ? renderPhoneRow(bot) : renderRow(bot)))}</TableBody>
        </Box>
      </Table>
    </TableContainer>
  );

  const renderSearchLine = () => {
    return (
      <Grid
        container
        spacing={2}
        className={clsx(windowSize === 'xs' || windowSize === 'sm' ? classes.mt15 : classes.lineTopMarging, 'searchLine')}
      >
        <Grid item>
          <TextField
            variant="outlined"
            size="small"
            value={nameSearch}
            onKeyPress={handleKeyPress}
            onChange={(e) => setNameSearch(e.target.value)}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t('chatbot_search_placeholder', 'Name') as string}
          />
        </Grid>
        <Grid item>
          <Button
            onClick={handleSearch}
            className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            {t('common.search', 'Search')}
          </Button>
        </Grid>
        {isSearching && (
          <Grid item>
            <Button
              onClick={clearSearch}
              className={clsx(classes.btn, classes.btnRounded, classes.searchButton)}
              endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            >
              {t('common.clear', 'Clear')}
            </Button>
          </Grid>
        )}
      </Grid>
    );
  };

  const renderTablePagination = () => (
    <TablePagination
      classes={classes}
      rows={visibleList.length}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleRowsPerPageChange}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS as any}
      page={page}
      onPageChange={setPage}
    />
  );

  return (
    <DefaultScreen
      classes={classes}
      currentPage="service"
      subPage="serviceChatbots"
      containerClass={clsx(classes?.management)}
      hideSideImages
    >
      <Box className={'topSection'}>
        <Title Text={t('chatbot_list_title', 'Chatbots')} classes={classes} />
        {renderSearchLine()}
      </Box>

      <Grid container spacing={2} className={classes.linePadding} alignItems="center">
        <Grid item>
          <Tooltip
            title={chatbotLimitReached ? `Your plan allows ${limits.maxChatbots} chatbots. Upgrade to create more.` : ''}
          >
            <span>
              <Button
                disabled={chatbotLimitReached}
                onClick={goCreate}
                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                className={clsx(classes.btn, classes.btnRounded, chatbotLimitReached && classes.btnDisabled)}
              >
                {t('chatbot_create', 'Create Chatbot')}
              </Button>
            </span>
          </Tooltip>
        </Grid>
        <Grid item className={classes.groupsLableContainer}>
          <Typography className={classes.groupsLable}>
            {`${visibleList.length} ${t('chatbot_list_title', 'Chatbots')}`}
          </Typography>
        </Grid>
      </Grid>

      <UsageCounter current={list.length} max={limits.maxChatbots} label="Chatbots" />
      {overLimit && (
        <Alert severity="warning" style={{ marginBlockEnd: 8 }}>
          {`You have ${list.length} chatbots, which is over your current plan's limit of ${limits.maxChatbots}. Existing chatbots remain active, but you won't be able to create more until you remove the excess.`}
        </Alert>
      )}
      {chatbotLimitReached && <UpgradePrompt feature="more chatbots" />}

      {!loadingList && list.length === 0 ? (
        <Box textAlign="center" py={8}>
          <SmartToyIcon style={{ fontSize: 40, color: '#d0d5dd', marginBottom: 10 }} />
          <Typography className={classes.grayTextCell}>
            {t('chatbot_empty_state', 'No chatbots yet. Create your first one to start automating responses.')}
          </Typography>
        </Box>
      ) : !loadingList && visibleList.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography className={classes.grayTextCell}>
            {t('chatbot_search_empty', 'No chatbots match "{{query}}".', { query: nameSearch.trim() })}
          </Typography>
        </Box>
      ) : (
        <>
          {renderTable()}
          {renderTablePagination()}
        </>
      )}

      {tierLimit && (
        <div className="svc-cb-limit-note">
          <div className="svc-cb-limit-note-row">
            ⚠️
            <span>
              <b>{t('chatbot_plan', 'plan')}:</b> {tierLimit.planName}
            </span>
          </div>
        </div>
      )}

      {!!pendingDeleteId && (
        <BaseDialog
          classes={classes}
          open={!!pendingDeleteId}
          title={t('chatbot_delete_title', 'Delete chatbot')}
          showDivider={false}
          onClose={() => setPendingDeleteId(null)}
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={confirmDelete}
        >
          <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
            {t('chatbot_delete_body', 'Do you want to delete the chatbot?')}
          </Typography>
        </BaseDialog>
      )}

      {!!pendingToggle && (
        <BaseDialog
          classes={classes}
          open={!!pendingToggle}
          title={
            pendingToggle.enabled
              ? t('chatbot_deactivate_title', 'Deactivate Chatbot')
              : t('chatbot_activate_title', 'Activate Chatbot')
          }
          showDivider={false}
          onClose={() => setPendingToggle(null)}
          onCancel={() => setPendingToggle(null)}
          onConfirm={confirmToggle}
        >
          <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
            {pendingToggle.enabled
              ? t('chatbot_deactivate_body', 'Are you sure you want to deactivate Chatbot?')
              : t('chatbot_activate_body', 'Are you sure you want to activate Chatbot?')}
          </Typography>
        </BaseDialog>
      )}

      {toastMessage && <Toast data={toastMessage} />}

      <Loader isOpen={loadingList || mutating || searchLoading} />
    </DefaultScreen>
  );
};

export default ChatbotList;
