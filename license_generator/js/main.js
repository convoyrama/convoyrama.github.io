import { dom } from './dom-elements.js';
import { config, translations } from './config.js';
import { debounce, validateTruckersmpLink, validateCompanyLink } from './utils.js';
import { getCurrentDate, loadVtcData, loadCountries, loadNicknames, loadStarMap, loadTitles, loadLevelRanges } from './api.js';
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
    textColorToggle: false,
    backgroundTemplate: 'modern.png',
    language: 'es',
    colorHue: 0,
    saturation: 100,
    customTitle: '',
    selectedTitleKey: 'INTERNATIONAL_DRIVING_LICENSE',
    userImage: null,
    vtcLogoImage: null,
    currentDate: null,
    lastDateFetch: 0,
    isDateFromInternet: false,
    vtcData: { vtcOwners: [] },
    starMap: {},
    countries: [],
    nicknames: [],
    titles: [],
    levelRanges: {},
};

function updateUI() {
    // Update UI elements based on state
    updateLanguage(state.language);
}

function populateNicknames() {
    dom.nicknameSelect.innerHTML = '<option value="">Seleccione un TAG</option>';
    state.nicknames.forEach(nickname => {
        const option = document.createElement('option');
        option.value = nickname;
        option.textContent = nickname;
        dom.nicknameSelect.appendChild(option);
    });
}

function populateTitles(lang) {
    const selectedValue = dom.titleSelect.value;
    dom.titleSelect.innerHTML = '';
    state.titles.forEach(title => {
        const option = document.createElement('option');
        option.value = title.key;
        option.textContent = title[lang] || title.en;
        dom.titleSelect.appendChild(option);
    });
    dom.titleSelect.value = selectedValue;
}

function populateCountries(lang) {
    const t = translations[lang] || translations.es;
    const nameKey = `name_${lang}` || 'name_en';

    const selectedValue = dom.countrySelect.value;

    dom.countrySelect.innerHTML = `<option value="">${t.countryPlaceholder}</option>`;

    state.countries.sort((a, b) => a[nameKey].localeCompare(b[nameKey])).forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = `${country.emoji} ${country[nameKey]}`;
        dom.countrySelect.appendChild(option);
    });

    dom.countrySelect.value = selectedValue;
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
    
    populateCountries(lang);
    populateTitles(lang);
}

async function initialize() {
    [state.countries, state.vtcData, state.nicknames, state.currentDate, state.starMap, state.titles, state.levelRanges] = await Promise.all([
        loadCountries(),
        loadVtcData(),
        loadNicknames(),
        getCurrentDate(),
        loadStarMap(),
        loadTitles(),
        loadLevelRanges()
    ]);
    
    populateCountries(state.language);
    populateNicknames();
    populateTitles(state.language);

    updateUI();
    addEventListeners();
    
    const debouncedGenerate = debounce(() => generateImage(state), 100);
    debouncedGenerate();
}

function addEventListeners() {
    dom.nameInput.addEventListener('input', (e) => {
        state.name = e.target.value;
        debounce(() => generateImage(state), 100)();
    });

    dom.truckersmpLinkInput.addEventListener('input', (e) => {
        state.truckersmpLink = e.target.value;
        validateTruckersmpLink(state.truckersmpLink, translations, state.language);
        debounce(() => generateImage(state), 100)();
    });

    dom.companyLinkInput.addEventListener('input', (e) => {
        state.companyLink = e.target.value;
        validateCompanyLink(state.companyLink, translations, state.language);
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

    dom.titleSelect.addEventListener('change', (e) => {
        state.selectedTitleKey = e.target.value;
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

    dom.textColorToggleInput.addEventListener('change', (e) => {
        state.textColorToggle = e.target.checked;
        debounce(() => generateImage(state), 100)();
    });

}

document.addEventListener('DOMContentLoaded', initialize);
