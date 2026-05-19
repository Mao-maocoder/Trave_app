"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { useLocaleStore } from "@/stores/localeStore";
import { ReturnIcon } from "@/components/icons";
import { formatRelativeTime } from "@/lib/utils";

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

interface MessageViewProps {
  messages: Message[];
  currentUserId: string;
  otherName: string;
  otherAvatar: string | null;
  onBack?: () => void;
  tick: number;
}

export default function MessageView({ messages, currentUserId, otherName, otherAvatar, onBack, tick: _tick }: MessageViewProps) {
  const { locale } = useLocaleStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);

  useEffect(() => {
    // Only auto-scroll when new messages arrive, not on initial load
    if (messages.length > prevLenRef.current && prevLenRef.current > 0) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
    prevLenRef.current = messages.length;
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-charcoal/5 flex-shrink-0">
        {onBack && (
          <button onClick={onBack} className="text-charcoal/40 hover:text-cinnabar transition-colors md:hidden">
            <ReturnIcon size={20} />
          </button>
        )}
        <div className="w-8 h-8 rounded-full bg-cinnabar/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {otherAvatar ? (
            <Image src={otherAvatar} alt="" width={32} height={32} className="w-full h-full object-cover" />
          ) : (
            <span className="text-cinnabar font-display font-bold text-xs">{otherName[0].toUpperCase()}</span>
          )}
        </div>
        <span className="font-display font-bold text-sm text-ink">{otherName}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-charcoal/20 font-body text-sm">
            {locale === "zh" ? "开始聊天吧" : "Say hello!"}
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-cinnabar/10 flex items-center justify-center overflow-hidden flex-shrink-0 mt-1">
                    {msg.sender_avatar ? (
                      <Image src={msg.sender_avatar} alt="" width={28} height={28} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-cinnabar font-display font-bold text-[10px]">{msg.sender_name[0].toUpperCase()}</span>
                    )}
                  </div>
                )}
                <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm font-body leading-relaxed ${
                      isMe
                        ? "bg-cinnabar text-white rounded-br-md"
                        : "bg-white border border-charcoal/10 text-charcoal/80 rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-charcoal/20 font-body mt-1 px-1">
                    {formatRelativeTime(msg.created_at, locale)}
                    {isMe && msg.read === 1 && (
                      <span className="ml-1">{locale === "zh" ? "已读" : "Read"}</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
