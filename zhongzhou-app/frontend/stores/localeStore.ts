import { create } from "zustand";

type Locale = "zh" | "en";

interface LocaleStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useLocaleStore = create<LocaleStore>((set) => ({
  locale: "zh",
  setLocale: (locale) => set({ locale }),
  toggleLocale: () =>
    set((state) => ({ locale: state.locale === "zh" ? "en" : "zh" })),
}));
