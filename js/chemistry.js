/**
 * Chemistry Data Module
 * Contains all chemistry knowledge for the coloring app
 */

// Global storage for custom pages (loaded via scripts)
window.CUSTOM_PAGES = window.CUSTOM_PAGES || {};
window.registerPage = function (data) {
    if (data && data.id) {
        window.CUSTOM_PAGES[data.id] = data;
        console.log(`Registered custom page: ${data.id}`);
    }
};

// Color palettes for different coloring page types
const COLOR_PALETTES = {
    // Salt environment (acidic/neutral/alkaline)
    saltEnvironment: {
        id: 'saltEnvironment',
        name: 'Среда солей',
        colors: [
            { key: 'acidic', color: '#E74C3C', label: 'Кислая' },
            { key: 'neutral', color: '#2ECC71', label: 'Нейтральная' },
            { key: 'alkaline', color: '#F1C40F', label: 'Щелочная' }
        ]
    },

    // Flame colors for metal ions
    flameColors: {
        id: 'flameColors',
        name: 'Цвет пламени',
        colors: [
            { key: 'yellow', color: '#FFD700', label: 'Na⁺ — Жёлтый' },
            { key: 'violet', color: '#9B59B6', label: 'K⁺ — Фиолетовый' },
            { key: 'red', color: '#C0392B', label: 'Sr²⁺, Li⁺ — Красный' },
            { key: 'green', color: '#27AE60', label: 'Ba²⁺ — Зелёный' },
            { key: 'colorless', color: '#D5D5D5', label: 'Бесцветный' }
        ]
    },

    // Substance colors
    substanceColors: {
        id: 'substanceColors',
        name: 'Цвета веществ',
        colors: [
            { key: 'white', color: '#FFFFFF', label: 'Белый' },
            { key: 'black', color: '#000000', label: 'Чёрный' },
            { key: 'green', color: '#27AE60', label: 'Зелёный' },
            { key: 'brown', color: '#8B4513', label: 'Коричневый' },
            { key: 'yellow', color: '#F1C40F', label: 'Жёлтый' },
            { key: 'orange', color: '#E67E22', label: 'Оранжевый' },
            { key: 'red', color: '#E74C3C', label: 'Красный' },
            { key: 'blue', color: '#3498DB', label: 'Синий' },
            { key: 'gray', color: '#95A5A6', label: 'Серый' },
            // New colors from user images
            { key: 'red_deep', color: '#D50D09', label: 'Тёмно-красный' },
            { key: 'red_orange', color: '#EF3F0E', label: 'Красно-оранжевый' },
            { key: 'pink_hot', color: '#FB4B82', label: 'Ярко-розовый' },
            { key: 'red_bordeaux', color: '#A01A14', label: 'Бордовый' },
            { key: 'pink_pale', color: '#C2756E', label: 'Бледно-розовый' },
            { key: 'orange_bright', color: '#FE5D00', label: 'Ярко-оранжевый' },
            { key: 'yellow_bright', color: '#FDE801', label: 'Ярко-жёлтый' },
            { key: 'orange_burnt', color: '#E36820', label: 'Рыжий' },
            { key: 'salmon', color: '#E28366', label: 'Лососевый' },
            { key: 'sand', color: '#F2DE97', label: 'Песочный' },
            { key: 'green_forest', color: '#206A16', label: 'Лесной зелёный' },
            { key: 'green_bright', color: '#44D162', label: 'Ярко-зелёный' },
            { key: 'green_pale', color: '#78AC62', label: 'Бледно-зелёный' },
            { key: 'mint', color: '#BAFDCE', label: 'Мятный' },
            { key: 'turquoise', color: '#3FE5B9', label: 'Бирюзовый' },
            { key: 'blue_bright', color: '#1152C2', label: 'Ярко-синий' },
            { key: 'sky_blue', color: '#288CDE', label: 'Голубой' },
            { key: 'pale_blue', color: '#B9E3D0', label: 'Бледно-голубой' },
            { key: 'lilac', color: '#9C7AAC', label: 'Сиреневый' },
            { key: 'purple_deep', color: '#905AAE', label: 'Тёмно-фиолетовый' },
            { key: 'brown_red', color: '#6B2616', label: 'Красно-коричневый' },
            { key: 'brown_dark', color: '#4B1C0A', label: 'Тёмно-коричневый' },
            { key: 'chocolate', color: '#57290F', label: 'Шоколадный' },
            { key: 'gray_light', color: '#A6A6A6', label: 'Светло-серый' }
        ]
    }
};

// Chemistry knowledge base
const CHEMISTRY_DATA = {
    // Salt environments (from hydrolysis)
    saltEnvironments: {
        // Format: formula -> environment key
        'KClO4': 'neutral',      // Соль сильной кислоты и сильного основания
        'MgSO4': 'acidic',       // Соль сильной кислоты и слабого основания
        'FeCl3': 'acidic',       // Соль сильной кислоты и слабого основания
        'Na2Cr2O7': 'neutral',   // Хромат натрия - соль сильного основания
        'CuBr2': 'acidic',       // Соль сильной кислоты и слабого основания
        'Zn(NO3)2': 'acidic',    // Соль сильной кислоты и слабого основания
        'Al2(SO4)3': 'acidic',   // Соль сильной кислоты и слабого основания
        'FeCl2': 'acidic',       // Соль сильной кислоты и слабого основания
        'NH4I': 'acidic',        // Соль сильной кислоты и слабого основания
        'K3PO4': 'alkaline',     // Соль слабой кислоты и сильного основания
        'Na2HPO4': 'alkaline',   // Гидрофосфат натрия
        'Na2SiO3': 'alkaline',   // Силикат натрия
        'Rb2S': 'alkaline',      // Сульфид рубидия
        'Ba(NO3)2': 'neutral',   // Соль сильной кислоты и сильного основания
        'Li2CO3': 'alkaline',    // Карбонат лития
        'NaCl': 'neutral',       // Соль сильной кислоты и сильного основания
        'K2SO4': 'neutral',      // Соль сильной кислоты и сильного основания
        'Na2CO3': 'alkaline',    // Карбонат натрия
        'CH3COONa': 'alkaline',  // Ацетат натрия
        'NH4Cl': 'acidic',       // Хлорид аммония
        'CuSO4': 'acidic',       // Сульфат меди
        'ZnCl2': 'acidic',       // Хлорид цинка
        'FeSO4': 'acidic',       // Сульфат железа(II)
        'Na3PO4': 'alkaline',    // Фосфат натрия
        'K2CO3': 'alkaline',     // Карбонат калия
        'NaNO3': 'neutral',      // Нитрат натрия
        'KNO3': 'neutral'        // Нитрат калия
    },

    // Flame colors for metal ions
    flameColors: {
        'Na': 'yellow',
        'Na+': 'yellow',
        'K': 'violet',
        'K+': 'violet',
        'Li': 'red',
        'Li+': 'red',
        'Sr': 'red',
        'Sr2+': 'red',
        'Ba': 'green',
        'Ba2+': 'green',
        'Ca': 'orange',
        'Ca2+': 'orange',
        'Cu': 'green',
        'Cu2+': 'green',
        'Zn': 'colorless',
        'Zn2+': 'colorless'
    },

    // Substance colors
    substanceColors: {
        // Oxides
        'CuO': 'black',
        'FeO': 'black',
        'Fe2O3': 'brown',
        'Fe3O4': 'black',
        'Cr2O3': 'green',
        'CrO3': 'orange',
        'MnO2': 'black',
        'PbO2': 'brown',
        'ZnO': 'white',
        'MgO': 'white',
        'CaO': 'white',
        'Al2O3': 'white',
        'SiO2': 'white',

        // Hydroxides
        'Fe(OH)2': 'white',  // Свежеосаждённый
        'Fe(OH)3': 'brown',
        'Cu(OH)2': 'blue',
        'Cr(OH)3': 'green',
        'Zn(OH)2': 'white',
        'Al(OH)3': 'white',
        'Mg(OH)2': 'white',
        'Ca(OH)2': 'white',

        // Salts and other compounds
        'CuSO4': 'white',           // Безводный
        'CuSO4·5H2O': 'blue',       // Медный купорос
        'CuSO4(безводный, сухой)': 'white',
        'FeSO4': 'green',
        'FeCl3': 'brown',
        'FeCl2': 'green',
        'CuCl2': 'green',
        'NiCl2': 'green',
        'CoCl2': 'blue',
        'MnSO4': 'pink',

        // Chromates and dichromates
        'K2CrO4': 'yellow',
        'K2Cr2O7': 'orange',
        'Na2CrO4': 'yellow',
        'Na2Cr2O7': 'orange',

        // Carbonates
        'CaCO3': 'white',
        'BaCO3': 'white',
        'Na2CO3': 'white',
        'Li2CO3': 'white',

        // Halides
        'AgCl': 'white',
        'AgBr': 'yellow',
        'AgI': 'yellow',
        'PbI2': 'yellow',
        'PbCl2': 'white',
        'CuI': 'white',

        // Sulfides
        'FeS': 'black',
        'CuS': 'black',
        'PbS': 'black',
        'ZnS': 'white',
        'CdS': 'yellow',
        'HgS': 'red',
        'Sb2S3': 'orange',
        'As2S3': 'yellow',
        'BaS': 'white',
        'S': 'yellow',

        // Simple substances
        'Cu': 'red',
        'Fe': 'gray',
        'Br2': 'brown',
        'I2': 'violet',
        'Cl2': 'yellow',
        'P': 'white',      // Белый фосфор

        // Others
        'KMnO4': 'violet'
    }
};

// Coloring pages configuration
const COLORING_PAGES = [
    {
        id: 'bells',
        title: 'Колокольчики',
        instruction: 'Раскрась участки рисунка в зависимости от среды солей',
        palette: 'saltEnvironment',
        icon: '🔔',
        imagePath: 'images/bells.png',
        useImage: true,
        zones: [
            { id: 'KClO4', formula: 'KClO₄', correctColor: 'neutral' },
            { id: 'MgSO4', formula: 'MgSO₄', correctColor: 'acidic' },
            { id: 'FeCl3', formula: 'FeCl₃', correctColor: 'acidic' },
            { id: 'Na2Cr2O7', formula: 'Na₂Cr₂O₇', correctColor: 'neutral' },
            { id: 'CuBr2', formula: 'CuBr₂', correctColor: 'acidic' },
            { id: 'ZnNO32', formula: 'Zn(NO₃)₂', correctColor: 'acidic' },
            { id: 'Al2SO43', formula: 'Al₂(SO₄)₃', correctColor: 'acidic' },
            { id: 'FeCl2', formula: 'FeCl₂', correctColor: 'acidic' },
            { id: 'NH4I', formula: 'NH₄I', correctColor: 'acidic' },
            { id: 'K3PO4', formula: 'K₃PO₄', correctColor: 'alkaline' },
            { id: 'Na2HPO4', formula: 'Na₂HPO₄', correctColor: 'alkaline' },
            { id: 'Na2SiO3', formula: 'Na₂SiO₃', correctColor: 'alkaline' },
            { id: 'Rb2S', formula: 'Rb₂S', correctColor: 'alkaline' },
            { id: 'BaNO32', formula: 'Ba(NO₃)₂', correctColor: 'neutral' },
            { id: 'Li2CO3', formula: 'Li₂CO₃', correctColor: 'alkaline' }
        ]
    },
    {
        id: 'tree',
        title: 'Новогодняя ёлка',
        instruction: 'Раскрась по цвету пламени указанных ионов',
        palette: 'flameColors',
        icon: '🎄',
        imagePath: 'images/tree.png',
        useImage: true,
        zones: [
            { id: 'Na1', formula: 'Na⁺', correctColor: 'yellow' },
            { id: 'Ba1', formula: 'Ba²⁺', correctColor: 'green' },
            { id: 'K1', formula: 'K⁺', correctColor: 'violet' },
            { id: 'K2', formula: 'K⁺', correctColor: 'violet' },
            { id: 'Sr1', formula: 'Sr²⁺', correctColor: 'red' },
            { id: 'Sr2', formula: 'Sr²⁺', correctColor: 'red' },
            { id: 'Sr3', formula: 'Sr²⁺', correctColor: 'red' },
            { id: 'Ca1', formula: 'Ca²⁺', correctColor: 'orange' },
            { id: 'Na2', formula: 'Na⁺', correctColor: 'yellow' },
            { id: 'Na3', formula: 'Na⁺', correctColor: 'yellow' },
            { id: 'Ba2', formula: 'Ba²⁺', correctColor: 'green' },
            { id: 'Zn1', formula: 'Zn²⁺', correctColor: 'colorless' },
            { id: 'Zn2', formula: 'Zn²⁺', correctColor: 'colorless' },
            { id: 'Zn3', formula: 'Zn²⁺', correctColor: 'colorless' },
            { id: 'Zn4', formula: 'Zn²⁺', correctColor: 'colorless' },
            { id: 'Li1', formula: 'Li⁺', correctColor: 'red' },
            { id: 'Li2', formula: 'Li⁺', correctColor: 'red' },
            { id: 'K3', formula: 'K⁺', correctColor: 'violet' },
            { id: 'Ba3', formula: 'Ba²⁺', correctColor: 'green' }
        ]
    },
    {
        id: 'sock',
        title: 'Рождественский носок',
        instruction: 'Раскрась по цветам указанных веществ',
        palette: 'substanceColors',
        icon: '🧦',
        imagePath: 'images/sock.png',
        useImage: true,
        zones: [
            { id: 'AgCl', formula: 'AgCl', correctColor: 'white' },
            { id: 'BaCO3', formula: 'BaCO₃', correctColor: 'white' },
            { id: 'CrOH3', formula: 'Cr(OH)₃', correctColor: 'green' },
            { id: 'Br2', formula: 'Br₂', correctColor: 'brown' },
            { id: 'CrO3', formula: 'CrO₃', correctColor: 'orange' },
            { id: 'PbI2', formula: 'PbI₂', correctColor: 'yellow' },
            { id: 'KMnO4', formula: 'KMnO₄', correctColor: 'violet' }
        ]
    },
    {
        id: 'wreath',
        title: 'Рождественский венок',
        instruction: 'Раскрась по цветам указанных веществ',
        palette: 'substanceColors',
        icon: '🎀',
        imagePath: 'images/wreath.png',
        useImage: true,
        zones: [
            { id: 'CrO3_1', formula: 'CrO₃', correctColor: 'orange' },
            { id: 'Cu1', formula: 'Cu', correctColor: 'red' },
            { id: 'Cu2', formula: 'Cu', correctColor: 'red' },
            { id: 'Cu3', formula: 'Cu', correctColor: 'red' },
            { id: 'Cu4', formula: 'Cu', correctColor: 'red' },
            { id: 'CrO3_2', formula: 'CrO₃', correctColor: 'orange' },
            { id: 'Cr2O3_1', formula: 'Cr₂O₃', correctColor: 'green' },
            { id: 'Cr2O3_2', formula: 'Cr₂O₃', correctColor: 'green' },
            { id: 'Cr2O3_3', formula: 'Cr₂O₃', correctColor: 'green' },
            { id: 'S1', formula: 'S', correctColor: 'yellow' },
            { id: 'S2', formula: 'S', correctColor: 'yellow' },
            { id: 'BaS1', formula: 'BaS', correctColor: 'white' },
            { id: 'BaS2', formula: 'BaS', correctColor: 'white' },
            { id: 'AgI1', formula: 'AgI', correctColor: 'yellow' },
            { id: 'AgCl1', formula: 'AgCl', correctColor: 'white' },
            { id: 'AgCl2', formula: 'AgCl', correctColor: 'white' },
            { id: 'PbI2', formula: 'PbI₂', correctColor: 'yellow' },
            { id: 'CrO3_3', formula: 'CrO₃', correctColor: 'orange' }
        ]
    },
    {
        id: 'candle',
        title: 'Праздничная свеча',
        instruction: 'Раскрась по цветам указанных веществ',
        palette: 'substanceColors',
        icon: '🕯️',
        imagePath: 'images/candle.png',
        useImage: true,
        zones: [
            { id: 'K2Cr2O7', formula: 'K₂Cr₂O₇', correctColor: 'orange' },
            { id: 'ZnOH2', formula: 'Zn(OH)₂', correctColor: 'white' },
            { id: 'SiO2', formula: 'SiO₂', correctColor: 'white' },
            { id: 'AgBr', formula: 'AgBr', correctColor: 'yellow' },
            { id: 'Ba3PO42', formula: 'Ba₃(PO₄)₂', correctColor: 'white' },
            { id: 'Ag3PO4', formula: 'Ag₃PO₄', correctColor: 'yellow' },
            { id: 'CuSO4_dry', formula: 'CuSO₄', correctColor: 'white' },
            { id: 'Cl2', formula: 'Cl₂', correctColor: 'yellow' },
            { id: 'CaCO3', formula: 'CaCO₃', correctColor: 'white' },
            { id: 'FeOH2', formula: 'Fe(OH)₂', correctColor: 'white' },
            { id: 'CrO3_1', formula: 'CrO₃', correctColor: 'orange' },
            { id: 'CrO3_2', formula: 'CrO₃', correctColor: 'orange' },
            { id: 'CrO3_3', formula: 'CrO₃', correctColor: 'orange' },
            { id: 'FeOH2_2', formula: 'Fe(OH)₂', correctColor: 'white' }
        ]
    }
];

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { COLOR_PALETTES, CHEMISTRY_DATA, COLORING_PAGES };
}
