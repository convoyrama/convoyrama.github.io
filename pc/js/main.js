// test
const loadCountries = async () => {
    try {
        const response = await fetch('../license_generator/data/countries.json');
        const countries = await response.json();
        const countrySelect = document.getElementById('a4');
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.emoji;
            option.textContent = country.name_es;
            countrySelect.appendChild(option);
        });
        f8(); // Set default country after loading
    } catch (error) {
        console.error('Error loading countries:', error);
    }
};

let currentBgIndex = 0;

const f6 = (a, b) => {
    let c;
    return function(...d) {
        const e = () => {
            clearTimeout(c);
            a(...d);
        };
        clearTimeout(c);
        c = setTimeout(e, b);
    }
};

const f7 = () => {
    localStorage.setItem("defaultCountry", a4.value);
};

const f8 = () => {
    const v2 = localStorage.getItem("defaultCountry");
    if (v2) {
        a4.value = v2;
    }
};

const f3 = () => {
    const v3 = v1[a1.value];
    a3.value = v3.size;
    a5.value = v3.flagSize;
    a6.value = v3.by;
    a7.value = v3.ny;
    a8.value = v3.outSize;
    o1.textContent = v3.size;
    o2.textContent = v3.flagSize;
    o3.textContent = v3.by;
    o4.textContent = v3.ny;
    o5.textContent = v3.outSize;
    f1.textContent = v3.font.split(",")[0].replace(/'/g, "");

    if (a1.value === "LS") {
        b1.checked = true;
        b2.checked = true;
        b4.checked = true;
        document.querySelectorAll(".ls-only").forEach(a => a.style.display = "block");
        document.querySelectorAll(".tmp-only").forEach(a => a.style.display = "none");
    } else if (a1.value === "TMP") {
        document.querySelectorAll(".ls-only").forEach(a => a.style.display = "none");
        document.querySelectorAll(".tmp-only").forEach(a => a.style.display = "block");
    } else {
        document.querySelectorAll(".ls-only").forEach(a => a.style.display = "none");
        document.querySelectorAll(".tmp-only").forEach(a => a.style.display = "none");
    }

    f2();
};

const v20 = f6(f2, 100);

[a2, a4, a3, a5, a6, a7, a8, a9, b1, b2, b4, document.getElementById('tmp-logo-toggle'), document.getElementById('promods-logo-toggle'), document.getElementById('dbus-logo-toggle')].forEach(a => a.addEventListener("input", v20));
a1.addEventListener("change", f3);
a4.addEventListener("change", f7);

// New event listeners for TMP
const prevBg = document.getElementById('prev-bg');
const nextBg = document.getElementById('next-bg');
const bgName = document.getElementById('bg-name');
const hueSlider = document.getElementById('hue-slider');
const vtcLogo = document.getElementById('vtc-logo');
const year = document.getElementById('year');
const nameYearColor = document.getElementById('name-year-color');

prevBg.addEventListener('click', () => {
    const backgrounds = v1['TMP'].backgrounds;
    currentBgIndex = (currentBgIndex - 1 + backgrounds.length) % backgrounds.length;
    bgName.textContent = backgrounds[currentBgIndex].split('/').pop();
    f2();
});

nextBg.addEventListener('click', () => {
    const backgrounds = v1['TMP'].backgrounds;
    currentBgIndex = (currentBgIndex + 1) % backgrounds.length;
    bgName.textContent = backgrounds[currentBgIndex].split('/').pop();
    f2();
});

hueSlider.addEventListener('input', () => {
    document.getElementById('hue-value').textContent = hueSlider.value;
    f2();
});
vtcLogo.addEventListener('change', f2);
year.addEventListener('input', v20);
nameYearColor.addEventListener('input', v20);


loadCountries();
f3();
