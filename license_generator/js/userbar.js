import { dom } from './dom-elements.js';
import { config } from './config.js';
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
    const src = twemoji.parse(emoji, { folder: 'svg', ext: '.svg' }).match(/src="([^"]+)"/)?. [1] || '';
    if (!src) return null;
    return await loadImage(src);
}

export async function generateUserbar(state) {
    const canvas = document.getElementById('userbar-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const userbarBg = document.getElementById('userbarBackgroundSelect').value;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const bgPath = `./fondos/userbar/${userbarBg}`;
    try {
        const bgImage = await loadImage(bgPath);
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    } catch (error) {
        console.error(`Failed to load background image: ${bgPath}`, error);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const textColor = 'rgb(240, 240, 240)';
    ctx.fillStyle = textColor;
    ctx.font = `bold 10px 'Verdana'`;
    ctx.textBaseline = 'middle';

    let xPos = 5;

    // Draw cr.png
    try {
        const crImage = await loadImage('./license_generator/images/cr.png');
        const crImageHeight = 15;
        const crImageWidth = (crImage.width / crImage.height) * crImageHeight;
        ctx.drawImage(crImage, xPos, (canvas.height - crImageHeight) / 2, crImageWidth, crImageHeight);
        xPos += crImageWidth + 5;
    } catch (error) {
        console.error('Failed to load cr.png watermark', error);
    }

    // Draw Name and Star
    const normalizedTruckersmpLink = normalizeLink(state.truckersmpLink);
    const normalizedCompanyLink = normalizeLink(state.companyLink);
    const isOwner = state.vtcData.vtcOwners.some(owner => normalizeLink(owner.profileLink) === normalizedTruckersmpLink && normalizeLink(owner.companyLink) === normalizedCompanyLink);

    const name = state.name || 'Anonymous';
    ctx.fillText(name, xPos, canvas.height / 2);
    xPos += ctx.measureText(name).width;

    if (isOwner) {
        ctx.fillStyle = '#FFD700';
        ctx.fillText(' ✵', xPos, canvas.height / 2);
        ctx.fillStyle = textColor;
        xPos += ctx.measureText(' ✵').width;
    }
    xPos += 10;

    // Draw Rank Image
    const { userId } = generateLicenseNumber(normalizedTruckersmpLink, normalizedCompanyLink, state.country);
    const userLevel = getUserLevel(userId, state.levelRanges.user, state.currentDate ? state.currentDate.year : null);
    if (state.rankToggle && userLevel) {
        try {
            const rankImage = await loadImage(`./license_generator/rank/${userLevel}.png`);
            const rankImageHeight = 15;
            const rankImageWidth = (rankImage.width / rankImage.height) * rankImageHeight;
            ctx.drawImage(rankImage, xPos, (canvas.height - rankImageHeight) / 2, rankImageWidth, rankImageHeight);
            xPos += rankImageWidth + 5;
        } catch (error) {
            console.error(`Failed to load rank image for level ${userLevel}`, error);
        }
    }

    // Draw flag
    const selectedCountry = state.countries.find(c => c.code === state.country);
    if (selectedCountry) {
        try {
            const flagEmoji = await renderTwemoji(selectedCountry.emoji, 15);
            if (flagEmoji) {
                ctx.drawImage(flagEmoji, xPos, (canvas.height - 15) / 2, 15, 15);
            }
        } catch (e) { console.error('failed to render flag', e); }
    }
    
    // Update download link
    const downloadLink = document.getElementById('download-userbar');
    if(downloadLink) {
        downloadLink.href = canvas.toDataURL('image/png');
        downloadLink.download = `userbar_${state.name || 'unknown'}.png`;
    }
}
