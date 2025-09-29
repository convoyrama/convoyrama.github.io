let currentLangData = {};

async function fetchLanguage(lang) {
    const response = await fetch(`./event/locales/${lang}.json`);
    return await response.json();
}

function applyTranslations(langData) {
    currentLangData = langData;
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (langData[key]) element.textContent = langData[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (langData[key]) element.placeholder = langData[key];
    });
    document.title = langData.page_title || document.title;
}

async function loadLanguage(lang) {
    const langData = await fetchLanguage(lang);
    applyTranslations(langData);
    // drawCanvas(); // Will be called after drawCanvas is implemented
}