# Prompt — React Client: Support Chat Escalation Feature

## What This Is

You are working on the **React** portion of a Pulseem AI support chat widget (Feature 73).
The project folder is: `C:\GitHubProjects\SupportPulsyMigration\React\`

The escalation feature is **fully implemented**. This prompt gives you the complete picture
so you can make additional client-side changes, fix bugs, or extend behaviour.

---

## Tech Stack (React side only)

| | |
|---|---|
| Framework | React + TypeScript |
| UI | Material-UI v4 (`@material-ui/core`, `makeStyles`) |
| State | Redux Toolkit (`createSlice`, `createAsyncThunk`) |
| HTTP | Axios via `PulseemReactInstance` |
| i18n | `react-i18next` — `useTranslation()` / `t('key')` |
| Routing | Not relevant — these are floating widget components |

---

## Architecture Overview

There are **two independent AI chat widgets** in the product, sharing the same component tree:

| | Feature 69 — Advisor | Feature 73 — Support |
|---|---|---|
| Config object | `advisorConfig` | `supportConfig` |
| Redux slice | `aiChatSlice` → `state.aiChat` | `supportChatSlice` → `state.supportChat` |
| Redux key | `'aiChat'` | `'supportChat'` |
| Backend API prefix | `PulsyAI/` | `PulsyAISupport/` |
| Escalation? | ❌ No | ✅ Yes |

Both widgets use the **exact same components** (`AIChatWidget`, `MessageList`, `InputArea`, `ChatHeader`).
The `config` prop (type `AIChatConfig`) controls which slice/API each component uses.
The flag `config.reduxSliceName === 'supportChat'` is used throughout to branch support-specific logic.

---

## All Changed Files — Full Current Content

### 1. `Models/StateTypes.ts`

```typescript
export type ReportStateType = {
    showContent: Boolean;
    productsReportDetails: Array<any>;
    productCategories: Array<any>;
    exportPRData: Array<any>;
    responsesReportDetails: Array<any>;
    TotalResponses: number;
};

export type CoreStateType = {
    language: "he" | "en";
    isRTL: boolean;
    windowSize: "xs" | "sm" | "md" | "lg" | "xl";
    basename: String;
    email: String;
    phone: String;
    imageURL: String;
    isWhiteLabel: false;
    companyName: String;
    rowsPerPage: number;
    isClal: Boolean;
    accountFeatures: any;
    cameFromSubAccount: boolean | null;
    isAdmin: boolean | null;
    isAllowSwitchAccount: boolean | null;
    billingTypeId: String | null;
    accountSettings: any;
    userRoles: any;
};

export interface Message {
    MessageID: string;
    MessageText: string;
    MessageHTML?: string;
    MessageTimestamp: string;
    MessageTypeID: number;
}

export interface AiChatState {
    isOpen: boolean;
    messages: Message[];
    isLoading: boolean;
    totalMessagesForUserCount: number;
    aiIconStatus: number;
    isEscalated: boolean;      // ← NEW: true when session is handed to human agent
    suggestAgent: boolean;     // ← NEW: true when AI recommends escalation
    lastAgentMessageId: number; // ← NEW: cursor for TypeID=4 polling
}

export type StateType = {
    core: CoreStateType;
    user: any;
    newsletter: any;
    landingPages: any;
    mms: any;
    automations: any;
    notification: any;
    sms: any;
    dashboard: any;
    recipientReports: any;
    shortcuts: any;
    payment: any;
    common: any;
    client: any;
    campaignEditor: any;
    siteTracking: any;
    group: any;
    report: ReportStateType;
    gallery: any;
    connectors: any;
    accountSettings: any;
    whatsapp: any;
    product: any;
    extraFields: any;
    affiliates: any;
    amp: any;
    companyName?: string;
    billing: any;
    linksClicksReportSlice: any;
    aiChat: AiChatState;
    supportChat: AiChatState;
    Ai: any;
};
```

---

### 2. `components/AI/chatConfig.ts`

```typescript
import PulseemMascotImage from '../../assets/images/pulseem_mascot.png';
import MascotPointingImage from '../../assets/images/mascot_pointing.png';
import SupportMascotImage from '../../assets/images/support_mascot.png';

export interface AIChatConfig {
  featureId: number;
  apiAddMessage: string;
  apiLoadSession: string;
  apiNewSession: string;
  apiEscalate?: string;      // ← NEW: optional, only on supportConfig
  apiNewMessages?: string;   // ← NEW: optional, only on supportConfig
  maxChars: number;
  headerTitleKey: string;
  bubbleTextKey: string;
  presetQuestionKeys: string[];
  mascotButtonImage: string;
  mascotWidgetImage: string;
  reduxSliceName: string;
  localStorageKey: string;
}

export const advisorConfig: AIChatConfig = {
  featureId: 69,
  apiAddMessage: 'PulsyAI/AddMessage',
  apiLoadSession: 'PulsyAI/LoadSessionMessages',
  apiNewSession: 'PulsyAI/NewSession',
  maxChars: 500,
  headerTitleKey: 'common.aiAdvisorHeader',
  bubbleTextKey: 'common.polyAgentIconTitleMarquee',
  presetQuestionKeys: [
    'common.presetQuestion1',
    'common.presetQuestion2',
    'common.presetQuestion3',
    'common.presetQuestion4',
  ],
  mascotButtonImage: PulseemMascotImage,
  mascotWidgetImage: MascotPointingImage,
  reduxSliceName: 'aiChat',
  localStorageKey: 'hideAIChatDialog',
};

export const supportConfig: AIChatConfig = {
  featureId: 73,
  apiAddMessage: 'PulsyAISupport/AddMessage',
  apiLoadSession: 'PulsyAISupport/LoadSessionMessages',
  apiNewSession: 'PulsyAISupport/NewConversation',
  apiEscalate: 'PulsyAISupport/EscalateToAgent',       // ← NEW
  apiNewMessages: 'PulsyAISupport/NewMessages',         // ← NEW
  maxChars: 2000,
  headerTitleKey: 'common.supportHeader',
  bubbleTextKey: 'common.supportBubbleText',
  presetQuestionKeys: [
    'common.supportPreset1',
    'common.supportPreset2',
    'common.supportPreset3',
    'common.supportPreset4',
  ],
  mascotButtonImage: SupportMascotImage,
  mascotWidgetImage: SupportMascotImage,
  reduxSliceName: 'supportChat',
  localStorageKey: 'hideSupportChatDialog',
};
```

---

### 3. `redux/reducers/aiChatSlice.ts`
*(Feature 69 — Advisor. Updated only to satisfy the shared `AiChatState` interface.)*

```typescript
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Message } from '../../Models/StateTypes';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';

export const loadSessionMessages = createAsyncThunk(
  'aiChat/loadSessionMessages',
  async () => {
    const response = await PulseemReactInstance.get('PulsyAI/LoadSessionMessages');
    return response.data;
  }
);

export const addMessage = createAsyncThunk(
  'aiChat/addMessage',
  async (message: { MessageText: string; MessageTypeID: number }) => {
    const response = await PulseemReactInstance.post('PulsyAI/AddMessage', message);
    return response.data;
  }
);

// Local interface (not imported from StateTypes — keeps Feature 69 self-contained)
interface AiChatState {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  aiIconStatus: 0|1|2|3;
  totalMessagesForUserCount: number;
  isEscalated: boolean;        // ← ADDED (required by shared StateType in StateTypes.ts)
  suggestAgent: boolean;       // ← ADDED
  lastAgentMessageId: number;  // ← ADDED
}

const initialState: AiChatState = {
  isOpen: false,
  messages: [],
  isLoading: false,
  aiIconStatus: 0,
  totalMessagesForUserCount: -1,
  isEscalated: false,          // ← ADDED (always false for Feature 69)
  suggestAgent: false,         // ← ADDED (always false for Feature 69)
  lastAgentMessageId: 0,       // ← ADDED (unused for Feature 69)
};

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    toggleChat: (state) => { state.isOpen = !state.isOpen; },
    openAIChat: (state) => { state.isOpen = true; },
    addUserMessage: (state, action: PayloadAction<any>) => { state.messages.push(action.payload); },
    setLoading: (state, action: PayloadAction<boolean>) => { state.isLoading = action.payload; },
    setAIIconStatus: (state, action: PayloadAction<0|1|2|3>) => { state.aiIconStatus = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addMessage.fulfilled, (state, action: any) => {
        state.messages.push(action.payload?.Data || []);
        state.totalMessagesForUserCount = action.payload?.DataCount?.TotalMessagesForUserCount || 0;
        state.aiIconStatus = 2;
      })
      .addCase(addMessage.rejected, (state) => { state.aiIconStatus = 2; })
      .addCase(loadSessionMessages.pending, (state) => { state.isLoading = true; })
      .addCase(loadSessionMessages.fulfilled, (state, action: any) => {
        state.isLoading = false;
        if (action.payload) {
          state.messages.push(...(action.payload?.Data || []));
          state.totalMessagesForUserCount = action.payload?.DataCount?.TotalMessagesForUserCount || 0;
          state.aiIconStatus = 2;
        }
      })
      .addCase(loadSessionMessages.rejected, (state) => { state.isLoading = false; });
  },
});

export const { openAIChat, toggleChat, setLoading, setAIIconStatus, addUserMessage } = aiChatSlice.actions;
export default aiChatSlice.reducer;
```

---

### 4. `redux/reducers/supportChatSlice.ts`
*(Feature 73 — Support. Full escalation logic lives here.)*

```typescript
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Message, AiChatState } from '../../Models/StateTypes';
import { PulseemReactInstance } from '../../helpers/Api/PulseemReactAPI';
import { supportConfig } from '../../components/AI/chatConfig';

// ── Thunks ──────────────────────────────────────────────────────────────────

export const loadSupportSessionMessages = createAsyncThunk(
  'supportChat/loadSessionMessages',
  async () => {
    const response = await PulseemReactInstance.get(supportConfig.apiLoadSession);
    return response.data;
  }
);

export const addSupportMessage = createAsyncThunk(
  'supportChat/addMessage',
  async (message: { MessageText: string; MessageTypeID: number }) => {
    const response = await PulseemReactInstance.post(supportConfig.apiAddMessage, message);
    return response.data;
  }
);

export const startNewSupportSession = createAsyncThunk(
  'supportChat/startNewSession',
  async () => {
    const response = await PulseemReactInstance.post(supportConfig.apiNewSession, {});
    return response.data;
  }
);

// Called when customer clicks "Contact Agent"
export const escapeToAgent = createAsyncThunk(
  'supportChat/escapeToAgent',
  async () => {
    const response = await PulseemReactInstance.post(supportConfig.apiEscalate!, {});
    return response.data;
  }
);

// Called every 5s while isEscalated=true & widget is open
export const pollAgentMessages = createAsyncThunk(
  'supportChat/pollAgentMessages',
  async (afterId: number) => {
    const response = await PulseemReactInstance.get(
      `${supportConfig.apiNewMessages!}?afterId=${afterId}`
    );
    return response.data;
  }
);

// ── Initial State ────────────────────────────────────────────────────────────

const initialState: AiChatState = {
  isOpen: false,
  messages: [],
  isLoading: false,
  aiIconStatus: 0,
  totalMessagesForUserCount: -1,
  isEscalated: false,
  suggestAgent: false,
  lastAgentMessageId: 0,
};

// ── Slice ────────────────────────────────────────────────────────────────────

const supportChatSlice = createSlice({
  name: 'supportChat',
  initialState,
  reducers: {
    toggleSupportChat: (state) => { state.isOpen = !state.isOpen; },
    openSupportChat:   (state) => { state.isOpen = true; },
    addSupportUserMessage: (state, action: PayloadAction<any>) => {
      state.messages.push(action.payload);
    },
    setSupportLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSupportAIIconStatus: (state, action: PayloadAction<0 | 1 | 2 | 3>) => {
      state.aiIconStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      // addSupportMessage — user sends a message to AI
      .addCase(addSupportMessage.fulfilled, (state, action: any) => {
        // Data is null when session is escalated (AI is skipped server-side)
        if (action.payload?.Data) {
          state.messages.push(action.payload.Data);
        }
        state.totalMessagesForUserCount =
          action.payload?.DataCount?.TotalMessagesForUserCount || 0;
        state.suggestAgent = action.payload?.DataCount?.SuggestAgent || false;
        if (action.payload?.DataCount?.IsEscalated) {
          state.isEscalated = true;
        }
        state.aiIconStatus = 2;
      })
      .addCase(addSupportMessage.rejected, (state) => {
        state.aiIconStatus = 2;
      })

      // loadSupportSessionMessages — initial page load
      .addCase(loadSupportSessionMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadSupportSessionMessages.fulfilled, (state, action: any) => {
        state.isLoading = false;
        if (action.payload) {
          const msgs = action.payload?.Data || [];
          state.messages.push(...msgs);
          state.totalMessagesForUserCount =
            action.payload?.DataCount?.TotalMessagesForUserCount || 0;
          state.isEscalated = action.payload?.DataCount?.IsEscalated || false;
          // Set cursor to the highest TypeID=4 MessageID already loaded
          const agentMsgs = msgs.filter((m: any) => m.MessageTypeID === 4);
          if (agentMsgs.length > 0) {
            state.lastAgentMessageId = Math.max(...agentMsgs.map((m: any) => m.MessageID));
          }
          state.aiIconStatus = 2;
        }
      })
      .addCase(loadSupportSessionMessages.rejected, (state) => {
        state.isLoading = false;
      })

      // startNewSupportSession — "Start new conversation" button
      .addCase(startNewSupportSession.fulfilled, (state) => {
        state.messages              = [];
        state.totalMessagesForUserCount = -1;
        state.isEscalated           = false;
        state.suggestAgent          = false;
        state.lastAgentMessageId    = 0;
      })

      // escapeToAgent — customer clicks "Contact Agent"
      .addCase(escapeToAgent.fulfilled, (state, action: any) => {
        state.isEscalated  = true;
        state.suggestAgent = false;
        // Push the TypeID=1 escalation request message so it shows immediately
        if (action.payload?.Data) {
          state.messages.push(action.payload.Data);
        }
        // cursor stays at 0 — agent hasn't replied yet
      })

      // pollAgentMessages — 5s interval while escalated
      .addCase(pollAgentMessages.fulfilled, (state, action: any) => {
        const newMsgs = action.payload?.Data || [];
        if (newMsgs.length > 0) {
          state.messages.push(...newMsgs);
          state.lastAgentMessageId = Math.max(...newMsgs.map((m: any) => m.MessageID));
        }
      });
  },
});

export const {
  toggleSupportChat,
  openSupportChat,
  addSupportUserMessage,
  setSupportLoading,
  setSupportAIIconStatus,
} = supportChatSlice.actions;

export default supportChatSlice.reducer;
```

---

### 5. `components/AI/AIChatWidget.tsx`
*(Main widget shell — all escalation UI lives here.)*

```tsx
import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Paper, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StateType } from '../../Models/StateTypes';
import { toggleChat, loadSessionMessages, setAIIconStatus, openAIChat }
  from '../../redux/reducers/aiChatSlice';
import {
  toggleSupportChat, loadSupportSessionMessages, setSupportAIIconStatus,
  openSupportChat, escapeToAgent, pollAgentMessages
} from '../../redux/reducers/supportChatSlice';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import InputArea from './InputArea';
import { useTypewriter } from '../../hooks/useTypewriter';
import { useTranslation } from 'react-i18next';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import PresetQuestions from './PresetQuestions';
import { AIChatConfig, advisorConfig } from './chatConfig';

// ... (makeStyles omitted for brevity — unchanged from before)

interface AIChatWidgetProps {
  config?: AIChatConfig;
}

const AIChatWidget: React.FC<AIChatWidgetProps> = ({ config = advisorConfig }) => {
  const { isRTL }   = useSelector((state: any) => state.core);
  const { username } = useSelector((state: any) => state.user);
  const classes   = useStyles({ isRTL });
  const dispatch  = useDispatch();
  const inputAreaRef = useRef<{ focus: () => void }>(null);
  const { t }     = useTranslation();

  const isSupport = config.reduxSliceName === 'supportChat';
  const chatState = useSelector((state: StateType) =>
    isSupport ? state.supportChat : state.aiChat
  );
  const { isOpen, messages, totalMessagesForUserCount,
          isEscalated, suggestAgent, lastAgentMessageId } = chatState;
  const { accountFeatures } = useSelector((state: StateType) => state.common);

  // ─── Cursor ref: keeps cursor value fresh inside the setInterval
  //     WITHOUT adding lastAgentMessageId to the effect's deps array.
  //     (If it were in deps, the interval would be torn down and rebuilt
  //     on every new agent message — wasting a poll cycle and resetting timing.)
  const lastAgentMessageIdRef = useRef(lastAgentMessageId);
  useEffect(() => {
    lastAgentMessageIdRef.current = lastAgentMessageId;
  }, [lastAgentMessageId]);

  const { displayedText, isTyping } = useTypewriter({
    text: t(config.bubbleTextKey),
    speed: 100, delay: 1000, loop: false, startTyping: isOpen
  });

  // ─── Poll for new TypeID=4 (agent) messages every 5s ─────────────────────
  // Starts only when: isSupport=true AND isEscalated=true AND widget is open.
  // Stops automatically when:
  //   • widget closes        (isOpen → false)
  //   • new conversation     (startNewSupportSession sets isEscalated=false)
  //   • component unmounts   (cleanup runs clearInterval)
  useEffect(() => {
    if (!isSupport || !isEscalated || !isOpen) return;

    const intervalId = setInterval(() => {
      dispatch(pollAgentMessages(lastAgentMessageIdRef.current));
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isSupport, isEscalated, isOpen, dispatch]);
  // ↑ lastAgentMessageId intentionally NOT in deps — use ref instead

  const handleWidgetClick = (e: React.MouseEvent) => e.stopPropagation();

  const handleEscalate = () => {
    if (isSupport && !isEscalated) {
      dispatch(escapeToAgent());
    }
  };

  const handleBackdropClick = () => { /* intentionally empty */ };

  // ─── Auto-focus + icon status on open ────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => { inputAreaRef.current?.focus(); }, 300);
      if (messages.length === 0) {
        dispatch(isSupport ? setSupportAIIconStatus(1) : setAIIconStatus(1));
      }
    }
  }, [isOpen]);

  // ─── Initialize / auto-open ───────────────────────────────────────────────
  useEffect(() => {
    const initializeChat = async () => {
      if (totalMessagesForUserCount === -1) {
        await dispatch(isSupport ? loadSupportSessionMessages() : loadSessionMessages());
      }
      if (totalMessagesForUserCount === 0 && messages.length === 1 && username) {
        try {
          const hideDialog = localStorage.getItem(config.localStorageKey);
          if (hideDialog !== 'true' && !isOpen) {
            dispatch(isSupport ? openSupportChat() : openAIChat());
          }
        } catch (error) {
          console.error('Error sending initial message:', error);
        }
      }
    };

    const featureKey = String(config.featureId);
    if (totalMessagesForUserCount < 1 && username &&
        accountFeatures !== null &&
        accountFeatures?.indexOf(featureKey) !== -1) {
      initializeChat();
    }
  }, [dispatch, messages, username, totalMessagesForUserCount]);

  const featureKey = String(config.featureId);
  if (accountFeatures === null || accountFeatures?.indexOf(featureKey) === -1) return <></>;

  return (
    <div className={classes.PolywidgetContainer}>
      <div
        className={`${classes.Polybackdrop} ${isOpen ? classes.PolybackdropOpen : ''}`}
        onClick={handleBackdropClick}
      />
      <Paper
        className={`${classes.PolyWidget} ${isOpen ? classes.PolywidgetOpen : ''}`}
        elevation={5}
        onClick={handleWidgetClick}
      >
        <ChatHeader config={config} />
        <Box className={classes.Polycontent}>
          <MessageList config={config} />

          {/* "Contact Agent" button — support only, pre-escalation */}
          {isSupport && !isEscalated && (totalMessagesForUserCount >= 2 || suggestAgent) && (
            <Box style={{ padding: '6px 16px', textAlign: 'center' }}>
              <button
                onClick={handleEscalate}
                style={{
                  background: 'none',
                  border: '1px solid #dd2339',
                  color: '#dd2339',
                  borderRadius: '16px',
                  padding: '4px 14px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                {t('common.contactAgent')}
              </button>
            </Box>
          )}

          {/* "Connected to agent" status — support only, post-escalation */}
          {isSupport && isEscalated && (
            <Box style={{
              padding: '6px 16px',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#888'
            }}>
              {t('common.connectedToAgent')}
            </Box>
          )}

          <PresetQuestions config={config} />
        </Box>
        <InputArea ref={inputAreaRef} config={config} />
        <div className={classes.PolymascotImage}>
          <div className="message">
            {displayedText}
            {isTyping && <span className={classes.Polycursor} />}
          </div>
          <img src={config.mascotWidgetImage} alt="Pulseem Mascot" />
        </div>
      </Paper>
    </div>
  );
};

export default AIChatWidget;
```

---

### 6. `components/AI/MessageList.tsx`
*(Renders all message types — TypeID=4 gets green bubble + "נציג" label.)*

Key rendering logic (unchanged parts omitted):

```tsx
{messages.map((msg, index) => (
  <Box key={msg.MessageID} ...>
    <Box className={msg.MessageTypeID === 1 ? classes.userBubbleWrapper : classes.aiBubbleWrapper}>

      {/* "נציג" label above agent messages */}
      {msg.MessageTypeID === 4 && (
        <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '2px', paddingInlineStart: '4px' }}>
          {t('common.agentLabel')}
        </div>
      )}

      <Paper
        className={`${classes.messageBubble} ${
          msg.MessageTypeID === 1 ? classes.userBubble : classes.aiBubble
        }`}
        // Green bubble override for TypeID=4
        style={msg.MessageTypeID === 4
          ? { backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7' }
          : undefined}
        elevation={1}
      >
        {/* message content */}
      </Paper>
    </Box>
  </Box>
))}
```

**TypeID rendering summary:**

| TypeID | Alignment | Style | Label |
|--------|-----------|-------|-------|
| 1 — Customer | Right (`userMessage`) | Primary color bubble | None |
| 2 — AI | Left (`aiMessage`) | Gray `#f0f0f0` | None |
| 3 — System | Left (`aiMessage`) | Gray `#f0f0f0` | None |
| 4 — Agent | Left (`aiMessage`) | Green `#e8f5e9` + border `#a5d6a7` | `t('common.agentLabel')` = "נציג" |

---

### 7. `components/AI/InputArea.tsx`
*(NOT changed for escalation — documented here for completeness.)*

Important: When the session is escalated, `InputArea` continues to work exactly the same.
The customer can still type and send messages. When escalated, the backend skips the AI
and returns `Data: null` — the slice's `addSupportMessage.fulfilled` reducer handles this
with a null-guard: `if (action.payload?.Data) state.messages.push(...)`.

The "Start New Conversation" button calls `dispatch(startNewSupportSession())` which resets
the entire slice state including `isEscalated → false` and `lastAgentMessageId → 0`.

---

## API Endpoints (backend contract)

All calls go through `PulseemReactInstance` (Axios with base URL + JWT cookie).

### Existing (unchanged)
```
GET  PulsyAISupport/LoadSessionMessages
     Response.Data     = Message[]
     Response.DataCount = { TotalMessagesForUserCount: number, IsEscalated: boolean }

POST PulsyAISupport/AddMessage
     Body: { MessageText: string, MessageTypeID: 1 }
     Response.Data     = Message | null   (null when session is escalated)
     Response.DataCount = {
       TotalMessagesForUserCount: number,
       SuggestAgent?: boolean,    // true when AI suggests escalation
       IsEscalated?: boolean      // true if session was already escalated
     }

POST PulsyAISupport/NewConversation
     Body: {}
     Response.Data = { SessionID, SessionKey }
```

### New endpoints added for escalation
```
POST PulsyAISupport/EscalateToAgent
     Body: {}
     Response.Data = {             ← a Message object (TypeID=1)
       MessageID: number,
       MessageText: "הלקוח ביקש לדבר עם נציג אנושי.",
       MessageTypeID: 1,
       MessageTimestamp: string
     } | null (if already escalated)

GET  PulsyAISupport/NewMessages?afterId={number}
     Response.Data = Message[]     ← only TypeID=4, MessageID > afterId
                                    empty array = nothing new (zero cost)
```

---

## Message Shape

```typescript
interface Message {
  MessageID: string | number;
  MessageText: string;
  MessageHTML?: string;           // present when backend wraps HTML content
  MessageTimestamp: string;       // ISO datetime string
  MessageTypeID: number;          // 1 | 2 | 3 | 4
}
```

---

## State Flow Diagram

```
Widget opens
    → dispatch(loadSupportSessionMessages())
    → state.messages populated, state.isEscalated set from server

Customer sends message
    → dispatch(addSupportUserMessage(...))   ← optimistic (shows immediately)
    → dispatch(addSupportMessage(...))       ← API call
    → if !escalated: state.messages.push(AI response)
    → if escalated:  Data=null, no push (null guard)
    → state.suggestAgent updated from DataCount.SuggestAgent

"Contact Agent" button appears when:
    (totalMessagesForUserCount >= 2 || suggestAgent) && !isEscalated

Customer clicks "Contact Agent"
    → dispatch(escapeToAgent())
    → state.isEscalated = true
    → state.suggestAgent = false
    → state.messages.push(TypeID=1 escalation message from server)

Polling starts (useEffect with setInterval every 5s):
    condition: isSupport && isEscalated && isOpen
    → dispatch(pollAgentMessages(lastAgentMessageIdRef.current))
    → if new TypeID=4 messages: push to state.messages
    → state.lastAgentMessageId = max(new MessageIDs)

"Start New Conversation"
    → dispatch(startNewSupportSession())
    → state resets: messages=[], isEscalated=false, suggestAgent=false, lastAgentMessageId=0
    → polling stops (isEscalated is now false → useEffect cleanup runs)
```

---

## i18n Keys Used (support-specific)

These keys must exist in the translation files:

| Key | Hebrew | Purpose |
|-----|--------|---------|
| `common.contactAgent` | `"פנה לנציג"` | "Contact Agent" button label |
| `common.connectedToAgent` | `"מחובר לנציג"` | Status text shown when escalated |
| `common.agentLabel` | `"נציג"` | Label above TypeID=4 message bubble |
| `common.supportHeader` | `"תמיכה"` | Chat widget header title |
| `common.supportBubbleText` | `"..."`  | Mascot bubble text |
| `common.agentPlaceholderSupport` | `"כתוב הודעה..."` | Input placeholder for support chat |
| `common.startNewConversation` | `"התחל שיחה חדשה"` | Button in InputArea |

---

## Files NOT Changed (safe to ignore)

- `ChatHeader.tsx` — unchanged, just dispatches toggle based on `config.reduxSliceName`
- `InputArea.tsx` — unchanged, escalation doesn't affect send flow
- `PresetQuestions.tsx` — unchanged
- `AIFloatingButton.tsx` — unchanged
- `TypingMessage.tsx` — unchanged
- `InsightRenderer.tsx` — unchanged

---

## Key Design Decisions to Preserve

1. **`useRef` for cursor** — `lastAgentMessageId` is stored in `lastAgentMessageIdRef.current`
   and synced via a separate `useEffect`. This prevents the polling interval from restarting
   on every received message.

2. **Null guard on `addSupportMessage.fulfilled`** — `if (action.payload?.Data)` before push.
   When escalated, server returns `Data: null`. Without the guard, `messages.push(null)` would
   crash the MessageList renderer.

3. **`TypeID=1` for escalation request** — the message "הלקוח ביקש לדבר עם נציג אנושי" is
   saved with TypeID=1 (customer message), not TypeID=4. TypeID=4 is exclusively for agent replies.

4. **Polling stops on new session** — `startNewSupportSession.fulfilled` sets `isEscalated=false`,
   which causes the polling `useEffect` to run cleanup (`clearInterval`) on its next re-render.

5. **Both widgets share `AiChatState` type** — `aiChatSlice` has its own local interface (not
   imported from StateTypes), so its 3 new fields (`isEscalated`, `suggestAgent`, `lastAgentMessageId`)
   must be in its local interface + initialState even though Feature 69 never uses them.

---

---

# Prompt — React Client: UI/UX Session 2 — Minimize Preference & Compact Mode

## What This Adds

Two UX improvements on top of the escalation feature above:

1. **Simplified minimize preference** — the old checkbox ("do not show this dialog") is removed.
   The widget now automatically saves open/closed state to `localStorage` on every user action,
   and restores it on every page load for ALL users (not just first-time users).

2. **Compact / side-panel mode** — a new square icon in the header lets the user shrink the
   widget to a 360×510 px draggable panel anchored to the right side of the screen, so they
   can chat and use the app simultaneously. The compact preference (on/off) and last drag
   position are both persisted in `localStorage`.

---

## All Changed Files — Full Current Content

### 1. `components/AI/chatConfig.ts`

Two new fields added to `AIChatConfig` interface and both config objects:

```typescript
import PulseemMascotImage from '../../assets/images/pulseem_mascot.png';
import MascotPointingImage from '../../assets/images/mascot_pointing.png';
import SupportMascotImage from '../../assets/images/support_mascot.png';

export interface AIChatConfig {
  featureId: number;
  apiAddMessage: string;
  apiLoadSession: string;
  apiNewSession: string;
  apiEscalate?: string;
  apiNewMessages?: string;
  maxChars: number;
  headerTitleKey: string;
  bubbleTextKey: string;
  presetQuestionKeys: string[];
  mascotButtonImage: string;
  mascotWidgetImage: string;
  reduxSliceName: string;
  localStorageKey: string;
  compactModeKey: string;   // ← NEW: localStorage key for compact on/off
}

export const advisorConfig: AIChatConfig = {
  featureId: 69,
  apiAddMessage: 'PulsyAI/AddMessage',
  apiLoadSession: 'PulsyAI/LoadSessionMessages',
  apiNewSession: 'PulsyAI/NewSession',
  maxChars: 500,
  headerTitleKey: 'common.aiAdvisorHeader',
  bubbleTextKey: 'common.polyAgentIconTitleMarquee',
  presetQuestionKeys: [
    'common.presetQuestion1',
    'common.presetQuestion2',
    'common.presetQuestion3',
    'common.presetQuestion4',
  ],
  mascotButtonImage: PulseemMascotImage,
  mascotWidgetImage: MascotPointingImage,
  reduxSliceName: 'aiChat',
  localStorageKey: 'hideAIChatDialog',
  compactModeKey: 'aiChatCompactMode',   // ← NEW
};

export const supportConfig: AIChatConfig = {
  featureId: 73,
  apiAddMessage: 'PulsyAISupport/AddMessage',
  apiLoadSession: 'PulsyAISupport/LoadSessionMessages',
  apiNewSession: 'PulsyAISupport/NewConversation',
  apiEscalate: 'PulsyAISupport/EscalateToAgent',
  apiNewMessages: 'PulsyAISupport/NewMessages',
  maxChars: 2000,
  headerTitleKey: 'common.supportHeader',
  bubbleTextKey: 'common.supportBubbleText',
  presetQuestionKeys: [
    'common.supportPreset1',
    'common.supportPreset2',
    'common.supportPreset3',
    'common.supportPreset4',
  ],
  mascotButtonImage: SupportMascotImage,
  mascotWidgetImage: SupportMascotImage,
  reduxSliceName: 'supportChat',
  localStorageKey: 'hideSupportChatDialog',
  compactModeKey: 'supportChatCompactMode',   // ← NEW
};
```

---

### 2. `components/AI/ChatHeader.tsx`

Completely rewritten. Accepts four new props instead of dispatching Redux directly:

- `onMinimize` — called when user clicks the minimize (dash) icon
- `onToggleCompact` — called when user clicks the square icon
- `isCompact` — drives which icon to show (CropSquare vs FullscreenExit) and cursor style
- `onHeaderMouseDown` — enables drag-by-header in compact mode

```tsx
import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Tooltip } from '@material-ui/core';
import { Minimize as MinimizeIcon, CropSquare as CropSquareIcon, FullscreenExit as FullscreenExitIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { AIChatConfig, advisorConfig } from './chatConfig';

const useStyles = makeStyles(() => ({
  appBar: {
    backgroundColor: '#FF1744',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
  },
  toolbar: {
    minHeight: '48px',
    cursor: 'default',
  },
  toolbarDraggable: {
    minHeight: '48px',
    cursor: 'grab',
    '&:active': {
      cursor: 'grabbing',
    },
  },
  title: {
    flexGrow: 1,
    fontSize: '1rem',
    userSelect: 'none',
  },
  headerIcon: {
    color: 'inherit',
    padding: '6px',
  },
}));

interface ChatHeaderProps {
  config?: AIChatConfig;
  isCompact?: boolean;
  onMinimize: () => void;
  onToggleCompact: () => void;
  onHeaderMouseDown?: (e: React.MouseEvent) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  config = advisorConfig,
  isCompact = false,
  onMinimize,
  onToggleCompact,
  onHeaderMouseDown,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <AppBar position="static" className={classes.appBar} elevation={0}>
      <Toolbar
        variant="dense"
        className={isCompact ? classes.toolbarDraggable : classes.toolbar}
        onMouseDown={isCompact ? onHeaderMouseDown : undefined}
      >
        <Typography variant="h6" className={classes.title}>
          {t(config.headerTitleKey)}
        </Typography>
        <Tooltip title={isCompact ? t('common.chatFullMode') : t('common.chatCompactMode')} arrow>
          <IconButton className={classes.headerIcon} onClick={onToggleCompact} size="small">
            {isCompact
              ? <FullscreenExitIcon style={{ fontSize: '1.4rem' }} />
              : <CropSquareIcon style={{ fontSize: '1.4rem' }} />
            }
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.minimize')} arrow>
          <IconButton className={classes.headerIcon} onClick={onMinimize} size="small">
            <MinimizeIcon style={{ fontSize: '1.8rem', marginTop: '-8px' }} />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default ChatHeader;
```

---

### 3. `components/AI/InputArea.tsx`

Checkbox and all related state removed. Only the "Start New Conversation" button remains in
the footer (support only).

Key removals vs the previous version:
- `Checkbox`, `FormControlLabel` removed from MUI imports
- `hideDialog` state and its `useEffect` removed
- `handleHideDialogChange` removed
- `checkboxLabel` makeStyles style removed
- `showCheckbox` variable removed; `showFooterRow = showNewConversationButton` only

```tsx
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, TextField, IconButton, Button } from '@material-ui/core';
import { Send as SendIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { addMessage, addUserMessage, setAIIconStatus } from '../../redux/reducers/aiChatSlice';
import { addSupportMessage, addSupportUserMessage, setSupportAIIconStatus, startNewSupportSession } from '../../redux/reducers/supportChatSlice';
import { StateType } from '../../Models/StateTypes';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { AIChatConfig, advisorConfig } from './chatConfig';

const useStyles = makeStyles((theme) => ({
  inputArea: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    borderTop: `1px solid ${theme.palette.divider}`,
    flexDirection: 'column',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    '& .MuiInputBase-root': {
        borderRadius: '20px',
        backgroundColor: '#f0f0f0',
        transition: 'box-shadow 0.2s ease-in-out',
        '& textarea': {
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: '#f0f0f0', borderRadius: '4px' },
            scrollbarWidth: 'thin',
            scrollbarColor: '#f0f0f0 transparent',
        },
    },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& .Mui-focused .MuiInputBase-root': {
        boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`,
    },
  },
  characterCount: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginTop: '2px',
    textAlign: 'right',
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

export interface InputAreaHandle {
  focus: () => void;
}

interface InputAreaProps {
  config?: AIChatConfig;
}

const InputArea: React.ForwardRefRenderFunction<InputAreaHandle, InputAreaProps> = (
  { config = advisorConfig }, ref
) => {
  const { isRTL } = useSelector((state: any) => state.core);
  const classes = useStyles();
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const isSupport = config.reduxSliceName === 'supportChat';
  const { totalMessagesForUserCount, aiIconStatus } = useSelector((state: StateType) =>
    isSupport ? state.supportChat : state.aiChat
  );

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText) {
      if (isSupport) {
        dispatch(addSupportUserMessage({
          MessageID: uuidv4(), MessageTimestamp: new Date().toISOString(),
          MessageTypeID: 1, ResponseTimeMs: null, MessageText: trimmedText,
        }));
        dispatch(addSupportMessage({ MessageText: trimmedText, MessageTypeID: 1 }));
        dispatch(setSupportAIIconStatus(1));
      } else {
        dispatch(addUserMessage({
          MessageID: uuidv4(), MessageTimestamp: new Date().toISOString(),
          MessageTypeID: 1, ResponseTimeMs: null, MessageText: trimmedText,
        }));
        dispatch(addMessage({ MessageText: trimmedText, MessageTypeID: 1 }));
        dispatch(setAIIconStatus(1));
      }
      setText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleStartNewConversation = () => { dispatch(startNewSupportSession()); };

  useImperativeHandle(ref, () => ({ focus: () => { inputRef.current?.focus(); } }));

  const showNewConversationButton = isSupport;
  const showFooterRow = showNewConversationButton;

  return (
    <Box display="flex" className={classes.inputArea}>
      <Box className={classes.inputRow}>
        <TextField
          className={classes.input} variant="outlined" size="small" fullWidth
          inputRef={inputRef}
          placeholder={isSupport ? t("common.agentPlaceholderSupport") : t("common.agentPlaceholder")}
          value={text}
          onChange={(e) => { if (e.target.value.length <= config.maxChars) setText(e.target.value); }}
          onKeyPress={handleKeyPress}
          multiline maxRows={3} disabled={aiIconStatus === 1}
          inputProps={{ maxLength: config.maxChars }}
        />
        <IconButton color="primary" onClick={handleSend} style={{ marginRight: '8px' }} disabled={aiIconStatus === 1}>
          <SendIcon style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
        </IconButton>
      </Box>
      <Box className={classes.characterCount}>{text.length}/{config.maxChars}</Box>
      {showFooterRow && (
        <Box className={classes.footerRow}>
          <span />
          {showNewConversationButton && (
            <Button size="small" color="primary" onClick={handleStartNewConversation} disabled={aiIconStatus === 1}>
              {t("common.startNewConversation")}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default forwardRef(InputArea);
```

---

### 4. `components/AI/AIFloatingButton.tsx`

`handleToggleChat` now persists open/closed preference before dispatching the toggle:

```tsx
const handleToggleChat = () => {
  // isOpen is current state BEFORE toggle:
  //   true  → user is closing  → save 'true'  (hide on reload)
  //   false → user is opening  → save 'false' (show on reload)
  try {
    localStorage.setItem(config.localStorageKey, isOpen ? 'true' : 'false');
  } catch (_) {}
  if (isSupport) {
    dispatch(toggleSupportChat());
  } else {
    dispatch(toggleChat());
  }
};
```

Everything else in `AIFloatingButton.tsx` is unchanged.

---

### 5. `components/AI/AIChatWidget.tsx`

This is the main file with the most changes. Full content:

```tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Paper, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StateType } from '../../Models/StateTypes';
import { toggleChat, loadSessionMessages, setAIIconStatus, openAIChat } from '../../redux/reducers/aiChatSlice';
import {
  toggleSupportChat, loadSupportSessionMessages, setSupportAIIconStatus,
  openSupportChat, escapeToAgent, pollAgentMessages
} from '../../redux/reducers/supportChatSlice';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import InputArea from './InputArea';
import { useTypewriter } from '../../hooks/useTypewriter';
import { useTranslation } from 'react-i18next';
import PresetQuestions from './PresetQuestions';
import { AIChatConfig, advisorConfig } from './chatConfig';

const COMPACT_WIDTH  = 360;
const COMPACT_HEIGHT = 510;

const useStyles = makeStyles((theme) => ({
  // Full-mode widget — identical to original, never modified
  PolyWidget: {
    position: 'fixed',
    top: '35%',
    left: '50%',
    width: '58vw',
    height: '50vh',
    maxHeight: '50vh',
    maxWidth: '1000px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 150ms ease-out, opacity 150ms ease-out',
    transform: 'translate(-50%, -50%) scale(0.95)',
    opacity: 0,
    pointerEvents: 'none',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    '& > *': { flexShrink: 0 },
    '& .MuiToolbar-root': {
      minHeight: '64px',
      '& .MuiTypography-h6': { fontSize: '1.25rem', fontWeight: 500 }
    },
    "@media screen and (max-width: 768px)": { top: '30%', width: '90%' },
  },
  PolywidgetOpen: {
    transform: 'translate(-50%, -50%) scale(1)',
    opacity: 1,
    pointerEvents: 'auto',
    zIndex: 1299,
  },
  // Compact size overrides.
  // IMPORTANT: top/left are NOT set here — they come from inline style only.
  // If you add top/left here with !important they will override the inline
  // style and break drag on the Y axis.
  PolyWidgetCompact: {
    width:     `${COMPACT_WIDTH}px !important`,
    maxWidth:  `${COMPACT_WIDTH}px !important`,
    height:    `${COMPACT_HEIGHT}px !important`,
    maxHeight: `${COMPACT_HEIGHT}px !important`,
  },
  // Removes the centering translate so drag pixel coords map 1:1 to the screen.
  PolyWidgetCompactOpen: {
    transform: 'none !important',
    opacity: 1,
    pointerEvents: 'auto',
    zIndex: 1299,
  },
  // Content area — identical to original (no overflow:hidden added)
  Polycontent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  Polybackdrop: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(4px)',
    transition: 'opacity 300ms ease-out',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 1298,
  },
  PolybackdropOpen: { opacity: 1, pointerEvents: 'auto' },
  PolywidgetContainer: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 1300,
    pointerEvents: 'none',
  },
  PolymascotImage: {
    position: 'absolute',
    left: ({ isRTL }: { isRTL: boolean }) => isRTL ? 'auto' : '-300px',
    right: ({ isRTL }: { isRTL: boolean }) => isRTL ? '-300px' : 'auto',
    zIndex: 9,
    bottom: '-70px',
    '& img': {
      height: '300px',
      transform: ({ isRTL }: { isRTL: boolean }) => isRTL ? 'scaleX(-1)' : 'none',
    },
    "@media screen and (max-width: 768px)": {
      position: 'relative',
      left: 'auto !important', right: 'auto !important',
      bottom: 0, order: 3, margin: '10px auto',
      '& img': { height: '100px', display: 'block', margin: '0 auto' },
      '& div.message': { maxWidth: '80%', fontSize: '0.9rem', minHeight: '25px' },
    },
    '& div.message': {
      textAlign: 'center',
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      padding: theme.spacing(1, 2),
      borderRadius: '20px',
      marginBottom: theme.spacing(2.5),
      maxWidth: '200px',
      margin: '0 auto',
      position: 'relative',
      minHeight: '40px',
      fontWeight: 'bold',
      direction: ({ isRTL }: { isRTL: boolean }) => isRTL ? 'rtl' : 'ltr',
      '&::after': {
        content: '""', position: 'absolute', bottom: '-10px', left: '50%',
        transform: 'translateX(-50%)', width: 0, height: 0,
        borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
        borderTop: `10px solid ${theme.palette.primary.main}`,
      },
    },
  },
  Polycursor: {
    display: 'inline-block', width: '2px', height: '1em',
    backgroundColor: 'white', marginLeft: '2px', verticalAlign: 'middle',
    animation: 'cursor-blink 1s step-end infinite',
  },
  '@global': {
    '@keyframes cursor-blink': { '0%': { opacity: 1 }, '50%': { opacity: 0 } },
  },
}));

interface AIChatWidgetProps {
  config?: AIChatConfig;
}

const defaultCompactPos = () => ({
  x: Math.max(0, window.innerWidth - COMPACT_WIDTH - 24),
  y: 80,
});

const clampPos = (pos: { x: number; y: number }) => ({
  x: Math.max(0, Math.min(window.innerWidth  - COMPACT_WIDTH, pos.x)),
  y: Math.max(0, Math.min(window.innerHeight - 60,            pos.y)),
});

const loadSavedPos = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as { x: number; y: number };
  } catch (_) {}
  return null;
};

const AIChatWidget: React.FC<AIChatWidgetProps> = ({ config = advisorConfig }) => {
  const { isRTL }    = useSelector((state: any) => state.core);
  const { username } = useSelector((state: any) => state.user);
  const classes      = useStyles({ isRTL });
  const dispatch     = useDispatch();
  const inputAreaRef = useRef<{ focus: () => void }>(null);
  const { t }        = useTranslation();

  const isSupport = config.reduxSliceName === 'supportChat';
  const chatState = useSelector((state: StateType) =>
    isSupport ? state.supportChat : state.aiChat
  );
  const { isOpen, messages, totalMessagesForUserCount,
          isEscalated, suggestAgent, lastAgentMessageId } = chatState;
  const { accountFeatures } = useSelector((state: StateType) => state.common);

  // ── Compact mode ───────────────────────────────────────────────────────────
  const posKey = config.compactModeKey + '_pos';

  const [isCompact, setIsCompact] = useState<boolean>(() =>
    localStorage.getItem(config.compactModeKey) === 'true'
  );

  const [compactPos, setCompactPos] = useState<{ x: number; y: number }>(() => {
    const saved = loadSavedPos(posKey);
    return saved ? clampPos(saved) : defaultCompactPos();
  });

  // Ref keeps drag handlers stable (no recreation on every frame).
  const compactPosRef = useRef(compactPos);
  useEffect(() => { compactPosRef.current = compactPos; }, [compactPos]);

  // ── Drag ───────────────────────────────────────────────────────────────────
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Stable — only re-created when isCompact changes.
  const handleHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isCompact) return;
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - compactPosRef.current.x,
      y: e.clientY - compactPosRef.current.y,
    };
    e.preventDefault();
  }, [isCompact]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setCompactPos(clampPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      }));
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      try { localStorage.setItem(posKey, JSON.stringify(compactPosRef.current)); } catch (_) {}
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup',   onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup',   onMouseUp);
    };
  }, [posKey]);

  // Clamp position when browser window is resized.
  useEffect(() => {
    const onResize = () => {
      setCompactPos(prev => {
        const c = clampPos(prev);
        try { localStorage.setItem(posKey, JSON.stringify(c)); } catch (_) {}
        return c;
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [posKey]);

  // ── Toggle compact ─────────────────────────────────────────────────────────
  const handleToggleCompact = () => {
    const next = !isCompact;
    setIsCompact(next);
    if (next) {
      const saved = loadSavedPos(posKey);
      setCompactPos(saved ? clampPos(saved) : defaultCompactPos());
    }
    try { localStorage.setItem(config.compactModeKey, next ? 'true' : 'false'); } catch (_) {}
  };

  // ── Minimize — saves show/hide preference ──────────────────────────────────
  const handleMinimize = () => {
    try { localStorage.setItem(config.localStorageKey, 'true'); } catch (_) {}
    dispatch(isSupport ? toggleSupportChat() : toggleChat());
  };

  // ── Auto-open on mount (ALL users) ────────────────────────────────────────
  // Runs once when username + accountFeatures are both available.
  // null   → first visit ever            → open
  // 'false'→ user last opened it         → open
  // 'true' → user last minimised it      → stay closed
  const autoOpenDoneRef = useRef(false);
  useEffect(() => {
    const featureKey = String(config.featureId);
    if (!username || !accountFeatures || accountFeatures.indexOf(featureKey) === -1) return;
    if (autoOpenDoneRef.current || isOpen) return;
    autoOpenDoneRef.current = true;
    try {
      const hide = localStorage.getItem(config.localStorageKey);
      if (hide !== 'true') {
        dispatch(isSupport ? openSupportChat() : openAIChat());
      }
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, accountFeatures]);

  // ── Agent message cursor ref ───────────────────────────────────────────────
  const lastAgentMessageIdRef = useRef(lastAgentMessageId);
  useEffect(() => { lastAgentMessageIdRef.current = lastAgentMessageId; }, [lastAgentMessageId]);

  const { displayedText, isTyping } = useTypewriter({
    text: t(config.bubbleTextKey), speed: 100, delay: 1000, loop: false, startTyping: isOpen,
  });

  // ── Poll for agent messages every 5s ──────────────────────────────────────
  useEffect(() => {
    if (!isSupport || !isEscalated || !isOpen) return;
    const id = setInterval(() => {
      dispatch(pollAgentMessages(lastAgentMessageIdRef.current));
    }, 5000);
    return () => clearInterval(id);
  }, [isSupport, isEscalated, isOpen, dispatch]);

  const handleWidgetClick = (e: React.MouseEvent) => e.stopPropagation();
  const handleEscalate    = () => { if (isSupport && !isEscalated) dispatch(escapeToAgent()); };

  // ── Auto-focus + icon status on open ──────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => { inputAreaRef.current?.focus(); }, 300);
      if (messages.length === 0) {
        dispatch(isSupport ? setSupportAIIconStatus(1) : setAIIconStatus(1));
      }
    }
  }, [isOpen]);

  // ── Load session messages ─────────────────────────────────────────────────
  // Fires when count is -1 (uninitialised). Auto-open is separate (above).
  useEffect(() => {
    const featureKey = String(config.featureId);
    if (
      totalMessagesForUserCount === -1 && username &&
      accountFeatures !== null &&
      accountFeatures?.indexOf(featureKey) !== -1
    ) {
      dispatch(isSupport ? loadSupportSessionMessages() : loadSessionMessages());
    }
  }, [dispatch, username, totalMessagesForUserCount, accountFeatures]);

  const featureKey = String(config.featureId);
  if (accountFeatures === null || accountFeatures?.indexOf(featureKey) === -1) return <></>;

  // Inline style positions compact widget — overrides PolyWidget's top/left.
  // Only set when compact; undefined when full-mode so CSS is untouched.
  const compactStyle: React.CSSProperties | undefined = isCompact
    ? { top: compactPos.y, left: compactPos.x }
    : undefined;

  const openClass = isOpen
    ? (isCompact ? classes.PolyWidgetCompactOpen : classes.PolywidgetOpen)
    : '';

  return (
    <div className={classes.PolywidgetContainer}>
      {/* Backdrop only in full mode — compact users see the rest of the app */}
      {!isCompact && (
        <div
          className={`${classes.Polybackdrop} ${isOpen ? classes.PolybackdropOpen : ''}`}
          onClick={() => {}}
        />
      )}
      <Paper
        className={`${classes.PolyWidget} ${isCompact ? classes.PolyWidgetCompact : ''} ${openClass}`}
        style={compactStyle}
        elevation={5}
        onClick={handleWidgetClick}
      >
        <ChatHeader
          config={config}
          isCompact={isCompact}
          onMinimize={handleMinimize}
          onToggleCompact={handleToggleCompact}
          onHeaderMouseDown={handleHeaderMouseDown}
        />
        <Box className={classes.Polycontent}>
          <MessageList config={config} />
          {isSupport && !isEscalated && (totalMessagesForUserCount >= 2 || suggestAgent) && (
            <Box style={{ padding: '6px 16px', textAlign: 'center' }}>
              <button
                onClick={handleEscalate}
                style={{
                  background: 'none', border: '1px solid #dd2339', color: '#dd2339',
                  borderRadius: '16px', padding: '4px 14px', fontSize: '0.8rem', cursor: 'pointer',
                }}
              >
                {t('common.contactAgent')}
              </button>
            </Box>
          )}
          {isSupport && isEscalated && (
            <Box style={{ padding: '6px 16px', textAlign: 'center', fontSize: '0.8rem', color: '#888' }}>
              {t('common.connectedToAgent')}
            </Box>
          )}
          <PresetQuestions config={config} />
        </Box>
        <InputArea ref={inputAreaRef} config={config} />
        {/* Mascot hidden in compact mode — too tall to fit */}
        {!isCompact && (
          <div className={classes.PolymascotImage}>
            <div className="message">
              {displayedText}
              {isTyping && <span className={classes.Polycursor} />}
            </div>
            <img src={config.mascotWidgetImage} alt="Pulseem Mascot" />
          </div>
        )}
      </Paper>
    </div>
  );
};

export default AIChatWidget;
```

---

### 6. Translation files

Three new keys added to all three locale files:

| File | Path |
|---|---|
| Hebrew | `React/assets/translations/he/Common.he.json` |
| English | `React/assets/translations/en/Common.json` |
| Polish | `React/assets/translations/pl/Common.json` |

Keys added (after the existing `doNotShowThisDialog` key):

```json
"chatCompactMode": "מצב צדדי",   // he — tooltip when in full mode (click → go compact)
"chatFullMode":    "מצב מלא",    // he — tooltip when in compact mode (click → go full)
"minimize":        "מזעור",       // he — tooltip on the minimize (dash) button
```

```json
"chatCompactMode": "Compact mode",   // en
"chatFullMode":    "Full mode",      // en
"minimize":        "Minimize",       // en
```

```json
"chatCompactMode": "Tryb boczny",    // pl
"chatFullMode":    "Tryb pełny",     // pl
"minimize":        "Minimalizuj",    // pl
```

---

## localStorage Key Reference

| Key | Set by | Value | Meaning |
|---|---|---|---|
| `hideSupportChatDialog` | `handleMinimize` / float button | `'true'` | Chat closed on reload |
| `hideSupportChatDialog` | float button open / first visit | `'false'` or `null` | Chat opens on reload |
| `supportChatCompactMode` | `handleToggleCompact` | `'true'` / `'false'` | Compact mode on/off |
| `supportChatCompactMode_pos` | drag `mouseup` / window resize | `{"x":N,"y":N}` | Last drag position |
| `hideAIChatDialog` | same pattern | same | Advisor widget (Feature 69) |
| `aiChatCompactMode` | same pattern | same | Advisor widget compact |

---

## Behaviour Contract (reload semantics)

| User's last action | `localStorageKey` | `compactModeKey` | What happens on reload |
|---|---|---|---|
| First visit ever | `null` | `null` | Opens in full mode |
| Opened via float button | `'false'` | whatever | Opens in whatever mode was saved |
| Minimised (dash icon or float-button close) | `'true'` | whatever | Stays closed |
| Clicked square (→ compact) | unchanged | `'true'` | Opens in compact mode at last position |
| Clicked square again (→ full/max) | unchanged | `'false'` | Opens in full mode |

---

## CSS Design Rules — Do Not Break

1. **`PolyWidget` top/left/height are NEVER touched** — full-mode CSS is identical to the
   original (`top: '35%'`, `left: '50%'`, `height: '50vh'`). Do not modify them.

2. **`PolyWidgetCompact` must NOT contain `top` or `left`** — those are driven exclusively
   by inline `style={{ top: y, left: x }}`. If you add `top`/`left` with `!important` to the
   CSS class they will override the inline style (CSS `!important` beats inline) and break
   Y-axis drag.

3. **`PolyWidgetCompactOpen` needs `transform: 'none !important'`** — `PolyWidget` has
   `transform: translate(-50%, -50%) scale(0.95)` and `PolywidgetOpen` has
   `transform: translate(-50%, -50%) scale(1)`. Without `none !important` in the compact-open
   class, the centering translate is still applied and drag coordinates are offset by 50% of
   the viewport.

4. **`Polycontent` must NOT have `overflow: hidden`** — it breaks the internal MessageList
   scroll behaviour. The original class has only `flex: 1; display: flex; flexDirection: column`.

5. **Drag uses `document` listeners, not widget listeners** — `mousemove` / `mouseup` are on
   `document`, not on the Paper element. This prevents the drag from "sticking" when the mouse
   moves faster than the widget updates.

6. **`compactPosRef` pattern** — `handleHeaderMouseDown` reads `compactPosRef.current` (not
   state) so it doesn't need to be in `useCallback` deps. This keeps the callback stable and
   prevents ChatHeader from re-rendering on every drag frame.

---

## Auto-open Logic — Important Notes

The OLD code auto-opened only for brand-new users (`totalMessagesForUserCount < 1`). This was
wrong for the new UX requirement (persist open/closed for ALL users).

The NEW code has two separate effects:

```
autoOpenDoneRef effect  — fires once when username + accountFeatures are ready
                         reads localStorageKey → opens or stays closed
                         guarded by autoOpenDoneRef so it never fires twice

loadMessages effect     — fires when totalMessagesForUserCount === -1
                         just loads session messages, no auto-open logic
```

**Do not merge these two effects back together.** If you put auto-open inside the messages
effect it will either fire too late (after messages load) or not fire at all for returning
users.

---

## Files NOT Changed

- `MessageList.tsx` — unchanged
- `PresetQuestions.tsx` — unchanged
- `TypingMessage.tsx` — unchanged
- `InsightRenderer.tsx` — unchanged
- `supportChatSlice.ts` — unchanged
- `aiChatSlice.ts` — unchanged
- `StateTypes.ts` — unchanged
