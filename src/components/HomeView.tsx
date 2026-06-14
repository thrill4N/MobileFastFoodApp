import React from 'react';
import { Search, Sparkles, Flame, Clock, Star, ArrowRight, Heart, MapPin, Tablet, QrCode } from 'lucide-react';
import { motion } from 'motion/react';
import { MenuItem, LoyaltyRewards } from '../types';

interface HomeViewProps {
  menuItems: MenuItem[];
  userName: string;
  loyalty: LoyaltyRewards;
  onSelectCategory: (category: string) => void;
  onSelectItem: (item: MenuItem) => void;
  onNavigateToTab: (tab: 'home' | 'menu' | 'cart' | 'loyalty' | 'tracking' | 'chatbot') => void;
  diningOption: 'dine-in' | 'takeaway';
  setDiningOption: (opt: 'dine-in' | 'takeaway') => void;
  tableNumber: string;
  setTableNumber: (num: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (addr: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleAdmin: () => void;
  onOpenQrScanner?: () => void;
}

const CATEGORIES = [
  { name: 'Bunny Chow', icon: '🍛', color: 'from-amber-500 to-orange-600' },
  { name: 'Vetkoek', icon: '🥯', color: 'from-orange-400 to-red-600' },
  { name: 'Shwamma', icon: '🌯', color: 'from-yellow-400 to-amber-600' },
  { name: 'Burgers', icon: '🍔', color: 'from-red-500 to-pink-600' },
  { name: 'Pizza', icon: '🍕', color: 'from-rose-500 to-orange-600' },
  { name: 'Desserts', icon: '🍰', color: 'from-amber-400 to-orange-500' },
  { name: 'Beverages', icon: '🥤', color: 'from-emerald-400 to-teal-600' },
];

export default function HomeView({
  menuItems,
  userName,
  loyalty,
  onSelectCategory,
  onSelectItem,
  onNavigateToTab,
  diningOption,
  setDiningOption,
  tableNumber,
  setTableNumber,
  deliveryAddress,
  setDeliveryAddress,
  searchQuery,
  setSearchQuery,
  onToggleAdmin,
  onOpenQrScanner,
}: HomeViewProps) {
  const popularItems = menuItems.filter((item) => item.popular);

  const filteredPopular = popularItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="home-view-container" className="flex flex-col p-4 pb-12 w-full text-white space-y-5">
      {/* Dynamic Header */}
      <div id="home-greeting-bar" className="flex items-center justify-between">
        <div>
          <span className="text-neutral-400 text-xs font-mono tracking-wider block">HOWZIT MBLANJI 🇿🇦</span>
          <h2 id="home-welcome-title" className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
            Sharp, {userName || 'Champion'}! <span className="animate-bounce">👋</span>
          </h2>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            id="admin-override-toggle"
            type="button"
            onClick={onToggleAdmin}
            className="flex gap-1 items-center bg-amber-500 hover:bg-amber-400 text-[#0c0705] font-black px-2.5 py-1.5 rounded-full scale-90 origin-right hover:scale-95 transition-all duration-150 cursor-pointer text-[9px] uppercase tracking-wider shadow-md shadow-orange-500/10"
          >
            <Sparkles size={10} className="animate-pulse text-neutral-950" />
            Admin Console 📊
          </button>
          <div id="home-badge-pill" className="flex gap-1 items-center bg-zinc-900 border border-zinc-800 rounded-full px-2 py-0.5 scale-[0.8] origin-right opacity-60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono tracking-wide text-neutral-300">GAUTENG: PTA / JHB CBD</span>
          </div>
        </div>
      </div>

      {/* Modern Premium Glassmorphic Loyalty Card */}
      <div
        id="home-loyalty-card"
        onClick={() => onNavigateToTab('loyalty')}
        className="relative overflow-hidden rounded-3xl border border-amber-500/20 p-5 cursor-pointer transition-all duration-300 hover:border-amber-500/45"
        style={{
          background: 'radial-gradient(130% 115% at 0% 0%, rgba(245, 158, 11, 0.22) 0%, rgba(234, 88, 12, 0.1) 50%, rgba(0,0,0,0) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.08), 0 12px 36px 0 rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Soft floating particles backdrops inside card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none" />
        
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 bg-amber-500/25 border border-amber-500/40 px-2.5 py-0.5 rounded-full w-fit">
              <Sparkles size={11} className="text-amber-400 animate-spin-slow glow-amber-soft" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-amber-200 font-mono text-shadow">
                {loyalty.tier}
              </span>
            </div>
            <h3 className="text-xs text-neutral-400 font-medium pt-1">Lekker Coins Balance</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-amber-400 tracking-tight font-mono glow-amber-soft">
                {loyalty.pointsBalance}
              </span>
              <span className="text-xs text-amber-200 font-semibold font-mono">LC</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 block">CARD HOLDER</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">{userName || 'GUEST CUSTOMER'}</span>
          </div>
        </div>

        {/* Loyalty progress slider */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between items-center text-[10px] text-neutral-450 font-mono">
            <span>Progress to Next Tier</span>
            <span className="text-amber-300 font-bold">{loyalty.pointsBalance} / {loyalty.pointsBalance + loyalty.nextTierPointsNeeded} LC</span>
          </div>
          <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden p-[2px] border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 rounded-full transition-all duration-800"
              style={{ width: `${Math.max(10, loyalty.progressPercentage)}%` }}
            />
          </div>
          <p className="text-[9px] text-neutral-500 italic">
            🌟 Only {loyalty.nextTierPointsNeeded} more points until checking out with {loyalty.tier === 'Bronze Star' ? 'Silver Feast' : 'Golden Chef'}!
          </p>
        </div>
      </div>

      {/* 📱 In-Store Queue Skipping QR Banner */}
      <div
        id="home-queue-qr-banner"
        onClick={onOpenQrScanner}
        className="relative overflow-hidden rounded-3xl border border-dashed border-amber-500/30 p-4 bg-gradient-to-br from-[#120a06]/90 via-[#1c0e08]/90 to-[#0c0705] cursor-pointer hover:border-amber-500/65 group transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/5 rounded-full blur-[25px] pointer-events-none" />
        <div className="flex gap-4 items-center">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 p-[1.5px] shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-orange-500/15">
            <div className="w-full h-full bg-neutral-950 rounded-[15px] flex items-center justify-center text-amber-400">
              <QrCode size={18} className="animate-pulse" />
            </div>
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[8.5px] font-mono text-amber-500 font-extrabold uppercase tracking-widest block">🇿🇦 SKIP QUEUES IN STORE</span>
              <span className="text-[7.4px] bg-red-600 text-white font-mono font-bold px-1.5 py-0.2 rounded uppercase animate-bounce">NO LINES</span>
            </div>
            <h4 className="text-xs font-black text-white uppercase group-hover:text-amber-300 transition-colors">Digital Queue QR Scanner</h4>
            <p className="text-[9px] text-neutral-400 leading-snug line-clamp-2">
              Bypass cashier congestion at the till! Scan food tags on physical displays to instantly add items & pay inside this app.
            </p>
          </div>
        </div>
      </div>

      {/* 💬 AI Chatbot Quick Access Banner */}
      <div
        id="home-chatbot-banner"
        onClick={() => onNavigateToTab('chatbot')}
        className="relative overflow-hidden rounded-3xl border border-orange-500/15 p-4 bg-[#110906] hover:border-amber-500/40 cursor-pointer group transition-all duration-300"
        style={{
          boxShadow: '0 8px 30px rgba(245, 158, 11, 0.05)'
        }}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/5 rounded-full blur-[25px] pointer-events-none" />
        <div className="flex gap-4 items-center">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-[1.5px] shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-md shadow-orange-950/55">
            <div className="w-full h-full bg-neutral-950 rounded-[15px] flex items-center justify-center text-amber-400">
              <Sparkles size={18} className="animate-pulse text-amber-400" />
            </div>
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[8.5px] font-mono text-orange-400 font-extrabold uppercase tracking-widest block">🇿🇦 AI CULINARY ASSISTANT</span>
              <span className="text-[7.4px] bg-amber-500 text-neutral-950 font-mono font-bold px-1.5 py-0.2 rounded uppercase font-black">NEW</span>
            </div>
            <h4 className="text-xs font-black text-white uppercase group-hover:text-amber-300 transition-colors">Ask LekkerBot AI 💬</h4>
            <p className="text-[9px] text-neutral-400 leading-snug line-clamp-2">
              Inquire about active order status on the way, check food allergy alerts/gluten-free choices, or get premium chef pairings!
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Dining Options Toggle & Details inputs */}
      <div id="dining-options-box" className="glass-panel rounded-2xl p-3.5 space-y-2.5">
        <div className="flex bg-neutral-950/50 border border-white/5 rounded-xl p-1 text-xs">
          <button
            id="dinein-toggle"
            type="button"
            onClick={() => setDiningOption('dine-in')}
            className={`flex-1 py-1.5 text-center font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              diningOption === 'dine-in' ? 'zest-gradient-bg text-neutral-950 font-extrabold shadow-md' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Tablet size={13} />
            Dine-In (At Table)
          </button>
          <button
            id="takeaway-toggle"
            type="button"
            onClick={() => setDiningOption('takeaway')}
            className={`flex-1 py-1.5 text-center font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              diningOption === 'takeaway' ? 'zest-gradient-bg text-neutral-950 font-extrabold shadow-md' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <MapPin size={13} />
            Takeaway / Delivery
          </button>
        </div>

        {diningOption === 'dine-in' ? (
          <div className="flex items-center gap-3 bg-neutral-950/50 p-2.5 rounded-xl border border-white/5 animate-fade-in">
            <span className="text-xs text-amber-400 font-mono font-bold shrink-0">TABLE NO:</span>
            <input
              type="text"
              placeholder="e.g. Table 12 or Counter"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 outline-none w-full placeholder-neutral-750 font-semibold"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-neutral-950/50 p-2.5 rounded-xl border border-white/5 animate-fade-in">
            <span className="text-xs text-amber-400 font-mono font-bold shrink-0">DELIVER TO:</span>
            <input
              type="text"
              placeholder="e.g. 185 Francis Baard St, Pretoria CBD"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 outline-none w-full placeholder-neutral-750 font-semibold"
            />
          </div>
        )}
      </div>

      {/* Styled Search bar */}
      <div id="home-search-container" className="flex gap-2 items-center w-full">
        <div className="relative flex-1 group">
          <input
            type="text"
            placeholder="Craving bunny chow, vetkoek, or sweet malva?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-[#120a06]/90 border border-orange-500/15 rounded-2xl text-xs text-neutral-200 placeholder-neutral-500 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all font-medium"
          />
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-400 transition-colors" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-450 hover:text-white text-xs font-mono font-bold">CLEAR</button>
          )}
        </div>
        {onOpenQrScanner && (
          <button
            onClick={onOpenQrScanner}
            title="Scan store menu QR code"
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-neutral-950 flex items-center justify-center cursor-pointer hover:scale-103 active:scale-97 shadow-lg shadow-orange-500/10 transition-transform shrink-0"
          >
            <QrCode size={16} />
          </button>
        )}
      </div>

      {/* Quick South African Food Categories Carousel */}
      <div id="home-categories-section" className="space-y-2.5">
        <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-400 font-bold flex items-center gap-1.5">
          <Flame size={13} className="text-red-500 animate-pulse" /> Categorized Cravings
        </h3>
        <div className="flex items-center gap-3.5 overflow-x-auto pb-1.5 scrollbar-none snap-x select-none">
          {CATEGORIES.map((cat, idx) => (
            <button
              id={`cat-badge-${idx}`}
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className="flex flex-col items-center gap-1.5 shrink-0 snap-center group focus:outline-none"
            >
              <div className={`w-[52px] h-[52px] rounded-2xl bg-gradient-to-br ${cat.color} p-[1px] shadow-lg transition-transform duration-200 active:scale-95 group-hover:scale-105`}>
                <div className="w-full h-full bg-neutral-950/95 group-hover:bg-transparent rounded-[15px] flex items-center justify-center text-xl transition-colors">
                  {cat.icon}
                </div>
              </div>
              <span className="text-[10px] text-neutral-400 group-hover:text-amber-300 font-semibold tracking-wide transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* High-Resolution Appetite Inducing Popular Slider */}
      <div id="home-popular-section" className="space-y-2.5">
        <div className="flex justify-between items-center text-xs font-mono">
          <h3 className="uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1.5">
            🔥 Mzansi Favorites
          </h3>
          <button
            onClick={() => onNavigateToTab('menu')}
            className="text-amber-400 flex items-center gap-0.5 hover:underline font-bold"
          >
            Full Menu <ArrowRight size={12} />
          </button>
        </div>

        {filteredPopular.length === 0 ? (
          <div className="text-center py-6 text-neutral-500 text-xs">No matching popular dishes found</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x select-none">
            {filteredPopular.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="w-48 glass-panel-interactive rounded-2xl p-3.5 shrink-0 scroll-ml-1.5 snap-center cursor-pointer group relative overflow-hidden"
              >
                {/* Visual appetizing overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

                {/* Highly delicious item thumbnail with dynamic border */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-800 mb-2.5">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1.5 right-1.5 bg-neutral-950/85 backdrop-blur-md text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                    <Star size={9} className="fill-amber-400 stroke-amber-400 glow-amber-soft" />
                    <span>{item.rating}</span>
                  </div>
                </div>

                {/* Item Typography */}
                <h4 className="text-xs font-bold text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                  {item.name}
                </h4>
                <p className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5 h-7 font-sans leading-tight">
                  {item.description}
                </p>

                {/* Price, Clock Speed and Add Action button */}
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                  <span className="text-xs font-black text-amber-400 font-mono glow-amber-soft">
                    R {item.price.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1.5 bg-neutral-950/40 px-2 py-1 rounded-lg text-neutral-400 text-[9px] font-mono">
                    <Clock size={10} className="text-neutral-500" />
                    <span>{item.preparationTime}m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* South African Retro Promo Card */}
      <div
        id="home-promo-banner"
        className="rounded-2xl border border-[1.5px] border-orange-500/15 p-4 flex gap-3.5 items-center relative overflow-hidden glass-panel"
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.06)'
        }}
      >
        <span className="text-3xl shrink-0">🥯💥</span>
        <div className="space-y-0.5">
          <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px] font-black font-mono tracking-widest px-2 py-0.5 rounded-full uppercase">
            Vetkoek Tuesday Mania
          </span>
          <p className="text-xs text-neutral-300 font-medium">Get a <span className="text-amber-400 font-bold">Free cream soda float</span> with any mince vetkoek ordered today!</p>
          <p className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider">Tap menu to claim • Limited quantities available</p>
        </div>
      </div>
    </div>
  );
}
