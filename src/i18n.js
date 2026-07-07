import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en, he, pl } from './assets/translations/index'

const resources = {
  en: {
    translation: en
  },
  he: {
    translation: he
  },
  pl: {
    translation: pl
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
      prefix: '{{',
      suffix: '}}'
    }
  })

// Expose i18n to window for third-party libraries like Tawk
if (typeof window !== 'undefined') {
  window.i18next = i18n;
}

export default i18n;
