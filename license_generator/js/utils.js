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
