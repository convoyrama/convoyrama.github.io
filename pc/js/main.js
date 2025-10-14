
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
    b1.checked = a1.value === "LS" || a1.value === "TMP";
    b2.checked = false;
    b4.checked = false;
    document.querySelectorAll(".ls-only").forEach(a => a.style.display = (a1.value === "LS" || a1.value === "TMP") ? "block" : "none");
    f2();
};

const v20 = f6(f2, 100);

[a2, a4, a3, a5, a6, a7, a8, a9, b1, b2, b4].forEach(a => a.addEventListener("input", v20));
a1.addEventListener("change", f3);
a4.addEventListener("change", f7);

f8();
f3();
