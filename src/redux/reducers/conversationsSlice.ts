import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import {
  IConversation, IMessage, IVisitorInfo, IPageVisit, IAgentOption,
  IConversationListFilter, ConversationStatus,
} from '../../Models/Service/Conversation';
import {
  MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_VISITOR_INFO, MOCK_PAGE_TRAIL, MOCK_AGENTS,
} from '../../screens/Service/Conversations/mockData';

// ⚠️ PREVIEW FLAG — true = use local mock data (no backend needed); false = call the
// real Service/* endpoints. The Service backend (ServiceController, PR-2455) is now
// on the branch, so this runs against the real API; flip back to true only to work
// the UI without a backend.
const USE_MOCK = false;

// The Service backend (ServiceController) returns `JsonConvert.SerializeObject(...)`,
// i.e. a double-encoded JSON string (same as WidgetController), so axios hands back
// `response.data` as raw text. Parse it into the envelope. Passes objects through
// unchanged, so it's safe if the backend is later changed to return a real object.
const unwrap = <T = any>(data: any): { StatusCode: number; Message: string; Data: T } =>
  typeof data === 'string' ? JSON.parse(data) : data;

// Ceiling on a single conversations fetch. Matches the proc's default; raise both
// together, or add paging UI, if an account outgrows it.
export const CONVERSATION_PAGE_SIZE = 200;

const mockDelay = <T = any>(data: T, ms = 200): Promise<T> => new Promise((r) => setTimeout(() => r(data), ms));

export const getConversations = createAsyncThunk(
  'Service/GetConversations',
  async (filters: IConversationListFilter | undefined) => {
    if (USE_MOCK) return mockDelay(MOCK_CONVERSATIONS);
    // pageSize is sent explicitly rather than left to the proc default so the ceiling
    // is visible here, where the list is consumed. There is no paging UI yet: this is
    // the most recent PAGE_SIZE conversations, not necessarily all of them.
    const body: any = { pageNumber: 1, pageSize: CONVERSATION_PAGE_SIZE };
    if (filters) {
      body.status = filters.status === 'all' ? null : filters.status;
      body.search = filters.search || null;
      body.agentId = filters.agentId;
      body.channel = filters.channel && filters.channel !== 'all' ? filters.channel : null;
    }
    const res = await PulseemReactInstance.post('Service/GetConversations', body);
    const env = unwrap<IConversation[]>(res.data);
    return env.Data || [];
  }
);

// Credential + address for the real-time socket. Kept as a thunk so it goes through
// the same axios instance (and session refresh) as every other Service call.
//
// Returns null rather than throwing when real-time is switched off — the backend
// answers 200 with enabled:false when the socket secret or URL is unset, and the
// inbox is expected to carry on polling in that case.
export const getSocketToken = createAsyncThunk(
  'Service/SocketToken',
  async (): Promise<{ token: string; url: string } | null> => {
    if (USE_MOCK) return null;
    const res = await PulseemReactInstance.get('Service/SocketToken');
    const env = unwrap<{ token: string; url: string; enabled: boolean }>(res.data);
    const data = env.Data;
    if (!data || !data.enabled || !data.token || !data.url) return null;
    return { token: data.token, url: data.url };
  }
);

export const getAgents = createAsyncThunk('Service/GetAgents', async () => {
  if (USE_MOCK) return mockDelay(MOCK_AGENTS);
  const res = await PulseemReactInstance.get('Service/GetAgents');
  const env = unwrap<IAgentOption[]>(res.data);
  return env.Data || [];
});

export const getMessages = createAsyncThunk(
  'Service/GetMessages',
  async (conversationId: string) => {
    if (USE_MOCK) return mockDelay(MOCK_MESSAGES[conversationId] || []);
    const res = await PulseemReactInstance.get(`Service/GetMessages/${conversationId}`);
    const env = unwrap<IMessage[]>(res.data);
    return env.Data || [];
  }
);

export const getConversationDetail = createAsyncThunk(
  'Service/GetConversationDetail',
  async (conversationId: string) => {
    if (USE_MOCK) return mockDelay({
      conversation: MOCK_CONVERSATIONS.find((c) => c.id === conversationId) || null,
      visitorInfo: MOCK_VISITOR_INFO[conversationId] || null,
      pageTrail: MOCK_PAGE_TRAIL[conversationId] || [],
    });
    const res = await PulseemReactInstance.get(`Service/GetConversationDetail/${conversationId}`);
    const env = unwrap<{ conversation: IConversation | null; visitorInfo: IVisitorInfo | null; pageTrail: IPageVisit[] }>(res.data);
    return env.Data || { conversation: null, visitorInfo: null, pageTrail: [] };
  }
);

export const sendMessage = createAsyncThunk(
  'Service/SendMessage',
  async (data: { conversationId: string; content: string; fileUrl?: string }) => {
    if (USE_MOCK) {
      const msg: IMessage = {
        id: `local-${Math.random().toString(36).slice(2)}`,
        conversationId: data.conversationId, sender: 'agent', senderName: 'You',
        content: data.content, fileUrl: data.fileUrl, sentAt: new Date().toISOString(),
      };
      return mockDelay(msg, 120);
    }
    const res = await PulseemReactInstance.post('Service/SendMessage', data);
    const env = unwrap<IMessage>(res.data);
    return env.Data;
  }
);

export const updateConversation = createAsyncThunk(
  'Service/UpdateConversation',
  async (data: { id: string; status?: ConversationStatus; agentId?: number | null; agentName?: string | null }) => {
    // `setAgent` tells the backend whether to touch the agent assignment (an agentId
    // key is only present when the caller is reassigning — including to null/unassign).
    const setAgent = Object.prototype.hasOwnProperty.call(data, 'agentId');
    if (!USE_MOCK) {
      await PulseemReactInstance.post('Service/UpdateConversation', {
        id: data.id, status: data.status, agentId: data.agentId, setAgent,
      });
    }
    // Return the caller's intended change so the reducer applies exactly that
    // (avoids unassigning on a status-only update).
    return data;
  }
);

export const uploadFile = createAsyncThunk(
  'Service/UploadFile',
  async (file: File) => {
    if (USE_MOCK) return mockDelay({ fileUrl: `https://mock.pulseem.com/uploads/${encodeURIComponent(file.name)}` }, 500);
    const form = new FormData();
    form.append('file', file);
    const res = await PulseemReactInstance.post('Service/UploadFile', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const env = unwrap<{ fileUrl: string }>(res.data);
    return env.Data;
  }
);

interface ConversationsState {
  conversations: IConversation[];
  totalCount: number;
  selectedConversation: IConversation | null;
  messages: IMessage[];
  visitorInfo: IVisitorInfo | null;
  pageTrail: IPageVisit[];
  agents: IAgentOption[];
  filters: IConversationListFilter;
  loading: boolean;
  messagesLoading: boolean;
  sendingMessage: boolean;
  uploadingFile: boolean;
}

const initialState: ConversationsState = {
  conversations: [],
  totalCount: 0,
  selectedConversation: null,
  messages: [],
  visitorInfo: null,
  pageTrail: [],
  agents: [],
  filters: { status: 'all', search: '', agentId: null },
  loading: false,
  messagesLoading: false,
  sendingMessage: false,
  uploadingFile: false,
};

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelected(state) {
      state.selectedConversation = null;
      state.messages = [];
      state.visitorInfo = null;
      state.pageTrail = [];
    },

    // ── Real-time (socket) ────────────────────────────────────────────────
    // These mirror what a refetch would have produced, so the reducers below stay
    // the single place that knows the state shape whether an update arrived by
    // poll or by socket.

    /**
     * A message arrived for some conversation. Appended only when that thread is the
     * one on screen; the list row is updated either way so unopened threads still
     * show the new preview and move to the top.
     *
     * De-duplicated by id because the sender also receives its own message back over
     * the socket, and sendMessage.fulfilled has already pushed it.
     */
    socketMessageReceived(state, action) {
      const { conversationId, message } = action.payload || {};
      if (!conversationId || !message) return;

      if (state.selectedConversation && state.selectedConversation.id === conversationId) {
        const exists = message.id && state.messages.some((m) => m.id === message.id);
        if (!exists) state.messages.push(message);
      }

      const row = state.conversations.find((c) => c.id === conversationId);
      if (row) {
        row.lastMessage = message.content || row.lastMessage;
        row.lastMessageSender = message.sender || row.lastMessageSender;
        row.lastActivityAt = message.sentAt || new Date().toISOString();
        row.messageCount = (row.messageCount || 0) + 1;
      }
    },

    /** A brand-new conversation appeared. Ignored if we already know it. */
    socketConversationCreated(state, action) {
      const conversation = action.payload;
      if (!conversation || !conversation.id) return;
      if (state.conversations.some((c) => c.id === conversation.id)) return;
      state.conversations.unshift(conversation);
      state.totalCount += 1;
    },

    /**
     * Status or assignment changed elsewhere. Patched field-by-field rather than
     * replaced: the socket payload carries only what changed, so overwriting the row
     * would blank out fields the event never mentions.
     */
    socketConversationUpdated(state, action) {
      const incoming = action.payload;
      if (!incoming || !incoming.id) return;
      const apply = (c: IConversation) => {
        if (incoming.status) c.status = incoming.status;
        if (Object.prototype.hasOwnProperty.call(incoming, 'assignedAgentId')) {
          c.assignedAgentId = incoming.assignedAgentId ?? null;
          c.assignedAgentName = incoming.assignedAgentName ?? null;
        }
        if (incoming.lastMessage) c.lastMessage = incoming.lastMessage;
        if (incoming.lastActivityAt) c.lastActivityAt = incoming.lastActivityAt;
      };
      const row = state.conversations.find((c) => c.id === incoming.id);
      if (row) apply(row);
      if (state.selectedConversation && state.selectedConversation.id === incoming.id) {
        apply(state.selectedConversation);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConversations.pending, (state) => { state.loading = true; })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload || [];
        state.totalCount = (action.payload || []).length;
      })
      .addCase(getConversations.rejected, (state) => { state.loading = false; })

      .addCase(getAgents.fulfilled, (state, action) => { state.agents = action.payload || []; })

      .addCase(getMessages.pending, (state) => { state.messagesLoading = true; })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload || [];
      })
      .addCase(getMessages.rejected, (state) => { state.messagesLoading = false; })

      .addCase(getConversationDetail.fulfilled, (state, action) => {
        state.selectedConversation = action.payload.conversation;
        state.visitorInfo = action.payload.visitorInfo;
        state.pageTrail = action.payload.pageTrail || [];
      })

      .addCase(sendMessage.pending, (state) => { state.sendingMessage = true; })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        if (action.payload) state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state) => { state.sendingMessage = false; })

      .addCase(uploadFile.pending, (state) => { state.uploadingFile = true; })
      .addCase(uploadFile.fulfilled, (state) => { state.uploadingFile = false; })
      .addCase(uploadFile.rejected, (state) => { state.uploadingFile = false; })

      .addCase(updateConversation.fulfilled, (state, action) => {
        const { id, status, agentId, agentName } = action.payload as any;
        const apply = (c: IConversation) => {
          if (status) c.status = status;
          if (Object.prototype.hasOwnProperty.call(action.payload, 'agentId')) {
            c.assignedAgentId = agentId ?? null;
            c.assignedAgentName = agentName ?? null;
          }
        };
        const inList = state.conversations.find((c) => c.id === id);
        if (inList) apply(inList);
        if (state.selectedConversation && state.selectedConversation.id === id) apply(state.selectedConversation);
      });
  },
});

export const {
  setFilters,
  clearSelected,
  socketMessageReceived,
  socketConversationCreated,
  socketConversationUpdated,
} = conversationsSlice.actions;
export default conversationsSlice.reducer;
