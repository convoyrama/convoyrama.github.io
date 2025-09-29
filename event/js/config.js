export const timezoneRegions = {
    hispano: {
        name: 'region_hispano',
        zones: [
            { offset: -6, key: 'tz_mx_gt_hn_cr' },
            { offset: -5, key: 'tz_pe_ec_co' },
            { offset: -4.5, key: 'tz_ve' },
            { offset: -4, key: 'tz_bo_cl_py' },
            { offset: -3, key: 'tz_uy_ar_br' },
            { offset: 1, key: 'tz_es' }
        ]
    },
    lusofono: {
        name: 'region_lusofono',
        zones: [
            { offset: -4, key: 'tz_br_manaus' },
            { offset: -3, key: 'tz_br_brasilia' },
            { offset: 0, key: 'tz_pt_gw' },
            { offset: 1, key: 'tz_es_ma_ao' },
            { offset: 2, key: 'tz_mz' }
        ]
    },
    north_america: {
        name: 'region_north_america',
        zones: [
            { offset: -8, key: 'tz_us_pst' },
            { offset: -7, key: 'tz_us_mst' },
            { offset: -6, key: 'tz_us_cst' },
            { offset: -5, key: 'tz_us_est' },
            { offset: 0, key: 'tz_gb' }
        ]
    },
    europe: {
        name: 'region_europe',
        zones: [
            { offset: 0, key: 'tz_pt_gb_ie' },
            { offset: 1, key: 'tz_es_fr_it_de_pl' },
            { offset: 2, key: 'tz_gr_fi' },
            { offset: 3, key: 'tz_ru_tr' }
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