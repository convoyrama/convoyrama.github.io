// Add award-specific JavaScript here

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

    // Image Upload
    const imageUploader = document.getElementById('imageUploader');
    const uploadedImagePreview = document.getElementById('uploadedImagePreview');

    imageUploader.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImagePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // QR Code Generation
    const qrUrlInput = document.getElementById('qrUrlInput');
    const generateQrButton = document.getElementById('generateQrButton');
    const qrCodeContainer = document.getElementById('qrCodeContainer');

    generateQrButton.addEventListener('click', () => {
        const url = qrUrlInput.value || 'https://convoyrama.com'; // Default URL

        // Clear previous QR code
        qrCodeContainer.innerHTML = '';

        // Define base options for the QR code
        const options = {
            width: 200,
            height: 200,
            data: url,
            dotsOptions: {
                color: "#FFFFFF",
                type: "extra-rounded"
            },
            backgroundOptions: {
                color: "transparent",
            },
            qrOptions: {
                errorCorrectionLevel: "H" // Use high error correction for better readability with an image
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 4, // Margin around the image
                imageSize: 0.4 // Size of the image relative to the QR code (40%)
            }
        };

        // If an image has been uploaded, add it to the options
        if (uploadedImagePreview.src && uploadedImagePreview.src.startsWith('data:image')) {
            options.image = uploadedImagePreview.src;
        }

        // Create and append the QR code
        const qrCode = new QRCodeStyling(options);
        qrCode.append(qrCodeContainer);
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
