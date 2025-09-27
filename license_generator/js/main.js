import { dom } from './dom-elements.js';
import { config, translations, loadTranslations } from './config.js';
import { debounce, validateTruckersmpLink, validateCompanyLink, generateLicenseNumber, getUserLevel } from './utils.js';
import { getCurrentDate, loadVtcData, loadCountries, loadStarMap, loadTitles, loadLevelRanges } from './api.js';
import { generateImage, updateDownloadLink } from './canvas.js';
import { generateUserbar } from './userbar.js';

const state = {
    name: '',
    country: '',
    nickname: '',
    truckersmpLink: '',
    companyLink: '',
    promodsToggle: false,
    dbusworldToggle: false,
    watermarkToggle: true,
    qrColorToggle: false,
    textColorToggle: false,
    rankToggle: true,
    backgroundTemplate: 'aura.png',
    language: 'es',
    colorHue: 0,
    saturation: 100,
    customTitle: '',
    selectedTitleKey: 'LOGISTICS_OPERATOR_REGISTRY',
    userImage: null,
    vtcLogoImage: null,
    currentDate: null,
    lastDateFetch: 0,
    isDateFromInternet: false,
    vtcData: { vtcOwners: [] },
    starMap: {},
    countries: [],
    titles: [],
    levelRanges: {},
    userLevel: null,
};

function updateUI() {
    // Update UI elements based on state
    updateLanguage(state.language);
}

function populateNicknames(lang, userLevel) {
    const t = translations[lang] || translations.es;
    dom.nicknameSelect.innerHTML = `<option value="">${t.nicknamePlaceholder}</option>`;

    if (userLevel && t.rank_names) {
        for (let i = 0; i < userLevel; i++) {
            const option = document.createElement('option');
            option.value = t.rank_names[i];
            option.textContent = t.rank_names[i];
            dom.nicknameSelect.appendChild(option);
        }
    }
}

function updateUserRank() {
    const { userId } = generateLicenseNumber(state.truckersmpLink, state.companyLink, state.country);
    state.userLevel = getUserLevel(userId, state.levelRanges.user, state.currentDate ? state.currentDate.year : null);
    populateNicknames(state.language, state.userLevel);
}

function populateTitles(lang) {
    const t = translations[lang] || translations.es;
    const selectedValue = dom.titleSelect.value;
    dom.titleSelect.innerHTML = `<option value="">${t.select_subtitle_placeholder}</option>`;
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
    console.log('Translation object for ', lang, t);
    if (!t) return;

    dom.pageTitle.textContent = t.pageTitle;
    dom.headerTitle.textContent = t.headerTitle;
    dom.navLicense.textContent = t.navLicense;
    dom.nameLabel.textContent = t.nameLabel;
    dom.nicknameLabel.textContent = t.nicknameLabel;
    dom.titleSelectLabel.textContent = t.titleSelectLabel;
    dom.photoLabel.textContent = t.photoLabel;
    dom.countryLabel.textContent = t.countryLabel;
    dom.companyLinkLabel.textContent = t.companyLinkLabel;
    dom.truckersmpLinkLabel.textContent = t.truckersmpLinkLabel;
    dom.customTitleLabel.textContent = t.customTitleLabel;
    dom.watermarkToggleLabel.textContent = t.watermarkToggleLabel;
    dom.qrColorToggleLabel.textContent = t.qrColorToggleLabel;
    dom.vtcLogoLabel.textContent = t.vtcLogoLabel;
    dom.colorLabel.textContent = t.colorLabel;
    dom.saturationLabel.textContent = t.saturationLabel;
    dom.customTitleInput.placeholder = t.customTitlePlaceholder;
    dom.downloadButton.textContent = t.downloadButton;
    dom.infoButton.setAttribute('data-tooltip', t.infoTooltip);
    dom.downloadButton.setAttribute('data-tooltip', t.tooltipMessage);
    dom.rankToggleLabel.textContent = t.rankToggleLabel;
    dom.textColorToggleLabel.textContent = t.textColorToggleLabel;
    dom.warningMessage.textContent = t.warning_refresh_page;
    
    populateCountries(lang);
    populateTitles(lang);
    populateNicknames(lang, state.userLevel);
    renderRankLegend(); // Re-render rank legend for new language
}

function renderRankLegend() {
    console.log('Translations object in renderRankLegend:', translations);
    console.log('State language in renderRankLegend:', state.language);
    const t = translations[state.language] || translations.es;
    const container = document.getElementById('rank-legend');
    if (!container) return;

    container.innerHTML = ''; // Clear previous content

    if (!state.rankToggle) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    const intro = document.createElement('p');
    intro.className = 'rank-legend-intro';
    intro.textContent = t.rank_explanation_text;
    container.appendChild(intro);

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'rank-legend-items';
    container.appendChild(itemsContainer);

    for (let i = 1; i <= 12; i++) {
        const item = document.createElement('div');
        item.className = 'rank-legend-item';

        const img = document.createElement('img');
        img.src = `./license_generator/rank/${i}.png`;
        img.alt = `Rank ${i}`;
        img.width = "16";
        img.height = "16";

        const span = document.createElement('span');
        span.textContent = i;

        item.appendChild(img);
        item.appendChild(span);
        item.setAttribute('data-tooltip', t.rank_names[i-1]);
        itemsContainer.appendChild(item);
    }
}

async function initialize() {
    await loadTranslations(); // Call and await translation loading

    [state.countries, state.vtcData, state.currentDate, state.starMap, state.titles, state.levelRanges] = await Promise.all([
        loadCountries(),
        loadVtcData(),
        getCurrentDate(),
        loadStarMap(),
        loadTitles(),
        loadLevelRanges()
    ]);
    
    // Populate dom object after DOM is ready
    Object.assign(dom, {
        canvas: document.getElementById("canvas"),
        ctx: document.getElementById("canvas").getContext("2d"),
        nameInput: document.getElementById("nombre"),
        photoInput: document.getElementById("foto"),
        vtcLogoInput: document.getElementById("vtcLogo"),
        countrySelect: document.getElementById("pais"),
        nicknameSelect: document.getElementById("nickname"),
        companyLinkInput: document.getElementById("empresaLink"),
        truckersmpLinkInput: document.getElementById("truckersmpLink"),
        truckersmpStatus: document.getElementById("truckersmpStatus"),
        companyLinkStatus: document.getElementById("companyLinkStatus"),
        nicknameGroup: document.getElementById("nicknameGroup"),
        titleSelect: document.getElementById("titleSelect"),
        titleSelectLabel: document.getElementById("titleSelectLabel"),
        promodsToggleInput: document.getElementById("promodsToggle"),
        dbusworldToggleInput: document.getElementById("dbusworldToggle"),
        watermarkToggleInput: document.getElementById("watermarkToggle"),
        qrColorToggleInput: document.getElementById("qrColorToggle"),
        backgroundSelect: document.getElementById("backgroundSelect"),
        languageSelect: document.getElementById("languageToggle"),
        colorSlider: document.getElementById("colorSlider"),
        colorValue: document.getElementById("colorValue"),
        saturationSlider: document.getElementById("saturationSlider"),
        saturationValue: document.getElementById("saturationValue"),
        downloadButton: document.getElementById("botonDescargar"),
        infoButton: document.getElementById("infoButton"),
        customTitleInput: document.getElementById("customTitle"),
        pageTitle: document.getElementById("pageTitle"),
        headerTitle: document.getElementById("headerTitle"),
        navLicense: document.getElementById("navLicense"),
        nameLabel: document.getElementById("nameLabel"),
        nicknameLabel: document.getElementById("nicknameLabel"),
        photoLabel: document.getElementById("photoLabel"),
        countryLabel: document.getElementById("countryLabel"),
        companyLinkLabel: document.getElementById("companyLinkLabel"),
        truckersmpLinkLabel: document.getElementById("truckersmpLinkLabel"),
        customTitleLabel: document.getElementById("customTitleLabel"),
        watermarkToggleLabel: document.getElementById("watermarkToggleLabel"),
        qrColorToggleLabel: document.getElementById("qrColorToggleLabel"),
        textColorToggleInput: document.getElementById("textColorToggle"),
        textColorToggleLabel: document.getElementById("textColorToggleLabel"),
        rankToggleInput: document.getElementById("rankToggle"),
        rankToggleLabel: document.getElementById("rankToggleLabel"),
        vtcLogoLabel: document.getElementById("vtcLogoLabel"),
        colorLabel: document.getElementById("colorLabel"),
        saturationLabel: document.getElementById("saturationLabel"),
        downloadLink: document.getElementById("descargar"),
        userbarBackgroundSelect: document.getElementById("userbarBackgroundSelect"),
        userbarCanvas: document.getElementById("userbar-canvas"),
        downloadUserbar: document.getElementById("download-userbar"),
        userbarBgPrev: document.getElementById("userbar-bg-prev"),
        userbarBgNext: document.getElementById("userbar-bg-next"),
        userbarBgName: document.getElementById("userbar-bg-name"),
        warningMessage: document.getElementById("warningMessage"), // Added warningMessage
    });

    populateCountries(state.language);
    populateNicknames(state.language, state.userLevel);
    populateTitles(state.language);

    updateUI();
    const debouncedGenerate = debounce(() => {
        generateImage(state).then(() => {
            updateDownloadLink(state.name);
        });
        generateUserbar(state, dom);
    }, 100);

    addEventListeners(debouncedGenerate);
    
    debouncedGenerate();
    renderRankLegend(); // Initial render
}

function addEventListeners(debouncedGenerate) {
    dom.nameInput.addEventListener('input', (e) => {
        state.name = e.target.value;
        debouncedGenerate();
    });

    if (dom.userbarBgPrev && dom.userbarBgNext && dom.userbarBackgroundSelect && dom.userbarBgName) {
        dom.userbarBgPrev.addEventListener('click', () => {
            const select = dom.userbarBackgroundSelect;
            select.selectedIndex = (select.selectedIndex - 1 + select.options.length) % select.options.length;
            dom.userbarBgName.textContent = select.options[select.selectedIndex].text;
            debouncedGenerate();
        });

        dom.userbarBgNext.addEventListener('click', () => {
            const select = dom.userbarBackgroundSelect;
            select.selectedIndex = (select.selectedIndex + 1) % select.options.length;
            dom.userbarBgName.textContent = select.options[select.selectedIndex].text;
            debouncedGenerate();
        });
    }

    dom.truckersmpLinkInput.addEventListener('input', (e) => {
        state.truckersmpLink = e.target.value;
        validateTruckersmpLink(state.truckersmpLink, translations, state.language);
        updateUserRank();
        debouncedGenerate();
    });

    dom.companyLinkInput.addEventListener('input', (e) => {
        state.companyLink = e.target.value;
        validateCompanyLink(state.companyLink, translations, state.language);
        debouncedGenerate();
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
                    debouncedGenerate();
                };
            };
            reader.readAsDataURL(file);
        } else {
            state.userImage = null;
            debouncedGenerate();
        }
    });

    dom.backgroundSelect.addEventListener('change', (e) => {
        state.backgroundTemplate = e.target.value;
        debouncedGenerate();
    });

    dom.languageSelect.addEventListener('change', (e) => {
        state.language = e.target.value;
        updateLanguage(state.language);
        debouncedGenerate();
    });

    dom.countrySelect.addEventListener('change', (e) => {
        state.country = e.target.value;
        debouncedGenerate();
    });

    dom.nicknameSelect.addEventListener('change', (e) => {
        state.nickname = e.target.value;
        debouncedGenerate();
    });

    dom.titleSelect.addEventListener('change', (e) => {
        state.selectedTitleKey = e.target.value;
        debouncedGenerate();
    });

    dom.colorSlider.addEventListener('input', (e) => {
        state.colorHue = e.target.value;
        dom.colorValue.textContent = `${state.colorHue}°`;
        debouncedGenerate();
    });

    dom.saturationSlider.addEventListener('input', (e) => {
        state.saturation = e.target.value;
        dom.saturationValue.textContent = `${state.saturation}%`;
        debouncedGenerate();
    });

    dom.customTitleInput.addEventListener('input', (e) => {
        state.customTitle = e.target.value;
        debouncedGenerate();
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
                    debouncedGenerate();
                };
            };
            reader.readAsDataURL(file);
        } else {
            state.vtcLogoImage = null;
            debouncedGenerate();
        }
    });

    dom.promodsToggleInput.addEventListener('change', (e) => {
        state.promodsToggle = e.target.checked;
        debouncedGenerate();
    });

    dom.dbusworldToggleInput.addEventListener('change', (e) => {
        state.dbusworldToggle = e.target.checked;
        debouncedGenerate();
    });

    dom.watermarkToggleInput.addEventListener('change', (e) => {
        state.watermarkToggle = e.target.checked;
        debouncedGenerate();
    });

    dom.qrColorToggleInput.addEventListener('change', (e) => {
        state.qrColorToggle = e.target.checked;
        debouncedGenerate();
    });

    dom.textColorToggleInput.addEventListener('change', (e) => {
        state.textColorToggle = e.target.checked;
        debouncedGenerate();
    });

    dom.rankToggleInput.addEventListener('change', (e) => {
        state.rankToggle = e.target.checked;
        debouncedGenerate();
        renderRankLegend(); // Update legend on toggle change
    });

}

document.addEventListener('DOMContentLoaded', initialize);