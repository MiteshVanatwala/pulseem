import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Select, MenuItem } from '@material-ui/core';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import { getConversations, getAgents } from '../../../redux/reducers/conversationsSlice';
import { IConversation } from '../../../Models/Service/Conversation';
import ServiceChannelDropdown, { ServiceChannel } from './ServiceChannelDropdown';
import ConversationList from './components/ConversationList';
import ConversationDetail from './components/ConversationDetail';
import './conversations.css';

// Resolve the widget domain a conversation belongs to (explicit domain, else pageUrl host).
export const hostOf = (c: IConversation): string => {
  if (c.domain) return c.domain;
  try { return c.pageUrl ? new URL(c.pageUrl).host : ''; } catch { return ''; }
};

// Embeddable widget inbox rendered inside the WhatsApp Chat screen when the header's
// channel dropdown is set to "Widget". Header mirrors the WhatsApp sidebar layout:
// [channel dropdown] + [domain dropdown] (in place of the WhatsApp number dropdown).
const WidgetInboxPanes = ({ onChannelChange }: { onChannelChange?: (c: ServiceChannel) => void }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const core = useSelector((s: any) => s.core);
  const conversations: IConversation[] = useSelector((s: any) => s.conversations.conversations);
  const isAdmin = core?.userRoles ? core.userRoles === 'Admin' || core.isAdmin : true;

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [domain, setDomain] = useState<string>('');

  useEffect(() => {
    dispatch(getConversations(undefined));
    dispatch(getAgents());
  }, [dispatch]);

  // Domains from the loaded widget conversations. (Production can source these from
  // GetAllWidgets so the list shows every configured domain, even with no chats yet.)
  const domains = useMemo(() => {
    const set = new Set<string>();
    conversations.forEach((c) => { const h = hostOf(c); if (h) set.add(h); });
    return Array.from(set);
  }, [conversations]);

  useEffect(() => {
    if (!domain && domains.length > 0) setDomain(domains[0]);
  }, [domains, domain]);

  return (
    <Box display="flex" flexDirection="column" style={{ height: 'calc(100vh - 180px)', minHeight: 480, border: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
      {/* Header — channel dropdown (in place of avatar) + domain dropdown (in place of number) */}
      <Box className="svc-detail-header" display="flex" alignItems="center" p={1} style={{ gap: 8, borderBottom: '1px solid #e5e7eb' }}>
        <ServiceChannelDropdown value="widget" onChange={(ch) => onChannelChange && onChannelChange(ch)} />
        <Select
          value={domain}
          onChange={(e) => setDomain(e.target.value as string)}
          variant="outlined"
          displayEmpty
          style={{ height: 40, minWidth: 200, background: '#fff' }}
          renderValue={(v: any) => v || t('conv_all_domains', 'All domains')}
        >
          {domains.map((d) => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
        </Select>
      </Box>

      {/* Two-pane below the header */}
      <Box display="flex" style={{ flex: 1, minHeight: 0 }}>
        <Box style={{ width: '34%', minWidth: 300, borderInlineEnd: '1px solid #e5e7eb', height: '100%' }}>
          <ConversationList isAdmin={isAdmin} selectedId={selectedId} onSelect={setSelectedId} domainFilter={domain} />
        </Box>
        <Box flex={1} display="flex" flexDirection="column" style={{ minWidth: 0 }}>
          {selectedId ? (
            <ConversationDetail conversationId={selectedId} isAdmin={isAdmin} onBack={() => setSelectedId(undefined)} />
          ) : (
            <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" style={{ color: '#9ca3af' }}>
              <ChatBubbleOutlineIcon style={{ fontSize: 48, marginBottom: 12 }} />
              <Typography>{t('conv_select_prompt', 'Select a conversation to view')}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default WidgetInboxPanes;
