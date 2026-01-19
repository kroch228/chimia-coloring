import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  size: number;
  x: number;
  delay: number;
  duration: number;
  type: 'bubble' | 'smoke';
}

export function BubblesBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [
      // Toxic bubbles
      ...Array.from({ length: 8 }, (_, i) => ({
        id: i,
        size: Math.random() * 30 + 10,
        x: Math.random() * 100,
        delay: Math.random() * 10,
        duration: Math.random() * 15 + 20,
        type: 'bubble' as const,
      })),
      // Smoke particles
      ...Array.from({ length: 6 }, (_, i) => ({
        id: i + 10,
        size: Math.random() * 100 + 50,
        x: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 20 + 25,
        type: 'smoke' as const,
      })),
    ];
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      
      {/* Toxic green ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-toxic" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-toxic" style={{ animationDelay: '1.5s' }} />
      
      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={particle.type === 'bubble' ? 'absolute rounded-full' : 'absolute rounded-full blur-xl'}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            bottom: particle.type === 'bubble' ? -particle.size : '10%',
            background: particle.type === 'bubble'
              ? `radial-gradient(circle at 30% 30%, hsla(120, 60%, 40%, 0.3), hsla(120, 60%, 30%, 0.1))`
              : `radial-gradient(circle, hsla(55, 100%, 50%, 0.05), transparent)`,
            border: particle.type === 'bubble' ? '1px solid hsla(120, 60%, 40%, 0.2)' : 'none',
          }}
          animate={particle.type === 'bubble' ? {
            y: [0, -(typeof window !== 'undefined' ? window.innerHeight : 1000) - particle.size * 2],
            opacity: [0.3, 0.6, 0.4, 0],
            scale: [1, 1.2, 1, 0.8],
          } : {
            y: [0, -200],
            x: [0, Math.random() * 100 - 50],
            opacity: [0, 0.3, 0],
            scale: [1, 1.5, 2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Decorative chemistry equipment silhouettes */}
      <div className="absolute bottom-10 left-10 opacity-10">
        <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
          {/* Erlenmeyer flask */}
          <path 
            d="M25 10 L25 35 L5 85 C2 92 8 98 40 98 C72 98 78 92 75 85 L55 35 L55 10 Z" 
            stroke="hsl(55, 100%, 50%)" 
            strokeWidth="2"
            fill="none"
          />
          {/* Liquid level */}
          <path 
            d="M12 70 Q40 65 68 70 L75 85 C78 92 72 98 40 98 C8 98 2 92 5 85 Z" 
            fill="hsla(120, 60%, 30%, 0.3)"
          />
          {/* Bubbles */}
          <circle cx="25" cy="80" r="3" fill="hsla(120, 60%, 40%, 0.5)" />
          <circle cx="45" cy="75" r="2" fill="hsla(120, 60%, 40%, 0.5)" />
          <circle cx="55" cy="82" r="4" fill="hsla(120, 60%, 40%, 0.5)" />
        </svg>
      </div>

      <div className="absolute bottom-10 right-10 opacity-10">
        <svg width="60" height="90" viewBox="0 0 60 90" fill="none">
          {/* Beaker */}
          <rect x="5" y="10" width="50" height="70" rx="3" stroke="hsl(55, 100%, 50%)" strokeWidth="2" fill="none" />
          {/* Measurement lines */}
          <path d="M5 30 L15 30" stroke="hsl(55, 100%, 50%)" strokeWidth="1" />
          <path d="M5 50 L15 50" stroke="hsl(55, 100%, 50%)" strokeWidth="1" />
          <path d="M5 70 L15 70" stroke="hsl(55, 100%, 50%)" strokeWidth="1" />
          {/* Liquid */}
          <rect x="6" y="50" width="48" height="29" fill="hsla(55, 100%, 50%, 0.2)" />
        </svg>
      </div>

      {/* Periodic table element style decorations */}
      <div className="absolute top-20 right-20 opacity-10 border-2 border-primary p-2 text-center">
        <div className="text-2xl font-bold text-primary">Br</div>
        <div className="text-xs text-primary/60">35</div>
      </div>
      
      <div className="absolute top-40 left-20 opacity-10 border-2 border-accent p-2 text-center">
        <div className="text-2xl font-bold text-accent">P</div>
        <div className="text-xs text-accent/60">15</div>
      </div>
    </div>
  );
}
