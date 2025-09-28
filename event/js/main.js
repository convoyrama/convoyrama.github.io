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

    function handleImageUpload(e, imageType) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                switch (imageType) {
                    case 'map': mapImage = img; break;
                    case 'circleTop': circleImageTop = img; break;
                    case 'circleBottom': circleImageBottom = img; break;
                    case 'logo': logoImage = img; break;
                    case 'background': backgroundImage = img; break;
                    case 'detail': detailImage = img; break;
                }
                drawCanvas();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function downloadCanvas() {
        const canvas = dom.mapCanvas;
        const link = document.createElement("a");
        let date = new Date();
        const customDateValue = dom.customDate.value;
        if (customDateValue) {
            date = new Date(customDateValue);
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        link.download = `convoy-map-${day}-${month}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }

    function copyCustomInfo() {
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

        const departureOffset = parseInt(dom.departureTimeOffset.value, 10) * 60 * 1000;
        const departureDate = new Date(customDateObj.getTime() + departureOffset);
        const departureTimestamp = Math.floor(departureDate.getTime() / 1000);
        const departureGameTime = getGameTime(departureDate);
        const departureEmoji = getDetailedDayNightIcon(departureGameTime.hours);

        let convoyInfo = `[**${formatDateForDisplay(customDateObj)} - ${customEventNameValue}**](${customEventLinkValue})\nServidor: ${customServerValue}\nPartida: ${customStartPlaceValue}\nDestino: ${customDestinationValue}\n\n**Reunión:** <t:${meetingTimestamp}:F> (<t:${meetingTimestamp}:R>) ${meetingEmoji}\n**Salida:** <t:${departureTimestamp}:t> (<t:${departureTimestamp}:R>) ${departureEmoji}\n\nDescripción: ${customEventDescriptionValue}`;
        navigator.clipboard.writeText(convoyInfo).then(() => showCopyMessage()).catch(err => console.error(`[copyCustomInfo] Error al copiar: ${err.message}`));
    }

    function resetCanvas() {
        mapImage = null;
        circleImageTop = null;
        circleImageBottom = null;
        logoImage = null;
        backgroundImage = null;
        detailImage = null;

        dom.mapUpload.value = "";
        dom.circleUploadTop.value = "";
        dom.circleUploadBottom.value = "";
        dom.logoUpload.value = "";
        dom.backgroundUpload.value = "";
        dom.detailUpload.value = "";

        drawCanvas();
    }

    function drawCanvas() {
        const canvas = dom.mapCanvas;
        const ctx = canvas.getContext("2d");
        const textAlign = dom.textAlign.value, textSize = parseInt(dom.textSize.value), textStyle = dom.textStyle.value, textBackgroundOpacity = dom.textBackgroundOpacity.value;
        const customDateValue = dom.customDate.value, customTimeValue = dom.customTime.value, customEventNameValue = dom.customEventName.value || (currentLangData.canvas_default_event_name || "Evento Personalizado");
        const customStartPlaceValue = dom.customStartPlace.value || "Sin especificar", customDestinationValue = dom.customDestination.value || "Sin especificar", customServerValue = dom.customServer.value || "Sin especificar";

        // 1. Draw background color or image
        canvas.width = 1920;
        canvas.height = 1080;
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

        // --- Draw Logo ---
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
        }
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

        dom.textAlign.addEventListener("change", drawCanvas);
        dom.textSize.addEventListener("change", drawCanvas);
        dom.textStyle.addEventListener("change", drawCanvas);
        dom.textBackgroundOpacity.addEventListener("change", drawCanvas);

        dom.downloadCanvas.addEventListener("click", () => {
            const canvas = dom.mapCanvas;
            const link = document.createElement("a");
            let date = new Date();
            const customDateValue = dom.customDate.value;
            if (customDateValue) {
                date = new Date(customDateValue);
            }
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            link.download = `convoy-map-${day}-${month}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        });

        dom.customEventName.addEventListener("input", drawCanvas);
        dom.customStartPlace.addEventListener("input", drawCanvas);
        dom.customDestination.addEventListener("input", drawCanvas);
        dom.customServer.addEventListener("input", drawCanvas);
        dom.customTime.addEventListener("input", drawCanvas);
        dom.departureTimeOffset.addEventListener("change", drawCanvas);

        dom.resetCanvas.addEventListener("click", () => {
            mapImage = null;
            circleImageTop = null;
            circleImageBottom = null;
            logoImage = null;
            backgroundImage = null;
            detailImage = null;

            dom.mapUpload.value = "";
            dom.circleUploadTop.value = "";
            dom.circleUploadBottom.value = "";
            dom.logoUpload.value = "";
            dom.backgroundUpload.value = "";
            dom.detailUpload.value = "";

            drawCanvas();
        });

        drawCanvas();
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
        currentLangData = await fetchLanguage(lang);
        applyTranslations(currentLangData);
        drawCanvas(); // Redraw canvas with new language
    }

    window.onload = init;
})();