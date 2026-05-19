"use client";

import { useState, useRef, useEffect } from "react";
import { useLocaleStore } from "@/stores/localeStore";

interface ChatInputProps {
  onSend: (content: string) => Promise<boolean>;
  sending: boolean;
}

export default function ChatInput({ onSend, sending }: ChatInputProps) {
  const { locale } = useLocaleStore();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;
    const ok = await onSend(content);
    if (ok) setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-charcoal/5 px-4 py-3 flex-shrink-0">
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={locale === "zh" ? "输入消息..." : "Type a message..."}
          className="flex-1 min-h-[36px] max-h-[100px] bg-charcoal/3 rounded-full px-4 py-2 text-sm font-body text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-1 focus:ring-cinnabar/20 resize-none"
          maxLength={2000}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-9 h-9 rounded-full bg-cinnabar text-white flex items-center justify-center hover:bg-cinnabar-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
