import React from 'react';
import { motion } from "framer-motion";
import { ColorInfo } from "@/data/chemistryData";
import { cn } from "@/lib/utils";
import { Beaker } from "lucide-react";

interface ColorPaletteProps {
  colors: ColorInfo[];
  selectedColor: string | null;
  onSelectColor: (colorKey: string) => void;
  availableColors?: string[];
  onGlobalDrop?: (x: number, y: number, colorKey: string) => void;
}

export function ColorPalette({ colors, selectedColor, onSelectColor, availableColors, onGlobalDrop }: ColorPaletteProps) {
  const filteredColors = availableColors
    ? colors.filter(c => availableColors.includes(c.key))
    : colors;

  // Pre-generate drag images to avoid "first drag invisible" issue
  const dragImagesRef = React.useRef<Map<string, HTMLImageElement>>(new Map());

  React.useEffect(() => {
    filteredColors.forEach(colorInfo => {
      const canvas = document.createElement('canvas');
      canvas.width = 60;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = colorInfo.color;
        ctx.beginPath();
        ctx.arc(30, 30, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.stroke();
      }
      const img = new Image();
      img.src = canvas.toDataURL();
      dragImagesRef.current.set(colorInfo.key, img);
    });
  }, [filteredColors]);

  return (
    <aside className="w-56 min-w-56 bg-card border-r-2 border-primary/20 p-5 overflow-y-auto flex flex-col">
      {/* Header with hazard icon */}
      <div className="flex items-center justify-center gap-2 mb-4 pb-3 border-b border-primary/20">
        <Beaker className="w-5 h-5 text-accent" />
        <h2 className="text-sm font-bold text-primary uppercase tracking-widest">
          Реагенты
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {filteredColors.map((colorInfo, index) => (
          <motion.button
            key={colorInfo.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectColor(colorInfo.key)}
            draggable={true}

            onTouchStart={(e) => {
              const touch = e.touches[0];

              // Create visual circle ghost
              const ghost = document.createElement('div');
              ghost.style.position = 'fixed';
              ghost.style.width = '60px';
              ghost.style.height = '60px';
              ghost.style.borderRadius = '50%';
              ghost.style.backgroundColor = colorInfo.color;
              ghost.style.border = '4px solid white';
              ghost.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
              ghost.style.zIndex = '2147483647';
              ghost.style.pointerEvents = 'none';
              ghost.id = `touch-ghost-${colorInfo.key}`;

              // Center on finger
              ghost.style.left = `${touch.clientX - 30}px`;
              ghost.style.top = `${touch.clientY - 30}px`;

              document.body.appendChild(ghost);

              const moveHandler = (tm: TouchEvent) => {
                if (tm.cancelable) tm.preventDefault();
                const t = tm.touches[0];
                ghost.style.left = `${t.clientX - 30}px`;
                ghost.style.top = `${t.clientY - 30}px`;
              };

              const endHandler = (te: TouchEvent) => {
                const t = te.changedTouches[0];
                if (onGlobalDrop) {
                  onGlobalDrop(t.clientX, t.clientY, colorInfo.key);
                }

                if (ghost.parentNode) {
                  ghost.parentNode.removeChild(ghost);
                }
                window.removeEventListener('touchmove', moveHandler);
                window.removeEventListener('touchend', endHandler);
              };

              window.addEventListener('touchmove', moveHandler, { passive: false });
              window.addEventListener('touchend', endHandler);
            }}

            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", colorInfo.key);
              e.dataTransfer.effectAllowed = "copy";

              // Use pre-generated image
              const img = dragImagesRef.current.get(colorInfo.key);
              if (img) {
                e.dataTransfer.setDragImage(img, 30, 30);
              }
            }}

            className={cn(
              "relative flex items-center gap-3 p-3 bg-muted border-2 border-transparent cursor-pointer transition-all duration-200 min-h-16 rounded-none",
              selectedColor === colorInfo.key
                ? "border-primary shadow-glow bg-primary/10"
                : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            {/* Color swatch with chemical beaker style */}
            <div className="relative">
              <div
                className="w-10 h-10 min-w-10 shadow-md border border-foreground/20"
                style={{
                  backgroundColor: colorInfo.color,
                  clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)'
                }}
              />
              {selectedColor === colorInfo.key && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-primary flex items-center justify-center text-xs text-background font-bold"
                >
                  ✓
                </motion.div>
              )}
            </div>

            <span className="text-sm font-semibold text-foreground leading-tight font-mono-chem">
              {colorInfo.label}
            </span>

            {/* Selected indicator line */}
            {selectedColor === colorInfo.key && (
              <motion.div
                layoutId="selectedIndicator"
                className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Warning label */}
      <div className="mt-auto pt-4 border-t border-primary/20">
        <div className="text-center">
          <span className="text-xs text-destructive font-mono-chem">⚠ ТОКСИЧНО</span>
        </div>
      </div>
    </aside>
  );
}
