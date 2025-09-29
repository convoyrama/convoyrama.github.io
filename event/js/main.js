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

        let convoyInfo = `[**${formatDateForDisplay(customDateObj)} - ${customEventNameValue}**](${customEventLinkValue})\nServidor: ${customServerValue}\nPartida: ${customStartPlaceValue}\nDestino: ${customDestinationValue}\n\n**Reunión:** <t:${meetingTimestamp}:F> (<t:${meetingTimestamp}:R>) ${meetingEmoji}\n**Salida:** <t:${departureTimestamp}:t> (<t:${departureTimestamp}:R>) ${departureEmoji}\n**${state.currentLangData.discord_arrival_time || 'Llegada Aprox.:'}** <t:${arrivalTimestamp}:t> (<t:${arrivalTimestamp}:R>) ${arrivalEmoji}\n\nDescripción: ${customEventDescriptionValue}`;
        navigator.clipboard.writeText(convoyInfo).then(() => showCopyMessage()).catch(err => console.error(`[copyCustomInfo] Error al copiar: ${err.message}`));
    };
    initCanvasEventListeners();
    dom.textAlign.addEventListener("change", drawCanvas);
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
    dom.resetCanvas.addEventListener("click", () => { state.setMapImage(null); state.setCircleImageTop(null); state.setCircleImageBottom(null); state.setLogoImage(null); state.setBackgroundImage(null); state.setDetailImage(null); dom.mapUpload.value = ""; dom.circleUploadTop.value = ""; dom.circleUploadBottom.value = ""; dom.logoUpload.value = ""; dom.backgroundUpload.value = ""; dom.detailUpload.value = ""; drawCanvas(); });
    drawCanvas();
}

window.onload = init;