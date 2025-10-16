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
    if (!link) {
        return '';
    }
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

export function getUserLevel(userId, userLevelRanges, currentYear) {
    if (!userId || isNaN(userId) || !userLevelRanges || !currentYear) return null;
    const id = parseInt(userId);
    let registrationYear = null;

    const sortedRanges = [...userLevelRanges].sort((a, b) => a.year - b.year);

    for (const range of sortedRanges) {
        if (id <= range.maxId) {
            registrationYear = range.year;
            break;
        }
    }

    if (!registrationYear) {
        registrationYear = currentYear;
    }

    const accountAge = currentYear - registrationYear;

    if (accountAge < 1) return null;
    if (accountAge > 12) return 12;

    return accountAge;
}

export function getVerifiedUserLevel(joinDate, currentYear) {
    if (!joinDate || !currentYear) return null;
    
    const registrationYear = new Date(joinDate.replace(' ', 'T')).getFullYear();
    if (isNaN(registrationYear)) return null;

    const accountAge = currentYear - registrationYear;

    if (accountAge < 1) return 1; // Return 1 for accounts less than a year old
    if (accountAge > 12) return 12;

    return accountAge;
}




