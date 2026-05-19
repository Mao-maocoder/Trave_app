"use client";

import { useState, useRef, FormEvent, DragEvent } from "react";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { CameraIcon } from "@/components/icons";
import { spots } from "@/lib/spots";

interface UploadModalProps {
  onClose: () => void;
  onUploaded: (newAchievements?: string[]) => void;
}

export default function UploadModal({ onClose, onUploaded }: UploadModalProps) {
  const { locale } = useLocaleStore();
  const token = useAuthStore((s) => s.token);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [spotId, setSpotId] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError(locale === "zh" ? "仅支持 JPG、PNG、WebP 格式" : "Only JPG, PNG, WebP supported");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError(locale === "zh" ? "文件大小不能超过 5MB" : "File size max 5MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (spotId) formData.append("spotId", spotId);
      if (caption) formData.append("caption", caption);

      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onUploaded(data.newAchievements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] isolate">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative pointer-events-auto w-full max-w-lg mx-4 bg-rice-paper rounded-sm shadow-2xl border border-charcoal/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal/10">
          <h2 className="font-display font-bold text-lg text-ink tracking-wide">
            {locale === "zh" ? "上传照片" : "Upload Photo"}
          </h2>
          <button onClick={onClose} className="text-charcoal/40 hover:text-ink text-xl leading-none">
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-cinnabar/5 border border-cinnabar/20 rounded-sm text-cinnabar text-sm">
              {error}
            </div>
          )}

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-cinnabar bg-cinnabar/5"
                : "border-charcoal/20 hover:border-cinnabar/40"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-sm object-contain" />
            ) : (
              <div>
                <CameraIcon size={32} className="text-charcoal/30 mx-auto mb-2" />
                <p className="text-sm text-charcoal/60 font-body">
                  {locale === "zh" ? "拖拽图片到这里，或点击选择" : "Drag image here, or click to select"}
                </p>
                <p className="text-xs text-charcoal/40 mt-1">
                  JPG / PNG / WebP, {locale === "zh" ? "最大 5MB" : "max 5MB"}
                </p>
              </div>
            )}
          </div>

          {/* Spot selector */}
          <div>
            <label className="block text-sm font-display text-ink mb-2 tracking-wider">
              {locale === "zh" ? "关联景点" : "Related Spot"}
            </label>
            <select
              value={spotId}
              onChange={(e) => setSpotId(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-charcoal/15 rounded-sm focus:outline-none focus:ring-2 focus:ring-cinnabar/30 font-body text-charcoal text-sm"
            >
              <option value="">{locale === "zh" ? "（可选）" : "(Optional)"}</option>
              {spots.map((s) => (
                <option key={s.id} value={s.id}>{s.name[locale]}</option>
              ))}
            </select>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-display text-ink mb-2 tracking-wider">
              {locale === "zh" ? "描述" : "Caption"}
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-charcoal/15 rounded-sm focus:outline-none focus:ring-2 focus:ring-cinnabar/30 font-body text-charcoal text-sm"
              placeholder={locale === "zh" ? "记录这个瞬间..." : "Describe this moment..."}
              maxLength={200}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full py-3 bg-cinnabar text-white font-display tracking-[0.15em] rounded-sm hover:bg-cinnabar-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading
              ? (locale === "zh" ? "上传中..." : "Uploading...")
              : (locale === "zh" ? "发布" : "Publish")}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
