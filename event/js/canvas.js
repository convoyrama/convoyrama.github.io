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

function drawCanvas() {
    const canvas = dom.mapCanvas;
    const ctx = canvas.getContext("2d");
    const textAlign = dom.textAlign.value, textSize = parseInt(dom.textSize.value), textStyle = dom.textStyle.value, textBackgroundOpacity = parseFloat(dom.textBackgroundOpacity.value);
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
        case "white-on-green":
            shadowColor = "rgb(90,165,25)";
            break;
        case "white-on-blue":
            shadowColor = "#00FFFF";
            break;
        case "white-on-pink":
            shadowColor = "#FF00FF";
            break;
        case "white-on-red":
            shadowColor = "#FF0000";
            break;
        case "black-on-white":
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
    }

    ctx.shadowColor = shadowColor;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 10;
    
    // 4. Draw event name
    ctx.font = `bold ${textSize + 10}px Arial`;
    ctx.textAlign = "center";
    const eventName = customEventNameValue;
    const eventNameMetrics = ctx.measureText(eventName);
    const eventNameWidth = eventNameMetrics.width + 40;
    const eventNameHeight = textSize + 20;
    ctx.fillStyle = `rgba(0, 0, 0, ${textBackgroundOpacity})`;
    ctx.fillRect((canvas.width - eventNameWidth) / 2, 30, eventNameWidth, eventNameHeight);
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

    // 6. Calculate textLines
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

        const userOffsetHours = new Date().getTimezoneOffset() / 60;
        const utcBaseTime = new Date(customDateObj.getTime() - (userOffsetHours * 3600000));

        const activeTimezoneGroup = timezoneRegions[selectedRegion].zones;
        const datesByDay = new Map();

        activeTimezoneGroup.forEach(tz => {
            const localTimeForTz = new Date(utcBaseTime.getUTCFullYear(), utcBaseTime.getUTCMonth(), utcBaseTime.getUTCDate(), utcBaseTime.getUTCHours() + tz.offset, utcBaseTime.getUTCMinutes());
            const dayString = formatDateForDisplayShort(localTimeForTz);
            
            if (!datesByDay.has(dayString)) {
                datesByDay.set(dayString, { times: [] });
            }
            const dayEntry = datesByDay.get(dayString);

            const tzLabel = currentLangData[tz.key] || (timezoneCountryCodes[tz.key] || [tz.key.replace('tz_', '').toUpperCase()]).join(', ');
            const reunionTime = new Date(utcBaseTime.getUTCFullYear(), utcBaseTime.getUTCMonth(), utcBaseTime.getUTCDate(), utcBaseTime.getUTCHours() + tz.offset, utcBaseTime.getUTCMinutes());
            const departureOffset = parseInt(dom.departureTimeOffset.value, 10) * 60000;
            const partidaTime = new Date(reunionTime.getTime() + departureOffset);
            dayEntry.times.push({ tzLabel, reunionTime: formatTime(reunionTime), partidaTime: formatTime(partidaTime) });
        });

        const monthMap = (currentLangData.months_short || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]).reduce((acc, month, index) => {
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

    // 7. Calculate textY
    const textX = 20, lineHeight = textSize + 15;
    let textY;
    if (textAlign === "top-left") {
        textY = topOffset + (textSize + 15);
    } else {
        textY = canvas.height - (textLines.length * lineHeight) - 20;
    }

    // 8. Draw textLines
    const textWidth = Math.max(...textLines.map(line => ctx.measureText(line).width)) + 40;
    const textHeight = textLines.length * lineHeight + 20;
    ctx.fillStyle = `rgba(0, 0, 0, ${textBackgroundOpacity})`;
    ctx.fillRect(textX - 10, textY - lineHeight, textWidth, textHeight);
    
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

    // 9. Draw circle canvases
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
    
    // 10. Draw circle borders and labels
    ctx.beginPath();
    ctx.arc(circleX + circleDiameter / 2, topY + circleDiameter / 2, circleDiameter / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "white"; ctx.lineWidth = 10; ctx.stroke();
    ctx.beginPath();
    ctx.arc(circleX + circleDiameter / 2, bottomY + circleDiameter / 2, circleDiameter / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "white"; ctx.lineWidth = 10; ctx.stroke();

    ctx.font = `bold ${textSize + 10}px Arial`;
    ctx.textAlign = "center";
    
    const departureText = currentLangData.canvas_label_departure || "Partida";
    const destinationText = currentLangData.canvas_label_destination || "Destino";

    const circleCenterX = circleX + circleDiameter / 2;
    
    const departureTextMetrics = ctx.measureText(departureText);
    const departureTextWidth = departureTextMetrics.width + 40;
    const departureTextHeight = textSize + 20;
    const departureTextY = topY + circleDiameter + 40;
    ctx.fillStyle = `rgba(0, 0, 0, ${textBackgroundOpacity})`;
    ctx.fillRect(circleCenterX - departureTextWidth / 2, departureTextY - departureTextHeight + 15, departureTextWidth, departureTextHeight);
    ctx.fillStyle = textFill;
    ctx.fillText(departureText, circleCenterX, departureTextY);

    const destinationTextMetrics = ctx.measureText(destinationText);
    const destinationTextWidth = destinationTextMetrics.width + 40;
    const destinationTextHeight = textSize + 20;
    const destinationTextY = bottomY - 20;
    ctx.fillStyle = `rgba(0, 0, 0, ${textBackgroundOpacity})`;
    ctx.fillRect(circleCenterX - destinationTextWidth / 2, destinationTextY - destinationTextHeight + 15, destinationTextWidth, destinationTextHeight);
    ctx.fillStyle = textFill;
    ctx.fillText(destinationText, circleCenterX, destinationTextY);

    // 11. Draw detail image
    if (detailImage) {
        ctx.drawImage(detailImage, detailImageX, detailImageY, detailImage.width * detailImageScale, detailImage.height * detailImageScale);
    }
}

function initCanvasEventListeners() {
    const canvas = dom.mapCanvas;
    canvas.addEventListener("mousedown", (e) => { 
        if (detailImage && e.offsetX >= detailImageX && e.offsetX <= detailImageX + detailImage.width * detailImageScale && e.offsetY >= detailImageY && e.offsetY <= detailImageY + detailImage.height * detailImageScale) {
            isDraggingDetail = true;
            startX = e.offsetX - detailImageX;
            startY = e.offsetY - detailImageY;
        } else if (mapImage) { 
            isDragging = true; 
            startX = e.offsetX - imageX; 
            startY = e.offsetY - imageY; 
        } 
    });
    canvas.addEventListener("mousemove", (e) => { 
        if (isDraggingDetail && detailImage) {
            detailImageX = e.offsetX - startX;
            detailImageY = e.offsetY - startY;
            drawCanvas();
        } else if (isDragging && mapImage) { 
            imageX = e.offsetX - startX; 
            imageY = e.offsetY - startY; 
            drawCanvas(); 
        } 
    });
    canvas.addEventListener("mouseup", () => { 
        isDragging = false; 
        isDraggingDetail = false;
    });
    canvas.addEventListener("mouseleave", () => { 
        isDragging = false; 
        isDraggingDetail = false;
    });

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
    dom.backgroundUpload.addEventListener("change", (e) => { const file = e.target.files[0]; if (file) { backgroundImage = new Image(); backgroundImage.onload = () => { drawCanvas(); }; backgroundImage.src = URL.createObjectURL(file); } else { backgroundImage = null; drawCanvas(); } });
    dom.detailUpload.addEventListener("change", (e) => { const file = e.target.files[0]; if (file) { detailImage = new Image(); detailImage.onload = () => { detailImageX = 0; detailImageY = 0; detailImageScale = 1; drawCanvas(); }; detailImage.src = URL.createObjectURL(file); } else { detailImage = null; drawCanvas(); } });

    dom.zoomIn.addEventListener("click", () => { if (mapImage) { imageScale *= 1.2; drawCanvas(); } });
    dom.zoomOut.addEventListener("click", () => { if (mapImage) { imageScale /= 1.2; drawCanvas(); } });
    dom.zoomInTop.addEventListener("click", () => { if (circleImageTop) { circleImageScaleTop *= 1.2; drawCanvas(); } });
    dom.zoomOutTop.addEventListener("click", () => { if (circleImageTop) { circleImageScaleTop /= 1.2; drawCanvas(); } });
    dom.zoomInBottom.addEventListener("click", () => { if (circleImageBottom) { circleImageScaleBottom *= 1.2; drawCanvas(); } });
    dom.zoomOutBottom.addEventListener("click", () => { if (circleImageBottom) { circleImageScaleBottom /= 1.2; drawCanvas(); } });
    dom.zoomInDetail.addEventListener("click", () => { if (detailImage) { detailImageScale *= 1.2; drawCanvas(); } });
    dom.zoomOutDetail.addEventListener("click", () => { if (detailImage) { detailImageScale /= 1.2; drawCanvas(); } });
}

