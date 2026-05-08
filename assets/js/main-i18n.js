async function loadLanguage(lang) {
    try {
        const response = await fetch(`./locales/${lang}.json`);
        const translations = await response.json();
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[key]) {
                el.innerText = translations[key];
            }
        });

        document.documentElement.lang = lang;
        localStorage.setItem('preferred-lang', lang);

        // Update active state in UI
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    } catch (error) {
        console.error('Error loading language:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferred-lang') || 'en';
    loadLanguage(savedLang);

    // Setup language switchers if they exist
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = btn.getAttribute('data-lang');
            loadLanguage(lang);
        });
    });
});