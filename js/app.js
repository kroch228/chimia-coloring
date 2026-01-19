/**
 * Chemistry Coloring App - Main Application Logic
 * Interactive chemistry learning through coloring
 * Supports both generated SVG and image-based coloring with polygon zones
 */

class ChemistryColoringApp {
    constructor() {
        // State
        this.currentPageIndex = 0;
        this.selectedColor = null;
        this.coloredZones = new Map();
        this.pages = [];
        this.useCustomPages = false;

        // Drag and drop state
        this.isDragging = false;
        this.dragColor = null;
        this.dragIndicator = null;
        this.dragSourceElement = null;

        // DOM Elements
        this.elements = {
            pageTitle: document.getElementById('page-title'),
            pageInstruction: document.getElementById('page-instruction'),
            colorsContainer: document.getElementById('colors-container'),
            coloringContainer: document.getElementById('coloring-container'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            checkBtn: document.getElementById('check-btn'),
            resetBtn: document.getElementById('reset-btn'),
            feedbackOverlay: document.getElementById('feedback-overlay'),
            feedbackMessage: document.getElementById('feedback-message'),
            soundCorrect: document.getElementById('sound-correct'),
            soundWrong: document.getElementById('sound-wrong')
        };

        // Initialize
        this.init();
    }

    async init() {
        this.bindEvents();

        // Initialize pages with built-in data
        this.pages = JSON.parse(JSON.stringify(COLORING_PAGES));

        // Try to load custom pages from JSON files and merge them
        await this.loadCustomPages();

        this.loadPage(0);
    }

    async loadCustomPages() {
        // Method 1: Check for global CUSTOM_PAGES (script-loaded data)
        // This works on file:// protocol without fetch
        if (window.CUSTOM_PAGES) {
            Object.values(window.CUSTOM_PAGES).forEach(data => {
                this.mergePageData(data);
            });
        }

        // Method 2: Try fetch (works on server only)
        const pageFiles = [
            'data/bells.json',
            'data/tree.json',
            'data/sock.json',
            'data/wreath.json',
            'data/candle.json'
        ];

        for (const file of pageFiles) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    const data = await response.json();
                    this.mergePageData(data);
                }
            } catch (e) {
                // Ignore fetch errors
            }
        }
    }

    mergePageData(data) {
        // Find existing page to update
        const existingIndex = this.pages.findIndex(p => p.id === data.id);

        // Auto-infer image path if not provided
        const imagePath = data.image || `images/${data.id}.png`;

        if (existingIndex !== -1) {
            // Merge data: update zones with points, enable image usage
            this.pages[existingIndex] = {
                ...this.pages[existingIndex],
                ...data,
                image: imagePath,
                useImage: true // Force image usage
            };
            console.log(`Merged data for ${data.id}`);
        } else {
            // Add new page
            this.pages.push({
                ...data,
                image: imagePath,
                useImage: true
            });
            console.log(`Added new page ${data.id}`);
        }
    }

    bindEvents() {
        // Navigation
        this.elements.prevBtn.addEventListener('click', () => this.navigatePage(-1));
        this.elements.nextBtn.addEventListener('click', () => this.navigatePage(1));

        // Actions
        this.elements.checkBtn.addEventListener('click', () => this.checkAll());
        this.elements.resetBtn.addEventListener('click', () => this.resetPage());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.navigatePage(-1);
            if (e.key === 'ArrowRight') this.navigatePage(1);
        });
    }

    // ========================================
    // Page Management
    // ========================================

    loadPage(index) {
        if (index < 0 || index >= this.pages.length) return;

        this.currentPageIndex = index;
        this.selectedColor = null;
        this.coloredZones.clear();

        const page = this.pages[index];

        // Update header
        this.elements.pageTitle.textContent = page.title;
        this.elements.pageInstruction.textContent = page.instruction;

        // Update navigation buttons
        this.elements.prevBtn.disabled = index === 0;
        this.elements.nextBtn.disabled = index === this.pages.length - 1;

        // Load palette
        this.loadPalette(page.palette);

        // Load content (image-based or SVG)
        // Check if we have valid points for image-based coloring
        const hasPoints = page.zones.some(z => z.points && z.points.length > 0);

        if (page.useImage && hasPoints) {
            this.loadImageBased(page);
        } else {
            // Fallback to SVG if no points defined yet (even if useImage is true)
            this.loadSVG(page);
        }

        // Update progress
        this.updateProgress();
    }

    navigatePage(direction) {
        const newIndex = this.currentPageIndex + direction;
        if (newIndex >= 0 && newIndex < this.pages.length) {
            this.loadPage(newIndex);
        }
    }

    // ========================================
    // Color Palette
    // ========================================

    loadPalette(paletteKey) {
        const palette = COLOR_PALETTES[paletteKey];
        if (!palette) return;

        this.elements.colorsContainer.innerHTML = '';

        // Check if page defines specific available colors
        const currentPage = this.pages[this.currentPageIndex];
        let allowedColors = currentPage && currentPage.availableColors;

        // STRICT MODE: User requested "exactly those colors that are used in the picture"
        // If we have zones, we calculate which colors are actually used.
        if (currentPage && currentPage.zones && currentPage.zones.length > 0) {
            const usedKeys = new Set(currentPage.zones.map(z => z.correctColor));
            // If we found used colors, we treat this as the definitive list
            // But we also respect availableColors if it's even stricter (subset)
            if (usedKeys.size > 0) {
                // If availableColors is defined, we intersect. If not, we just use usedKeys.
                if (allowedColors) {
                    allowedColors = allowedColors.filter(k => usedKeys.has(k));
                } else {
                    allowedColors = Array.from(usedKeys);
                }
            }
        }

        palette.colors.forEach((colorInfo, index) => {
            // Apply filter if defined
            if (allowedColors && !allowedColors.includes(colorInfo.key)) {
                return;
            }

            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            colorItem.dataset.colorKey = colorInfo.key;
            colorItem.dataset.colorValue = colorInfo.color;
            colorItem.style.animationDelay = `${index * 0.05}s`;

            colorItem.innerHTML = `
                <div class="color-swatch" style="background-color: ${colorInfo.color}"></div>
                <span class="color-label">${colorInfo.label}</span>
            `;

            colorItem.addEventListener('click', () => this.selectColor(colorInfo.key, colorInfo.color, colorItem));

            // Add drag events for touch/mouse
            this.bindDragEvents(colorItem, colorInfo);

            this.elements.colorsContainer.appendChild(colorItem);
        });
    }

    selectColor(key, color, element) {
        // Remove previous selection
        document.querySelectorAll('.color-item.selected').forEach(el => {
            el.classList.remove('selected');
        });

        // Set new selection
        this.selectedColor = { key, color };
        element.classList.add('selected');
    }

    // ========================================
    // Image-based Coloring (with polygon zones)
    // ========================================

    loadImageBased(page) {
        const container = this.elements.coloringContainer;

        // Create canvas for image-based coloring
        container.innerHTML = `
            <canvas id="coloring-canvas" style="max-width: 100%; max-height: 100%; cursor: pointer;"></canvas>
        `;

        const canvas = document.getElementById('coloring-canvas');
        const ctx = canvas.getContext('2d');

        // Store for later use
        this.canvas = canvas;
        this.ctx = ctx;
        this.currentPage = page;

        // Load image
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            this.backgroundImage = img;
            this.redrawCanvas();
        };

        // Try different image paths
        const imagePaths = [
            page.imagePath,
            `images/${page.id}.png`,
            `${page.id}.png`,
            // Map to existing files
            page.id === 'bells' ? 'image.png' : null,
            page.id === 'tree' ? 'image copy.png' : null,
            page.id === 'sock' ? 'image copy 2.png' : null,
            page.id === 'wreath' ? 'image copy 3.png' : null,
            page.id === 'candle' ? 'image copy 4.png' : null
        ].filter(Boolean);

        this.tryLoadImage(img, imagePaths, 0);

        // Bind click event
        canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    tryLoadImage(img, paths, index) {
        if (index >= paths.length) {
            console.warn('Could not load image from any path');
            // Fall back to SVG
            this.loadSVG(this.currentPage);
            return;
        }

        img.onerror = () => {
            this.tryLoadImage(img, paths, index + 1);
        };
        img.src = paths[index];
    }

    redrawCanvas() {
        if (!this.ctx || !this.backgroundImage) return;

        const page = this.currentPage;
        const ctx = this.ctx;

        // Draw background image
        ctx.drawImage(this.backgroundImage, 0, 0);

        // Draw colored zones
        page.zones.forEach(zone => {
            if (this.coloredZones.has(zone.id)) {
                const colorKey = this.coloredZones.get(zone.id);
                const palette = COLOR_PALETTES[page.palette];
                const colorInfo = palette.colors.find(c => c.key === colorKey);

                if (colorInfo && zone.points) {
                    this.fillPolygon(zone.points, colorInfo.color + 'CC'); // Semi-transparent
                }
            }
        });
    }

    fillPolygon(points, color) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    handleCanvasClick(e) {
        if (!this.selectedColor) {
            this.showFeedback('Сначала выберите цвет!', 'error', 1000);
            return;
        }

        const canvas = e.target;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const page = this.currentPage;

        // Find which zone was clicked
        for (const zone of page.zones) {
            if (zone.points && this.isPointInPolygon(x, y, zone.points)) {
                this.handleZoneColorAttempt(zone);
                return;
            }
        }
    }

    isPointInPolygon(x, y, points) {
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const xi = points[i][0], yi = points[i][1];
            const xj = points[j][0], yj = points[j][1];

            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    handleZoneColorAttempt(zone) {
        const isCorrect = zone.correctColor === this.selectedColor.key;

        if (isCorrect) {
            this.coloredZones.set(zone.id, this.selectedColor.key);
            this.playSound('correct');
            this.redrawCanvas();
            this.updateProgress();

            // Check if all zones are colored
            const page = this.currentPage;
            if (this.coloredZones.size === page.zones.length) {
                setTimeout(() => {
                    this.showFeedback('🎉 Молодец! Всё верно!', 'success', 2000);
                }, 300);
            }
        } else {
            this.playSound('wrong');
            // Flash the zone red briefly
            this.flashZone(zone.points, '#ff0000');
        }
    }

    flashZone(points, color) {
        const ctx = this.ctx;

        // Flash
        this.fillPolygon(points, color + '80');

        // Restore after delay
        setTimeout(() => {
            this.redrawCanvas();
        }, 200);
    }

    // ========================================
    // SVG Coloring (fallback for built-in pages)
    // ========================================

    loadSVG(page) {
        // Generate SVG based on page type
        const svgContent = this.generateSVG(page);
        this.elements.coloringContainer.innerHTML = svgContent;

        // Bind click events to zones
        this.bindZoneEvents();
    }

    generateSVG(page) {
        const zones = page.zones;

        let svg = `
            <svg viewBox="0 0 600 700" xmlns="http://www.w3.org/2000/svg" class="coloring-svg">
                <defs>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
                    </filter>
                </defs>
                <style>
                    .zone { fill: #f5f5f5; stroke: #333; stroke-width: 2; cursor: pointer; transition: all 0.2s ease; }
                    .zone:hover { stroke-width: 3; filter: brightness(1.05); }
                    .zone-label { font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: bold; fill: #333; pointer-events: none; text-anchor: middle; }
                </style>
        `;

        // Generate layout based on page ID
        switch (page.id) {
            case 'bells':
                svg += this.generateBellsSVG(zones);
                break;
            case 'tree':
                svg += this.generateTreeSVG(zones);
                break;
            case 'sock':
                svg += this.generateSockSVG(zones);
                break;
            case 'wreath':
                svg += this.generateWreathSVG(zones);
                break;
            case 'candle':
                svg += this.generateCandleSVG(zones);
                break;
            default:
                svg += this.generateGenericSVG(zones);
        }

        svg += '</svg>';
        return svg;
    }

    generateBellsSVG(zones) {
        let content = '';

        content += `
            <path class="zone" data-zone-id="KClO4" d="M120 180 Q80 180 70 280 Q65 350 80 400 L170 400 Q185 350 180 280 Q170 180 130 180 Z" />
            <text class="zone-label" x="125" y="300">KClO₄</text>
            
            <path class="zone" data-zone-id="MgSO4" d="M200 140 Q160 140 150 240 Q145 310 160 360 L250 360 Q265 310 260 240 Q250 140 210 140 Z" />
            <text class="zone-label" x="205" y="260">MgSO₄</text>
            
            <path class="zone" data-zone-id="FeCl3" d="M290 120 Q250 120 240 220 Q235 290 250 340 L340 340 Q355 290 350 220 Q340 120 300 120 Z" />
            <text class="zone-label" x="295" y="240">FeCl₃</text>
            
            <path class="zone" data-zone-id="Na2Cr2O7" d="M380 140 Q340 140 330 240 Q325 310 340 360 L430 360 Q445 310 440 240 Q430 140 390 140 Z" />
            <text class="zone-label" x="385" y="260">Na₂Cr₂O₇</text>
            
            <ellipse class="zone" data-zone-id="CuBr2" cx="300" cy="400" rx="50" ry="30" />
            <text class="zone-label" x="300" y="405">CuBr₂</text>
            
            <path class="zone" data-zone-id="ZnNO32" d="M180 380 Q140 350 100 380 Q140 420 180 400 Z" />
            <text class="zone-label" x="140" y="390">Zn(NO₃)₂</text>
            
            <path class="zone" data-zone-id="Al2SO43" d="M420 380 Q460 350 500 380 Q460 420 420 400 Z" />
            <text class="zone-label" x="460" y="390">Al₂(SO₄)₃</text>
            
            <path class="zone" data-zone-id="FeCl2" d="M100 420 Q60 480 80 550 L140 530 Q120 460 160 420 Z" />
            <text class="zone-label" x="110" y="485">FeCl₂</text>
            
            <path class="zone" data-zone-id="NH4I" d="M500 420 Q540 480 520 550 L460 530 Q480 460 440 420 Z" />
            <text class="zone-label" x="490" y="485">NH₄I</text>
            
            <rect class="zone" data-zone-id="K3PO4" x="80" y="560" width="100" height="60" rx="10" />
            <text class="zone-label" x="130" y="595">K₃PO₄</text>
            
            <rect class="zone" data-zone-id="Na2HPO4" x="200" y="580" width="90" height="50" rx="10" />
            <text class="zone-label" x="245" y="610">Na₂HPO₄</text>
            
            <rect class="zone" data-zone-id="Na2SiO3" x="80" y="630" width="80" height="50" rx="10" />
            <text class="zone-label" x="120" y="660">Na₂SiO₃</text>
            
            <rect class="zone" data-zone-id="Rb2S" x="180" y="640" width="70" height="45" rx="10" />
            <text class="zone-label" x="215" y="667">Rb₂S</text>
            
            <rect class="zone" data-zone-id="BaNO32" x="310" y="580" width="100" height="50" rx="10" />
            <text class="zone-label" x="360" y="610">Ba(NO₃)₂</text>
            
            <rect class="zone" data-zone-id="Li2CO3" x="420" y="560" width="100" height="60" rx="10" />
            <text class="zone-label" x="470" y="595">Li₂CO₃</text>
        `;

        return content;
    }

    generateTreeSVG(zones) {
        let content = '';

        content += `
            <polygon class="zone" data-zone-id="Na1" points="300,30 310,70 350,70 320,95 330,135 300,110 270,135 280,95 250,70 290,70" />
            <text class="zone-label" x="300" y="90">Na⁺</text>
            
            <polygon class="zone" data-zone-id="Ba1" points="300,140 220,220 380,220" />
            <text class="zone-label" x="300" y="195">Ba²⁺</text>
            
            <circle class="zone" data-zone-id="K1" cx="350" cy="190" r="25" />
            <text class="zone-label" x="350" y="195">K⁺</text>
            
            <circle class="zone" data-zone-id="K2" cx="380" cy="210" r="20" />
            <text class="zone-label" x="380" y="215">K⁺</text>
            
            <polygon class="zone" data-zone-id="Sr1" points="300,200 180,300 420,300" />
            <text class="zone-label" x="210" y="280">Sr²⁺</text>
            
            <circle class="zone" data-zone-id="Sr2" cx="400" cy="270" r="25" />
            <text class="zone-label" x="400" y="275">Sr²⁺</text>
            
            <ellipse class="zone" data-zone-id="Ca1" cx="180" cy="250" rx="25" ry="15" />
            <text class="zone-label" x="180" y="255">Ca²⁺</text>
            
            <ellipse class="zone" data-zone-id="Na2" cx="220" cy="270" rx="25" ry="15" />
            <text class="zone-label" x="220" y="275">Na⁺</text>
            
            <ellipse class="zone" data-zone-id="Na3" cx="160" cy="290" rx="25" ry="15" />
            <text class="zone-label" x="160" y="295">Na⁺</text>
            
            <ellipse class="zone" data-zone-id="Sr3" cx="200" cy="310" rx="25" ry="15" />
            <text class="zone-label" x="200" y="315">Sr²⁺</text>
            
            <polygon class="zone" data-zone-id="Ba2" points="300,280 150,400 450,400" />
            <text class="zone-label" x="240" y="370">Ba²⁺</text>
            
            <circle class="zone" data-zone-id="Zn1" cx="280" cy="350" r="20" />
            <text class="zone-label" x="280" y="355">Zn²⁺</text>
            
            <circle class="zone" data-zone-id="Zn2" cx="320" cy="370" r="20" />
            <text class="zone-label" x="320" y="375">Zn²⁺</text>
            
            <circle class="zone" data-zone-id="Zn3" cx="280" cy="400" r="20" />
            <text class="zone-label" x="280" y="405">Zn²⁺</text>
            
            <polygon class="zone" data-zone-id="Ba3" points="300,380 120,500 480,500" />
            <text class="zone-label" x="200" y="470">Ba²⁺</text>
            
            <ellipse class="zone" data-zone-id="Zn4" cx="430" cy="460" rx="25" ry="15" />
            <text class="zone-label" x="430" y="465">Zn²⁺</text>
            
            <ellipse class="zone" data-zone-id="Li1" cx="460" cy="485" rx="20" ry="12" />
            <text class="zone-label" x="460" y="490">Li⁺</text>
            
            <ellipse class="zone" data-zone-id="K3" cx="480" cy="510" r="20" />
            <text class="zone-label" x="480" y="515">K⁺</text>
            
            <ellipse class="zone" data-zone-id="Li2" cx="500" cy="540" rx="20" ry="12" />
            <text class="zone-label" x="500" y="545">Li⁺</text>
        `;

        return content;
    }

    generateSockSVG(zones) {
        let content = '';

        content += `
            <path class="zone" data-zone-id="AgCl" d="M200 80 Q200 60 300 60 Q400 60 400 80 L400 140 Q300 150 200 140 Z" />
            <text class="zone-label" x="300" y="100">AgCl</text>
            
            <path class="zone" data-zone-id="BaCO3" d="M200 140 L200 250 Q200 260 220 260 L380 260 Q400 260 400 250 L400 140 Q300 150 200 140 Z" />
            <text class="zone-label" x="300" y="200">BaCO₃</text>
            
            <polygon class="zone" data-zone-id="CrOH3" points="300,180 260,280 340,280" />
            <text class="zone-label" x="300" y="245">Cr(OH)₃</text>
            
            <circle class="zone" data-zone-id="Br2" cx="300" cy="300" r="20" />
            <text class="zone-label" x="300" y="305">Br₂</text>
            
            <path class="zone" data-zone-id="CrO3" d="M200 260 L180 400 Q170 450 200 480 L350 480 Q400 450 420 350 L400 260 Z" />
            <text class="zone-label" x="320" y="380">CrO₃</text>
            
            <path class="zone" data-zone-id="PbI2" d="M180 400 Q120 420 100 500 Q90 560 150 580 L200 560 Q160 500 180 450 Z" />
            <text class="zone-label" x="140" y="510">PbI₂</text>
            
            <path class="zone" data-zone-id="KMnO4" d="M350 480 Q400 520 450 550 Q500 580 480 620 Q450 660 380 640 L280 600 Q300 540 350 480 Z" />
            <text class="zone-label" x="410" y="580">KMnO₄</text>
        `;

        return content;
    }

    generateWreathSVG(zones) {
        let content = '';

        content += `
            <path class="zone" data-zone-id="CrO3_1" d="M240 150 Q200 100 160 130 Q200 170 240 160 Z" />
            <text class="zone-label" x="200" y="140">CrO₃</text>
            
            <ellipse class="zone" data-zone-id="Cu1" cx="260" cy="170" rx="35" ry="25" />
            <text class="zone-label" x="260" y="175">Cu</text>
            
            <ellipse class="zone" data-zone-id="Cu2" cx="340" cy="170" rx="35" ry="25" />
            <text class="zone-label" x="340" y="175">Cu</text>
            
            <path class="zone" data-zone-id="CrO3_2" d="M360 150 Q400 100 440 130 Q400 170 360 160 Z" />
            <text class="zone-label" x="400" y="140">CrO₃</text>
            
            <path class="zone" data-zone-id="Cr2O3_1" d="M100 280 Q80 320 90 380 Q110 400 140 380 Q120 320 130 280 Z" />
            <text class="zone-label" x="110" y="340">Cr₂O₃</text>
            
            <circle class="zone" data-zone-id="S1" cx="100" cy="420" r="20" />
            <text class="zone-label" x="100" y="425">S</text>
            
            <circle class="zone" data-zone-id="Cu3" cx="120" cy="460" r="20" />
            <text class="zone-label" x="120" y="465">Cu</text>
            
            <circle class="zone" data-zone-id="BaS1" cx="150" cy="500" r="20" />
            <text class="zone-label" x="150" y="505">BaS</text>
            
            <circle class="zone" data-zone-id="AgI1" cx="180" cy="540" r="20" />
            <text class="zone-label" x="180" y="545">AgI</text>
            
            <path class="zone" data-zone-id="Cr2O3_2" d="M220 560 Q260 600 320 600 Q350 590 340 560 Q300 570 260 560 Z" />
            <text class="zone-label" x="280" y="585">Cr₂O₃</text>
            
            <circle class="zone" data-zone-id="Cu4" cx="320" cy="560" r="20" />
            <text class="zone-label" x="320" y="565">Cu</text>
            
            <circle class="zone" data-zone-id="AgCl1" cx="360" cy="540" r="20" />
            <text class="zone-label" x="360" y="545">AgCl</text>
            
            <circle class="zone" data-zone-id="PbI2" cx="400" cy="510" r="20" />
            <text class="zone-label" x="400" y="515">PbI₂</text>
            
            <circle class="zone" data-zone-id="CrO3_3" cx="430" cy="470" r="20" />
            <text class="zone-label" x="430" y="475">CrO₃</text>
            
            <path class="zone" data-zone-id="Cr2O3_3" d="M500 280 Q520 320 510 380 Q490 400 460 380 Q480 320 470 280 Z" />
            <text class="zone-label" x="490" y="340">Cr₂O₃</text>
            
            <circle class="zone" data-zone-id="S2" cx="500" cy="420" r="20" />
            <text class="zone-label" x="500" y="425">S</text>
            
            <circle class="zone" data-zone-id="BaS2" cx="480" cy="460" r="20" />
            <text class="zone-label" x="480" y="465">BaS</text>
            
            <circle class="zone" data-zone-id="AgCl2" cx="460" cy="380" r="20" />
            <text class="zone-label" x="460" y="385">AgCl</text>
        `;

        return content;
    }

    generateCandleSVG(zones) {
        let content = '';

        content += `
            <path class="zone" data-zone-id="K2Cr2O7" d="M300 50 Q330 100 320 150 Q300 180 280 150 Q270 100 300 50 Z" />
            <text class="zone-label" x="300" y="120">K₂Cr₂O₇</text>
            
            <rect class="zone" data-zone-id="ZnOH2" x="240" y="170" width="120" height="50" rx="5" />
            <text class="zone-label" x="300" y="200">Zn(OH)₂</text>
            
            <rect class="zone" data-zone-id="SiO2" x="235" y="220" width="130" height="45" rx="5" />
            <text class="zone-label" x="300" y="247">SiO₂</text>
            
            <rect class="zone" data-zone-id="AgBr" x="230" y="265" width="140" height="45" rx="5" />
            <text class="zone-label" x="300" y="292">AgBr</text>
            
            <rect class="zone" data-zone-id="Ba3PO42" x="225" y="310" width="150" height="45" rx="5" />
            <text class="zone-label" x="300" y="337">Ba₃(PO₄)₂</text>
            
            <rect class="zone" data-zone-id="Ag3PO4" x="220" y="355" width="160" height="45" rx="5" />
            <text class="zone-label" x="300" y="382">Ag₃PO₄</text>
            
            <rect class="zone" data-zone-id="CuSO4_dry" x="215" y="400" width="170" height="45" rx="5" />
            <text class="zone-label" x="300" y="427">CuSO₄</text>
            
            <rect class="zone" data-zone-id="Cl2" x="210" y="445" width="180" height="40" rx="5" />
            <text class="zone-label" x="300" y="470">Cl₂</text>
            
            <rect class="zone" data-zone-id="CaCO3" x="205" y="485" width="190" height="40" rx="5" />
            <text class="zone-label" x="300" y="510">CaCO₃</text>
            
            <path class="zone" data-zone-id="FeOH2" d="M120 530 Q80 560 90 620 Q120 660 170 640 Q140 600 150 550 Z" />
            <text class="zone-label" x="130" y="590">Fe(OH)₂</text>
            
            <path class="zone" data-zone-id="CrO3_1" d="M180 560 Q200 620 250 650 Q280 640 260 600 Q240 570 210 550 Z" />
            <text class="zone-label" x="220" y="610">CrO₃</text>
            
            <path class="zone" data-zone-id="CrO3_2" d="M280 580 Q300 640 350 660 Q380 650 360 610 Q340 580 310 560 Z" />
            <text class="zone-label" x="320" y="620">CrO₃</text>
            
            <path class="zone" data-zone-id="CrO3_3" d="M350 560 Q380 600 420 630 Q450 620 430 580 Q400 550 370 540 Z" />
            <text class="zone-label" x="390" y="590">CrO₃</text>
            
            <path class="zone" data-zone-id="FeOH2_2" d="M420 530 Q480 560 490 620 Q460 660 410 640 Q440 600 430 550 Z" />
            <text class="zone-label" x="450" y="590">Fe(OH)₂</text>
        `;

        return content;
    }

    generateGenericSVG(zones) {
        let content = '';
        const cols = Math.ceil(Math.sqrt(zones.length));
        const cellWidth = 500 / cols;
        const cellHeight = 80;

        zones.forEach((zone, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const x = 50 + col * cellWidth;
            const y = 100 + row * cellHeight;

            content += `
                <rect class="zone" data-zone-id="${zone.id}" x="${x}" y="${y}" width="${cellWidth - 20}" height="${cellHeight - 20}" rx="10" />
                <text class="zone-label" x="${x + (cellWidth - 20) / 2}" y="${y + (cellHeight - 20) / 2 + 5}">${zone.formula}</text>
            `;
        });

        return content;
    }

    bindZoneEvents() {
        const zones = document.querySelectorAll('.zone');
        zones.forEach(zone => {
            zone.addEventListener('click', (e) => this.handleZoneClick(e.target));
        });
    }

    handleZoneClick(zoneElement) {
        if (!this.selectedColor) {
            this.showFeedback('Сначала выберите цвет!', 'error', 1000);
            return;
        }

        const zoneId = zoneElement.dataset.zoneId;
        const page = this.pages[this.currentPageIndex];
        const zoneData = page.zones.find(z => z.id === zoneId);

        if (!zoneData) return;

        const isCorrect = zoneData.correctColor === this.selectedColor.key;

        if (isCorrect) {
            zoneElement.style.fill = this.selectedColor.color;
            zoneElement.classList.add('colored');
            this.coloredZones.set(zoneId, this.selectedColor.key);
            this.playSound('correct');
            this.updateProgress();

            if (this.coloredZones.size === page.zones.length) {
                setTimeout(() => {
                    this.showFeedback('🎉 Молодец! Всё верно!', 'success', 2000);
                }, 300);
            }
        } else {
            zoneElement.classList.add('highlight-wrong');
            this.playSound('wrong');
            setTimeout(() => {
                zoneElement.classList.remove('highlight-wrong');
            }, 300);
        }
    }

    // ========================================
    // Progress & Feedback
    // ========================================

    updateProgress() {
        const page = this.pages[this.currentPageIndex];
        const total = page.zones.length;
        const colored = this.coloredZones.size;
        const percentage = total > 0 ? (colored / total) * 100 : 0;

        this.elements.progressFill.style.width = `${percentage}%`;
        this.elements.progressText.textContent = `${colored} / ${total}`;
    }

    showFeedback(message, type, duration = 2000) {
        this.elements.feedbackMessage.textContent = message;
        this.elements.feedbackMessage.className = `feedback-message ${type}`;
        this.elements.feedbackOverlay.classList.add('visible');

        setTimeout(() => {
            this.elements.feedbackOverlay.classList.remove('visible');
        }, duration);
    }

    playSound(type) {
        try {
            const sound = type === 'correct' ? this.elements.soundCorrect : this.elements.soundWrong;
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(() => { });
            }
        } catch (e) {
            // Ignore audio errors
        }
    }

    // ========================================
    // Actions
    // ========================================

    checkAll() {
        const page = this.pages[this.currentPageIndex];
        const palette = COLOR_PALETTES[page.palette];
        let allCorrect = true;
        let incorrectCount = 0;

        page.zones.forEach(zone => {
            const isColored = this.coloredZones.has(zone.id);
            const coloredCorrectly = this.coloredZones.get(zone.id) === zone.correctColor;

            if (!isColored || !coloredCorrectly) {
                allCorrect = false;
                incorrectCount++;

                // Highlight with correct color
                if (zone.points && this.ctx) {
                    // Image-based
                    const colorInfo = palette.colors.find(c => c.key === zone.correctColor);
                    if (colorInfo) {
                        this.ctx.strokeStyle = colorInfo.color;
                        this.ctx.lineWidth = 4;
                        this.ctx.beginPath();
                        this.ctx.moveTo(zone.points[0][0], zone.points[0][1]);
                        for (let i = 1; i < zone.points.length; i++) {
                            this.ctx.lineTo(zone.points[i][0], zone.points[i][1]);
                        }
                        this.ctx.closePath();
                        this.ctx.stroke();
                    }
                } else {
                    // SVG-based
                    const zoneElement = document.querySelector(`[data-zone-id="${zone.id}"]`);
                    if (zoneElement) {
                        const correctColorInfo = palette.colors.find(c => c.key === zone.correctColor);
                        if (correctColorInfo) {
                            zoneElement.style.stroke = correctColorInfo.color;
                            zoneElement.style.strokeWidth = '4';
                            zoneElement.classList.add('highlight-correct');
                        }
                    }
                }
            }
        });

        if (allCorrect) {
            this.showFeedback('🎉 Отлично! Всё правильно!', 'success', 2000);
        } else {
            this.showFeedback(`Есть ошибки: ${incorrectCount}. Посмотри подсказки!`, 'error', 2000);
        }

        // Remove highlights after delay
        setTimeout(() => {
            if (this.ctx) {
                this.redrawCanvas();
            } else {
                document.querySelectorAll('.zone').forEach(zone => {
                    zone.style.stroke = '#333';
                    zone.style.strokeWidth = '2';
                    zone.classList.remove('highlight-correct');
                });
            }
        }, 3000);
    }

    resetPage() {
        this.loadPage(this.currentPageIndex);
    }

    // ========================================
    // Drag and Drop for Touch Screens
    // ========================================

    bindDragEvents(element, colorInfo) {
        // Touch events
        element.addEventListener('touchstart', (e) => this.handleDragStart(e, colorInfo, element), { passive: false });
        element.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: false });
        element.addEventListener('touchend', (e) => this.handleDragEnd(e), { passive: false });
        element.addEventListener('touchcancel', (e) => this.handleDragEnd(e), { passive: false });

        // Mouse events (for desktop testing)
        element.addEventListener('mousedown', (e) => this.handleDragStart(e, colorInfo, element));
    }

    handleDragStart(e, colorInfo, element) {
        // For touch, use first touch point
        const point = e.touches ? e.touches[0] : e;

        this.isDragging = true;
        this.dragColor = colorInfo;
        this.dragSourceElement = element;

        // Mark element as being dragged
        element.classList.add('dragging');

        // Create drag indicator
        this.createDragIndicator(colorInfo.color, point.clientX, point.clientY);

        // Select the color as well
        this.selectColor(colorInfo.key, colorInfo.color, element);

        // For mouse, add global listeners
        if (!e.touches) {
            document.addEventListener('mousemove', this.handleMouseMove = (ev) => this.handleDragMove(ev));
            document.addEventListener('mouseup', this.handleMouseUp = (ev) => this.handleDragEnd(ev));
        }

        e.preventDefault();
    }

    handleDragMove(e) {
        if (!this.isDragging || !this.dragIndicator) return;

        const point = e.touches ? e.touches[0] : e;

        // Move drag indicator
        this.dragIndicator.style.left = point.clientX + 'px';
        this.dragIndicator.style.top = point.clientY + 'px';

        e.preventDefault();
    }

    handleDragEnd(e) {
        if (!this.isDragging) return;

        // Get end point
        const point = e.changedTouches ? e.changedTouches[0] : e;

        // Check if dropped on a zone (for canvas-based coloring)
        if (this.canvas && this.ctx) {
            const rect = this.canvas.getBoundingClientRect();
            const x = point.clientX;
            const y = point.clientY;

            // Check if point is within canvas bounds
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                // Calculate canvas coordinates
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                const canvasX = (x - rect.left) * scaleX;
                const canvasY = (y - rect.top) * scaleY;

                // Find zone at these coordinates
                const page = this.currentPage;
                for (const zone of page.zones) {
                    if (zone.points && this.isPointInPolygon(canvasX, canvasY, zone.points)) {
                        // Attempt to color this zone with the dragged color
                        this.handleZoneColorAttempt(zone);
                        break;
                    }
                }
            }
        } else {
            // SVG-based coloring: find zone under point
            const elementsAtPoint = document.elementsFromPoint(point.clientX, point.clientY);
            const zoneEl = elementsAtPoint.find(el => el.classList && el.classList.contains('zone'));
            if (zoneEl) {
                const zoneId = zoneEl.dataset.zoneId;
                const page = this.currentPage;
                const zone = page.zones.find(z => z.id === zoneId);
                if (zone) {
                    this.handleSVGZoneClick(zoneEl, zone);
                }
            }
        }

        // Cleanup
        this.removeDragIndicator();
        if (this.dragSourceElement) {
            this.dragSourceElement.classList.remove('dragging');
        }

        this.isDragging = false;
        this.dragColor = null;
        this.dragSourceElement = null;

        // Remove mouse listeners
        if (this.handleMouseMove) {
            document.removeEventListener('mousemove', this.handleMouseMove);
            this.handleMouseMove = null;
        }
        if (this.handleMouseUp) {
            document.removeEventListener('mouseup', this.handleMouseUp);
            this.handleMouseUp = null;
        }
    }

    createDragIndicator(color, x, y) {
        this.removeDragIndicator();

        const indicator = document.createElement('div');
        indicator.className = 'drag-indicator active';
        indicator.style.backgroundColor = color;
        indicator.style.left = x + 'px';
        indicator.style.top = y + 'px';

        document.body.appendChild(indicator);
        this.dragIndicator = indicator;
    }

    removeDragIndicator() {
        if (this.dragIndicator) {
            this.dragIndicator.remove();
            this.dragIndicator = null;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChemistryColoringApp();
});
