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
function showCopyMessage(message = "¡Información copiada al portapapeles!") {
    dom.copyMessage.textContent = message;
    dom.copyMessage.style.display = "block";
    setTimeout(() => { dom.copyMessage.style.display = "none"; }, 2000);
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line.trim());
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line.trim());
    return lines;
}