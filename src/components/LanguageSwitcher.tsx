"use client";

import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/i18n/constants";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLanguage = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === i18n.language,
  );

  function handleLanguageChange(code: LanguageCode) {
    i18n.changeLanguage(code);
    document.documentElement.lang = code;

    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    if (lang) {
      document.documentElement.dir = lang.dir;
    }
  }

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue>{currentLanguage?.nativeName ?? "Language"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.nativeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
