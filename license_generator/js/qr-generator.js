import { config } from './config.js';

async function generateQR(ctx, value, x, y, size, color, logoPath = null) {
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
                margin: size * 0.1, // 10% margin around the logo
                imageSize: 0.8, // Make the logo larger
            };
        }

        const qrCode = new window.QRCodeStyling(options);

        // Create a temporary canvas element
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        // Append to a hidden div or directly to body, then remove after rendering
        document.body.appendChild(tempCanvas);

        qrCode.append(tempCanvas);

        // Wait for the QR code to be rendered on the temporary canvas
        // There's no direct callback for append, so we might need a small delay or a mutation observer
        // For simplicity, let's assume it renders quickly. A more robust solution might involve polling or a custom event.
        setTimeout(() => {
            ctx.drawImage(tempCanvas, x, y, size, size);
            document.body.removeChild(tempCanvas); // Clean up
            resolve();
        }, 50); // Small delay to allow rendering

    });
}

export { generateQR };