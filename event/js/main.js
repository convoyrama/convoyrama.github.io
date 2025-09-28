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
        const canvas = dom.mapCanvas;
        const ctx = canvas.getContext("2d");

        canvas.width = 1920;
        canvas.height = 1080;

                // 1. Draw background color or image
        if (backgroundImage) {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#333";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Draw map image
        if (mapImage) ctx.drawImage(mapImage, imageX, imageY, mapImage.width * imageScale, mapImage.height * imageScale);
        
        // 3. Draw watermark
        if (watermarkImage.complete && watermarkImage.naturalWidth !== 0) {
            ctx.globalAlpha = 0.1;
            ctx.drawImage(watermarkImage, (canvas.width - watermarkImage.width * 0.5) / 2, canvas.height - watermarkImage.height * 0.5 - 20, watermarkImage.width * 0.5, watermarkImage.height * 0.5);
            ctx.globalAlpha = 1.0;
        }

        // --- Text Styles ---
        let textFill = "rgb(240,240,240)";
        let shadowColor = "rgba(0,0,0,0.8)";

        switch (textStyle) {
            case "classic":
                // default is classic
                break;
            case "convoy":
                shadowColor = "rgb(90,165,25)";
                break;
            case "neon_blue":
                shadowColor = "#00FFFF";
                break;
            case "neon_pink":
                shadowColor = "#FF00FF";
                break;
            case "neon_red":
                shadowColor = "#FF0000";
                break;
            case "inverse":
                textFill = "rgb(0,0,0)";
                shadowColor = "rgb(240,240,240)";
                break;
            case "fire":
                const fireGradient = ctx.createLinearGradient(0, 0, 0, textSize + 10);
                fireGradient.addColorStop(0, "yellow");
                fireGradient.addColorStop(1, "red");
                textFill = fireGradient;
                shadowColor = "rgba(0,0,0,0.8)";
                break;
            case "ice":
                const iceGradient = ctx.createLinearGradient(0, 0, 0, textSize + 10);
                iceGradient.addColorStop(0, "#B0E0E6");
                iceGradient.addColorStop(1, "#4682B4");
                textFill = iceGradient;
                shadowColor = "rgba(0,0,0,0.8)";
                break;
            case "retro":
                textFill = "#FF69B4"; // Hot Pink
                shadowColor = "#00FFFF"; // Cyan
                break;
            case "womens_day":
                const womensDayGradient = ctx.createLinearGradient(0, 0, 0, textSize + 10);
                womensDayGradient.addColorStop(0, "#FFC0CB");
                womensDayGradient.addColorStop(1, "#800080");
                textFill = womensDayGradient;
                shadowColor = "rgba(0,0,0,0.8)";
                break;
            case "gold":
                const goldGradient = ctx.createLinearGradient(0, 0, 0, textSize + 10);
                goldGradient.addColorStop(0, "#FFD700");
                goldGradient.addColorStop(1, "#B8860B");
                textFill = goldGradient;
                shadowColor = "rgba(0,0,0,0.8)";
                break;
            case "rainbow":
                const rainbowGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                rainbowGradient.addColorStop(0, "red");
                rainbowGradient.addColorStop(0.15, "orange");
                rainbowGradient.addColorStop(0.3, "yellow");
                rainbowGradient.addColorStop(0.45, "green");
                rainbowGradient.addColorStop(0.6, "blue");
                rainbowGradient.addColorStop(0.75, "indigo");
                rainbowGradient.addColorStop(0.9, "violet");
                textFill = rainbowGradient;
                shadowColor = "rgba(0,0,0,0.8)";
                break;
            case "hacker":
                textFill = "#00FF00"; // Green
                shadowColor = "rgba(0,0,0,0)"; // No shadow
                break;
            case "love":
                const loveGradient = ctx.createLinearGradient(0, 0, 0, textSize + 10);
                loveGradient.addColorStop(0, "#FFC0CB");
                loveGradient.addColorStop(1, "#FF0000");
                textFill = loveGradient;
                shadowColor = "rgba(0,0,0,0.8)";
                break;
            case "toxic":
                textFill = "#7CFC00"; // LawnGreen
                shadowColor = "#006400"; // DarkGreen
                break;
            case "cyberpunk":
                textFill = "#FFFF00"; // Yellow
                shadowColor = "#FF00FF"; // Magenta
                break;
            case "vaporwave":
                textFill = "#FF69B4"; // HotPink
                shadowColor = "#00FFFF"; // Cyan
                break;
        }

        const bgColor = `rgba(20, 20, 20, ${textBackgroundOpacity})`;
        ctx.shadowColor = shadowColor;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 10;
        
        // --- Draw Title ---
        ctx.font = `bold ${textSize + 10}px Arial`;
        ctx.textAlign = "center";
        const eventName = customEventNameValue;
        const eventNameMetrics = ctx.measureText(eventName);
        const eventNameWidth = eventNameMetrics.width;
        const eventNameHeight = eventNameMetrics.actualBoundingBoxAscent + eventNameMetrics.actualBoundingBoxDescent;
        ctx.fillStyle = bgColor;
        ctx.fillRect((canvas.width - eventNameWidth) / 2 - 10, 60 - eventNameMetrics.actualBoundingBoxAscent - 10, eventNameWidth + 20, eventNameHeight + 20);
        ctx.fillStyle = textFill;
        ctx.fillText(eventName, canvas.width / 2, 60);

        // 5. Draw logo image
        let topOffset = 100;
        if (logoImage) {
            const logoHeight = 100;
            const logoWidth = logoImage.width * (logoHeight / logoImage.height);
            const logoX = (canvas.width - logoWidth) / 2;
            const logoY = 80;
            ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
            topOffset += logoHeight;
        }

        // --- Draw Text Lines ---
        ctx.font = `bold ${textSize}px Arial`;
        ctx.textAlign = "left";
        const textLines = [
            `${currentLangData.canvas_server || 'Servidor:'} ${customServerValue}`,
            `${currentLangData.canvas_departure || 'Partida:'} ${customStartPlaceValue}`,
            `${currentLangData.canvas_destination || 'Destino:'} ${customDestinationValue}`,
            "",
            currentLangData.canvas_meeting_time || 'Hora de reunión / Hora de partida:'
        ];

        if (customDateValue && customTimeValue) {
            const [hh, mm] = customTimeValue.split(":").map(Number);
            const customDateObj = new Date(customDateValue);
            customDateObj.setHours(hh, mm, 0, 0);

            const userOffsetHours = -3;
            const utcBaseTime = new Date(customDateObj.getTime() - userOffsetHours * 3600000);

            const activeTimezoneGroup = timezoneRegions[selectedRegion].zones;
            const datesByDay = new Map();

            activeTimezoneGroup.forEach(tz => {
                const localTimeForTz = new Date(utcBaseTime.getTime() + tz.offset * 3600000);
                const dayString = formatDateForDisplayShort(localTimeForTz);
                
                if (!datesByDay.has(dayString)) {
                    datesByDay.set(dayString, { times: [] });
                }
                const dayEntry = datesByDay.get(dayString);

                const tzLabel = currentLangData[tz.key] || (timezoneCountryCodes[tz.key] || [tz.key.replace('tz_', '').toUpperCase()]).join(', ');
                const reunionTime = new Date(utcBaseTime.getTime() + tz.offset * 3600000);
                const departureOffset = parseInt(dom.departureTimeOffset.value, 10) * 60000;
                const partidaTime = new Date(reunionTime.getTime() + departureOffset);
                dayEntry.times.push({ tzLabel, reunionTime: formatTime(reunionTime), partidaTime: formatTime(partidaTime) });
            });

            const monthMap = (currentLangData.months_short || ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]).reduce((acc, month, index) => {
                acc[month] = index;
                return acc;
            }, {});

            const sortedDays = Array.from(datesByDay.keys()).sort((a, b) => {
                const [dayA, monthAbbrA] = a.split(' ');
                const [dayB, monthAbbrB] = b.split(' ');
                const dateA = new Date(new Date().getFullYear(), monthMap[monthAbbrA], dayA);
                const dateB = new Date(new Date().getFullYear(), monthMap[monthAbbrB], dayB);
                return dateA - dateB;
            });

            const newTextLines = [];
            newTextLines.push(`${currentLangData.canvas_meeting_time || 'Hora de reunión / Hora de partida:'}`);

            sortedDays.forEach(dayString => {
                newTextLines.push(dayString);
                const dayEntry = datesByDay.get(dayString);
                
                dayEntry.times.forEach(timeEntry => {
                    newTextLines.push(`  ${timeEntry.tzLabel}: ${timeEntry.reunionTime} / ${timeEntry.partidaTime}`);
                });
            });

            textLines.splice(4, textLines.length - 4, ...newTextLines);
        } else {
            textLines.splice(4, textLines.length - 4);
            textLines.push(`${currentLangData.canvas_meeting_time || 'Hora de reunión / Hora de partida:'}`);
            textLines.push(`  N/A`);
        }

        const textX = 20, lineHeight = textSize + 15;
        let textY;
        if (textAlign === "top-left") {
            textY = topOffset + (textSize + 15);
        } else {
            textY = canvas.height - (textLines.length * lineHeight) - 20;
        }

        const textWidth = Math.max(...textLines.map(line => ctx.measureText(line).width)) + 20;
        const textHeight = textLines.length * lineHeight + 10;
        ctx.fillStyle = bgColor;
        ctx.fillRect(textX - 10, textY - lineHeight + 5, textWidth, textHeight);
        
        ctx.fillStyle = textFill;
        const maxTextWidth = canvas.width - textX - 20;

        textLines.forEach((line, index) => {
            let currentTextX = textX;
            let currentLineHeight = lineHeight;

            if (line.startsWith('  ')) {
                currentTextX += 15;
            }

            const wrappedLines = wrapText(ctx, line, maxTextWidth - (currentTextX - textX));

            wrappedLines.forEach((wrappedLine, wrappedIndex) => {
                ctx.fillText(wrappedLine, currentTextX, textY + (index * lineHeight) + (wrappedIndex * currentLineHeight));
            });
        });

        // --- Draw Circle Canvases ---
        const circleDiameter = 360;
        const circleX = canvas.width - circleDiameter - 10;
        const topY = 10;
        const bottomY = canvas.height - circleDiameter - 10;

        const circleCanvasTop = dom.circleCanvasTop, circleCanvasBottom = dom.circleCanvasBottom;
        const circleCtxTop = circleCanvasTop.getContext("2d"), circleCtxBottom = circleCanvasBottom.getContext("2d");
        circleCanvasTop.width = circleDiameter; circleCanvasTop.height = circleDiameter;
        circleCanvasBottom.width = circleDiameter; circleCanvasBottom.height = circleDiameter;

        circleCtxTop.clearRect(0, 0, circleDiameter, circleDiameter);
        if (circleImageTop) {
            circleCtxTop.save();
            circleCtxTop.beginPath();
            circleCtxTop.arc(circleDiameter / 2, circleDiameter / 2, circleDiameter / 2, 0, Math.PI * 2);
            circleCtxTop.clip();
            circleCtxTop.drawImage(circleImageTop, circleImageXTop, circleImageYTop, circleImageTop.width * circleImageScaleTop, circleImageTop.height * circleImageScaleTop);
            circleCtxTop.restore();
        }
        circleCtxBottom.clearRect(0, 0, circleDiameter, circleDiameter);
        if (circleImageBottom) {
            circleCtxBottom.save();
            circleCtxBottom.beginPath();
            circleCtxBottom.arc(circleDiameter / 2, circleDiameter / 2, circleDiameter / 2, 0, Math.PI * 2);
            circleCtxBottom.clip();
            circleCtxBottom.drawImage(circleImageBottom, circleImageXBottom, circleImageYBottom, circleImageBottom.width * circleImageScaleBottom, circleImageBottom.height * circleImageScaleBottom);
            circleCtxBottom.restore();
        }

        ctx.drawImage(circleCanvasTop, circleX, topY, circleDiameter, circleDiameter);
        ctx.drawImage(circleCanvasBottom, circleX, bottomY, circleDiameter, circleDiameter);
        
        ctx.beginPath();
        ctx.arc(circleX + circleDiameter / 2, topY + circleDiameter / 2, circleDiameter / 2, 0, Math.PI * 2);
        ctx.strokeStyle = "white"; ctx.lineWidth = 10; ctx.stroke();
        ctx.beginPath();
        ctx.arc(circleX + circleDiameter / 2, bottomY + circleDiameter / 2, circleDiameter / 2, 0, Math.PI * 2);
        ctx.strokeStyle = "white"; ctx.lineWidth = 10; ctx.stroke();

        // --- Draw Circle Labels ---
        ctx.font = `bold ${textSize + 10}px Arial`;
        ctx.textAlign = "center";
        const departureText = currentLangData.canvas_label_departure || "Partida";
        const destinationText = currentLangData.canvas_label_destination || "Destino";
        const circleCenterX = circleX + circleDiameter / 2;
        
        const departureTextMetrics = ctx.measureText(departureText);
        const departureTextWidth = departureTextMetrics.width;
        const departureTextHeight = departureTextMetrics.actualBoundingBoxAscent + departureTextMetrics.actualBoundingBoxDescent;
        ctx.fillStyle = bgColor;
        ctx.fillRect(circleCenterX - departureTextWidth / 2 - 10, topY + circleDiameter + 40 - departureTextMetrics.actualBoundingBoxAscent - 10, departureTextWidth + 20, departureTextHeight + 20);
        ctx.fillStyle = textFill;
        ctx.fillText(departureText, circleCenterX, topY + circleDiameter + 40);

        const destinationTextMetrics = ctx.measureText(destinationText);
        const destinationTextWidth = destinationTextMetrics.width;
        const destinationTextHeight = destinationTextMetrics.actualBoundingBoxAscent + destinationTextMetrics.actualBoundingBoxDescent;
        ctx.fillStyle = bgColor;
        ctx.fillRect(circleCenterX - destinationTextWidth / 2 - 10, bottomY - 20 - destinationTextMetrics.actualBoundingBoxAscent - 10, destinationTextWidth + 20, destinationTextHeight + 20);
        ctx.fillStyle = textFill;
        ctx.fillText(destinationText, circleCenterX, bottomY - 20);

        // --- Draw Detail Image ---
        if (detailImage) {
            ctx.drawImage(detailImage, detailImageX, detailImageY, detailImage.width * detailImageScale, detailImage.height * detailImageScale);
        } else {
            ctx.fillStyle = "#333";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    function init() {
        twemoji.parse(document.body);

        // --- Event Listeners ---

        // Controls Bar
        dom.langSelector.addEventListener("click", (e) => {
            if (e.target.classList.contains("flag-emoji")) {
                const lang = e.target.dataset.lang;
                loadLanguage(lang);
                document.querySelectorAll(".flag-emoji").forEach(f => f.classList.remove('selected'));
                e.target.classList.add('selected');
            }
        });

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

        // Image Uploads
        dom.mapUpload.addEventListener("change", (e) => { handleImageUpload(e, 'map'); });
        dom.circleUploadTop.addEventListener("change", (e) => { handleImageUpload(e, 'circleTop'); });
        dom.circleUploadBottom.addEventListener("change", (e) => { handleImageUpload(e, 'circleBottom'); });
        dom.logoUpload.addEventListener("change", (e) => { handleImageUpload(e, 'logo'); });
        dom.backgroundUpload.addEventListener("change", (e) => { handleImageUpload(e, 'background'); });
        dom.detailUpload.addEventListener("change", (e) => { handleImageUpload(e, 'detail'); });

        // Zoom Buttons
        document.getElementById("zoom-in-map").addEventListener("click", () => { if (mapImage) { imageScale *= 1.2; drawCanvas(); } });
        document.getElementById("zoom-out-map").addEventListener("click", () => { if (mapImage) { imageScale /= 1.2; drawCanvas(); } });
        document.getElementById("zoom-in-top").addEventListener("click", () => { if (circleImageTop) { circleImageScaleTop *= 1.2; drawCanvas(); } });
        document.getElementById("zoom-out-top").addEventListener("click", () => { if (circleImageTop) { circleImageScaleTop /= 1.2; drawCanvas(); } });
        document.getElementById("zoom-in-bottom").addEventListener("click", () => { if (circleImageBottom) { circleImageScaleBottom *= 1.2; drawCanvas(); } });
        document.getElementById("zoom-out-bottom").addEventListener("click", () => { if (circleImageBottom) { circleImageScaleBottom /= 1.2; drawCanvas(); } });
        document.getElementById("zoom-in-detail").addEventListener("click", () => { if (detailImage) { detailImageScale *= 1.2; drawCanvas(); } });
        document.getElementById("zoom-out-detail").addEventListener("click", () => { if (detailImage) { detailImageScale /= 1.2; drawCanvas(); } });

        // Canvas Controls
        dom.downloadCanvas.addEventListener("click", downloadCanvas);
        dom.copyCustomInfo.addEventListener("click", copyCustomInfo);
        dom.resetCanvas.addEventListener("click", resetCanvas);

        // Modal
        dom.helpLink.addEventListener('click', (e) => { e.preventDefault(); dom.diceModal.style.display = 'flex'; });
        dom.closeButton.addEventListener('click', () => { dom.diceModal.style.display = 'none'; });
        dom.diceModal.addEventListener('click', (e) => { if (e.target === dom.diceModal) dom.diceModal.style.display = 'none'; });

        // Initial Load
        loadLanguage('es');
        updateLiveClocks();
        setInterval(updateLiveClocks, 1000);
        drawCanvas(); // Initial draw
    }

    window.onload = init;

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