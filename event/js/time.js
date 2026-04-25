import { dom } from './dom.js';
import { pad } from './utils.js';
import { currentLangData } from './state.js';

const { DateTime } = luxon;

export function getGameTime(utcDateTime) {
    const GAME_TIME_ANCHOR_UTC_MINUTES = 20 * 60 + 40;
    const TIME_SCALE = 6;
    const totalMinutesUTC = utcDateTime.hour * 60 + utcDateTime.minute;
    let realMinutesSinceAnchor = totalMinutesUTC - GAME_TIME_ANCHOR_UTC_MINUTES;
    if (realMinutesSinceAnchor < 0) { realMinutesSinceAnchor += 24 * 60; }
    let gameMinutes = realMinutesSinceAnchor * TIME_SCALE;
    gameMinutes = gameMinutes % 1440;
    const gameHours = Math.floor(gameMinutes / 60);
    const remainingMinutes = Math.floor(gameMinutes % 60);
    return { hours: gameHours, minutes: remainingMinutes };
}

export function updateLiveClocks() {
    const now = DateTime.local();
    dom.localTimeDisplay.textContent = now.toLocaleString(DateTime.TIME_WITH_SECONDS);
    const gameTime = getGameTime(now.toUTC());
    const gameHours = pad(gameTime.hours);
    const gameMinutes = pad(gameTime.minutes);
    dom.gameTimeDisplay.textContent = `${gameHours}:${gameMinutes}`;
    dom.gameTimeEmoji.textContent = getDetailedDayNightIcon(gameTime.hours);
}

export function getDetailedDayNightIcon(hours) {
    if (hours >= 6 && hours < 8) return '🌅';
    if (hours >= 8 && hours < 19) return '☀️';
    if (hours >= 19 && hours < 21) return '🌇';
    return '🌙';
}

export function formatTime(d) { return d.toFormat('HH:mm'); }

export function formatDateForDisplay(d) {
    const months = currentLangData.months || ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    return `${d.day} de ${months[d.month - 1]} de ${d.year}`;
}

export function formatDateForDisplayShort(d) {
    const day = d.day;
    const months = currentLangData.months_short || ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${day} ${months[d.month - 1]}`;
}