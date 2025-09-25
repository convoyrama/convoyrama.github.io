export const config = {
    baseWidth: 800,
    baseHeight: 500,
    color: "rgb(240, 240, 240)",
    flagSize: 80,
    photoX: 45,
    photoY: 80,
    labelX: 100,
    textX: 295,
    textY: 314,
    qrX: 573,
    qrY: 101,
    flagX: 580,
    flagY: 206,
    font: "'Verdana', sans-serif",
    defaultPhotoSize: 192,
  qrSize: 128,
    qrSpacing: 10,
    promodsX: 20,
    promodsY: 314,
    dbusworldX: 20,
    dbusworldY: 374,
    logoWidth: 67,
    logoHeight: 50,
    vtcLogoSize: 100,
    titleFontSize: 30,
    textFontSize: 24,
    footerFontSize: 22,
    watermarkWidth: 180,
    watermarkHeight: 180,
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
