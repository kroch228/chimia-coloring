import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Skull, FlaskRound } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  instruction: string;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  currentPage: number;
  totalPages: number;
}

export function Header({ 
  title, 
  instruction, 
  onPrev, 
  onNext, 
  canGoPrev, 
  canGoNext,
  currentPage,
  totalPages
}: HeaderProps) {
  return (
    <header className="relative flex items-center justify-between px-6 py-4 bg-card border-b-2 border-primary/30 shadow-lg z-10">
      {/* Hazard stripe accent */}
      <div className="absolute top-0 left-0 right-0 h-1 hazard-stripes opacity-60" />
      
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={!canGoPrev}
        className="min-w-16 min-h-14 gap-2 bg-muted border-2 border-primary/30 text-primary hover:border-primary hover:bg-primary/10 hover:shadow-glow transition-all disabled:opacity-30 rounded-none"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="hidden sm:inline uppercase tracking-wider text-sm">Назад</span>
      </Button>

      <motion.div 
        className="text-center flex-1 px-4"
        key={title}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-center gap-3 mb-1">
          <FlaskRound className="w-7 h-7 text-accent" />
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider gradient-text">
            {title}
          </h1>
          <Skull className="w-6 h-6 text-primary/60" />
        </div>
        <p className="text-sm text-muted-foreground font-mono-chem tracking-wide">
          {instruction}
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-xs text-primary/60 font-mono-chem">
            УРОВЕНЬ {currentPage}/{totalPages}
          </span>
          <span className="text-primary/40">|</span>
          <span className="text-xs text-accent font-mono-chem animate-pulse">
            ☢ ОПАСНО
          </span>
        </div>
      </motion.div>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={!canGoNext}
        className="min-w-16 min-h-14 gap-2 bg-muted border-2 border-primary/30 text-primary hover:border-primary hover:bg-primary/10 hover:shadow-glow transition-all disabled:opacity-30 rounded-none"
      >
        <span className="hidden sm:inline uppercase tracking-wider text-sm">Далее</span>
        <ChevronRight className="w-5 h-5" />
      </Button>
    </header>
  );
}
