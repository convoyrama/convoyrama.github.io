import { dom } from './dom.js';

export async function fetchLanguage(lang) {
    const response = await fetch(`./locales/${lang}.json`);
    return await response.json();
}

export function applyTranslations(langData) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        // Try prefixed first, then original
        const translation = langData[key] || langData[`ev_${key}`];
        if (translation) {
            if (typeof translation === 'string') {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = langData[key] || langData[`ev_${key}`] || langData[`ev_placeholder_${key.replace('placeholder_', '')}`];
        if (translation) element.placeholder = translation;
    });
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        const translation = langData[key] || langData[`ev_${key}`];
        if (translation) element.title = translation;
    });
    document.title = langData.ev_page_title || langData.page_title || document.title;
}