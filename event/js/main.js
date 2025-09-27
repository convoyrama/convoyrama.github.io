(function() {
    // --- Canvas State Variables ---
    let mapImage = null, circleImageTop = null, circleImageBottom = null, logoImage = null;
    let watermarkImage = new Image();
    watermarkImage.src = './assets/images/cr.png';
    let imageX = 0, imageY = 0, imageScale = 1;
    let circleImageXTop = 0, circleImageYTop = 0, circleImageScaleTop = 1;
    let circleImageXBottom = 0, circleImageYBottom = 0, circleImageScaleBottom = 1;
    let isDragging = false, isDraggingTop = false, isDraggingBottom = false;
    let startX, startY;

    // --- I18n & Region State ---
    let currentLangData = {};
    let selectedRegion = 'hispano'; // Default region

    const languages = [
        { code: 'es', name: 'Español' },
        { code: 'en', name: 'English' },
        { code: 'pt', name: 'Português' }
    ];
    let currentLangIndex = 0;

    const dom = {
        localTimeDisplay: document.getElementById('local-time-display'),
        gameTimeDisplay: document.getElementById('game-time-display'),
        gameTimeEmoji: document.getElementById('game-time-emoji'),
        customDate: document.getElementById("custom-date"),
        customTime: document.getElementById("custom-time"),
        customDateDisplay: document.getElementById("custom-date-display"),
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
        mapCanvas: document.getElementById("map-canvas"),
        circleCanvasTop: document.getElementById("circle-canvas-top"),
        circleCanvasBottom: document.getElementById("circle-canvas-bottom"),
        downloadCanvas: document.getElementById("download-canvas"),
        copyCustomInfo: document.getElementById("copy-custom-info"),
        textSize: document.getElementById("text-size"),
        textAlign: document.getElementById("text-align"),
        textStyle: document.getElementById("text-style"),
        textBackground: document.getElementById("text-background"),
        copyMessage: document.getElementById("copy-message"),
        zoomIn: document.getElementById("zoom-in"),
        zoomOut: document.getElementById("zoom-out"),
        zoomInTop: document.getElementById("zoom-in-top"),
        zoomOutTop: document.getElementById("zoom-out-top"),
        zoomInBottom: document.getElementById("zoom-in-bottom"),
        zoomOutBottom: document.getElementById("zoom-out-bottom"),
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
    function formatTime(d) { return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
    function formatDateForDisplay(d) {
        const months = currentLangData.months || ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
    }
    function getUnixTimestamp(date) { return Math.floor(date.getTime() / 1000); }
    function showCopyMessage(message = "¡Información copiada al portapapeles!") {
        dom.copyMessage.textContent = message;
        dom.copyMessage.style.display = "block";
        setTimeout(() => { dom.copyMessage.style.display = "none"; }, 2000);
    }

    function drawCanvas() {
        const canvas = dom.mapCanvas;
        const ctx = canvas.getContext("2d");
        const textAlign = dom.textAlign.value, textSize = parseInt(dom.textSize.value), textStyle = dom.textStyle.value, textBackground = dom.textBackground.value;
        const customDateValue = dom.customDate.value, customTimeValue = dom.customTime.value, customEventNameValue = dom.customEventName.value || "Evento Personalizado";
        const customStartPlaceValue = dom.customStartPlace.value || "Sin especificar", customDestinationValue = dom.customDestination.value || "Sin especificar", customServerValue = dom.customServer.value || "Sin especificar";

        canvas.width = 1920;
        canvas.height = 1080;
        ctx.fillStyle = "#333";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (mapImage) ctx.drawImage(mapImage, imageX, imageY, mapImage.width * imageScale, mapImage.height * imageScale);
        if (watermarkImage.complete && watermarkImage.naturalWidth !== 0) {
            ctx.globalAlpha = 0.1;
            ctx.drawImage(watermarkImage, (canvas.width - watermarkImage.width * 0.5) / 2, canvas.height - watermarkImage.height * 0.5 - 20, watermarkImage.width * 0.5, watermarkImage.height * 0.5);
            ctx.globalAlpha = 1.0;
        }

        const textColor = "rgb(240,240,240)", shadowColor = textStyle === "white-on-black" ? "rgba(0,0,0,0.8)" : "rgb(90,165,25)", bgColor = "rgba(0,0,0,0.35)";
        ctx.shadowColor = shadowColor;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 10;
        ctx.font = `bold ${textSize + 10}px Arial`;
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        const eventName = customEventNameValue, eventDate = customDateValue ? formatDateForDisplay(new Date(customDateValue)) : "Fecha no seleccionada";
        ctx.fillText(eventName, canvas.width / 2, 50);
        ctx.fillText(eventDate, canvas.width / 2, 50 + (textSize + 15));

        ctx.font = `bold ${textSize}px Arial`;
        ctx.textAlign = "left";
        const textLines = [
            `${currentLangData.canvas_server || 'Servidor:'} ${customServerValue}`,
            `${currentLangData.canvas_departure || 'Partida:'} ${customStartPlaceValue}`,
            `${currentLangData.canvas_destination || 'Destino:'} ${customDestinationValue}`,
            "",
            currentLangData.canvas_meeting_time || 'Hora de reunión / Hora de partida:'
        ];
        let localStart = null;
        if (customDateValue && customTimeValue) {
            const [hh, mm] = customTimeValue.split(":").map(Number);
            const customDateObj = new Date(customDateValue);
            customDateObj.setHours(hh, mm, 0, 0);
            const userOffset = -3;
            const utcBase = new Date(customDateObj.getTime() - userOffset * 3600000);
            localStart = new Date(utcBase.getTime() + userOffset * 3600000);
        }

        const activeTimezoneGroup = timezoneRegions[selectedRegion].zones;
        activeTimezoneGroup.forEach(tz => {
            const tzLabel = currentLangData[tz.key] || `UTC${tz.offset}`;
            if (localStart) {
                const userOffset = -3;
                const reunionTime = new Date(localStart.getTime() - (userOffset - tz.offset) * 3600000);
                const partidaTime = new Date(reunionTime.getTime() + 15 * 60000);
                textLines.push(`${tzLabel}: ${formatTime(reunionTime)} / ${formatTime(partidaTime)}`);
            } else {
                textLines.push(`${tzLabel}: N/A`);
            }
        });

        if (localStart) {
            const gameTime = getGameTime(localStart);
            const gameTimeString = `${pad(gameTime.hours)}:${pad(gameTime.minutes)}`;
            const emoji = getDetailedDayNightIcon(gameTime.hours);
            textLines.push("");
            textLines.push(`${currentLangData.canvas_ingame_time || 'Hora In-Game:'} ${gameTimeString} ${emoji}`);
        }

        const textX = 20, lineHeight = textSize + 15;
        let textY = textAlign === "top-left" ? 100 + (textSize + 15) : canvas.height - (textLines.length * lineHeight) - 20;
        if (textBackground === "with-background") {
            const textWidth = Math.max(...textLines.map(line => ctx.measureText(line).width)) + 20;
            const textHeight = textLines.length * lineHeight + 10;
            ctx.fillStyle = bgColor;
            ctx.fillRect(textX - 10, textY - lineHeight + 5, textWidth, textHeight);
        }
        ctx.fillStyle = textColor;
        textLines.forEach((line, index) => ctx.fillText(line, textX, textY + (index * lineHeight)));

        const circleCanvasTop = dom.circleCanvasTop, circleCanvasBottom = dom.circleCanvasBottom;
        const circleCtxTop = circleCanvasTop.getContext("2d"), circleCtxBottom = circleCanvasBottom.getContext("2d");
        const circleDiameter = 360;
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

        const circleX = canvas.width - circleDiameter - 10, topY = 10, bottomY = canvas.height - circleDiameter - 10;
        ctx.drawImage(circleCanvasTop, circleX, topY, circleDiameter, circleDiameter);
        ctx.drawImage(circleCanvasBottom, circleX, bottomY, circleDiameter, circleDiameter);
        ctx.beginPath();
        ctx.arc(circleX + circleDiameter / 2, topY + circleDiameter / 2, circleDiameter / 2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgb(90,165,25)"; ctx.lineWidth = 6; ctx.stroke();
        ctx.beginPath();
        ctx.arc(circleX + circleDiameter / 2, bottomY + circleDiameter / 2, circleDiameter / 2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgb(90,165,25)"; ctx.lineWidth = 6; ctx.stroke();
        ctx.font = `bold 40px Arial`;
        ctx.fillStyle = "rgb(90,165,25)";
        ctx.textAlign = "center";
        ctx.shadowBlur = 0;
        ctx.fillText("Partida", circleX + circleDiameter / 2, topY + circleDiameter + 50);
        ctx.fillText("Destino", circleX + circleDiameter / 2, bottomY - 20);
        ctx.shadowBlur = 10;

        if (logoImage) {
            const logoHeight = 100, logoWidth = logoImage.width * (logoHeight / logoImage.height);
            ctx.font = `bold ${textSize + 10}px Arial`;
            const nameWidth = ctx.measureText(eventName).width, dateWidth = ctx.measureText(eventDate).width, maxTitleWidth = Math.max(nameWidth, dateWidth);
            const titleY = 50, dateY = 50 + (textSize + 15), logoY = (titleY + dateY) / 2 - (logoHeight / 2);
            const centerX = canvas.width / 2, leftX = centerX - (maxTitleWidth / 2) - logoWidth - 20, rightX = centerX + (maxTitleWidth / 2) + 20;
            ctx.drawImage(logoImage, leftX, logoY, logoWidth, logoHeight);
            ctx.drawImage(logoImage, rightX, logoY, logoWidth, logoHeight);
        }
    }

    function init() {
        // --- Language Stepper Logic ---
        const langPrevBtn = document.getElementById('lang-prev');
        const langNextBtn = document.getElementById('lang-next');
        const langCurrentSpan = document.getElementById('lang-current');

        function updateLanguage() {
            const lang = languages[currentLangIndex];
            langCurrentSpan.textContent = lang.name;
            loadLanguage(lang.code);
        }

        langPrevBtn.addEventListener('click', () => {
            currentLangIndex = (currentLangIndex - 1 + languages.length) % languages.length;
            updateLanguage();
        });

        langNextBtn.addEventListener('click', () => {
            currentLangIndex = (currentLangIndex + 1) % languages.length;
            updateLanguage();
        });

        updateLanguage(); // Load default language on init

        const regionBtns = document.querySelectorAll(".region-btn");
        regionBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                selectedRegion = btn.getAttribute("data-region");
                regionBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                drawCanvas();
            });
        });

        updateLiveClocks();
        setInterval(updateLiveClocks, 1000);

        const userNow = new Date();
        dom.customDate.value = userNow.toISOString().split('T')[0];
        dom.customDateDisplay.textContent = `Fecha seleccionada: ${formatDateForDisplay(userNow)}`;
        dom.customDate.onchange = () => {
            const customDateObj = new Date(dom.customDate.value);
            dom.customDateDisplay.textContent = `Fecha seleccionada: ${formatDateForDisplay(customDateObj)}`;
            drawCanvas();
        };

        dom.copyCustomInfo.onclick = () => {
            const customDateValue = dom.customDate.value, customTimeValue = dom.customTime.value, customEventNameValue = dom.customEventName.value || "Evento Personalizado";
            const customEventLinkValue = dom.customEventLink.value || "https://convoyrama.github.io/events.html", customEventDescriptionValue = dom.customEventDescription.value || "Sin descripción";
            const customStartPlaceValue = dom.customStartPlace.value || "Sin especificar", customDestinationValue = dom.customDestination.value || "Sin especificar", customServerValue = dom.customServer.value || "Sin especificar";
            if (!customDateValue || !customTimeValue) { 
                showCopyMessage(currentLangData.error_no_date || "Por favor, selecciona una fecha y hora."); 
                return; 
            }
            const [hh, mm] = customTimeValue.split(":").map(Number);
            const customDateObj = new Date(customDateValue);
            customDateObj.setHours(hh, mm, 0, 0);

            const meetingTimestamp = Math.floor(customDateObj.getTime() / 1000);
            const meetingGameTime = getGameTime(customDateObj);
            const meetingEmoji = getDetailedDayNightIcon(meetingGameTime.hours);

            const departureDate = new Date(customDateObj.getTime() + 15 * 60 * 1000);
            const departureTimestamp = Math.floor(departureDate.getTime() / 1000);
            const departureGameTime = getGameTime(departureDate);
            const departureEmoji = getDetailedDayNightIcon(departureGameTime.hours);

            let convoyInfo = `[**${formatDateForDisplay(customDateObj)} - ${customEventNameValue}**](${customEventLinkValue})\nServidor: ${customServerValue}\nPartida: ${customStartPlaceValue}\nDestino: ${customDestinationValue}\n\n**Reunión:** <t:${meetingTimestamp}:F> (<t:${meetingTimestamp}:R>) ${meetingEmoji}\n**Salida:** <t:${departureTimestamp}:t> (<t:${departureTimestamp}:R>) ${departureEmoji}\n\nDescripción: ${customEventDescriptionValue}`;
            navigator.clipboard.writeText(convoyInfo).then(() => showCopyMessage()).catch(err => console.error(`[copyCustomInfo] Error al copiar: ${err.message}`));
        };

        const canvas = dom.mapCanvas;
        canvas.addEventListener("mousedown", (e) => { if (mapImage) { isDragging = true; startX = e.offsetX - imageX; startY = e.offsetY - imageY; } });
        canvas.addEventListener("mousemove", (e) => { if (isDragging && mapImage) { imageX = e.offsetX - startX; imageY = e.offsetY - startY; drawCanvas(); } });
        canvas.addEventListener("mouseup", () => { isDragging = false; });
        canvas.addEventListener("mouseleave", () => { isDragging = false; });

        const circleCanvasTop = dom.circleCanvasTop;
        circleCanvasTop.addEventListener("mousedown", (e) => { if (circleImageTop) { isDraggingTop = true; startX = e.offsetX - circleImageXTop; startY = e.offsetY - circleImageYTop; } });
        circleCanvasTop.addEventListener("mousemove", (e) => { if (isDraggingTop && circleImageTop) { circleImageXTop = e.offsetX - startX; circleImageYTop = e.offsetY - startY; drawCanvas(); } });
        circleCanvasTop.addEventListener("mouseup", () => { isDraggingTop = false; });
        circleCanvasTop.addEventListener("mouseleave", () => { isDraggingTop = false; });

        const circleCanvasBottom = dom.circleCanvasBottom;
        circleCanvasBottom.addEventListener("mousedown", (e) => { if (circleImageBottom) { isDraggingBottom = true; startX = e.offsetX - circleImageXBottom; startY = e.offsetY - circleImageYBottom; } });
        circleCanvasBottom.addEventListener("mousemove", (e) => { if (isDraggingBottom && circleImageBottom) { circleImageXBottom = e.offsetX - startX; circleImageYBottom = e.offsetY - startY; drawCanvas(); } });
        circleCanvasBottom.addEventListener("mouseup", () => { isDraggingBottom = false; });
        circleCanvasBottom.addEventListener("mouseleave", () => { isDraggingBottom = false; });

        dom.mapUpload.addEventListener("change", (e) => { const file = e.target.files[0]; if (file) { mapImage = new Image(); mapImage.onload = () => { imageX = 0; imageY = 0; imageScale = 1; drawCanvas(); }; mapImage.src = URL.createObjectURL(file); } else { mapImage = null; drawCanvas(); } });
        dom.circleUploadTop.addEventListener("change", (e) => { const file = e.target.files[0]; if (file) { circleImageTop = new Image(); circleImageTop.onload = () => { circleImageXTop = 0; circleImageYTop = 0; circleImageScaleTop = 1; drawCanvas(); }; circleImageTop.src = URL.createObjectURL(file); } else { circleImageTop = null; drawCanvas(); } });
        dom.circleUploadBottom.addEventListener("change", (e) => { const file = e.target.files[0]; if (file) { circleImageBottom = new Image(); circleImageBottom.onload = () => { circleImageXBottom = 0; circleImageYBottom = 0; circleImageScaleBottom = 1; drawCanvas(); }; circleImageBottom.src = URL.createObjectURL(file); } else { circleImageBottom = null; drawCanvas(); } });
        dom.logoUpload.addEventListener("change", (e) => { const file = e.target.files[0]; if (file) { logoImage = new Image(); logoImage.onload = () => { drawCanvas(); }; logoImage.src = URL.createObjectURL(file); } else { logoImage = null; drawCanvas(); } });

        dom.zoomIn.addEventListener("click", () => { if (mapImage) { imageScale *= 1.2; drawCanvas(); } });
        dom.zoomOut.addEventListener("click", () => { if (mapImage) { imageScale /= 1.2; drawCanvas(); } });
        dom.zoomInTop.addEventListener("click", () => { if (circleImageTop) { circleImageScaleTop *= 1.2; drawCanvas(); } });
        dom.zoomOutTop.addEventListener("click", () => { if (circleImageTop) { circleImageScaleTop /= 1.2; drawCanvas(); } });
        dom.zoomInBottom.addEventListener("click", () => { if (circleImageBottom) { circleImageScaleBottom *= 1.2; drawCanvas(); } });
        dom.zoomOutBottom.addEventListener("click", () => { if (circleImageBottom) { circleImageScaleBottom /= 1.2; drawCanvas(); } });

        dom.textAlign.addEventListener("change", drawCanvas);
        dom.textSize.addEventListener("change", drawCanvas);
        dom.textStyle.addEventListener("change", drawCanvas);
        dom.textBackground.addEventListener("change", drawCanvas);

        dom.downloadCanvas.addEventListener("click", () => {
            const canvas = dom.mapCanvas;
            const link = document.createElement("a");
            link.download = "convoy-map.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        });

        dom.customEventName.addEventListener("input", drawCanvas);
        dom.customStartPlace.addEventListener("input", drawCanvas);
        dom.customDestination.addEventListener("input", drawCanvas);
        dom.customServer.addEventListener("input", drawCanvas);
        dom.customTime.addEventListener("input", drawCanvas);

        drawCanvas();
    }

    async function fetchLanguage(lang) {
        const response = await fetch(`./event/locales/${lang}.json`);
        return await response.json();
    }

    function applyTranslations(langData) {
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
        currentLangData = await fetchLanguage(lang);
        applyTranslations(currentLangData);
        drawCanvas(); // Redraw canvas with new language
    }

    window.onload = init;
})();
