export async function getCurrentDate() {
    const now = Date.now();
    // Simple cache to avoid spamming the APIs
    if (window.currentDate && (now - window.lastDateFetch < 360000)) {
        return window.currentDate;
    }

    const apis = [
        { url: 'https://worldtimeapi.org/api/timezone/Etc/UTC', parse: data => new Date(data.datetime) },
        { url: 'https://timeapi.io/api/Time/current/utc', parse: data => new Date(data.dateTime) },
    ];

    for (const api of apis) {
        try {
            const response = await fetch(api.url);
            const data = await response.json();
            const date = api.parse(data);
            window.currentDate = {
                day: date.getDate().toString().padStart(2, "0"),
                month: (date.getMonth() + 1).toString().padStart(2, "0"),
                year: date.getFullYear(),
                fromInternet: true
            };
            window.lastDateFetch = now;
            return window.currentDate;
        } catch (error) {
            console.error(`Failed to fetch from ${api.url}:`, error);
        }
    }

    // Fallback to local date
    const date = new Date();
    window.currentDate = {
        day: date.getDate().toString().padStart(2, "0"),
        month: (date.getMonth() + 1).toString().padStart(2, "0"),
        year: date.getFullYear(),
        fromInternet: false
    };
    window.lastDateFetch = now;
    return window.currentDate;
}

export async function loadVtcData() {
    try {
        const response = await fetch('./assets/data/vtcData.json');
        if (!response.ok) throw new Error('Failed to load vtcData.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading vtcData.json:', error);
        return { vtcOwners: [], starMap: {} };
    }
}

export async function loadCountries() {
    try {
        const response = await fetch('./assets/data/countries.json');
        if (!response.ok) throw new Error('Failed to load countries.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading countries.json:', error);
        return [];
    }
}
