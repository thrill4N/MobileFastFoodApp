import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Sun, Moon, Volume2, VolumeX, Sliders, Check, Sparkles, Bell, Shield, Keyboard, Smile } from 'lucide-react';

interface SettingsViewProps {
  onBackToHome?: () => void;
  triggerToast?: (message: string) => void;
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

export default function SettingsView({
  onBackToHome,
  triggerToast: parentTriggerToast,
  onThemeChange,
}: SettingsViewProps) {
  // Local Toast notification fallback
  const [localToast, setLocalToast] = useState<string | null>(null);
  
  const triggerToast = (message: string) => {
    if (parentTriggerToast) {
      parentTriggerToast(message);
    } else {
      setLocalToast(message);
      const id = setTimeout(() => {
        setLocalToast(prev => prev === message ? null : prev);
      }, 3000);
    }
  };

  // Theme state
  const [themePref, setThemePref] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('lekker_theme') as 'light' | 'dark') || 'dark';
  });

  // Sound state (0 to 100)
  const [soundVolume, setSoundVolume] = useState<number>(() => {
    const saved = localStorage.getItem('lekker_sound_volume');
    return saved !== null ? parseInt(saved, 10) : 80; // Default to 80%
  });

  // Scan sounds enabled status
  const [scanSoundsEnabled, setScanSoundsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('lekker_scan_sounds') !== 'false';
  });

  // Handle Theme Change
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setThemePref(newTheme);
    localStorage.setItem('lekker_theme', newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
    triggerToast(`Theme switched to ${newTheme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}`);
  };

  // Handle Sound Volume Change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value, 10);
    setSoundVolume(newVal);
    localStorage.setItem('lekker_sound_volume', String(newVal));
  };

  const handleToggleScanSounds = () => {
    const newVal = !scanSoundsEnabled;
    setScanSoundsEnabled(newVal);
    localStorage.setItem('lekker_scan_sounds', String(newVal));
    triggerToast(`Scan sounds ${newVal ? 'unmuted 🔊' : 'muted 🔇'}`);
  };

  // Live Sound Test chime sequence using identical synthesis as MenuView/QRScannerView
  const playTestChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const volMultiplier = soundVolume / 100;
        
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime + start);
          // Multiply standard baseline gain (0.18) by our customized volume slider multiplier
          gainNode.gain.linearRampToValueAtTime(0.18 * volMultiplier, ctx.currentTime + start + 0.01);
          gainNode.gain.linearRampToValueAtTime(0.18 * volMultiplier, ctx.currentTime + start + duration - 0.02);
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration);
          
          osc.start(ctx.currentTime + start);
          osc.stop(ctx.currentTime + start + duration);
        };

        // Pleasant ascending melody test sound
        playTone(1350, 0, 0.06);
        playTone(1650, 0.05, 0.06);
        playTone(2100, 0.10, 0.15);
      }
    } catch (err) {
      console.warn('Audio synthesis support error:', err);
    }
  };

  return (
    <motion.div
      id="settings-view-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col p-4 pb-12 w-full space-y-6 text-white font-sans"
    >
      {/* Title Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Settings className="text-amber-400 stroke-[2px] animate-[spin-slow_20s_linear_infinite]" size={20} />
        </div>
        <div>
          <span className="text-[10px] font-mono tracking-widest text-amber-500 font-extrabold uppercase block">
            System Configuration
          </span>
          <h2 className="text-xl font-black text-white tracking-tight">
            App Settings
          </h2>
        </div>
      </div>

      {/* 1. THEME MODE SELECTOR */}
      <div className="glass-panel border-amber-500/10 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-wider text-amber-400 font-bold uppercase block">
              AESTHETICS OVERRIDE
            </span>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase">
              🎨 Color Theme Mode
            </h3>
          </div>
          <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full uppercase">
            Live Swap
          </span>
        </div>

        <p className="text-[11px] text-neutral-400 leading-normal">
          Choose between custom midnight wood-charcoal high-contrast theme or clean ambient South African cream daylight theme.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Light Mode Button */}
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex flex-col items-center gap-2 p-3.5 rounded-2.5xl border transition-all cursor-pointer ${
              themePref === 'light'
                ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-extrabold shadow-md shadow-orange-500/5'
                : 'bg-neutral-950/40 border-white/5 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <div className={`p-2 rounded-xl ${themePref === 'light' ? 'bg-amber-500/20' : 'bg-neutral-900'}`}>
              <Sun size={20} className={themePref === 'light' ? 'text-amber-400' : 'text-neutral-500'} />
            </div>
            <span className="text-xs">Light Mode</span>
            {themePref === 'light' && (
              <div className="flex items-center gap-1 bg-amber-500 text-[#0c0705] text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                <Check size={8} strokeWidth={4} /> Active
              </div>
            )}
          </button>

          {/* Dark Mode Button */}
          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex flex-col items-center gap-2 p-3.5 rounded-2.5xl border transition-all cursor-pointer ${
              themePref === 'dark'
                ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-extrabold shadow-md shadow-orange-500/5'
                : 'bg-neutral-950/40 border-white/5 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <div className={`p-2 rounded-xl ${themePref === 'dark' ? 'bg-amber-500/20' : 'bg-neutral-900'}`}>
              <Moon size={20} className={themePref === 'dark' ? 'text-amber-400' : 'text-neutral-500'} />
            </div>
            <span className="text-xs">Dark Mode</span>
            {themePref === 'dark' && (
              <div className="flex items-center gap-1 bg-amber-500 text-[#0c0705] text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                <Check size={8} strokeWidth={4} /> Active
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 2. SOUND VOLUME CONTROLLER */}
      <div className="glass-panel border-amber-500/10 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-wider text-amber-400 font-bold uppercase block">
              AUDIO INTERFACES
            </span>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase">
              🔊 Synthesized Audio Level
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <Volume2 size={13} className="text-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-extrabold text-amber-400">{soundVolume}%</span>
          </div>
        </div>

        <p className="text-[11px] text-neutral-400 leading-normal">
          Increase or reduce synthesized sound effects, cash drawer alerts, QR chime ticks, and receipt printer thermal vibrations.
        </p>

        {/* Volume Slider Control */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3 bg-neutral-950/60 p-3 rounded-2xl border border-white/5">
            <button
              onClick={() => {
                const step = Math.max(0, soundVolume - 10);
                setSoundVolume(step);
                localStorage.setItem('lekker_sound_volume', String(step));
              }}
              className="p-1 text-neutral-400 hover:text-neutral-200"
            >
              <VolumeX size={16} />
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={soundVolume}
              onChange={handleVolumeChange}
              className="flex-1 accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <button
              onClick={() => {
                const step = Math.min(100, soundVolume + 10);
                setSoundVolume(step);
                localStorage.setItem('lekker_sound_volume', String(step));
              }}
              className="p-1 text-neutral-400 hover:text-neutral-200"
            >
              <Volume2 size={16} />
            </button>
          </div>

          <div className="flex gap-2.5">
            {/* Live Beep Test Button */}
            <button
              onClick={playTestChime}
              className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-500 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-orange-500"
            >
              🔊 Test Sound Beep
            </button>

            {/* Toggle Switch sound enabled */}
            <button
              onClick={handleToggleScanSounds}
              className={`p-3 border rounded-2xl transition-colors flex items-center justify-center cursor-pointer ${
                scanSoundsEnabled 
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                  : 'bg-neutral-950/50 border-white/5 text-neutral-500 hover:text-neutral-300'
              }`}
              title="Mute scan sounds entirely"
            >
              {scanSoundsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. HARDWARE & OTHER UTILITIES */}
      <div className="glass-panel border-amber-500/10 rounded-3xl p-5 space-y-4 shadow-xl">
        <span className="text-[10px] font-mono tracking-wider text-amber-400 font-bold uppercase block">
          ADDITIONAL PREFERENCES
        </span>
        
        <div className="space-y-3.5">
          {/* Haptic intensity options */}
          <div className="flex justify-between items-center bg-neutral-950/40 p-3 rounded-2xl border border-white/5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Vibration Haptics</span>
              <span className="text-[10px] text-neutral-500 block">Tactile response on click</span>
            </div>
            <div className="flex gap-1.5">
              {['off', 'low', 'medium', 'high'].map((lvl) => {
                const currentHaptic = localStorage.getItem('lekker_haptic_intensity') || 'medium';
                const isActive = currentHaptic === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => {
                      localStorage.setItem('lekker_haptic_intensity', lvl);
                      triggerToast(`Haptics changed to ${lvl.toUpperCase()}`);
                      try {
                        if (lvl !== 'off' && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
                          navigator.vibrate(lvl === 'low' ? 30 : lvl === 'medium' ? 60 : 120);
                        }
                      } catch (err) {}
                    }}
                    className={`px-2 py-1 text-[9px] font-mono font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-amber-500 text-[#0c0705] border-transparent font-extrabold' 
                        : 'bg-neutral-900 border-white/5 text-neutral-400'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-neutral-950/40 rounded-2xl border border-white/5">
            <Shield size={16} className="text-neutral-500 shrink-0" />
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-neutral-300 block">MFA Diagnostics</span>
              <span className="text-[9.5px] text-neutral-500 block">Biometrics and hardware simulated signature</span>
            </div>
            <span className="ml-auto text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              SECURE
            </span>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-neutral-500 font-mono space-y-1 py-2">
        <p className="flex items-center justify-center gap-1.5">
          <Smile size={10} className="text-amber-500" />
          <span>Mzansi Gourmet Applet Settings v2.8</span>
        </p>
        <p>Lekker Bites (Pty) Ltd South Africa</p>
      </div>

      {localToast && (
        <div id="local-settings-toast" className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-amber-500 text-neutral-950 font-sans text-xs font-bold py-2.5 px-5 rounded-full shadow-2xl flex items-center gap-2 z-50 animate-bounce border border-orange-500">
          <span className="w-1.5 h-1.5 bg-neutral-950 rounded-full animate-ping" />
          {localToast}
        </div>
      )}
    </motion.div>
  );
}
