
// test
const f0 = a => new Promise(b => {
    let c = new Image();
    c.onload = () => b(c);
    c.onerror = () => b(null);
    c.src = twemoji.parse(a, { base: './twemoji-14.0.2/assets/', folder: 'svg', ext: '.svg' }).match(/src="([^"]+)"/)[1];
    c.crossOrigin = "anonymous";
});

const f2 = async () => {
    const v4 = v1[a1.value];
    const v5 = a2.value || "Sin_nombre";
    const v6 = a4.value || "";
    const v7 = parseInt(a3.value);
    const v8 = parseInt(a5.value);
    const v9 = parseInt(a6.value);
    const v10 = parseInt(a7.value);
    const v11 = parseInt(a8.value);
    const v12 = a9.checked;
    const v13 = (a1.value === "LS" || a1.value === "TMP") && b1.checked;
    const v14 = (a1.value === "LS" || a1.value === "TMP") && b2.checked;
    const v15_2 = (a1.value === "LS" || a1.value === "TMP") && b4.checked;

    o1.textContent = v7;
    a3.setAttribute("aria-valuenow", v7);
    o2.textContent = v8;
    a5.setAttribute("aria-valuenow", v8);
    o3.textContent = v9;
    a6.setAttribute("aria-valuenow", v9);
    o4.textContent = v10;
    a7.setAttribute("aria-valuenow", v10);
    o5.textContent = v11;
    a8.setAttribute("aria-valuenow", v11);

    w.width = v11;
    w.height = v11;
    x.clearRect(0, 0, w.width, w.height);

    if (v12) {
        x.save();
        x.beginPath();
        x.arc(v11 / 2, v11 / 2, v11 / 2, 0, Math.PI * 2);
        x.closePath();
        x.clip();
    }

    if (a1.value === "TMP") {
        const hueValue = document.getElementById('hue-slider').value;
        x.filter = `hue-rotate(${hueValue}deg)`;
        
        let bgSrc = v1['TMP'].backgrounds[currentBgIndex];
        if (window.customBgUrl) {
            bgSrc = window.customBgUrl;
        }

        if (bgSrc) {
            const bgImage = new Image();
            bgImage.src = bgSrc;
            await new Promise(a => {
                bgImage.onload = () => {
                    x.drawImage(bgImage, 0, 0, w.width, w.height);
                    a();
                };
                bgImage.onerror = () => {
                    console.error(`Failed to load ${bgImage.src}`);
                    a();
                }
            });
        }
    } else {
        if (v15_2 && v4.fondo_inferior) { // b4 checked, "Fondo"
            const v15_4 = new Image();
            v15_4.src = v4.fondo_inferior;
            await new Promise(a => {
                v15_4.onload = () => {
                    x.drawImage(v15_4, 0, 0, w.width, w.height);
                    a();
                };
                v15_4.onerror = () => {
                    console.error(`Failed to load ${v4.fondo_inferior}`);
                    a();
                }
            });
        }

        if (v13 && v4.huellas) { // b1 checked, "Huellas"
            const v15_5 = new Image();
            v15_5.src = v4.huellas;
            await new Promise(a => {
                v15_5.onload = () => {
                    x.drawImage(v15_5, 0, 0, w.width, w.height);
                    a();
                };
                v15_5.onerror = () => {
                    console.error(`Failed to load ${v4.huellas}`);
                    a();
                }
            });
        }

        const v16 = new Image();
        v16.src = v4.fondo;
        await new Promise(a => {
            v16.onload = () => {
                x.drawImage(v16, 0, 0, w.width, w.height);
                a();
            };
            v16.onerror = () => {
                console.error(`Failed to load ${v4.fondo}`);
                x.fillStyle = "transparent";
                a();
            }
        });
    }
    
    x.filter = "none";

    x.textAlign = "center";

    if (window.vtcLogoUrl) {
        const vtcLogoImg = new Image();
        vtcLogoImg.src = window.vtcLogoUrl;
        await new Promise(a => {
            vtcLogoImg.onload = () => {
                const logoSize = 100;
                x.drawImage(vtcLogoImg, w.width / 2 - logoSize / 2, 10, logoSize, logoSize);
                a();
            };
            vtcLogoImg.onerror = () => a();
        });
    }

    if (v6) {
        const v17 = await f0(v6, v8);
        if (v17) {
            x.drawImage(v17, w.width / 2 - v8 / 2, v9 - v8, v8, v8);
        }
    }

    if (a1.value === "CDS" && v4.sombra) {
        x.shadowColor = v4.sombra;
        x.shadowOffsetX = 2;
        x.shadowOffsetY = 2;
        x.shadowBlur = 0;
    } else {
        x.shadowColor = "transparent";
        x.shadowOffsetX = 0;
        x.shadowOffsetY = 0;
        x.shadowBlur = 0;
    }

    x.font = `bold ${v7}px ${v4.font}`;
    x.fillStyle = v4.color;
    x.fillText(v5, w.width / 2, v10);

    const yearValue = document.getElementById('year').value;
    x.font = `bold 40px ${v4.font}`;
    x.fillStyle = v4.color;
    x.fillText(yearValue, w.width / 2, v10 + 50);

    if (document.getElementById('tmp-logo-toggle').checked && a1.value === "TMP") {
        const tmpLogo = new Image();
        tmpLogo.src = 'fondos/truckersmp-logo-sm.png';
        await new Promise(resolve => {
            tmpLogo.onload = () => {
                const yPos = v9 - v8 + (v10 - (v9-v8)) / 2 - tmpLogo.height / 2;
                x.drawImage(tmpLogo, w.width / 2 - tmpLogo.width / 2, yPos);
                resolve();
            };
            tmpLogo.onerror = () => resolve();
        });
    }

    if (document.getElementById('promods-logo-toggle').checked) {
        const promodsLogo = new Image();
        promodsLogo.src = 'fondos/promods.png';
        await new Promise(resolve => {
            promodsLogo.onload = () => {
                x.drawImage(promodsLogo, 10, w.height - promodsLogo.height / 2 - 10, promodsLogo.width / 2, promodsLogo.height / 2);
                resolve();
            };
            promodsLogo.onerror = () => resolve();
        });
    }

    if (document.getElementById('dbus-logo-toggle').checked) {
        const dbusLogo = new Image();
        dbusLogo.src = 'fondos/dbusworld.png';
        await new Promise(resolve => {
            dbusLogo.onload = () => {
                x.drawImage(dbusLogo, w.width - dbusLogo.width / 2 - 10, w.height - dbusLogo.height / 2 - 10, dbusLogo.width / 2, dbusLogo.height / 2);
                resolve();
            };
            dbusLogo.onerror = () => resolve();
        });
    }

    if (v14 && v4.foregroundLayer) {
        const v18 = new Image();
        v18.src = v4.foregroundLayer;
        await new Promise(a => {
            v18.onload = () => {
                x.drawImage(v18, 0, 0, w.width, w.height);
                a();
            };
            v18.onerror = () => {
                console.error("Failed to load lsplumas.png");
                a();
            }
        });
    }

    if (v12) {
        x.restore();
    }

    const v19 = document.getElementById("d1");
    v19.href = w.toDataURL("image/png");
    v19.download = `perfil_${a1.value}_${v5}.png`;
};
