import React, { useState, useEffect, useRef } from 'react';
import { QrCode, X, Camera, Sparkles, Flame, CheckCircle2, ShoppingBag, ShieldCheck, HelpCircle, Laptop, Utensils, MessageSquare } from 'lucide-react';
import { MenuItem } from '../types';

interface QRScannerViewProps {
  onClose: () => void;
  menuItems: MenuItem[];
  onScanSuccess: (item: MenuItem, note?: string, keepOpen?: boolean) => void;
  cartCount?: number;
}

// Procedural SVG QR Code generator to draw clean finder patterns and deterministic data matrix
export const QRCodeSVG = ({ id, value, size = 120 }: { id: string; value: string; size?: number }) => {
  // Deterministic module generation based on a hash of the value string
  const getGrid = (val: string) => {
    let hash = 0;
    for (let i = 0; i < val.length; i++) {
      hash = val.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const grid: boolean[][] = [];
    const gridSize = 17; // simple 17x17 grid
    for (let r = 0; r < gridSize; r++) {
      grid[r] = [];
      for (let c = 0; c < gridSize; c++) {
        // Finder patterns in three corners (7x7 zones)
        const isTopLeftFinder = r < 7 && c < 7;
        const isTopRightFinder = r < 7 && c >= gridSize - 7;
        const isBottomLeftFinder = r >= gridSize - 7 && c < 7;
        
        if (isTopLeftFinder || isTopRightFinder || isBottomLeftFinder) {
          // Draw standard 7x7 finder border and center dot
          const localR = r < 7 ? r : r >= gridSize - 7 ? r - (gridSize - 7) : r;
          const localC = c < 7 ? c : c >= gridSize - 7 ? c - (gridSize - 7) : c;
          
          const isBorder = localR === 0 || localR === 6 || localC === 0 || localC === 6;
          const isCenter = localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4;
          grid[r][c] = isBorder || isCenter;
        } else {
          // Generate pseudo-random matrix blocks deterministically using the hash
          const bitIndex = r * gridSize + c;
          const noise = Math.sin(hash + bitIndex) * 10000;
          grid[r][c] = (noise - Math.floor(noise)) > 0.46;
        }
      }
    }
    return grid;
  };

  const grid = getGrid(value);
  const scale = size / 17;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-white p-1 rounded-lg shadow-md border border-neutral-200">
      <g>
        {grid.map((row, r) =>
          row.map((col, c) => (
            col ? (
              <rect
                key={`${id}-${r}-${c}`}
                x={c * scale}
                y={r * scale}
                width={scale + 0.1} // overlap slightly to prevent hairline gaps
                height={scale + 0.1}
                fill="#000000"
              />
            ) : null
          ))
        )}
      </g>
    </svg>
  );
};

export default function QRScannerView({ onClose, menuItems, onScanSuccess, cartCount = 0 }: QRScannerViewProps) {
  const [activeTab, setActiveTab ] = useState<'camera' | 'simulator'>('simulator');
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [scannedItem, setScannedItem] = useState<MenuItem | null>(null);
  const [confirmedItem, setConfirmedItem] = useState<MenuItem | null>(null);
  const [kitchenNote, setKitchenNote] = useState<string>('');
  const [laserPosition, setLaserPosition] = useState(0);

  // Instant Add to Cart options
  const [autoAddToCart, setAutoAddToCart] = useState<boolean>(true);
  const [justAddedNotify, setJustAddedNotify] = useState<MenuItem | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Synthesize instant feedback QR success audio Beep & physical device haptic vibration
  const playScanBeep = () => {
    // 🔊 Check Scan Sounds Toggle
    const soundsEnabled = localStorage.getItem('lekker_scan_sounds') !== 'false';
    if (soundsEnabled) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          
          // Read dynamic volume from settings registry
          const savedVol = localStorage.getItem('lekker_sound_volume');
          const volMultiplier = savedVol !== null ? parseInt(savedVol, 10) / 100 : 0.8;

          // Crisp high-speed cash register beep + scanner chime
          const playTone = (freq: number, start: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            gain.gain.setValueAtTime(0, ctx.currentTime + start);
            gain.gain.linearRampToValueAtTime(0.18 * volMultiplier, ctx.currentTime + start + 0.01);
            gain.gain.linearRampToValueAtTime(0.18 * volMultiplier, ctx.currentTime + start + duration - 0.02);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration);
            
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + duration);
          };

          // Dual pleasant chime
          playTone(1350, 0, 0.08);
          playTone(1750, 0.06, 0.12);
        }
      } catch (err) {
        console.warn('Audio synthesis neglected:', err);
      }
    }

    // 📳 Vibration: trigger mobile physical vibrator based on configured intensity level
    const hapticPref = localStorage.getItem('lekker_haptic_intensity') || 'medium';
    if (hapticPref !== 'off') {
      try {
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
          if (hapticPref === 'low') {
            navigator.vibrate(40);
          } else if (hapticPref === 'medium') {
            navigator.vibrate([90, 50, 90]);
          } else if (hapticPref === 'high') {
            navigator.vibrate([150, 50, 150, 50, 150]);
          }
        }
      } catch (ve) {
        console.warn('Vibration rejected:', ve);
      }
    }
  };

  // Laser scanner line animation loop
  useEffect(() => {
    const laserInterval = setInterval(() => {
      setLaserPosition((prev) => (prev >= 100 ? 0 : prev + 2.5));
    }, 40);
    return () => clearInterval(laserInterval);
  }, []);

  // WebRTC camera video stream acquisition
  const startCamera = async () => {
    stopCamera();
    try {
      setCameraPermission('prompt');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play delayed:', e));
      }
      setCameraPermission('granted');
    } catch (err) {
      console.error('Failed to acquire camera stream:', err);
      setCameraPermission('denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Clean initialization of media devices
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

  const handleSimulateScanItem = (item: MenuItem) => {
    if (scannedItem || confirmedItem) return; // Prevent double trigger scans

    playScanBeep();
    setScannedItem(item);

    // Dynamic delay to render scanning laser success line HUD before showing kitchen note modal
    setTimeout(() => {
      if (autoAddToCart) {
        onScanSuccess(item, 'Scanned via Table QR Code 📱', true);
        setJustAddedNotify(item);
        setScannedItem(null);
        setTimeout(() => {
          setJustAddedNotify(null);
        }, 2200);
      } else {
        setConfirmedItem(item);
        setScannedItem(null);
        setKitchenNote('');
      }
    }, 910);
  };

  return (
    <div
      id="qr-scanner-overlay"
      className="absolute inset-0 bg-[#0c0705] z-50 flex flex-col justify-between font-sans text-white select-none overflow-hidden"
    >
      {/* Immersive Header */}
      <div className="bg-[#120a06]/95 border-b border-white/5 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-amber-500 shadow-md">
            <QrCode size={18} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-amber-500 uppercase tracking-widest font-black block text-left">Lekker Store Queues</span>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-black text-white tracking-tight uppercase">In-Store Queue QR Scanner</h1>
              {cartCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-neutral-955 font-mono text-[8px] font-black rounded-full animate-bounce shrink-0 shadow">
                  {cartCount} in Cart
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Mode selectors */}
      <div className="px-4 py-2 bg-[#080503] flex gap-2 border-b border-white/5">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex-1 py-1.5 rounded-xl text-[10px] uppercase font-bold tracking-wider border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'simulator'
              ? 'border-amber-500/60 bg-amber-500/10 text-amber-400 font-extrabold'
              : 'border-white/5 bg-white/5 text-neutral-400 hover:text-white'
          }`}
        >
          <Laptop size={12} />
          Digital Shelf Simulator
        </button>
        <button
          onClick={() => {
            setActiveTab('camera');
            startCamera();
          }}
          className={`flex-1 py-1.5 rounded-xl text-[10px] uppercase font-bold tracking-wider border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'camera'
              ? 'border-amber-500/60 bg-amber-500/10 text-amber-400 font-extrabold'
              : 'border-white/5 bg-white/5 text-neutral-400 hover:text-white'
          }`}
        >
          <Camera size={12} />
          Live Camera Feed
        </button>
      </div>

      {/* ⚙️ Dynamic QR Config Options Panel */}
      <div className="px-4 py-2 bg-[#120a06]/40 border-b border-white/5 flex items-center justify-between">
        <label className="text-[9.5px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoAddToCart}
            onChange={(e) => setAutoAddToCart(e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded border-white/10 bg-black cursor-pointer"
          />
          ⚡ Instant Add to Cart (Direct Queue Bypass)
        </label>
        <span className="text-[8px] font-mono text-amber-500 font-extrabold uppercase bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse">
          {autoAddToCart ? "Auto-Add active" : "Manual Customize"}
        </span>
      </div>

      {/* Main Viewport Screen */}
      <div className="flex-1 w-full bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-y-auto">
        {activeTab === 'camera' ? (
          <div className="w-full max-w-[280px] space-y-4 text-center my-auto">
            {/* Visual Viewport Wrapper */}
            <div className="relative w-full aspect-square max-w-[280px] bg-black rounded-3xl border-2 border-zinc-800/80 overflow-hidden shadow-2xl shadow-orange-500/5 mx-auto">
              
              {/* WebRTC Video Element */}
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* HUD alignment box overlays overlay */}
              <div className="absolute inset-0 border-[35px] border-black/60 flex items-center justify-center pointer-events-none">
                <div className="relative w-full h-full border-2 border-amber-500/50 rounded-xl flex items-center justify-center">
                  
                  {/* Corner alignment marks */}
                  <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-amber-400 rounded-tl" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-amber-400 rounded-tr" />
                  <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-amber-400 rounded-bl" />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-amber-400 rounded-br" />
                  
                  {/* Sweep Laser pointer line */}
                  <div
                    className="absolute left-0 w-full h-[2px] bg-orange-500/80 shadow-[0_0_8px_#ea580c] transition-all duration-75"
                    style={{ top: `${laserPosition}%` }}
                  />

                  {/* Laser glow flare */}
                  <div
                    className="absolute left-0 w-full h-8 bg-orange-600/10 blur-md pointer-events-none"
                    style={{ top: `calc(${laserPosition}% - 16px)` }}
                  />
                </div>
              </div>

              {/* Status prompt inside the reader block */}
              <div className="absolute bottom-1 w-full text-center pointer-events-none">
                <span className="text-[8px] bg-neutral-950/80 backdrop-blur border border-white/10 px-2 py-0.5 rounded text-neutral-350 tracking-wide">
                  {cameraPermission === 'denied' ? 'CANNOT ACCESS CAMERA' : 'ALIGN GAUTENG DISH TAG'}
                </span>
              </div>
            </div>

            {/* Verification & Access prompts */}
            {cameraPermission === 'denied' && (
              <div className="text-center p-3.5 bg-red-950/20 border border-red-500/30 rounded-2xl space-y-1.5 animate-fade-in mx-auto max-w-xs">
                <p className="text-xs text-red-400 font-extrabold font-sans">Camera Blocked or Unavailable</p>
                <p className="text-[9px] text-zinc-400 leading-relaxed">
                  Your browser or iframe sandbox has blocked media device access. Kindly utilize the <span className="text-amber-400 font-bold capitalize">"Digital Shelf Simulator"</span> tab to fully test adding items to your cart seamlessly!
                </p>
              </div>
            )}

            {cameraPermission === 'prompt' && (
              <p className="text-[10px] text-neutral-400">
                Grant camera credentials inside your browser tab to scan printed QR menus in our Pretoria store.
              </p>
            )}

            {cameraPermission === 'granted' && (
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-zinc-400 leading-relaxed">
                  📡 Live feed established. Point at any QR code on physical Lekker Bites printed tables.
                </p>
                {/* Simulated quick tap trigger during live camera if they want */}
                <button
                  onClick={() => handleSimulateScanItem(menuItems[0])}
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-[9px] font-mono text-amber-500 uppercase tracking-wider border border-white/5 cursor-pointer"
                >
                  ⚡ Simulate Scan Trigger
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Ticket Tag Grid Simulator View (Recruiter Masterpiece!) */
          <div className="w-full space-y-4 max-w-md my-auto">
            <div className="text-center space-y-1">
              <span className="text-[8.5px] uppercase font-mono tracking-widest text-amber-500 font-black">Skip cashiers queue at the till!</span>
              <h2 className="text-xs uppercase font-extrabold text-neutral-300">Tap Store shelf tickets below to simulate high-speed QR scanning:</h2>
            </div>

            {/* List of tag cards */}
            <div className="grid grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto px-1 py-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
              {menuItems.map((item) => (
                <div
                  key={`sim-item-${item.id}`}
                  onClick={() => handleSimulateScanItem(item)}
                  className="relative group p-3 rounded-2xl border border-white/5 bg-[#120a06]/40 hover:bg-[#180e09]/70 hover:border-amber-500/30 transform active:scale-95 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
                  style={{ minHeight: '185px' }}
                >
                  {/* Scanning scan overlays on item success */}
                  {scannedItem?.id === item.id && (
                    <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-xs flex flex-col items-center justify-center p-2 z-20 animate-fade-in">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-neutral-950 animate-bounce shadow-lg">
                        ✓
                      </div>
                      <span className="text-[9px] font-mono text-white tracking-widest font-extrabold uppercase mt-1.5 animate-pulse">SCANNED!</span>
                    </div>
                  )}

                  {/* QR Core Image vector */}
                  <div className="mx-auto my-1.5 relative shrink-0">
                    <QRCodeSVG id={item.id} value={`lekkerbites://product/${item.id}`} size={78} />
                    {/* Laser line effect during hover */}
                    <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-amber-500/40 opacity-0 group-hover:opacity-100 group-hover:animate-pulse pointer-events-none" />
                  </div>

                  {/* Item credentials */}
                  <div className="space-y-1 text-center pt-2">
                    <span className="text-[8px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/25 px-1.5 py-0.2 rounded uppercase">
                      {item.category}
                    </span>
                    <h4 className="text-[10px] font-black tracking-tight text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-amber-400 font-mono block">
                      R {item.price.toFixed(2)}
                    </span>
                    <span className="text-[7.5px] font-mono text-zinc-550 block font-bold tracking-widest uppercase">
                      TAP COURIER TAG
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scanned success pop banner */}
      {scannedItem && (
        <div className="mx-4 mb-3 p-3.5 bg-emerald-950/90 border border-emerald-500/40 rounded-2xl flex items-center gap-3 animate-[slide-up_0.3s_ease-out] z-30 shadow-2xl">
          <div className="w-9 h-9 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center text-lg font-black shrink-0 shadow-lg shadow-emerald-500/20">
            ✓
          </div>
          <div className="min-w-0 flex-1 leading-normal">
            <span className="text-[8px] font-mono text-emerald-400 font-black uppercase tracking-wider block">QUEUE RELIEVED SUCCESSFULLY</span>
            <p className="text-[11px] font-bold text-white line-clamp-1">{scannedItem.name}</p>
            <p className="text-[9px] text-zinc-400">Successfully scanned barcode & appending instructions...</p>
          </div>
        </div>
      )}

      {/* 🍲 NEW: Interactive Kitchen Instructions & Confirmation success modal */}
      {confirmedItem && (
        <div id="kitchen-note-confirm-modal" className="absolute inset-0 bg-[#060403]/90 backdrop-blur-md z-45 flex flex-col justify-end p-4 animate-fade-in select-none">
          <div className="bg-[#120a06] border border-orange-500/15 rounded-3xl p-5 space-y-4 w-full max-w-sm mx-auto shadow-2xl animate-[slide-up_0.3s_ease-out]">
            {/* Header / Product summary */}
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-amber-400 text-lg font-bold">
                  <Utensils size={20} />
                </div>
                <div className="min-w-0">
                  <span className="text-[8px] font-mono text-amber-500 uppercase tracking-widest font-black block">SCANNED SUCCESSFULLY</span>
                  <h3 className="text-xs font-black text-white uppercase truncate">{confirmedItem.name}</h3>
                  <p className="text-[10px] font-mono font-bold text-amber-400">R {confirmedItem.price.toFixed(2)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmedItem(null)}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>

            {/* Instruction input field */}
            <div className="space-y-2">
              <label className="text-[9px] font-mono font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare size={10} className="text-amber-500 animate-pulse" />
                Kitchen Instructions (Optional)
              </label>
              <textarea
                placeholder="E.g., extra spicy, sauce on the side, no cheese..."
                value={kitchenNote}
                onChange={(e) => setKitchenNote(e.target.value)}
                className="w-full min-h-[64px] rounded-xl bg-neutral-950 border border-white/5 p-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-500/40 transition-all font-medium resize-none"
              />
            </div>

            {/* Quick-tap presets suggestions */}
            <div className="space-y-1.5">
              <span className="text-[8px] font-mono text-zinc-500 uppercase font-bold block">Quick Option Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Extra Spicy 🌶️',
                  'Mild Spice 🧀',
                  'Sauce on Side 🍯',
                  'No Onions 🧅',
                  'Extra Gravy 🍯',
                  'Well Done 🔥'
                ].map((noteKey) => (
                  <button
                    key={`preset-${noteKey}`}
                    type="button"
                    onClick={() => {
                      if (kitchenNote.includes(noteKey)) {
                        setKitchenNote(prev => prev.replace(noteKey, '').trim().replace(/,\s*$/, ''));
                      } else {
                        setKitchenNote(prev => prev ? `${prev}, ${noteKey}` : noteKey);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-medium border cursor-pointer transition-all ${
                      kitchenNote.includes(noteKey)
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold'
                        : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {noteKey}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA controls */}
            <div className="grid grid-cols-2 gap-2 text-center text-[10px] uppercase font-bold pt-1">
              <button
                type="button"
                onClick={() => setConfirmedItem(null)}
                className="py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-450 cursor-pointer transition-colors"
              >
                Scan Another
              </button>
              <button
                type="button"
                onClick={() => {
                  onScanSuccess(confirmedItem, kitchenNote ? `${kitchenNote} (Bypass 📱)` : 'Queue Bypass 📱');
                  setConfirmedItem(null);
                  setKitchenNote('');
                }}
                className="py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-neutral-950 font-black cursor-pointer shadow-lg shadow-orange-500/15 hover:brightness-110 active:scale-97 transition-all"
              >
                Add To Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛒 Auto-Add confirmation floating alert toast */}
      {justAddedNotify && (
        <div className="absolute inset-x-4 bottom-24 p-3.5 bg-neutral-950 border border-emerald-500/40 rounded-3xl flex items-center gap-3 animate-[slide-up_0.2s_ease-out] z-50 shadow-2xl">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-neutral-950 flex items-center justify-center text-lg font-black shrink-0 shadow-lg shadow-emerald-500/20">
            <ShoppingBag size={18} />
          </div>
          <div className="min-w-0 flex-1 leading-normal text-left">
            <span className="text-[8px] font-mono text-emerald-400 font-extrabold uppercase tracking-wide block">AUTO-ADDED TO CART SUCCESSFULLY</span>
            <p className="text-[11px] font-bold text-white truncate">{justAddedNotify.name}</p>
            <p className="text-[9px] text-zinc-400">Scan beep & vibration triggered! Queue bypassed at R {justAddedNotify.price.toFixed(2)}!</p>
          </div>
          <div className="shrink-0 flex flex-col justify-center text-center">
            <span className="text-[10px] font-mono font-black text-amber-400">R {justAddedNotify.price.toFixed(2)}</span>
            <span className="text-[7px] text-neutral-500 font-mono">Qty: 1</span>
          </div>
        </div>
      )}

      {/* Detailed user-instructional foot footer */}
      <div className="p-4 bg-[#120a06]/95 border-t border-white/5 text-center space-y-2 select-none shadow-inner">
        <p className="text-[9px] text-neutral-400 max-w-xs mx-auto leading-normal">
          🇿🇦 Customers use store table QR codes to buy meals directly. No registers, no long cashier congestion! Standard card payment is processed inside the app.
        </p>
        <div className="flex justify-center items-center gap-1.5 text-[8px] font-mono text-zinc-500">
          <ShieldCheck size={10} className="text-emerald-500" />
          <span>EMV CAPTURE ENABLED</span>
          <span>•</span>
          <span>PCI DSS CERTIFIED</span>
        </div>
      </div>
    </div>
  );
}
