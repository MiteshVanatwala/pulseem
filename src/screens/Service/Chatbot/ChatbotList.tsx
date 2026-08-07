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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import SmartToyIcon from '@material-ui/icons/Android';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import clsx from 'clsx';
import DefaultScreen from '../../DefaultScreen';
import { sitePrefix } from '../../../config';
import { getChatbots, deleteChatbot, toggleChatbot } from '../../../redux/reducers/chatbotSlice';
import { setRowsPerPage } from '../../../redux/reducers/coreSlice';
import { ChatbotTrigger, IChatbotListItem } from '../../../Models/Service/Chatbot';
import { Switch, ManagmentIcon, TablePagination } from '../../../components/managment';
import { Title } from '../../../components/managment/Title';
import { EditIcon, DeleteIcon } from '../../../assets/images/managment';
import { Loader } from '../../../components/Loader/Loader';
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

const ChatbotList = ({ classes }: { classes?: any }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const { list, tierLimit, loadingList } = useSelector((s: any) => s.chatbot);
  const { isRTL, windowSize, rowsPerPage } = useSelector((s: any) => s.core);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [nameSearch, setNameSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isSearching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<IChatbotListItem[] | null>(null);

  useEffect(() => {
    dispatch(getChatbots());
  }, [dispatch]);

  const atLimit = !!tierLimit && tierLimit.limit >= 0 && tierLimit.used >= tierLimit.limit;
  const visibleList: IChatbotListItem[] = isSearching ? (searchResults as IChatbotListItem[]) : list;
  const rpp = parseInt(rowsPerPage, 10);
  const pagedList = visibleList.slice((page - 1) * rpp, (page - 1) * rpp + rpp);

  const handleSearch = () => {
    const query = nameSearch.trim().toLowerCase();
    setSearchResults(list.filter((bot: IChatbotListItem) => bot.name.toLowerCase().includes(query)));
    setSearching(true);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13 || e.code === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setNameSearch('');
    setSearchResults(null);
    setSearching(false);
    setPage(1);
  };

  const handleRowsPerPageChange = (val: number) => {
    dispatch(setRowsPerPage(val));
  };

  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot };

  const goCreate = () => navigate(`${sitePrefix}Chatbots/create`);
  const goEdit = (id: string) => navigate(`${sitePrefix}Chatbots/${id}`);

  const handleToggle = (bot: IChatbotListItem) => {
    dispatch(toggleChatbot({ id: bot.id, enabled: !bot.enabled }));
  };

  const confirmDelete = () => {
    if (pendingDeleteId) dispatch(deleteChatbot(pendingDeleteId));
    setPendingDeleteId(null);
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
      <Switch checked={bot.enabled} onChange={() => handleToggle(bot)} />
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
    // @ts-ignore
    <TablePagination
      classes={classes}
      rows={visibleList.length}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleRowsPerPageChange}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
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
        <Typography variant="body2" color="textSecondary" style={{ marginTop: 8, marginLeft: 15 }}>
          {t('chatbot_list_subtitle', 'Automated first-response flows for WhatsApp and the website widget.')}
        </Typography>
        {renderSearchLine()}
      </Box>

      <Grid container spacing={2} className={classes.linePadding} alignItems="center">
        <Grid item>
          <Tooltip title={atLimit ? (t('chatbot_limit_reached', 'Chatbot limit reached for your plan') as string) : ''}>
            <span>
              <Button
                onClick={goCreate}
                disabled={atLimit}
                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                className={clsx(classes.btn, classes.btnRounded, atLimit && classes.btnDisabled)}
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
          ⚠️
          <span>
            <b>
              {tierLimit.planName} {t('chatbot_plan', 'plan')}:
            </b>{' '}
            {tierLimit.limit >= 0
              ? t('chatbot_limit_usage', '{{used}} of {{limit}} chatbots used.', {
                  used: tierLimit.used,
                  limit: tierLimit.limit,
                })
              : t('chatbot_limit_unlimited', 'Unlimited chatbots on your plan.')}
            {atLimit && ` ${t('chatbot_limit_upgrade', 'Delete one or upgrade your plan to create another.')}`}
          </span>
        </div>
      )}

      <Dialog open={!!pendingDeleteId} onClose={() => setPendingDeleteId(null)}>
        <DialogTitle>{t('chatbot_delete_title', 'Delete this chatbot?')}</DialogTitle>
        <DialogContent>
          {t('chatbot_delete_body', 'This flow will stop running immediately and cannot be recovered.')}
        </DialogContent>
        <DialogActions>
          <button className="svc-cb-btn svc-cb-btn-ghost" onClick={() => setPendingDeleteId(null)}>
            {t('common.cancel', 'Cancel')}
          </button>
          <button className="svc-cb-btn svc-cb-btn-primary" style={{ background: '#b42318' }} onClick={confirmDelete}>
            {t('common.delete', 'Delete')}
          </button>
        </DialogActions>
      </Dialog>

      <Loader isOpen={loadingList} />
    </DefaultScreen>
  );
};

export default ChatbotList;
