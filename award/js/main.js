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
        yPosAchievement: 55,
        yPosMode: 85,
        yPosGame: 158,
        yPosDate: 330,
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
    // Sliders
    const yPosSlider1 = document.getElementById('yPosSlider1');
    const yPosValue1 = document.getElementById('yPosValue1');
    const yPosSlider2 = document.getElementById('yPosSlider2');
    const yPosValue2 = document.getElementById('yPosValue2');
    const yPosSlider3 = document.getElementById('yPosSlider3');
    const yPosValue3 = document.getElementById('yPosValue3');
    const middleImageZoomSlider = document.getElementById('middleImageZoomSlider');
    const middleImageZoomValue = document.getElementById('middleImageZoomValue');
    const middleImageXSlider = document.getElementById('middleImageXSlider');
    const middleImageXValue = document.getElementById('middleImageXValue');
    const middleImageYSlider = document.getElementById('middleImageYSlider');
    const middleImageYValue = document.getElementById('middleImageYValue');

    // --- MONTHS MAP ---
    const months = {
        1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio",
        7: "Julio", 8: "Agosto", 9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
    };

    // --- DRAWING LOGIC ---
    async function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const bgImage1 = await loadImage('./images/b1.png');
        ctx.drawImage(bgImage1, 0, 0, canvas.width, canvas.height);

        if (state.middleImage) {
            const zoom = state.middleImageZoom / 100;
            const w = state.middleImage.width * zoom;
            const h = state.middleImage.height * zoom;
            const x = (canvas.width - w) / 2 + state.middleImageX;
            const y = (canvas.height - h) / 2 + state.middleImageY;

            ctx.save();
            // Create a clipping path based on b2.png's transparent area in the future
            // For now, just draw the image
            ctx.drawImage(state.middleImage, x, y, w, h);
            ctx.restore();
        }

        const bgImage2 = await loadImage('./images/b2.png');
        ctx.drawImage(bgImage2, 0, 0, canvas.width, canvas.height);

        if (state.awardType === 'vtc') {
            ctx.font = 'bold 20px Arial';
            ctx.fillText('VTC Award', canvas.width / 2, 20);
        } else {
            ctx.font = 'bold 20px Arial';
            ctx.fillText('Individual Award', canvas.width / 2, 20);
        }

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textShadow = '2px 2px 4px #000000';

        if (state.achievement) {
            ctx.font = 'bold 60px Arial';
            ctx.fillText(state.achievement.toUpperCase(), canvas.width / 2, state.yPosAchievement);
        }
        if (state.mode) {
            ctx.font = 'bold 32px Arial';
            ctx.fillText(state.mode.toUpperCase(), canvas.width / 2, state.yPosMode);
        }
        if (state.game) {
            ctx.font = 'bold 24px Arial';
            ctx.fillText(state.game, canvas.width / 2, state.yPosGame);
        }
        if (state.period) {
            ctx.font = 'bold 24px Arial';
            ctx.fillText(state.period, canvas.width / 2, state.yPosDate);
        }

        ctx.textShadow = 'none';

        if (state.qrCode) {
            ctx.drawImage(state.qrCode, (canvas.width - 100) / 2, canvas.height * 0.87 - 50, 100, 100);
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
            width: 100,
            height: 100,
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
        middleImageZoomSlider.value = state.middleImageZoom;
        middleImageZoomValue.textContent = `${state.middleImageZoom}%`;
        middleImageXSlider.value = state.middleImageX;
        middleImageXValue.textContent = state.middleImageX;
        middleImageYSlider.value = state.middleImageY;
        middleImageYValue.textContent = state.middleImageY;
    }

    // --- INITIALIZATION ---
    setupEventListeners();
    redrawCanvas();
});
