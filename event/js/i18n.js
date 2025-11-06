import { dom } from './dom.js';

export async function fetchLanguage(lang) {
    const response = await fetch(`./event/locales/${lang}.json`);
    return await response.json();
}

export function applyTranslations(langData) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        console.log('Translating:', element, key, langData[key]);
        if (langData[key]) element.textContent = langData[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (langData[key]) element.placeholder = langData[key];
    });
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (langData[key]) element.title = langData[key];
    });
    document.title = langData.page_title || document.title;
}