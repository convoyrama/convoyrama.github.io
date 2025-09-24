import { dom } from './dom-elements.js';
import { config } from './config.js';

async function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
}

async function renderTwemoji(emoji, size) {
    const src = twemoji.parse(emoji, { folder: 'svg', ext: '.svg' }).match(/src="([^"]+)"/)?.[1] || '';
    if (!src) return null;
    return await loadImage(src);
}

export async function generateImage(state) {
    const { ctx, canvas } = dom;
    const scaleFactor = canvas.width / config.baseWidth;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const bgPath = `./assets/images/${state.backgroundTemplate}`;
    try {
        const bgImage = await loadImage(bgPath);
        ctx.filter = `hue-rotate(${state.colorHue}deg) saturate(${state.saturation}%)`;
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
    } catch (error) {
        console.error(`Failed to load background image: ${bgPath}`, error);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw language overlay
    const langPath = `./assets/images/${state.language}.png`;
    try {
        const langImage = await loadImage(langPath);
        ctx.drawImage(langImage, 0, 0, canvas.width, canvas.height);
    } catch (error) {
        console.error(`Failed to load language image: ${langPath}`, error);
    }

    // Draw Title
    ctx.font = `bold ${config.titleFontSize * scaleFactor}px 'Verdana-Bold'`;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(state.customTitle.trim() || "TRUCKERSMP", canvas.width / 2, 40.77 * scaleFactor);

    // Draw Photo
    if (state.userImage) {
        ctx.drawImage(state.userImage, config.photoX * scaleFactor, config.photoY * scaleFactor, config.defaultPhotoSize * scaleFactor, config.defaultPhotoSize * scaleFactor);
    } else {
        const defaultPhoto = await renderTwemoji("👤", config.defaultPhotoSize * scaleFactor);
        if(defaultPhoto) ctx.drawImage(defaultPhoto, config.photoX * scaleFactor, config.photoY * scaleFactor, config.defaultPhotoSize * scaleFactor, config.defaultPhotoSize * scaleFactor);
    }

    // ... (rest of the drawing logic will be added in the next steps)

    updateDownloadLink(state.name);
}

function updateDownloadLink(name) {
    const { canvas, downloadLink } = dom;
    try {
        downloadLink.href = canvas.toDataURL("image/png");
        downloadLink.download = `driver_license_${name || 'unknown'}.png`;
    } catch (error) {
        console.error("Error in toDataURL:", error);
        downloadLink.href = "#";
        downloadLink.download = "";
    }
}
