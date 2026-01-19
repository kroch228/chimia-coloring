import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="mx-5 mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-primary/60 font-mono-chem uppercase tracking-wider">
          Прогресс синтеза
        </span>
        <span className="text-xs text-primary font-mono-chem font-bold">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-6 bg-muted border border-primary/30 overflow-hidden relative">
        <motion.div
          className="h-full gradient-bg-toxic"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-sm font-mono-chem text-foreground drop-shadow-lg">
            {current} / {total}
          </span>
        </div>
        
        {/* Animated highlight */}
        {percentage > 0 && percentage < 100 && (
          <motion.div
            className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: [-32, 500] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
    </div>
  );
}
