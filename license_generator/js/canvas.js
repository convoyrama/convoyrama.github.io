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
    const bgPath = `./license_generator/images/${state.backgroundTemplate}`;
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

    // Draw Watermark
    if (state.watermarkToggle) {
        try {
            const watermarkImage = await loadImage('./license_generator/images/cr.png');
            ctx.globalAlpha = 0.2;
            const watermarkSize = config.watermarkWidth * scaleFactor;
            ctx.drawImage(watermarkImage, (canvas.width - watermarkSize) / 1.5, (canvas.height - watermarkSize) / 1.5, watermarkSize, watermarkSize);
            ctx.globalAlpha = 1.0;
        } catch (error) {
            console.error('Failed to load watermark image', error);
        }
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
    
    // Draw VTC Logo
    if (state.vtcLogoImage) {
        const vtcLogoSize = config.vtcLogoSize * scaleFactor;
        ctx.drawImage(state.vtcLogoImage, (config.photoX + config.defaultPhotoSize + 20) * scaleFactor, config.photoY * scaleFactor, vtcLogoSize, vtcLogoSize);
    }

    // Draw Name
    ctx.font = `bold ${config.textFontSize * scaleFactor}px 'Verdana-Bold'`;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(state.name.toUpperCase(), config.textX * scaleFactor, 280 * scaleFactor);

    // Draw Country
    const selectedCountry = state.countries.find(c => c.code === state.country);
    if (selectedCountry) {
        ctx.fillText(selectedCountry.name.toUpperCase(), config.textX * scaleFactor, 314 * scaleFactor);
        try {
            const flagEmoji = await renderTwemoji(selectedCountry.emoji, config.flagSize * scaleFactor);
            if (flagEmoji) {
                ctx.drawImage(flagEmoji, config.flagX * scaleFactor, config.flagY * scaleFactor, config.flagSize * scaleFactor, config.flagSize * scaleFactor);
            }
        } catch(e) { console.error('failed to render flag', e); }
    }

    // Draw other text fields
    const t = translations[state.language] || translations.es;
    ctx.font = `${config.textFontSize * scaleFactor}px 'Verdana'`;
    ctx.fillText(t.canvasLicenseNo, config.labelX * scaleFactor, 348 * scaleFactor);
    ctx.fillText(t.canvasLevel, config.labelX * scaleFactor, 382 * scaleFactor);
    ctx.fillText(t.canvasDate, config.labelX * scaleFactor, 416 * scaleFactor);

    // Draw Nickname if available
    if (state.nickname) {
        ctx.fillText(t.canvasTag, config.labelX * scaleFactor, 450 * scaleFactor);
        ctx.fillText(state.nickname, config.textX * scaleFactor, 450 * scaleFactor);
    }

    // Draw ProMods Logo
    if (state.promodsToggle) {
        try {
            const promodsImage = await loadImage('./license_generator/images/promods.png');
            ctx.drawImage(promodsImage, config.promodsX * scaleFactor, config.promodsY * scaleFactor, promodsImage.width * scaleFactor, promodsImage.height * scaleFactor);
        } catch (error) {
            console.error('Failed to load promods image', error);
        }
    }

    // Draw DBUS Logo
    if (state.dbusworldToggle) {
        try {
            const dbusImage = await loadImage('./license_generator/images/dbusworld.png');
            ctx.drawImage(dbusImage, config.dbusworldX * scaleFactor, config.dbusworldY * scaleFactor, dbusImage.width * scaleFactor, dbusImage.height * scaleFactor);
        } catch (error) {
            console.error('Failed to load dbusworld image', error);
        }
    }

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
