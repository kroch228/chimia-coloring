import { useState, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ColorPalette } from "@/components/ColorPalette";
import { ColoringArea } from "@/components/ColoringArea";
import { ProgressBar } from "@/components/ProgressBar";
import { FeedbackOverlay } from "@/components/FeedbackOverlay";
import { BubblesBackground } from "@/components/BubblesBackground";
import {
  COLOR_PALETTES,
  getAvailableColors,
  getAllPages
} from "@/data/chemistryData";

// Breaking Bad themed titles
const BB_TITLES: Record<string, string> = {
  'bells': 'Метиламин',
  'tree': 'Кристаллы',
  'sock': 'Лаборатория',
  'wreath': 'Синтез',
  'candle': 'Голубой мет'
};

const Index = () => {
  // Use all pages (including custom ones)
  const [pages] = useState(getAllPages());
  const coloringAreaRef = useRef<{ handleExternalDrop: (x: number, y: number, c: string) => void }>(null);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [coloredZones, setColoredZones] = useState<Map<string, string>>(new Map());
  const [verificationResult, setVerificationResult] = useState<Map<string, boolean> | null>(null);
  const [feedback, setFeedback] = useState<{ visible: boolean; success: boolean; message: string }>({
    visible: false,
    success: false,
    message: ""
  });

  const currentPage = pages[currentPageIndex] || pages[0];
  const palette = COLOR_PALETTES[currentPage.palette] || COLOR_PALETTES.saltEnvironment;
  const availableColors = useMemo(() => getAvailableColors(currentPage), [currentPage]);

  // Get Breaking Bad themed title
  const bbTitle = BB_TITLES[currentPage.id] || currentPage.title;

  const handlePrev = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      resetState();
    }
  }, [currentPageIndex]);

  const handleNext = useCallback(() => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
      resetState();
    }
  }, [currentPageIndex, pages.length]);

  const resetState = useCallback(() => {
    setSelectedColor(null);
    setColoredZones(new Map());
    setVerificationResult(null);
    setFeedback({ visible: false, success: false, message: "" });
  }, []);

  const handleSelectColor = useCallback((colorKey: string) => {
    setSelectedColor(colorKey);
  }, []);

  const handleZoneClick = useCallback((zoneId: string, colorOverride?: string) => {
    const colorToApply = colorOverride || selectedColor;
    if (!colorToApply) return;

    if (colorOverride) {
      setSelectedColor(colorOverride);
    }

    setColoredZones(prev => {
      const newMap = new Map(prev);
      newMap.set(zoneId, colorToApply);
      return newMap;
    });
    setVerificationResult(null); // Clear verification when coloring
  }, [selectedColor]);

  const handleGlobalDrop = useCallback((x: number, y: number, colorKey: string) => {
    if (coloringAreaRef.current) {
      coloringAreaRef.current.handleExternalDrop(x, y, colorKey);
    }
  }, []);

  const handleCheck = useCallback(() => {
    const results = new Map<string, boolean>();
    let allCorrect = true;

    currentPage.zones.forEach(zone => {
      const appliedColor = coloredZones.get(zone.id);
      const isCorrect = appliedColor === zone.correctColor;
      results.set(zone.id, isCorrect);
      if (!isCorrect) allCorrect = false;
    });

    setVerificationResult(results);

    setFeedback({
      visible: true,
      success: allCorrect,
      message: allCorrect ? "Чистота 99.1% достигнута!" : "Формула неверна. Повтори синтез!"
    });

    // Auto-hide feedback after delay
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, visible: false }));
    }, 2500);
  }, [currentPage, coloredZones]);

  const handleReset = useCallback(() => {
    resetState();
  }, [resetState]);

  const closeFeedback = useCallback(() => {
    setFeedback(prev => ({ ...prev, visible: false }));
  }, []);

  const isAllColored = coloredZones.size === currentPage.zones.length;
  const coloredCount = coloredZones.size;

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <BubblesBackground />

      <motion.div
        className="h-full flex flex-col relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Header
          title={bbTitle}
          instruction={currentPage.instruction}
          onPrev={handlePrev}
          onNext={handleNext}
          canGoPrev={currentPageIndex > 0}
          canGoNext={currentPageIndex < pages.length - 1}
          currentPage={currentPageIndex + 1}
          totalPages={pages.length}
        />

        <main className="flex-1 flex overflow-hidden">
          <ColorPalette
            colors={palette.colors}
            selectedColor={selectedColor}
            onSelectColor={handleSelectColor}
            availableColors={availableColors}
            onGlobalDrop={handleGlobalDrop}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <ColoringArea
              ref={coloringAreaRef}
              zones={currentPage.zones}
              coloredZones={coloredZones}
              selectedColor={selectedColor}
              paletteId={currentPage.palette}
              verificationResult={verificationResult}
              onZoneClick={(id) => handleZoneClick(id)}
              onZoneDrop={(id, color) => handleZoneClick(id, color)}
              imagePath={currentPage.image} // Pass image path
            />

            <ProgressBar
              current={coloredCount}
              total={currentPage.zones.length}
            />
          </div>
        </main>

        <Footer
          onCheck={handleCheck}
          onReset={handleReset}
          isAllColored={isAllColored}
        />
      </motion.div>

      <FeedbackOverlay
        isVisible={feedback.visible}
        isSuccess={feedback.success}
        message={feedback.message}
        onClose={closeFeedback}
      />
    </div>
  );
};

export default Index;
