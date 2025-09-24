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
    updateLanguage(state.language);
}

function updateLanguage(lang) {
    const t = translations[lang];
    if (!t) return;

    dom.pageTitle.textContent = t.pageTitle;
    dom.headerTitle.textContent = t.headerTitle;
    dom.navLicense.textContent = t.navLicense;
    dom.nameLabel.textContent = t.nameLabel;
    dom.nicknameLabel.textContent = t.nicknameLabel;
    dom.titleToggleLabel.textContent = t.titleToggleLabel;
    dom.photoLabel.textContent = t.photoLabel;
    dom.countryLabel.textContent = t.countryLabel;
    dom.companyLinkLabel.textContent = t.companyLinkLabel;
    dom.truckersmpLinkLabel.textContent = t.truckersmpLinkLabel;
    dom.customTitleLabel.textContent = t.customTitleLabel;
    dom.watermarkToggleLabel.textContent = t.watermarkToggleLabel;
    dom.qrColorToggleLabel.textContent = t.qrColorToggleLabel;
    dom.vtcLogoLabel.textContent = t.vtcLogoLabel;
    dom.backgroundToggleLabel.textContent = t.backgroundToggleLabel;
    dom.colorLabel.textContent = t.colorLabel;
    dom.saturationLabel.textContent = t.saturationLabel;
    dom.customTitleInput.placeholder = t.customTitlePlaceholder;
    dom.downloadButton.textContent = t.downloadButton;
    dom.infoButton.setAttribute('data-tooltip', t.infoTooltip);
    dom.downloadButton.setAttribute('data-tooltip', t.tooltipMessage);
    
    const countryPlaceholder = dom.countrySelect.querySelector('option[value=""]');
    if (countryPlaceholder) {
        countryPlaceholder.textContent = t.countryPlaceholder;
    }

    const nameKey = `name_${lang}`;
    dom.countrySelect.querySelectorAll('option').forEach(option => {
        if (option.value) { // Don't change the placeholder
            const country = state.countries.find(c => c.code === option.value);
            if (country) {
                option.textContent = country[nameKey] || country.name_en; // Fallback to English
            }
        }
    });
}

async function initialize() {
    state.countries = await loadCountries();
    state.vtcData = await loadVtcData();
    
    // Populate countries dropdown
    state.countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = country.name_es; // Default to Spanish
        dom.countrySelect.appendChild(option);
    });

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

    dom.truckersmpLinkInput.addEventListener('input', (e) => {
        state.truckersmpLink = e.target.value;
        debounce(() => generateImage(state), 100)();
    });

    dom.companyLinkInput.addEventListener('input', (e) => {
        state.companyLink = e.target.value;
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

    dom.backgroundSelect.addEventListener('change', (e) => {
        state.backgroundTemplate = e.target.value;
        debounce(() => generateImage(state), 100)();
    });

    dom.languageSelect.addEventListener('change', (e) => {
        state.language = e.target.value;
        updateLanguage(state.language);
        debounce(() => generateImage(state), 100)();
    });

    dom.countrySelect.addEventListener('change', (e) => {
        state.country = e.target.value;
        debounce(() => generateImage(state), 100)();
    });

    dom.nicknameSelect.addEventListener('change', (e) => {
        state.nickname = e.target.value;
        debounce(() => generateImage(state), 100)();
    });

    dom.colorSlider.addEventListener('input', (e) => {
        state.colorHue = e.target.value;
        dom.colorValue.textContent = `${state.colorHue}°`;
        debounce(() => generateImage(state), 100)();
    });

    dom.saturationSlider.addEventListener('input', (e) => {
        state.saturation = e.target.value;
        dom.saturationValue.textContent = `${state.saturation}%`;
        debounce(() => generateImage(state), 100)();
    });

    dom.customTitleInput.addEventListener('input', (e) => {
        state.customTitle = e.target.value;
        debounce(() => generateImage(state), 100)();
    });

    dom.vtcLogoInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.src = ev.target.result;
                img.onload = () => {
                    state.vtcLogoImage = img;
                    debounce(() => generateImage(state), 100)();
                };
            };
            reader.readAsDataURL(file);
        } else {
            state.vtcLogoImage = null;
            debounce(() => generateImage(state), 100)();
        }
    });

    dom.promodsToggleInput.addEventListener('change', (e) => {
        state.promodsToggle = e.target.checked;
        debounce(() => generateImage(state), 100)();
    });

    dom.dbusworldToggleInput.addEventListener('change', (e) => {
        state.dbusworldToggle = e.target.checked;
        debounce(() => generateImage(state), 100)();
    });

    dom.watermarkToggleInput.addEventListener('change', (e) => {
        state.watermarkToggle = e.target.checked;
        debounce(() => generateImage(state), 100)();
    });

    dom.qrColorToggleInput.addEventListener('change', (e) => {
        state.qrColorToggle = e.target.checked;
        debounce(() => generateImage(state), 100)();
    });

}

document.addEventListener('DOMContentLoaded', initialize);
