(function() {
    // --- Canvas State Variables ---
    let mapImage = null, circleImageTop = null, circleImageBottom = null, logoImage = null, backgroundImage = null, detailImage = null;
    let watermarkImage = new Image();
    watermarkImage.src = './assets/images/cr.png';
    let imageX = 0, imageY = 0, imageScale = 1;
    let circleImageXTop = 0, circleImageYTop = 0, circleImageScaleTop = 1;
    let circleImageXBottom = 0, circleImageYBottom = 0, circleImageScaleBottom = 1;
    let detailImageX = 0, detailImageY = 0, detailImageScale = 1;
    let isDragging = false, isDraggingTop = false, isDraggingBottom = false, isDraggingDetail = false;
    let startX, startY;

    // --- I18n & Region State ---
    let currentLangData = {};
    let selectedRegion = 'hispano'; // Default region

    const dom = {
        localTimeDisplay: document.getElementById('local-time-display'),
        gameTimeDisplay: document.getElementById('game-time-display'),
        gameTimeEmoji: document.getElementById('game-time-emoji'),
        customDate: document.getElementById("custom-date"),
        customTime: document.getElementById("custom-time"),
        departureTimeOffset: document.getElementById("departure-time-offset"),
        customEventName: document.getElementById("custom-event-name"),
        customEventLink: document.getElementById("custom-event-link"),
        customStartPlace: document.getElementById("custom-start-place"),
        customDestination: document.getElementById("custom-destination"),
        customServer: document.getElementById("custom-server"),
        customEventDescription: document.getElementById("custom-event-description"),
        mapUpload: document.getElementById("map-upload"),
        circleUploadTop: document.getElementById("circle-upload-top"),
        circleUploadBottom: document.getElementById("circle-upload-bottom"),
        logoUpload: document.getElementById("logo-upload"),
        backgroundUpload: document.getElementById("background-upload"),
        detailUpload: document.getElementById("detail-upload"),
        mapCanvas: document.getElementById("map-canvas"),
        downloadCanvas: document.getElementById("download-canvas"),
        copyCustomInfo: document.getElementById("copy-custom-info"),
        resetCanvas: document.getElementById("reset-canvas"),
        textSize: document.getElementById("text-size"),
        textAlign: document.getElementById("text-align"),
        textStyle: document.getElementById("text-style"),
        langSelector: document.getElementById("lang-selector"),
        regionSelect: document.getElementById("region-select"),
        helpLink: document.getElementById("helpLink"),
        diceModal: document.getElementById("diceModal"),
        closeButton: document.querySelector(".close-button"),
        cube: document.getElementById("cube"),
    };

    const timezoneRegions = {
        hispano: {
            name: 'region_hispano',
            zones: [
                { offset: -6, key: 'tz_mx_gt_hn_cr' },
                { offset: -5, key: 'tz_pe_ec_co' },
                { offset: -4.5, key: 'tz_ve' },
                { offset: -4, key: 'tz_bo_cl_py' },
                { offset: -3, key: 'tz_uy_ar_br' },
                { offset: 1, key: 'tz_es' }
            ]
        },
        lusofono: {
            name: 'region_lusofono',
            zones: [
                { offset: -4, key: 'tz_br_manaus' },
                { offset: -3, key: 'tz_br_brasilia' },
                { offset: 0, key: 'tz_pt_gw' },
                { offset: 1, key: 'tz_es_ma_ao' },
                { offset: 2, key: 'tz_mz' }
            ]
        },
        north_america: {
            name: 'region_north_america',
            zones: [
                { offset: -8, key: 'tz_us_pst' },
                { offset: -7, key: 'tz_us_mst' },
                { offset: -6, key: 'tz_us_cst' },
                { offset: -5, key: 'tz_us_est' },
                { offset: 0, key: 'tz_gb' }
            ]
        },
        europe: {
            name: 'region_europe',
            zones: [
                { offset: 0, key: 'tz_pt_gb_ie' },
                { offset: 1, key: 'tz_es_fr_it_de_pl' },
                { offset: 2, key: 'tz_gr_fi' },
                { offset: 3, key: 'tz_ru_tr' }
            ]
        }
    };

    function getGameTime(utcDate) {
        const GAME_TIME_ANCHOR_UTC_MINUTES = 20 * 60 + 40;
        const TIME_SCALE = 6;
        const totalMinutesUTC = utcDate.getUTCHours() * 60 + utcDate.getUTCMinutes();
        let realMinutesSinceAnchor = totalMinutesUTC - GAME_TIME_ANCHOR_UTC_MINUTES;
        if (realMinutesSinceAnchor < 0) { realMinutesSinceAnchor += 24 * 60; }
        let gameMinutes = realMinutesSinceAnchor * TIME_SCALE;
        gameMinutes = gameMinutes % 1440;
        const gameHours = Math.floor(gameMinutes / 60);
        const remainingMinutes = Math.floor(gameMinutes % 60);
        return { hours: gameHours, minutes: remainingMinutes };
    }

    function updateLiveClocks() {
        const now = new Date();
        dom.localTimeDisplay.textContent = now.toLocaleTimeString();
        const gameTime = getGameTime(now);
        const gameHours = pad(gameTime.hours);
        const gameMinutes = pad(gameTime.minutes);
        dom.gameTimeDisplay.textContent = `${gameHours}:${gameMinutes}`;
        dom.gameTimeEmoji.textContent = getDetailedDayNightIcon(gameTime.hours);
    }

    function getDetailedDayNightIcon(hours) {
        if (hours >= 6 && hours < 8) return '🌅';
        if (hours >= 8 && hours < 19) return '☀️';
        if (hours >= 19 && hours < 21) return '🌇';
        return '🌙';
    }

    function pad(n) { return n < 10 ? "0" + n : n; }

    function drawCanvas() {

    }

    function init() {
        twemoji.parse(document.body);

        // --- Language Emoji Selector Logic ---
        dom.langSelector.addEventListener("click", (e) => {
            if (e.target.classList.contains("flag-emoji")) {
                const lang = e.target.dataset.lang;
                loadLanguage(lang);
                document.querySelectorAll(".flag-emoji").forEach(f => f.classList.remove('selected'));
                e.target.classList.add('selected');
            }
        });

        // --- Region Select Dropdown Logic ---
        for (const regionKey in timezoneRegions) {
            const option = document.createElement('option');
            option.value = regionKey;
            option.setAttribute('data-i18n', timezoneRegions[regionKey].name);
            option.textContent = regionKey; // Fallback text
            dom.regionSelect.appendChild(option);
        }
        dom.regionSelect.addEventListener('change', (e) => {
            selectedRegion = e.target.value;
            drawCanvas();
        });

        // Form Inputs
        const formInputs = [
            dom.customDate, dom.customTime, dom.departureTimeOffset, dom.customEventName, 
            dom.customEventLink, dom.customStartPlace, dom.customDestination, dom.customServer, 
            dom.customEventDescription, dom.textSize, dom.textAlign, dom.textStyle
        ];
        formInputs.forEach(input => {
            input.addEventListener('change', drawCanvas);
            input.addEventListener('input', drawCanvas);
        });

        updateLiveClocks();
        setInterval(updateLiveClocks, 1000);

        loadLanguage('es'); // Initial load
    }

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

    window.onload = init;
})();