// Add award-specific JavaScript here
import { QR } from './lib/qrGrid.js';

document.addEventListener('DOMContentLoaded', () => {
    const awardCanvas = document.getElementById('awardCanvas');
    const ctx = awardCanvas.getContext('2d');

    // Initial drawing on the canvas
    function drawAward() {
        // We leave this function for now, but the background is handled by CSS
        ctx.fillStyle = '#333';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
    }

    drawAward();

    // QR Code Generation
    const librarySelector = document.getElementById('librarySelector');
    const qrUrlInput = document.getElementById('qrUrlInput');
    const generateQrButton = document.getElementById('generateQrButton');
    const qrCodeContainer = document.getElementById('qrCodeContainer');

    generateQrButton.addEventListener('click', () => {
        const selectedLibrary = librarySelector.value;
        const url = qrUrlInput.value || 'https://convoyrama.com'; // Default URL

        // Clear previous QR code
        qrCodeContainer.innerHTML = '';

        if (selectedLibrary === 'qr-code-styling') {
            // This library is available globally because we added the script tag
            const qrCode = new QRCodeStyling({
                width: 200,
                height: 200,
                data: url,
                dotsOptions: {
                    color: "#000",
                    type: "rounded"
                },
                backgroundOptions: {
                    color: "transparent", // Make background transparent to see the SVG behind
                },
            });
            qrCode.append(qrCodeContainer);
        } else if (selectedLibrary === 'qrGrid') {
            // We imported the QR class from the ES Module version of the library
            const qr = new QR({
                data: url,
                size: 200,
            });
            qrCodeContainer.innerHTML = qr.svg();
        }
    });


    // Download functionality
    const downloadAwardButton = document.getElementById('downloadAward');
    downloadAwardButton.addEventListener('click', () => {
        // This functionality will need to be updated to merge the SVG background,
        // the QR code, and any other text onto the canvas before downloading.
        // For now, it only downloads the canvas content.
        const image = awardCanvas.toDataURL('image/png');
        downloadAwardButton.href = image;
    });
});