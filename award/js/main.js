import { injectMetadataIntoPNG } from './png-metadata.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const state = {
        rankingUrl: '',
        vtcName: '',
        achievement: '1º',
        period: '',
        game: '',
        mode: '',
        awardType: 'vtc', // 'vtc' or 'individual'
        qrCode: null,
        vtmLogoPath: null,
        middleImage: null,
        middleImageZoom: 100,
        middleImageX: 0,
        middleImageY: 0,
        yPosAchievement: 500,
        yPosMode: 600,
        yPosGame: 700,
        yPosDate: 800,
        yPosNewText: 900, // New state variable for new text position
        newTextContent: 'Nuevo Texto Aquí', // Default text content
    };

    // --- DOM ELEMENTS ---
    const vtcNameInput = document.getElementById('vtcNameInput');
    const qrUrlInput = document.getElementById('qrUrlInput');
    const generateQrButton = document.getElementById('generateQrButton');
    const middleImageUploader = document.getElementById('middleImageUploader');
    const downloadAwardButton = document.getElementById('downloadAward');
    const canvas = document.getElementById('awardCanvas');
    const ctx = canvas.getContext('2d');
    const individualButton = document.getElementById('individualButton');
    const vtcButton = document.getElementById('vtcButton');
    const newTextInput = document.getElementById('newTextInput'); // New text input
    // Sliders
    const yPosSlider1 = document.getElementById('yPosSlider1');
    const yPosValue1 = document.getElementById('yPosValue1');
    const yPosSlider2 = document.getElementById('yPosSlider2');
    const yPosValue2 = document.getElementById('yPosValue2');
    const yPosSlider3 = document.getElementById('yPosSlider3');
    const yPosValue3 = document.getElementById('yPosValue3');
    const yPosSlider4 = document.getElementById('yPosSlider4'); // New slider
    const yPosValue4 = document.getElementById('yPosValue4'); // New slider

    // --- MONTHS MAP ---
    const months = {
        1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio",
        7: "Julio", 8: "Agosto", 9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
    };

    // --- DRAWING LOGIC ---
    async function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const bgImage1 = await loadImage('./images/b1.png');
        const b1_x = (canvas.width - 827) / 2;
        const b1_y = (canvas.height - 1080) / 2;
        ctx.drawImage(bgImage1, b1_x, b1_y, 827, 1080);

        if (state.middleImage) {
            const zoom = state.middleImageZoom / 100;
            const w = state.middleImage.width * zoom;
            const h = state.middleImage.height * zoom;
            const x = (canvas.width - w) / 2 + state.middleImageX;
            const y = (canvas.height - h) / 2 + state.middleImageY;

            ctx.save();
            // Create a clipping path based on b2.png's dimensions
            const b2_x = (canvas.width - 707) / 2;
            const b2_y = (canvas.height - 959) / 2;
            ctx.rect(b2_x, b2_y, 707, 959);
            ctx.clip();
            ctx.drawImage(state.middleImage, x, y, w, h);
            ctx.restore();
        }

        const bgImage2 = await loadImage('./images/b2.png');
        const b2_x = (canvas.width - 707) / 2;
        const b2_y = (canvas.height - 959) / 2;
        ctx.drawImage(bgImage2, b2_x, b2_y, 707, 959);

        if (state.awardType === 'vtc') {
            ctx.font = 'bold 40px Arial';
            ctx.fillText('VTC Award', canvas.width / 2, 100);
        } else {
            ctx.font = 'bold 40px Arial';
            ctx.fillText('Individual Award', canvas.width / 2, 100);
        }

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textShadow = '2px 2px 4px #000000';

        if (state.achievement) {
            ctx.font = 'bold 80px Arial';
            ctx.fillText(state.achievement.toUpperCase(), canvas.width / 2, state.yPosAchievement);
        }
        if (state.mode) {
            ctx.font = 'bold 50px Arial';
            ctx.fillText(state.mode.toUpperCase(), canvas.width / 2, state.yPosMode);
        }
        if (state.game) {
            ctx.font = 'bold 40px Arial';
            ctx.fillText(state.game, canvas.width / 2, state.yPosGame);
        }
        if (state.period) {
            ctx.font = 'bold 40px Arial';
            ctx.fillText(state.period, canvas.width / 2, state.yPosDate);
        }

        // New text drawing logic
        if (state.newTextContent) {
            ctx.font = 'bold 30px Arial'; // Example font for new text
            ctx.fillText(state.newTextContent, canvas.width / 2, state.yPosNewText);
        }

        ctx.textShadow = 'none';

        if (state.qrCode) {
            // Calculate new Y position for QR code (top, same distance from edge as before)
            const qrCodeSize = 200; // Assuming QR code size is 200x200
            const currentBottomMargin = canvas.height - (canvas.height - 300 + qrCodeSize); // current bottom margin
            const newY = currentBottomMargin; // New Y position from top

            ctx.drawImage(state.qrCode, (canvas.width - qrCodeSize) / 2, newY, qrCodeSize, qrCodeSize);
        }
    }

    // --- HELPERS ---
    async function loadImage(src) {
        return new Promise((resolve, reject) => {
            if (!src) return reject("No image source");
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    async function generateQRCode(url, logoPath) {
        const options = {
            width: 200, // Increased resolution
            height: 200, // Increased resolution
            data: url,
            dotsOptions: { color: "#FFFFFF", type: "extra-rounded" },
            backgroundOptions: { color: "transparent" },
            qrOptions: { errorCorrectionLevel: "H" },
            imageOptions: { crossOrigin: "anonymous", margin: 4, imageSize: 0.4 }
        };
        if (logoPath) options.image = logoPath;

        const qrCode = new QRCodeStyling(options);
        const blob = await qrCode.getRawData("png");
        state.qrCode = await loadImage(URL.createObjectURL(blob));
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        individualButton.addEventListener('click', () => {
            state.awardType = 'individual';
            redrawCanvas();
        });

        vtcButton.addEventListener('click', () => {
            state.awardType = 'vtc';
            redrawCanvas();
        });

        middleImageUploader.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                state.middleImage = await loadImage(URL.createObjectURL(file));
                redrawCanvas();
            }
        });

        vtcNameInput.addEventListener('input', (e) => { state.vtcName = e.target.value; });
        newTextInput.addEventListener('input', (e) => { state.newTextContent = e.target.value; redrawCanvas(); }); // New text input listener

        generateQrButton.addEventListener('click', async () => {
            state.rankingUrl = qrUrlInput.value;
            state.period = '';
            state.mode = '';
            state.game = '';
            state.vtmLogoPath = null;

            if (!state.rankingUrl) {
                await generateQRCode('https://convoyrama.com', null);
                redrawCanvas();
                return;
            }

            try {
                const url = new URL(state.rankingUrl);
                const pathParts = url.pathname.split('/').filter(p => p);

                if (url.hostname.includes('pickupvtm.com')) {
                    state.vtmLogoPath = './images/vtm/pickup.jpg';
                    const [mode, , month, year, game] = pathParts.slice(-5);
                    state.mode = { '1': 'Realista (0-100 km/h)', '2': 'Carrera', '3': 'WoT' }[mode] || '';
                    state.game = { '0': 'ETS2', '1': 'ATS' }[game] || '';
                    const monthText = months[parseInt(month)] || '';
                    state.period = `${monthText} ${year}`;

                } else if (url.hostname.includes('trucksbook.eu')) {
                    state.vtmLogoPath = './images/vtm/trucksbook.png';
                    const [year, month, mode, game] = pathParts.slice(-5, -1);
                    state.mode = { '1': 'Real', '2': 'Carrera', '3': 'WoT' }[mode] || '';
                    state.game = { '1': 'ETS2', '2': 'ATS' }[game] || '';
                    const monthText = months[parseInt(month)] || '';
                    state.period = `${monthText} ${year}`;
                }

                await generateQRCode(state.rankingUrl, state.vtmLogoPath);
                redrawCanvas();

            } catch (error) {
                console.error("Invalid URL or parsing error:", error);
                state.period = 'URL no válida';
                state.mode = 'o formato no reconocido.';
                state.game = '';
                state.qrCode = null;
                redrawCanvas();
            }
        });

        downloadAwardButton.addEventListener('click', async () => {
            await redrawCanvas();
            canvas.toBlob(async (blob) => {
                const arrayBuffer = await blob.arrayBuffer();
                const metadata = {
                    achievement: state.achievement,
                    period: state.period,
                    game: state.game,
                    mode: state.mode,
                    vtc: state.vtcName,
                    url: state.rankingUrl
                };
                const jsonMetadata = JSON.stringify(metadata);
                const newPngBuffer = injectMetadataIntoPNG(arrayBuffer, "convoyrama-award", jsonMetadata);
                const newBlob = new Blob([newPngBuffer], { type: 'image/png' });
                const tempLink = document.createElement('a');
                tempLink.href = URL.createObjectURL(newBlob);
                tempLink.download = `award_${state.vtcName || 'vtc'}_${state.period}.png`;
                tempLink.click();
                URL.revokeObjectURL(tempLink.href);
            }, 'image/png');
        });

        // Slider Listeners
        yPosSlider1.addEventListener('input', (e) => {
            state.yPosAchievement = parseInt(e.target.value);
            yPosValue1.textContent = state.yPosAchievement;
            redrawCanvas();
        });
        yPosSlider2.addEventListener('input', (e) => {
            state.yPosDate = parseInt(e.target.value);
            yPosValue2.textContent = state.yPosDate;
            redrawCanvas();
        });
        yPosSlider3.addEventListener('input', (e) => {
            state.yPosMode = parseInt(e.target.value);
            yPosValue3.textContent = state.yPosMode;
            redrawCanvas();
        });
        yPosSlider4.addEventListener('input', (e) => { // New slider listener
            state.yPosNewText = parseInt(e.target.value);
            yPosValue4.textContent = state.yPosNewText;
            redrawCanvas();
        });

        middleImageZoomSlider.addEventListener('input', (e) => {
            state.middleImageZoom = parseInt(e.target.value);
            middleImageZoomValue.textContent = `${state.middleImageZoom}%`;
            redrawCanvas();
        });

        middleImageXSlider.addEventListener('input', (e) => {
            state.middleImageX = parseInt(e.target.value);
            middleImageXValue.textContent = state.middleImageX;
            redrawCanvas();
        });

        middleImageYSlider.addEventListener('input', (e) => {
            state.middleImageY = parseInt(e.target.value);
            middleImageYValue.textContent = state.middleImageY;
            redrawCanvas();
        });

        // Initial slider values
        yPosSlider1.value = state.yPosAchievement;
        yPosValue1.textContent = state.yPosAchievement;
        yPosSlider2.value = state.yPosDate;
        yPosValue2.textContent = state.yPosDate;
        yPosSlider3.value = state.yPosMode;
        yPosValue3.textContent = state.yPosMode;
        yPosSlider4.value = state.yPosNewText; // Initialize new slider
        yPosValue4.textContent = state.yPosNewText; // Initialize new slider

