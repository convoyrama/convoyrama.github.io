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
function formatDateForDisplayShort(d) {
    const day = d.getDate();
    const months = currentLangData.months_short || ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${day} ${months[d.getMonth()]}`;
}
function getUnixTimestamp(date) { return Math.floor(date.getTime() / 1000); }
