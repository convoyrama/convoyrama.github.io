import { config } from './config.js';
import { loadImage } from './canvasv2.js';

async function generateQR(ctx, value, x, y, size, color, logoPath = null) {
    try {
        const options = {
            width: size,
            height: size,
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
            try {
                const loadedLogo = await loadImage(logoPath);
                options.image = loadedLogo;
                options.imageOptions = {
                    crossOrigin: "anonymous",
                    hideBackgroundDots: false,
                    imageSize: 0.4, // Default image size
                    margin: 5, // Small margin for the logo
                };
            } catch (error) {
                console.error("Error loading logo for QR code:", error);
                // Continue without logo if loading fails
            }
        }

        const qrCode = new window.QRCodeStyling(options);

        // Create a temporary canvas element to render the QR code
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;

        // Append the QR code to the temporary canvas
        qrCode.append(tempCanvas);

        // Return a Promise that resolves when the QR code is drawn
        return new Promise(resolve => {
            setTimeout(() => {
                ctx.drawImage(tempCanvas, x, y, size, size);
                document.body.removeChild(tempCanvas); // Clean up the temporary canvas
                resolve();
            }, 100); // Increased delay to 100ms
        });

    } catch (error) {
        console.error(`Error generating QR for ${value}:`, error);
        // Reject the promise if there's an error
        return Promise.reject(error);
    }
}

export { generateQR };