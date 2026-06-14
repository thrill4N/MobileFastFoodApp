import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  RotateCcw, 
  ChefHat, 
  Compass, 
  Sparkle,
  Clock,
  HelpCircle,
  MessageSquare,
  History,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Package,
  ShieldAlert,
  Flame,
  Utensils,
  Contrast,
  TrendingUp
} from "lucide-react";
import { Order, MenuItem } from "../types";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  isError?: boolean;
}

interface ChatbotViewProps {
  orders: Order[];
  userName: string;
  menuItems: MenuItem[];
  onNavigateToTab: (tab: 'home' | 'menu' | 'cart' | 'loyalty' | 'tracking') => void;
  onSelectItem: (item: MenuItem) => void;
  isAdminMode?: boolean;
  financeMetrics?: any;
  inventoryStock?: Record<string, number>;
  complaintTickets?: any[];
  weatherCondition?: string;
  cookingCongestionRatio?: number;
  kitchenDeadlockActive?: boolean;
  demandMultiplier?: number;
}

const QUICK_ACTIONS = [
  { text: "Track my order 📦", query: "Can you check the current status of my order and tell me what the kitchen is doing?", icon: "package" },
  { text: "Allergy info 🌾", query: "I have food allergies/preferences. Which dishes contain gluten or dairy, and which are safe?", icon: "shield" },
  { text: "Recommend me a meal 🍲", query: "Recommend me a delicious Mzansi pairing or fast-food meal combination from the menu!", icon: "sparkles" },
  { text: "Spicy options 🌶️", query: "Show me all the spicy options on the menu, like hot curries or prepped spice toppings.", icon: "flame" },
  { text: "Halal / No pork 🥩", query: "Are your meat choices Halaal friendly? Which items use pork alternatives?", icon: "utensils" }
];

const ADMIN_QUICK_ACTIONS = [
  { text: "Financial performance audit 📈", query: "Can you provide a full audit of our financial performance today including gross and net profits?", icon: "package" },
  { text: "Peak Ordering Hours & Top Items 📊", query: "Analyze our order history, identify the top-performing menu items and peak ordering hours, and provide optimization recommendations.", icon: "sparkles" },
  { text: "Ingredient stockout threats 🌾", query: "Which ingredients/menu assets are at risk of running out of stock today, and how should we restock?", icon: "shield" },
  { text: "Dynamic pricing advisor 💰", query: "Recommend some price or margin adjustments for our menu items to optimize profitability.", icon: "sparkles" },
  { text: "Logistics delay analysis 🛵", query: "Analyze how our kitchen capacity and current weather might affect delivery speed and customer satisfaction.", icon: "flame" },
  { text: "Unresolved complaint consultant 🛡️", query: "Show me a list of open customer complaint tickets and suggest the best Ubuntu compensation solutions.", icon: "utensils" }
];

const getActionIcon = (iconName: string) => {
  switch (iconName) {
    case 'package':
      return <Package size={11} className="text-orange-400" />;
    case 'shield':
      return <ShieldAlert size={11} className="text-amber-400" />;
    case 'sparkles':
      return <Sparkles size={11} className="text-yellow-400 animate-pulse" />;
    case 'flame':
      return <Flame size={11} className="text-rose-500 pointer-events-none" />;
    default:
      return <Utensils size={11} className="text-zinc-400" />;
  }
};


export default function ChatbotView({
  orders,
  userName,
  menuItems,
  onNavigateToTab,
  onSelectItem,
  isAdminMode = false,
  financeMetrics = null,
  inventoryStock = {},
  complaintTickets = [],
  weatherCondition = "sun",
  cookingCongestionRatio = 35,
  kitchenDeadlockActive = false,
  demandMultiplier = 1.0
}: ChatbotViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const historyKey = isAdminMode ? "durban_chatbot_history_admin" : "durban_chatbot_history";
    const saved = localStorage.getItem(historyKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fall to default
      }
    }
    return [
      {
        id: "welcome",
        sender: "bot",
        text: isAdminMode
          ? `Howzit, **Chef/Manager Staff Admin**! 🧔💼 Welcome to the Lekker Bites Executive AI Advisor Portal.\n\nI can help you **analyze financial performance**, **optimize supply lines**, evaluate **delivery routes** under current weather, and **resolve customer complaints** instantly with Ubuntu.\n\nOur kitchen is currently operates at **${cookingCongestionRatio}% stove capacity** with **${weatherCondition === "rain" ? "heavy rainfall & delivery scooter delays active ⛈️" : "clear sunny Gauteng weather ☀️"}**.\n\nHow can I help you optimize operations today, boss?`
          : `Howzit, **${userName || "Nkululeko"}**! 👋 I'm **LekkerBot**, your personal Mzansi culinary guide here at Lekker Bites.\n\nWhether you want to **track your active order status**, check **allergy & dietary info** (like gluten-free, halal, or vegetarian dishes), or need me to **recommend the perfect bunny chow combination**, I've got you covered boet!\n\nWhat are you craving today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    const queriesKey = isAdminMode ? "durban_chatbot_recent_queries_admin" : "durban_chatbot_recent_queries";
    const saved = localStorage.getItem(queriesKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter(q => typeof q === "string" && q.trim().length > 0);
      } catch (e) {}
    }
    return isAdminMode
      ? [
          "Interpret today's sales and net profit margins",
          "Which items are at risk of a stockout today?",
          "Suggest solutions for pending customer complaint tickets",
          "Analyze the impact of rainy weather on deliveries"
        ]
      : [
          "Can you check the current status of my order?",
          "Which of your tasty dishes are gluten-free?",
          "What signature spicy dish do you suggest?",
          "Are your chicken and beef Halaal certified?"
        ];
  });
  const [isHeaderPanelOpen, setIsHeaderPanelOpen] = useState(true);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    return localStorage.getItem("durban_chatbot_high_contrast") === "true";
  });

  const [adminDrawerTab, setAdminDrawerTab] = useState<'tickets' | 'finance'>('tickets');

  // Analyze current order history to find top menu items and peak hours
  const financialSummary = useMemo(() => {
    const liveOrdersList = orders || [];
    const orderCount = liveOrdersList.length;
    
    // Total checkout sales from live orders
    const totalSales = liveOrdersList.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    // Compile items frequency & revenue
    const itemAnalysis: Record<string, { id: string; name: string; category: string; qty: number; revenue: number }> = {};
    
    liveOrdersList.forEach((order) => {
      if (order && order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (item && item.menuItem) {
            const mId = item.menuItem.id;
            const q = item.quantity || 1;
            const price = item.menuItem.price || 0;
            let toppingsSum = 0;
            if (item.selectedToppings && Array.isArray(item.selectedToppings)) {
              toppingsSum = item.selectedToppings.reduce((s: number, t: any) => s + (t.price || 0), 0);
            }
            const itemRevenue = (price + toppingsSum) * q;

            if (!itemAnalysis[mId]) {
              itemAnalysis[mId] = {
                id: mId,
                name: item.menuItem.name,
                category: item.menuItem.category,
                qty: 0,
                revenue: 0
              };
            }
            itemAnalysis[mId].qty += q;
            itemAnalysis[mId].revenue += itemRevenue;
          }
        });
      }
    });

    const topPerformingItems = Object.values(itemAnalysis)
      .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
      .slice(0, 5);

    // Grouping into peak hours
    const hourCounts: Record<number, number> = {};
    const hourRevenues: Record<number, number> = {};
    
    // Seed standard operating hours block
    for (let h = 8; h <= 22; h++) {
      hourCounts[h] = 0;
      hourRevenues[h] = 0;
    }

    liveOrdersList.forEach((order) => {
      if (order.timestamp) {
        try {
          const date = new Date(order.timestamp);
          if (!isNaN(date.getTime())) {
            const hr = date.getHours();
            hourCounts[hr] = (hourCounts[hr] || 0) + 1;
            hourRevenues[hr] = (hourRevenues[hr] || 0) + (order.total || 0);
          }
        } catch (e) {}
      }
    });

    const peakHoursList = Object.entries(hourCounts)
      .map(([hrStr, count]) => {
        const hour = parseInt(hrStr, 10);
        return {
          hour,
          hourFormatted: `${hour.toString().padStart(2, '0')}:00`,
          count,
          revenue: hourRevenues[hour] || 0
        };
      })
      .filter(stat => stat.count > 0 || liveOrdersList.length === 0)
      .sort((a, b) => b.count - a.count || b.revenue - a.revenue);

    return {
      orderCount,
      totalSales,
      avgOrderValue,
      topPerformingItems,
      peakHoursList,
      hasLiveOrders: orderCount > 0
    };
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("durban_chatbot_high_contrast", String(isHighContrast));
  }, [isHighContrast]);

  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync message history to localStorage
  useEffect(() => {
    const historyKey = isAdminMode ? "durban_chatbot_history_admin" : "durban_chatbot_history";
    localStorage.setItem(historyKey, JSON.stringify(messages));
  }, [messages, isAdminMode]);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Parse markdown-like syntax locally for instant high-performance rendering
  const renderMessageText = (text: string) => {
    // Split by newlines
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Bold rendering **text**
      let parts: React.ReactNode[] = [];
      let tempLine = line;
      
      // Match bold parts
      const boldRegex = /\*\*(.*?)\*\*/g;
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(tempLine)) !== null) {
        // Add preceding text
        if (match.index > lastIndex) {
          parts.push(tempLine.substring(lastIndex, match.index));
        }
        // Add bolded text
        parts.push(
          <strong 
            key={match.index} 
            className={
              isHighContrast 
                ? "text-yellow-400 font-extrabold uppercase tracking-wide bg-neutral-950 px-1 border border-yellow-400 rounded" 
                : "text-amber-400 font-extrabold uppercase tracking-wide"
            }
          >
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < tempLine.length) {
        parts.push(tempLine.substring(lastIndex));
      }

      // Check if line is a bullet points
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const bulletText = parts.length > 0 ? parts : line.replace(/^[\s*-]+/, "");
        return (
          <div 
            key={idx} 
            className={`flex items-start gap-2 pl-3 py-1 ${
              isHighContrast ? "text-white font-bold" : "text-zinc-300"
            }`}
          >
            <span className={`${isHighContrast ? "text-white" : "text-orange-500"} font-black mt-1 text-[11px] select-none`}>•</span>
            <span className={`flex-1 ${isHighContrast ? "text-[12.5px]" : "text-[11px]"} font-sans leading-relaxed`}>{bulletText}</span>
          </div>
        );
      }

      return (
        <p 
          key={idx} 
          className={`${
            isHighContrast 
              ? "text-[12px] text-white font-semibold leading-relaxed" 
              : "text-[11px] font-sans leading-relaxed text-zinc-200"
          } min-h-[4px]`}
        >
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    // Save/append to recent queries state
    setRecentQueries((prev) => {
      const filtered = prev.filter(q => q.toLowerCase() !== textToSend.toLowerCase());
      const updated = [textToSend, ...filtered].slice(0, 5);
      const queriesKey = isAdminMode ? "durban_chatbot_recent_queries_admin" : "durban_chatbot_recent_queries";
      localStorage.setItem(queriesKey, JSON.stringify(updated));
      return updated;
    });

    const userMsgId = Math.random().toString(36).substring(7);
    const userMessageObj: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setInputVal("");
    setIsTyping(true);

    try {
      // Query our local backend server API
      const response = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userMessage: textToSend,
          history: messages.slice(-10), // Send last 10 messages of conversation context
          currentOrders: orders,
          username: userName,
          isAdminMode,
          financeMetrics,
          inventoryStock,
          complaintTickets,
          weatherCondition,
          cookingCongestionRatio,
          kitchenDeadlockActive,
          demandMultiplier
        })
      });

      const data = await response.json();

      setIsTyping(false);

      if (!response.ok) {
        throw new Error(data.error || "Failed key confirmation");
      }

      const botMsgId = Math.random().toString(36).substring(7);
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: "bot",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

    } catch (err: any) {
      setIsTyping(false);
      const errMsgId = Math.random().toString(36).substring(7);
      setMessages((prev) => [
        ...prev,
        {
          id: errMsgId,
          sender: "bot",
          text: `⚠️ **Server Offline / Key Missing:** My apologies! I am currently unable to reach the Pretoria kitchen system to process your request.\n\nTo allow me to speak, please configure your **GEMINI_API_KEY** under the **Settings (Gear Icon at top right) > Secrets** panel in the AI Studio workspace. Sharp sharp!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Do you want to reset your conversation with LekkerBot?")) {
      const defaultIntro: ChatMessage = {
        id: "welcome",
        sender: "bot",
        text: isAdminMode
          ? `Howzit, **Chef/Manager Staff Admin**! 🧔💼 Welcome to the Lekker Bites Executive AI Advisor Portal.\n\nI can help you **analyze financial performance**, **optimize supply lines**, evaluate **delivery routes** under current weather, and **resolve customer complaints** instantly with Ubuntu.\n\nOur kitchen is currently operates at **${cookingCongestionRatio}% stove capacity** with **${weatherCondition === "rain" ? "heavy rainfall & delivery scooter delays active ⛈️" : "clear sunny Gauteng weather ☀️"}**.\n\nHow can I help you optimize operations today, boss?`
          : `Howzit, **${userName || "Nkululeko"}**! 👋 I'm **LekkerBot**, your personal Mzansi culinary guide here at Lekker Bites.\n\nWhether you want to **track your active order status**, check **allergy & dietary info** (like gluten-free, halal, or vegetarian dishes), or need me to **recommend the perfect bunny chow combination**, I've got you covered boet!\n\nWhat are you craving today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([defaultIntro]);
    }
  };

  return (
    <div 
      id="chatbot-console-view" 
      className={`flex flex-col h-full transition-colors duration-200 ${
        isHighContrast ? "bg-black text-white" : "bg-[#0c0705] text-white"
      }`}
    >
      {/* Bot Chat Header Banner */}
      <div className={`transition-all duration-200 p-3.5 px-4 flex justify-between items-center relative shrink-0 ${
        isHighContrast ? "bg-black border-b-2 border-white" : "bg-[#110a07] border-b border-orange-500/10"
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-950/40 border border-orange-500/20">
              <ChefHat size={18} className="text-neutral-950" />
            </div>
            {/* Pulsing online badge indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#110a07] rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-[13px] font-black tracking-wide text-white uppercase font-sans">
                {isAdminMode ? "LekkerAdvisor" : "LekkerBot"}
              </h3>
              <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest font-mono ${
                isAdminMode 
                  ? "bg-purple-500/15 border border-purple-500/30 text-purple-400" 
                  : "bg-orange-500/15 border border-orange-500/30 text-orange-400"
              }`}>
                {isAdminMode ? "Executive AI" : "AI Staff"}
              </span>
            </div>
            <p className="text-[9.5px] text-zinc-400 font-mono mt-0.5 flex items-center gap-1">
              <Sparkles size={8} className={isAdminMode ? "text-purple-400 animate-pulse" : "text-amber-500"} />
              {isAdminMode ? "Corporate Advisory Consultant" : "Active Mzansi Food Assistant"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Contrast Toggler */}
          <button
            onClick={() => setIsHighContrast(!isHighContrast)}
            title={isHighContrast ? "Switch to Classic Dark" : "Switch to High Contrast"}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
              isHighContrast 
                ? 'bg-white text-black border-white font-bold' 
                : 'bg-neutral-900/60 text-zinc-400 border-white/5 hover:text-white'
            }`}
          >
            <Contrast size={13} />
            <span className="text-[8px] font-mono font-black uppercase hidden xs:inline">
              {isHighContrast ? 'CLASSIC' : 'CONTRAST'}
            </span>
          </button>

          {/* Collapsible drawer toggler */}
          <button
            onClick={() => setIsHeaderPanelOpen(!isHeaderPanelOpen)}
            title={isHeaderPanelOpen ? "Hide Recent Panel" : "Show Recent Panel"}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
              isHeaderPanelOpen 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' 
                : 'bg-neutral-900/60 text-zinc-400 border-white/5 hover:text-white'
            }`}
          >
            <History size={13} />
            <span className="text-[8px] font-mono font-black uppercase hidden xs:inline">
              {isHeaderPanelOpen ? 'CLOSE INFO' : 'VIEW INFO'}
            </span>
            {isHeaderPanelOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>

          <button
            onClick={handleClearHistory}
            title="Clear Conversation History"
            className="p-1.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800 border border-white/5 hover:border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Collapsible Info Drawer: Recent Queries & Last 3 Orders statuses */}
      <AnimatePresence>
        {isHeaderPanelOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`overflow-hidden border-b shrink-0 transition-colors duration-200 ${
              isHighContrast ? "bg-black border-white border-b-2" : "bg-[#150d0a] border-orange-500/10"
            }`}
          >
            <div className="p-3 px-4 space-y-3">
              
              {/* Admin Mode Tab Switcher */}
              {isAdminMode && (
                <div className="flex bg-neutral-900/60 p-1 rounded-xl border border-white/5 text-[9px] font-sans font-black select-none max-w-sm">
                  <button
                    type="button"
                    onClick={() => setAdminDrawerTab('tickets')}
                    className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      adminDrawerTab === 'tickets'
                        ? "bg-purple-600/20 border border-purple-500/30 text-purple-300 shadow-sm shadow-purple-950/40"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <ShieldAlert size={10} className={adminDrawerTab === 'tickets' ? "text-purple-400" : "text-zinc-500"} />
                    Active Tickets ({complaintTickets.filter((t: any) => t.status === 'pending').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminDrawerTab('finance')}
                    className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      adminDrawerTab === 'finance'
                        ? "bg-purple-600/20 border border-purple-500/30 text-purple-300 shadow-sm shadow-purple-950/40"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <TrendingUp size={10} className={adminDrawerTab === 'finance' ? "text-purple-400" : "text-zinc-500"} />
                    Financial Analyst 📊
                  </button>
                </div>
              )}

              {isAdminMode && adminDrawerTab === 'finance' ? (
                /* GORGEOUS FINANCIAL ANALYST VIEW */
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 pt-1">
                  
                  {/* Left segment: Sales Metrics & Peak Hours */}
                  <div className="space-y-2.5 bg-neutral-950/40 p-2.5 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] font-mono uppercase tracking-wider text-purple-400 font-black flex items-center gap-1">
                        <TrendingUp size={10} />
                        Sales & Peak Hours
                      </span>
                      <span className="text-[7.5px] text-zinc-500 font-mono font-bold">real-time order history</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 border-b border-white/5 pb-2 select-none">
                      <div className="text-center">
                        <p className="text-[7.5px] text-zinc-500 uppercase font-mono">Total Sales</p>
                        <p className="text-[10px] font-bold text-white font-mono">
                          R {financialSummary.totalSales.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center border-x border-white/5">
                        <p className="text-[7.5px] text-zinc-500 uppercase font-mono">Checkouts</p>
                        <p className="text-[10px] font-bold text-white font-mono">
                          {financialSummary.orderCount}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[7.5px] text-zinc-500 uppercase font-mono">Average</p>
                        <p className="text-[10px] font-bold text-white font-mono">
                          R {financialSummary.avgOrderValue.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    {/* Peak Ordering Hours parsed dynamically */}
                    <div className="space-y-1.5">
                      <span className="text-[7.5px] text-zinc-500 uppercase tracking-widest font-mono font-black block">
                        🕒 Peak Hours Identified (by frequency)
                      </span>
                      {financialSummary.hasLiveOrders ? (
                        <div className="flex flex-col gap-1 max-h-[85px] overflow-y-auto pr-1">
                          {financialSummary.peakHoursList.slice(0, 3).map((stat, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleSendMessage(`Analyze the sales performance during the peak block around ${stat.hourFormatted}`)}
                              className="w-full text-left flex justify-between items-center text-[8.5px] bg-neutral-900/60 hover:bg-neutral-800 p-1.5 rounded border border-white/5 leading-none cursor-pointer text-zinc-300 hover:text-white"
                            >
                              <span className="font-mono text-zinc-300 font-bold flex items-center gap-1">
                                <Clock size={8} /> {stat.hourFormatted} block
                              </span>
                              <span className="text-purple-400 font-bold font-mono">
                                {stat.count} {stat.count === 1 ? 'order' : 'orders'} (R {stat.revenue.toFixed(0)})
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 border border-dashed border-white/5 rounded text-center">
                          <p className="text-[7.8px] text-zinc-500 font-mono leading-relaxed">
                            Waiting for live transactions... Standard peak blocks occur at 12:00-13:30 (Lunch) & 18:00-19:30 (Dinner) under Gauteng models.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right segment: Ranking top performed items */}
                  <div className="space-y-2 bg-neutral-950/40 p-2.5 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] font-mono uppercase tracking-wider text-amber-400 font-black flex items-center gap-1">
                        <Utensils size={10} />
                        Top-Performing Menu Items
                      </span>
                      <span className="text-[7.5px] text-zinc-500 font-mono font-bold">by volume</span>
                    </div>

                    {financialSummary.hasLiveOrders ? (
                      <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {financialSummary.topPerformingItems.slice(0, 4).map((item, i) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSendMessage(`What recommendations do you have to optimize sales for food item "${item.name}"?`)}
                            className="w-full text-left bg-neutral-900/60 hover:bg-neutral-800 p-1.5 rounded-lg border border-white/5 hover:border-amber-500/20 flex items-center justify-between text-[8px] cursor-pointer text-zinc-300 hover:text-white"
                          >
                            <div className="min-w-0 pr-1 shrink">
                              <p className="font-bold text-white truncate text-[8.7px]">
                                {i+1}. {item.name}
                              </p>
                              <p className="text-[7.2px] text-zinc-500 font-mono">
                                {item.category}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-mono text-amber-400 font-extrabold text-[8.7px]">
                                {item.qty} sold
                              </p>
                              <p className="text-[6.8px] text-zinc-500 font-mono">
                                R {item.revenue.toFixed(0)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-2.5 border border-dashed border-white/5 rounded-lg">
                        <p className="text-[7.8px] text-zinc-500 font-mono leading-relaxed">
                          No orders registered yet to compile item performance rankings. Once a cart is checked out, dynamic sales counts will display here!
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* REGULAR GRID VIEW */
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  
                  {/* 1. Recent Inquiries (User Questions) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono uppercase tracking-wider text-orange-400 font-extrabold flex items-center gap-1">
                        <History size={9} />
                        Recent Queries
                      </span>
                      <span className="text-[7.5px] text-zinc-500 font-mono">click to repeat</span>
                    </div>
                    
                    <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto pr-1">
                      {recentQueries.slice(0, 3).map((query, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(query)}
                          className={`w-full flex items-center justify-between p-1.5 rounded-xl transition-all text-left cursor-pointer group ${
                            isHighContrast 
                              ? "bg-black border-2 border-white hover:border-yellow-400 text-white font-bold" 
                              : "bg-neutral-900/50 border border-white/5 hover:border-orange-500/25"
                          }`}
                        >
                          <span className={`text-[9.5px] truncate flex-1 pr-1.5 ${isHighContrast ? "text-white" : "text-zinc-300 group-hover:text-amber-400"}`}>
                            "{query}"
                          </span>
                          <ChevronRight size={9} className="text-zinc-600 group-hover:text-orange-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Last 3 Orders OR high-priority tickets */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono uppercase tracking-wider text-amber-400 font-extrabold flex items-center gap-1">
                        {isAdminMode ? <ShieldAlert size={9} className="text-red-400" /> : <Package size={9} />}
                        {isAdminMode ? "High-Priority Tickets (Pending)" : "Order Status (Last 3)"}
                      </span>
                      <span className="text-[7.5px] text-zinc-500 font-mono font-bold">
                        {isAdminMode ? "pending" : "view status"}
                      </span>
                    </div>
                    
                    {isAdminMode ? (
                      complaintTickets && complaintTickets.length > 0 ? (
                        <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto pr-1">
                          {complaintTickets.filter((t: any) => t.status === 'pending').slice(0, 3).map((ticket: any) => (
                            <button
                              key={ticket.id}
                              onClick={() => handleSendMessage(`What are the details of complaint ticket #${ticket.id} and how do we resolve it?`)}
                              className={`w-full flex items-center justify-between p-1.5 rounded-xl transition-all text-left cursor-pointer group ${
                                isHighContrast 
                                  ? "bg-black border-2 border-white hover:border-yellow-400 text-white font-bold" 
                                  : "bg-neutral-900/50 border border-white/5 hover:border-amber-500/25"
                              }`}
                              title={`Query customer complain of ${ticket.customerName}`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className="text-[8.5px] font-mono font-extrabold text-red-500 shrink-0">
                                  #{ticket.id}
                                </span>
                                <span className="text-[8.5px] text-zinc-300 group-hover:text-white truncate">
                                  {ticket.customerName}: {ticket.complaintText}
                                </span>
                              </div>
                              <ChevronRight size={9} className="text-zinc-600 group-hover:text-orange-400 shrink-0" />
                            </button>
                          ))}
                          {complaintTickets.filter((t: any) => t.status === 'pending').length === 0 && (
                            <div className={`p-2 border border-dashed rounded-xl bg-neutral-900/40 text-center ${isHighContrast ? "border-white" : "border-white/5"}`}>
                              <p className="text-[8px] text-zinc-500">All customer complaint tickets resolved! Ubuntu active.</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`p-2 border border-dashed rounded-xl bg-neutral-900/40 text-center ${isHighContrast ? "border-white" : "border-white/5"}`}>
                          <p className="text-[8px] text-zinc-500">No complaints logged yet.</p>
                        </div>
                      )
                    ) : (
                      orders && orders.length > 0 ? (
                        <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto pr-1">
                          {[...orders].reverse().slice(0, 3).map((order) => {
                            const orderNum = order.id.toUpperCase().slice(-6);
                            
                            // Status styling & badges
                            const statusColor = isHighContrast
                              ? "text-white bg-black border border-white font-bold"
                              : (order.status === "delivered" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                                 order.status === "on-the-way" ? "text-blue-400 bg-blue-500/10 border-blue-500/20" :
                                 order.status === "preparing" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                                 "text-orange-400 bg-orange-500/10 border-orange-500/20");

                            const pulseType = 
                              order.status === "preparing" ? "bg-amber-500 animate-pulse" :
                              order.status === "on-the-way" ? "bg-blue-400 animate-bounce" :
                              order.status === "delivered" ? "bg-emerald-400" :
                              "bg-orange-500";

                            return (
                              <button
                                key={order.id}
                                onClick={() => handleSendMessage(`What is the kitchen status of order #${order.id}?`)}
                                className={`w-full flex items-center justify-between p-1.5 rounded-xl transition-all text-left cursor-pointer group ${
                                  isHighContrast 
                                    ? "bg-black border-2 border-white hover:border-yellow-400 text-white font-bold" 
                                    : "bg-neutral-900/50 border border-white/5 hover:border-amber-500/25"
                                }`}
                                title="Query status of this order"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[9.5px] font-mono font-extrabold ${isHighContrast ? "text-white" : "text-zinc-200 group-hover:text-white"}`}>
                                    #{orderNum}
                                  </span>
                                  <span className="text-[7.5px] text-zinc-500 font-mono">
                                    ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
                                  </span>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-mono font-black uppercase tracking-wider flex items-center gap-1 ${statusColor}`}>
                                  <span className={`w-1 h-1 rounded-full ${pulseType}`} />
                                  {order.status}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className={`p-2 border border-dashed rounded-xl bg-neutral-900/40 text-center flex flex-col justify-center items-center gap-0.5 ${
                          isHighContrast ? "border-white" : "border-white/5"
                        }`}>
                          <p className="text-[8px] text-zinc-500">No active orders placed yet.</p>
                          <button
                            onClick={() => onNavigateToTab('menu')}
                            className="text-[7.5px] font-mono text-orange-400 hover:text-orange-300 font-black uppercase underline"
                          >
                            Grab Food 🍛
                          </button>
                        </div>
                      )
                    )}
                  </div>

                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Stream Area */}
      <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin transition-colors duration-200 ${
        isHighContrast 
          ? "scrollbar-thumb-white bg-black" 
          : "scrollbar-thumb-neutral-900 bg-gradient-to-b from-[#0c0705] via-[#0f0a08] to-[#0c0705]"
      }`}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2.5 max-w-[85%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Sender Avatar */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border uppercase font-black font-mono text-[9px] ${
                isHighContrast
                  ? msg.sender === "user"
                    ? "bg-white text-black border-white"
                    : "bg-black text-white border-white border-2"
                  : msg.sender === "user" 
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/10" 
                    : "bg-neutral-950 text-orange-500 border-white/5"
              }`}>
                {msg.sender === "user" ? userName.slice(0, 2) : <Bot size={13} />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1">
                <div className={`p-3.5 rounded-2xl transition-all duration-200 ${
                  isHighContrast
                    ? msg.sender === "user"
                      ? "bg-neutral-900 border-2 border-amber-400 text-white rounded-tr-none font-bold"
                      : "bg-black border-2 border-white text-white rounded-tl-none font-bold"
                    : msg.sender === "user"
                      ? "bg-gradient-to-br from-orange-600 to-amber-600 text-white rounded-tr-none shadow-md shadow-orange-950/25"
                      : msg.isError
                      ? "bg-red-950/20 border border-red-900/40 text-red-100 rounded-tl-none"
                      : "bg-[#140c09] border border-orange-500/5 text-zinc-100 rounded-tl-none shadow-lg shadow-neutral-950/30"
                }`}>
                  <div className="space-y-1.5">
                    {renderMessageText(msg.text)}
                  </div>
                </div>
                {/* Timestamp line */}
                <div className={`text-[7px] text-zinc-500 font-mono ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                  {msg.timestamp}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading typing state indicators */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2.5 max-w-[50%] mr-auto items-center"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isHighContrast ? "bg-black border-2 border-white text-white" : "bg-neutral-950 border border-white/5 text-orange-500"
            }`}>
              <Bot size={13} />
            </div>
            <div className={`p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 h-9 transition-colors duration-200 ${
              isHighContrast ? "bg-black border-2 border-white" : "bg-[#140c09] border border-orange-500/5"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s] ${isHighContrast ? "bg-white" : "bg-orange-500"}`} />
              <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s] ${isHighContrast ? "bg-white/80" : "bg-amber-500"}`} />
              <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isHighContrast ? "bg-white/60" : "bg-orange-400"}`} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips Row */}
      <div className={`px-4 py-2 border-t shrink-0 transition-colors duration-200 ${
        isHighContrast ? "bg-black border-white border-t-2" : "bg-neutral-950/50 border-white/5"
      }`}>
        <span className="text-[7.5px] font-mono uppercase tracking-wider text-zinc-500 block">
          ⚡ Quick Action Chips
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-neutral-900 snap-x select-none">
          {(isAdminMode ? ADMIN_QUICK_ACTIONS : QUICK_ACTIONS).map((action, idx) => (
            <button
              key={idx}
              disabled={isTyping}
              onClick={() => handleSendMessage(action.query)}
              className={`px-3 py-1.5 text-[9.5px] font-sans rounded-xl cursor-pointer whitespace-nowrap snap-center transition-all disabled:opacity-50 flex items-center gap-1.5 scale-100 hover:scale-[1.02] active:scale-95 ${
                isHighContrast
                  ? "bg-black border-2 border-white text-white hover:bg-neutral-900 font-bold"
                  : isAdminMode
                  ? "bg-neutral-900 hover:bg-neutral-800 border border-purple-500/10 hover:border-purple-500/30 text-zinc-300 font-medium"
                  : "bg-[#140d0a] hover:bg-neutral-900 border border-orange-500/10 hover:border-orange-500/30 text-zinc-300"
              }`}
            >
              {getActionIcon(action.icon)}
              <span>{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area Footer input panel */}
      <div className={`p-3 pb-5 shrink-0 transition-colors duration-200 ${
        isHighContrast ? "bg-black border-t-2 border-white" : "bg-neutral-950/80 border-t border-orange-500/10"
      }`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputVal);
          }}
          className={`flex gap-2 rounded-xl p-1.5 items-center relative transition-colors duration-200 ${
            isHighContrast ? "bg-black border-2 border-white" : "bg-neutral-900 border border-white/5 focus-within:border-orange-500/30"
          }`}
        >
          <input
            type="text"
            required
            disabled={isTyping}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={isAdminMode ? "Query sales details, inventory limits, pricing audits, tickets..." : "Ask about orders, gluten, vegetarian, combos..."}
            className="flex-1 bg-transparent border-none text-[11px] text-white outline-none pl-2.5 placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            style={isHighContrast ? undefined : {
              boxShadow: '0 0 10px rgba(234, 88, 12, 0.25)'
            }}
            className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all disabled:opacity-30 disabled:scale-100 disabled:shadow-none cursor-pointer scale-100 active:scale-95 ${
              isHighContrast
                ? "bg-white text-black hover:bg-neutral-200"
                : "bg-orange-600 hover:bg-orange-500 text-neutral-950"
            }`}
          >
            <Send size={12} className={isHighContrast ? "text-black stroke-[2.5px]" : "text-neutral-950 stroke-[2.5px]"} />
          </button>
        </form>
        <div className="flex justify-between items-center text-[7.2px] text-zinc-600 font-mono mt-2 px-1">
          <span>Replies powered by Gemini AI</span>
          <span className="uppercase text-amber-600 font-semibold flex items-center gap-0.5">
            <Sparkle size={6} className="animate-spin" /> Mzansi Smart Kitchen
          </span>
        </div>
      </div>
    </div>
  );
}
