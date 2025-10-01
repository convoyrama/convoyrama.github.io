import { dom } from './dom.js';
import * as state from './state.js';
import { timezoneRegions } from './config.js';
import { updateLiveClocks, formatDateForDisplay, getGameTime, getDetailedDayNightIcon } from './time.js';
import { fetchLanguage, applyTranslations } from './i18n.js';
import { drawCanvas, initCanvasEventListeners } from './canvas.js';
import { showCopyMessage, getUnixTimestamp } from './utils.js';

async function loadLanguage(lang) {
    const langData = await fetchLanguage(lang);
    state.setCurrentLangData(langData);
    applyTranslations(langData);
    drawCanvas();
}

function init() {
    twemoji.parse(document.body);
    const flags = document.querySelectorAll(".flag-emoji");
    flags.forEach(flag => { flag.addEventListener("click", () => { const lang = flag.getAttribute("data-lang"); loadLanguage(lang); flags.forEach(f => f.classList.remove('selected')); flag.classList.add('selected'); }); });
    const regionSelect = document.getElementById('region-select');
    for (const regionKey in timezoneRegions) { const option = document.createElement('option'); option.value = regionKey; option.setAttribute('data-i18n', timezoneRegions[regionKey].name); option.textContent = regionKey; regionSelect.appendChild(option); }
    regionSelect.addEventListener('change', (e) => { state.setSelectedRegion(e.target.value); drawCanvas(); });
    dom.manualOffsetSelect.addEventListener('change', drawCanvas);
    loadLanguage('es'); document.querySelector('.flag-emoji[data-lang="es"]').classList.add('selected');
    updateLiveClocks(); setInterval(updateLiveClocks, 1000);
    const userNow = new Date();
    dom.customDate.value = userNow.toISOString().split('T')[0];
    dom.customDateDisplay.textContent = `Fecha seleccionada: ${formatDateForDisplay(userNow)}`;
    dom.customDate.onchange = () => { const customDateObj = new Date(dom.customDate.value); dom.customDateDisplay.textContent = `Fecha seleccionada: ${formatDateForDisplay(customDateObj)}`; drawCanvas(); };
    dom.copyCustomInfo.onclick = () => {
        const customDateValue = dom.customDate.value, customTimeValue = dom.customTime.value, customEventNameValue = dom.customEventName.value || "Evento Personalizado";
        const customEventLinkValue = dom.customEventLink.value || "https://convoyrama.github.io/events.html", customEventDescriptionValue = dom.customEventDescription.value || "Sin descripción";
        const customStartPlaceValue = dom.customStartPlace.value || "Sin especificar", customDestinationValue = dom.customDestination.value || "Sin especificar", customServerValue = dom.customServer.value || "Sin especificar";
        if (!customDateValue || !customTimeValue) { showCopyMessage(state.currentLangData.error_no_date || "Por favor, selecciona una fecha y hora."); return; }
        const [hh, mm] = customTimeValue.split(":").map(Number);
        const dateParts = customDateValue.split('-');
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        const customDateObj = new Date(year, month, day);
        customDateObj.setHours(hh, mm, 0, 0);
        const meetingTimestamp = getUnixTimestamp(customDateObj);
        const meetingGameTime = getGameTime(customDateObj);
        const meetingEmoji = getDetailedDayNightIcon(meetingGameTime.hours);
        const departureOffset = parseInt(dom.departureTimeOffset.value, 10) * 60 * 1000;
        const departureDate = new Date(customDateObj.getTime() + departureOffset);
        const departureTimestamp = getUnixTimestamp(departureDate);
        const departureGameTime = getGameTime(departureDate);
        const departureEmoji = getDetailedDayNightIcon(departureGameTime.hours);

        const arrivalDate = new Date(departureDate.getTime() + 50 * 60000);
        const arrivalTimestamp = getUnixTimestamp(arrivalDate);
        const arrivalGameTime = getGameTime(arrivalDate);
        const arrivalEmoji = getDetailedDayNightIcon(arrivalGameTime.hours);

        let convoyInfo = `[**${customEventNameValue}**](${customEventLinkValue})\nServidor: ${customServerValue}\nPartida: ${customStartPlaceValue}\nDestino: ${customDestinationValue}\n\n**Reunión:** <t:${meetingTimestamp}:F> (<t:${meetingTimestamp}:R>) ${meetingEmoji}\n**Salida:** <t:${departureTimestamp}:t> (<t:${departureTimestamp}:R>) ${departureEmoji}\n**${state.currentLangData.discord_arrival_time || 'Llegada Aprox.:'}** <t:${arrivalTimestamp}:t> (<t:${arrivalTimestamp}:R>) ${arrivalEmoji}\n\nDescripción: ${customEventDescriptionValue}`;
        navigator.clipboard.writeText(convoyInfo).then(() => showCopyMessage()).catch(err => console.error(`[copyCustomInfo] Error al copiar: ${err.message}`));
    };

    dom.copyTmpBtn.onclick = () => {
        const customDateValue = dom.customDate.value;
        const customTimeValue = dom.customTime.value;
        const customEventNameValue = dom.customEventName.value || "Evento Personalizado";
        const customEventLinkValue = dom.customEventLink.value || "https://convoyrama.github.io/events.html";
        const customEventDescriptionValue = dom.customEventDescription.value || "Sin descripción";
        const customStartPlaceValue = dom.customStartPlace.value || "Sin especificar";
        const customDestinationValue = dom.customDestination.value || "Sin especificar";
        const customServerValue = dom.customServer.value || "Sin especificar";

        if (!customDateValue || !customTimeValue) {
            showCopyMessage(state.currentLangData.error_no_date || "Por favor, selecciona una fecha y hora.");
            return;
        }

        const [hh, mm] = customTimeValue.split(":").map(Number);
        const dateParts = customDateValue.split('-');
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        const customDateObj = new Date(Date.UTC(year, month, day, hh, mm));

        const departureOffset = parseInt(dom.departureTimeOffset.value, 10) * 60 * 1000;
        const departureDate = new Date(customDateObj.getTime() + departureOffset);

        const meetingTimeUTC = customDateObj.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });
        const departureTimeUTC = departureDate.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });

        let tmpInfo = `** ${state.currentLangData.tmp_description_title || 'DESCRIPCIÓN'} **\n`;
        tmpInfo += `> ${customEventDescriptionValue}\n\n`;
        tmpInfo += `** ${state.currentLangData.tmp_event_info_title || 'INFORMACION DEL EVENTO'} **\n`;
        tmpInfo += `* 🗓️ ${state.currentLangData.tmp_date_label || 'Fecha (UTC)'}: ${customDateObj.toLocaleDateString('en-GB', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' })}\n`;
        tmpInfo += `* ⏰ ${state.currentLangData.tmp_meeting_time_label || 'Reunión (UTC)'}: ${meetingTimeUTC}\n`;
        tmpInfo += `* 🚚 ${state.currentLangData.tmp_departure_time_label || 'Salida (UTC)'}: ${departureTimeUTC}\n`;
        tmpInfo += `* 🖥️ ${state.currentLangData.tmp_server_label || 'Servidor'}: ${customServerValue}\n`;
        tmpInfo += `* ➡️ ${state.currentLangData.tmp_start_place_label || 'Ciudad de Inicio'}: ${customStartPlaceValue}\n`;
        tmpInfo += `* ⬅️ ${state.currentLangData.tmp_destination_label || 'Ciudad de Destino'}: ${customDestinationValue}\n\n`;

        // Generar tabla de zonas horarias
        const selectedRegionKey = document.getElementById('region-select').value;
        const selectedRegion = timezoneRegions[selectedRegionKey];
        if (selectedRegion) {
            tmpInfo += `| | |\n|:--|:--|\n`; // Encabezado de la tabla para TMP
            selectedRegion.zones.forEach(zone => {
                const zoneTime = new Date(customDateObj.getTime() + zone.offset * 3600 * 1000).toLocaleTimeString('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });
                const tzName = state.currentLangData[zone.key] || zone.key;
                tmpInfo += `| ${tzName} | ${zoneTime} |\n`;
            });
        }

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
    dom.downloadCanvas.addEventListener("click", () => {
        const canvas = dom.mapCanvas;
        const link = document.createElement("a");
        const eventDate = dom.customDate.value;
        let dateString;
        if (eventDate) {
            dateString = eventDate;
        } else {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            dateString = `${year}-${month}-${day}`;
        }
        link.download = `convoy-map-${dateString}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
    dom.customEventName.addEventListener("input", drawCanvas);
    dom.customStartPlace.addEventListener("input", drawCanvas);
    dom.customDestination.addEventListener("input", drawCanvas);
    dom.customServer.addEventListener("input", drawCanvas);
    dom.customTime.addEventListener("input", drawCanvas);
    dom.departureTimeOffset.addEventListener("change", drawCanvas);
    dom.resetCanvas.addEventListener("click", () => { state.setMapImage(null); state.setCircleImageTop(null); state.setCircleImageBottom(null); state.setLogoImage(null); state.setBackgroundImage(null); state.setDetailImage(null); state.setCircleImageWaypoint(null); dom.mapUpload.value = ""; dom.circleUploadTop.value = ""; dom.circleUploadBottom.value = ""; dom.logoUpload.value = ""; dom.backgroundUpload.value = ""; dom.detailUpload.value = ""; dom.waypointUpload.value = ""; drawCanvas(); });
    drawCanvas();
}

window.onload = init;
