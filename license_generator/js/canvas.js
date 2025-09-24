import { dom } from './dom-elements.js';
import { config, translations } from './config.js';

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

async function generateQR(ctx, value, x, y, size, color) {
    return new Promise(resolve => {
        try {
            const qr = new QRCode({
                content: value,
                width: size,
                height: size,
                color: color,
                background: "transparent",
                ecl: "M",
                padding: 0,
            });
            const svgString = qr.svg();
            const img = new Image();
            img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
            img.onload = () => {
                ctx.drawImage(img, x, y, size, size);
                resolve();
            };
            img.onerror = () => {
                console.error(`Error loading QR SVG for ${value}`);
                resolve();
            };
        } catch (error) {
            console.error(`Error generating QR for ${value}:`, error);
            resolve();
        }
    });
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
        ctx.fillStyle = config.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw VTC Logo as Watermark if enabled
    if (state.watermarkToggle && state.vtcLogoImage) {
        const centerX = ((config.baseWidth - config.watermarkWidth) / 2 + 150) * scaleFactor;
        const centerY = ((config.baseHeight - config.watermarkHeight) / 2 + 100) * scaleFactor;
        ctx.globalAlpha = 0.1;
        ctx.drawImage(state.vtcLogoImage, centerX, centerY, config.watermarkWidth * scaleFactor, config.watermarkHeight * scaleFactor);
        ctx.globalAlpha = 1.0;
    }

    // Draw Title
    ctx.font = `bold ${config.titleFontSize * scaleFactor}px 'Verdana-Bold'`;
    ctx.fillStyle = config.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(state.customTitle.trim() || "TRUCKERSMP", canvas.width / 2, 40.77 * scaleFactor);

    // Draw Photo
    if (state.userImage) {
        ctx.drawImage(state.userImage, config.photoX * scaleFactor, config.photoY * scaleFactor, config.defaultPhotoSize * scaleFactor, config.defaultPhotoSize * scaleFactor);
    } else {
        const defaultPhoto = await renderTwemoji("👤", config.defaultPhotoSize * scaleFactor);
        if (defaultPhoto) ctx.drawImage(defaultPhoto, config.photoX * scaleFactor, config.photoY * scaleFactor, config.defaultPhotoSize * scaleFactor, config.defaultPhotoSize * scaleFactor);
    }

    // Draw VTC Logo
    if (state.vtcLogoImage) {
        const vtcLogoSize = config.vtcLogoSize * scaleFactor;
        const vtcLogoX = (config.qrX - 2 * config.qrSize - 2 * config.qrSpacing) * scaleFactor;
        ctx.drawImage(state.vtcLogoImage, vtcLogoX, config.qrY * scaleFactor, vtcLogoSize, vtcLogoSize);
    }

    // Draw Name
    ctx.font = `bold ${config.textFontSize * scaleFactor}px 'Verdana-Bold'`;
    ctx.fillStyle = config.color;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    
    const displayName = state.name.toUpperCase();
    ctx.fillText(displayName, config.textX * scaleFactor, 280 * scaleFactor);

    // Draw Gold Star if owner
    const isOwner = state.vtcData.vtcOwners.some(owner => owner.profileLink === state.truckersmpLink && owner.companyLink === state.companyLink);
    if (isOwner) {
        const nameWidth = ctx.measureText(displayName).width;
        ctx.fillStyle = '#FFD700'; // Gold color
        ctx.fillText(' ✵', (config.textX * scaleFactor) + nameWidth, 280 * scaleFactor);
    }

    // Reset fillStyle for subsequent drawings
    ctx.fillStyle = config.color;

    // Draw Country
    const selectedCountry = state.countries.find(c => c.code === state.country);
    if (selectedCountry) {
        const nameKey = `name_${state.language}`;
        const countryName = selectedCountry[nameKey] || selectedCountry.name_en;
        ctx.fillText(countryName.toUpperCase(), config.textX * scaleFactor, 314 * scaleFactor);
        try {
            const flagEmoji = await renderTwemoji(selectedCountry.emoji, config.flagSize * scaleFactor);
            if (flagEmoji) {
                ctx.drawImage(flagEmoji, config.flagX * scaleFactor, config.flagY * scaleFactor, config.flagSize * scaleFactor, config.flagSize * scaleFactor);
            }
        } catch (e) { console.error('failed to render flag', e); }
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
            ctx.drawImage(promodsImage, config.promodsX * scaleFactor, config.promodsY * scaleFactor, config.logoWidth * scaleFactor, config.logoHeight * scaleFactor);
        } catch (error) {
            console.error('Failed to load promods image', error);
        }
    }

    // Draw DBUS Logo
    if (state.dbusworldToggle) {
        try {
            const dbusImage = await loadImage('./license_generator/images/dbusworld.png');
            const dbusworldY = state.promodsToggle ? config.dbusworldY : config.promodsY;
            ctx.drawImage(dbusImage, config.dbusworldX * scaleFactor, dbusworldY * scaleFactor, config.logoWidth * scaleFactor, config.logoHeight * scaleFactor);
        } catch (error) {
            console.error('Failed to load dbusworld image', error);
        }
    }
    
    // Draw QR Codes
    const qrColor = state.qrColorToggle ? "#F0F0F0" : "#141414";
    const qrSize = config.qrSize * scaleFactor;
    if (state.truckersmpLink) {
        await generateQR(ctx, state.truckersmpLink, config.qrX * scaleFactor, config.qrY * scaleFactor, qrSize, qrColor);
    }
    if (state.companyLink) {
        await generateQR(ctx, state.companyLink, (config.qrX - config.qrSize - config.qrSpacing) * scaleFactor, config.qrY * scaleFactor, qrSize, qrColor);
    }
    await generateQR(ctx, "https://convoyrama.github.io/id.html", (config.qrX + config.qrSize + config.qrSpacing) * scaleFactor, config.qrY * scaleFactor, qrSize, qrColor);


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
