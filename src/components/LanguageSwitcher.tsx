import React from 'react';
import { useTranslation } from 'react-i18next';

interface Language {
  name: string;
  flag: string;
}

const languages: Record<string, Language> = {
  en: { name: 'English', flag: '🇬🇧' },
  zh: { name: '简体中文', flag: '🇨🇳' },
  'zh-TW': { name: '繁體中文', flag: '🇹🇼' },
  es: { name: 'Español', flag: '🇪🇸' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  fr: { name: 'Français', flag: '🇫🇷' }
};

interface LanguageSwitcherProps {
  isDarkMode: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ isDarkMode }) => {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className={`px-2 py-1 rounded-lg text-sm transition-colors border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isDarkMode
          ? 'bg-slate-700 text-white border-slate-600'
          : 'bg-white text-slate-900 border-slate-200'
      }`}
    >
      {Object.entries(languages).map(([code, { name, flag }]) => (
        <option key={code} value={code}>
          {flag} {name}
        </option>
      ))}
    </select>
  );
};

export default LanguageSwitcher;
