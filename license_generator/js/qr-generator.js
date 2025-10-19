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
                imageSize: 0.4, // Default size, can be adjusted
                margin: 0, // Default margin, can be adjusted
            };
            console.log("generateQR: Logo path provided", logoPath, "imageOptions", options.imageOptions);
        }

        const qrCode = new window.QRCodeStyling(options);

        // Create a temporary canvas element
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size * 2; // Match the generation size
        tempCanvas.height = size * 2; // Match the generation size
        // Append to a hidden div or directly to body, then remove after rendering
        document.body.appendChild(tempCanvas);
        console.log("generateQR: Appending to temporary canvas for value", value, "tempCanvas size", tempCanvas.width, tempCanvas.height);

        qrCode.append(tempCanvas);

        // Wait for the QR code to be rendered on the temporary canvas
        // There's no direct callback for append, so we might need a small delay or a mutation observer
        // For simplicity, let's assume it renders quickly. A more robust solution might involve polling or a custom event.
        setTimeout(() => {
            console.log("generateQR: Drawing temporary canvas to main context for value", value, "at (x,y)", x, y, "size", size);
            ctx.drawImage(tempCanvas, x, y, size, size);
            document.body.removeChild(tempCanvas); // Clean up
            resolve();
        }, 500); // Increased delay to allow rendering

    });
}

export { generateQR };