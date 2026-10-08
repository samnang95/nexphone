"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Model3DAsset, ColorOption } from "@/types/product";

interface Phone3DViewerProps {
  readonly model3D: Model3DAsset;
  readonly colors?: readonly ColorOption[];
  readonly activeColor?: string;
  readonly onColorChange?: (colorHex: string) => void;
  readonly className?: string;
}

export function Phone3DViewer({
  model3D,
  colors = [],
  activeColor: externalActiveColor,
  onColorChange,
  className = "",
}: Phone3DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [internalColor, setInternalColor] = useState(
    externalActiveColor || model3D.defaultColor || "#2b2d42"
  );
  const activeColor = externalActiveColor || internalColor;

  const [rotationX, setRotationX] = useState(-15);
  const [rotationY, setRotationY] = useState(35);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAutoRotating, setIsAutoRotating] = useState(model3D.autoRotate);
  const [isWireframe, setIsWireframe] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewPreset, setViewPreset] = useState<"isometric" | "front" | "back" | "side">("isometric");

  const handleColorSelect = useCallback(
    (hex: string) => {
      setInternalColor(hex);
      if (onColorChange) onColorChange(hex);
    },
    [onColorChange]
  );

  // Set rotation presets
  const applyPreset = (preset: "isometric" | "front" | "back" | "side") => {
    setViewPreset(preset);
    setIsAutoRotating(false);
    switch (preset) {
      case "front":
        setRotationX(0);
        setRotationY(0);
        break;
      case "back":
        setRotationX(0);
        setRotationY(180);
        break;
      case "side":
        setRotationX(0);
        setRotationY(90);
        break;
      case "isometric":
      default:
        setRotationX(-15);
        setRotationY(35);
        break;
    }
  };

  // Drag controls
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsAutoRotating(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setRotationY((prev) => (prev + deltaX * 0.75) % 360);
    setRotationX((prev) => Math.max(-65, Math.min(65, prev - deltaY * 0.75)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Auto-rotate tick
  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      setRotationY((prev) => (prev + 0.8) % 360);
    }, 24);
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  // Realistic 3D Phone projection renderer using HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Radial background studio glow
      const bgGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        width * 0.1,
        centerX,
        centerY,
        width * 0.55
      );
      bgGrad.addColorStop(0, "rgba(99, 102, 241, 0.08)");
      bgGrad.addColorStop(1, "rgba(2, 6, 23, 0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Convert angles to radians
      const radY = (rotationY * Math.PI) / 180;
      const radX = (rotationX * Math.PI) / 180;

      // Base Phone Dimensions
      const phoneW = 130 * zoomLevel;
      const phoneH = 250 * zoomLevel;
      const phoneD = 18 * zoomLevel;

      // 3D Box vertices (front face & back face)
      type Point3D = [number, number, number];
      const hw = phoneW / 2;
      const hh = phoneH / 2;
      const hd = phoneD / 2;

      // 8 corners
      const vertices: Point3D[] = [
        [-hw, -hh, hd],  // 0: Front top-left
        [hw, -hh, hd],   // 1: Front top-right
        [hw, hh, hd],    // 2: Front bottom-right
        [-hw, hh, hd],   // 3: Front bottom-left
        [-hw, -hh, -hd], // 4: Back top-left
        [hw, -hh, -hd],  // 5: Back top-right
        [hw, hh, -hd],   // 6: Back bottom-right
        [-hw, hh, -hd],  // 7: Back bottom-left
      ];

      // Rotate around Y and X axis
      const project = (p: Point3D): { x: number; y: number; z: number } => {
        // Y rotation
        const cosY = Math.cos(radY);
        const sinY = Math.sin(radY);
        const x1 = p[0] * cosY + p[2] * sinY;
        const z1 = -p[0] * sinY + p[2] * cosY;

        // X rotation
        const cosX = Math.cos(radX);
        const sinX = Math.sin(radX);
        const y2 = p[1] * cosX - z1 * sinX;
        const z2 = p[1] * sinX + z1 * cosX;

        // Perspective division
        const fov = 650;
        const distance = 450;
        const scale = fov / (fov + z2 + distance);

        return {
          x: centerX + x1 * scale * 1.5,
          y: centerY + y2 * scale * 1.5,
          z: z2,
        };
      };

      const projected = vertices.map(project);

      // Faces definition with normal vectors
      interface Face {
        indices: [number, number, number, number];
        normal: Point3D;
        type: "front" | "back" | "left" | "right" | "top" | "bottom";
      }

      const faces: Face[] = [
        { indices: [0, 1, 2, 3], normal: [0, 0, 1], type: "front" },
        { indices: [5, 4, 7, 6], normal: [0, 0, -1], type: "back" },
        { indices: [4, 0, 3, 7], normal: [-1, 0, 0], type: "left" },
        { indices: [1, 5, 6, 2], normal: [1, 0, 0], type: "right" },
        { indices: [4, 5, 1, 0], normal: [0, -1, 0], type: "top" },
        { indices: [3, 2, 6, 7], normal: [0, 1, 0], type: "bottom" },
      ];

      // Calculate depth and visibility for each face
      const renderedFaces = faces
        .map((face) => {
          const idx0 = face.indices[0]!;
          const idx1 = face.indices[1]!;
          const idx2 = face.indices[2]!;
          const idx3 = face.indices[3]!;
          const p0 = projected[idx0];
          const p1 = projected[idx1];
          const p2 = projected[idx2];
          const p3 = projected[idx3];
          if (!p0 || !p1 || !p2 || !p3) return null;

          // 2D Cross product for back-face culling
          const normalZ =
            (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);

          const avgZ = (p0.z + p1.z + p2.z + p3.z) / 4;

          return {
            face,
            points: [p0, p1, p2, p3] as const,
            normalZ,
            avgZ,
          };
        })
        .filter((f): f is NonNullable<typeof f> => f !== null)
        .sort((a, b) => b.avgZ - a.avgZ); // Painter's algorithm

      // Draw shadow under phone
      ctx.beginPath();
      const shadowY = centerY + phoneH * 0.65;
      const shadowW = phoneW * 0.95;
      const shadowH = phoneD * 2.2;
      const shadowGrad = ctx.createRadialGradient(
        centerX,
        shadowY,
        5,
        centerX,
        shadowY,
        shadowW
      );
      shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.45)");
      shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.ellipse(centerX, shadowY, shadowW, shadowH, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw Faces
      renderedFaces.forEach(({ face, points, normalZ }) => {
        if (normalZ <= 0) return; // Cull back faces

        const [p0, p1, p2, p3] = points;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();

        if (isWireframe) {
          ctx.strokeStyle = "#818cf8";
          ctx.lineWidth = 1.25;
          ctx.stroke();

          // Draw internal triangulated mesh wires
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = "rgba(129, 140, 248, 0.35)";
          ctx.stroke();
          return;
        }

        // Shading based on normal and light source
        if (face.type === "front") {
          // OLED Display Face
          const screenGrad = ctx.createLinearGradient(
            p0.x,
            p0.y,
            p2.x,
            p2.y
          );
          screenGrad.addColorStop(0, "#090d16");
          screenGrad.addColorStop(0.5, "#0f172a");
          screenGrad.addColorStop(1, "#1e1b4b");
          ctx.fillStyle = screenGrad;
          ctx.fill();

          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Screen Wallpaper Glow / Dynamic Pill
          const centerFrontX = (p0.x + p2.x) / 2;
          const topFrontY = (p0.y + p1.y) / 2;

          // Camera punch hole
          ctx.beginPath();
          ctx.arc(centerFrontX, topFrontY + 12 * zoomLevel, 3 * zoomLevel, 0, Math.PI * 2);
          ctx.fillStyle = "#000000";
          ctx.fill();
          ctx.strokeStyle = "#1e293b";
          ctx.stroke();

          // NexOS UI Preview bar
          ctx.font = `${Math.max(9, Math.round(11 * zoomLevel))}px sans-serif`;
          ctx.fillStyle = "#94a3b8";
          ctx.textAlign = "center";
          ctx.fillText("NexOS 2.4", centerFrontX, (p0.y + p2.y) / 2 - 10);

          ctx.font = `${Math.max(8, Math.round(9 * zoomLevel))}px monospace`;
          ctx.fillStyle = "#38bdf8";
          ctx.fillText("5G • 100%", centerFrontX, (p0.y + p2.y) / 2 + 10);
        } else if (face.type === "back") {
          // Back Glass Panel with active color
          ctx.fillStyle = activeColor;
          ctx.fill();

          // Camera Bump island
          const bumpX = p0.x + (p1.x - p0.x) * 0.35;
          const bumpY = p0.y + (p3.y - p0.y) * 0.3;
          const bumpW = 32 * zoomLevel;
          const bumpH = 38 * zoomLevel;

          ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
          ctx.fillRect(bumpX - bumpW / 2, bumpY - bumpH / 2, bumpW, bumpH);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
          ctx.strokeRect(bumpX - bumpW / 2, bumpY - bumpH / 2, bumpW, bumpH);

          // 3 Camera Lenses
          const lensRadius = 4.5 * zoomLevel;
          const lenses: Array<[number, number]> = [
            [bumpX - 7 * zoomLevel, bumpY - 9 * zoomLevel],
            [bumpX + 7 * zoomLevel, bumpY - 9 * zoomLevel],
            [bumpX - 7 * zoomLevel, bumpY + 7 * zoomLevel],
          ];
          lenses.forEach(([lx, ly]) => {
            ctx.beginPath();
            ctx.arc(lx, ly, lensRadius, 0, Math.PI * 2);
            ctx.fillStyle = "#020617";
            ctx.fill();
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Lens reflection dot
            ctx.beginPath();
            ctx.arc(lx - 1.5, ly - 1.5, 1, 0, Math.PI * 2);
            ctx.fillStyle = "#38bdf8";
            ctx.fill();
          });

          // NexPhone minimal back logo
          const logoX = (p0.x + p2.x) / 2;
          const logoY = (p0.y + p2.y) / 2 + 35 * zoomLevel;
          ctx.font = `bold ${Math.max(10, Math.round(12 * zoomLevel))}px sans-serif`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
          ctx.textAlign = "center";
          ctx.fillText("NX", logoX, logoY);

          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Metallic Titanium Edge rails
          const railGrad = ctx.createLinearGradient(
            p0.x,
            p0.y,
            p2.x,
            p2.y
          );
          railGrad.addColorStop(0, "#475569");
          railGrad.addColorStop(0.5, "#94a3b8");
          railGrad.addColorStop(1, "#334155");
          ctx.fillStyle = railGrad;
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    };

    const animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [rotationX, rotationY, activeColor, zoomLevel, isWireframe]);

  return (
    <div
      className={`relative flex flex-col rounded-2xl border border-slate-800 bg-slate-950/70 p-4 backdrop-blur-md overflow-hidden ${className}`}
    >
      {/* Top 3D Asset Header Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">3D Real-Time Model Viewer</span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300 uppercase">
            {model3D.fileFormat}
          </span>
        </div>

        {/* View Presets */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
          {(
            [
              { key: "isometric", label: "3D Angle" },
              { key: "front", label: "Front" },
              { key: "back", label: "Back" },
              { key: "side", label: "Edge" },
            ] as const
          ).map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => applyPreset(p.key)}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                viewPreset === p.key
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative h-64 sm:h-72 w-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
        <canvas
          ref={canvasRef}
          width={440}
          height={320}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full object-contain"
        />

        {/* Interaction Hint Overlay */}
        <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-slate-900/80 border border-slate-800 px-2.5 py-1 text-[10px] text-slate-400 backdrop-blur-sm">
          <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <span>Drag to orbit • 360° Inspection</span>
        </div>

        {/* Zoom & Wireframe toggles */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setIsWireframe((prev) => !prev)}
            title="Toggle Wireframe Mesh"
            className={`rounded-lg p-1.5 border text-xs transition-colors backdrop-blur-sm ${
              isWireframe
                ? "border-indigo-500 bg-indigo-600/30 text-indigo-300"
                : "border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setIsAutoRotating((prev) => !prev)}
            title="Toggle Auto-Rotation"
            className={`rounded-lg p-1.5 border text-xs transition-colors backdrop-blur-sm ${
              isAutoRotating
                ? "border-indigo-500 bg-indigo-600/30 text-indigo-300"
                : "border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setZoomLevel((z) => (z >= 1.25 ? 0.85 : z + 0.15))}
            title="Toggle Zoom Scale"
            className="rounded-lg p-1.5 border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white transition-colors backdrop-blur-sm text-xs"
          >
            <span className="font-mono text-[10px] block">{Math.round(zoomLevel * 100)}%</span>
          </button>
        </div>
      </div>

      {/* Bottom Color Swatches Bar */}
      {colors.length > 0 && (
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">Material Color Finishes:</span>
          <div className="flex items-center gap-2">
            {colors.map((c) => {
              const isSelected = activeColor.toLowerCase() === c.hex.toLowerCase();
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleColorSelect(c.hex)}
                  title={c.name}
                  className={`group relative flex h-6 w-6 items-center justify-center rounded-full transition-transform ${
                    isSelected ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 scale-110" : "hover:scale-105"
                  }`}
                >
                  <span
                    className="h-5 w-5 rounded-full border border-white/20 shadow-inner"
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3D Asset Metadata Strip */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>Mesh: {model3D.polygonCount.toLocaleString()} Polys</span>
        <span>Size: {model3D.fileSize}</span>
        <span>Format: {model3D.fileFormat.toUpperCase()}</span>
      </div>
    </div>
  );
}
