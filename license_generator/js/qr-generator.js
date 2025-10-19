import { config } from './config.js';
// loadImage is no longer needed here

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
            options.image = logoPath; // Pass the string URL directly
            options.imageOptions = {
                crossOrigin: "anonymous",
                hideBackgroundDots: false,
                imageSize: 0.4, // Default image size
                margin: 10, // Small margin for the logo
            };
        }

        const qrCode = new window.QRCodeStyling(options);

        // Create a temporary div element to render the QR code
        const tempDiv = document.createElement('div');
        // Append to a hidden div or directly to body, then remove after rendering
        document.body.appendChild(tempDiv);

        qrCode.append(tempDiv);

        // Return a Promise that resolves when the QR code is drawn
        return new Promise(resolve => {
            setTimeout(() => {
                // Get the canvas element created by QRCodeStyling within the tempDiv
                const qrCanvas = tempDiv.querySelector('canvas');
                if (qrCanvas) {
                    ctx.drawImage(qrCanvas, x, y, size, size);
                }
                document.body.removeChild(tempDiv); // Clean up the temporary div
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