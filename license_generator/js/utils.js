export function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function getOrdinalSuffix(number, lang) {
    if (lang === "en") {
        if (number === 1) return "st";
        if (number === 2) return "nd";
        if (number === 3) return "rd";
        return "th";
    }
    return "º";
}

export function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode === "") return null;
    const codePoints = countryCode.toUpperCase().split("").map(char => 0x1F1E6 + char.charCodeAt(0) - 65);
    return String.fromCodePoint(...codePoints);
}

export function normalizeLink(link) {
    return link.trim().replace(/\/+\s*$/, '').replace(/\?.*$/, '').replace(/(-[a-z0-9-]+)?$/i, '').toLowerCase();
}

export function validateTruckersmpLink(link, translations, lang) {
    const statusEl = document.getElementById("truckersmpStatus");
    const regex = /^https:\/\/truckersmp\.com\/user\/.+$/;
    const trans = translations[lang];
    if (!regex.test(link)) {
        statusEl.textContent = trans.invalidLink;
        statusEl.className = "invalid";
        return false;
    }
    statusEl.textContent = trans.validLink;
    statusEl.className = "valid";
    return true;
}

export function validateCompanyLink(link, translations, lang) {
    const statusEl = document.getElementById("empresaLinkStatus");
    const regex = /^https:\/\/truckersmp\.com\/vtc\/.+$/;
    const trans = translations[lang];
    if (!regex.test(link)) {
        statusEl.textContent = trans.invalidCompanyLink;
        statusEl.className = "invalid";
        return false;
    }
    statusEl.textContent = trans.validCompanyLink;
    statusEl.className = "valid";
    return true;
}

export function generateLicenseNumber(truckersmpLink, companyLink, countryCode = 'XX') {
    const userMatch = truckersmpLink.match(/truckersmp\.com\/user\/(\d+)/);
    const userId = userMatch ? userMatch[1] : "";
    const vtcMatch = companyLink.match(/truckersmp\.com\/vtc\/(\d+)/);
    const vtcId = vtcMatch ? vtcMatch[1] : "";
    const licenseNumber = userId ? `${countryCode}${userId}` : "";
    return { licenseNumber, userId, vtcId };
}

export function getUserLevel(userId, userLevelRanges) {
    if (!userId || isNaN(userId) || !userLevelRanges || userLevelRanges.length === 0) return null;
    const id = parseInt(userId);
    for (const range of userLevelRanges) {
        if (id <= range.maxId) {
            return range.level;
        }
    }
    // Extrapolate for future IDs
    const lastRange = userLevelRanges[userLevelRanges.length - 1];
    const yearsSinceLast = Math.floor((id - lastRange.maxId) / 400000) + 1; // Approx. 400k users/year
    const extrapolatedLevel = lastRange.level + yearsSinceLast;
    return Math.min(extrapolatedLevel, 12); // Cap at 12
}

export function getVtcLevel(vtcId, vtcLevelRanges) {
    if (!vtcId || isNaN(vtcId) || !vtcLevelRanges) return null;
    const id = parseInt(vtcId);
    for (const range of vtcLevelRanges) {
        if (id <= range.maxId) return range.level;
    }
    return null;
}




