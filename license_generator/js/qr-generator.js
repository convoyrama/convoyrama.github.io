import { config } from './config.js';

async function generateQR(ctx, value, x, y, size, color, logoPath = null) {
    return new Promise((resolve, reject) => {
        const options = {
            width: size,
            height: size,
            type: "canvas",
            data: value,
            dotsOptions: {
                color: color,
            },
            backgroundOptions: {
                color: "transparent",
            },
            qrOptions: {
                errorCorrectionLevel: "H",
            },
        };

        if (logoPath) {
            options.image = logoPath;
            options.imageOptions = {
                crossOrigin: "anonymous",
                margin: size * 0.1, // 10% margin around the logo
                imageSize: 0.8, // Make the logo larger
            };
        }

        const qrCode = new window.QRCodeStyling(options);

        qrCode.getRawData("png").then((pngBlob) => {
            const img = new Image();
            img.src = URL.createObjectURL(pngBlob);
            img.onload = () => {
                ctx.drawImage(img, x, y, size, size);
                URL.revokeObjectURL(img.src); // Clean up the object URL
                resolve();
            };
            img.onerror = (err) => {
                console.error(`Error loading QR PNG for ${value}:`, err);
                reject(err);
            };
        }).catch(err => {
            console.error(`Error generating QR for ${value}:`, err);
            reject(err);
        });
    });
}

export { generateQR };