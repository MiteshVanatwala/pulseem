import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@material-ui/core';
import { IMessage } from '../../../../Models/Service/Conversation';
import MessageBubble from './MessageBubble';

const MessageArea = ({ messages, loading }: { messages: IMessage[]; loading: boolean }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box className="svc-msg-area" style={{ flex: 1, overflowY: 'auto' }} p={2}>
      {loading && messages.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" style={{ height: 120 }}><CircularProgress size={26} /></Box>
      ) : (
        messages.map((m) => <MessageBubble key={m.id} message={m} />)
      )}
      <div ref={bottomRef} />
    </Box>
  );
};

export default MessageArea;
