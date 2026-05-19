"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocaleStore } from "@/stores/localeStore";
import { CancelIcon } from "@/components/icons";

interface UserResult {
  id: string;
  username: string;
  avatar: string | null;
}

interface NewChatModalProps {
  onClose: () => void;
  onStartChat: (targetId: string) => void;
  token: string;
}

export default function NewChatModal({ onClose, onStartChat, token }: NewChatModalProps) {
  const { locale } = useLocaleStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.users || []);
      }
    } catch { /* ignore */ }
    setSearching(false);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-sm shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/5">
          <h3 className="font-display font-bold text-base text-ink">
            {locale === "zh" ? "发起聊天" : "New Chat"}
          </h3>
          <button onClick={onClose} className="text-charcoal/30 hover:text-ink transition-colors">
            <CancelIcon size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={locale === "zh" ? "搜索用户名..." : "Search username..."}
            className="w-full px-4 py-2.5 bg-charcoal/3 rounded-sm text-sm font-body text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-1 focus:ring-cinnabar/20"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto">
          {searching ? (
            <div className="px-5 py-6 text-center text-charcoal/30 font-body text-sm">
              {locale === "zh" ? "搜索中..." : "Searching..."}
            </div>
          ) : results.length > 0 ? (
            results.map((user) => (
              <button
                key={user.id}
                onClick={() => onStartChat(user.id)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-charcoal/3 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-cinnabar/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user.avatar ? (
                    <Image src={user.avatar} alt="" width={36} height={36} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-cinnabar font-display font-bold text-sm">{user.username[0].toUpperCase()}</span>
                  )}
                </div>
                <span className="font-display font-bold text-sm text-ink">{user.username}</span>
              </button>
            ))
          ) : query.trim().length >= 2 ? (
            <div className="px-5 py-6 text-center text-charcoal/30 font-body text-sm">
              {locale === "zh" ? "没有找到用户" : "No users found"}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
