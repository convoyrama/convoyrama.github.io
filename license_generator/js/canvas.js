import { dom } from './dom-elements.js';
import { config, translations } from './config.js';
import { normalizeLink, generateLicenseNumber, getUserLevel } from './utils.js';

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
    console.log('Canvas width:', canvas.width, 'Canvas height:', canvas.height);
    const scaleFactor = canvas.width / config.baseWidth;
    console.log('Config baseWidth:', config.baseWidth, 'Scale Factor:', scaleFactor);
    const textColor = state.textColorToggle ? 'rgb(20, 20, 20)' : 'rgb(240, 240, 240)';

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

    // Draw top-left watermark (cr.png)
    try {
        ctx.globalAlpha = 0.1; // 10% opacity
        const crImage = await loadImage('./license_generator/images/cr.png');
        const crImageHeight = 80 * scaleFactor;
        const crImageWidth = (crImage.width / crImage.height) * crImageHeight;
        const crX = 25 * scaleFactor;
        const crY = (81.535 * scaleFactor / 2) - (crImageHeight / 2);
        ctx.drawImage(crImage, crX, crY, crImageWidth, crImageHeight);
        ctx.globalAlpha = 1.0; // Reset opacity
    } catch (error) {
        console.error('Failed to load cr.png watermark', error);
    }

    // Draw Title
    ctx.font = `bold ${config.titleFontSize * scaleFactor}px 'Verdana-Bold'`;
    ctx.fillStyle = textColor;
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

    // --- Text & Rank Drawing --- //
    const normalizedTruckersmpLink = normalizeLink(state.truckersmpLink);
    const normalizedCompanyLink = normalizeLink(state.companyLink);
    const { licenseNumber, userId, vtcId } = generateLicenseNumber(normalizedTruckersmpLink, normalizedCompanyLink, state.country);

    // Draw Rank Image
    const userLevel = getUserLevel(userId, state.levelRanges.user, state.currentDate ? state.currentDate.year : null);
    console.log("User level for rank:", userLevel);
    if (state.rankToggle && userLevel) {
        try {
            const rankImage = await loadImage(`./license_generator/rank/${userLevel}.png`);
            const rankImageHeight = 64 * scaleFactor; // 20% smaller than 80
            const rankImageWidth = (rankImage.width / rankImage.height) * rankImageHeight;
            const rankX = canvas.width - (25 * scaleFactor) - rankImageWidth;
            const rankY = (81.535 * scaleFactor / 2) - (rankImageHeight / 2);
            ctx.drawImage(rankImage, rankX, rankY, rankImageWidth, rankImageHeight);
        } catch (error) {
            console.error(`Failed to load rank image for level ${userLevel}`, error);
        }
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const t = translations[state.language] || translations.es;
    const selectedCountry = state.countries.find(c => c.code === state.country);

    // Prepare data for drawing
    const isOwner = state.vtcData.vtcOwners.some(owner => normalizeLink(owner.profileLink) === normalizedTruckersmpLink && normalizeLink(owner.companyLink) === normalizedCompanyLink);
    const countryName = selectedCountry ? (selectedCountry[`name_${state.language}`] || selectedCountry.name_en) : '';
    const dateStr = state.currentDate ? `${state.currentDate.day}/${state.currentDate.month}/${state.currentDate.year}` : '';
    const dateSymbol = state.currentDate ? (state.currentDate.fromInternet ? ' ✓' : ' ✗') : '';

    // Define text lines in order
    const lines = [
        { label: t.canvasName, value: state.name, isName: true },
        { label: t.canvasCountry, value: countryName.toUpperCase() },
        { label: t.canvasLicenseNo, value: licenseNumber },
        { label: t.canvasDate, value: dateStr + dateSymbol },
    ];
    if (state.nickname) {
        lines.push({ label: t.canvasTag, value: state.nickname });
    }

    // Draw lines
    let yPos = (config.photoY + config.defaultPhotoSize + 40) * scaleFactor;
    lines.forEach(line => {
        ctx.font = `bold ${config.textFontSize * scaleFactor}px 'Verdana-Bold'`;
        ctx.fillStyle = textColor;
        ctx.fillText(line.label, config.labelX * scaleFactor, yPos);

        ctx.font = `bold ${config.textFontSize * scaleFactor}px 'Verdana-Bold'`;
        if (line.isName) {
            const nameWithoutStar = line.value;
            ctx.fillText(nameWithoutStar, config.textX * scaleFactor, yPos);
            if (isOwner) {
                const nameWidth = ctx.measureText(nameWithoutStar).width;
                ctx.fillStyle = '#FFD700';
                ctx.fillText(' ✵', (config.textX * scaleFactor) + nameWidth, yPos);
            }
        } else {
            ctx.fillText(line.value, config.textX * scaleFactor, yPos);
        }
        yPos += config.lineHeight * scaleFactor;
    });

    // --- Right-aligned items (VTC Logo, QRs, Flag) ---
    const itemSize = config.vtcLogoSize * scaleFactor;
    const itemSpacing = config.qrSpacing * scaleFactor;
    const rightMargin = 20 * scaleFactor;
    const itemY = config.qrY * scaleFactor;

    const qrId_x = canvas.width - rightMargin - itemSize;
    const qrUser_x = qrId_x - itemSize - itemSpacing;
    const qrCompany_x = qrUser_x - itemSize - itemSpacing;
    const vtcLogo_x = qrCompany_x - itemSize - itemSpacing;

    const flag_x = qrId_x;
    const flag_y = itemY + itemSize + itemSpacing;

    // Draw VTC Logo (in its new position)
    if (state.vtcLogoImage) {
        ctx.drawImage(state.vtcLogoImage, vtcLogo_x, itemY, itemSize, itemSize);
    }

    // Draw QR Codes (in their new positions)
    const qrColor = state.qrColorToggle ? "#F0F0F0" : "#141414";
    if (state.truckersmpLink) {
        await generateQR(ctx, normalizedTruckersmpLink, qrUser_x, itemY, itemSize, qrColor);
    }
    if (state.companyLink) {
        await generateQR(ctx, normalizedCompanyLink, qrCompany_x, itemY, itemSize, qrColor);
    }
    await generateQR(ctx, "https://convoyrama.github.io/id.html", qrId_x, itemY, itemSize, qrColor);

    // Draw flag emoji (in its new position)
    if (selectedCountry) {
        try {
            const flagEmoji = await renderTwemoji(selectedCountry.emoji, itemSize);
            if (flagEmoji) {
                ctx.drawImage(flagEmoji, flag_x, flag_y, itemSize, itemSize);
            }
        } catch (e) { console.error('failed to render flag', e); }
    }
    
    // Draw VTC Logo as Watermark if enabled
    if (state.watermarkToggle && state.vtcLogoImage) {
        const watermarkWidth = config.watermarkWidth * scaleFactor;
        const watermarkHeight = config.watermarkHeight * scaleFactor;
        const watermarkX = (flag_x + itemSize) - watermarkWidth;
        const watermarkY = flag_y + itemSize + itemSpacing;

        ctx.globalAlpha = 0.1;
        ctx.drawImage(state.vtcLogoImage, watermarkX, watermarkY, watermarkWidth, watermarkHeight);
        ctx.globalAlpha = 1.0;
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

    // Draw Silver Stars
    const starConfig = state.starMap[normalizedTruckersmpLink] || { silver: 0 };
    const silverStarCount = starConfig.silver || 0;
    if (silverStarCount > 0) {
        const totalStarHeight = silverStarCount * config.textFontSize * scaleFactor;
        ctx.font = `bold ${config.textFontSize * scaleFactor}px ${config.font}`;
        ctx.textAlign = "center";
        const starX = (config.photoX / 2) * scaleFactor;
        let currentY = (canvas.height / 2) - (totalStarHeight / 2) + (config.textFontSize * scaleFactor / 2);
        ctx.fillStyle = "#C0C0C0"; // Silver color
        for (let i = 0; i < silverStarCount; i++) {
            ctx.fillText("★", starX, currentY);
            currentY += config.textFontSize * scaleFactor;
        }
        ctx.textAlign = "left";
    }

    // --- Draw Bottom Title ---
    const selectedTitle = state.titles.find(t => t.key === state.selectedTitleKey);
    if (selectedTitle) {
        const titleText = selectedTitle[state.language] || selectedTitle.en;
        const titleY = config.baseHeight - 5;
        ctx.font = `bold ${config.footerFontSize * scaleFactor}px 'Verdana-Bold'`;
        ctx.fillStyle = 'rgb(240, 240, 240)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.shadowColor = 'rgb(20, 20, 20)';
        ctx.shadowOffsetX = 1 * scaleFactor;
        ctx.shadowOffsetY = 1 * scaleFactor;
        ctx.shadowBlur = 2 * scaleFactor;
        ctx.fillText(titleText.toUpperCase(), canvas.width / 2, titleY * scaleFactor);
        ctx.shadowColor = 'transparent'; // Reset shadow
    }
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