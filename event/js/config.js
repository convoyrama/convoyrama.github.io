export const timezoneRegions = {
    hispano: {
        name: 'region_hispano',
        zones: [
            { iana_tz: 'America/Mexico_City', key: 'tz_mx_gt_hn_cr' },
            { iana_tz: 'America/Lima', key: 'tz_pe_ec_co' },
            { iana_tz: 'America/Caracas', key: 'tz_ve' },
            { iana_tz: 'America/La_Paz', key: 'tz_bo_cl_py' },
            { iana_tz: 'America/Montevideo', key: 'tz_uy_ar_br' },
            { iana_tz: 'Europe/Madrid', key: 'tz_es' }
        ]
    },
    lusofono: {
        name: 'region_lusofono',
        zones: [
            { iana_tz: 'America/Manaus', key: 'tz_br_manaus' },
            { iana_tz: 'America/Sao_Paulo', key: 'tz_br_brasilia' },
            { iana_tz: 'Europe/Lisbon', key: 'tz_pt_gw' },
            { iana_tz: 'Europe/Madrid', key: 'tz_es_ma_ao' },
            { iana_tz: 'Africa/Maputo', key: 'tz_mz' }
        ]
    },
    north_america: {
        name: 'region_north_america',
        zones: [
            { iana_tz: 'America/Los_Angeles', key: 'tz_us_pst' },
            { iana_tz: 'America/Denver', key: 'tz_us_mst' },
            { iana_tz: 'America/Chicago', key: 'tz_us_cst' },
            { iana_tz: 'America/New_York', key: 'tz_us_est' },
            { iana_tz: 'Europe/London', key: 'tz_gb' }
        ]
    },
    europe: {
        name: 'region_europe',
        zones: [
            { iana_tz: 'Europe/London', key: 'tz_pt_gb_ie' },
            { iana_tz: 'Europe/Berlin', key: 'tz_es_fr_it_de_pl' },
            { iana_tz: 'Europe/Athens', key: 'tz_gr_fi' },
            { iana_tz: 'Europe/Moscow', key: 'tz_ru_tr' }
        ]
    }
};

export const timezoneCountryCodes = {
    'tz_mx_gt_hn_cr': ['MX', 'GT', 'HN', 'CR'],
    'tz_pe_ec_co': ['PE', 'EC', 'CO'],
    'tz_ve': ['VE'],
    'tz_bo_cl_py': ['BO', 'CL', 'PY'],
    'tz_uy_ar_br': ['UY', 'AR', 'BR'],
    'tz_es': ['ES'],
    'tz_br_manaus': ['BR'],
    'tz_br_brasilia': ['BR'],
    'tz_pt_gw': ['PT', 'GW'],
    'tz_es_ma_ao': ['ES', 'MA', 'AO'],
    'tz_mz': ['MZ'],
    'tz_us_pst': ['US'],
    'tz_us_mst': ['US'],
    'tz_us_cst': ['US'],
    'tz_us_est': ['US'],
    'tz_gb': ['GB'],
    'tz_pt_gb_ie': ['PT', 'GB', 'IE'],
    'tz_es_fr_it_de_pl': ['ES', 'FR', 'IT', 'DE', 'PL'],
    'tz_gr_fi': ['GR', 'FI'],
    'tz_ru_tr': ['RU', 'TR']
};