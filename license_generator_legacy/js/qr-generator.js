import { config } from './config.js';

async function generateQR(ctx, value, x, y, size, color, logoPath = null) {
    return new Promise((resolve, reject) => {
        const options = {
            width: size * 5, // Use a larger internal rendering size
            height: size * 5, // Use a larger internal rendering size
            type: "canvas",
            data: value,
            dotsOptions: {
                color: color,
                type: 'square'
            },
            backgroundOptions: {
                color: "transparent",
            },
            qrOptions: {
                errorCorrectionLevel: "H",
            },
            cornersSquareOptions: {
                type: 'square'
            },
            cornersDotOptions: {
                type: 'square'
            },
        };

        if (logoPath) {
            options.image = logoPath;
            // Rely on QRCodeStyling's default imageOptions when width/height are large
            // This seems to be the working approach from test_qr.html Formula 1
        }

        const qrCode = new window.QRCodeStyling(options);

        qrCode.getRawData("png").then((pngBlob) => {
            const img = new Image();
            img.src = URL.createObjectURL(pngBlob);
            img.onload = () => {
                img.width = size; // Explicitly setting width and height
                img.height = size;
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