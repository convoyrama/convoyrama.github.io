import { dom } from './dom.js';
import * as state from './state.js';
import { timezoneRegions } from './config.js';
import { updateLiveClocks, getGameTime, getDetailedDayNightIcon, formatDateForDisplay } from './time.js';
import { fetchLanguage, applyTranslations } from './i18n.js';
import { drawCanvas, initCanvasEventListeners } from './canvas.js';
import { showCopyMessage } from './utils.js';
import { injectMetadataIntoPNG } from './png-metadata.js';

const { DateTime } = luxon;

// Hook into global i18n system
window.addEventListener('languageChanged', (e) => {
    const { lang, translations } = e.detail;
    state.setCurrentLangData(translations);

    // Refresh elements that depend on state.currentLangData
    if (dom.regionSelect) {
        const currentRegion = dom.regionSelect.value;
        dom.regionSelect.innerHTML = '';
        for (const regionKey in timezoneRegions) {
            const option = document.createElement('option');
            option.value = regionKey;
            const regionNameKey = timezoneRegions[regionKey].name;
            option.textContent = translations[regionNameKey] || translations[`ev_${regionNameKey}`] || regionNameKey;
            dom.regionSelect.appendChild(option);
        }
        dom.regionSelect.value = currentRegion;
    }

    if (dom.customDateDisplay && dom.customDate.value) {
        const d = DateTime.fromISO(dom.customDate.value);
        if (d.isValid) {
            const labelKey = translations.label_selected_date || translations.ev_label_selected_date || 'Fecha seleccionada';
            dom.customDateDisplay.textContent = `${labelKey}: ${formatDateForDisplay(d)}`;
        }
    }

    // Refresh Style selector
    if (dom.textStyle) {
        const currentStyle = dom.textStyle.value;
        Array.from(dom.textStyle.options).forEach(option => {
            const styleKey = `style_${option.value}`;
            const translation = translations[styleKey] || translations[`ev_${styleKey}`];
            if (translation) option.textContent = translation;
        });
        dom.textStyle.value = currentStyle;
    }

    drawCanvas();
    updateInGameTimeEmojis();
});

async function init() {
    // twemoji.parse(document.body);

    // Populate dom object after DOM is ready
    dom.customDate = document.getElementById("custom-date");
    dom.customTime = document.getElementById("custom-time");
    dom.customEventName = document.getElementById("custom-event-name");
    dom.customEventLink = document.getElementById("custom-event-link");
    dom.customStartPlace = document.getElementById("custom-start-place");
    dom.customDestination = document.getElementById("custom-destination");
    dom.customServer = document.getElementById("custom-server");
    dom.customEventDescription = document.getElementById("custom-event-description");
    dom.departureTimeOffset = document.getElementById("departure-time-offset");
    dom.localTimeDisplay = document.getElementById("local-time-display");
    dom.gameTimeDisplay = document.getElementById("game-time-display");
    dom.gameTimeEmoji = document.getElementById("game-time-emoji");
    dom.ingameEmojiDisplay = document.getElementById("ingame-emoji-display");
    dom.regionSelect = document.getElementById("region-select");
    dom.manualOffsetSelect = document.getElementById("manual-offset-select");
    dom.customDateDisplay = document.getElementById("custom-date-display");

    dom.copyMessage = document.getElementById("copy-message");
    dom.copyCustomInfo = document.getElementById("copy-custom-info");
    dom.copyTmpBtn = document.getElementById("copy-tmp-btn");
    dom.tmpImagesToggle = document.getElementById("tmp-images-toggle");
    dom.mapCanvas = document.getElementById("map-canvas");
    dom.circleCanvasTop = document.getElementById("circle-canvas-top");
    dom.circleCanvasBottom = document.getElementById("circle-canvas-bottom");
    dom.circleCanvasWaypoint = document.getElementById("circle-canvas-waypoint");
    dom.downloadCanvas = document.getElementById("download-canvas");
    dom.waypointToggle = document.getElementById("waypoint-toggle");
    dom.textSize = document.getElementById("text-size");
    dom.textStyle = document.getElementById("text-style");
    dom.textBackgroundOpacity = document.getElementById("text-background-opacity");
    dom.resetCanvas = document.getElementById("reset-canvas");
    dom.mapUpload = document.getElementById("map-upload");
    dom.circleUploadTop = document.getElementById("circle-upload-top");
    dom.circleUploadBottom = document.getElementById("circle-upload-bottom");
    dom.logoUpload = document.getElementById("logo-upload");
    dom.backgroundUpload = document.getElementById("background-upload");
    dom.detailUpload = document.getElementById("detail-upload");
    dom.waypointUpload = document.getElementById("waypoint-upload");

    dom.speedToggles = [document.getElementById('speed-toggle-0'), document.getElementById('speed-toggle-1'), document.getElementById('speed-toggle-3')].filter(el => el !== null);
    dom.speedValues = [document.getElementById('speed-value-0'), document.getElementById('speed-value-1'), document.getElementById('speed-value-3')].filter(el => el !== null);
    dom.speedUnits = [document.getElementById('speed-unit-0'), document.getElementById('speed-unit-1')].filter(el => el !== null);

    // Lang icons removed, now part of global header
    // dom.langIcons = document.querySelectorAll(".lang-icon");

    dom.zoomIn = document.getElementById("zoom-in");
    dom.zoomOut = document.getElementById("zoom-out");
    dom.zoomInTop = document.getElementById("zoom-in-top");
    dom.zoomOutTop = document.getElementById("zoom-out-top");
    dom.zoomInBottom = document.getElementById("zoom-in-bottom");
    dom.zoomOutBottom = document.getElementById("zoom-out-bottom");
    dom.zoomInDetail = document.getElementById("zoom-in-detail");
    dom.zoomOutDetail = document.getElementById("zoom-out-detail");
    dom.zoomInWaypoint = document.getElementById("zoom-in-waypoint");
    dom.zoomOutWaypoint = document.getElementById("zoom-out-waypoint");

    // Region initial population logic handled by languageChanged event initially
    const populateRegions = () => {
        if (!state.currentLangData) return;
        dom.regionSelect.innerHTML = '';
        for (const regionKey in timezoneRegions) {
            const option = document.createElement('option');
            option.value = regionKey;
            const regionNameKey = timezoneRegions[regionKey].name;
            option.textContent = state.currentLangData[regionNameKey] || state.currentLangData[`ev_${regionNameKey}`] || regionNameKey;
            dom.regionSelect.appendChild(option);
        }
        dom.regionSelect.value = state.selectedRegion;
    };

    // Trigger initial region population if lang is already loaded
    if (state.currentLangData) populateRegions();

    dom.regionSelect.addEventListener('change', (e) => {
        state.setSelectedRegion(e.target.value);
        drawCanvas();
    });

    // Set initial date and time using Luxon
    const userNow = DateTime.local();
    dom.customDate.value = userNow.toISODate();
    dom.customTime.value = userNow.toFormat('HH:mm');
    if (state.currentLangData) {
        const labelKey = state.currentLangData.label_selected_date || state.currentLangData.ev_label_selected_date || 'Fecha seleccionada';
        dom.customDateDisplay.textContent = `${labelKey}: ${formatDateForDisplay(userNow)}`;
    }

    // Initial calls after DOM is ready
    updateLiveClocks(); 
    setInterval(updateLiveClocks, 1000);
    updateInGameTimeEmojis();
    drawCanvas();

    dom.copyCustomInfo.onclick = () => {
        const customDateValue = dom.customDate.value, customTimeValue = dom.customTime.value;
        const nameKey = state.currentLangData.canvas_default_event_name || state.currentLangData.ev_default_name || "Evento Personalizado";
        const customEventNameValue = dom.customEventName.value || nameKey;
        const customEventLinkValue = dom.customEventLink.value || "https://convoyrama.github.io/event.html", customEventDescriptionValue = dom.customEventDescription.value || "Sin descripción";
        const customStartPlaceValue = dom.customStartPlace.value || "Sin especificar", customDestinationValue = dom.customDestination.value || "Sin especificar", customServerValue = dom.customServer.value || "Sin especificar";

        const errorKey = state.currentLangData.error_no_date || state.currentLangData.ev_error_no_date || "Por favor, selecciona una fecha y hora.";
        if (!customDateValue || !customTimeValue) { showCopyMessage(errorKey); return; }

        const selectedRegionKey = dom.regionSelect.value;
        const selectedRegion = timezoneRegions[selectedRegionKey];
        let zone = 'UTC';
        if (selectedRegion && selectedRegion.zones.length > 0) {
            zone = selectedRegion.zones[0].iana_tz;
        }

        let meetingDateTime = DateTime.fromISO(`${customDateValue}T${customTimeValue}:00`, { zone });

        const manualOffset = dom.manualOffsetSelect.value;
        if (manualOffset !== 'auto') {
            const offsetMinutes = parseInt(manualOffset, 10) * 60;
            meetingDateTime = DateTime.fromISO(`${customDateValue}T${customTimeValue}:00`, { zone: 'utc' }).plus({ minutes: -offsetMinutes });
        }

        if (!meetingDateTime.isValid) {
            console.error("Invalid meetingDateTime:", meetingDateTime.invalidExplanation);
            const invalidKey = state.currentLangData.error_invalid_date || state.currentLangData.ev_error_invalid_date || "Fecha u hora inválida.";
            showCopyMessage(invalidKey);
            return;
        }

        const meetingTimestamp = meetingDateTime.toUnixInteger();
        const meetingGameTime = getGameTime(meetingDateTime.toUTC());
        const meetingEmoji = getDetailedDayNightIcon(meetingGameTime.hours);

        const departureOffsetMinutes = parseInt(dom.departureTimeOffset.value, 10);
        const departureDateTime = meetingDateTime.plus({ minutes: departureOffsetMinutes });
        const departureTimestamp = departureDateTime.toUnixInteger();
        const departureGameTime = getGameTime(departureDateTime.toUTC());
        const departureEmoji = getDetailedDayNightIcon(departureGameTime.hours);

        const arrivalDateTime = departureDateTime.plus({ minutes: 50 });
        const arrivalTimestamp = arrivalDateTime.toUnixInteger();
        const arrivalGameTime = getGameTime(arrivalDateTime.toUTC());
        const arrivalEmoji = getDetailedDayNightIcon(arrivalGameTime.hours);

        const itKey = state.currentLangData.ingame_time_title || state.currentLangData.ev_ingame_time_title || 'Hora ingame';
        const mKey = state.currentLangData.meeting_label || state.currentLangData.ev_meeting_label || 'Reunión';
        const sKey = state.currentLangData.departure_label || state.currentLangData.ev_departure_label || 'Salida';
        const aKey = state.currentLangData.arrival_label || state.currentLangData.ev_arrival_label || 'Llegada aprox';
        const dtKey = state.currentLangData.discord_arrival_time || state.currentLangData.ev_discord_arrival_time || 'Llegada Aprox.:';

        const ingameTimeLine = `**${itKey}:** ${mKey}: ${meetingEmoji} ${sKey}: ${departureEmoji} ${aKey}: ${arrivalEmoji}`;

        let convoyInfo = `[**${customEventNameValue}**](${customEventLinkValue})\nServidor: ${customServerValue}\nPartida: ${customStartPlaceValue}\nDestino: ${customDestinationValue}\n\n**Reunión:** <t:${meetingTimestamp}:F> (<t:${meetingTimestamp}:R>)\n**Salida:** <t:${departureTimestamp}:t> (<t:${departureTimestamp}:R>)\n**${dtKey}** <t:${arrivalTimestamp}:t> (<t:${arrivalTimestamp}:R>)\n${ingameTimeLine}\n\nDescripción: ${customEventDescriptionValue}`;
        navigator.clipboard.writeText(convoyInfo).then(() => showCopyMessage()).catch(err => console.error(`[copyCustomInfo] Error al copiar: ${err.message}`));
    };

    dom.copyTmpBtn.onclick = () => {
        const customDateValue = dom.customDate.value;
        const customTimeValue = dom.customTime.value;
        const nameKey = state.currentLangData.canvas_default_event_name || state.currentLangData.ev_default_name || "Evento Personalizado";
        const customEventNameValue = dom.customEventName.value || nameKey;
        const customEventDescriptionValue = dom.customEventDescription.value || "Sin descripción";
        const customStartPlaceValue = dom.customStartPlace.value || "Sin especificar";
        const customDestinationValue = dom.customDestination.value || "Sin especificar";
        const customServerValue = dom.customServer.value || "Sin especificar";

        const errorKey = state.currentLangData.error_no_date || state.currentLangData.ev_error_no_date || "Por favor, selecciona una fecha y hora.";
        if (!customDateValue || !customTimeValue) { showCopyMessage(errorKey); return; }

        let meetingDateTime;
        const manualOffset = dom.manualOffsetSelect.value;

        if (manualOffset === 'auto') {
            meetingDateTime = DateTime.fromISO(`${customDateValue}T${customTimeValue}:00`);
        } else {
            const offsetMinutes = parseInt(manualOffset, 10) * 60;
            meetingDateTime = DateTime.fromISO(`${customDateValue}T${customTimeValue}:00`, { zone: 'utc' }).plus({ minutes: -offsetMinutes });
        }

        if (!meetingDateTime.isValid) {
            console.error("Invalid meetingDateTime:", meetingDateTime.invalidExplanation);
            const invalidKey = state.currentLangData.error_invalid_date || state.currentLangData.ev_error_invalid_date || "Fecha u hora inválida.";
            showCopyMessage(invalidKey);
            return;
        }

        const departureOffsetMinutes = parseInt(dom.departureTimeOffset.value, 10);
        const departureDateTime = meetingDateTime.plus({ minutes: departureOffsetMinutes });
        const arrivalDateTime = departureDateTime.plus({ minutes: 50 });

        const meetingGameTime = getGameTime(meetingDateTime.toUTC());
        const meetingEmoji = getDetailedDayNightIcon(meetingGameTime.hours);
        const departureGameTime = getGameTime(departureDateTime.toUTC());
        const departureEmoji = getDetailedDayNightIcon(departureGameTime.hours);
        const arrivalGameTime = getGameTime(arrivalDateTime.toUTC());
        const arrivalEmoji = getDetailedDayNightIcon(arrivalGameTime.hours);

        const includeImages = dom.tmpImagesToggle.checked;

        const selectedRegion = timezoneRegions[dom.regionSelect.value];
        let tmpInfo = `# ${customEventNameValue}\n\n`;
        if (includeImages) tmpInfo += `![](https://convoyrama.github.io/event/images/default/green.png)\n\n`;
        tmpInfo += `## ${state.currentLangData.tmp_description_title || state.currentLangData.ev_tmp_desc || 'DESCRIPCIÓN'}\n`;
        tmpInfo += `> ${customEventDescriptionValue}\n\n`;
        if (includeImages) tmpInfo += `![](https://convoyrama.github.io/event/images/default/purple.png)\n\n`;
        tmpInfo += `## ${state.currentLangData.tmp_event_info_title || state.currentLangData.ev_tmp_info || 'INFORMACION DEL EVENTO'}\n`;
        tmpInfo += `* 🗓️ ${state.currentLangData.tmp_date_label || 'Fecha (UTC)'}: ${meetingDateTime.toUTC().toFormat('dd/MM/yyyy')}\n`;
        tmpInfo += `* ⏰ ${state.currentLangData.tmp_meeting_time_label || 'Reunión (UTC)'}: ${meetingDateTime.toUTC().toFormat('HH:mm')}\n`;
        tmpInfo += `* 🚚 ${state.currentLangData.tmp_departure_time_label || 'Salida (UTC)'}: ${departureDateTime.toUTC().toFormat('HH:mm')}\n`;
        tmpInfo += `* 🖥️ ${state.currentLangData.tmp_server_label || 'Servidor'}: ${customServerValue}\n`;
        tmpInfo += `* ➡️ ${state.currentLangData.tmp_start_place_label || 'Ciudad de Inicio'}: ${customStartPlaceValue}\n`;
        tmpInfo += `* ⬅️ ${state.currentLangData.tmp_destination_label || 'Ciudad de Destino'}: ${customDestinationValue}\n\n`;

        if (selectedRegion) {
            const datesByDay = new Map();
            selectedRegion.zones.forEach(tz => {
                const localTimeForTz = meetingDateTime.setZone(tz.iana_tz);
                const dayString = localTimeForTz.toFormat('dd MMM');
                if (!datesByDay.has(dayString)) {
                    datesByDay.set(dayString, []);
                }
                const tzLabel = state.currentLangData[tz.key] || tz.key;
                const meetingTime = localTimeForTz;
                const departureTime = localTimeForTz.plus({ minutes: departureOffsetMinutes });
                const timeString = `${meetingTime.toFormat('HH:mm')} / ${departureTime.toFormat('HH:mm')}`;
                datesByDay.get(dayString).push({ tzLabel, timeString });
            });

            const sortedDays = Array.from(datesByDay.keys()).sort((a, b) => {
                const dateA = DateTime.fromFormat(a, 'dd MMM', { locale: state.language });
                const dateB = DateTime.fromFormat(b, 'dd MMM', { locale: state.language });
                return dateA.toMillis() - dateB.toMillis();
            });

            sortedDays.forEach(dayString => {
                tmpInfo += `### ${dayString}\n`;
                const dayEntries = datesByDay.get(dayString);
                dayEntries.forEach(entry => {
                    tmpInfo += `* ${entry.tzLabel}: ${entry.timeString}\n`;
                });
                tmpInfo += '\n';
            });
        }

        const itKey = state.currentLangData.ingame_time_title || state.currentLangData.ev_ingame_time_title || 'Hora ingame';
        const mKey = state.currentLangData.meeting_label || state.currentLangData.ev_meeting_label || 'Reunión';
        const sKey = state.currentLangData.departure_label || state.currentLangData.ev_departure_label || 'Salida';
        const aKey = state.currentLangData.arrival_label || state.currentLangData.ev_arrival_label || 'Llegada aprox';
        const rKey = state.currentLangData.tmp_rules_reminder || state.currentLangData.ev_tmp_rules || 'Recuerden seguir las normas de TruckersMP';

        const ingameTimeLine = `* ${itKey}: ${mKey}: ${meetingEmoji} ${sKey}: ${departureEmoji} ${aKey}: ${arrivalEmoji}`;
        tmpInfo += `${ingameTimeLine}\n\n`;

        if (includeImages) tmpInfo += `![](https://convoyrama.github.io/event/images/default/orange.png)\n\n`;

        tmpInfo += `[${rKey}](https://truckersmp.com/rules)`;

        navigator.clipboard.writeText(tmpInfo).then(() => showCopyMessage()).catch(err => console.error(`[copyTmpBtn] Error al copiar: ${err.message}`));
    };


    initCanvasEventListeners();
    dom.waypointToggle.addEventListener('change', (e) => {
        state.setIsWaypointVisible(e.target.checked);
        drawCanvas();
    });


    dom.textSize.addEventListener("change", drawCanvas);
    dom.textStyle.addEventListener("change", drawCanvas);
    dom.textBackgroundOpacity.addEventListener("change", drawCanvas);
    dom.downloadCanvas.addEventListener("click", performDownload);
    dom.customEventName.addEventListener("input", drawCanvas);
    dom.customStartPlace.addEventListener("input", drawCanvas);
    dom.customDestination.addEventListener("input", drawCanvas);
    dom.customDate.addEventListener("change", (e) => {
        const d = DateTime.fromISO(e.target.value);
        if (d.isValid) {
            const labelKey = state.currentLangData.label_selected_date || state.currentLangData.ev_label_selected_date || 'Fecha seleccionada';
            dom.customDateDisplay.textContent = `${labelKey}: ${formatDateForDisplay(d)}`;
        }
        drawCanvas();
    });


    dom.customTime.addEventListener("input", () => { drawCanvas(); updateInGameTimeEmojis(); });
    dom.departureTimeOffset.addEventListener("change", () => { drawCanvas(); updateInGameTimeEmojis(); });

    dom.resetCanvas.addEventListener("click", () => { state.setMapImage(null); state.setCircleImageTop(null); state.setCircleImageBottom(null); state.setLogoImage(null); state.setBackgroundImage(null); state.setDetailImage(null); state.setCircleImageWaypoint(null); dom.mapUpload.value = ""; dom.circleUploadTop.value = ""; dom.circleUploadBottom.value = ""; dom.logoUpload.value = ""; dom.backgroundUpload.value = ""; dom.detailUpload.value = ""; dom.waypointUpload.value = ""; drawCanvas(); });

    dom.speedToggles.forEach((toggle, index) => {
        toggle.addEventListener('change', (e) => {
            state.speedIndicators[index].visible = e.target.checked;
            drawCanvas();
        });
    });

    dom.speedValues.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            state.speedIndicators[index].value = e.target.value;
            drawCanvas();
        });
    });

    dom.speedUnits.forEach((select, index) => {
        select.addEventListener('change', (selectE) => {
            state.speedIndicators[index].unit = selectE.target.value;
            drawCanvas();
        });
    });
}
document.addEventListener('DOMContentLoaded', init);