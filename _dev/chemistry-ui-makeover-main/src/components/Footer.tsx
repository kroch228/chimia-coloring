import { motion } from "framer-motion";
import { Check, RotateCcw, Radiation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterProps {
  onCheck: () => void;
  onReset: () => void;
  isAllColored: boolean;
}

export function Footer({ onCheck, onReset, isAllColored }: FooterProps) {
  return (
    <footer className="relative flex justify-center gap-4 px-6 py-4 bg-card border-t-2 border-primary/30">
      {/* Hazard stripe accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 hazard-stripes opacity-60" />
      
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={onCheck}
          disabled={!isAllColored}
          className="min-w-48 min-h-14 gap-3 text-lg font-bold uppercase tracking-wider gradient-bg-success text-foreground border-none rounded-none hover:shadow-toxic hover:-translate-y-0.5 transition-all disabled:opacity-30"
        >
          <Check className="w-5 h-5" />
          Проверить
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          onClick={onReset}
          className="min-w-48 min-h-14 gap-3 text-lg font-bold uppercase tracking-wider bg-muted border-2 border-destructive/50 text-destructive rounded-none hover:border-destructive hover:bg-destructive/10 hover:-translate-y-0.5 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          Сбросить
        </Button>
      </motion.div>

      {/* Radiation icon decoration */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
        <Radiation className="w-8 h-8 text-primary animate-pulse" />
      </div>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20">
        <Radiation className="w-8 h-8 text-primary animate-pulse" />
      </div>
    </footer>
  );
}
