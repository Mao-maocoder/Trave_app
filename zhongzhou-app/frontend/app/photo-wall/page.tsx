"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { t } from "@/lib/i18n";
import { spots } from "@/lib/spots";
import UploadModal from "@/components/photos/UploadModal";
import PhotoLightbox from "@/components/photos/PhotoLightbox";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Photo {
  id: number;
  user_id: number;
  username: string;
  user_avatar: string | null;
  image_path: string;
  spot_id: string | null;
  caption: string | null;
  likes: number;
  comment_count: number;
  created_at: string;
}

export default function PhotoWallPage() {
  const { locale } = useLocaleStore();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Set<number>>(new Set());
  const [filterSpot, setFilterSpot] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filterSpot) params.set("spotId", filterSpot);
      const res = await fetch(`/api/photos?${params}`);
      const data = await res.json();
      setPhotos(data.photos);
      setTotalPages(data.totalPages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, filterSpot]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleLike = async (photoId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/photos/${photoId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId ? { ...p, likes: data.likes } : p
        )
      );
      setLikedPhotos((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(photoId);
        else next.delete(photoId);
        return next;
      });
      setSelectedPhoto((prev) =>
        prev && prev.id === photoId ? { ...prev, likes: data.likes } : prev
      );
    } catch {
      // ignore
    }
  };

  const handleDelete = (photoId: number) => {
    setConfirmDelete(photoId);
  };

  const executeDelete = async () => {
    if (!token || confirmDelete === null) return;
    const photoId = confirmDelete;
    setConfirmDelete(null);
    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        setSelectedPhoto(null);
      }
    } catch {
      // ignore
    }
  };

  const handleCommentCountChange = (photoId: number, count: number) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, comment_count: count } : p
      )
    );
    setSelectedPhoto((prev) =>
      prev && prev.id === photoId ? { ...prev, comment_count: count } : prev
    );
  };

  const getSpotName = (spotId: string | null) => {
    if (!spotId) return null;
    const spot = spots.find((s) => s.id === spotId);
    return spot?.name[locale] || spotId;
  };

  return (
    <div className="relative z-10">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 pt-10 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="seal-stamp text-xs tracking-[0.3em] w-fit px-3 py-1 mb-3">
              {locale === "zh" ? "照片墙" : "PHOTO WALL"}
            </div>
            <h1 className="font-display font-bold text-3xl text-ink tracking-wide">
              {t(locale, "nav.photoWall")}
            </h1>
            <div className="mt-3 w-16 h-[2px] bg-gradient-to-r from-cinnabar via-gold to-transparent" />
          </div>

          {user && (
            <button
              onClick={() => setShowUpload(true)}
              className="px-6 py-2.5 bg-cinnabar text-white font-display tracking-[0.1em] text-sm rounded-sm hover:bg-cinnabar-deep transition-colors shadow-[0_4px_16px_rgba(194,59,34,0.2)]"
            >
              {locale === "zh" ? "上传照片" : "Upload"}
            </button>
          )}
        </div>
      </section>

      {/* Filter */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex items-center gap-3">
          <span className="text-sm text-charcoal/60 font-display tracking-wider">
            {locale === "zh" ? "筛选：" : "Filter:"}
          </span>
          <button
            onClick={() => { setFilterSpot(""); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-display tracking-wider rounded-sm transition-colors ${
              filterSpot === ""
                ? "bg-cinnabar text-white"
                : "bg-charcoal/5 text-charcoal/60 hover:text-cinnabar"
            }`}
          >
            {locale === "zh" ? "全部" : "All"}
          </button>
          {spots.map((s) => (
            <button
              key={s.id}
              onClick={() => { setFilterSpot(s.id); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-display tracking-wider rounded-sm transition-colors ${
                filterSpot === s.id
                  ? "bg-cinnabar text-white"
                  : "bg-charcoal/5 text-charcoal/60 hover:text-cinnabar"
              }`}
            >
              {s.name[locale]}
            </button>
          ))}
        </div>
      </section>

      {/* Photo Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-20 text-charcoal/40 font-body">
            {t(locale, "common.loading")}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📷</div>
            <p className="text-charcoal/40 font-body">
              {locale === "zh" ? "还没有照片，快来上传第一张吧！" : "No photos yet. Be the first to upload!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group bg-white rounded-sm overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-charcoal/5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-400 cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={photo.image_path}
                    alt={photo.caption || ""}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="300px"
                  />
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-cinnabar/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {photo.user_avatar ? (
                          <Image src={photo.user_avatar} alt="" width={24} height={24} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-cinnabar text-[10px] font-display font-bold">
                            {photo.username[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-display font-bold text-ink">
                        {photo.username}
                      </span>
                    </div>
                    {photo.spot_id && (
                      <span className="text-[10px] px-2 py-0.5 bg-cinnabar/5 text-cinnabar border border-cinnabar/10 rounded-sm font-display tracking-wider">
                        {getSpotName(photo.spot_id)}
                      </span>
                    )}
                  </div>

                  {photo.caption && (
                    <p className="text-sm text-charcoal/60 font-body line-clamp-2 mb-3">
                      {photo.caption}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-charcoal/30 font-body">
                      {new Date(photo.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLike(photo.id); }}
                        className="flex items-center gap-1 text-sm text-charcoal/40 hover:text-cinnabar transition-colors"
                      >
                        <span>❤</span>
                        <span className="font-body">{photo.likes}</span>
                      </button>
                      <span className="flex items-center gap-1 text-sm text-charcoal/30">
                        <span>💬</span>
                        <span className="font-body">{photo.comment_count}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-sm font-display rounded-sm transition-colors ${
                  p === page
                    ? "bg-cinnabar text-white"
                    : "bg-charcoal/5 text-charcoal/60 hover:text-cinnabar"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setShowUpload(false);
            setPage(1);
            fetchPhotos();
          }}
        />
      )}

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          liked={likedPhotos.has(selectedPhoto.id)}
          isOwner={user?.id === selectedPhoto.user_id}
          currentUserId={user?.id ?? null}
          token={token}
          onLike={() => handleLike(selectedPhoto.id)}
          onDelete={() => handleDelete(selectedPhoto.id)}
          onCommentCountChange={(count) => handleCommentCountChange(selectedPhoto.id, count)}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* Delete Photo Confirm */}
      {confirmDelete !== null && (
        <ConfirmModal
          message={locale === "zh" ? "确定删除这张照片吗？" : "Delete this photo?"}
          confirmText={locale === "zh" ? "删除" : "Delete"}
          cancelText={locale === "zh" ? "取消" : "Cancel"}
          danger
          onConfirm={executeDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
