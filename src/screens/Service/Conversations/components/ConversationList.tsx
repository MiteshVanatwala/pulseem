import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Box, Tabs, Tab, TextField, MenuItem, CircularProgress, Typography, InputAdornment } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { IConversation, ConversationStatus, STATUS_ORDER } from '../../../../Models/Service/Conversation';
import ConversationCard from './ConversationCard';

type TabKey = 'all' | ConversationStatus;
const TAB_KEYS: TabKey[] = ['all', ...STATUS_ORDER];

const hostOf = (c: IConversation): string => {
  if (c.domain) return c.domain;
  try { return c.pageUrl ? new URL(c.pageUrl).host : ''; } catch { return ''; }
};

const ConversationList = ({ isAdmin, selectedId, onSelect, domainFilter }: { isAdmin: boolean; selectedId?: string; onSelect: (id: string) => void; domainFilter?: string }) => {
  const { t } = useTranslation();
  const { conversations, agents, loading } = useSelector((s: any) => s.conversations);
  const currentAgentId: number | undefined = useSelector((s: any) => s.core?.userId);

  const [tab, setTab] = useState<TabKey>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [agentId, setAgentId] = useState<number | 'all'>('all');

  // debounce search
  useEffect(() => {
    const h = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(h);
  }, [searchInput]);

  // role scope: agents see only their own + unassigned
  const scoped: IConversation[] = useMemo(() => {
    let list = conversations;
    if (domainFilter) list = list.filter((c: IConversation) => hostOf(c) === domainFilter);
    if (!isAdmin) list = list.filter((c: IConversation) => c.assignedAgentId == null || c.assignedAgentId === currentAgentId);
    return list;
  }, [conversations, isAdmin, currentAgentId, domainFilter]);

  const counts = useMemo(() => {
    const base: Record<TabKey, number> = { all: scoped.length, new: 0, open: 0, resolved: 0, archived: 0 };
    scoped.forEach((c: IConversation) => { base[c.status] += 1; });
    return base;
  }, [scoped]);

  const filtered = useMemo(() => {
    return scoped.filter((c: IConversation) => {
      if (tab !== 'all' && c.status !== tab) return false;
      if (agentId !== 'all' && c.assignedAgentId !== agentId) return false;
      if (search) {
        const hay = [c.visitorId, c.visitorName, c.visitorEmail, c.visitorPhone, c.lastMessage].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [scoped, tab, agentId, search]);

  const tabLabel = (k: TabKey) => `${t(`conv_${k}`, k.charAt(0).toUpperCase() + k.slice(1))} (${counts[k]})`;

  return (
    <Box display="flex" flexDirection="column" style={{ height: '100%' }}>
      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        indicatorColor="primary"
        TabIndicatorProps={{ style: { backgroundColor: '#f4511e' } }}
        style={{ borderBottom: '1px solid #e5e7eb', minHeight: 44 }}
      >
        {TAB_KEYS.map((k) => (
          <Tab key={k} value={k} label={tabLabel(k)} style={{ textTransform: 'none', minHeight: 44, minWidth: 'auto', fontSize: 13 }} />
        ))}
      </Tabs>

      {/* Search + agent filter */}
      <Box className="svc-list-header" p={1.5} style={{ borderBottom: '1px solid #f1f3f5' }}>
        <TextField
          fullWidth size="small" variant="outlined"
          placeholder={t('conv_search_placeholder', 'Search conversations...')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon style={{ fontSize: 18, color: '#9ca3af' }} /></InputAdornment>) }}
          style={{ marginBottom: 8 }}
        />
        <TextField
          select fullWidth size="small" variant="outlined"
          label={t('conv_filter_by_agent', 'Filter by agent')}
          value={agentId}
          onChange={(e) => setAgentId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
        >
          <MenuItem value="all">{t('conv_all_agents', 'All agents')}</MenuItem>
          {agents.map((a: any) => (<MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>))}
        </TextField>
      </Box>

      {/* List */}
      <Box style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" style={{ height: 160 }}><CircularProgress size={28} /></Box>
        ) : filtered.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" style={{ height: 160, color: '#9ca3af', padding: 16, textAlign: 'center' }}>
            <Typography>{t('conv_empty', 'No conversations found')}</Typography>
          </Box>
        ) : (
          filtered.map((c: IConversation) => (
            <ConversationCard key={c.id} conversation={c} selected={c.id === selectedId} onClick={() => onSelect(c.id)} />
          ))
        )}
      </Box>
    </Box>
  );
};

export default ConversationList;
