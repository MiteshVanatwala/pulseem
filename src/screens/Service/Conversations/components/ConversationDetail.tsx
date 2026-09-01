import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Select, MenuItem, IconButton, Grid } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {
  getConversationDetail, getMessages, sendMessage, updateConversation, uploadFile,
} from '../../../../redux/reducers/conversationsSlice';
import { ConversationStatus, STATUS_ORDER, STATUS_COLORS, avatarColor, avatarInitial } from '../../../../Models/Service/Conversation';
import MessageArea from './MessageArea';
import MessageInput from './MessageInput';
import VisitorInfoPanel from './VisitorInfoPanel';
import PageNavTrail from './PageNavTrail';

interface Props { conversationId: string; isAdmin: boolean; onBack: () => void; }

const ConversationDetail = ({ conversationId, isAdmin, onBack }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const { selectedConversation, messages, visitorInfo, pageTrail, messagesLoading, sendingMessage, uploadingFile, agents } =
    useSelector((s: any) => s.conversations);

  useEffect(() => {
    dispatch(getConversationDetail(conversationId));
    dispatch(getMessages(conversationId));
  }, [conversationId, dispatch]);

  // Poll the open conversation's messages every 5s (swap for WebSocket later).
  useEffect(() => {
    const interval = setInterval(() => { dispatch(getMessages(conversationId)); }, 5000);
    return () => clearInterval(interval);
  }, [conversationId, dispatch]);

  const conv = selectedConversation;
  const last6 = conv?.visitorId ? conv.visitorId.slice(-6) : conversationId.slice(-6);
  const title = conv?.visitorName || t('conv_visitor', 'Visitor {{id}}', { id: last6 });

  const handleStatus = (status: ConversationStatus) => {
    dispatch(updateConversation({ id: conversationId, status }));
  };
  const handleAgent = (value: string) => {
    if (value === 'unassigned') {
      dispatch(updateConversation({ id: conversationId, agentId: null, agentName: null }));
    } else {
      const a = agents.find((x: any) => x.id === Number(value));
      dispatch(updateConversation({ id: conversationId, agentId: Number(value), agentName: a?.name ?? null }));
    }
  };
  const handleSend = (content: string) => {
    dispatch(sendMessage({ conversationId, content }));
  };
  const handleUpload = async (file: File) => {
    const action = await dispatch(uploadFile(file));
    const fileUrl = (action?.payload as any)?.fileUrl;
    if (fileUrl) dispatch(sendMessage({ conversationId, content: '', fileUrl }));
  };

  return (
    <Box display="flex" flexDirection="column" style={{ height: '100%' }}>
      {/* Header */}
      <Box className="svc-detail-header" p={1.5} style={{ borderBottom: '1px solid #e5e7eb' }}>
        <Box display="flex" alignItems="center" mb={1}>
          <IconButton size="small" onClick={onBack} style={{ marginInlineEnd: 4 }}><ArrowBackIcon fontSize="small" /></IconButton>
          <div className="svc-avatar svc-avatar-sm" style={{ backgroundColor: avatarColor(conversationId), marginInlineEnd: 10 }}>
            {avatarInitial(conv?.visitorName, 'V')}
          </div>
          <Box style={{ minWidth: 0 }}>
            <Typography noWrap style={{ fontWeight: 700, color: '#111827' }}>{title}</Typography>
            <Typography variant="caption" style={{ color: '#9ca3af' }}>
              {[conv?.visitorEmail, conv?.visitorPhone].filter(Boolean).join(' · ') || t('conv_no_contact', 'No contact details')}
              {conv ? ` · ${conv.messageCount} ${t('conv_messages', 'messages')}` : ''}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" style={{ gap: 8 }}>
          <Select
            value={conv?.status || 'new'}
            onChange={(e) => handleStatus(e.target.value as ConversationStatus)}
            variant="outlined" margin="dense"
            style={{ height: 34, fontSize: 13, minWidth: 130 }}
            renderValue={(v: any) => (
              <Box display="flex" alignItems="center">
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: STATUS_COLORS[v as ConversationStatus], marginInlineEnd: 6 }} />
                {t(`conv_${v}`, String(v))}
              </Box>
            )}
          >
            {STATUS_ORDER.map((s) => (<MenuItem key={s} value={s}>{t(`conv_${s}`, s)}</MenuItem>))}
          </Select>

          {isAdmin && (
            <Select
              value={conv?.assignedAgentId ? String(conv.assignedAgentId) : 'unassigned'}
              onChange={(e) => handleAgent(String(e.target.value))}
              variant="outlined" margin="dense"
              style={{ height: 34, fontSize: 13, minWidth: 150 }}
            >
              <MenuItem value="unassigned">{t('conv_unassigned', 'Unassigned')}</MenuItem>
              {agents.map((a: any) => (<MenuItem key={a.id} value={String(a.id)}>{a.name}</MenuItem>))}
            </Select>
          )}
        </Box>
      </Box>

      {/* Info row (widget-channel context; empty for WhatsApp) */}
      {(pageTrail?.length > 0 || visitorInfo) && (
        <Box p={1.5} style={{ borderBottom: '1px solid #f1f3f5' }}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}><PageNavTrail trail={pageTrail} /></Grid>
            <Grid item xs={12} sm={6}><VisitorInfoPanel info={visitorInfo} /></Grid>
          </Grid>
        </Box>
      )}

      {/* Messages + input */}
      <MessageArea messages={messages} loading={messagesLoading} />
      <MessageInput sending={sendingMessage} uploading={uploadingFile} onSend={handleSend} onUploadFile={handleUpload} />
    </Box>
  );
};

export default ConversationDetail;
