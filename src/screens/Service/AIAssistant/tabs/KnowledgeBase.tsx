import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tooltip,
  IconButton,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import KnowledgeItemCard from '../components/KnowledgeItemCard';
import KnowledgeItemForm, { KnowledgeItemServerError } from '../components/KnowledgeItemForm';
import UsageCounter from '../../../../components/UsageCounter/UsageCounter';
import {
  saveKnowledgeItem,
  toggleKnowledgeItem,
  deleteKnowledgeItem,
  fetchKnowledgeItems,
  clearAiAssistantError,
} from '../../../../redux/reducers/aiAssistantSlice';
import {
  IKnowledgeItem,
  IKnowledgeItemInput,
  KnowledgeItemType,
  MAX_KNOWLEDGE_ITEMS,
} from '../../../../Models/Service/AIAssistant';

type TypeFilter = 'all' | KnowledgeItemType;

const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBlockEnd: 16,
  },
  search: {
    flex: '1 1 260px',
  },
  typeFilter: {
    minWidth: 180,
  },
  empty: {
    textAlign: 'center',
    padding: 48,
    color: '#6b7280',
  },
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: theme.spacing(2),
      overflow: 'hidden',
    },
  },
  dialogTitleBar: {
    background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
    color: '#fff',
    padding: theme.spacing(2, 3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 'auto',
  },
  dialogTitleText: {
    fontWeight: 600,
    fontSize: '1.25rem',
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  closeButton: {
    color: '#fff',
    padding: theme.spacing(1),
    flexShrink: 0,
    marginLeft: theme.spacing(1),
  },
}));

const KnowledgeBase = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state: any) => state.core);
  const { knowledgeItems, saving, error } = useSelector((state: any) => state.aiAssistant);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<IKnowledgeItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IKnowledgeItem | null>(null);
  const [formServerError, setFormServerError] = useState<KnowledgeItemServerError | null>(null);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (knowledgeItems as IKnowledgeItem[]).filter((item) => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [knowledgeItems, search, typeFilter]);

  const atCap = knowledgeItems.length >= MAX_KNOWLEDGE_ITEMS;

  const openCreate = () => {
    setFormMode('create');
    setEditingItem(null);
    setFormServerError(null);
    dispatch(clearAiAssistantError());
    setFormOpen(true);
  };

  const openEdit = (item: IKnowledgeItem) => {
    setFormMode('edit');
    setEditingItem(item);
    setFormServerError(null);
    dispatch(clearAiAssistantError());
    setFormOpen(true);
  };

  const handleSubmit = (input: IKnowledgeItemInput) => {
    setFormServerError(null);
    const thunk =
      formMode === 'create'
        ? saveKnowledgeItem({ input })
        : saveKnowledgeItem({ id: editingItem!.id, input });
    (dispatch(thunk as any) as Promise<any>).then((result: any) => {
      if (result?.meta?.requestStatus === 'fulfilled') {
        setFormOpen(false);
        // SaveKnowledgeItem only returns { Id } — refetch to get the server-computed
        // WordCount/CreatedDate/etc. for the item we just created or updated.
        dispatch(fetchKnowledgeItems() as any);
      } else {
        setFormServerError(result?.payload || null);
      }
    });
  };

  const handleToggleActive = (item: IKnowledgeItem) => {
    (dispatch(toggleKnowledgeItem({ id: item.id, isActive: !item.isActive }) as any) as Promise<any>).then(
      (result: any) => {
        if (result?.meta?.requestStatus !== 'fulfilled') {
          // 404 here is deliberately ambiguous (not found vs. belongs to another
          // account) — reconcile against the server rather than assume why.
          dispatch(fetchKnowledgeItems() as any);
        }
      }
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    (dispatch(deleteKnowledgeItem(id) as any) as Promise<any>).then((result: any) => {
      if (result?.meta?.requestStatus !== 'fulfilled') {
        dispatch(fetchKnowledgeItems() as any);
      }
    });
  };

  return (
    <Box dir={isRTL ? 'rtl' : 'ltr'}>
      {error && (
        <Alert severity="error" style={{ marginBlockEnd: 16 }} onClose={() => dispatch(clearAiAssistantError())}>
          {error}
        </Alert>
      )}
      <Box className={classes.toolbar}>
        <TextField
          className={classes.search}
          size="small"
          variant="outlined"
          placeholder={t('AIAssistant.knowledgeBase.searchPlaceholder') as string}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          className={classes.typeFilter}
          size="small"
          select
          variant="outlined"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
        >
          <MenuItem value="all">{t('AIAssistant.knowledgeBase.typeFilter.all')}</MenuItem>
          <MenuItem value="text">{t('AIAssistant.knowledgeBase.typeFilter.text')}</MenuItem>
          <MenuItem value="faq">{t('AIAssistant.knowledgeBase.typeFilter.faq')}</MenuItem>
          <MenuItem value="url">{t('AIAssistant.knowledgeBase.typeFilter.url')}</MenuItem>
        </TextField>
        <Tooltip title={atCap ? (t('AIAssistant.knowledgeBase.usageLabel') as string) : ''}>
          <span>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={openCreate}
              disabled={atCap}
            >
              {t('AIAssistant.knowledgeBase.addButton')}
            </Button>
          </span>
        </Tooltip>
      </Box>

      <UsageCounter
        current={knowledgeItems.length}
        max={MAX_KNOWLEDGE_ITEMS}
        labelKey="AIAssistant.knowledgeBase.usageLabel"
      />

      {knowledgeItems.length === 0 ? (
        <Typography className={classes.empty}>{t('AIAssistant.knowledgeBase.empty')}</Typography>
      ) : filteredItems.length === 0 ? (
        <Typography className={classes.empty}>{t('AIAssistant.knowledgeBase.noResults')}</Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <KnowledgeItemCard
                item={item}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onToggleActive={handleToggleActive}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <KnowledgeItemForm
        open={formOpen}
        mode={formMode}
        item={editingItem}
        saving={saving === 'loading'}
        serverError={formServerError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} dir={isRTL ? 'rtl' : 'ltr'} className={classes.dialog}>
        <DialogTitle className={classes.dialogTitleBar} disableTypography dir={isRTL ? 'rtl' : 'ltr'}>
          <Typography className={classes.dialogTitleText}>{t('AIAssistant.deleteConfirm.title')}</Typography>
          <IconButton className={classes.closeButton} onClick={() => setDeleteTarget(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingTop: 20 }}>
          <Typography>
            {t('AIAssistant.deleteConfirm.message', { title: deleteTarget?.title })}
          </Typography>
        </DialogContent>
        <DialogActions style={{ padding: '12px 24px' }}>
          <Button onClick={() => setDeleteTarget(null)}>{t('AIAssistant.deleteConfirm.cancel')}</Button>
          <Button onClick={confirmDelete} color="secondary" variant="contained">
            {t('AIAssistant.deleteConfirm.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KnowledgeBase;
