import zh from "@/messages/zh.json";
import en from "@/messages/en.json";

const messages = { zh, en };

export type Locale = "zh" | "en";

export function getMessages(locale: Locale) {
  return messages[locale] || messages.zh;
}

export function t(
  locale: Locale,
  path: string
): string {
  const keys = path.split(".");
  let result: unknown = getMessages(locale);
  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof result === "string" ? result : path;
}
