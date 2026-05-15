"use client";

import { useLocaleStore } from "@/stores/localeStore";

export default function AdminPage() {
  const { locale } = useLocaleStore();

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-6">⚙️</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        {locale === "zh" ? "管理后台" : "Admin Dashboard"}
      </h1>
      <p className="text-gray-600">
        {locale === "zh"
          ? "管理后台模块开发中..."
          : "Admin module coming soon..."}
      </p>
    </div>
  );
}
