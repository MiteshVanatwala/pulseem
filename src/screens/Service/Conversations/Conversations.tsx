import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography } from '@material-ui/core';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import clsx from 'clsx';
import DefaultScreen from '../../DefaultScreen';
import { sitePrefix } from '../../../config';
import { getConversations, getAgents } from '../../../redux/reducers/conversationsSlice';
import ConversationList from './components/ConversationList';
import ConversationDetail from './components/ConversationDetail';
import './conversations.css';

const Conversations = ({ classes }: { classes?: any }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const { conversationId } = useParams<{ conversationId?: string }>();

  // Role: Admin sees all, Agent sees own + unassigned. Wire to real role when integrating.
  const core = useSelector((s: any) => s.core);
  const isAdmin = core?.userRoles ? core.userRoles === 'Admin' || core.isAdmin : true;

  const [selectedId, setSelectedId] = useState<string | undefined>(conversationId);

  useEffect(() => {
    dispatch(getConversations(undefined));
    dispatch(getAgents());
  }, [dispatch]);

  useEffect(() => { setSelectedId(conversationId); }, [conversationId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    navigate(`${sitePrefix}Conversations/${id}`);
  };
  const handleBack = () => {
    setSelectedId(undefined);
    navigate(`${sitePrefix}Conversations`);
  };

  return (
    <DefaultScreen currentPage="conversations" classes={classes} containerClass={clsx(classes?.management)}>
      <Box mt={2} mb={2}>
        <Typography variant="h4" style={{ fontWeight: 'bold', color: '#1a1a1a' }}>
          {t('conv_conversations', 'Conversations')}
        </Typography>
      </Box>

      <Box
        display="flex"
        style={{ height: 'calc(100vh - 200px)', minHeight: 480, border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' }}
      >
        {/* Left pane — list (hidden on mobile when a conversation is open) */}
        <Box
          style={{ width: '34%', minWidth: 300, borderInlineEnd: '1px solid #e5e7eb', display: selectedId ? undefined : 'block' }}
          className={selectedId ? 'conv-list-pane-hide-mobile' : undefined}
        >
          <ConversationList isAdmin={isAdmin} selectedId={selectedId} onSelect={handleSelect} />
        </Box>

        {/* Right pane — detail */}
        <Box flex={1} display="flex" flexDirection="column" style={{ minWidth: 0 }}>
          {selectedId ? (
            <ConversationDetail conversationId={selectedId} isAdmin={isAdmin} onBack={handleBack} />
          ) : (
            <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" style={{ color: '#9ca3af' }}>
              <ChatBubbleOutlineIcon style={{ fontSize: 48, marginBottom: 12 }} />
              <Typography>{t('conv_select_prompt', 'Select a conversation to view')}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </DefaultScreen>
  );
};

export default Conversations;
