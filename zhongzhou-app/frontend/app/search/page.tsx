"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { spots } from "@/lib/spots";

type Tab = "spots" | "posts" | "photos" | "users";

interface Post {
  id: number;
  username: string;
  user_avatar?: string;
  content: string;
  image_path?: string;
  spot_id?: string;
  likes: number;
  created_at: string;
}

interface Photo {
  id: number;
  username: string;
  user_avatar?: string;
  image_path: string;
  caption?: string;
  spot_id?: string;
  likes: number;
  created_at: string;
}

interface User {
  id: string;
  username: string;
  avatar?: string;
}

export default function SearchPage() {
  const { locale } = useLocaleStore();
  const { token } = useAuthStore();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("spots");
  const [posts, setPosts] = useState<Post[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const searchAll = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setPosts([]);
        setPhotos([]);
        setUsers([]);
        return;
      }
      setLoading(true);
      try {
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const [postsRes, photosRes, usersRes] = await Promise.all([
          fetch(`/api/posts?search=${encodeURIComponent(q)}&limit=20`, { headers }),
          fetch(`/api/photos?search=${encodeURIComponent(q)}&limit=20`, { headers }),
          fetch(`/api/users/search?q=${encodeURIComponent(q)}`, { headers }),
        ]);

        const [postsData, photosData, usersData] = await Promise.all([
          postsRes.json(),
          photosRes.json(),
          usersRes.json(),
        ]);

        setPosts(postsData.posts || []);
        setPhotos(photosData.photos || []);
        setUsers(usersData.users || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAll(value), 400);
  };

  const spotResults = query.trim()
    ? spots.filter((s) => {
        const q = query.toLowerCase();
        return (
          s.name.zh.includes(q) ||
          s.name.en.toLowerCase().includes(q) ||
          s.subtitle.zh.includes(q) ||
          s.subtitle.en.toLowerCase().includes(q) ||
          s.tags.zh.some((t) => t.includes(q)) ||
          s.tags.en.some((t) => t.toLowerCase().includes(q))
        );
      })
    : [];

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "spots", label: locale === "zh" ? "景点" : "Spots", count: spotResults.length },
    { key: "posts", label: locale === "zh" ? "动态" : "Posts", count: posts.length },
    { key: "photos", label: locale === "zh" ? "照片" : "Photos", count: photos.length },
    { key: "users", label: locale === "zh" ? "用户" : "Users", count: users.length },
  ];

  return (
    <div className="relative z-10 min-h-screen">
      {/* Header */}
      <div className="sticky top-16 z-20 nav-surface">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={locale === "zh" ? "搜索景点、动态、照片、用户..." : "Search spots, posts, photos, users..."}
              className="w-full rounded-lg border border-charcoal/8 bg-white/64 py-3 pl-11 pr-10 font-body text-sm text-ink transition-all focus:border-cinnabar/30 focus:bg-white focus:outline-none"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setPosts([]); setPhotos([]); setUsers([]); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-ink"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                </svg>
              </button>
            )}
          </div>

          {/* Tabs */}
          {query.trim() && (
            <div className="flex items-center gap-5 mt-3">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`font-display text-xs tracking-wider pb-2 transition-colors relative ${
                    tab === t.key
                      ? "text-cinnabar"
                      : "text-charcoal/40 hover:text-charcoal/60"
                  }`}
                >
                  {t.label}
                  {t.count > 0 && (
                    <span className="ml-1 text-[10px] text-charcoal/30">{t.count}</span>
                  )}
                  {tab === t.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-cinnabar" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {!query.trim() ? (
          <div className="text-center py-20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-12 h-12 text-charcoal/15 mx-auto mb-4">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
            <p className="text-charcoal/30 font-body text-sm">
              {locale === "zh" ? "输入关键词开始搜索" : "Enter keywords to search"}
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <div className="w-6 h-6 border-2 border-cinnabar/20 border-t-cinnabar rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Spots */}
            {tab === "spots" && (
              <div className="space-y-2">
                {spotResults.length === 0 ? (
                  <p className="text-center text-charcoal/30 font-body text-sm py-12">
                    {locale === "zh" ? "没有匹配的景点" : "No matching spots"}
                  </p>
                ) : (
                  spotResults.map((spot) => (
                    <Link
                      key={spot.id}
                      href={`/spots/${spot.id}?from=search`}
                      className="paper-surface flex items-center gap-4 rounded-lg p-3 transition-colors"
                    >
                      <div className="w-14 h-14 rounded-sm overflow-hidden flex-shrink-0 bg-charcoal/5">
                        <Image src={spot.image} alt={spot.name[locale]} width={56} height={56} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-sm text-ink">{spot.name[locale]}</p>
                        <p className="text-charcoal/40 font-body text-xs mt-0.5">{spot.subtitle[locale]}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {spot.tags[locale].slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-cinnabar/5 text-cinnabar/70 rounded-sm font-body">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Posts */}
            {tab === "posts" && (
              <div className="space-y-2">
                {posts.length === 0 ? (
                  <p className="text-center text-charcoal/30 font-body text-sm py-12">
                    {locale === "zh" ? "没有匹配的动态" : "No matching posts"}
                  </p>
                ) : (
                  posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/community/${post.id}`}
                      className="paper-surface block rounded-lg p-4 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-cinnabar/10 flex items-center justify-center text-xs font-bold text-cinnabar overflow-hidden">
                          {post.user_avatar ? (
                            <Image src={post.user_avatar} alt="" width={28} height={28} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            post.username[0].toUpperCase()
                          )}
                        </div>
                        <span className="font-display text-xs text-ink">{post.username}</span>
                      </div>
                      <p className="font-body text-sm text-charcoal line-clamp-2">{post.content}</p>
                      {post.image_path && (
                        <div className="mt-2 w-20 h-20 rounded-sm overflow-hidden bg-charcoal/5">
                          <Image src={post.image_path} alt="" width={80} height={80} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Photos */}
            {tab === "photos" && (
              <div className="grid grid-cols-3 gap-1">
                {photos.length === 0 ? (
                  <p className="col-span-3 text-center text-charcoal/30 font-body text-sm py-12">
                    {locale === "zh" ? "没有匹配的照片" : "No matching photos"}
                  </p>
                ) : (
                  photos.map((photo) => (
                    <div key={photo.id} className="aspect-square relative bg-charcoal/5 overflow-hidden">
                      <Image src={photo.image_path} alt={photo.caption || ""} fill className="object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                        <p className="text-white text-[10px] font-body truncate">{photo.username}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Users */}
            {tab === "users" && (
              <div className="space-y-2">
                {users.length === 0 ? (
                  <p className="text-center text-charcoal/30 font-body text-sm py-12">
                    {locale === "zh" ? "没有匹配的用户" : "No matching users"}
                  </p>
                ) : (
                  users.map((u) => (
                    <Link
                      key={u.id}
                      href={`/chat?user=${u.id}`}
                      className="paper-surface flex items-center gap-4 rounded-lg p-3 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-charcoal/10 flex items-center justify-center text-sm font-bold text-charcoal/50 overflow-hidden">
                        {u.avatar ? (
                          <Image src={u.avatar} alt="" width={40} height={40} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          u.username[0]
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm text-ink">{u.username}</p>
                      </div>
                      <span className="text-xs text-charcoal/30 font-display">
                        {locale === "zh" ? "发消息" : "Message"}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
