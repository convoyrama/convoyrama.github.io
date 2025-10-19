import { config } from './config.js';

async function generateQR(ctx, value, x, y, size, color, logoPath = null) {
    console.log("generateQR: Starting for value", value, "at (x,y)", x, y, "size", size, "color", color, "logoPath", logoPath);
    return new Promise((resolve, reject) => {
        const options = {
            width: size * 2, // Generate a larger image
            height: size * 2, // Generate a larger image
            type: "canvas",
            data: value,
            dotsOptions: {
                color: color,
                type: 'square' // Consistent dot style
            },
            backgroundOptions: {
                color: "transparent",
            },
            qrOptions: {
                errorCorrectionLevel: "H",
            },
            cornersSquareOptions: {
                type: 'square' // Consistent corner style
            },
            cornersDotOptions: {
                type: 'square' // Consistent corner style
            },
        };

        if (logoPath) {
            options.image = logoPath;
            options.imageOptions = {
                crossOrigin: "anonymous",
                hideBackgroundDots: false, // Ensure logo is not hidden
                imageSize: 1, // Test with maximum image size
                margin: 0, // Default margin, can be adjusted
            };
            console.log("generateQR: Logo path provided", logoPath, "imageOptions", options.imageOptions);
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