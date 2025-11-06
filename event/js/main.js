import { dom } from './dom.js';
import * as state from './state.js';
import { timezoneRegions } from './config.js';
import { updateLiveClocks, getGameTime, getDetailedDayNightIcon, formatDateForDisplay } from './time.js';
import { fetchLanguage, applyTranslations } from './i18n.js';
import { drawCanvas, initCanvasEventListeners } from './canvas.js';
import { showCopyMessage } from './utils.js';
import { injectMetadataIntoPNG } from './png-metadata.js';

const { DateTime } = luxon;

async function loadLanguage(lang) {
    const langData = await fetchLanguage(lang);
    state.setCurrentLangData(langData);
    applyTranslations(langData);
    drawCanvas();
    updateInGameTimeEmojis();
}

function updateInGameTimeEmojis() {
    const customDateValue = dom.customDate.value;
    const customTimeValue = dom.customTime.value;

    if (!customDateValue || !customTimeValue) {
        dom.ingameEmojiDisplay.innerHTML = '';
        return;
    }

    const selectedRegionKey = dom.regionSelect.value;
    const selectedRegion = timezoneRegions[selectedRegionKey];
    let zone = 'UTC'; // Default to UTC

    if (selectedRegion && selectedRegion.zones.length > 0) {
        // For simplicity, use the first zone's IANA TZ for the region's overall time context
        zone = selectedRegion.zones[0].iana_tz;
    }

    let meetingDateTime = DateTime.fromISO(`${customDateValue}T${customTimeValue}:00`, { zone });

    // If manual offset is selected, override the zone
    const manualOffset = dom.manualOffsetSelect.value;
    if (manualOffset !== 'auto') {
        const offsetMinutes = parseInt(manualOffset, 10) * 60;
        meetingDateTime = DateTime.fromISO(`${customDateValue}T${customTimeValue}:00`).set({ 
            zone: 'utc',
            hour: meetingDateTime.hour,
            minute: meetingDateTime.minute,
            second: meetingDateTime.second,
            millisecond: meetingDateTime.millisecond
        }).plus({ minutes: -offsetMinutes });
    }

    if (!meetingDateTime.isValid) {
        console.error("Invalid meetingDateTime:", meetingDateTime.invalidExplanation);
        dom.ingameEmojiDisplay.innerHTML = '';
        return;
    }

    const meetingGameTime = getGameTime(meetingDateTime.toUTC());
    const meetingEmoji = getDetailedDayNightIcon(meetingGameTime.hours);

    const departureOffsetMinutes = parseInt(dom.departureTimeOffset.value, 10);
    const departureDateTime = meetingDateTime.plus({ minutes: departureOffsetMinutes });
    const departureGameTime = getGameTime(departureDateTime.toUTC());
    const departureEmoji = getDetailedDayNightIcon(departureGameTime.hours);

    const arrivalDateTime = departureDateTime.plus({ minutes: 50 }); // Assuming 50 minutes travel time
    const arrivalGameTime = getGameTime(arrivalDateTime.toUTC());
    const arrivalEmoji = getDetailedDayNightIcon(arrivalGameTime.hours);

    dom.ingameEmojiDisplay.innerHTML = `${meetingEmoji} ${departureEmoji} ${arrivalEmoji}`;
    twemoji.parse(dom.ingameEmojiDisplay);
}

function performDownload() {
    const { mapCanvas: canvas } = dom;
    try {
        canvas.toBlob(async (blob) => {
            const arrayBuffer = await blob.arrayBuffer();

            const customDateValue = dom.customDate.value;
            const customTimeValue = dom.customTime.value;
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
                meetingDateTime = DateTime.fromISO(`${customDateValue}T${customTimeValue}:00`).set({ 
                    zone: 'utc',
                    hour: meetingDateTime.hour,
                    minute: meetingDateTime.minute,
                    second: meetingDateTime.second,
                    millisecond: meetingDateTime.millisecond
                }).plus({ minutes: -offsetMinutes });
            }

            if (!meetingDateTime.isValid) {
                console.error("Invalid meetingDateTime for metadata:", meetingDateTime.invalidExplanation);
                // Proceed without metadata or throw error, depending on desired behavior
                return;
            }

            const departureOffsetMinutes = parseInt(dom.departureTimeOffset.value, 10);
            const departureDateTime = meetingDateTime.plus({ minutes: departureOffsetMinutes });
            const arrivalDateTime = departureDateTime.plus({ minutes: 45 }); // 45 real minutes after departure

            const metadata = {
                eventName: dom.customEventName.value || state.currentLangData.canvas_default_event_name || "Evento Personalizado",
                eventLink: dom.customEventLink.value || "https://convoyrama.github.io/events.html",
                startPlace: dom.customStartPlace.value || "Sin especificar",
                destination: dom.customDestination.value || "Sin especificar",
                server: dom.customServer.value || "Sin especificar",
                description: dom.customEventDescription.value || "Sin descripción",
                meetingTimestamp: meetingDateTime.toUnixInteger(),
                departureTimestamp: departureDateTime.toUnixInteger(),
                arrivalTimestamp: arrivalDateTime.toUnixInteger(),
                meetingGameTime: { hours: meetingGameTime.hours, minutes: meetingGameTime.minutes },
                arrivalGameTime: { hours: arrivalGameTime.hours, minutes: arrivalGameTime.minutes },
                ianaTimeZone: zone,
                utcOffsetMinutes: meetingDateTime.offset,
                generatedAt: DateTime.local().toISO(),
            };

            const jsonMetadata = JSON.stringify(metadata);

            const newPngBuffer = injectMetadataIntoPNG(arrayBuffer, "convoyrama-event-data", jsonMetadata);
            const newBlob = new Blob([newPngBuffer], { type: 'image/png' });

            const tempLink = document.createElement('a');
            tempLink.href = URL.createObjectURL(newBlob);
            
            const eventDate = dom.customDate.value;
            let dateString;
            if (eventDate) {
                dateString = eventDate;
            } else {
                const today = DateTime.local();
                dateString = today.toISODate();
            }
            tempLink.download = `convoy-map-${dateString}.png`;
            
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            
            URL.revokeObjectURL(tempLink.href);
        }, 'image/png');
    } catch (error) {
        console.error("Error performing download:", error);
    }
}

function init() {
    twemoji.parse(document.body);
    const flags = document.querySelectorAll(".flag-emoji");
    flags.forEach(flag => { flag.addEventListener("click", () => { const lang = flag.getAttribute("data-lang"); loadLanguage(lang); flags.forEach(f => f.classList.remove('selected')); flag.classList.add('selected'); }); });
    const regionSelect = document.getElementById('region-select');
    for (const regionKey in timezoneRegions) {
        const option = document.createElement('option');
        option.value = regionKey;
        option.setAttribute('data-i18n', timezoneRegions[regionKey].name);
        option.textContent = regionKey; // Temporarily show key, will be translated
        regionSelect.appendChild(option);
    }
    regionSelect.addEventListener('change', (e) => { state.setSelectedRegion(e.target.value); drawCanvas(); updateInGameTimeEmojis(); });
    dom.manualOffsetSelect.addEventListener('change', () => { drawCanvas(); updateInGameTimeEmojis(); });
    loadLanguage('es'); document.querySelector('.flag-emoji[data-lang="es"]').classList.add('selected');
    updateLiveClocks(); setInterval(updateLiveClocks, 1000);
    
    const userNow = DateTime.local();
    dom.customDate.value = userNow.toISODate();
    dom.customTime.value = userNow.toFormat('HH:mm');
    dom.customDateDisplay.textContent = `Fecha seleccionada: ${formatDateForDisplay(userNow)}`;
    
    dom.customDate.onchange = () => { 
        const customDateObj = DateTime.fromISO(dom.customDate.value);
        dom.customDateDisplay.textContent = `Fecha seleccionada: ${formatDateForDisplay(customDateObj)}`; 
        drawCanvas(); 
        updateInGameTimeEmojis(); 
    };

    dom.copyCustomInfo.onclick = () => {
        const customDateValue = dom.customDate.value, customTimeValue = dom.customTime.value, customEventNameValue = dom.customEventName.value || state.currentLangData.canvas_default_event_name || "Evento Personalizado";
        const customEventLinkValue = dom.customEventLink.value || "https://convoyrama.github.io/events.html", customEventDescriptionValue = dom.customEventDescription.value || "Sin descripción";
        const customStartPlaceValue = dom.customStartPlace.value || "Sin especificar", customDestinationValue = dom.customDestination.value || "Sin especificar", customServerValue = dom.customServer.value || "Sin especificar";
        if (!customDateValue || !customTimeValue) { showCopyMessage(state.currentLangData.error_no_date || "Por favor, selecciona una fecha y hora."); return; }
        
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
            meetingDateTime = DateTime.fromISO(`${customDateValue}T${customTimeValue}:00`).set({ 
                zone: 'utc',
                hour: meetingDateTime.hour,
                minute: meetingDateTime.minute,
                second: meetingDateTime.second,
                millisecond: meetingDateTime.millisecond
            }).plus({ minutes: -offsetMinutes });
        }

        if (!meetingDateTime.isValid) {
            console.error("Invalid meetingDateTime:", meetingDateTime.invalidExplanation);
            showCopyMessage(state.currentLangData.error_invalid_date || "Fecha u hora inválida.");
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

        const ingameTimeLine = `**${state.currentLangData.ingame_time_title || 'Hora ingame'}:** ${state.currentLangData.meeting_label || 'Reunión'}: ${meetingEmoji} ${state.currentLangData.departure_label || 'Salida'}: ${departureEmoji} ${state.currentLangData.arrival_label || 'Llegada aprox'}: ${arrivalEmoji}`;

        let convoyInfo = `[**${customEventNameValue}**](${customEventLinkValue})\nServidor: ${customServerValue}\nPartida: ${customStartPlaceValue}\nDestino: ${customDestinationValue}\n\n**Reunión:** <t:${meetingTimestamp}:F> (<t:${meetingTimestamp}:R>)\n**Salida:** <t:${departureTimestamp}:t> (<t:${departureTimestamp}:R>)\n**${state.currentLangData.discord_arrival_time || 'Llegada Aprox.:'}** <t:${arrivalTimestamp}:t> (<t:${arrivalTimestamp}:R>)\n${ingameTimeLine}\n\nDescripción: ${customEventDescriptionValue}`;
        navigator.clipboard.writeText(convoyInfo).then(() => showCopyMessage()).catch(err => console.error(`[copyCustomInfo] Error al copiar: ${err.message}`));
    };

    dom.copyTmpBtn.onclick = () => {
        const customDateValue = dom.customDate.value;
        const customTimeValue = dom.customTime.value;
        const customEventNameValue = dom.customEventName.value || state.currentLangData.canvas_default_event_name || "Evento Personalizado";
        const customEventDescriptionValue = dom.customEventDescription.value || "Sin descripción";
        const customStartPlaceValue = dom.customStartPlace.value || "Sin especificar";
        const customDestinationValue = dom.customDestination.value || "Sin especificar";
        const customServerValue = dom.customServer.value || "Sin especificar";

        if (!customDateValue || !customTimeValue) {
            showCopyMessage(state.currentLangData.error_no_date || "Por favor, selecciona una fecha y hora.");
            return;
        }

        const selectedRegionKey = dom.regionSelect.value;
        const selectedRegion = timezoneRegions[selectedRegionKey];
        let baseZone = 'UTC';
        if (selectedRegion && selectedRegion.zones.length > 0) {
            baseZone = selectedRegion.zones[0].iana_tz;
        }

        let meetingDateTime = DateTime.fromISO(`${customDateValue}T${customTimeValue}:00`, { zone: baseZone });

        const manualOffset = dom.manualOffsetSelect.value;
        if (manualOffset !== 'auto') {
            const offsetMinutes = parseInt(manualOffset, 10) * 60;
            meetingDateTime = DateTime.fromISO(`${customDateValue}T${customTimeValue}:00`).set({ 
                zone: 'utc',
                hour: meetingDateTime.hour,
                minute: meetingDateTime.minute,
                second: meetingDateTime.second,
                millisecond: meetingDateTime.millisecond
            }).plus({ minutes: -offsetMinutes });
        }

        if (!meetingDateTime.isValid) {
            console.error("Invalid meetingDateTime:", meetingDateTime.invalidExplanation);
            showCopyMessage(state.currentLangData.error_invalid_date || "Fecha u hora inválida.");
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

        let tmpInfo = `# ${customEventNameValue}\n\n`;
        if (includeImages) tmpInfo += `![](https://convoyrama.github.io/event/images/default/green.png)\n\n`;
        tmpInfo += `## ${state.currentLangData.tmp_description_title || 'DESCRIPCIÓN'}\n`;
        tmpInfo += `> ${customEventDescriptionValue}\n\n`;
        if (includeImages) tmpInfo += `![](https://convoyrama.github.io/event/images/default/purple.png)\n\n`;
        tmpInfo += `## ${state.currentLangData.tmp_event_info_title || 'INFORMACION DEL EVENTO'}\n`;
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

        const ingameTimeLine = `* ${state.currentLangData.ingame_time_title || 'Hora ingame'}: ${state.currentLangData.meeting_label || 'Reunión'}: ${meetingEmoji} ${state.currentLangData.departure_label || 'Salida'}: ${departureEmoji} ${state.currentLangData.arrival_label || 'Llegada aprox'}: ${arrivalEmoji}`;
        tmpInfo += `${ingameTimeLine}\n\n`;

        if (includeImages) tmpInfo += `![](https://convoyrama.github.io/event/images/default/orange.png)\n\n`;

        tmpInfo += `[${state.currentLangData.tmp_rules_reminder || 'Recuerden seguir las normas de TruckersMP'}](https://truckersmp.com/rules)`;

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
    dom.customServer.addEventListener("input", drawCanvas);
    
    dom.customTime.addEventListener("input", () => { drawCanvas(); updateInGameTimeEmojis(); });
    dom.departureTimeOffset.addEventListener("change", () => { drawCanvas(); updateInGameTimeEmojis(); });

    dom.resetCanvas.addEventListener("click", () => { state.setMapImage(null); state.setCircleImageTop(null); state.setCircleImageBottom(null); state.setLogoImage(null); state.setBackgroundImage(null); state.setDetailImage(null); state.setCircleImageWaypoint(null); dom.mapUpload.value = ""; dom.circleUploadTop.value = ""; dom.circleUploadBottom.value = ""; dom.logoUpload.value = ""; dom.backgroundUpload.value = ""; dom.detailUpload.value = ""; dom.waypointUpload.value = ""; drawCanvas(); });
    drawCanvas();
    updateInGameTimeEmojis();
}
window.onload = init;