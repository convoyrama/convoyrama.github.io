async function loadLanguage(lang) {
    try {
        const pathPrefix = window.location.pathname.includes('/lagfm/') || window.location.pathname.includes('/event/') ? '../' : './';
        const response = await fetch(`${pathPrefix}locales/${lang}.json`);
        const translations = await response.json();
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = translations[key] || translations[`ev_${key}`];
            if (translation) {
                if (typeof translation === 'string') el.innerHTML = translation;
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = translations[key] || translations[`ev_placeholder_${key.replace('placeholder_', '')}`];
            if (translation) el.placeholder = translation;
        });

        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = translations[key] || translations[`ev_${key}`];
            if (translation) el.title = translation;
        });

        document.documentElement.lang = lang;
        localStorage.setItem('preferred-lang', lang);

        // Update active state in UI
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });

        // Trigger custom event for specific pages (like event creator)
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang, translations } }));
        
    } catch (error) {
        console.error('Error loading language:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferred-lang') || 'en';
    loadLanguage(savedLang);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            loadLanguage(btn.getAttribute('data-lang'));
        });
    });
});