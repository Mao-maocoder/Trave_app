"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import ConversationList from "@/components/chat/ConversationList";
import MessageView from "@/components/chat/MessageView";
import ChatInput from "@/components/chat/ChatInput";
import NewChatModal from "@/components/chat/NewChatModal";
import AuthGuard from "@/components/ui/AuthGuard";

export default function ChatPage() {
  const { locale } = useLocaleStore();
  const { user, token } = useAuthStore();
  const {
    conversations,
    messages,
    sending,
    fetchConversations,
    fetchMessages,
    pollMessages,
    sendMessage,
    markRead,
    createConversation,
    clearUnread,
  } = useChatStore();

  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [mobileShowMessages, setMobileShowMessages] = useState(false);
  const [tick, setTick] = useState(0);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const activeConvRef = useRef<number | null>(null);

  // Keep ref in sync
  useEffect(() => {
    activeConvRef.current = activeConvId;
  }, [activeConvId]);

  // Global relative time ticker
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch conversations on mount
  useEffect(() => {
    if (!token) return;
    fetchConversations(token);
  }, [token, fetchConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!token || !activeConvId) return;
    fetchMessages(token, activeConvId);
    markRead(token, activeConvId);

    // Start polling
    pollRef.current = setInterval(() => {
      if (activeConvRef.current) {
        pollMessages(token, activeConvRef.current);
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [token, activeConvId, fetchMessages, pollMessages, markRead]);

  const handleSelectConv = useCallback((id: number) => {
    setActiveConvId(id);
    setMobileShowMessages(true);
    clearUnread(id);
  }, [clearUnread]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!token || !activeConvId) return false;
    const ok = await sendMessage(token, activeConvId, content);
    if (ok) {
      fetchConversations(token);
    }
    return ok;
  }, [token, activeConvId, sendMessage, fetchConversations]);

  const handleStartChat = useCallback(async (targetId: string) => {
    if (!token) return;
    const convId = await createConversation(token, targetId);
    if (convId) {
      setShowNewChat(false);
      await fetchConversations(token);
      setActiveConvId(convId);
      setMobileShowMessages(true);
    }
  }, [token, createConversation, fetchConversations]);

  const handleBack = useCallback(() => {
    setMobileShowMessages(false);
    setActiveConvId(null);
  }, []);

  if (!user) return null;

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <AuthGuard fallback="login">
    <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
      <div className="heritage-panel overflow-hidden rounded-lg" style={{ height: "calc(100vh - 190px)" }}>
        <div className="flex h-full">
          {/* Conversation list — hidden on mobile when viewing messages */}
          <div className={`w-full md:w-80 md:border-r border-charcoal/5 flex-shrink-0 ${mobileShowMessages ? "hidden md:block" : "block"}`}>
            <ConversationList
              conversations={conversations}
              activeId={activeConvId}
              onSelect={handleSelectConv}
              onNewChat={() => setShowNewChat(true)}
              tick={tick}
            />
          </div>

          {/* Message area */}
          <div className={`flex-1 flex flex-col min-w-0 ${mobileShowMessages ? "block" : "hidden md:block"}`}>
            {activeConvId && activeConv ? (
              <>
                <MessageView
                  messages={messages}
                  currentUserId={user.id}
                  otherName={activeConv.other_name}
                  otherAvatar={activeConv.other_avatar}
                  onBack={handleBack}
                  tick={tick}
                />
                <ChatInput onSend={handleSendMessage} sending={sending} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-charcoal/20 font-body text-sm">
                {locale === "zh" ? "选择一个会话开始聊天" : "Select a conversation to start"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New chat modal */}
      {showNewChat && token && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onStartChat={handleStartChat}
          token={token}
        />
      )}
    </div>
    </AuthGuard>
  );
}
