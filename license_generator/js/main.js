import { dom } from './dom-elements.js';
import { config, translations, loadTranslations } from './config.js';
import { debounce, validateTruckersmpLink, validateCompanyLink, generateLicenseNumber, getUserLevel, getVerifiedUserLevel } from './utils.js';
import { getCurrentDate, loadCountries, loadStarMap, loadTitles, loadLevelRanges } from './api.js';
import { generateImage, performDownload } from './canvas.js';
import { generateUserbar } from './userbar.js';

const HMAC_SECRET_KEY = 'TPPrZX8QA4DH3ekn4JKk';

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
    starMap: {},
    countries: [],
    titles: [],
    levelRanges: {},
    userLevel: null,
    verificationCode: '',
    verifiedJoinDate: null,
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
    const currentYear = state.currentDate ? state.currentDate.year : new Date().getFullYear();

    if (state.verifiedJoinDate) {
        // Use the accurate, verified join date if available
        state.userLevel = getVerifiedUserLevel(state.verifiedJoinDate, currentYear);
    } else {
        // Fallback to the old approximation method
        const { userId } = generateLicenseNumber(state.truckersmpLink, state.companyLink, state.country);
        state.userLevel = getUserLevel(userId, state.levelRanges.user, currentYear);
    }
    
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
    dom.downloadUserbarButton.textContent = t.downloadUserbarButton;
    dom.warningMessage.textContent = t.warning_refresh_page;

    // Translations for the new verification section
    const verificationIntro = document.querySelector('#verification-section .rank-legend-intro');
    if (verificationIntro) verificationIntro.innerHTML = t.verification_intro; // Use innerHTML for the <code> tag
    const verificationLabel = document.querySelector('label[for="verificationCodeInput"]');
    if (verificationLabel) verificationLabel.textContent = t.verification_label;
    if (dom.verificationCodeInput) dom.verificationCodeInput.placeholder = t.verification_placeholder;
    
    populateCountries(lang);
    populateTitles(lang);
    populateNicknames(lang, state.userLevel);
    renderRankLegend(); // Re-render rank legend for new language
}

function renderRankLegend() {
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

    // Dynamically create and append the verification section
    const verificationWrapper = document.createElement('div');
    verificationWrapper.style.marginTop = '20px';

    const verificationIntro = document.createElement('p');
    verificationIntro.className = 'rank-legend-intro';
    verificationIntro.innerHTML = t.verification_intro; // Use innerHTML for the link
    verificationWrapper.appendChild(verificationIntro);

    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';
    inputGroup.style.textAlign = 'center';

    const verificationInput = document.createElement('input');
    verificationInput.type = 'text';
    verificationInput.id = 'verificationCodeInput';
    verificationInput.placeholder = t.verification_placeholder;
    inputGroup.appendChild(verificationInput);

    const verificationStatus = document.createElement('div');
    verificationStatus.id = 'verificationStatus';
    inputGroup.appendChild(verificationStatus);

    verificationWrapper.appendChild(inputGroup);
    container.appendChild(verificationWrapper);

    // Re-assign verification DOM elements and attach listener
    dom.verificationCodeInput = verificationInput;
    dom.verificationStatus = verificationStatus;
    const debouncedGenerate = debounce(() => {
        generateImage(state);
        generateUserbar(state, dom);
    }, 100);
    dom.verificationCodeInput.addEventListener('input', (e) => {
        handleVerification(e.target.value, debouncedGenerate);
    });
}

async function initialize() {
    await loadTranslations(); // Call and await translation loading

    [state.countries, state.currentDate, state.starMap, state.titles, state.levelRanges] = await Promise.all([
        loadCountries(),
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
        downloadUserbarButton: document.getElementById("downloadUserbarButton"),
        mainBgPrev: document.getElementById("main-bg-prev"),
        mainBgNext: document.getElementById("main-bg-next"),
        mainBgName: document.getElementById("main-bg-name"),
        warningMessage: document.getElementById("warningMessage"),
    });

    populateCountries(state.language);
    populateNicknames(state.language, state.userLevel);
    populateTitles(state.language);

    updateUI();
    const debouncedGenerate = debounce(() => {
        generateImage(state);
        generateUserbar(state, dom);
    }, 100);

    addEventListeners(debouncedGenerate);

    // Replace the download link's default behavior with on-demand generation
    dom.downloadLink.addEventListener('click', (e) => {
        e.preventDefault(); // Stop the link from navigating
        
        // Indicate to the user that something is happening
        const originalText = dom.downloadButton.textContent;
        dom.downloadButton.textContent = translations[state.language].generating_image || 'Generating...';
        dom.downloadButton.disabled = true;

        // Use a short timeout to allow the UI to update
        setTimeout(() => {
            generateImage(state).then(() => {
                performDownload(state); // This is the new function in canvas.js
                
                // Restore the button
                dom.downloadButton.textContent = originalText;
                dom.downloadButton.disabled = false;
            });
        }, 50);
    });
    
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
        dom.nameInput.disabled = false; // Unlock name on link change
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

    if (dom.mainBgPrev && dom.mainBgNext && dom.backgroundSelect && dom.mainBgName) {
        dom.mainBgPrev.addEventListener('click', () => {
            const select = dom.backgroundSelect;
            select.selectedIndex = (select.selectedIndex - 1 + select.options.length) % select.options.length;
            dom.mainBgName.textContent = select.options[select.selectedIndex].text;
            state.backgroundTemplate = select.value;
            debouncedGenerate();
        });

        dom.mainBgNext.addEventListener('click', () => {
            const select = dom.backgroundSelect;
            select.selectedIndex = (select.selectedIndex + 1) % select.options.length;
            dom.mainBgName.textContent = select.options[select.selectedIndex].text;
            state.backgroundTemplate = select.value;
            debouncedGenerate();
        });
    }

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
        renderRankLegend(); // Update legend on toggle change
    });

}

async function handleVerification(code, callback) {
    const t = translations[state.language] || translations.es;
    // Reset VTC owner status at the beginning of every verification attempt
    state.isVtcOwner = false;

    if (!code) {
        state.verifiedJoinDate = null;
        dom.verificationStatus.textContent = '';
        dom.nameInput.disabled = false;
        dom.truckersmpLinkInput.disabled = false;
        dom.companyLinkInput.disabled = false;
        callback();
        return;
    }

    const parts = code.split('.');
    if (parts.length !== 2) {
        state.verifiedJoinDate = null;
        dom.verificationStatus.textContent = t.verification_invalid;
        dom.verificationStatus.style.color = 'red';
        dom.nameInput.disabled = false;
        dom.truckersmpLinkInput.disabled = false;
        dom.companyLinkInput.disabled = false;
        callback();
        return;
    }

    const [encodedPayload, signature] = parts;

    try {
        const binaryString = atob(encodedPayload);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const payload = new TextDecoder().decode(bytes);

        const key = await window.crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(HMAC_SECRET_KEY),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const signatureBytes = new Uint8Array(signature.match(/../g).map(h => parseInt(h, 16)));

        const isValid = await window.crypto.subtle.verify(
            'HMAC',
            key,
            signatureBytes,
            new TextEncoder().encode(payload)
        );

        if (isValid) {
            const payloadParts = payload.split('|');
            const [verifiedUserId, joinDate, verifiedName] = payloadParts;
            const vtcId = payloadParts.length > 3 ? payloadParts[3] : null;
            const ownerId = payloadParts.length > 4 ? payloadParts[4] : null;

            // Always update state with verified data first
            state.verifiedJoinDate = joinDate;
            state.name = verifiedName;
            state.truckersmpLink = `https://truckersmp.com/user/${verifiedUserId}`;
            if (vtcId) {
                state.companyLink = `https://truckersmp.com/vtc/${vtcId}`;
            }

            // Update UI and lock fields
            dom.verificationStatus.textContent = t.verification_success;
            dom.verificationStatus.style.color = 'green';
            dom.nameInput.value = verifiedName;
            dom.truckersmpLinkInput.value = state.truckersmpLink;
            dom.nameInput.disabled = true;
            dom.truckersmpLinkInput.disabled = true;

            if (vtcId) {
                dom.companyLinkInput.value = state.companyLink;
                dom.companyLinkInput.disabled = true;
            }

            // Check for VTC ownership
            if (vtcId && ownerId && verifiedUserId === ownerId) {
                state.isVtcOwner = true;
                console.log('VTC Ownership VERIFIED');
            } else {
                state.isVtcOwner = false;
                console.log('VTC Ownership NOT verified or data not present');
            }

            updateUserRank(); // Recalculate rank with verified data
            
        } else {
            state.verifiedJoinDate = null;
            state.isVtcOwner = false;
            dom.verificationStatus.textContent = t.verification_tampered;
            dom.verificationStatus.style.color = 'red';
            dom.nameInput.disabled = false;
            dom.truckersmpLinkInput.disabled = false;
            dom.companyLinkInput.disabled = false;
        }
    } catch (error) {
        console.error('Error during verification:', error);
        state.verifiedJoinDate = null;
        state.isVtcOwner = false;
        dom.verificationStatus.textContent = t.verification_error;
        dom.verificationStatus.style.color = 'red';
        dom.nameInput.disabled = false;
        dom.truckersmpLinkInput.disabled = false;
        dom.companyLinkInput.disabled = false;
    }
    callback();
}

document.addEventListener('DOMContentLoaded', initialize);