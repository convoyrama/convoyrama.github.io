import { dom } from './dom-elements.js';
import { config, translations } from './config.js';
import { debounce } from './utils.js';
import { getCurrentDate, loadVtcData, loadCountries } from './api.js';
import { generateImage } from './canvas.js';

const state = {
    name: '',
    country: '',
    nickname: '',
    truckersmpLink: '',
    companyLink: '',
    titleToggle: false,
    promodsToggle: false,
    dbusworldToggle: false,
    watermarkToggle: true,
    qrColorToggle: false,
    backgroundTemplate: 'modern.png',
    language: 'es',
    colorHue: 0,
    saturation: 100,
    customTitle: '',
    userImage: null,
    vtcLogoImage: null,
    isNicknameUnlocked: localStorage.getItem("nicknameUnlocked") === "true",
    currentDate: null,
    lastDateFetch: 0,
    isDateFromInternet: false,
    vtcData: { vtcOwners: [], starMap: {} },
    countries: [],
};

function updateUI() {
    // Update UI elements based on state
    dom.nicknameGroup.classList.toggle("hidden", !state.isNicknameUnlocked);
    dom.titleToggleGroup.classList.toggle("hidden", !state.isNicknameUnlocked);
}

async function initialize() {
    state.countries = await loadCountries();
    state.vtcData = await loadVtcData();
    
    // Populate countries dropdown
    // ...

    updateUI();
    addEventListeners();
    
    const debouncedGenerate = debounce(() => generateImage(state), 100);
    debouncedGenerate();
}

function addEventListeners() {
    dom.nameInput.addEventListener('input', (e) => {
        state.name = e.target.value;
        if (state.name.toLowerCase().trim() === "nocturno") {
            state.isNicknameUnlocked = true;
            localStorage.setItem("nicknameUnlocked", "true");
            updateUI();
        }
        debounce(() => generateImage(state), 100)();
    });

    dom.photoInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.src = ev.target.result;
                img.onload = () => {
                    state.userImage = img;
                    debounce(() => generateImage(state), 100)();
                };
            };
            reader.readAsDataURL(file);
        } else {
            state.userImage = null;
            debounce(() => generateImage(state), 100)();
        }
    });

    // ... (rest of the event listeners will be added in the next steps)
}

document.addEventListener('DOMContentLoaded', initialize);
