import { normalizeLink, generateLicenseNumber, getUserLevel } from './utils.js';

// Configurar la ruta base de Twemoji para usar los assets locales
if (typeof twemoji !== 'undefined') {
    twemoji.base = './twemoji-14.0.2/assets/';
}

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
    const src = twemoji.parse(emoji, { folder: 'svg', ext: '.svg' }).match(/src="([^"]+)"/)?. [1] || '';
    if (!src) return null;
    return await loadImage(src);
}

export async function generateUserbar(state, dom) {
    const canvas = dom.userbarCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const userbarBg = dom.userbarBackgroundSelect.value;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const bgPath = `./license_generator/images/${userbarBg}`;
    try {
        const bgImage = await loadImage(bgPath);
        const sourceX = (bgImage.width - canvas.width) / 2;
        const sourceY = (bgImage.height - canvas.height) / 2;
        ctx.drawImage(bgImage, sourceX, sourceY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    } catch (error) {
        console.error(`Failed to load background image: ${bgPath}`, error);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const textColor = 'rgb(240, 240, 240)';
    ctx.fillStyle = textColor;
    ctx.font = `bold 12px 'Verdana'`;
    ctx.textBaseline = 'middle';

    // Shadow
    ctx.shadowColor = 'rgba(20, 20, 20, 0.5)';
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 4;

    const normalizedTruckersmpLink = normalizeLink(state.truckersmpLink);
    const normalizedCompanyLink = normalizeLink(state.companyLink);
    const { userId } = generateLicenseNumber(normalizedTruckersmpLink, normalizedCompanyLink, state.country);

    // --- Right side ---
    let rightX = canvas.width - 10;

    // Draw cr.png
    try {
        const crImage = await loadImage('./license_generator/images/cr.png');
        const crImageHeight = 20;
        const crImageWidth = (crImage.width / crImage.height) * crImageHeight;
        rightX -= crImageWidth;
        ctx.drawImage(crImage, rightX, (canvas.height - crImageHeight) / 2, crImageWidth, crImageHeight);
    } catch (error) {
        console.error('Failed to load cr.png watermark', error);
    }

    // Draw VTC Logo
    if (state.vtcLogoImage) {
        rightX -= 5; // spacing
        const vtcLogoHeight = 20;
        const vtcLogoWidth = (state.vtcLogoImage.width / state.vtcLogoImage.height) * vtcLogoHeight;
        rightX -= vtcLogoWidth;
        ctx.drawImage(state.vtcLogoImage, rightX, (canvas.height - vtcLogoHeight) / 2, vtcLogoWidth, vtcLogoHeight);
    }

    // --- Left side ---
    let leftX = 10;

    // Draw Rank Image
    const userLevel = getUserLevel(userId, state.levelRanges.user, state.currentDate ? state.currentDate.year : null);
    if (state.rankToggle && userLevel) {
        try {
            const rankImage = await loadImage(`./license_generator/rank/${userLevel}.png`);
            const rankImageHeight = 20;
            const rankImageWidth = (rankImage.width / rankImage.height) * rankImageHeight;
            ctx.drawImage(rankImage, leftX, (canvas.height - rankImageHeight) / 2, rankImageWidth, rankImageHeight);
            leftX += rankImageWidth + 5;
        } catch (error) {
            console.error(`Failed to load rank image for level ${userLevel}`, error);
        }
    }

    // Draw flag
    const selectedCountry = state.countries.find(c => c.code === state.country);
    if (selectedCountry) {
        try {
            const flagEmoji = await renderTwemoji(selectedCountry.emoji, 20);
            if (flagEmoji) {
                ctx.drawImage(flagEmoji, leftX, (canvas.height - 20) / 2, 20, 20);
                leftX += 20 + 5;
            }
        } catch (e) { console.error('failed to render flag', e); }
    }

    // Draw Name and Star
    const isOwner = state.vtcData.vtcOwners.some(owner => normalizeLink(owner.profileLink) === normalizedTruckersmpLink && normalizeLink(owner.companyLink) === normalizedCompanyLink);
    const name = state.name || 'Anonymous';
    ctx.fillText(name, leftX, canvas.height / 2);
    leftX += ctx.measureText(name).width;

    if (isOwner) {
        ctx.save();
        ctx.fillStyle = '#FFD700';
        ctx.fillText(' ✵', leftX, canvas.height / 2);
        ctx.restore();
        leftX += ctx.measureText(' ✵').width;
    }
    leftX += 5;

    // Draw User ID
    if (userId) {
        ctx.fillText(`#${userId}`, leftX, canvas.height / 2);
        leftX += ctx.measureText(`#${userId}`).width + 5;
    }

    // Draw TruckersMP Logo
    try {
        const truckersmpImage = await loadImage('./license_generator/images/truckersmp-logo-sm.png');
        const logoHeight = 20;
        const logoWidth = (truckersmpImage.width / truckersmpImage.height) * logoHeight;
        ctx.drawImage(truckersmpImage, leftX, (canvas.height - logoHeight) / 2, logoWidth, logoHeight);
    } catch (error) {
        console.error('Failed to load truckersmp-logo-sm image', error);
    }

    // Reset shadow
    ctx.shadowColor = 'transparent';

    // Update download link
    const downloadLink = dom.downloadUserbar;
    if(downloadLink) {
        downloadLink.href = canvas.toDataURL('image/png');
        downloadLink.download = `userbar_${state.name || 'unknown'}.png`;
    }
}
