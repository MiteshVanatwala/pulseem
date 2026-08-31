import React, { useState } from 'react';
import { PulseemReactInstance } from '../../../../helpers/Api/PulseemReactAPI';

// INTERNAL TEST HARNESS — not a product feature.
//
// Manually triggers AIAssistantLogic's SimulateIncomingMessage diagnostic endpoint so an
// engineer can inject a fake incoming message into the AI pipeline without going through
// the real chat widget. Deliberately unstyled (no MUI, no theme) so nobody mistakes this
// for a real screen. Not imported by AIAssistant.tsx, not linked from SideBar or
// routes.tsx — only reachable by typing its URL directly. No frontend feature-flag gate
// (backend Phase 0 confirmed none exists to gate against) — SimulateIncomingMessage
// enforces its own server-side JWT/subAccountId checks and Feature.ServiceAI
// .WidgetRuntime.Enabled independently, so this route doesn't need to duplicate that.
const AIAssistantDiagnosticHarness = () => {
  const [conversationId, setConversationId] = useState('');
  const [message, setMessage] = useState('');
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSimulate = async () => {
    setIsSending(true);
    setRawResponse(null);
    setRawError(null);
    try {
      const response = await PulseemReactInstance.post('ServiceAI/SimulateIncomingMessage', {
        ConversationId: conversationId,
        Message: message,
      });
      setRawResponse(JSON.stringify(response.data, null, 2));
    } catch (err: any) {
      setRawError(JSON.stringify(err?.response?.data ?? { message: err?.message || 'Request failed' }, null, 2));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: 'monospace', maxWidth: 720 }}>
      <h2 style={{ color: '#b91c1c', margin: 0 }}>
        INTERNAL TEST HARNESS — AIAssistantLogic.SimulateIncomingMessage
      </h2>
      <p>
        This is not a product screen. Manual diagnostic use only — do not link to it from
        anywhere a customer or agent could reach.
      </p>
      <p>
        This call requires <code>Feature.ServiceAI.WidgetRuntime.Enabled</code> to be set
        server-side (Web.config) for this account — if it's off, expect a 423 response
        below, not a bug in this form.
      </p>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="dev-conversation-id">Conversation Id</label>
        <br />
        <input
          id="dev-conversation-id"
          type="text"
          value={conversationId}
          onChange={(e) => setConversationId(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="dev-message">Message</label>
        <br />
        <textarea
          id="dev-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          style={{ width: '100%' }}
        />
      </div>

      <button
        type="button"
        onClick={handleSimulate}
        disabled={isSending || !conversationId.trim() || !message.trim()}
      >
        {isSending ? 'Sending…' : 'Simulate Incoming Message'}
      </button>

      {rawError && (
        <pre style={{ background: '#fee2e2', padding: 12, marginBlockStart: 16, whiteSpace: 'pre-wrap' }}>
          {rawError}
        </pre>
      )}
      {rawResponse && (
        <pre style={{ background: '#f3f4f6', padding: 12, marginBlockStart: 16, whiteSpace: 'pre-wrap' }}>
          {rawResponse}
        </pre>
      )}
    </div>
  );
};

export default AIAssistantDiagnosticHarness;
