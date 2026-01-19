/**
 * Chemistry Data Module
 * Contains all chemistry knowledge for the coloring app
 */

export interface ColorInfo {
  key: string;
  color: string;
  label: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: ColorInfo[];
}

export interface Zone {
  id: string;
  formula: string;
  correctColor: string;
}

export interface ColoringPage {
  id: string;
  title: string;
  instruction: string;
  palette: string;
  icon: string;
  image?: string;
  zones: Zone[];
}

// Color palettes for different coloring page types
export const COLOR_PALETTES: Record<string, ColorPalette> = {
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
      { key: 'orange', color: '#E67E22', label: 'Ca²⁺ — Оранжевый' },
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
      { key: 'violet', color: '#9B59B6', label: 'Фиолетовый' },
      { key: 'pink', color: '#E91E63', label: 'Розовый' },
      // New colors from user images (Legacy Compat)
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

// Coloring pages configuration
export const COLORING_PAGES: ColoringPage[] = [
  {
    id: 'bells',
    title: 'Колокольчики',
    instruction: 'Раскрась участки рисунка в зависимости от среды солей',
    palette: 'saltEnvironment',
    icon: '🔔',
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
      { id: 'Li1', formula: 'Li⁺', correctColor: 'red' },
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
    zones: [
      { id: 'CrO3_1', formula: 'CrO₃', correctColor: 'orange' },
      { id: 'Cu1', formula: 'Cu', correctColor: 'red' },
      { id: 'Cu2', formula: 'Cu', correctColor: 'red' },
      { id: 'Cr2O3_1', formula: 'Cr₂O₃', correctColor: 'green' },
      { id: 'Cr2O3_2', formula: 'Cr₂O₃', correctColor: 'green' },
      { id: 'S1', formula: 'S', correctColor: 'yellow' },
      { id: 'S2', formula: 'S', correctColor: 'yellow' },
      { id: 'BaS1', formula: 'BaS', correctColor: 'white' },
      { id: 'AgI1', formula: 'AgI', correctColor: 'yellow' },
      { id: 'AgCl1', formula: 'AgCl', correctColor: 'white' },
      { id: 'PbI2', formula: 'PbI₂', correctColor: 'yellow' }
    ]
  },
  {
    id: 'candle',
    title: 'Праздничная свеча',
    instruction: 'Раскрась по цветам указанных веществ',
    palette: 'substanceColors',
    icon: '🕯️',
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
      { id: 'CrO3_2', formula: 'CrO₃', correctColor: 'orange' }
    ]
  }
];

// Get available colors for a page (only those used in zones)
export function getAvailableColors(page: ColoringPage): string[] {
  const usedColors = new Set(page.zones.map(z => z.correctColor));
  return Array.from(usedColors);
}



export function getAllPages(): ColoringPage[] {
  let pages = [...COLORING_PAGES];

  // Merge custom pages from window (loaded via script tags)
  if (window.CUSTOM_PAGES) {
    Object.values(window.CUSTOM_PAGES).forEach((customPage: any) => {
      const existingIndex = pages.findIndex(p => p.id === customPage.id);
      const mergedPage = existingIndex >= 0 ? { ...pages[existingIndex], ...customPage } : customPage;

      // Ensure image path is correct
      if (!mergedPage.image) {
        mergedPage.image = `images/${mergedPage.id}.png`;
      }
      // Ensure icon
      if (!mergedPage.icon) mergedPage.icon = '🎨';

      if (existingIndex >= 0) {
        pages[existingIndex] = mergedPage;
      } else {
        pages.push(mergedPage);
      }
    });
  }

  // Filter based on manifest if available
  if (window.DATA_MANIFEST && Array.isArray(window.DATA_MANIFEST)) {
    const allowedIds = new Set(
      window.DATA_MANIFEST.map(filename => filename.replace(/\.js$/, ''))
    );

    // Sort pages according to manifest order
    const orderedPages: ColoringPage[] = [];

    window.DATA_MANIFEST.forEach(filename => {
      const id = filename.replace(/\.js$/, '');
      // Find the page with this ID (checking for both raw ID and potentially ID inside zones if needed, but page ID is primary)
      // Note: Current logic assumes parsing filename gives the page ID.
      const page = pages.find(p => p.id === id);
      if (page) {
        // Avoid duplicates if manifest has dupes
        if (!orderedPages.find(p => p.id === id)) {
          orderedPages.push(page);
        }
      }
    });

    return orderedPages;
  }

  return pages;
}
