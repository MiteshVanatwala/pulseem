import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  getSocketToken,
  socketConversationCreated,
  socketConversationUpdated,
  socketMessageReceived,
} from "../redux/reducers/conversationsSlice";
import * as ServiceSocket from "../helpers/Api/ServiceSocket";
import { ServiceSocketStatus } from "../helpers/Api/ServiceSocket";
import { IConversation, IMessage } from "../Models/Service/Conversation";

interface UseServiceSocketOptions {
  /** Set false to leave the socket closed (e.g. the agent is on a channel that doesn't use it). */
  enabled?: boolean;
  /** Called for every inbound message, after the store is updated — for toasts or unread badges. */
  onMessage?: (conversationId: string, message: IMessage) => void;
  /** Called when a new conversation arrives. */
  onConversationCreated?: (conversation: IConversation) => void;
  /** Called when a conversation's status or assignment changes. */
  onConversationUpdated?: (conversation: IConversation) => void;
}

/**
 * Opens the shared real-time connection for the Service inbox and keeps the
 * conversations store in step with it.
 *
 * `status` is what the caller acts on: anything other than 'connected' means updates
 * are not arriving, so a polling fallback should stay running. 'unavailable' is the
 * deliberate case — the backend reports real-time is switched off — and it will not
 * resolve by retrying.
 */
export const useServiceSocket = (options: UseServiceSocketOptions = {}) => {
  const { enabled = true, onMessage, onConversationCreated, onConversationUpdated } = options;
  const dispatch = useDispatch();
  const [status, setStatus] = useState<ServiceSocketStatus>(ServiceSocket.getStatus());

  // Callbacks live in a ref so a caller passing inline arrows does not tear the
  // socket down and rebuild it on every render.
  const handlers = useRef(options);
  handlers.current = options;

  const fetchCredentials = useCallback(async () => {
    const result: any = await (dispatch as any)(getSocketToken());
    return (result && result.payload) || null;
  }, [dispatch]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const offStatus = ServiceSocket.onStatusChange((s) => { if (!cancelled) setStatus(s); });

    void ServiceSocket.connect(fetchCredentials);

    const offMessage = ServiceSocket.on('message:new', ({ conversationId, message }) => {
      dispatch(socketMessageReceived({ conversationId, message }));
      if (handlers.current.onMessage) handlers.current.onMessage(conversationId, message);
    });

    const offCreated = ServiceSocket.on('conversation:created', (conversation) => {
      dispatch(socketConversationCreated(conversation));
      if (handlers.current.onConversationCreated) handlers.current.onConversationCreated(conversation);
    });

    const offUpdated = ServiceSocket.on('conversation:updated', (conversation) => {
      dispatch(socketConversationUpdated(conversation));
      if (handlers.current.onConversationUpdated) handlers.current.onConversationUpdated(conversation);
    });

    return () => {
      cancelled = true;
      offStatus();
      offMessage();
      offCreated();
      offUpdated();
      // The connection itself is deliberately left open: the inbox remounts as the
      // agent switches channels, and tearing it down each time would drop the account
      // room and lose anything that arrives before the next connect.
    };
  }, [enabled, dispatch, fetchCredentials]);

  const joinConversation = useCallback((conversationId: string) => {
    ServiceSocket.joinConversation(conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    ServiceSocket.leaveConversation(conversationId);
  }, []);

  const sendTyping = useCallback((conversationId: string) => {
    ServiceSocket.sendTyping(conversationId);
  }, []);

  return {
    status,
    /** True only while updates are actually arriving — gate the polling fallback on this. */
    isLive: status === 'connected',
    joinConversation,
    leaveConversation,
    sendTyping,
  };
};

export default useServiceSocket;
