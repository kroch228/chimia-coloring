import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Zone, COLOR_PALETTES } from "@/data/chemistryData";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ColoringAreaProps {
  zones: Zone[];
  coloredZones: Map<string, string>;
  selectedColor: string | null;
  paletteId: string;
  verificationResult: Map<string, boolean> | null;
  onZoneClick: (zoneId: string) => void;
  onZoneDrop?: (zoneId: string, colorKey: string) => void;
  imagePath?: string;
  onImageLoadError?: () => void;
}

export interface ColoringAreaRef {
  handleExternalDrop: (x: number, y: number, colorKey: string) => void;
}

export const ColoringArea = forwardRef<ColoringAreaRef, ColoringAreaProps>(({
  zones,
  coloredZones,
  selectedColor,
  paletteId,
  verificationResult,
  onZoneClick,
  onZoneDrop,
  imagePath
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);


  useEffect(() => {
    if (!imagePath) return;

    const img = new Image();
    img.src = imagePath;
    img.onload = () => {
      setImage(img);
    };
    img.onerror = () => {
      console.error("Failed to load image:", imagePath);
    };
  }, [imagePath]);


  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !image) return;
      const container = containerRef.current;
      const aspect = image.width / image.height;
      let displayWidth = container.clientWidth;
      let displayHeight = displayWidth / aspect;

      if (displayHeight > container.clientHeight) {
        displayHeight = container.clientHeight;
        displayWidth = displayHeight * aspect;
      }
      setScale(displayWidth / image.width);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [image]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;


    ctx.drawImage(image, 0, 0);

    // Draw Colored Zones (largest first)


    const zonesToDraw = zones
      .filter(z => (z as any).points && (z as any).points.length > 0)
      .map(zone => ({
        zone,
        area: getPolygonArea((zone as any).points)
      }))
      .sort((a, b) => b.area - a.area); // Largest first

    const isZoneContainedIn = (innerPts: number[][], outerPts: number[][]): boolean => {
      // Use centroid of inner zone
      let cx = 0, cy = 0;
      for (const p of innerPts) {
        cx += p[0];
        cy += p[1];
      }
      cx /= innerPts.length;
      cy /= innerPts.length;

      // Check if centroid is inside outer polygon
      let inside = false;
      for (let i = 0, j = outerPts.length - 1; i < outerPts.length; j = i++) {
        const xi = outerPts[i][0], yi = outerPts[i][1];
        const xj = outerPts[j][0], yj = outerPts[j][1];
        const intersect = ((yi > cy) !== (yj > cy)) && (cx < (xj - xi) * (cy - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    };

    // Find holes for each zone
    // A zone B is a direct child of A if B is inside A AND there's no zone C where B is inside C and C is inside A
    const zonesWithHoles = zonesToDraw.map(({ zone, area }) => {
      const outerPts = (zone as any).points;
      const holes: number[][][] = [];

      for (const { zone: innerZone, area: innerArea } of zonesToDraw) {
        if (innerZone.id === zone.id) continue; // Skip self
        if (innerArea >= area) continue; // Only smaller zones can be holes

        const innerPts = (innerZone as any).points;
        if (!isZoneContainedIn(innerPts, outerPts)) continue; // Must be inside

        // Check if this is a DIRECT child (no intermediate zone between them)
        let isDirectChild = true;
        for (const { zone: middleZone, area: middleArea } of zonesToDraw) {
          if (middleZone.id === zone.id) continue; // Skip outer
          if (middleZone.id === innerZone.id) continue; // Skip inner
          if (middleArea >= area) continue; // Middle must be smaller than outer
          if (middleArea <= innerArea) continue; // Middle must be larger than inner

          const middlePts = (middleZone as any).points;
          // If inner is inside middle AND middle is inside outer, then inner is NOT a direct child
          if (isZoneContainedIn(innerPts, middlePts) && isZoneContainedIn(middlePts, outerPts)) {
            isDirectChild = false;
            break;
          }
        }

        if (isDirectChild) {
          holes.push(innerPts);
        }
      }

      return { zone, area, holes };
    });

    zonesWithHoles.forEach(({ zone, holes }) => {
      const colorKey = coloredZones.get(zone.id);
      const isCorrect = verificationResult?.get(zone.id);
      const isWrong = verificationResult && isCorrect === false;

      let fillColor = null;
      let strokeColor = null;

      if (colorKey) {
        const palette = COLOR_PALETTES[paletteId];
        const colorInfo = palette?.colors.find(c => c.key === colorKey);
        if (colorInfo) fillColor = colorInfo.color;
      }

      if (isWrong) {
        fillColor = '#FF0000';
        strokeColor = '#FF0000';
      }

      if (fillColor || strokeColor) {
        drawPolygonWithHoles(ctx, (zone as any).points, holes, fillColor, strokeColor);
      }
    });

  }, [image, coloredZones, verificationResult, zones, paletteId]);

  const drawPolygonWithHoles = (
    ctx: CanvasRenderingContext2D,
    points: number[][],
    holes: number[][][],
    fillColor: string | null,
    strokeColor: string | null
  ) => {
    if (!points || points.length === 0) return;

    ctx.beginPath();

    // Draw outer polygon (clockwise)
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();

    // Draw holes (counter-clockwise to create holes with evenodd)
    for (const hole of holes) {
      if (hole.length === 0) continue;
      // Draw in reverse order to make it counter-clockwise
      ctx.moveTo(hole[hole.length - 1][0], hole[hole.length - 1][1]);
      for (let i = hole.length - 2; i >= 0; i--) {
        ctx.lineTo(hole[i][0], hole[i][1]);
      }
      ctx.closePath();
    }

    if (fillColor) {
      // Save current composite mode
      const prevComposite = ctx.globalCompositeOperation;

      // Use 'multiply' to preserve dark pixels (black contours)
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = fillColor; // Full color, multiply will handle transparency
      ctx.fill('evenodd');

      // Restore composite mode
      ctx.globalCompositeOperation = prevComposite;
    }
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  };

  const isPointInPolygon = (x: number, y: number, points: number[][]) => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i][0], yi = points[i][1];
      const xj = points[j][0], yj = points[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };


  const getPolygonArea = (points: number[][]): number => {
    let area = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i][0] * points[j][1];
      area -= points[j][0] * points[i][1];
    }
    return Math.abs(area / 2);
  };


  const findSmallestZoneAtPoint = (x: number, y: number): string | null => {
    let smallestZone: { id: string; area: number } | null = null;

    for (const zone of zones) {
      const points = (zone as any).points;
      if (points && isPointInPolygon(x, y, points)) {
        const area = getPolygonArea(points);
        if (!smallestZone || area < smallestZone.area) {
          smallestZone = { id: zone.id, area };
        }
      }
    }

    return smallestZone ? smallestZone.id : null;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !image) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = image.width / rect.width;
    const scaleY = image.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const zoneId = findSmallestZoneAtPoint(x, y);
    if (zoneId) {
      onZoneClick(zoneId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const colorKey = e.dataTransfer.getData("text/plain");
    processDrop(e.clientX, e.clientY, colorKey);
  };

  const processDrop = (clientX: number, clientY: number, colorKey: string) => {
    if (!colorKey || !canvasRef.current || !image) return;

    const rect = canvasRef.current.getBoundingClientRect();

    // Check boundaries
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return;
    }

    const scaleX = image.width / rect.width;
    const scaleY = image.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const zoneId = findSmallestZoneAtPoint(x, y);
    if (zoneId && onZoneDrop) {
      onZoneDrop(zoneId, colorKey);
    }
  };


  useImperativeHandle(ref, () => ({
    handleExternalDrop: (x: number, y: number, colorKey: string) => {
      processDrop(x, y, colorKey);
    }
  }));

  const hasPoints = zones.some(z => (z as any).points && (z as any).points.length > 0);

  if (!imagePath || !hasPoints) {
    return (
      <div className="flex-1 flex items-center justify-center p-10 text-muted-foreground">
        {imagePath ? "Loading image..." : "No image or zones defined."}
      </div>
    );
  }

  return (
    <section className="flex-1 flex flex-col p-5 overflow-hidden">
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-muted/50 border-2 border-primary/20 shadow-lg overflow-hidden relative rounded-xl"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary/40 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary/40 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary/40 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary/40 rounded-br-xl" />

        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="max-w-full max-h-full object-contain cursor-crosshair"
          style={{ width: 'auto', height: 'auto' }}
        />

        <div className="absolute inset-0 pointer-events-none opacity-10 scanlines" />
      </div>
    </section>
  );
});
