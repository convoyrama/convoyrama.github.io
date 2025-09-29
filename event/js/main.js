import { pad, formatTime, formatDateForDisplay, formatDateForDisplayShort, getUnixTimestamp, showCopyMessage, wrapText } from './utils.js';
import { currentLangData, fetchLanguage, applyTranslations, loadLanguage } from './i18n.js';
import { timezoneRegions, getGameTime, updateLiveClocks, getDetailedDayNightIcon } from './time.js';
import { drawCanvas } from './canvas.js';

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

    function init() {
        twemoji.parse(document.body);
        updateLiveClocks();
        setInterval(updateLiveClocks, 1000);
        loadLanguage('es'); // Initial load
                        // Text Controls
        dom.textAlign.addEventListener("change", drawCanvas);
        dom.textSize.addEventListener("change", drawCanvas);
        dom.textStyle.addEventListener("change", drawCanvas);
        dom.textBackgroundOpacity.addEventListener("change", drawCanvas);
        dom.textAlign.addEventListener("change", drawCanvas);
        dom.textSize.addEventListener("change", drawCanvas);
        dom.textStyle.addEventListener("change", drawCanvas);
        dom.textBackgroundOpacity.addEventListener("change", drawCanvas);
        dom.textAlign.addEventListener("change", drawCanvas);
        dom.textSize.addEventListener("change", drawCanvas);
        dom.textStyle.addEventListener("change", drawCanvas);
        dom.textBackgroundOpacity.addEventListener("change", drawCanvas);
        drawCanvas(); // Initial draw
    }

    window.onload = init;
})();