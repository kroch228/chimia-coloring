import { motion } from "framer-motion";
import { Zone } from "@/data/chemistryData";
import { cn } from "@/lib/utils";

interface ColoringZoneProps {
  zone: Zone;
  currentColor: string | null;
  isCorrect?: boolean | null;
  onClick: (zoneId: string) => void;
  colorValue?: string;
}

export function ColoringZone({ zone, currentColor, isCorrect, onClick, colorValue }: ColoringZoneProps) {
  // Generate a random position for the zone
  const getZonePosition = (index: number, total: number) => {
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;
    return { row, col };
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(zone.id)}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 min-h-24 cursor-pointer",
        currentColor 
          ? "border-foreground/30" 
          : "border-dashed border-muted-foreground/30 bg-chem-bg-tertiary hover:border-primary/50",
        isCorrect === true && "animate-pulse-correct border-success",
        isCorrect === false && "animate-flash-wrong border-destructive"
      )}
      style={{ 
        backgroundColor: colorValue || 'transparent',
        color: colorValue && isLightColor(colorValue) ? '#1a1a2e' : '#ffffff'
      }}
    >
      <span className={cn(
        "text-lg font-bold transition-colors",
        !colorValue && "text-muted-foreground"
      )}>
        {zone.formula}
      </span>
      {currentColor && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
        >
          <span className="text-xs">✓</span>
        </motion.div>
      )}
    </motion.button>
  );
}

function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}
