import { dom } from './dom-elements.js';
import { config, translations } from './config.js';
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

    // --- Layout Constants ---
    const itemSize = config.vtcLogoSize * scaleFactor;
    const itemSpacing = config.qrSpacing * scaleFactor;
    const rightMargin = 20 * scaleFactor;
    const itemY = config.qrY * scaleFactor;

    const qrId_x = canvas.width - rightMargin - itemSize;
    const qrUser_x = qrId_x - itemSize - itemSpacing;
    const qrCompany_x = qrUser_x - itemSize - itemSpacing;
    const vtcLogo_x = qrCompany_x - itemSize - itemSpacing;

    const photoSize = config.defaultPhotoSize * scaleFactor;
    const newPhotoX = vtcLogo_x - photoSize - itemSpacing;
    const newPhotoY = itemY;

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
    ctx.font = `bold ${config.titleFontSize * scaleFactor}px 'VerdanaCustom-Bold'`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(state.customTitle.trim() || "TRUCKERSMP", canvas.width / 2, 40.77 * scaleFactor);

    // Draw Photo in its new position
    if (state.userImage) {
        ctx.drawImage(state.userImage, newPhotoX, newPhotoY, photoSize, photoSize);
    } else {
        const defaultPhoto = await renderTwemoji("👤", photoSize);
        if (defaultPhoto) ctx.drawImage(defaultPhoto, newPhotoX, newPhotoY, photoSize, photoSize);
    }

    // --- Text & Rank Drawing --- //
    const normalizedTruckersmpLink = normalizeLink(state.truckersmpLink);
    const normalizedCompanyLink = normalizeLink(state.companyLink);
    const { licenseNumber, userId, vtcId } = generateLicenseNumber(normalizedTruckersmpLink, normalizedCompanyLink, state.country);

    // Draw Rank Image
    const userLevel = state.userLevel;
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
    const isOwner = state.isVtcOwner;
    const countryName = selectedCountry ? (selectedCountry[`name_${state.language}`] || selectedCountry.name_en) : '';
    const dateStr = state.currentDate ? `${state.currentDate.day}/${state.currentDate.month}/${state.currentDate.year}` : '';

    // Define text lines in order
    const lines = [
        { label: t.canvasName, value: state.name, isName: true },
        { label: t.canvasCountry, value: countryName.toUpperCase() },
        { label: t.canvasLicenseNo, value: licenseNumber },
        { label: t.canvasDate, value: dateStr }, // Date string only
    ];
    if (state.nickname) {
        lines.push({ label: t.canvasTag, value: state.nickname });
    }

    // Draw lines
    let yPos = (config.photoY + config.defaultPhotoSize + 40) * scaleFactor;
    lines.forEach(line => {
        ctx.font = `bold ${config.textFontSize * scaleFactor}px 'VerdanaCustom-Bold'`;
        ctx.fillText(line.label, config.labelX * scaleFactor, yPos);

        ctx.font = `bold ${config.textFontSize * scaleFactor}px 'VerdanaCustom-Bold'`;
        if (line.isName) {
            const nameWithoutStar = line.value;
            ctx.fillText(nameWithoutStar, config.textX * scaleFactor, yPos);
            if (isOwner) {
                const nameWidth = ctx.measureText(nameWithoutStar).width;
                ctx.fillStyle = '#FFD700';
                ctx.fillText(' ✵', (config.textX * scaleFactor) + nameWidth, yPos);
                ctx.fillStyle = textColor; // Reset color
            }
        } else {
            ctx.fillText(line.value, config.textX * scaleFactor, yPos);
        }

        // Special handling for date symbol
        if (line.label === t.canvasDate && state.currentDate) {
            const dateSymbol = state.currentDate.fromInternet ? '✓' : '✗';
            const dateWidth = ctx.measureText(line.value).width;
            const symbolX = (config.textX * scaleFactor) + dateWidth + (5 * scaleFactor);

            // Check for golden checkmark conditions
            if (state.currentDate.fromInternet && state.verifiedJoinDate) {
                ctx.fillStyle = '#FFD700'; // Gold color
            }
            
            ctx.fillText(dateSymbol, symbolX, yPos);
            ctx.fillStyle = textColor; // Reset to default color
        }

        yPos += config.lineHeight * scaleFactor;
    });

    // --- Right-aligned items (VTC Logo, QRs, Flag) ---
    const flag_x = qrId_x;
    const flag_y = itemY + itemSize + itemSpacing;

    // Draw VTC Logo (in its new position)
    if (state.vtcLogoImage) {
        ctx.drawImage(state.vtcLogoImage, vtcLogo_x, itemY, itemSize, itemSize);
    }

    // Draw QR Codes (in their new positions)
    const qrColor = state.qrColorToggle ? "#141414" : "#F0F0F0";
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

    // Draw TruckersMP Logo
    if (state.watermarkToggle) { // Changed condition
        try {
            const truckersmpImage = await loadImage('./license_generator/images/truckersmp-logo-sm.png');
            const logoWidth = config.truckersmpLogoWidth * scaleFactor;
            const logoHeight = (truckersmpImage.height / truckersmpImage.width) * logoWidth;
            const truckersmpLogo_x = qrCompany_x;
            const truckersmpLogo_y = flag_y;
            ctx.globalAlpha = 0.15; // 15% opacity
            ctx.drawImage(truckersmpImage, truckersmpLogo_x, truckersmpLogo_y, logoWidth, logoHeight);

            // Draw verified registration year if available
            if (state.verifiedJoinDate) {
                const year = new Date(state.verifiedJoinDate).getFullYear();
                
                // Calculate the vertical distance between the bottom of the QRs and the top of the TMP logo
                const verticalDistance = truckersmpLogo_y - (itemY + itemSize);
                // Apply that same distance below the logo for the year, plus an additional 10px offset requested by the user
                const yearY = truckersmpLogo_y + logoHeight + verticalDistance + (10 * scaleFactor);

                const yearX = truckersmpLogo_x + (logoWidth / 2); // Center it with the logo

                ctx.font = `bold ${config.textFontSize * 1.5 * scaleFactor}px 'VerdanaCustom-Bold'`;
                ctx.fillStyle = 'rgb(240, 240, 240)';
                ctx.textAlign = 'center';
                // Opacity is already set by ctx.globalAlpha = 0.15;
                ctx.fillText(year, yearX, yearY);
            }

            ctx.globalAlpha = 1.0; // Reset opacity
        } catch (error) {
            console.error('Failed to load truckersmp-logo-sm image', error);
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
        ctx.font = `bold ${config.footerFontSize * scaleFactor}px 'VerdanaCustom-Bold'`;
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

// --- PNG Metadata Injection ---

// Helper to write a 32-bit unsigned integer to a DataView
function writeUint32(view, offset, value) {
    view.setUint32(offset, value, false); // PNG uses big-endian
}

// CRC32 checksum calculation
const crc32 = (function() {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        table[i] = c;
    }
    return function(bytes, start = 0, length = bytes.length - start) {
        let crc = -1;
        for (let i = start, l = start + length; i < l; i++) {
            crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xFF];
        }
        return (crc ^ -1) >>> 0;
    };
})();

/**
 * Injects a tEXt chunk with custom metadata into a PNG ArrayBuffer.
 * @param {ArrayBuffer} pngBuffer The original PNG data.
 * @param {string} key The metadata key (e.g., "convoyrama-data").
 * @param {string} value The metadata value (e.g., a JSON string).
 * @returns {ArrayBuffer} A new ArrayBuffer with the injected chunk.
 */
function injectMetadataIntoPNG(pngBuffer, key, value) {
    const IEND_CHUNK_TYPE = 'IEND';
    const TEXT_CHUNK_TYPE = 'tEXt';

    const dataView = new DataView(pngBuffer);
    // PNG signature
    if (dataView.getUint32(0) !== 0x89504E47 || dataView.getUint32(4) !== 0x0D0A1A0A) {
        console.error("Invalid PNG signature.");
        return pngBuffer;
    }

    let offset = 8;
    while (offset < pngBuffer.byteLength) {
        const length = dataView.getUint32(offset);
        const type = String.fromCharCode(
            dataView.getUint8(offset + 4),
            dataView.getUint8(offset + 5),
            dataView.getUint8(offset + 6),
            dataView.getUint8(offset + 7)
        );
        
        // Find the IEND chunk, which must be the last one.
        if (type === IEND_CHUNK_TYPE) {
            const iendChunk = pngBuffer.slice(offset);
            const pngWithoutIend = pngBuffer.slice(0, offset);

            // Create the new tEXt chunk
            const keywordBytes = new TextEncoder().encode(key);
            const valueBytes = new TextEncoder().encode(value);
            const chunkDataLength = keywordBytes.length + 1 + valueBytes.length;
            
            const newChunkBuffer = new ArrayBuffer(12 + chunkDataLength);
            const newChunkView = new DataView(newChunkBuffer);
            const newChunkBytes = new Uint8Array(newChunkBuffer);

            writeUint32(newChunkView, 0, chunkDataLength);
            newChunkBytes.set(new TextEncoder().encode(TEXT_CHUNK_TYPE), 4);
            newChunkBytes.set(keywordBytes, 8);
            newChunkBytes[8 + keywordBytes.length] = 0; // Null separator
            newChunkBytes.set(valueBytes, 8 + keywordBytes.length + 1);
            
            const crc = crc32(newChunkBytes, 4, chunkDataLength + 4);
            writeUint32(newChunkView, 8 + chunkDataLength, crc);

            // Combine the parts: original PNG (without IEND) + new chunk + IEND chunk
            const finalPngBuffer = new ArrayBuffer(pngWithoutIend.byteLength + newChunkBuffer.byteLength + iendChunk.byteLength);
            const finalPngBytes = new Uint8Array(finalPngBuffer);
            
            finalPngBytes.set(new Uint8Array(pngWithoutIend), 0);
            finalPngBytes.set(new Uint8Array(newChunkBuffer), pngWithoutIend.byteLength);
            finalPngBytes.set(new Uint8Array(iendChunk), pngWithoutIend.byteLength + newChunkBuffer.byteLength);

            return finalPngBuffer;
        }
        offset += 12 + length;
    }

    console.error("IEND chunk not found.");
    return pngBuffer; // Return original buffer if IEND is not found
}


export function performDownload(state) {
    const { canvas } = dom;
    try {
        canvas.toBlob(async (blob) => {
            const arrayBuffer = await blob.arrayBuffer();

            const metadata = {
                name: state.name || '',
                truckersmp_link: normalizeLink(state.truckersmpLink || ''),
                vtc_link: normalizeLink(state.companyLink || ''),
                country: state.country || '',
                license_number: generateLicenseNumber(state.truckersmpLink || '', state.companyLink || '', state.country || '').licenseNumber,
                generated_at: new Date().toISOString(),
                is_verified: !!state.verifiedJoinDate,
                tmp_join_date: state.verifiedJoinDate || null,
            };

            const jsonMetadata = JSON.stringify(metadata);

            const newPngBuffer = injectMetadataIntoPNG(arrayBuffer, "convoyrama-data", jsonMetadata);
            const newBlob = new Blob([newPngBuffer], { type: 'image/png' });

            // Create a temporary link to trigger the download
            const tempLink = document.createElement('a');
            tempLink.href = URL.createObjectURL(newBlob);
            tempLink.download = `driver_license_${state.name || 'unknown'}.png`;
            
            document.body.appendChild(tempLink); // Required for Firefox
            tempLink.click();
            document.body.removeChild(tempLink);
            
            URL.revokeObjectURL(tempLink.href); // Clean up
        }, 'image/png');
    } catch (error) {
        console.error("Error performing download:", error);
    }
}