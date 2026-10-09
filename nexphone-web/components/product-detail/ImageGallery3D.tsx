"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { PhoneProduct, ColorOption } from "@/types/product";

interface ImageGallery3DProps {
  product: PhoneProduct;
  selectedColor: ColorOption;
  onSelectColor?: (color: ColorOption) => void;
}

export function ImageGallery3D({
  product,
  selectedColor,
}: ImageGallery3DProps) {
  // Gallery images list: primary image + angle variations
  const galleryImages = [
    {
      id: "front",
      label: "Hero Display",
      url: selectedColor.imageUrl || product.imageUrl || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "angle",
      label: "Titanium Profile",
      url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "camera",
      label: "Optical Array",
      url: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "lifestyle",
      label: "Industrial Bevel",
      url: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(15);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  // 3D Canvas rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!is3DMode) return;

    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let angle = rotationAngle;

    const render = () => {
      if (isAutoRotating) {
        angle = (angle + 0.6) % 360;
        setRotationAngle(angle);
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const rad = (angle * Math.PI) / 180;
      const cx = width / 2;
      const cy = height / 2;

      // Phone 3D Box dimensions
      const pw = 140;
      const ph = 260;
      const pd = 24;

      // Calculate projected vertices
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const project = (x: number, y: number, z: number) => {
        // Rotate around Y-axis
        const rotX = x * cos + z * sin;
        const rotZ = -x * sin + z * cos;
        // Simple perspective
        const fov = 400;
        const scale = fov / (fov + rotZ);
        return {
          x: cx + rotX * scale,
          y: cy + y * scale,
          scale,
          z: rotZ,
        };
      };

      // 8 vertices of the phone body
      const v = [
        project(-pw / 2, -ph / 2, -pd / 2),
        project(pw / 2, -ph / 2, -pd / 2),
        project(pw / 2, ph / 2, -pd / 2),
        project(-pw / 2, ph / 2, -pd / 2),
        project(-pw / 2, -ph / 2, pd / 2),
        project(pw / 2, -ph / 2, pd / 2),
        project(pw / 2, ph / 2, pd / 2),
        project(-pw / 2, ph / 2, pd / 2),
      ];

      // Draw shadow
      ctx.beginPath();
      ctx.ellipse(cx, cy + 180, 110, 30, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fill();

      // Render wireframe vs solid
      if (isWireframe) {
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 1.5;
        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7],
        ];
        edges.forEach(([p1, p2]) => {
          ctx.beginPath();
          ctx.moveTo(v[p1]!.x, v[p1]!.y);
          ctx.lineTo(v[p2]!.x, v[p2]!.y);
          ctx.stroke();
        });

        // Camera module wireframe
        const c1 = project(-pw / 4, -ph / 2.2, pd / 2);
        const c2 = project(pw / 4, -ph / 2.2, pd / 2);
        const c3 = project(pw / 4, -ph / 4, pd / 2);
        const c4 = project(-pw / 4, -ph / 4, pd / 2);
        ctx.strokeStyle = "#a855f7";
        ctx.beginPath();
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineTo(c3.x, c3.y);
        ctx.lineTo(c4.x, c4.y);
        ctx.closePath();
        ctx.stroke();
      } else {
        // Shaded polygon surfaces
        const faces = [
          { pts: [0, 1, 2, 3], color: "#1e293b", normalZ: -cos }, // Back
          { pts: [4, 5, 6, 7], color: selectedColor.hex || "#090d16", normalZ: cos }, // Front
          { pts: [0, 1, 5, 4], color: "#334155", normalZ: 0 }, // Top
          { pts: [3, 2, 6, 7], color: "#0f172a", normalZ: 0 }, // Bottom
          { pts: [0, 3, 7, 4], color: "#1e293b", normalZ: -sin }, // Left
          { pts: [1, 2, 6, 5], color: "#475569", normalZ: sin }, // Right
        ];

        // Sort faces from back to front
        faces.sort((a, b) => {
          const zA = a.pts.reduce((sum, i) => sum + v[i]!.z, 0) / 4;
          const zB = b.pts.reduce((sum, i) => sum + v[i]!.z, 0) / 4;
          return zB - zA;
        });

        faces.forEach((face) => {
          ctx.beginPath();
          ctx.moveTo(v[face.pts[0]!]!.x, v[face.pts[0]!]!.y);
          for (let i = 1; i < face.pts.length; i++) {
            ctx.lineTo(v[face.pts[i]!]!.x, v[face.pts[i]!]!.y);
          }
          ctx.closePath();

          ctx.fillStyle = face.color;
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // If front face is visible, draw glowing bezel & UI lines
          if (face.pts[0] === 4 && face.normalZ > -0.2) {
            ctx.fillStyle = "#0284c7";
            ctx.font = "bold 11px monospace";
            ctx.fillText("NEXOS TITANIUM", v[4]!.x + 12, v[4]!.y + 35);
          }
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [is3DMode, isAutoRotating, isWireframe, rotationAngle, selectedColor]);

  const activeImage = galleryImages[activeImageIndex] || galleryImages[0]!;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Showcase Viewport */}
      <div className="relative aspect-square w-full rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-[#0a0f1d] to-[#070b14] overflow-hidden group shadow-2xl flex items-center justify-center p-6">
        {/* Subtle cyber grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Ambient Finish Glow */}
        <div
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-[100px] opacity-25 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: selectedColor.hex }}
        />

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-[10px] font-mono font-semibold text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            {product.series}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-950/60 border border-slate-800 text-[10px] font-mono text-slate-400">
            Finish: {selectedColor.name}
          </span>
        </div>

        {/* 3D Mode / Zoom Toggle Buttons */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {product.model3D?.enabled && (
            <button
              type="button"
              onClick={() => setIs3DMode(!is3DMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-lg backdrop-blur-md ${
                is3DMode
                  ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/30"
                  : "bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white hover:border-slate-600"
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
              </svg>
              <span>{is3DMode ? "Photo Mode" : "3D Studio"}</span>
            </button>
          )}

          {!is3DMode && (
            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-400 hover:text-white backdrop-blur-md transition-colors"
              title="Expand View"
              aria-label="Expand image"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3-3H7" />
              </svg>
            </button>
          )}
        </div>

        {/* Content Display: 3D Holographic Canvas OR High-Res Photo */}
        {is3DMode ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <canvas
              ref={canvasRef}
              width={420}
              height={420}
              className="w-full max-w-[380px] h-auto cursor-grab active:cursor-grabbing"
              onMouseDown={() => setIsAutoRotating(false)}
              onMouseUp={() => setIsAutoRotating(true)}
            />

            {/* 3D Studio Controls Toolbar */}
            <div className="absolute bottom-4 inset-x-6 flex items-center justify-between p-2 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-lg text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                    isAutoRotating
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isAutoRotating ? "Auto Orbit ON" : "Orbit Paused"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsWireframe(!isWireframe)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                    isWireframe
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isWireframe ? "Wireframe" : "Shaded Mesh"}
                </button>
              </div>

              <div className="text-[10px] font-mono text-slate-500 hidden sm:block">
                {product.model3D.polygonCount?.toLocaleString() || "52,400"} Polys • {product.model3D.fileFormat.toUpperCase()}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
            <Image
              src={activeImage.url}
              alt={`${product.name} - ${activeImage.label}`}
              fill
              unoptimized
              priority
              className="object-contain p-6 drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)]"
            />
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      <div className="grid grid-cols-4 gap-3">
        {galleryImages.map((img, idx) => {
          const isSelected = activeImageIndex === idx && !is3DMode;
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                setActiveImageIndex(idx);
                setIs3DMode(false);
              }}
              className={`group relative aspect-square rounded-2xl border p-2 bg-slate-900/60 overflow-hidden transition-all flex flex-col items-center justify-center ${
                isSelected
                  ? "border-cyan-500 ring-2 ring-cyan-500/30 bg-slate-900"
                  : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={img.url}
                  alt={img.label}
                  fill
                  unoptimized
                  className="object-contain p-1 opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <span className="absolute bottom-1.5 inset-x-1 text-[9px] font-mono font-medium text-slate-400 truncate text-center bg-slate-950/80 px-1 py-0.5 rounded">
                {img.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl w-full h-[80vh] flex items-center justify-center">
            <Image
              src={activeImage.url}
              alt={activeImage.label}
              fill
              unoptimized
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute top-2 right-2 p-3 rounded-full bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700 transition-all"
              aria-label="Close zoom"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGallery3D;
