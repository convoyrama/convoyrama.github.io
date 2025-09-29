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