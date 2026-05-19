export function formatRelativeTime(dateStr: string, locale: string): string {
  // Supabase timestamps may or may not have timezone info
  let date: Date;
  if (/[Zz+\-]\d{2}:?\d{2}$/.test(dateStr) || dateStr.endsWith("Z")) {
    date = new Date(dateStr);
  } else {
    date = new Date(dateStr + "Z");
  }
  if (isNaN(date.getTime())) {
    date = new Date(dateStr);
  }
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    if (diffMin < 1) return locale === "zh" ? "刚刚" : "Just now";
    if (diffMin < 60) return locale === "zh" ? `${diffMin}分钟前` : `${diffMin}m ago`;
    return locale === "zh" ? `${diffHour}小时前` : `${diffHour}h ago`;
  }

  const isThisYear = date.getFullYear() === now.getFullYear();

  if (isThisYear) {
    return locale === "zh"
      ? `${date.getMonth() + 1}月${date.getDate()}日`
      : `${date.toLocaleString("en", { month: "short" })} ${date.getDate()}`;
  }

  return locale === "zh"
    ? `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    : date.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
}
