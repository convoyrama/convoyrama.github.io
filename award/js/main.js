// Add award-specific JavaScript here

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const qrUrlInput = document.getElementById('qrUrlInput');
    const generateQrButton = document.getElementById('generateQrButton');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const rankingText = document.getElementById('rankingText');
    const imageUploader = document.getElementById('imageUploader');
    const uploadedImagePreview = document.getElementById('uploadedImagePreview');
    const downloadAwardButton = document.getElementById('downloadAward');
    const awardCanvas = document.getElementById('awardCanvas');

    // --- MONTHS MAP ---
    const months = {
        1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio",
        7: "Julio", 8: "Agosto", 9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
    };

    // --- IMAGE UPLOAD LOGIC ---
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

    // --- QR CODE GENERATION HELPER ---
    function generateQRCode(url, logoPath) {
        qrCodeContainer.innerHTML = '';

        const options = {
            width: 50,
            height: 50,
            data: url,
            dotsOptions: {
                color: "#FFFFFF",
                type: "extra-rounded"
            },
            backgroundOptions: {
                color: "transparent",
            },
            qrOptions: {
                errorCorrectionLevel: "H"
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 2, // smaller margin for a smaller QR
                imageSize: 0.4
            }
        };

        // Only use the VTM logo for the QR code image
        if (logoPath) {
            options.image = logoPath;
        }

        const qrCode = new QRCodeStyling(options);
        qrCode.append(qrCodeContainer);
    }

    // --- MAIN LOGIC ---
    function parseUrlAndGenerate() {
        const urlString = qrUrlInput.value;
        rankingText.textContent = ''; // Clear previous text
        let logoPath = null;

        if (!urlString) {
            // If no URL is entered, generate a default QR without a logo
            // The user-uploaded image remains separate in the center.
            generateQRCode('https://convoyrama.com', null);
            return;
        }

        try {
            const url = new URL(urlString);
            const pathParts = url.pathname.split('/').filter(p => p);

            let text = '';

            if (url.hostname.includes('pickupvtm.com')) {
                logoPath = './images/vtm/pickup.jpg';
                const [mode, , month, year, game] = pathParts.slice(-5);
                
                const modeText = { '1': 'Realista (0-100 km/h)', '2': 'Carrera', '3': 'WoT' }[mode] || '';
                const gameText = { '0': 'ETS2', '1': 'ATS' }[game] || '';
                const monthText = months[parseInt(month)] || '';

                text = `Pickup ${monthText} ${year}, ${modeText} en ${gameText}`;

            } else if (url.hostname.includes('trucksbook.eu')) {
                logoPath = './images/vtm/trucksbook.png';
                const [year, month, mode, game] = pathParts.slice(-5, -1);

                const modeText = { '1': 'Real', '2': 'Carrera', '3': 'WoT' }[mode] || '';
                const gameText = { '1': 'ETS2', '2': 'ATS' }[game] || '';
                const monthText = months[parseInt(month)] || '';

                text = `TrucksBook ${monthText} ${year}, ${modeText} en ${gameText}`;
            }

            rankingText.textContent = text;
            generateQRCode(urlString, logoPath);

        } catch (error) {
            console.error("Invalid URL or parsing error:", error);
            rankingText.textContent = 'URL no válida o formato no reconocido.';
            qrCodeContainer.innerHTML = ''; // Clear QR on error
        }
    }

    generateQrButton.addEventListener('click', parseUrlAndGenerate);

    // --- DOWNLOAD LOGIC (Placeholder) ---
    downloadAwardButton.addEventListener('click', () => {
        alert("La funcionalidad de descarga necesita ser actualizada para incluir el texto y las imágenes.");
        // const image = awardCanvas.toDataURL('image/png');
        // downloadAwardButton.href = image;
    });
});
