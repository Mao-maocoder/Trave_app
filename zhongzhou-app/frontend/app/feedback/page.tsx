"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocaleStore } from "@/stores/localeStore";
import { useAuthStore } from "@/stores/authStore";
import { ReturnIcon, TipIcon } from "@/components/icons";

const categories = {
  zh: ["服务体验", "行程安排", "文化体验", "导游专业度", "景点选择", "其他"],
  en: ["Service Experience", "Itinerary Planning", "Cultural Experience", "Guide Professionalism", "Attraction Selection", "Other"],
};

export default function FeedbackPage() {
  const { locale } = useLocaleStore();
  const { user, token } = useAuthStore();

  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState(categories.zh[0]);
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (content.trim().length < 10) {
      setError(locale === "zh" ? "评价内容至少需要10个字符" : "Feedback must be at least 10 characters");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers,
        body: JSON.stringify({ rating, category, content, contact }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (locale === "zh" ? "提交失败，请稍后重试" : "Submission failed"));
      }

      setSubmitted(true);
      setContent("");
      setContact("");
      setRating(5);
      setCategory(categories[locale][0]);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : (locale === "zh" ? "提交失败，请稍后重试" : "Submission failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const currentCategories = categories[locale];

  return (
    <div className="relative z-10">
      {/* Header */}
      <section className="heritage-hero py-14">
        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <Link href="/profile" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6">
            <ReturnIcon size={16} />
            <span className="font-display text-sm tracking-wider">{locale === "zh" ? "返回" : "Back"}</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white tracking-wider">
            {locale === "zh" ? "意见反馈" : "Feedback"}
          </h1>
          <p className="text-white/50 font-body text-sm mt-2">
            {locale === "zh"
              ? "您的评价很重要，帮助我们改进服务质量。"
              : "Your feedback is important — help us improve our service."}
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Rating */}
        <div>
          <label className="font-display font-bold text-sm text-ink tracking-wider block mb-3">
            {locale === "zh" ? "服务评分" : "Service Rating"}
          </label>
          <div className="heritage-panel rounded-lg p-5">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={star <= rating ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`w-8 h-8 ${star <= rating ? "text-gold" : "text-charcoal/20"}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-center text-charcoal/40 font-body text-xs mt-2">
              {rating === 5 ? (locale === "zh" ? "非常满意" : "Very satisfied")
                : rating === 4 ? (locale === "zh" ? "满意" : "Satisfied")
                : rating === 3 ? (locale === "zh" ? "一般" : "Average")
                : rating === 2 ? (locale === "zh" ? "不满意" : "Dissatisfied")
                : (locale === "zh" ? "非常不满意" : "Very dissatisfied")}
            </p>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="font-display font-bold text-sm text-ink tracking-wider block mb-3">
            {locale === "zh" ? "评价类别" : "Feedback Category"}
          </label>
          <div className="flex flex-wrap gap-2">
            {currentCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-sm text-sm font-display tracking-wider transition-all duration-300 ${
                  category === cat
                    ? "bg-cinnabar text-white shadow-[0_2px_12px_rgba(194,59,34,0.2)]"
                    : "bg-white/55 text-charcoal/60 hover:bg-white hover:text-cinnabar border border-charcoal/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="font-display font-bold text-sm text-ink tracking-wider block mb-3">
            {locale === "zh" ? "评价内容" : "Feedback Content"}
          </label>
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setError(""); }}
            rows={6}
            placeholder={locale === "zh"
              ? "请详细描述您的旅行体验，包括导游服务、景点安排、文化体验等方面..."
              : "Please describe your travel experience in detail..."}
            maxLength={500}
            className="w-full rounded-lg border border-charcoal/8 bg-white/72 px-5 py-4 font-body text-sm text-ink placeholder:text-charcoal/30 transition-colors resize-none focus:border-cinnabar/30 focus:outline-none"
          />
          {error && (
            <p className="text-cinnabar text-xs font-body mt-1">{error}</p>
          )}
          <p className="text-charcoal/30 font-body text-xs mt-1 text-right">
            {content.length} / 500
          </p>
        </div>

        {/* Contact */}
        <div>
          <label className="font-display font-bold text-sm text-ink tracking-wider block mb-3">
            {locale === "zh" ? "联系方式（可选）" : "Contact (Optional)"}
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={locale === "zh" ? "邮箱或手机号（用于回复反馈）" : "Email or phone (for reply)"}
            className="w-full rounded-lg border border-charcoal/8 bg-white/72 px-5 py-3 font-body text-sm text-ink placeholder:text-charcoal/30 transition-colors focus:border-cinnabar/30 focus:outline-none"
          />
        </div>

        {/* User info */}
        {user && (
          <div className="heritage-panel rounded-lg p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cinnabar/10 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <Image src={user.avatar} alt="" width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                <span className="text-cinnabar font-display font-bold text-xs">{user.username[0].toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="font-display text-sm text-ink">{user.username}</p>
              <p className="text-charcoal/40 font-body text-xs">{user.email}</p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-cinnabar text-white font-display tracking-[0.15em] text-sm hover:bg-cinnabar-deep transition-colors rounded-lg disabled:opacity-50"
        >
          {submitting
            ? (locale === "zh" ? "提交中..." : "Submitting...")
            : (locale === "zh" ? "提交评价" : "Submit Feedback")}
        </button>

        {/* Success message */}
        {submitted && (
          <div className="bg-jade/5 border border-jade/20 rounded-lg p-4 flex items-center gap-3">
            <TipIcon size={20} className="text-jade flex-shrink-0" />
            <p className="text-jade font-body text-sm">
              {locale === "zh" ? "评价提交成功！感谢您的宝贵意见。" : "Feedback submitted successfully! Thank you."}
            </p>
          </div>
        )}

        {/* Info */}
          <div className="heritage-panel rounded-lg p-4 flex items-start gap-3">
          <TipIcon size={16} className="text-charcoal/40 flex-shrink-0 mt-0.5" />
          <p className="text-charcoal/40 font-body text-xs leading-relaxed">
            {locale === "zh"
              ? "我们会在24小时内处理您的评价，优秀评价将获得奖励！"
              : "We will process your feedback within 24 hours. Excellent feedback will receive rewards!"}
          </p>
        </div>
      </section>
    </div>
  );
}
