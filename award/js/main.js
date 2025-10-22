import { injectMetadataIntoPNG } from './png-metadata.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const state = {
        rankingUrl: '',
        vtcName: '',
        achievement: '1º',
        period: '',
        mode: '',
        vtcLogo: null,
        qrCode: null,
        vtmLogoPath: null,
        yPos1: 80, // Y-pos for '1º'
        yPos2: 380, // Y-pos for 'Mes y Año'
        yPos3: 410, // Y-pos for 'Modo de Competencia'
    };

    // --- DOM ELEMENTS ---
    const vtcNameInput = document.getElementById('vtcNameInput');
    const qrUrlInput = document.getElementById('qrUrlInput');
    const generateQrButton = document.getElementById('generateQrButton');
    const imageUploader = document.getElementById('imageUploader');
    const downloadAwardButton = document.getElementById('downloadAward');
    const canvas = document.getElementById('awardCanvas');
    const ctx = canvas.getContext('2d');
    // Sliders
    const yPosSlider1 = document.getElementById('yPosSlider1');
    const yPosValue1 = document.getElementById('yPosValue1');
    const yPosSlider2 = document.getElementById('yPosSlider2');
    const yPosValue2 = document.getElementById('yPosValue2');
    const yPosSlider3 = document.getElementById('yPosSlider3');
    const yPosValue3 = document.getElementById('yPosValue3');

    // --- MONTHS MAP ---
    const months = {
        1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio",
        7: "Julio", 8: "Agosto", 9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
    };

    // --- DRAWING LOGIC ---
    async function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        try {
            const bgImage = await loadImage('../images/background.svg');
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        } catch (e) {
            ctx.fillStyle = '#555';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textShadow = '2px 2px 4px #000000';

        if (state.achievement) {
            ctx.font = 'bold 48px Arial';
            ctx.fillText(state.achievement, canvas.width / 2, state.yPos1);
        }
        if (state.period) {
            ctx.font = 'bold 24px Arial';
            ctx.fillText(state.period, canvas.width / 2, state.yPos2);
        }
        if (state.mode) {
            ctx.font = 'bold 20px Arial';
            ctx.fillText(state.mode, canvas.width / 2, state.yPos3);
        }
        ctx.textShadow = 'none';

        if (state.vtcLogo) {
            ctx.drawImage(state.vtcLogo, (canvas.width - 100) / 2, (canvas.height - 100) / 2, 100, 100);
        }

        if (state.qrCode) {
            ctx.drawImage(state.qrCode, (canvas.width - 100) / 2, canvas.height * 0.85 - 50, 100, 100);
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
        imageUploader.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                state.vtcLogo = await loadImage(URL.createObjectURL(file));
                redrawCanvas();
            }
        });

        vtcNameInput.addEventListener('input', (e) => { state.vtcName = e.target.value; });

        generateQrButton.addEventListener('click', async () => {
            state.rankingUrl = qrUrlInput.value;
            state.period = '';
            state.mode = '';
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
                    const gameText = { '0': 'ETS2', '1': 'ATS' }[game] || '';
                    const monthText = months[parseInt(month)] || '';
                    state.period = `${monthText} ${year} (${gameText})`;

                } else if (url.hostname.includes('trucksbook.eu')) {
                    state.vtmLogoPath = './images/vtm/trucksbook.png';
                    const [year, month, mode, game] = pathParts.slice(-5, -1);
                    state.mode = { '1': 'Real', '2': 'Carrera', '3': 'WoT' }[mode] || '';
                    const gameText = { '1': 'ETS2', '2': 'ATS' }[game] || '';
                    const monthText = months[parseInt(month)] || '';
                    state.period = `${monthText} ${year} (${gameText})`;
                }

                await generateQRCode(state.rankingUrl, state.vtmLogoPath);
                redrawCanvas();

            } catch (error) {
                console.error("Invalid URL or parsing error:", error);
                state.period = 'URL no válida';
                state.mode = 'o formato no reconocido.';
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
            state.yPos1 = parseInt(e.target.value);
            yPosValue1.textContent = state.yPos1;
            redrawCanvas();
        });
        yPosSlider2.addEventListener('input', (e) => {
            state.yPos2 = parseInt(e.target.value);
            yPosValue2.textContent = state.yPos2;
            redrawCanvas();
        });
        yPosSlider3.addEventListener('input', (e) => {
            state.yPos3 = parseInt(e.target.value);
            yPosValue3.textContent = state.yPos3;
            redrawCanvas();
        });

        // Initial slider values
        yPosSlider1.value = state.yPos1;
        yPosValue1.textContent = state.yPos1;
        yPosSlider2.value = state.yPos2;
        yPosValue2.textContent = state.yPos2;
        yPosSlider3.value = state.yPos3;
        yPosValue3.textContent = state.yPos3;
    }

    // --- INITIALIZATION ---
    setupEventListeners();
    redrawCanvas();
});
