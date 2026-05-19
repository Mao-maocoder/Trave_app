"use client";

import Image from "next/image";
import { useLocaleStore } from "@/stores/localeStore";
import { formatRelativeTime } from "@/lib/utils";

interface Conversation {
  id: number;
  other_id: string;
  other_name: string;
  other_avatar: string | null;
  last_message: string | null;
  unread_count: number;
  last_message_at: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNewChat: () => void;
  tick: number;
}

export default function ConversationList({ conversations, activeId, onSelect, onNewChat, tick: _tick }: ConversationListProps) {
  const { locale } = useLocaleStore();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal/5">
        <h2 className="font-display font-bold text-lg text-ink tracking-wider">
          {locale === "zh" ? "消息" : "Messages"}
        </h2>
        <button
          onClick={onNewChat}
          className="w-8 h-8 flex items-center justify-center text-charcoal/40 hover:text-cinnabar hover:bg-cinnabar/5 rounded-full transition-colors"
          title={locale === "zh" ? "发起聊天" : "New Chat"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-charcoal/30 font-body text-sm px-4">
            <p className="mb-3">{locale === "zh" ? "还没有聊天记录" : "No conversations yet"}</p>
            <button
              onClick={onNewChat}
              className="text-cinnabar text-xs font-display tracking-wider hover:text-cinnabar-deep transition-colors"
            >
              {locale === "zh" ? "发起新聊天 →" : "Start a chat →"}
            </button>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                activeId === conv.id
                  ? "bg-cinnabar/5 border-l-2 border-cinnabar"
                  : "hover:bg-charcoal/3 border-l-2 border-transparent"
              }`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-cinnabar/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {conv.other_avatar ? (
                  <Image src={conv.other_avatar} alt="" width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-cinnabar font-display font-bold text-sm">
                    {conv.other_name[0].toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-ink truncate">{conv.other_name}</span>
                  <span className="text-[10px] text-charcoal/30 font-body flex-shrink-0 ml-2">
                    {formatRelativeTime(conv.last_message_at, locale)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-charcoal/40 font-body truncate flex-1">
                    {conv.last_message || ""}
                  </p>
                  {conv.unread_count > 0 && (
                    <span className="ml-2 w-5 h-5 rounded-full bg-cinnabar text-white text-[10px] flex items-center justify-center font-display flex-shrink-0">
                      {conv.unread_count > 9 ? "9+" : conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
