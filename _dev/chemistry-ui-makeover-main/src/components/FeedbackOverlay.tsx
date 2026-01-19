import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeedbackOverlayProps {
  isVisible: boolean;
  isSuccess: boolean;
  message: string;
  onClose: () => void;
}

export function FeedbackOverlay({ isVisible, isSuccess, message, onClose }: FeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 cursor-pointer"
        >
          {/* Hazard border frame */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative"
          >
            {/* Outer hazard frame */}
            <div className="absolute -inset-2 hazard-stripes opacity-80" />
            
            {/* Inner content */}
            <div className={cn(
              "relative px-16 py-10 text-center shadow-2xl border-4",
              isSuccess 
                ? "bg-gradient-to-br from-green-900 to-green-950 border-success" 
                : "bg-gradient-to-br from-red-900 to-red-950 border-destructive"
            )}>
              <div className="text-6xl mb-4">
                {isSuccess ? "☢️" : "💀"}
              </div>
              <div className="text-3xl font-bold uppercase tracking-wider font-oswald text-foreground">
                {isSuccess ? "СИНТЕЗ ЗАВЕРШЁН" : "ОШИБКА СИНТЕЗА"}
              </div>
              <div className="mt-2 text-lg text-muted-foreground font-mono-chem">
                {message}
              </div>
              
              {isSuccess && (
                <motion.div
                  className="mt-4 text-sm text-accent font-mono-chem"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  99.1% ЧИСТОТА
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
