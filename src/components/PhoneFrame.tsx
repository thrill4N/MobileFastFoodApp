import React, { useState, useEffect } from 'react';
import { Home, Utensils, ShoppingBag, Award, MapPin, Wifi, Battery, Signal, MessageSquare, Settings } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: 'home' | 'menu' | 'cart' | 'loyalty' | 'tracking' | 'chatbot' | 'settings') => void;
  cartCount: number;
  hasActiveOrder: boolean;
  isAdminMode?: boolean;
  isCustomerAuthenticated?: boolean;
  showSplash?: boolean;
  theme?: 'light' | 'dark';
}

export default function PhoneFrame({
  children,
  activeTab,
  setActiveTab,
  cartCount,
  hasActiveOrder,
  isAdminMode = false,
  isCustomerAuthenticated = true,
  showSplash = false,
  theme = 'dark',
}: PhoneFrameProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="phone-shell-wrapper" className="flex flex-col items-center justify-center min-h-screen bg-[#070403] py-6 px-4 select-none relative overflow-hidden font-sans">
      {/* Background radial soft light blobs for glassmorphism aesthetic */}
      <div id="bg-glow-1" className="absolute -top-40 -left-40 w-120 h-120 bg-amber-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse duration-5000" />
      <div id="bg-glow-2" className="absolute -bottom-40 -right-40 w-120 h-120 bg-orange-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse duration-7000" />
      <div id="bg-glow-3" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/8 rounded-full blur-[170px] pointer-events-none" />

      {/* Brand Watermark / Title for the page wrapper */}
      <div id="brand-header-outer" className="hidden lg:flex flex-col items-center mb-4 text-center z-10 animate-fade-in">
        <h1 id="brand-title-outer" className="text-3.5xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <span className="zest-gradient-text font-sans">Lekker Bites</span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 font-mono tracking-widest uppercase border border-orange-500/30">Mzansi Gourmet</span>
        </h1>
        <p id="brand-tagline-outer" className="text-xs text-neutral-400 mt-1 max-w-sm">
          Interactive Flutter PWA Showcase for Gauteng Bunny Chows, Vetkoeks, Smashing Jozi Burgers & Traditional African cuisine.
        </p>
      </div>

      {/* Physical Phone Device Container */}
      <div
        id="phone-device-container"
        className={`relative w-full max-w-[412px] h-[844px] rounded-[52px] border-[10px] border-neutral-800 shadow-3xl flex flex-col overflow-hidden z-10 transition-transform duration-300 hover:scale-[1.01] ${theme === 'light' ? 'theme-light bg-[#faf8f5]' : 'bg-[#0c0705]'}`}
        style={{
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.95), inset 0 0 12px rgba(255, 158, 11, 0.08), 0 0 0 2px rgba(255,158,11,0.05)',
        }}
      >
        {/* Notch Speaker Sensor Panel */}
        <div id="phone-notch" className="absolute top-0 left-1/2 transform -translate-x-1/2 h-[30px] w-[140px] bg-neutral-800 rounded-b-[20px] z-50 flex items-center justify-center gap-1.5" style={{ top: '-1px' }}>
          <div id="speaker-pill" className="w-12 h-1 bg-neutral-950 rounded-full" />
          <div id="camera-lens" className="w-2.5 h-2.5 bg-[#121c2b] border border-neutral-700 rounded-full" />
        </div>

        {/* Dynamic Status Bar */}
        {!showSplash && (
          <div id="phone-status-bar" className="w-full h-11 px-6 pt-3 flex justify-between items-center text-xs font-semibold text-white/95 z-40 select-none bg-[#0c0705]/80 backdrop-blur-md border-b border-white/5">
            <span id="status-time" className="font-medium font-mono text-xs">{time}</span>
            <div id="status-icons" className="flex items-center gap-1.5">
              <Signal size={13} className="text-white/90" />
              <span id="status-network-type" className="text-[9px] font-bold tracking-widest font-mono text-orange-400">5G</span>
              <Wifi size={13} className="text-white/90" />
              <div id="battery-status-group" className="flex items-center gap-0.5">
                <span className="text-[9px] font-normal mr-0.5 text-neutral-400">82%</span>
                <Battery size={14} className="text-orange-500 transform rotate-0" />
              </div>
            </div>
          </div>
        )}

        {/* Viewport Content (Scrollable Screen with Custom Scrollbar) */}
        <div id="phone-screen-content" className="flex-1 w-full flex flex-col overflow-y-auto overflow-x-hidden bg-[#0c0705] scrollbar-thin scrollbar-thumb-neutral-800">
          {children}
        </div>

        {/* Dynamic Mobile Tab Navigation Bar */}
        {!showSplash && (
          !isCustomerAuthenticated ? (
            <div id="phone-locked-navigation-bar" className="w-full h-[76px] px-5 pb-2 pt-1 flex items-center justify-center bg-neutral-950 border-t border-orange-500/20 z-40 gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-[pulse_1.5s_infinite]" />
              <span className="text-[10px] font-mono tracking-widest font-extrabold text-amber-500 uppercase">🔒 SECURE GATEWAY ENABLED • PLEASE LOGIN</span>
            </div>
          ) : isAdminMode ? (
            <div id="phone-admin-terminal-bar" className="w-full h-[76px] px-5 pb-2 pt-1 flex items-center justify-between bg-zinc-950 border-t border-red-500/20 z-40">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-red-400">ADMIN DIAGNOSTIC CONSOLE</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-neutral-500">SYSTEM: ACTIVE</span>
            </div>
          ) : (
            <div id="phone-navigation-bar" className="w-full h-[76px] px-4 pb-2 pt-1 flex justify-around items-center bg-[#0e0907]/95 border-t border-orange-500/10 backdrop-blur-xl z-40">
              <button
                id="tab-btn-home"
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                  activeTab === 'home' ? 'text-amber-400 font-medium' : 'text-neutral-500 hover:text-neutral-400'
                }`}
              >
                <div className="p-1 rounded-xl transition-colors duration-150">
                  <Home size={22} className={activeTab === 'home' ? 'stroke-[2.5px] text-amber-400 glow-amber-soft' : 'stroke-[2px]'} />
                </div>
                <span id="tab-label-home" className="text-[10px] mt-0.5 font-medium tracking-wide">Home</span>
              </button>

              <button
                id="tab-btn-menu"
                onClick={() => setActiveTab('menu')}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                  activeTab === 'menu' ? 'text-amber-400 font-medium' : 'text-neutral-500 hover:text-neutral-400'
                }`}
              >
                <div className="p-1 rounded-xl">
                  <Utensils size={22} className={activeTab === 'menu' ? 'stroke-[2.5px] text-amber-400 glow-amber-soft' : 'stroke-[2px]'} />
                </div>
                <span id="tab-label-menu" className="text-[10px] mt-0.5 font-medium tracking-wide">Menu</span>
              </button>

              <button
                id="tab-btn-chatbot"
                onClick={() => setActiveTab('chatbot')}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                  activeTab === 'chatbot' ? 'text-amber-400 font-medium' : 'text-neutral-500 hover:text-neutral-400'
                }`}
              >
                <div className="p-1 rounded-xl">
                  <MessageSquare size={22} className={activeTab === 'chatbot' ? 'stroke-[2.5px] text-amber-400 glow-amber-soft' : 'stroke-[2px]'} />
                </div>
                <span id="tab-label-chatbot" className="text-[10px] mt-0.5 font-medium tracking-wide">Ask AI</span>
              </button>

              <button
                id="tab-btn-cart"
                onClick={() => setActiveTab('cart')}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
                  activeTab === 'cart' ? 'text-amber-400 font-medium' : 'text-neutral-500 hover:text-neutral-400'
                }`}
              >
                <div className="p-1 rounded-xl relative">
                  <ShoppingBag size={22} className={activeTab === 'cart' ? 'stroke-[2.5px] text-amber-400 glow-amber-soft' : 'stroke-[2px]'} />
                  {cartCount > 0 && (
                    <span
                      id="cart-badge"
                      className="absolute -top-1 -right-1.5 w-4.5 h-4.5 bg-red-600 text-[10px] text-white font-extrabold flex items-center justify-center rounded-full shadow-md animate-bounce"
                      style={{ minWidth: '18px' }}
                    >
                      {cartCount}
                    </span>
                  )}
                </div>
                <span id="tab-label-cart" className="text-[10px] mt-0.5 font-medium tracking-wide">Cart</span>
              </button>

              <button
                id="tab-btn-loyalty"
                onClick={() => setActiveTab('loyalty')}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                  activeTab === 'loyalty' ? 'text-amber-400 font-medium' : 'text-neutral-500 hover:text-neutral-400'
                }`}
              >
                <div className="p-1 rounded-xl">
                  <Award size={22} className={activeTab === 'loyalty' ? 'stroke-[2.5px] text-amber-400 glow-amber-soft' : 'stroke-[2px]'} />
                </div>
                <span id="tab-label-loyalty" className="text-[10px] mt-0.5 font-medium tracking-wide">Loyalty</span>
              </button>

              <button
                id="tab-btn-tracking"
                onClick={() => setActiveTab('tracking')}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
                  activeTab === 'tracking' ? 'text-amber-400 font-medium' : 'text-neutral-500 hover:text-neutral-400'
                }`}
              >
                <div className="p-1 rounded-xl relative">
                  <MapPin size={22} className={activeTab === 'tracking' ? 'stroke-[2.5px] text-amber-400 glow-amber-soft' : 'stroke-[2px]'} />
                  {hasActiveOrder && (
                    <span id="tracking-active-indicator" className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  )}
                </div>
                <span id="tab-label-tracking" className="text-[10px] mt-0.5 font-medium tracking-wide">Track</span>
              </button>

              <button
                id="tab-btn-settings"
                onClick={() => setActiveTab('settings')}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
                  activeTab === 'settings' ? 'text-amber-400 font-medium' : 'text-neutral-500 hover:text-neutral-400'
                }`}
              >
                <div className="p-1 rounded-xl relative">
                  <Settings size={22} className={activeTab === 'settings' ? 'stroke-[2.5px] text-amber-400 glow-amber-soft rotate-45' : 'stroke-[2px] hover:rotate-12 transition-transform'} />
                </div>
                <span id="tab-label-settings" className="text-[10px] mt-0.5 font-medium tracking-wide">Settings</span>
              </button>
            </div>
          )
        )}

        {/* iOS Home Indicator Bar */}
        <div id="phone-ios-indicator" className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/45 rounded-full z-50 pointer-events-none" />
      </div>

      {/* Frame Details & Explainer note for web preview */}
      <div id="bottom-device-note" className="mt-4 text-center z-10 text-[10px] text-neutral-500 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        Mzansi Quick Ordering PWA • Seamless Yoco/PayFast Card Simulation • Try ordering to ear loyalty rewards!
      </div>
    </div>
  );
}
