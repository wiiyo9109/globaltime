import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import en from './locales/en.json';
import zh from './locales/zh.json';
import zh-TW from './locales/zh-TW.json';
import jp from './locales/jp.json';
import ko from './locales/ko.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  'zh': { translation: zh },
  'zh-TW': { translation: zh-TW },
  'zh-jp': { translation: jp },
  'zh-CN': { translation: ko },
  'ko': { translation: zhCN },
  'de': { translation: de },
  'fr': { translation: fr },
  'es': { translation: es },
  // 其他語言
};

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh', 'zh-TW', 'es', 'ja', 'ko', 'de', 'fr'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'],
    },
  });

export default i18n;