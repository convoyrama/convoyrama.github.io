export const config = {
    baseWidth: 800,
    baseHeight: 500,
    color: "rgb(240, 240, 240)",
    flagSize: 100,
    photoX: 45,
    photoY: 80,
    labelX: 120,
    textX: 325,
    textY: 314,
    qrY: 101,
    font: "'Verdana', sans-serif",
    defaultPhotoSize: 192,
  qrSize: 100,
    qrSpacing: 10,
    promodsX: 20,
    promodsY: 314,
    dbusworldX: 20,
    dbusworldY: 374,
    logoWidth: 80,
    logoHeight: 60,
    vtcLogoSize: 100,
    titleFontSize: 30,
    textFontSize: 24,
    footerFontSize: 22,
    watermarkWidth: 144,
    watermarkHeight: 144,
    lineHeight: 28
};

export const BASE_URL = 'https://convoyrama.github.io/';

export const translations = {};

export async function loadTranslations() {
    try {
        const [enRes, esRes, ptRes] = await Promise.all([
            fetch(`${BASE_URL}license_generator/locales/en.json`),
            fetch(`${BASE_URL}license_generator/locales/es.json`),
            fetch(`${BASE_URL}license_generator/locales/pt.json`),
        ]);
        const [enData, esData, ptData] = await Promise.all([
            enRes.json(),
            esRes.json(),
            ptRes.json(),
        ]);
        translations.en = enData;
        translations.es = esData;
        translations.pt = ptData;
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}
