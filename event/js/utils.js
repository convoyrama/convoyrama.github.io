import { dom } from './dom.js';

export function showCopyMessage(message = "¡Información copiada al portapapeles!") {
    dom.copyMessage.textContent = message;
    dom.copyMessage.style.display = "block";
    setTimeout(() => { dom.copyMessage.style.display = "none"; }, 2000);
}

export function wrapText(ctx, text, maxWidth) {
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

export function pad(n) { return n < 10 ? "0" + n : n; }

export function getUnixTimestamp(date) { return Math.floor(date.getTime() / 1000); }