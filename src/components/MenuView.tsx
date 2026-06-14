import React, { useState } from 'react';
import { Search, Star, Clock, Filter, Plus, QrCode, Sparkles, X, ShoppingBag } from 'lucide-react';
import { MenuItem } from '../types';
import { QRCodeSVG } from './QRScannerView';
import { motion, AnimatePresence } from 'motion/react';

interface MenuViewProps {
  menuItems: MenuItem[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onSelectItem: (item: MenuItem) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenQrScanner?: () => void;
  onDirectScanAdd?: (item: MenuItem) => void;
}

const CATEGORIES_LIST = [
  'All',
  'Bunny Chow',
  'Vetkoek',
  'Shwamma',
  'Burgers',
  'Pizza',
  'Desserts',
  'Beverages'
];

export default function MenuView({
  menuItems,
  selectedCategory,
  setSelectedCategory,
  onSelectItem,
  searchQuery,
  setSearchQuery,
  onOpenQrScanner,
  onDirectScanAdd,
}: MenuViewProps) {
  const [activeQrItem, setActiveQrItem] = useState<MenuItem | null>(null);
  const [localToast, setLocalToast] = useState<string>('');
  const [laserPos, setLaserPos] = useState<number>(0);
  const [isFlaring, setIsFlaring] = useState<boolean>(false);

  // Laser effect interval inside the active item QR tag modal
  React.useEffect(() => {
    if (!activeQrItem) return;
    const interval = setInterval(() => {
      setLaserPos(p => p >= 100 ? 0 : p + 4);
    }, 50);
    return () => clearInterval(interval);
  }, [activeQrItem]);

  // Synthesize instant feedback QR success audio Beep (Web Audio API) & Tactile Vibration
  const playScanFeed = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        
        // Read dynamic volume from settings registry
        const savedVol = localStorage.getItem('lekker_sound_volume');
        const volMultiplier = savedVol !== null ? parseInt(savedVol, 10) / 100 : 0.8;

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
        // Triple high-speed pleasant feedback telemetry chime sequence
        playTone(1350, 0, 0.06);
        playTone(1650, 0.05, 0.06);
        playTone(2100, 0.10, 0.15);
      }
    } catch (err) {
      console.warn('Audio synthesis neglected:', err);
    }

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate([60, 40, 150, 50, 200]);
      }
    } catch (ve) {}
  };

  const handleQrTagImmediateScan = (item: MenuItem) => {
    if (isFlaring) return;
    
    // Set flaring state immediately to trigger cinematic visual flare & bypass double taps
    setIsFlaring(true);
    playScanFeed();
    
    // Smooth delay before committing item to local cart to make scanner response feel authentic and satisfying
    setTimeout(() => {
      if (onDirectScanAdd) {
        onDirectScanAdd(item);
      }
      
      // Set feedback toast
      setLocalToast(`"${item.name}" scanned & auto-added to cart! 🛒`);
      setActiveQrItem(null); // dismiss QR popover tag
      setIsFlaring(false);
      
      setTimeout(() => {
        setLocalToast('');
      }, 2800);
    }, 550); // 550ms satisfying sensory delay
  };
  
  // Filter by category and search query
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div id="menu-view-container" className="flex flex-col p-4 pb-12 w-full text-white space-y-4">
      {/* Search & Filter Header bar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 group">
          <input
            type="text"
            placeholder="Search our menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 bg-[#120a06]/90 border border-orange-500/15 rounded-xl text-[11px] text-neutral-200 placeholder-neutral-500 outline-none focus:border-amber-500/50 transition-colors font-medium"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-400" />
        </div>
        {onOpenQrScanner && (
          <button
            onClick={onOpenQrScanner}
            title="Scan Store Tag"
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-neutral-950 flex items-center justify-center cursor-pointer transform hover:scale-103 active:scale-97 shadow-md transition-transform shrink-0"
          >
            <QrCode size={15} />
          </button>
        )}
        <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/5 flex items-center justify-center text-amber-500 shrink-0">
          <Filter size={14} />
        </div>
      </div>

      {/* Horizontal categories floating pill header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x select-none shrink-0">
        {CATEGORIES_LIST.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'zest-gradient-bg text-neutral-950 font-extrabold shadow-md'
                : 'bg-neutral-950/80 text-neutral-400 hover:text-neutral-200 border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Category header title */}
      <div className="flex justify-between items-center text-neutral-400 px-0.5">
        <span className="text-[10px] uppercase tracking-wider font-mono font-bold">
          {selectedCategory} Items ({filteredItems.length})
        </span>
        <span className="text-[10px] font-mono tracking-wider">Prices in ZAR (R)</span>
      </div>

      {/* Standard dynamic scrolling single column list */}
      <div className="space-y-3.5">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-neutral-550 space-y-2">
            <span className="text-3xl block">🍽️🔍</span>
            <p className="text-neutral-500 text-xs">No mouthwatering matches found for "{searchQuery}"</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="text-xs text-amber-400 underline font-semibold focus:outline-none"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="group flex gap-3.5 glass-panel-interactive rounded-2xl p-3.5 cursor-pointer transition-all active:scale-[0.99]"
            >
              {/* Image side with floating popularity ribbon */}
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-neutral-800 shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                {item.popular && (
                  <span className="absolute bottom-1 left-1 bg-gradient-to-r from-red-600 to-orange-500 text-[8px] font-black font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm text-white">
                    POPULAR
                  </span>
                )}
              </div>

              {/* Text metadata details */}
              <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-neutral-400 line-clamp-2 leading-tight">
                    {item.description}
                  </p>
                </div>

                {/* Bottom line: rating, time & Price block */}
                <div className="flex gap-2 items-center justify-between mt-2 pt-1.5 border-t border-white/5">
                  <div className="flex items-center gap-2.5 text-[9px] font-mono text-neutral-500">
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star size={9.5} className="fill-amber-400 glow-amber-soft" />
                      <span>{item.rating}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={10} />
                      <span>{item.preparationTime}m</span>
                    </span>
                  </div>

                  {/* Price bubble and clickable custom action button */}
                  <div className="flex items-center gap-2.5 pr-0.5">
                    <span className="text-xs font-black text-amber-400 font-mono glow-amber-soft">
                      R {item.price.toFixed(2)}
                    </span>
                    
                    {/* Unique In-Store QR code scan trigger */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent opening standard toppings selector modal
                        setActiveQrItem(item);
                      }}
                      title="Scan Mzansi Food Tag"
                      className="w-6 h-6 rounded-lg bg-neutral-950 border border-orange-500/25 text-amber-450 hover:bg-orange-500/10 hover:text-white flex items-center justify-center transition-all transform hover:scale-110 active:scale-90 shadow-sm"
                    >
                      <QrCode size={11} className="stroke-[2.5px]" />
                    </button>

                    <div className="w-[22px] h-[22px] rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center transform group-hover:scale-105 active:scale-95 transition-transform shadow-md shadow-orange-500/20 zest-gradient-bg">
                      <Plus size={12} className="stroke-[3.5px]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🟢 Floating Local Scan confirmation banner */}
      {localToast && (
        <div className="fixed bottom-24 left-4 right-4 p-3 bg-neutral-950 border border-emerald-500/50 rounded-2xl flex items-center gap-2.5 animate-[slide-up_0.2s_ease-out] z-50 shadow-2xl">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-lg">
            ✓
          </div>
          <span className="text-[10px] font-black text-white text-left tracking-wide flex-1">
            {localToast}
          </span>
        </div>
      )}

      {/* 🔮 Interactive In-Store QR Tag Laser Overlay Modal */}
      {activeQrItem && (
        <div id="active-meal-qr-modal" className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#120a06] border border-orange-500/20 rounded-3xl p-5 space-y-4 max-w-xs w-full text-center shadow-2xl animate-[scale-up_0.25s_ease-out]">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[8px] font-mono font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={10} className="animate-spin" />
                ZA-BITE EXCLUSIVE IN-STORE TAG
              </span>
              <button
                type="button"
                onClick={() => setActiveQrItem(null)}
                className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>

            <div className="space-y-1 text-left">
              <h4 className="text-xs font-black text-white uppercase">{activeQrItem.name}</h4>
              <p className="text-[10px] text-zinc-400 leading-tight line-clamp-2">{activeQrItem.description}</p>
              <p className="text-[10px] font-mono font-black text-amber-400 mt-1">R {activeQrItem.price.toFixed(2)}</p>
            </div>

            {/* Interactive Scanner QR Box */}
            <div
              onClick={() => handleQrTagImmediateScan(activeQrItem)}
              className={`relative group mx-auto p-4 bg-white/5 border rounded-2xl cursor-pointer w-[140px] h-[140px] flex items-center justify-center overflow-hidden transition-all shadow-inner select-none active:scale-95 ${
                isFlaring 
                  ? 'border-emerald-500/85 shadow-[0_0_25px_rgba(16,185,129,0.3)] bg-emerald-950/20 scale-[1.03]' 
                  : 'border-white/10 hover:border-amber-500/40'
              }`}
            >
              {/* Circular Progress Ring HUD framework */}
              <svg className="absolute w-32 h-32 pointer-events-none z-10" viewBox="0 0 100 100">
                {/* Ambient track ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  className="stroke-neutral-800/60"
                  strokeWidth="2.5"
                />
                
                {/* Active animated progress ring path */}
                {isFlaring ? (
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#progress-ring-gradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "264", strokeDashoffset: "264" }}
                    animate={{ strokeDashoffset: "0" }}
                    transition={{ duration: 0.55, ease: "easeInOut" }}
                    style={{ rotate: -90, transformOrigin: '50px 50px' }}
                  />
                ) : (
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    className="stroke-orange-500/15 group-hover:stroke-amber-500/35 transition-colors"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                )}
                
                <defs>
                  <linearGradient id="progress-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="60%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Animated success green/gold backdrop flash */}
              <AnimatePresence>
                {isFlaring && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: [1, 0.9, 0], scale: [1, 1.8, 2.5] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.52, ease: "easeOut" }}
                    className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-white to-emerald-500 pointer-events-none mix-blend-screen z-20 rounded-xl"
                  />
                )}
              </AnimatePresence>

              {/* Gentle ring pulse overlay during scanning success */}
              {isFlaring && (
                <div className="absolute w-24 h-24 rounded-full border-[3px] border-emerald-400 animate-[ping_0.5s_ease-out_infinite] opacity-60 z-15 pointer-events-none" />
              )}

              <div className={`transition-all duration-300 ${isFlaring ? 'scale-75 opacity-25 saturate-50 blur-xs' : ''}`}>
                <QRCodeSVG id={`menu-qr-${activeQrItem.id}`} value={`lekkerbites://product/${activeQrItem.id}`} size={100} />
              </div>
              
              {/* Animated HUD Laser Scanning Line - hides or goes hyperactive when flaring */}
              <div
                className={`absolute left-0 w-full h-[2px] shadow-[0_0_8px_#ea580c] transition-all pointer-events-none ${
                  isFlaring 
                    ? 'bg-emerald-400 h-[3px] shadow-[0_0_12px_#34d399] animate-bounce' 
                    : 'bg-orange-500/80 duration-75'
                }`}
                style={{ top: isFlaring ? '50%' : `${laserPos}%` }}
              />
              
              {/* Hover sweep cue overlay */}
              <div className={`absolute inset-x-0 bottom-1 text-center py-0.5 pointer-events-none transition-all duration-300 ${
                isFlaring 
                  ? 'bg-emerald-500 border-t border-emerald-400 font-extrabold text-[#060403] tracking-widest leading-normal animate-pulse shadow-md' 
                  : 'bg-black/85 backdrop-blur-xs text-white group-hover:bg-amber-500/95'
              }`}>
                <span className="text-[7.5px] font-mono font-black uppercase text-center block px-1">
                  {isFlaring ? '✓ SUCCESS SCANNED' : 'TAP TO SCAN CODE'}
                </span>
              </div>
            </div>

            <p className="text-[8.5px] text-neutral-400 leading-normal bg-neutral-950 p-2.5 rounded-xl border border-white/5 text-left">
              💡 Point a separate smartphone camera or QR reader at this tag, or simply <span className="text-amber-400 font-extrabold hover:underline">tap the QR code above</span> to simulate physical till-less instant checkout!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
