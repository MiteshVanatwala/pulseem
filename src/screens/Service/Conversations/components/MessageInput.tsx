import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, TextField, IconButton, CircularProgress } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import AttachFileIcon from '@material-ui/icons/AttachFile';

interface Props {
  sending: boolean;
  uploading: boolean;
  onSend: (content: string) => void;
  onUploadFile: (file: File) => void;
}

const MessageInput = ({ sending, uploading, onSend, onUploadFile }: Props) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const send = () => {
    const value = text.trim();
    if (!value || sending) return;
    onSend(value);
    setText('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadFile(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <Box display="flex" alignItems="flex-end" p={1.5} style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
      <input ref={fileRef} type="file" hidden onChange={onFilePicked} />
      <IconButton size="small" disabled={uploading} onClick={() => fileRef.current?.click()} style={{ marginInlineEnd: 4 }}>
        {uploading ? <CircularProgress size={20} /> : <AttachFileIcon />}
      </IconButton>
      <TextField
        fullWidth multiline maxRows={4} size="small" variant="outlined"
        placeholder={t('conv_type_message', 'Type your message...')}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <IconButton color="primary" disabled={!text.trim() || sending} onClick={send} style={{ marginInlineStart: 4 }}>
        {sending ? <CircularProgress size={20} /> : <SendIcon style={{ color: !text.trim() ? '#cbd5e1' : '#f4511e' }} />}
      </IconButton>
    </Box>
  );
};

export default MessageInput;
