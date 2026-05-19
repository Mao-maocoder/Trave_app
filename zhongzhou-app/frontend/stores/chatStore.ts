import { create } from "zustand";

interface Conversation {
  id: number;
  other_id: string;
  other_name: string;
  other_avatar: string | null;
  last_message: string | null;
  unread_count: number;
  last_message_at: string;
}

interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  content: string;
  read: number;
  created_at: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: number | null;
  messages: Message[];
  totalUnread: number;
  loading: boolean;
  sending: boolean;

  fetchConversations: (token: string) => Promise<void>;
  fetchMessages: (token: string, conversationId: number) => Promise<void>;
  pollMessages: (token: string, conversationId: number) => Promise<void>;
  sendMessage: (token: string, conversationId: number, content: string) => Promise<boolean>;
  markRead: (token: string, conversationId: number) => Promise<void>;
  createConversation: (token: string, targetId: string) => Promise<number | null>;
  setActiveConversation: (id: number | null) => void;
  clearMessages: () => void;
  clearUnread: (conversationId: number) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  totalUnread: 0,
  loading: false,
  sending: false,

  fetchConversations: async (token) => {
    try {
      const res = await fetch("/api/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const convs = data.conversations || [];
      set({
        conversations: convs,
        totalUnread: convs.reduce((sum: number, c: Conversation) => sum + c.unread_count, 0),
      });
    } catch { /* ignore */ }
  },

  fetchMessages: async (token, conversationId) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      set({ messages: data.messages || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  pollMessages: async (token, conversationId) => {
    const { messages } = get();
    const lastId = messages.length > 0 ? messages[messages.length - 1].id : 0;
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages?after=${lastId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const newMessages: Message[] = data.messages || [];
      if (newMessages.length > 0) {
        set({ messages: [...messages, ...newMessages] });
      }
    } catch { /* ignore */ }
  },

  sendMessage: async (token, conversationId, content) => {
    set({ sending: true });
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.message) {
        set({ messages: [...get().messages, data.message] });
      }
      set({ sending: false });
      return true;
    } catch {
      set({ sending: false });
      return false;
    }
  },

  markRead: async (token, conversationId) => {
    try {
      await fetch(`/api/chat/conversations/${conversationId}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      // 更新本地未读数
      set({
        conversations: get().conversations.map((c) =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        ),
        totalUnread: get().conversations.reduce(
          (sum, c) => sum + (c.id === conversationId ? 0 : c.unread_count),
          0
        ),
      });
    } catch { /* ignore */ }
  },

  createConversation: async (token, targetId) => {
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetId }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.conversation?.id || null;
    } catch {
      return null;
    }
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),
  clearMessages: () => set({ messages: [] }),

  clearUnread: (conversationId) => {
    const convs = get().conversations.map((c) =>
      c.id === conversationId ? { ...c, unread_count: 0 } : c
    );
    set({
      conversations: convs,
      totalUnread: convs.reduce((sum, c) => sum + c.unread_count, 0),
    });
  },
}));
