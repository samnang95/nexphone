"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import type { PhoneProduct, ColorOption } from "@/types/product";

export interface PhoneViewer3DProps {
  product: PhoneProduct;
  initialColor?: ColorOption;
  onColorChange?: (color: ColorOption) => void;
  className?: string;
  enableFullscreen?: boolean;
}

export type LightingPreset = "cyber" | "studio" | "stealth" | "golden";
export type RenderMode = "shaded" | "wireframe" | "exploded";

export function PhoneViewer3D({
  product,
  initialColor,
  onColorChange,
  className = "",
  enableFullscreen = true,
}: PhoneViewer3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active finish state
  const [activeColor, setActiveColor] = useState<ColorOption>(
    initialColor || product.colors[0] || {
      id: "default",
      name: "Titanium Space Gray",
      hex: "#2b2d42",
      inStock: true,
    }
  );

  // Viewer controls state
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 50% - 250%
  const [lightingMode, setLightingMode] = useState<LightingPreset>("cyber");
  const [renderMode, setRenderMode] = useState<RenderMode>("shaded");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orbitAngles, setOrbitAngles] = useState({ yaw: 25, pitch: 10 });
  const [fps, setFps] = useState(60);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const phoneGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<{
    chassis?: THREE.MeshStandardMaterial;
    backGlass?: THREE.MeshStandardMaterial;
    cameraIsland?: THREE.MeshStandardMaterial;
    screen?: THREE.MeshBasicMaterial;
    wireframe?: THREE.MeshBasicMaterial;
    ring?: THREE.MeshStandardMaterial;
  }>({});
  const partsRef = useRef<{
    screen?: THREE.Mesh;
    chassis?: THREE.Mesh;
    processor?: THREE.Mesh;
    backPlate?: THREE.Mesh;
    cameraGroup?: THREE.Group;
  }>({});
  const lightsRef = useRef<{
    keyLight?: THREE.DirectionalLight;
    fillLight?: THREE.DirectionalLight;
    rimLight?: THREE.PointLight;
    ambient?: THREE.AmbientLight;
  }>({});

  // Interaction tracking refs
  const interactionRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    targetYaw: 25,
    targetPitch: 10,
    currentYaw: 25,
    currentPitch: 10,
    targetZoom: 1,
    currentZoom: 1,
    lastFrameTime: 0,
    frameCount: 0,
    fpsTimer: 0,
  });

  // Handle color change
  const handleSelectColor = (color: ColorOption) => {
    setActiveColor(color);
    if (onColorChange) onColorChange(color);

    const mats = materialsRef.current;
    if (mats.chassis) {
      mats.chassis.color.set(color.hex);
    }
    if (mats.backGlass) {
      mats.backGlass.color.set(color.hex);
    }
    if (mats.cameraIsland) {
      mats.cameraIsland.color.set(color.hex);
    }
  };

  // Helper to create Screen UI Texture
  const createScreenTexture = useCallback((name: string, series: string): THREE.CanvasTexture => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Wallpaper gradient
      const grad = ctx.createLinearGradient(0, 0, 512, 1024);
      grad.addColorStop(0, "#080c14");
      grad.addColorStop(0.3, "#0d1829");
      grad.addColorStop(0.7, "#06233d");
      grad.addColorStop(1, "#030712");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 1024);

      // Glowing circuit lines
      ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(256, 450, 180, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(99, 102, 241, 0.2)";
      ctx.beginPath();
      ctx.arc(256, 450, 220, 0, Math.PI * 2);
      ctx.stroke();

      // Top Status Bar
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px monospace";
      ctx.fillText("09:41", 40, 50);
      ctx.fillText("5G • 100%", 380, 50);

      // Clock
      ctx.font = "bold 96px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("09:41", 256, 260);

      // Date
      ctx.font = "500 24px system-ui, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Friday, October 9", 256, 310);

      // NexOS Brand Emblem
      ctx.fillStyle = "#06b6d4";
      ctx.font = "bold 28px monospace";
      ctx.fillText("NEXOS 4.0 TITANIUM", 256, 680);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "18px system-ui, sans-serif";
      ctx.fillText(`${name} • ${series}`, 256, 720);

      // Bottom unlock bar
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      ctx.roundRect(176, 960, 160, 6, 3);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // 4. Studio Lighting setup
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0x06b6d4, 2.2);
    keyLight.position.set(5, 5, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x818cf8, 1.4);
    fillLight.position.set(-5, -2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 2.0, 15);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    lightsRef.current = { keyLight, fillLight, rimLight, ambient };

    // 5. Build procedural 3D NexPhone Model
    const phoneGroup = new THREE.Group();
    phoneGroupRef.current = phoneGroup;
    scene.add(phoneGroup);

    // Phone dimensions (scaled in Three.js units)
    const pw = 2.1;
    const ph = 4.2;
    const pd = 0.22;

    // A. Titanium Unibody Chassis
    const chassisGeo = new THREE.BoxGeometry(pw, ph, pd);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(activeColor.hex),
      metalness: 0.85,
      roughness: 0.25,
      envMapIntensity: 1.2,
    });
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    phoneGroup.add(chassisMesh);
    partsRef.current.chassis = chassisMesh;
    materialsRef.current.chassis = chassisMat;

    // B. Front OLED Display Screen
    const screenGeo = new THREE.PlaneGeometry(pw - 0.12, ph - 0.16);
    const screenTexture = createScreenTexture(product.name, String(product.series));
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0, pd / 2 + 0.005);
    phoneGroup.add(screenMesh);
    partsRef.current.screen = screenMesh;
    materialsRef.current.screen = screenMat;

    // C. Internal NexCore AI Chipset (Visible during Exploded View)
    const procGeo = new THREE.BoxGeometry(pw - 0.4, ph - 0.6, 0.05);
    const procMat = new THREE.MeshStandardMaterial({
      color: 0x050914,
      metalness: 0.9,
      roughness: 0.2,
    });
    const procMesh = new THREE.Mesh(procGeo, procMat);
    procMesh.position.set(0, 0, 0);
    phoneGroup.add(procMesh);
    partsRef.current.processor = procMesh;

    // D. Rear Frosted Ceramic / Glass Backplate
    const backGeo = new THREE.PlaneGeometry(pw - 0.08, ph - 0.08);
    const backMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(activeColor.hex),
      metalness: 0.4,
      roughness: 0.35,
    });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.rotation.y = Math.PI;
    backMesh.position.set(0, 0, -(pd / 2 + 0.005));
    phoneGroup.add(backMesh);
    partsRef.current.backPlate = backMesh;
    materialsRef.current.backGlass = backMat;

    // E. Camera Module Array (Back top-left)
    const cameraGroup = new THREE.Group();
    cameraGroup.position.set(-0.48, 1.25, -(pd / 2 + 0.03));
    phoneGroup.add(cameraGroup);
    partsRef.current.cameraGroup = cameraGroup;

    // Camera Island Base Plate
    const islandGeo = new THREE.BoxGeometry(0.85, 1.25, 0.06);
    const islandMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(activeColor.hex),
      metalness: 0.8,
      roughness: 0.3,
    });
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    cameraGroup.add(islandMesh);
    materialsRef.current.cameraIsland = islandMat;

    // Lenses
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.15,
    });
    materialsRef.current.ring = ringMat;

    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x020617,
      metalness: 0.95,
      roughness: 0.05,
    });

    const createLens = (x: number, y: number, r: number) => {
      const lensGroup = new THREE.Group();
      lensGroup.position.set(x, y, -0.04);
      lensGroup.rotation.x = Math.PI / 2;

      // Outer bezel ring
      const ringGeo = new THREE.CylinderGeometry(r + 0.04, r + 0.04, 0.06, 32);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      lensGroup.add(ring);

      // Inner optic element
      const opticGeo = new THREE.CylinderGeometry(r, r, 0.065, 32);
      const optic = new THREE.Mesh(opticGeo, lensMat);
      lensGroup.add(optic);

      return lensGroup;
    };

    cameraGroup.add(createLens(0, 0.34, 0.22)); // Main wide
    cameraGroup.add(createLens(0, -0.22, 0.20)); // Telephoto optical
    cameraGroup.add(createLens(0.24, 0.06, 0.14)); // Ultra-wide

    // Flash Diode
    const flashGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const flashMesh = new THREE.Mesh(flashGeo, flashMat);
    flashMesh.position.set(-0.22, 0.06, -0.03);
    flashMesh.rotation.x = Math.PI / 2;
    cameraGroup.add(flashMesh);

    // F. Side Buttons
    const buttonMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.9,
      roughness: 0.2,
    });
    // Power button (Right)
    const powerGeo = new THREE.BoxGeometry(0.04, 0.45, 0.06);
    const powerBtn = new THREE.Mesh(powerGeo, buttonMat);
    powerBtn.position.set(pw / 2 + 0.02, 0.4, 0);
    phoneGroup.add(powerBtn);

    // Volume Rockers (Left)
    const volUp = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.06), buttonMat);
    volUp.position.set(-(pw / 2 + 0.02), 0.7, 0);
    phoneGroup.add(volUp);

    const volDown = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.06), buttonMat);
    volDown.position.set(-(pw / 2 + 0.02), 0.25, 0);
    phoneGroup.add(volDown);

    // G. Radial Shadow Plane under the phone
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext("2d");
    if (sCtx) {
      const sGrad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
      sGrad.addColorStop(0, "rgba(0,0,0,0.6)");
      sGrad.addColorStop(1, "rgba(0,0,0,0)");
      sCtx.fillStyle = sGrad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.7,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -2.6, 0);
    scene.add(shadowMesh);

    // 6. Animation and Render Loop
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const state = interactionRef.current;
      const now = performance.now();

      // FPS tracking
      state.frameCount++;
      if (now - state.fpsTimer >= 1000) {
        setFps(state.frameCount);
        state.frameCount = 0;
        state.fpsTimer = now;
      }

      // Auto rotation
      if (isAutoRotating && !state.isDragging) {
        state.targetYaw += 0.45 * rotationSpeed;
      }

      // Smooth interpolation (lerp) for rotation
      state.currentYaw += (state.targetYaw - state.currentYaw) * 0.08;
      state.currentPitch += (state.targetPitch - state.currentPitch) * 0.08;

      phoneGroup.rotation.y = (state.currentYaw * Math.PI) / 180;
      phoneGroup.rotation.x = (state.currentPitch * Math.PI) / 180;

      // Update HUD angles display periodically
      const normYaw = Math.round(((state.currentYaw % 360) + 360) % 360);
      const normPitch = Math.round(state.currentPitch);
      setOrbitAngles({ yaw: normYaw, pitch: normPitch });

      // Smooth interpolation for zoom
      state.currentZoom += (state.targetZoom - state.currentZoom) * 0.1;
      camera.position.z = 7 / state.currentZoom;

      // Handle Exploded View separation
      const isExploded = renderMode === "exploded";
      const parts = partsRef.current;
      const targetSep = isExploded ? 0.9 : 0;

      if (parts.screen) {
        parts.screen.position.z = THREE.MathUtils.lerp(
          parts.screen.position.z,
          pd / 2 + 0.005 + targetSep * 0.8,
          0.08
        );
      }
      if (parts.backPlate) {
        parts.backPlate.position.z = THREE.MathUtils.lerp(
          parts.backPlate.position.z,
          -(pd / 2 + 0.005 + targetSep * 0.8),
          0.08
        );
      }
      if (parts.cameraGroup) {
        parts.cameraGroup.position.z = THREE.MathUtils.lerp(
          parts.cameraGroup.position.z,
          -(pd / 2 + 0.03 + targetSep * 1.3),
          0.08
        );
      }
      if (parts.processor) {
        parts.processor.position.z = THREE.MathUtils.lerp(
          parts.processor.position.z,
          targetSep * 0.3,
          0.08
        );
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [activeColor.hex, createScreenTexture, isAutoRotating, product.name, product.series, renderMode, rotationSpeed]);

  // Lighting Mode effect
  useEffect(() => {
    const lights = lightsRef.current;
    if (!lights.keyLight || !lights.fillLight || !lights.ambient) return;

    switch (lightingMode) {
      case "cyber":
        lights.keyLight.color.set(0x06b6d4); // Cyan
        lights.keyLight.intensity = 2.4;
        lights.fillLight.color.set(0x8b5cf6); // Purple
        lights.fillLight.intensity = 1.6;
        lights.ambient.color.set(0x1e293b);
        lights.ambient.intensity = 0.8;
        break;
      case "studio":
        lights.keyLight.color.set(0xffffff); // Neutral 5600K
        lights.keyLight.intensity = 2.2;
        lights.fillLight.color.set(0xe2e8f0);
        lights.fillLight.intensity = 1.5;
        lights.ambient.color.set(0xffffff);
        lights.ambient.intensity = 0.9;
        break;
      case "golden":
        lights.keyLight.color.set(0xf59e0b); // Amber
        lights.keyLight.intensity = 2.6;
        lights.fillLight.color.set(0xd97706);
        lights.fillLight.intensity = 1.2;
        lights.ambient.color.set(0x451a03);
        lights.ambient.intensity = 0.7;
        break;
      case "stealth":
        lights.keyLight.color.set(0x64748b);
        lights.keyLight.intensity = 1.4;
        lights.fillLight.color.set(0x0f172a);
        lights.fillLight.intensity = 0.8;
        lights.ambient.color.set(0x020617);
        lights.ambient.intensity = 0.4;
        break;
    }
  }, [lightingMode]);

  // Wireframe toggle effect
  useEffect(() => {
    const chassis = partsRef.current.chassis;
    if (!chassis) return;

    if (renderMode === "wireframe") {
      chassis.material = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        wireframe: true,
      });
    } else {
      if (materialsRef.current.chassis) {
        chassis.material = materialsRef.current.chassis;
      }
    }
  }, [renderMode]);

  // Mouse & Touch Drag Event Handlers for 360° Rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    interactionRef.current.isDragging = true;
    interactionRef.current.prevX = e.clientX;
    interactionRef.current.prevY = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactionRef.current.isDragging) return;
    const deltaX = e.clientX - interactionRef.current.prevX;
    const deltaY = e.clientY - interactionRef.current.prevY;

    interactionRef.current.prevX = e.clientX;
    interactionRef.current.prevY = e.clientY;

    interactionRef.current.targetYaw += deltaX * 0.6;
    interactionRef.current.targetPitch += deltaY * 0.4;

    // Clamp pitch to prevent unnatural vertical flipping
    interactionRef.current.targetPitch = Math.max(
      -75,
      Math.min(75, interactionRef.current.targetPitch)
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    interactionRef.current.isDragging = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Mousewheel Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.0015;
    applyZoom(interactionRef.current.targetZoom + zoomDelta);
  };

  const applyZoom = (newZoom: number) => {
    const clamped = Math.max(0.5, Math.min(2.5, newZoom));
    interactionRef.current.targetZoom = clamped;
    setZoomLevel(Math.round(clamped * 100));
  };

  // Preset Angle Selection
  const setPresetAngle = (yaw: number, pitch: number) => {
    interactionRef.current.targetYaw = yaw;
    interactionRef.current.targetPitch = pitch;
    setIsAutoRotating(false);
  };

  // Take Snapshot
  const handleSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${product.slug}-${activeColor.name.toLowerCase().replace(/\s+/g, "-")}-3d.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[580px] rounded-3xl border border-slate-800 bg-[#080c14] overflow-hidden select-none flex flex-col justify-between shadow-2xl ${className} ${
        isFullscreen ? "!fixed !inset-0 !z-50 !h-screen !w-screen !rounded-none" : ""
      }`}
    >
      {/* Three.js Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none z-0"
      />

      {/* Ambient Radial Color Underglow */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] opacity-25 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: activeColor.hex }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[140px] opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: activeColor.hex }}
      />

      {/* Top HUD: Hardware Info, 360 Status & Fullscreen */}
      <div className="relative z-10 p-5 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              360° Studio
            </span>
            <span className="text-xs font-mono text-slate-400">
              {product.model3D.polygonCount?.toLocaleString() || "52,400"} Polys
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {fps} FPS
            </span>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400">
            Chassis: <strong className="text-white">{activeColor.name}</strong>
          </p>
        </div>

        {/* View Mode & Utility Actions */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Snapshot Button */}
          <button
            type="button"
            onClick={handleSnapshot}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 backdrop-blur-md transition-colors"
            title="Download PNG snapshot"
            aria-label="Capture 3D snapshot"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Fullscreen Toggle */}
          {enableFullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 backdrop-blur-md transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Studio"}
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 0m-5 0l0 5m11-5l5 0m0 0l0 5m0-5l-5 5m5 11l0-5m0 5l-5 0m5 0l-5-5m-11 5l5 0m-5 0l0-5m0 5l5-5" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Middle Floating HUD: Rotation Coordinates */}
      <div className="relative z-10 px-5 pointer-events-none flex items-center justify-between">
        <div className="text-[10px] font-mono text-slate-500 bg-slate-950/70 border border-slate-800/80 px-2.5 py-1 rounded-lg backdrop-blur-md">
          Yaw: {orbitAngles.yaw}° • Pitch: {orbitAngles.pitch}°
        </div>

        {/* Zoom Controls Overlay */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 border border-slate-800/90 p-1 rounded-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => applyZoom(interactionRef.current.targetZoom - 0.25)}
            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-colors"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => applyZoom(1)}
            className="px-2 h-7 flex items-center justify-center text-[11px] font-mono font-bold text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset Zoom to 100%"
          >
            {zoomLevel}%
          </button>
          <button
            type="button"
            onClick={() => applyZoom(interactionRef.current.targetZoom + 0.25)}
            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-colors"
            title="Zoom In"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>

      {/* Bottom Control Deck: Color Picker, Angle Presets & Render Modes */}
      <div className="relative z-10 p-5 space-y-3 pointer-events-auto bg-gradient-to-t from-[#080c14] via-[#080c14]/90 to-transparent">
        {/* Color Finish Picker (Requirement 3: Change color) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Finish:</span>
            <div className="flex items-center gap-2">
              {product.colors.map((color) => {
                const isSelected = color.id === activeColor.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleSelectColor(color)}
                    className={`relative w-6 h-6 rounded-full border transition-all ${
                      isSelected
                        ? "border-cyan-400 ring-2 ring-cyan-400/40 scale-125"
                        : "border-slate-700 hover:scale-110"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={`${color.name} (${color.hex})`}
                    aria-label={`Select ${color.name}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Quick View Presets (Requirement 1: Rotate 360°) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setPresetAngle(0, 0)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              Front
            </button>
            <button
              type="button"
              onClick={() => setPresetAngle(180, 0)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              Back Optics
            </button>
            <button
              type="button"
              onClick={() => setPresetAngle(90, 0)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => setPresetAngle(45, 20)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              Isometric
            </button>
          </div>
        </div>

        {/* Studio Lighting & Render Mode Options (Requirement 4: Interactive 3D model) */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Auto Rotate & Speed */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-semibold border transition-all ${
                isAutoRotating
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {isAutoRotating ? "Auto Orbit 360° ON" : "Orbit Paused"}
            </button>

            {isAutoRotating && (
              <button
                type="button"
                onClick={() => setRotationSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1))}
                className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-mono text-[10px]"
                title="Change orbit speed"
              >
                {rotationSpeed}x
              </button>
            )}
          </div>

          {/* Render Mode Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800/90 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setRenderMode("shaded")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                renderMode === "shaded"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Shaded
            </button>
            <button
              type="button"
              onClick={() => setRenderMode("wireframe")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                renderMode === "wireframe"
                  ? "bg-purple-500 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Wireframe
            </button>
            <button
              type="button"
              onClick={() => setRenderMode("exploded")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                renderMode === "exploded"
                  ? "bg-indigo-500 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Exploded
            </button>
          </div>

          {/* Studio Lighting Environment */}
          <div className="flex items-center gap-1">
            {(["cyber", "studio", "golden", "stealth"] as LightingPreset[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setLightingMode(mode)}
                className={`px-2 py-1 rounded-lg capitalize text-[10px] font-mono transition-colors ${
                  lightingMode === mode
                    ? "bg-slate-800 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhoneViewer3D;
