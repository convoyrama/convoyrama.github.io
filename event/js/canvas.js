import { dom } from './dom.js';
import * as state from './state.js';
import { timezoneRegions, timezoneCountryCodes } from './config.js';
import { formatTime, formatDateForDisplayShort } from './time.js';
import { wrapText } from './utils.js';

export function drawCanvas() {
    const canvas = dom.mapCanvas;
    const ctx = canvas.getContext("2d");
    const textSize = parseInt(dom.textSize.value), textStyle = dom.textStyle.value, textBackgroundOpacity = parseFloat(dom.textBackgroundOpacity.value);
    const customDateValue = dom.customDate.value, customTimeValue = dom.customTime.value, customEventNameValue = dom.customEventName.value || (state.currentLangData.canvas_default_event_name || "Evento Personalizado");
    const customStartPlaceValue = dom.customStartPlace.value || "Sin especificar", customDestinationValue = dom.customDestination.value || "Sin especificar", customServerValue = dom.customServer.value || "Sin especificar";

    canvas.width = 1920; canvas.height = 1080;
    if (state.backgroundImage) { ctx.drawImage(state.backgroundImage, 0, 0, canvas.width, canvas.height); } else { ctx.fillStyle = "#333"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    if (state.mapImage) ctx.drawImage(state.mapImage, state.imageX, state.imageY, state.mapImage.width * state.imageScale, state.mapImage.height * state.imageScale);
    if (state.watermarkImage.complete && state.watermarkImage.naturalWidth !== 0) { ctx.globalAlpha = 0.1; ctx.drawImage(state.watermarkImage, (canvas.width - state.watermarkImage.width * 0.5) / 2, canvas.height - state.watermarkImage.height * 0.5 - 20, state.watermarkImage.width * 0.5, state.watermarkImage.height * 0.5); ctx.globalAlpha = 1.0; }

    let textFill = "rgb(240,240,240)";
    let shadowColor = "rgba(0,0,0,0.8)";
    let borderColor = "white";
    ctx.shadowBlur = 10;

    switch (textStyle) {
        case "classic":
            break;
        case "mint":
            borderColor = "rgb(90,165,25)";
            shadowColor = "rgb(90,165,25)";
            break;
        case "sky":
            borderColor = "#00FFFF";
            shadowColor = "#00FFFF";
            break;
        case "bubblegum":
            borderColor = "#FF00FF";
            shadowColor = "#FF00FF";
            break;
        case "alert":
            borderColor = "#FF0000";
            shadowColor = "#FF0000";
            break;
        case "inverse":
            textFill = "rgb(0,0,0)";
            borderColor = "rgb(240,240,240)";
            shadowColor = "rgb(240,240,240)";
            break;
        case "fire":
            const fireGradient = ctx.createLinearGradient(0, 0, 0, textSize + 10);
            fireGradient.addColorStop(0, "yellow");
            fireGradient.addColorStop(1, "red");
            textFill = fireGradient;
            borderColor = "yellow";
            break;
        case "ice":
            const iceGradient = ctx.createLinearGradient(0, 0, 0, textSize + 10);
            iceGradient.addColorStop(0, "#B0E0E6");
            iceGradient.addColorStop(1, "#4682B4");
            textFill = iceGradient;
            borderColor = "#B0E0E6";
            break;
        case "retro":
            textFill = "#FF69B4";
            borderColor = "#FF69B4";
            shadowColor = "#00FFFF";
            break;
        case "womens_day":
            const womensDayGradient = ctx.createLinearGradient(0, 0, 0, textSize + 10);
            womensDayGradient.addColorStop(0, "#FFC0CB");
            womensDayGradient.addColorStop(1, "#800080");
            textFill = womensDayGradient;
            borderColor = "#FFC0CB";
            break;
        case "gold":
            const goldGradient = ctx.createLinearGradient(0, 0, 0, textSize + 10);
            goldGradient.addColorStop(0, "#FFD700");
            goldGradient.addColorStop(1, "#B8860B");
            textFill = goldGradient;
            borderColor = "#FFD700";
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
            borderColor = rainbowGradient;
            break;
        case "hacker":
            textFill = "#00FF00";
            borderColor = "#00FF00";
            shadowColor = "rgba(0,0,0,0)";
            break;
        case "love":
            const loveGradient = ctx.createLinearGradient(0, 0, 0, textSize + 10);
            loveGradient.addColorStop(0, "#FFC0CB");
            loveGradient.addColorStop(1, "#FF0000");
            textFill = loveGradient;
            borderColor = "#FFC0CB";
            break;
        case "galaxy":
            const galaxyGradient = ctx.createLinearGradient(0, 0, 0, textSize + 10);
            galaxyGradient.addColorStop(0, "#8A2BE2");
            galaxyGradient.addColorStop(1, "#4169E1");
            textFill = "white";
            shadowColor = galaxyGradient;
            borderColor = "#8A2BE2";
            break;
        case "sunset":
            const sunsetGradient = ctx.createLinearGradient(0, 0, 0, textSize + 10);
            sunsetGradient.addColorStop(0, "yellow");
            sunsetGradient.addColorStop(1, "orange");
            textFill = sunsetGradient;
            shadowColor = "darkred";
            borderColor = "orange";
            break;
        case "neon":
            textFill = "#39FF14";
            shadowColor = "#39FF14";
            borderColor = "#39FF14";
            ctx.shadowBlur = 20;
            break;
        case "jungle":
            textFill = "lightgreen";
            shadowColor = "darkgreen";
            borderColor = "darkgreen";
            break;
        case "volcano":
            textFill = "orange";
            shadowColor = "red";
            borderColor = "red";
            break;
        case "electric":
            textFill = "white";
            shadowColor = "yellow";
            borderColor = "yellow";
            break;
        case "oceanic":
            const oceanicGradient = ctx.createLinearGradient(0, 0, 0, textSize + 10);
            oceanicGradient.addColorStop(0, "#00BFFF");
            oceanicGradient.addColorStop(1, "#1E90FF");
            textFill = oceanicGradient;
            borderColor = "#1E90FF";
            break;
        case "sunrise":
            const sunriseGradient = ctx.createLinearGradient(0, 0, 0, textSize + 10);
            sunriseGradient.addColorStop(0, "#FFD700");
            sunriseGradient.addColorStop(1, "#FFA500");
            textFill = sunriseGradient;
            borderColor = "#FFA500";
            break;
    }

    ctx.shadowColor = shadowColor;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
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

    let topOffset = 60;
    if (state.logoImage) { const logoHeight = 100; const logoWidth = state.logoImage.width * (logoHeight / state.logoImage.height); const logoX = (canvas.width - logoWidth) / 2; const logoY = 80; ctx.drawImage(state.logoImage, logoX, logoY, logoWidth, logoHeight); topOffset = logoY + logoHeight + 30; }

    ctx.font = `bold ${textSize}px Arial`;
    ctx.textAlign = "left";
    const textLines = [ `${state.currentLangData.canvas_server || 'Servidor:'} ${customServerValue}`, `${state.currentLangData.canvas_departure || 'Partida:'} ${customStartPlaceValue}`, `${state.currentLangData.canvas_destination || 'Destino:'} ${customDestinationValue}`, "", state.currentLangData.canvas_meeting_time || 'Hora de reunión / Hora de partida:' ];

    if (customDateValue && customTimeValue) {
        const [hh, mm] = customTimeValue.split(":").map(Number);
        const dateParts = customDateValue.split('-');
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        const customDateObj = new Date(year, month, day);
        customDateObj.setHours(hh, mm, 0, 0);

        const browserOffsetHours = new Date().getTimezoneOffset() / 60;
        let finalOffsetHours = browserOffsetHours;

        const manualOffset = dom.manualOffsetSelect.value;
        if (manualOffset !== 'auto') {
            finalOffsetHours = -parseInt(manualOffset, 10);
        }

        const offsetCorrection = (browserOffsetHours - finalOffsetHours) * 3600000;
        const correctTimestamp = customDateObj.getTime() - offsetCorrection;
        const utcBaseTime = new Date(correctTimestamp);
        const activeTimezoneGroup = timezoneRegions[state.selectedRegion].zones;
        const datesByDay = new Map();
        activeTimezoneGroup.forEach(tz => {
            const localTimeForTz = new Date(utcBaseTime.getTime() + tz.offset * 3600000);
            const dayString = formatDateForDisplayShort(localTimeForTz);
            if (!datesByDay.has(dayString)) { datesByDay.set(dayString, { times: [] }); }
            const dayEntry = datesByDay.get(dayString);
            const tzLabel = state.currentLangData[tz.key] || (timezoneCountryCodes[tz.key] || [tz.key.replace('tz_', '').toUpperCase()]).join(', ');
            const reunionTime = new Date(utcBaseTime.getTime() + tz.offset * 3600000);
            const departureOffset = parseInt(dom.departureTimeOffset.value, 10) * 60000;
            const partidaTime = new Date(reunionTime.getTime() + departureOffset);
            dayEntry.times.push({ tzLabel, reunionTime: formatTime(reunionTime), partidaTime: formatTime(partidaTime) });
        });
        const monthMap = (state.currentLangData.months_short || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]).reduce((acc, month, index) => { acc[month] = index; return acc; }, {});
        const sortedDays = Array.from(datesByDay.keys()).sort((a, b) => { const [dayA, monthAbbrA] = a.split(' '); const [dayB, monthAbbrB] = b.split(' '); const dateA = new Date(new Date().getFullYear(), monthMap[monthAbbrA], dayA); const dateB = new Date(new Date().getFullYear(), monthMap[monthAbbrB], dayB); return dateA - dateB; });
        const newTextLines = [];
        newTextLines.push(`${state.currentLangData.canvas_meeting_time || 'Hora de reunión / Hora de partida:'}`);
        sortedDays.forEach(dayString => { newTextLines.push(dayString); const dayEntry = datesByDay.get(dayString); dayEntry.times.forEach(timeEntry => { newTextLines.push(`  ${timeEntry.tzLabel}: ${timeEntry.reunionTime} / ${timeEntry.partidaTime}`); }); });
        textLines.splice(4, textLines.length - 4, ...newTextLines);
    } else { textLines.splice(4, textLines.length - 4); textLines.push(`${state.currentLangData.canvas_meeting_time || 'Hora de reunión / Hora de partida:'}`); textLines.push(`  N/A`); }

    const textX = 20, lineHeight = textSize + 15;
    let textY = topOffset + (textSize + 15);

    const textWidth = Math.max(...textLines.map(line => ctx.measureText(line).width)) + 40;
    const textHeight = textLines.length * lineHeight + 20;
    ctx.fillStyle = `rgba(0, 0, 0, ${textBackgroundOpacity})`;
    ctx.fillRect(textX - 10, textY - lineHeight, textWidth, textHeight);
    
    ctx.fillStyle = textFill;
    const maxTextWidth = canvas.width - textX - 20;
    textLines.forEach((line, index) => { let currentTextX = textX; let currentLineHeight = lineHeight; if (line.startsWith('  ')) { currentTextX += 15; } const wrappedLines = wrapText(ctx, line, maxTextWidth - (currentTextX - textX)); wrappedLines.forEach((wrappedLine, wrappedIndex) => { ctx.fillText(wrappedLine, currentTextX, textY + (index * lineHeight) + (wrappedIndex * currentLineHeight)); }); });

    const circleDiameter = 360; const circleX = canvas.width - circleDiameter - 10; const topY = 10; const bottomY = canvas.height - circleDiameter - 10;
    const circleCanvasTop = dom.circleCanvasTop, circleCanvasBottom = dom.circleCanvasBottom;
    const circleCtxTop = circleCanvasTop.getContext("2d"), circleCtxBottom = circleCanvasBottom.getContext("2d");
    circleCanvasTop.width = circleDiameter; circleCanvasTop.height = circleDiameter; circleCanvasBottom.width = circleDiameter; circleCanvasBottom.height = circleDiameter;
    circleCtxTop.clearRect(0, 0, circleDiameter, circleDiameter);
    if (state.circleImageTop) { circleCtxTop.save(); circleCtxTop.beginPath(); circleCtxTop.arc(circleDiameter / 2, circleDiameter / 2, circleDiameter / 2, 0, Math.PI * 2); circleCtxTop.clip(); circleCtxTop.drawImage(state.circleImageTop, state.circleImageXTop, state.circleImageYTop, state.circleImageTop.width * state.circleImageScaleTop, state.circleImageTop.height * state.circleImageScaleTop); circleCtxTop.restore(); }
    circleCtxBottom.clearRect(0, 0, circleDiameter, circleDiameter);
    if (state.circleImageBottom) { circleCtxBottom.save(); circleCtxBottom.beginPath(); circleCtxBottom.arc(circleDiameter / 2, circleDiameter / 2, circleDiameter / 2, 0, Math.PI * 2); circleCtxBottom.clip(); circleCtxBottom.drawImage(state.circleImageBottom, state.circleImageXBottom, state.circleImageYBottom, state.circleImageBottom.width * state.circleImageScaleBottom, state.circleImageBottom.height * state.circleImageScaleBottom); circleCtxBottom.restore(); }
    ctx.drawImage(circleCanvasTop, circleX, topY, circleDiameter, circleDiameter);
    ctx.drawImage(circleCanvasBottom, circleX, bottomY, circleDiameter, circleDiameter);

    if (state.isWaypointVisible) {


        const circleCanvasWaypoint = dom.circleCanvasWaypoint, circleCtxWaypoint = circleCanvasWaypoint.getContext("2d");
        circleCanvasWaypoint.width = circleDiameter; circleCanvasWaypoint.height = circleDiameter;
        circleCtxWaypoint.clearRect(0, 0, circleDiameter, circleDiameter);
        if (state.circleImageWaypoint) { 
            circleCtxWaypoint.save(); 
            circleCtxWaypoint.beginPath(); 
            circleCtxWaypoint.arc(circleDiameter / 2, circleDiameter / 2, circleDiameter / 2, 0, Math.PI * 2); 
            circleCtxWaypoint.clip(); 
            circleCtxWaypoint.drawImage(state.circleImageWaypoint, state.circleImageXWaypoint, state.circleImageYWaypoint, state.circleImageWaypoint.width * state.circleImageScaleWaypoint, state.circleImageWaypoint.height * state.circleImageScaleWaypoint); 
            circleCtxWaypoint.restore(); 
        }
        const waypointX = 10;
        ctx.drawImage(circleCanvasWaypoint, waypointX, bottomY, circleDiameter, circleDiameter);

        ctx.beginPath();
        ctx.arc(waypointX + circleDiameter / 2, bottomY + circleDiameter / 2, circleDiameter / 2, 0, Math.PI * 2);
        ctx.strokeStyle = borderColor; ctx.lineWidth = 10; ctx.stroke();

        const waypointText = state.currentLangData.canvas_label_waypoint || "Waypoint";
        const waypointTextMetrics = ctx.measureText(waypointText); 
        const waypointTextWidth = waypointTextMetrics.width + 40; 
        const waypointTextHeight = textSize + 20; 
        const waypointTextY = bottomY - 20;
        const waypointCircleCenterX = waypointX + circleDiameter / 2;
        ctx.fillStyle = `rgba(0, 0, 0, ${textBackgroundOpacity})`;
        ctx.fillRect(waypointCircleCenterX - waypointTextWidth / 2, waypointTextY - waypointTextHeight + 15, waypointTextWidth, waypointTextHeight);
        ctx.textAlign = "center";
        ctx.fillStyle = textFill;
        ctx.fillText(waypointText, waypointCircleCenterX, waypointTextY);
    }
    
    
    ctx.beginPath();
    ctx.arc(circleX + circleDiameter / 2, topY + circleDiameter / 2, circleDiameter / 2, 0, Math.PI * 2);
    ctx.strokeStyle = borderColor; ctx.lineWidth = 10; ctx.stroke();
    ctx.beginPath();
    ctx.arc(circleX + circleDiameter / 2, bottomY + circleDiameter / 2, circleDiameter / 2, 0, Math.PI * 2);
    ctx.strokeStyle = borderColor; ctx.lineWidth = 10; ctx.stroke();

    ctx.font = `bold ${textSize + 10}px Arial`;
    ctx.textAlign = "center";
    
    const departureText = state.currentLangData.canvas_label_departure || "Partida";
    const destinationText = state.currentLangData.canvas_label_destination || "Destino";

    const circleCenterX = circleX + circleDiameter / 2;
    
    const departureTextMetrics = ctx.measureText(departureText); const departureTextWidth = departureTextMetrics.width + 40; const departureTextHeight = textSize + 20; const departureTextY = topY + circleDiameter + 40;
    ctx.fillStyle = `rgba(0, 0, 0, ${textBackgroundOpacity})`;
    ctx.fillRect(circleCenterX - departureTextWidth / 2, departureTextY - departureTextHeight + 15, departureTextWidth, departureTextHeight);
    ctx.fillStyle = textFill;
    ctx.fillText(departureText, circleCenterX, departureTextY);

    const destinationTextMetrics = ctx.measureText(destinationText); const destinationTextWidth = destinationTextMetrics.width + 40; const destinationTextHeight = textSize + 20; const destinationTextY = bottomY - 20;
    ctx.fillStyle = `rgba(0, 0, 0, ${textBackgroundOpacity})`;
    ctx.fillRect(circleCenterX - destinationTextWidth / 2, destinationTextY - destinationTextHeight + 15, destinationTextWidth, destinationTextHeight);
    ctx.fillStyle = textFill;
    ctx.fillText(destinationText, circleCenterX, destinationTextY);

    if (state.detailImage) { ctx.drawImage(state.detailImage, state.detailImageX, state.detailImageY, state.detailImage.width * state.detailImageScale, state.detailImage.height * state.detailImageScale); }
}

export function initCanvasEventListeners() {
    const canvas = dom.mapCanvas;
    canvas.addEventListener("mousedown", (e) => { 
        if (state.detailImage && e.offsetX >= state.detailImageX && e.offsetX <= state.detailImageX + state.detailImage.width * state.detailImageScale && e.offsetY >= state.detailImageY && e.offsetY <= state.detailImageY + state.detailImage.height * state.detailImageScale) {
            state.setIsDraggingDetail(true);
            state.setStartX(e.offsetX - state.detailImageX);
            state.setStartY(e.offsetY - state.detailImageY);
        } else if (state.mapImage) { 
            state.setIsDragging(true); 
            state.setStartX(e.offsetX - state.imageX); 
            state.setStartY(e.offsetY - state.imageY); 
        } 
    });
    canvas.addEventListener("mousemove", (e) => { 
        if (state.isDraggingDetail && state.detailImage) {
            state.setDetailImageX(e.offsetX - state.startX);
            state.setDetailImageY(e.offsetY - state.startY);
            drawCanvas();
        } else if (state.isDragging && state.mapImage) { 
            state.setImageX(e.offsetX - state.startX); 
            state.setImageY(e.offsetY - state.startY); 
            drawCanvas(); 
        } 
    });
    canvas.addEventListener("mouseup", () => { state.setIsDragging(false); state.setIsDraggingDetail(false); });
    canvas.addEventListener("mouseleave", () => { state.setIsDragging(false); state.setIsDraggingDetail(false); });

    const circleCanvasTop = dom.circleCanvasTop;
    circleCanvasTop.addEventListener("mousedown", (e) => { if (state.circleImageTop) { state.setIsDraggingTop(true); state.setStartX(e.offsetX - state.circleImageXTop); state.setStartY(e.offsetY - state.circleImageYTop); } });
    circleCanvasTop.addEventListener("mousemove", (e) => { if (state.isDraggingTop && state.circleImageTop) { state.setCircleImageXTop(e.offsetX - state.startX); state.setCircleImageYTop(e.offsetY - state.startY); drawCanvas(); } });
    circleCanvasTop.addEventListener("mouseup", () => { state.setIsDraggingTop(false); });
    circleCanvasTop.addEventListener("mouseleave", () => { state.setIsDraggingTop(false); });

    const circleCanvasBottom = dom.circleCanvasBottom;
    circleCanvasBottom.addEventListener("mousedown", (e) => { if (state.circleImageBottom) { state.setIsDraggingBottom(true); state.setStartX(e.offsetX - state.circleImageXBottom); state.setStartY(e.offsetY - state.circleImageYBottom); } });
    circleCanvasBottom.addEventListener("mousemove", (e) => { if (state.isDraggingBottom && state.circleImageBottom) { state.setCircleImageXBottom(e.offsetX - state.startX); state.setCircleImageYBottom(e.offsetY - state.startY); drawCanvas(); } });
    circleCanvasBottom.addEventListener("mouseup", () => { state.setIsDraggingBottom(false); });
    circleCanvasBottom.addEventListener("mouseleave", () => { state.setIsDraggingBottom(false); });

    const circleCanvasWaypoint = dom.circleCanvasWaypoint;
    circleCanvasWaypoint.addEventListener("mousedown", (e) => { if (state.circleImageWaypoint) { state.setIsDraggingWaypoint(true); state.setStartX(e.offsetX - state.circleImageXWaypoint); state.setStartY(e.offsetY - state.circleImageYWaypoint); } });
    circleCanvasWaypoint.addEventListener("mousemove", (e) => { if (state.isDraggingWaypoint && state.circleImageWaypoint) { state.setCircleImageXWaypoint(e.offsetX - state.startX); state.setCircleImageYWaypoint(e.offsetY - state.startY); drawCanvas(); } });
    circleCanvasWaypoint.addEventListener("mouseup", () => { state.setIsDraggingWaypoint(false); });
    circleCanvasWaypoint.addEventListener("mouseleave", () => { state.setIsDraggingWaypoint(false); });

    dom.mapUpload.addEventListener("change", (e) => { const file = e.target.files[0]; if (file) { const img = new Image(); img.onload = () => { state.setMapImage(img); state.setImageX(0); state.setImageY(0); state.setImageScale(1); drawCanvas(); }; img.src = URL.createObjectURL(file); } else { state.setMapImage(null); drawCanvas(); } });
    dom.circleUploadTop.addEventListener("change", (e) => { const file = e.target.files[0]; if (file) { const img = new Image(); img.onload = () => { state.setCircleImageTop(img); state.setCircleImageXTop(0); state.setCircleImageYTop(0); state.setCircleImageScaleTop(1); drawCanvas(); }; img.src = URL.createObjectURL(file); } else { state.setCircleImageTop(null); drawCanvas(); } });
    dom.circleUploadBottom.addEventListener("change", (e) => { const file = e.target.files[0]; if (file) { const img = new Image(); img.onload = () => { state.setCircleImageBottom(img); state.setCircleImageXBottom(0); state.setCircleImageYBottom(0); state.setCircleImageScaleBottom(1); drawCanvas(); }; img.src = URL.createObjectURL(file); } else { state.setCircleImageBottom(null); drawCanvas(); } });
    dom.logoUpload.addEventListener("change", (e) => { const file = e.target.files[0]; if (file) { const img = new Image(); img.onload = () => { state.setLogoImage(img); drawCanvas(); }; img.src = URL.createObjectURL(file); } else { state.setLogoImage(null); drawCanvas(); } });
    dom.backgroundUpload.addEventListener("change", (e) => { const file = e.target.files[0]; if (file) { const img = new Image(); img.onload = () => { state.setBackgroundImage(img); drawCanvas(); }; img.src = URL.createObjectURL(file); } else { state.setBackgroundImage(null); drawCanvas(); } });
    dom.detailUpload.addEventListener("change", (e) => { const file = e.target.files[0]; if (file) { const img = new Image(); img.onload = () => { state.setDetailImage(img); state.setDetailImageX(0); state.setDetailImageY(0); state.setDetailImageScale(1); drawCanvas(); }; img.src = URL.createObjectURL(file); } else { state.setDetailImage(null); drawCanvas(); } });
    dom.waypointUpload.addEventListener("change", (e) => { const file = e.target.files[0]; if (file) { const img = new Image(); img.onload = () => { state.setCircleImageWaypoint(img); state.setCircleImageXWaypoint(0); state.setCircleImageYWaypoint(0); state.setCircleImageScaleWaypoint(1); drawCanvas(); }; img.src = URL.createObjectURL(file); } else { state.setCircleImageWaypoint(null); drawCanvas(); } });

    dom.zoomIn.addEventListener("click", () => { if (state.mapImage) { state.setImageScale(state.imageScale * 1.2); drawCanvas(); } });
    dom.zoomOut.addEventListener("click", () => { if (state.mapImage) { state.setImageScale(state.imageScale / 1.2); drawCanvas(); } });
    dom.zoomInTop.addEventListener("click", () => { if (state.circleImageTop) { state.setCircleImageScaleTop(state.circleImageScaleTop * 1.2); drawCanvas(); } });
    dom.zoomOutTop.addEventListener("click", () => { if (state.circleImageTop) { state.setCircleImageScaleTop(state.circleImageScaleTop / 1.2); drawCanvas(); } });
    dom.zoomInBottom.addEventListener("click", () => { if (state.circleImageBottom) { state.setCircleImageScaleBottom(state.circleImageScaleBottom * 1.2); drawCanvas(); } });
    dom.zoomOutBottom.addEventListener("click", () => { if (state.circleImageBottom) { state.setCircleImageScaleBottom(state.circleImageScaleBottom / 1.2); drawCanvas(); } });
    dom.zoomInDetail.addEventListener("click", () => { if (state.detailImage) { state.setDetailImageScale(state.detailImageScale * 1.2); drawCanvas(); } });
    dom.zoomOutDetail.addEventListener("click", () => { if (state.detailImage) { state.setDetailImageScale(state.detailImageScale / 1.2); drawCanvas(); } });

    dom.zoomInWaypoint.addEventListener("click", () => { if (state.circleImageWaypoint) { state.setCircleImageScaleWaypoint(state.circleImageScaleWaypoint * 1.2); drawCanvas(); } });
    dom.zoomOutWaypoint.addEventListener("click", () => { if (state.circleImageWaypoint) { state.setCircleImageScaleWaypoint(state.circleImageScaleWaypoint / 1.2); drawCanvas(); } });
}