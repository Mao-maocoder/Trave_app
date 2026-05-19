"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { products } from "@/lib/merchandise";
import { formatRelativeTime } from "@/lib/utils";
import AuthGuard from "@/components/ui/AuthGuard";
import {
  SettingsIcon,
  UserIcon,
  CameraIcon,
  ShoppingBagIcon,
  LikeIcon,
  DeleteIcon,
} from "@/components/icons";

type Tab = "overview" | "users" | "photos" | "posts" | "merch" | "viz";

interface Stats {
  totalUsers: number;
  totalPhotos: number;
  totalPosts: number;
  totalComments: number;
  recentUsers: number;
  recentPhotos: number;
  recentPosts: number;
  photosByStatus: { status: string; count: number }[];
  recentActivity: { type: string; username: string; detail: string; created_at: string }[];
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar: string | null;
  created_at: string;
}

interface AdminPhoto {
  id: number;
  user_id: string;
  username: string;
  image_path: string;
  spot_id: string | null;
  caption: string | null;
  likes: number;
  status: string;
  created_at: string;
}

interface AdminPost {
  id: number;
  user_id: string;
  username: string;
  content: string;
  spot_id: string | null;
  image_path: string | null;
  likes: number;
  comment_count: number;
  created_at: string;
}

export default function AdminPage() {
  const { locale } = useLocaleStore();
  const { token } = useAuthStore();
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { key: Tab; label: string; Icon: typeof SettingsIcon }[] = [
    { key: "overview", label: locale === "zh" ? "总览" : "Overview", Icon: SettingsIcon },
    { key: "users", label: locale === "zh" ? "用户" : "Users", Icon: UserIcon },
    { key: "photos", label: locale === "zh" ? "照片" : "Photos", Icon: CameraIcon },
    { key: "posts", label: locale === "zh" ? "动态" : "Posts", Icon: LikeIcon },
    { key: "merch", label: locale === "zh" ? "周边" : "Merch", Icon: ShoppingBagIcon },
    { key: "viz", label: locale === "zh" ? "数据" : "Analytics", Icon: LikeIcon },
  ];

  return (
    <AuthGuard requireRole="admin">
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-48 flex-shrink-0">
          <div className="heritage-panel sticky top-24 space-y-1 rounded-lg p-2">
            {tabs.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body rounded-sm transition-colors ${
                  tab === key
                    ? "bg-cinnabar text-white"
                    : "text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {tab === "overview" && <OverviewTab token={token} locale={locale} />}
          {tab === "users" && <UsersTab token={token} locale={locale} />}
          {tab === "photos" && <PhotosTab token={token} locale={locale} />}
          {tab === "posts" && <PostsTab token={token} locale={locale} />}
          {tab === "merch" && <MerchTab locale={locale} />}
          {tab === "viz" && <VizTab locale={locale} />}
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}

/* ─── Overview Tab ─── */

function OverviewTab({ token, locale }: { token: string | null; locale: "zh" | "en" }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setStats);
  }, [token]);

  if (!stats) return <Skeleton />;

  const cards = [
    { label: locale === "zh" ? "总用户" : "Users", value: stats.totalUsers, sub: `+${stats.recentUsers} ${locale === "zh" ? "近7天" : "7d"}` },
    { label: locale === "zh" ? "总照片" : "Photos", value: stats.totalPhotos, sub: `+${stats.recentPhotos} ${locale === "zh" ? "近7天" : "7d"}` },
    { label: locale === "zh" ? "总动态" : "Posts", value: stats.totalPosts, sub: `+${stats.recentPosts} ${locale === "zh" ? "近7天" : "7d"}` },
    { label: locale === "zh" ? "总评论" : "Comments", value: stats.totalComments, sub: "" },
  ];

  return (
    <div className="space-y-8">
      <h2 className="font-display font-bold text-2xl text-ink tracking-wide">
        {locale === "zh" ? "数据总览" : "Dashboard"}
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="paper-surface rounded-lg p-5">
            <p className="text-xs text-charcoal/40 font-body mb-1">{c.label}</p>
            <p className="font-display font-bold text-3xl text-ink">{c.value}</p>
            {c.sub && <p className="text-xs text-jade mt-1 font-body">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Photo status breakdown */}
      <div className="heritage-panel rounded-lg p-6">
        <h3 className="font-display font-bold text-lg text-ink mb-4">
          {locale === "zh" ? "照片审核状态" : "Photo Status"}
        </h3>
        <div className="flex gap-6">
          {stats.photosByStatus.map((s) => (
            <div key={s.status} className="text-center">
              <p className="font-display font-bold text-2xl text-ink">{s.count}</p>
              <p className="text-xs text-charcoal/50 font-body capitalize">{s.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="heritage-panel rounded-lg p-6">
        <h3 className="font-display font-bold text-lg text-ink mb-4">
          {locale === "zh" ? "近期动态" : "Recent Activity"}
        </h3>
        {stats.recentActivity.length === 0 ? (
          <p className="text-charcoal/40 text-sm font-body">{locale === "zh" ? "暂无数据" : "No data"}</p>
        ) : (
          <div className="space-y-3">
            {stats.recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="font-bold text-ink font-body">{a.username}</span>
                <span className="text-charcoal/50 font-body truncate flex-1">{a.detail}</span>
                <span className="text-charcoal/30 text-xs font-body flex-shrink-0">{formatRelativeTime(a.created_at, locale)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Users Tab ─── */

function UsersTab({ token, locale }: { token: string | null; locale: "zh" | "en" }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(() => {
    if (!token) return;
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (search) params.set("search", search);
    fetch(`/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { setUsers(d.users); setTotalPages(d.totalPages); });
  }, [token, page, search]);

  useEffect(() => { load(); }, [load]);

  async function toggleRole(u: AdminUser) {
    const newRole = u.role === "admin" ? "user" : "admin";
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: u.id, role: newRole }),
    });
    load();
  }

  async function deleteUser(id: string) {
    if (!confirm(locale === "zh" ? "确定删除该用户？" : "Delete this user?")) return;
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: id }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-2xl text-ink tracking-wide">
          {locale === "zh" ? "用户管理" : "User Management"}
        </h2>
        <input
          type="text"
          placeholder={locale === "zh" ? "搜索用户名/邮箱..." : "Search..."}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64 rounded-sm border border-charcoal/10 bg-white/72 px-4 py-2 text-sm font-body focus:border-cinnabar/40 focus:outline-none"
        />
      </div>

      <div className="heritage-panel overflow-hidden rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal/10 text-left">
              <th className="px-4 py-3 font-display font-bold text-charcoal/60">ID</th>
              <th className="px-4 py-3 font-display font-bold text-charcoal/60">{locale === "zh" ? "用户名" : "Username"}</th>
              <th className="px-4 py-3 font-display font-bold text-charcoal/60">Email</th>
              <th className="px-4 py-3 font-display font-bold text-charcoal/60">{locale === "zh" ? "角色" : "Role"}</th>
              <th className="px-4 py-3 font-display font-bold text-charcoal/60">{locale === "zh" ? "注册时间" : "Joined"}</th>
              <th className="px-4 py-3 font-display font-bold text-charcoal/60">{locale === "zh" ? "操作" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-charcoal/5 last:border-0 hover:bg-charcoal/[0.02]">
                <td className="px-4 py-3 text-charcoal/50 font-body">{u.id}</td>
                <td className="px-4 py-3 font-body font-medium text-ink">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-cinnabar/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {u.avatar ? (
                        <Image src={u.avatar} alt="" width={24} height={24} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-cinnabar text-[10px] font-display font-bold">{u.username[0].toUpperCase()}</span>
                      )}
                    </div>
                    {u.username}
                  </div>
                </td>
                <td className="px-4 py-3 text-charcoal/60 font-body">{u.email}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleRole(u)}
                    className={`px-2 py-0.5 text-xs font-display rounded-sm ${
                      u.role === "admin"
                        ? "bg-cinnabar/10 text-cinnabar"
                        : "bg-charcoal/5 text-charcoal/50"
                    }`}
                  >
                    {u.role}
                  </button>
                </td>
                <td className="px-4 py-3 text-charcoal/40 text-xs font-body">{u.created_at?.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteUser(u.id)} className="text-charcoal/30 hover:text-cinnabar transition-colors">
                    <DeleteIcon size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}

/* ─── Photos Tab ─── */

function PhotosTab({ token, locale }: { token: string | null; locale: "zh" | "en" }) {
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(() => {
    if (!token) return;
    const params = new URLSearchParams({ page: String(page), limit: "12" });
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/photos?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { setPhotos(d.photos); setTotalPages(d.totalPages); });
  }, [token, page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(photoId: number, status: string) {
    await fetch("/api/admin/photos", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ photoId, status }),
    });
    load();
  }

  async function deletePhoto(id: number) {
    if (!confirm(locale === "zh" ? "确定删除该照片？" : "Delete this photo?")) return;
    await fetch("/api/admin/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ photoId: id }),
    });
    load();
  }

  const statusOptions = [
    { value: "", label: locale === "zh" ? "全部" : "All" },
    { value: "approved", label: locale === "zh" ? "已通过" : "Approved" },
    { value: "pending", label: locale === "zh" ? "待审核" : "Pending" },
    { value: "rejected", label: locale === "zh" ? "已拒绝" : "Rejected" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-2xl text-ink tracking-wide">
          {locale === "zh" ? "照片审核" : "Photo Moderation"}
        </h2>
        <div className="flex gap-1">
          {statusOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => { setStatusFilter(s.value); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-display transition-colors ${
                statusFilter === s.value ? "text-cinnabar font-bold" : "text-charcoal/40 hover:text-charcoal"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((p) => (
          <div key={p.id} className="paper-surface overflow-hidden rounded-lg">
            <div className="relative aspect-square bg-rice-paper-warm/40">
              <Image src={p.image_path} alt="" fill className="object-cover" />
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-body text-charcoal/50">{p.username}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-sm font-display ${
                  p.status === "approved" ? "bg-jade/10 text-jade" :
                  p.status === "pending" ? "bg-gold/10 text-gold" :
                  "bg-cinnabar/10 text-cinnabar"
                }`}>{p.status}</span>
              </div>
              {p.caption && <p className="text-xs text-charcoal/60 font-body line-clamp-2 mb-2">{p.caption}</p>}
              <div className="flex gap-1">
                {p.status !== "approved" && (
                  <button onClick={() => updateStatus(p.id, "approved")} className="flex-1 py-1 text-xs bg-jade/10 text-jade font-display hover:bg-jade/20 transition-colors rounded-sm">
                    {locale === "zh" ? "通过" : "Approve"}
                  </button>
                )}
                {p.status !== "rejected" && (
                  <button onClick={() => updateStatus(p.id, "rejected")} className="flex-1 py-1 text-xs bg-gold/10 text-gold font-display hover:bg-gold/20 transition-colors rounded-sm">
                    {locale === "zh" ? "拒绝" : "Reject"}
                  </button>
                )}
                <button onClick={() => deletePhoto(p.id)} className="py-1 px-2 text-xs text-charcoal/30 hover:text-cinnabar transition-colors">
                  <DeleteIcon size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}

/* ─── Posts Tab ─── */

function PostsTab({ token, locale }: { token: string | null; locale: "zh" | "en" }) {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(() => {
    if (!token) return;
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (search) params.set("search", search);
    fetch(`/api/admin/posts?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts); setTotalPages(d.totalPages); });
  }, [token, page, search]);

  useEffect(() => { load(); }, [load]);

  async function deletePost(id: number) {
    if (!confirm(locale === "zh" ? "确定删除该动态？" : "Delete this post?")) return;
    await fetch("/api/admin/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ postId: id }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-2xl text-ink tracking-wide">
          {locale === "zh" ? "动态管理" : "Post Management"}
        </h2>
        <input
          type="text"
          placeholder={locale === "zh" ? "搜索内容/用户..." : "Search..."}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64 rounded-sm border border-charcoal/10 bg-white/72 px-4 py-2 text-sm font-body focus:border-cinnabar/40 focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="paper-surface flex gap-4 rounded-lg p-4">
            {p.image_path && (
              <div className="relative w-16 h-16 flex-shrink-0 rounded-sm overflow-hidden bg-rice-paper-warm/40">
                <Image src={p.image_path} alt="" fill className="object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-ink font-body">{p.username}</span>
                {p.spot_id && <span className="text-xs text-charcoal/30 font-body">@{p.spot_id}</span>}
                <span className="text-xs text-charcoal/30 font-body ml-auto">{formatRelativeTime(p.created_at, locale)}</span>
              </div>
              <p className="text-sm text-charcoal/60 font-body line-clamp-2">{p.content}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-charcoal/40">
                <span>♥ {p.likes}</span>
                <span>💬 {p.comment_count}</span>
              </div>
            </div>
            <button onClick={() => deletePost(p.id)} className="self-start text-charcoal/30 hover:text-cinnabar transition-colors p-1">
              <DeleteIcon size={16} />
            </button>
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}

/* ─── Merch Tab ─── */

function MerchTab({ locale }: { locale: "zh" | "en" }) {
  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-2xl text-ink tracking-wide">
        {locale === "zh" ? "周边商品" : "Merchandise"}
      </h2>
      <p className="text-sm text-charcoal/50 font-body">
        {locale === "zh" ? "当前为静态数据展示，后续可接入数据库管理。" : "Static data preview. Database management coming soon."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((p) => (
          <div key={p.id} className="paper-surface flex gap-4 rounded-lg p-4">
            <div className="relative w-20 h-20 flex-shrink-0 rounded-sm overflow-hidden bg-rice-paper-warm/40">
              <Image src={p.image} alt={p.name[locale]} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-bold text-sm text-ink truncate">{p.name[locale]}</h4>
              <p className="text-xs text-charcoal/40 font-body mt-0.5">{p.category[locale]}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-display font-bold text-cinnabar">¥{p.price}</span>
                {p.originalPrice && <span className="text-xs text-charcoal/30 line-through">¥{p.originalPrice}</span>}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-charcoal/40">
                <span>★ {p.rating}</span>
                <span>{locale === "zh" ? "已售" : "Sold"} {p.sales}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Shared Components ─── */

function Pagination({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        className="px-3 py-1.5 text-xs font-display text-charcoal/50 hover:text-cinnabar disabled:opacity-30 transition-colors"
      >
        ‹
      </button>
      <span className="text-sm text-charcoal/40 font-body">
        {page} / {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => setPage(page + 1)}
        className="px-3 py-1.5 text-xs font-display text-charcoal/50 hover:text-cinnabar disabled:opacity-30 transition-colors"
      >
        ›
      </button>
    </div>
  );
}

function VizTab({ locale }: { locale: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-charcoal/50 font-body text-sm mb-4">
        {locale === "zh" ? "查看详细的数据可视化报表" : "View detailed analytics dashboard"}
      </p>
      <a
        href="/admin/visualization"
        className="inline-block px-6 py-2.5 bg-cinnabar text-white font-display text-sm tracking-wider rounded-sm hover:bg-cinnabar-deep transition-colors"
      >
        {locale === "zh" ? "打开数据可视化" : "Open Analytics"}
      </a>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-charcoal/10 rounded-sm" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-charcoal/5 rounded-sm" />
        ))}
      </div>
      <div className="h-48 bg-charcoal/5 rounded-sm" />
    </div>
  );
}
