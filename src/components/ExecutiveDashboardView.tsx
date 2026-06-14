import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, doc, setDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import ChatbotView from './ChatbotView';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  Coins,
  Clock,
  Truck,
  ShieldAlert,
  Users,
  Activity,
  Cpu,
  Sparkles,
  RefreshCw,
  Sliders,
  Sun,
  CloudRain,
  Zap,
  CheckCircle,
  Percent,
  MapPin,
  Flame,
  AlertTriangle,
  ChevronRight,
  HelpCircle,
  Trash2,
  PlusCircle,
  Package,
  Plus,
  Shield,
  ShieldCheck,
  Award,
  AlertOctagon,
  Wrench,
  Star,
  Target,
} from 'lucide-react';

interface ExecutiveDashboardViewProps {
  orders: any[];
  loyalty: any;
  menuItems: any[];
  setMenuItems: React.Dispatch<React.SetStateAction<any[]>>;
  onClose: () => void;
  onIssueCompensation?: (points: number) => void;
}

export default function ExecutiveDashboardView({
  orders,
  loyalty,
  menuItems,
  setMenuItems,
  onClose,
  onIssueCompensation,
}: ExecutiveDashboardViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'financials' | 'logistics' | 'ai-prediction' | 'menu-mgmt' | 'tickets' | 'analytics' | 'feedback' | 'loyalty'>('analytics');
  const [feedbackStarFilter, setFeedbackStarFilter] = useState<number | 'all'>('all');
  const [loyaltyChartMode, setLoyaltyChartMode] = useState<'stacked' | 'grouped'>('stacked');
  const [selectedLoyaltyCategory, setSelectedLoyaltyCategory] = useState<'Bunny Chow' | 'Shwamma' | 'Vetkoek' | 'Burgers' | 'Pizza' | 'Desserts' | 'Beverages' | null>(null);
  const [showLoyaltyTrend, setShowLoyaltyTrend] = useState<boolean>(true);
  const [spendingGoal, setSpendingGoal] = useState<number>(() => {
    const saved = localStorage.getItem('durban_loyalty_spending_goal');
    return saved ? parseInt(saved, 10) : 10000;
  });

  useEffect(() => {
    localStorage.setItem('durban_loyalty_spending_goal', spendingGoal.toString());
  }, [spendingGoal]);

  // Customer complaints / RBAC Governance ticketing engine
  const [complaintTickets, setComplaintTickets] = useState<any[]>(() => {
    const saved = localStorage.getItem('durban_complaint_tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // continue
      }
    }
    return [
      {
        id: 'T-101',
        customerName: 'Sipho Gumede',
        userEmail: 'sipho.g@gmail.com',
        orderRef: '#3810',
        timestamp: '10 mins ago',
        severity: 'high',
        complaintText: 'The curried mince vetkoek was lukewarm when Ndumiso arrived. Ndumiso got stuck in Florida Berea traffic and the plate was cold!',
        status: 'pending',
      },
      {
        id: 'T-102',
        customerName: 'Zama Khumalo',
        userEmail: 'zama.k@outlook.com',
        orderRef: '#4921',
        timestamp: '25 mins ago',
        severity: 'critical',
        complaintText: 'I ordered the Quarter Lamb Bunny Chow and asked for "Mild". It arrived extremely high-spiced! I had to drink three glasses of milk. Total fire in my mouth! 🌶️🌶️🌶️',
        status: 'pending',
      },
      {
        id: 'T-103',
        customerName: 'David Botha',
        userEmail: 'david.b@yahoo.co.za',
        orderRef: '#4940',
        timestamp: '1 hour ago',
        severity: 'medium',
        complaintText: 'Peach Rooibos Tea was missing from the takeaway carrier bag completely. Only received the Boerewors Pizza! Please check packing checkers.',
        status: 'pending',
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('durban_complaint_tickets', JSON.stringify(complaintTickets));
  }, [complaintTickets]);

  // Operational systems log
  const [rbacLogs, setRbacLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem('durban_rbac_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // continue
      }
    }
    return [
      `[MFA VERIFICATION] ADMIN_STAFF_01 verified via secure FIDO2 Hardware Token at 2026-05-27T09:23:00Z.`,
      `[RBAC ELEVATION] Assigned System Role: "Owner / Super Executive" under scope authorization.`,
      `[INTEGRITY CHECK] Sandbox environment verified. High priority security isolation enforcements ACTIVE.`
    ];
  });

  useEffect(() => {
    localStorage.setItem('durban_rbac_audit_logs', JSON.stringify(rbacLogs));
  }, [rbacLogs]);

  const addLog = (message: string) => {
    const now = new Date().toISOString().substring(11, 19);
    setRbacLogs((prev) => [`[${now}] ${message}`, ...prev].slice(0, 30));
  };

  // Dedicated Kitchen Queue deadlock simulation
  const [kitchenDeadlockActive, setKitchenDeadlockActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('durban_kitchen_deadlock');
    return saved === 'active' || saved === null || saved === '';
  });

  const handleResolveDeadlock = () => {
    setKitchenDeadlockActive(false);
    localStorage.setItem('durban_kitchen_deadlock', 'resolved');
    setCookingCongestionRatio(25);
    addLog(`[SECURITY OVERRIDE] Manual operational deadlock override triggered by Owner. Directed traffic to backup induction oven C.`);
    setAiFeed((prev) => [
      "⚡ Emergency pipeline bypass: Restored queue capacity through backup oven C.",
      ...prev
    ]);
  };

  // Handle ticket resolution
  const handleResolveTicket = (ticketId: string, type: 'cashback' | 'reprep' | 'dismiss') => {
    setComplaintTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return { ...t, status: type === 'cashback' ? 'resolved-cashback' : type === 'reprep' ? 'resolved-reprep' : 'dismissed' };
        }
        return t;
      })
    );

    const ticket = complaintTickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    if (type === 'cashback') {
      if (onIssueCompensation) {
        onIssueCompensation(50);
      }
      addLog(`[COMPENSATION ASSIGNED] Approved ticket ${ticketId} resolution: Transferred +50 Coins to ${ticket.customerName} (${ticket.userEmail}).`);
    } else if (type === 'reprep') {
      addLog(`[KITCHEN SCHEDULE] Approved ticket ${ticketId} resolution: Scheduled high-priority Re-preparation order workflow in kitchen queue.`);
    } else {
      addLog(`[ARCHIVE ACTION] Ticket ${ticketId} dismissed and designated as Resolved/Non-Refundable.`);
    }
  };

  // Admin security credentials levels representation
  const [adminRoleLevel, setAdminRoleLevel] = useState<'Owner' | 'Manager' | 'Dispatcher'>('Owner');
  const [mfaStatus, setMfaStatus] = useState<'Verified' | 'Unverified'>('Verified');

  // Interactive Live simulation state selectors (defined here to prevent block scope errors)
  const [demandMultiplier, setDemandMultiplier] = useState(1.0);

  // Cost Price Overrides & Interactive Financial Simulation States
  const [costOverrides, setCostOverrides] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('gauteng_menu_cost_overrides');
    return saved ? JSON.parse(saved) : {};
  });

  const [inflationMultiplier, setInflationMultiplier] = useState<number>(1.0); // supplies price index adjustments
  const [useLiveOnly, setUseLiveOnly] = useState<boolean>(false); // toggle between live orders only vs live + simulated base
  const [fixedOpexAssumption, setFixedOpexAssumption] = useState<number>(2450); // General daily opex assumption (rent, salaries, electricity)
  const [financeSortBy, setFinanceSortBy] = useState<'units' | 'revenue' | 'profit' | 'margin'>('units');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'low' | 'out' | 'Bunny Chow' | 'Burgers' | 'Vetkoek' | 'Pizza' | 'Shwamma' | 'Desserts' | 'Beverages'>('all');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [restockingAll, setRestockingAll] = useState(false);

  const RECIPES: Record<string, string[]> = {
    'Bunny Chow': ['Premium Bread Loaf', 'Aromatic Durban Curry Gravy', 'Free Range Mutton/Lamb cubes', 'Soft Potatoes', 'Fresh Cilantro Coriander'],
    'Vetkoek': ['Stone-ground Baking Flour', 'Golden Cooking Frying Oil', 'Spiced Mince Curry filling', 'Gauteng Yeast mix'],
    'Burgers': ['Smashed Wagyu Beef Patty', 'Sautéed Red Onions', 'Melted Cheddar slices', 'Toasted Sweet Brioche Buns', 'Spiced Burger Relish'],
    'Shwamma': ['Toasted Flat Arab Pita Pita', 'Marinated Chicken Strips', 'Garlic Hummus dressing', 'Crisp Cucumber & Tomatoes'],
    'Pizza': ['Stone-ground Wheat dough', 'Rich Pomodoro tomato sauce', 'Local Gauteng mozzarella', 'Cured Boerewors slices', 'Spicy Jalapeños'],
    'Desserts': ['Baked Butter Caramelised sponge', 'Premium Custard sauce', 'Brown Sugar and Butter syrup'],
    'Beverages': ['Brewed Rooibos Tea leaves', 'Peach Nectar syrup', 'Fresh Green Mint leaves', 'Ice cubes'],
    'fish-chips': ['Fresh Caught Cape Hake Fillet', 'Golden Crispy Secret Batter', 'Seasoned Slap Potatoes', 'Tangy Tartare herb dip Sauce', 'Malt Vinegar & Sea Salt'],
    'beef-chips': ['Premium Karoo Beef Sirloin Rib', 'Smoked Sticky Honey BBQ Marinade', 'Hand-cut Slap Idaho Potatoes', 'Aromatic Gauteng Braai Salt'],
    'chicken-buns': ['Zesty Spiced Chicken Thigh', 'Crunchy Breadcrumbs Batter', 'Brioche Sesame Burger Buns', 'Tangy Creamy Island Dressing', 'Crisp Mustard Coleslaw Salad'],
    'boerewors-hotdog': ['Flame-grilled Spiced Boerewors', 'Toasted Long Sesame Bun Roll', 'Sweet Caramel caramelized onions', 'Zesty Spiced Tomato Relish Mix', 'Tangy German Mustard paste'],
  };

  const handleSetCostPrice = (itemId: string, costValue: number) => {
    const rawCost = Math.max(0, costValue);
    const updated = { ...costOverrides, [itemId]: rawCost };
    setCostOverrides(updated);
    localStorage.setItem('gauteng_menu_cost_overrides', JSON.stringify(updated));
  };

  const handleRestockAllLowItems = async () => {
    setRestockingAll(true);
    let restockedCount = 0;
    try {
      const batch = writeBatch(db);
      menuItems.forEach((item) => {
        const currentStock = inventoryStock[item.id] !== undefined ? inventoryStock[item.id] : 30;
        if (currentStock <= 15) {
          const docRef = doc(db, 'inventory', item.id);
          batch.set(docRef, {
            itemId: item.id,
            stock: 95,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          restockedCount++;
          // update local copy temporarily too
          setInventoryStock(prev => ({ ...prev, [item.id]: 95 }));
        }
      });
      if (restockedCount > 0) {
        await batch.commit();
        setFormSuccess(`Smart Restock Action Complete: Successfully restocked ${restockedCount} low-stock menu items to 95 units!`);
        setTimeout(() => setFormSuccess(null), 5000);
      } else {
        setFormSuccess("All menu assets are currently adequately stocked above safety levels (15 units). No auto-restock needed!");
        setTimeout(() => setFormSuccess(null), 5000);
      }
    } catch (e) {
      console.error("Bulk restock failed:", e);
      setFormError("Error occurred during bulk restock operation.");
      setTimeout(() => setFormError(null), 5050);
    } finally {
      setRestockingAll(false);
    }
  };

  // Detailed real-time sales & profit intelligence
  const financeMetrics = useMemo(() => {
    // 1. Base simulation rates (so the board remains beautiful even if we have zero/low custom orders, but incorporates live orders fully!)
    const simulatedDailyRevenue = 12495.00 * demandMultiplier;
    
    // 2. Compute LIVE orders data
    const liveOrdersList = orders || [];
    const totalLiveSales = liveOrdersList.reduce((sum, o) => sum + (o.total || 0), 0);
    
    // In order to let the admin toggle or blend, define actual parameters
    const totalRevenues = useLiveOnly 
      ? totalLiveSales 
      : (simulatedDailyRevenue + totalLiveSales);

    // Calculate COGS (Cost of Goods Sold)
    let liveCOGS = 0;
    liveOrdersList.forEach((order) => {
      if (order && order.items && Array.isArray(order.items)) {
        order.items.forEach((orderItem: any) => {
          const qty = orderItem.quantity || 1;
          const price = orderItem.menuItem?.price || 0;
          const baseCost = costOverrides[orderItem.menuItem?.id] !== undefined
            ? costOverrides[orderItem.menuItem.id]
            : price * 0.45;
          
          let toppingsCost = 0;
          if (orderItem.selectedToppings && Array.isArray(orderItem.selectedToppings)) {
            toppingsCost = orderItem.selectedToppings.reduce((sum: number, top: any) => sum + ((top.price || 0) * 0.35), 0);
          }
          
          liveCOGS += (baseCost + toppingsCost) * qty;
        });
      }
    });

    const simulatedCOGS = simulatedDailyRevenue * 0.42;
    const totalCOGS = (useLiveOnly ? liveCOGS : (simulatedCOGS + liveCOGS)) * inflationMultiplier;

    // Coupon offsets and coin discounts
    const liveDiscounts = liveOrdersList.reduce((sum, o) => sum + (o.pointsDiscount || 0) + (o.couponDiscount || 0), 0);
    const simulatedDiscounts = simulatedDailyRevenue * 0.04; // 4% average promotion offset in Gauteng
    const totalDiscounts = useLiveOnly ? liveDiscounts : (simulatedDiscounts + liveDiscounts);

    // Dynamic Operating Expenses (OPEX): fixed overheads like salaries, kitchen maintenance, electricity + transaction fees
    const transactionFees = totalRevenues * 0.029; // 2.9% average processing standard fee
    
    const liveDeliveries = liveOrdersList.filter(o => o.diningOption === 'takeaway').length;
    const deliveryOverhead = (useLiveOnly ? liveDeliveries : 45) * 15; // 45 deliveries baseline in simulation

    const totalOPEX = fixedOpexAssumption + transactionFees + deliveryOverhead;

    // Gross Profit & Net Profit
    const grossProfit = Math.max(0, totalRevenues - totalCOGS);
    const netProfit = totalRevenues - totalCOGS - totalOPEX - totalDiscounts;

    // Profit margin percentage
    const grossMarginPct = totalRevenues > 0 ? (grossProfit / totalRevenues) * 100 : 0;
    const netMarginPct = totalRevenues > 0 ? (netProfit / totalRevenues) * 100 : 0;

    // Grouping sales & profits by food category
    const categoryMetrics: Record<string, { revenue: number; cogs: number; profit: number; qtySold: number }> = {
      'Bunny Chow': { revenue: 0, cogs: 0, profit: 0, qtySold: 0 },
      'Vetkoek': { revenue: 0, cogs: 0, profit: 0, qtySold: 0 },
      'Burgers': { revenue: 0, cogs: 0, profit: 0, qtySold: 0 },
      'Shwamma': { revenue: 0, cogs: 0, profit: 0, qtySold: 0 },
      'Pizza': { revenue: 0, cogs: 0, profit: 0, qtySold: 0 },
      'Desserts': { revenue: 0, cogs: 0, profit: 0, qtySold: 0 },
      'Beverages': { revenue: 0, cogs: 0, profit: 0, qtySold: 0 },
    };

    // Calculate from actual orders
    liveOrdersList.forEach((order) => {
      if (order && order.items && Array.isArray(order.items)) {
        order.items.forEach((orderItem: any) => {
          const cat = orderItem.menuItem?.category || 'Bunny Chow';
          const qty = orderItem.quantity || 1;
          const price = orderItem.menuItem?.price || 0;
          const itemCost = costOverrides[orderItem.menuItem?.id] !== undefined
            ? costOverrides[orderItem.menuItem.id]
            : price * 0.45;

          let toppingsSum = 0;
          if (orderItem.selectedToppings) {
            toppingsSum = orderItem.selectedToppings.reduce((sum: number, t: any) => sum + (t.price || 0), 0);
          }

          const rev = (price + toppingsSum) * qty;
          const cost = (itemCost + (toppingsSum * 0.35)) * qty;

          if (categoryMetrics[cat]) {
            categoryMetrics[cat].revenue += rev;
            categoryMetrics[cat].cogs += cost;
            categoryMetrics[cat].qtySold += qty;
          }
        });
      }
    });

    if (!useLiveOnly) {
      categoryMetrics['Bunny Chow'].revenue += simulatedDailyRevenue * 0.35;
      categoryMetrics['Bunny Chow'].cogs += simulatedDailyRevenue * 0.35 * 0.45;
      categoryMetrics['Bunny Chow'].qtySold += Math.round(simulatedDailyRevenue * 0.35 / 110);

      categoryMetrics['Vetkoek'].revenue += simulatedDailyRevenue * 0.22;
      categoryMetrics['Vetkoek'].cogs += simulatedDailyRevenue * 0.22 * 0.40;
      categoryMetrics['Vetkoek'].qtySold += Math.round(simulatedDailyRevenue * 0.22 / 55);

      categoryMetrics['Burgers'].revenue += simulatedDailyRevenue * 0.20;
      categoryMetrics['Burgers'].cogs += simulatedDailyRevenue * 0.20 * 0.48;
      categoryMetrics['Burgers'].qtySold += Math.round(simulatedDailyRevenue * 0.20 / 95);

      categoryMetrics['Pizza'].revenue += simulatedDailyRevenue * 0.12;
      categoryMetrics['Pizza'].cogs += simulatedDailyRevenue * 0.12 * 0.42;
      categoryMetrics['Pizza'].qtySold += Math.round(simulatedDailyRevenue * 0.12 / 125);

      categoryMetrics['Desserts'].revenue += simulatedDailyRevenue * 0.06;
      categoryMetrics['Desserts'].cogs += simulatedDailyRevenue * 0.06 * 0.35;
      categoryMetrics['Desserts'].qtySold += Math.round(simulatedDailyRevenue * 0.06 / 48);

      categoryMetrics['Beverages'].revenue += simulatedDailyRevenue * 0.05;
      categoryMetrics['Beverages'].cogs += simulatedDailyRevenue * 0.05 * 0.25;
      categoryMetrics['Beverages'].qtySold += Math.round(simulatedDailyRevenue * 0.05 / 28);
    }

    Object.keys(categoryMetrics).forEach(k => {
      const cat = categoryMetrics[k];
      cat.profit = cat.revenue - cat.cogs;
    });

    return {
      totalRevenues,
      totalCOGS,
      totalOPEX,
      totalDiscounts,
      grossProfit,
      netProfit,
      grossMarginPct,
      netMarginPct,
      categoryMetrics,
      liveRevenues: totalLiveSales,
      simulatedRevenues: simulatedDailyRevenue
    };
  }, [orders, demandMultiplier, costOverrides, inflationMultiplier, fixedOpexAssumption, useLiveOnly]);

  // Live Inventory Stock State synced to Firestore
  const [inventoryStock, setInventoryStock] = useState<Record<string, number>>({});
  const [criticalStockToasts, setCriticalStockToasts] = useState<{ id: string; message: string; timestamp: string }[]>([]);
  const prevStockRef = useRef<Record<string, number>>({});

  useEffect(() => {
    // Subscribe to Firestore /inventory collection in real-time
    const unsubscribe = onSnapshot(collection(db, 'inventory'), async (snapshot) => {
      if (snapshot.empty) {
        // Seed default stock values into database
        const batch = writeBatch(db);
        const tempStock: Record<string, number> = {};
        menuItems.forEach((item) => {
          const seedValue = (item.id.charCodeAt(0) || 12) + (item.name.length * 2);
          const stockVal = Math.round(Math.min(55, Math.max(12, seedValue % 50)));
          tempStock[item.id] = stockVal;
          const ref = doc(db, 'inventory', item.id);
          batch.set(ref, {
            itemId: item.id,
            itemName: item.name,
            stock: stockVal,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        });
        await batch.commit();
        setInventoryStock(tempStock);
      } else {
        const stockMap: Record<string, number> = {};
        const newToasts: { id: string; message: string; timestamp: string }[] = [];

        snapshot.forEach((doc) => {
          const itemId = doc.id;
          const data = doc.data();
          const stock = data.stock !== undefined ? data.stock : 30;
          stockMap[itemId] = stock;

          const prevStock = prevStockRef.current[itemId];
          // Check if stock has now dropped below 10
          if (stock < 10) {
            // Trigger toast if:
            // 1. We didn't know the previous stock yet, or
            // 2. The previous stock was >= 10, or
            // 3. The stock decreased further (e.g. from 9 to 8)
            if (prevStock === undefined || prevStock >= 10 || stock < prevStock) {
              const itemName = data.itemName || menuItems.find(m => m.id === itemId)?.name || itemId;
              newToasts.push({
                id: `${itemId}-${Date.now()}-${Math.random()}`,
                message: `Real-time Alert: "${itemName}" is low on stock (${stock} left!). Refill soon to prevent stock-out.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              });
            }
          }
          prevStockRef.current[itemId] = stock;
        });

        // Make sure all menuItems are accounted for, if some aren't present we fill them
        menuItems.forEach((item) => {
          if (stockMap[item.id] === undefined) {
            stockMap[item.id] = 30;
            if (prevStockRef.current[item.id] === undefined) {
              prevStockRef.current[item.id] = 30;
            }
          }
        });

        setInventoryStock(stockMap);

        if (newToasts.length > 0) {
          setCriticalStockToasts((prev) => [...newToasts, ...prev].slice(0, 5));
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'inventory');
    });

    return () => unsubscribe();
  }, [menuItems]);

  // Real-time Feedbacks from Firestore database
  const [dbFeedbacks, setDbFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'feedback'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Sort by createdAt descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setDbFeedbacks(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'feedback');
    });

    return () => unsubscribe();
  }, []);

  const feedbackMetrics = useMemo(() => {
    // Inject some realistic baseline reviews to prevent blank experience during initial preview
    const baselineReviews = [
      { id: 'FB-SEED-1', rating: 5, comment: 'Spicy Lamb Bunny was absolutely superb! Hot, spicy and well packed. NDUMISO is a fast driver!', userName: 'Nkululeko Mthembu', createdAt: '2026-05-29T10:30:00Z', transactionId: 'TXN-9810' },
      { id: 'FB-SEED-2', rating: 4, comment: 'Lekker coins are neat! Vetkoek was warm, but a bit greasy. Overall excellent service.', userName: 'Lerato Zulu', createdAt: '2026-05-29T11:15:00Z', transactionId: 'TXN-9821' },
      { id: 'FB-SEED-3', rating: 5, comment: 'Best shwamma in Tshwane! Highly recommended 10/10.', userName: 'Devon Naidoo', createdAt: '2026-05-29T11:45:00Z', transactionId: 'TXN-9830' },
      { id: 'FB-SEED-4', rating: 5, comment: 'Great service bypass features. Safe layout and good checkout flow.', userName: 'Jan de Klerk', createdAt: '2026-05-29T12:00:00Z', transactionId: 'TXN-9844' }
    ];

    // Combine database feedbacks with baseline reviews, prioritizing actual database feedbacks if they exist
    const allReviews = dbFeedbacks.length > 0 ? dbFeedbacks : baselineReviews;
    
    // Star counts
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    allReviews.forEach(r => {
      const rat = Math.max(1, Math.min(5, Math.round(Number(r.rating || 5)))) as 1|2|3|4|5;
      distribution[rat] = (distribution[rat] || 0) + 1;
      sum += rat;
    });

    const total = allReviews.length;
    const avg = total > 0 ? (sum / total).toFixed(1) : '5.0';
    const happyCount = (distribution[5] || 0) + (distribution[4] || 0);
    const happyPct = total > 0 ? Math.round((happyCount / total) * 100) : 100;

    return {
      allReviews,
      distribution,
      total,
      avg,
      happyPct
    };
  }, [dbFeedbacks]);

  // Spending distribution across categories over 6 months & loyalty analytics metrics
  const loyaltyAnalytics = useMemo(() => {
    // Generate the last 6 months dynamically relative to June 2026 baseline
    const months: { key: string; label: string; year: number; month: number }[] = [];
    const baseDate = new Date(2026, 5, 1); // June 1st, 2026 baseline
    for (let i = 5; i >= 0; i--) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: `${monthLabel} ${d.getFullYear()}`,
        year: d.getFullYear(),
        month: d.getMonth()
      });
    }

    const categories = ['Bunny Chow', 'Shwamma', 'Vetkoek', 'Burgers', 'Pizza', 'Desserts', 'Beverages'];
    
    // Realistic multi-month baseline customer segment spend distribution (ZAR)
    // Helps avoid an empty look while showing structured real data overlay
    const baselineData: Record<string, Record<string, number>> = {
      '2026-01': { 'Bunny Chow': 2850, 'Shwamma': 1900, 'Vetkoek': 1420, 'Burgers': 3100, 'Pizza': 4200, 'Desserts': 850, 'Beverages': 1350 },
      '2026-02': { 'Bunny Chow': 3100, 'Shwamma': 2250, 'Vetkoek': 1550, 'Burgers': 3400, 'Pizza': 4450, 'Desserts': 920, 'Beverages': 1500 },
      '2026-03': { 'Bunny Chow': 3500, 'Shwamma': 2400, 'Vetkoek': 1750, 'Burgers': 3800, 'Pizza': 4900, 'Desserts': 1080, 'Beverages': 1800 },
      '2026-04': { 'Bunny Chow': 3950, 'Shwamma': 2700, 'Vetkoek': 1950, 'Burgers': 4200, 'Pizza': 5200, 'Desserts': 1200, 'Beverages': 2000 },
      '2026-05': { 'Bunny Chow': 4300, 'Shwamma': 3100, 'Vetkoek': 2300, 'Burgers': 4680, 'Pizza': 5700, 'Desserts': 1350, 'Beverages': 2450 },
      '2026-06': { 'Bunny Chow': 1450, 'Shwamma': 950, 'Vetkoek': 820, 'Burgers': 1650, 'Pizza': 2100, 'Desserts': 480, 'Beverages': 890 }
    };

    const parsedData: Record<string, Record<string, number>> = {};
    months.forEach((m) => {
      parsedData[m.key] = {
        'Bunny Chow': 0,
        'Shwamma': 0,
        'Vetkoek': 0,
        'Burgers': 0,
        'Pizza': 0,
        'Desserts': 0,
        'Beverages': 0,
      };

      // Populate default baseline first
      if (baselineData[m.key]) {
        categories.forEach(cat => {
          parsedData[m.key][cat] = baselineData[m.key][cat] || 0;
        });
      }
    });

    // Process actual orders from props layered on top
    let realOrdersSpend = 0;
    let realOrdersCount = 0;
    let totalPointsEarned = 0;
    let totalPointsRedeemed = 0;

    // Filtered real order stats
    let catSpecificRealOrdersCount = 0;
    let catSpecificRealOrdersSpend = 0;

    (orders || []).forEach((order) => {
      if (!order) return;
      
      realOrdersCount++;
      realOrdersSpend += order.total || 0;
      totalPointsEarned += order.pointsEarned || 0;
      totalPointsRedeemed += (order.pointsDiscount || 0) * 10;

      let orderDate = new Date(baseDate); // default to current relative base
      const timestamp = order.timestamp;
      
      if (timestamp) {
        if (timestamp.includes('T') || timestamp.includes('-')) {
          const d = new Date(timestamp);
          if (!isNaN(d.getTime())) {
            orderDate = d;
          }
        } else if (timestamp.includes('Yesterday')) {
          const yesterday = new Date(baseDate);
          yesterday.setDate(yesterday.getDate() - 1);
          orderDate = yesterday;
        }
      }
      
      const year = orderDate.getFullYear();
      const monthStr = String(orderDate.getMonth() + 1).padStart(2, '0');
      const orderMonthKey = `${year}-${monthStr}`;

      let containsCategory = false;
      let categoryOrderTotal = 0;

      (order.items || []).forEach((item: any) => {
        const cat = item?.menuItem?.category;
        if (cat && parsedData[orderMonthKey][cat] !== undefined) {
          const itemPrice = item?.menuItem?.price || 0;
          const itemQty = item?.quantity || 1;
          const toppingsPrice = (item.selectedToppings || []).reduce((sum: number, top: any) => sum + (top.price || 0), 0);
          const itemTotal = (itemPrice + toppingsPrice) * itemQty;
          
          parsedData[orderMonthKey][cat] += itemTotal;

          if (selectedLoyaltyCategory && cat === selectedLoyaltyCategory) {
            containsCategory = true;
            categoryOrderTotal += itemTotal;
          }
        }
      });

      if (containsCategory) {
        catSpecificRealOrdersCount++;
        catSpecificRealOrdersSpend += categoryOrderTotal;
      }
    });

    // Map monthly stats to charts array
    const baseChartData = months.map((m) => {
      return {
        name: m.label,
        key: m.key,
        'Bunny Chow': Math.round(parsedData[m.key]['Bunny Chow']),
        'Shwamma': Math.round(parsedData[m.key]['Shwamma']),
        'Vetkoek': Math.round(parsedData[m.key]['Vetkoek']),
        'Burgers': Math.round(parsedData[m.key]['Burgers']),
        'Pizza': Math.round(parsedData[m.key]['Pizza']),
        'Desserts': Math.round(parsedData[m.key]['Desserts']),
        'Beverages': Math.round(parsedData[m.key]['Beverages']),
        total: Math.round(
          categories.reduce((sum, cat) => sum + parsedData[m.key][cat], 0)
        )
      };
    });

    // Compute Moving Average of the current active series
    const chartData = baseChartData.map((m, idx) => {
      const getVal = (item: typeof m) => {
        if (selectedLoyaltyCategory) {
          return item[selectedLoyaltyCategory] || 0;
        }
        return item.total;
      };

      // 3-Month Moving average
      let sum = 0;
      let count = 0;
      for (let j = Math.max(0, idx - 2); j <= idx; j++) {
        sum += getVal(baseChartData[j]);
        count++;
      }
      const movingAvg = Math.round(sum / count);

      return {
        ...m,
        movingAverage: movingAvg,
      };
    });

    // Calculate baseline opex and totals
    const baselineOrdersSpend = Object.values(baselineData).reduce((grandTotal, monthCatGroup) => {
      return grandTotal + Object.values(monthCatGroup).reduce((mSum, catVal) => mSum + catVal, 0);
    }, 0);

    const aggregateSpend = Math.round(baselineOrdersSpend + realOrdersSpend);
    const aggregatePointsIssued = Math.round(35450 + totalPointsEarned);
    const aggregatePointsRedeemed = Math.round(18400 + totalPointsRedeemed);
    const averageOrderValue = realOrdersCount > 0 ? (realOrdersSpend / realOrdersCount) : 108.50;

    // Filtered loyalty parameters
    let displaySpend = aggregateSpend;
    let displayAverageValue = averageOrderValue;
    let displayPointsIssued = aggregatePointsIssued;
    let displayPointsRedeemed = aggregatePointsRedeemed;
    let displayOrdersCount = realOrdersCount;

    if (selectedLoyaltyCategory) {
      // Sum baseline for only selected category
      const catBaselineSpend = Object.values(baselineData).reduce((sum, monthGroup) => {
        return sum + (monthGroup[selectedLoyaltyCategory] || 0);
      }, 0);

      displaySpend = Math.round(catBaselineSpend + catSpecificRealOrdersSpend);
      displayOrdersCount = catSpecificRealOrdersCount;
      displayAverageValue = displayOrdersCount > 0 ? (catSpecificRealOrdersSpend / displayOrdersCount) : (catBaselineSpend / 6 / 4); // logical estimate
      displayPointsIssued = Math.round(displaySpend * 0.05); // Estimate 5% coins return
      displayPointsRedeemed = Math.round(aggregatePointsRedeemed * (displaySpend / aggregateSpend)); // proportional share
    }

    // Build real + simulated historical transaction log entries for the selected cuisine
    const simulatedTransactions: Record<string, Array<{ id: string; customer: string; date: string; items: string; total: number; pointsEarned: number }>> = {
      'Bunny Chow': [
        { id: 'TXN-7411', customer: 'Sipho Gumede', date: '2026-05-29 11:24', items: '1x Quarter Lamb Bunny Chow (Hot)', total: 110, pointsEarned: 11 },
        { id: 'TXN-7399', customer: 'David Botha', date: '2026-05-28 14:15', items: '2x Quarter Beef Bunny Chow (Mild)', total: 200, pointsEarned: 20 },
        { id: 'TXN-7350', customer: 'Nomzamo Dube', date: '2026-05-25 18:02', items: '1x Full Bunny Chow Mzansi Feast', total: 280, pointsEarned: 28 }
      ],
      'Shwamma': [
        { id: 'TXN-8120', customer: 'Lerato Zulu', date: '2026-05-29 13:40', items: '1x Garlic Lamb Shwamma Split', total: 95, pointsEarned: 9 },
        { id: 'TXN-8095', customer: 'Jan de Klerk', date: '2026-05-27 12:10', items: '2x Spicy Chicken Shwamma Deluxe', total: 170, pointsEarned: 17 }
      ],
      'Vetkoek': [
        { id: 'TXN-6112', customer: 'Thabo Mbeki', date: '2026-05-28 09:12', items: '3x Traditional Curry Mince Vetkoek', total: 135, pointsEarned: 13 },
        { id: 'TXN-6090', customer: 'Zama Khumalo', date: '2026-05-26 15:30', items: '2x Syrup & Cheese Sweet Vetkoek', total: 70, pointsEarned: 7 }
      ],
      'Burgers': [
        { id: 'TXN-9122', customer: 'Devon Naidoo', date: '2026-05-29 19:40', items: '1x Double Mzansi Beef Burger', total: 125, pointsEarned: 12 },
        { id: 'TXN-9021', customer: 'Sipho Gumede', date: '2026-05-24 13:14', items: '2x Cheddar & Chili Chicken Burgers', total: 180, pointsEarned: 18 }
      ],
      'Pizza': [
        { id: 'TXN-5401', customer: 'Herman Pretorius', date: '2026-05-29 20:15', items: '1x Huge Boerewors & Chutney Pizza', total: 165, pointsEarned: 16 },
        { id: 'TXN-5322', customer: 'David Botha', date: '2026-05-24 17:45', items: '2x Biltong & Avocado Pizza Medium', total: 240, pointsEarned: 24 }
      ],
      'Desserts': [
        { id: 'TXN-4112', customer: 'Lerato Zulu', date: '2026-05-28 17:01', items: '2x Warm Malva Custard Meltdown', total: 110, pointsEarned: 11 },
        { id: 'TXN-4082', customer: 'Nomzamo Dube', date: '2026-05-26 19:45', items: '1x Peppermint Tart Sundae Bowl', total: 55, pointsEarned: 5 }
      ],
      'Beverages': [
        { id: 'TXN-3810', customer: 'Jan de Klerk', date: '2026-05-29 11:45', items: '2x Sparletta Cream Soda Float Glass', total: 60, pointsEarned: 6 },
        { id: 'TXN-3711', customer: 'Zama Khumalo', date: '2026-05-27 10:20', items: '3x Peach Rooibos Cold Brew Tea', total: 75, pointsEarned: 7 }
      ]
    };

    // Filtered real orders with this category
    const realFilteredOrders = (orders || []).filter((order) => {
      if (!selectedLoyaltyCategory) return true;
      return (order.items || []).some((item: any) => item?.menuItem?.category === selectedLoyaltyCategory);
    }).map((order) => {
      const displayItems = (order.items || []).map((item: any) => `${item?.quantity || 1}x ${item?.menuItem?.name || 'Item'}`).join(', ');
      return {
        id: order.id,
        customer: order.address ? 'Delivery Client' : 'Table Dine-In Client',
        date: order.timestamp || 'Just now',
        items: displayItems || 'Lekker feast',
        total: order.total || 0,
        pointsEarned: order.pointsEarned || 0,
        isReal: true
      };
    });

    const combinedTransactions = [
      ...realFilteredOrders,
      ...(selectedLoyaltyCategory ? (simulatedTransactions[selectedLoyaltyCategory] || []) : Object.values(simulatedTransactions).flat())
    ].sort((a, b) => b.date.localeCompare(a.date));

    // Current/latest month spend and name calculation for budget indicator
    const currentMonthData = chartData[chartData.length - 1] || { total: 0, name: 'Current Month' };
    const currentMonthName = currentMonthData.name;
    const currentMonthSpend = selectedLoyaltyCategory
      ? (currentMonthData[selectedLoyaltyCategory] || 0)
      : currentMonthData.total;

    return {
      chartData,
      aggregateSpend,
      aggregatePointsIssued,
      aggregatePointsRedeemed,
      averageOrderValue,
      realOrdersCount,
      // Filtered views
      displaySpend,
      displayAverageValue,
      displayPointsIssued,
      displayPointsRedeemed,
      displayOrdersCount,
      combinedTransactions,
      currentMonthName,
      currentMonthSpend
    };
  }, [orders, selectedLoyaltyCategory]);

  // Summarize today\'s order, points, and items for the Daily Sales card
  const dailySalesMetrics = useMemo(() => {
    const todayOrders = (orders || []).filter((order) => {
      const timestamp = order?.timestamp;
      if (!timestamp) return false;
      // If it's a simple HH:MM format like "14:35", it's today
      const timeRegex = /^\d{2}:\d{2}$/;
      if (timeRegex.test(timestamp)) return true;
      
      // If it doesn't contain "Yesterday" or any month keyword, it's today
      const nonTodayKeywords = ['Yesterday', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return !nonTodayKeywords.some(keyword => timestamp.includes(keyword));
    });

    const totalOrdersCount = todayOrders.length;
    
    // Total points redeemed = pointsDiscount * 10 sum
    const totalPointsRedeemed = todayOrders.reduce((sum, order) => {
      return sum + (order.pointsDiscount || 0) * 10;
    }, 0);

    // Most ordered item
    const itemCounts: { [name: string]: number } = {};
    todayOrders.forEach((order) => {
      order.items?.forEach((item: any) => {
        const name = item.menuItem?.name || 'Unknown Item';
        itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
      });
    });

    let mostOrderedItem = 'None yet';
    let maxQty = 0;
    Object.entries(itemCounts).forEach(([name, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        mostOrderedItem = `${name} (${qty}x)`;
      }
    });

    return {
      totalOrdersCount,
      totalPointsRedeemed,
      mostOrderedItem,
    };
  }, [orders]);

  // List of items under 10 units of stock
  const criticalItems = useMemo(() => {
    return (menuItems || []).filter((item) => {
      const stock = inventoryStock[item.id] !== undefined ? inventoryStock[item.id] : 30;
      return stock < 10;
    }).map(item => ({
      id: item.id,
      name: item.name,
      stock: inventoryStock[item.id] !== undefined ? inventoryStock[item.id] : 30,
      category: item.category || 'Other'
    }));
  }, [menuItems, inventoryStock]);

  const handleDismissToast = (toastId: string) => {
    setCriticalStockToasts(prev => prev.filter(t => t.id !== toastId));
  };

  // Adjust stock volume helper
  const handleAdjustStock = async (itemId: string, amount: number) => {
    const current = inventoryStock[itemId] !== undefined ? inventoryStock[itemId] : 30;
    const newVal = Math.max(0, Math.min(99, current + amount));
    setInventoryStock(prev => ({ ...prev, [itemId]: newVal }));
    try {
      const docRef = doc(db, 'inventory', itemId);
      await setDoc(docRef, {
        itemId,
        stock: newVal,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `inventory/${itemId}`);
    }
  };

  const handleSetExactStock = async (itemId: string, value: number) => {
    const newVal = Math.max(0, Math.min(99, value));
    setInventoryStock(prev => ({ ...prev, [itemId]: newVal }));
    try {
      const docRef = doc(db, 'inventory', itemId);
      await setDoc(docRef, {
        itemId,
        stock: newVal,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `inventory/${itemId}`);
    }
  };

  // State management for New Item Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'meal' | 'beverage' | 'dessert'>('meal');
  const [newItemCategory, setNewItemCategory] = useState<'Bunny Chow' | 'Vetkoek' | 'Shwamma' | 'Burgers' | 'Pizza'>('Bunny Chow');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemPrepTime, setNewItemPrepTime] = useState(10);
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Preset image card options
  const PRESET_FOODS = [
    {
      name: 'Quarter Lamb Bunny',
      type: 'meal' as const,
      category: 'Bunny Chow' as const,
      price: '110',
      description: 'Traditional soft white bread stuffed with hot spicy aromatic lamb stew.',
      image: '/src/assets/images/bunny_chow_1779831774338.png',
      prep: 12
    },
    {
      name: 'Mince Curry Vetkoek',
      type: 'meal' as const,
      category: 'Vetkoek' as const,
      price: '55',
      description: 'Fried fluffy dough pocket with robust spiced mince meat filling.',
      image: '/src/assets/images/vetkoek_1779831794743.png',
      prep: 10
    },
    {
      name: 'Jozi Double Smash',
      type: 'meal' as const,
      category: 'Burgers' as const,
      price: '95',
      description: 'Double thin-smashed beef patties, cheese, brioche, and special burger sauce.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      prep: 9
    },
    {
      name: 'Peach Rooibos Tea',
      type: 'beverage' as const,
      category: 'Beverages' as const,
      price: '28',
      description: 'House-brewed cold peach infused rooibos nectar, mint and ice.',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop&q=80',
      prep: 3
    },
    {
      name: 'Golden Malva Pudding',
      type: 'dessert' as const,
      category: 'Desserts' as const,
      price: '48',
      description: 'Caramelised sweet baked sponge pudding soaked in butter syrup and custard.',
      image: '/src/assets/images/malva_pudding_1779831809285.png',
      prep: 6
    },
    {
      name: 'Boerewors Pizza',
      type: 'meal' as const,
      category: 'Pizza' as const,
      price: '125',
      description: 'South African local fusion stone-baked pizza loaded with spicy boerewors.',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
      prep: 14
    }
  ];

  // Load a preset helper
  const handleApplyPreset = (preset: typeof PRESET_FOODS[0]) => {
    setNewItemName(preset.name);
    setNewItemType(preset.type);
    if (preset.type === 'meal') {
      setNewItemCategory(preset.category as any);
    }
    setNewItemPrice(preset.price);
    setNewItemDescription(preset.description);
    setNewItemPrepTime(preset.prep);
    setNewItemImage(preset.image);
    setFormError(null);
  };

  // Add Item to active list
  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!newItemName.trim()) {
      setFormError('Please enter a mouthwatering item name!');
      return;
    }

    const priceNum = parseFloat(newItemPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid price in ZAR (R) above R0.');
      return;
    }

    // Determine final category tag
    let finalCategory: 'Bunny Chow' | 'Shwamma' | 'Vetkoek' | 'Burgers' | 'Pizza' | 'Desserts' | 'Beverages';
    if (newItemType === 'beverage') {
      finalCategory = 'Beverages';
    } else if (newItemType === 'dessert') {
      finalCategory = 'Desserts';
    } else {
      finalCategory = newItemCategory;
    }

    // Default image if blank
    const finalImage = newItemImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';

    const newId = `${newItemType === 'beverage' ? 'bev-' : newItemType === 'dessert' ? 'dessert-' : 'meal-'}${Date.now()}`;

    // Construct item
    const newItemObject = {
      id: newId,
      name: newItemName.trim(),
      category: finalCategory,
      price: priceNum,
      description: newItemDescription.trim() || 'No description provided.',
      image: finalImage,
      rating: 5.0,
      ratingCount: 1,
      popular: false,
      preparationTime: newItemPrepTime
    };

    // Update parent state
    setMenuItems((prev) => [...prev, newItemObject]);
    
    // Assign 45 stock default
    setInventoryStock((prev) => ({ ...prev, [newId]: 45 }));

    // Reset fields
    setNewItemName('');
    setNewItemPrice('');
    setNewItemDescription('');
    setNewItemImage('');
    setNewItemPrepTime(10);
    setFormSuccess(`Successfully added "${newItemObject.name}" to menu!`);
    
    setTimeout(() => {
      setFormSuccess(null);
    }, 4000);
  };

  // Remove Item from menu
  const handleRemoveMenuItem = (id: string, name: string) => {
    if (window.confirm(`Are you absolutely sure you want to completely remove "${name}" from the menu?`)) {
      setMenuItems((prev) => prev.filter(item => item.id !== id));
      setFormSuccess(`Successfully removed "${name}" from the menu.`);
      
      // Clean inventory stock map
      setInventoryStock((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      setTimeout(() => {
        setFormSuccess(null);
      }, 4000);
    }
  };

  // Interactive Live simulation state selectors
  const [weatherCondition, setWeatherCondition] = useState<'sun' | 'rain'>('sun');
  const [trafficJamFactor, setTrafficJamFactor] = useState(1.0);
  const [cookingCongestionRatio, setCookingCongestionRatio] = useState(35); // %
  const [optimizerActive, setOptimizerActive] = useState(false);

  // Dynamic Metrics computed or updated reactively from inputs
  const [simulatedSalesHour, setSimulatedSalesHour] = useState<number[]>(
    [120, 240, 180, 480, 890, 620, 950, 410, 150]
  );
  
  // Custom operational states
  const [currentQueueLength, setCurrentQueueLength] = useState(4);
  const [avgPrepTimeSec, setAvgPrepTimeSec] = useState(485); // 8m 5s
  const [lateDeliveryCount, setLateDeliveryCount] = useState(1);
  const [liveOrdersTracked, setLiveOrdersTracked] = useState(14);
  const [failedPrepIncidents, setFailedPrepIncidents] = useState(0);

  // AI feed lines
  const [aiFeed, setAiFeed] = useState<string[]>([
    "📈 JHB CBD order volumes trending 18% above median.",
    "⚠️ Grid congestion detected: Gauteng Flame Grill is near maximum heat threshold.",
    "💡 Tip: Preempting Standard Mutton vetkoeks will save ~2.4 mins of queue latency.",
  ]);

  // Dynamic Forecasting engine based on past orders and demand multiplier
  const stockForecasts = useMemo(() => {
    const forecasts: Record<string, {
      salesRatePerDay: number;
      daysRemaining: number;
      runOutTimeText: string;
      replenishRecommended: boolean;
      confidence: string;
    }> = {};

    menuItems.forEach((item) => {
      // 1. Calculate how many items have been sold in past orders
      let totalSold = 0;
      if (orders && Array.isArray(orders)) {
        orders.forEach((order) => {
          if (order && order.items && Array.isArray(order.items)) {
            order.items.forEach((orderItem: any) => {
              if (orderItem && orderItem.menuItem && orderItem.menuItem.id === item.id) {
                totalSold += orderItem.quantity || 1;
              }
            });
          }
        });
      }

      // If no orders yet, let's assign a baseline virtual rate based on popularity or categories to make it realistic
      const baselineRate = item.popular ? 4.5 : item.category === 'Beverages' ? 3.0 : 2.5;
      
      // Calculate daily sales rate, amplified by simulated demandMultiplier
      const salesRatePerDay = (totalSold > 0 ? (totalSold * 1.8) : baselineRate) * demandMultiplier;
      
      // Get current stock
      const currentStock = inventoryStock[item.id] !== undefined ? inventoryStock[item.id] : 30;
      
      // Days remaining before stock-out
      let daysRemaining = 99;
      if (salesRatePerDay > 0) {
        daysRemaining = parseFloat((currentStock / salesRatePerDay).toFixed(1));
      }

      // If stock is already 0, days is 0
      if (currentStock === 0) {
        daysRemaining = 0;
      }

      // Recommendations threshold: 
      // Recommend replenish if daysRemaining <= 3.5, OR if currentStock is ≤ 15 and we have positive sales rate
      const replenishRecommended = currentStock === 0 || daysRemaining <= 3.5 || (currentStock <= 15 && salesRatePerDay > 1.5);

      // Creative formatted message
      let runOutTimeText = "";
      if (currentStock === 0) {
        runOutTimeText = "Stock Depleted";
      } else if (daysRemaining < 1) {
        runOutTimeText = "In < 24 Hours";
      } else if (daysRemaining === 1) {
        runOutTimeText = "1 Day";
      } else {
        runOutTimeText = `${daysRemaining} Days`;
      }

      // Calculate a pseudo confidence interval based on order samples
      const confidence = totalSold >= 3 ? "High (Order Backed)" : totalSold > 0 ? "Medium (Limited Samples)" : "Estimated (Market Baseline)";

      forecasts[item.id] = {
        salesRatePerDay,
        daysRemaining,
        runOutTimeText,
        replenishRecommended,
        confidence
      };
    });

    return forecasts;
  }, [menuItems, orders, inventoryStock, demandMultiplier]);

  // Real-time Analytic Datasets for Executive charts
  const dailyRevenueData = useMemo(() => {
    const baseHours = [
      { h: "09:00", revenue: 950 },
      { h: "11:00", revenue: 1600 },
      { h: "12:30", revenue: 3100 },
      { h: "14:00", revenue: 2400 },
      { h: "15:30", revenue: 1400 },
      { h: "17:00", revenue: 1950 },
      { h: "18:30", revenue: 3850 },
      { h: "20:00", revenue: 2200 },
      { h: "21:30", revenue: 1100 },
    ];
    return baseHours.map(item => ({
      hour: item.h,
      Revenue: Math.round(item.revenue * demandMultiplier),
      Forecast: Math.round(item.revenue * demandMultiplier * 1.15),
    }));
  }, [demandMultiplier]);

  const kitchenEfficiencyData = useMemo(() => {
    let baseEff = 88;
    if (kitchenDeadlockActive) {
      baseEff -= 55;
    } else {
      baseEff -= Math.max(0, (cookingCongestionRatio - 35) * 0.4);
    }
    if (weatherCondition === 'rain') baseEff -= 8;
    if (optimizerActive) baseEff += 5;
    
    const currentEff = Math.round(Math.max(10, Math.min(99, baseEff)));

    const baseHours = [
      { h: "09:00", eff: 92 },
      { h: "11:00", eff: 87 },
      { h: "12:30", eff: kitchenDeadlockActive ? 30 : 81 },
      { h: "14:00", eff: kitchenDeadlockActive ? 25 : 84 },
      { h: "15:30", eff: 89 },
      { h: "17:00", eff: 90 },
      { h: "18:30", eff: kitchenDeadlockActive ? 35 : 78 },
      { h: "20:00", eff: kitchenDeadlockActive ? 42 : 83 },
      { h: "21:30", eff: currentEff },
    ];

    return baseHours.map((item, idx) => {
      const val = idx === baseHours.length - 1 ? currentEff : item.eff;
      return {
        hour: item.h,
        Efficiency: val,
        Target: 85
      };
    });
  }, [kitchenDeadlockActive, cookingCongestionRatio, weatherCondition, optimizerActive]);

  const orderThroughputData = useMemo(() => {
    return [
      { hour: "09:00", Completed: 8, Cooking: 2, Late: 0 },
      { hour: "11:00", Completed: 14, Cooking: 3, Late: 1 },
      { hour: "12:30", Completed: Math.round(25 * demandMultiplier), Cooking: kitchenDeadlockActive ? 12 : 6, Late: weatherCondition === 'rain' ? 3 : 1 },
      { hour: "14:00", Completed: Math.round(18 * demandMultiplier), Cooking: kitchenDeadlockActive ? 10 : 4, Late: weatherCondition === 'rain' ? 2 : 1 },
      { hour: "15:30", Completed: 10, Cooking: 2, Late: 0 },
      { hour: "17:00", Completed: 15, Cooking: 4, Late: 1 },
      { hour: "18:30", Completed: Math.round(29 * demandMultiplier), Cooking: currentQueueLength, Late: lateDeliveryCount },
      { hour: "20:00", Completed: Math.round(16 * demandMultiplier), Cooking: Math.max(1, currentQueueLength - 2), Late: Math.max(0, lateDeliveryCount - 1) },
      { hour: "21:30", Completed: liveOrdersTracked, Cooking: currentQueueLength, Late: lateDeliveryCount }
    ];
  }, [demandMultiplier, kitchenDeadlockActive, weatherCondition, currentQueueLength, lateDeliveryCount, liveOrdersTracked]);

  // Analyze current stock distribution across all menu categories
  const stockDistributionData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    (menuItems || []).forEach((item) => {
      const cat = item.category || 'Other';
      const stock = inventoryStock && inventoryStock[item.id] !== undefined ? inventoryStock[item.id] : 30;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + stock;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return Object.keys(categoryTotals).map((cat) => ({
      category: cat,
      Stock: categoryTotals[cat],
      'Avg Stock': Math.round(categoryTotals[cat] / (categoryCounts[cat] || 1)),
      'Items Count': categoryCounts[cat]
    }));
  }, [menuItems, inventoryStock]);

  // 30-day inventory depletion rates tracking against predicted baseload
  const dailyDepletionData = useMemo(() => {
    const data = [];
    const baseItems = [
      { name: "The Jozi Double Smash Burger", baseRate: 18, variance: 7, peakDays: [5, 6, 12, 13, 19, 20, 26, 27] },
      { name: "Spicy Peri-Peri Chicken Burger", baseRate: 14, variance: 4, peakDays: [5, 6, 12, 13, 19, 20, 26, 27] },
      { name: "Quarter Lamb Bunny Chow", baseRate: 20, variance: 8, peakDays: [6, 13, 20, 27] },
      { name: "Boerewors & Chakalaka Pizza", baseRate: 11, variance: 5, peakDays: [5, 12, 19, 26] },
      { name: "Predictive Baseload", baseRate: 15, variance: 0, peakDays: [] }
    ];

    for (let d = 1; d <= 30; d++) {
      const dayStr = `May ${d < 10 ? '0' + d : d}`;
      const point: Record<string, number | string> = { day: dayStr };
      
      baseItems.forEach(item => {
        let rate = item.baseRate;
        if (item.peakDays.includes(d)) {
          rate += item.variance * 1.5;
        } else {
          rate += Math.sin(d * 0.9) * (item.variance * 0.6);
        }
        
        if (item.name !== "Predictive Baseload") {
          rate = rate * demandMultiplier;
        }
        
        point[item.name] = Math.round(Math.max(1, rate));
      });
      data.push(point);
    }
    return data;
  }, [demandMultiplier]);

  // Handle weather changes and their logistic impacts
  useEffect(() => {
    if (weatherCondition === 'rain') {
      setTrafficJamFactor(2.4);
      setAvgPrepTimeSec((prev) => Math.min(680, prev + 85));
      setAiFeed((prev) => [
        "🌧️ Severe precipitation detected: Heavy surface water along Florida Road.",
        "🚚 Dispatch Alert: Rider speeds reduced by 30%. Triggering defensive route planning...",
        ...prev.slice(0, 3)
      ]);
    } else {
      setTrafficJamFactor(1.0);
      setAvgPrepTimeSec(485);
      setAiFeed((prev) => [
        "☀️ Perfect coastal sunshine: Optimizing direct transit channels...",
        "⚡ Delivery throughput restored to Standard 14-min average.",
        ...prev.slice(0, 3)
      ]);
    }
  }, [weatherCondition]);

  // Handle optimizer routine simulation
  const handleRunOptimizer = () => {
    setOptimizerActive(true);
    setAiFeed((prev) => [
      "[COMPILED] Invoking Multi-Agent Dynamic Proximity Dispatch Rule matrix...",
      "[COMPILED] Re-routing Rider Sipho via Avondale Road (escaped Florida peak gridlock).",
      "[SUCCESS] Average cooking latency compressed from 8m 5s to 6m 30s!",
      ...prev
    ]);

    setTimeout(() => {
      setAvgPrepTimeSec((prev) => Math.max(380, prev - 105));
      setCookingCongestionRatio((prev) => Math.max(12, prev - 18));
      setOptimizerActive(false);
    }, 15000);
  };

  // Trigger high demand storm simulation
  const handleBoostDemand = () => {
    setDemandMultiplier((prev) => Math.min(3.0, prev + 0.5));
    setCurrentQueueLength((prev) => prev + Math.floor(Math.random() * 3) + 2);
    setLiveOrdersTracked((prev) => prev + 5);
    setCookingCongestionRatio((prev) => Math.min(95, prev + 22));
    
    // Mutate peak hour visual bars
    setSimulatedSalesHour((prev) => prev.map((val) => Math.round(val * 1.2)));

    setAiFeed((prev) => [
      "🔥 DEMAND SPIKE RED DIRECTIVE: Toggling marketing multiplier to 2.5x!",
      "📢 Customer app conversion rate increased by 42%.",
      "⚠️ Alert: Vetkoek Fryer slot queueing time rising! Recommended preheating backup fry burner.",
      ...prev
    ]);
  };

  return (
    <div id="executive-dashboard-container" className="flex flex-col p-4 pb-12 w-full text-white space-y-4 font-sans animate-fade-in bg-[#080503]">
      
      {/* 🔔 FLOATING CRITICAL STOCK ALERTS/TOASTS OVERLAY */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {criticalStockToasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-2.5 bg-[#0e0202] border border-red-500/50 rounded-xl p-3 shadow-2xl transition-all hover:scale-[1.02] duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full blur-xl pointer-events-none" />
            <AlertOctagon size={18} className="text-red-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1 space-y-0.5">
              <span className="text-[10px] font-black tracking-wider text-red-400 font-mono block uppercase">
                Stock Warning Alert
              </span>
              <p className="text-[10.5px] text-white leading-snug font-medium">
                {toast.message}
              </p>
              <span className="text-[8px] font-mono text-zinc-400 block pt-0.5">
                Logged at {toast.timestamp}
              </span>
            </div>
            <button
              onClick={() => handleDismissToast(toast.id)}
              className="text-zinc-500 hover:text-white text-[11px] font-black cursor-pointer bg-neutral-900 border border-white/5 h-4 w-4 rounded-full flex items-center justify-center shrink-0"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* 1. BRAND CONSOLE HEADER */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <span className="text-amber-500 text-[9px] font-mono tracking-widest block uppercase font-bold">
            LEKKER BITES ENTERPRISE
          </span>
          <h2 className="text-[17px] font-black tracking-tight text-white flex items-center gap-1.5">
            Operational Intelligence Hub 📊
          </h2>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-amber-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-400 cursor-pointer shadow-md hover:opacity-90 transition-opacity"
        >
          Customer App 📱
        </button>
      </div>

      {/* QUICK SYSTEM METADATA HEADER BANNER */}
      <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-2.5 flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-300">
            Node Server Status: <span className="text-emerald-400">OPTIMAL</span>
          </span>
        </div>
        <div className="text-[9px] text-neutral-550 font-mono">
          Model: <span className="text-neutral-300 font-bold">Gemini-3.5-Optimized v4.1</span>
        </div>
      </div>

      {/* 2. SUB TAB SELECTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2 p-1.5 bg-neutral-950/75 rounded-2xl border border-white/5 shadow-inner">
        {/* Money / Financials Tab */}
        <button
          onClick={() => setActiveSubTab('financials')}
          className={`py-3 px-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 border min-h-[48px] sm:min-h-0 relative ${
            activeSubTab === 'financials'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black shadow-md shadow-emerald-950/30'
              : 'bg-neutral-900/30 text-neutral-400 border-transparent hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Coins size={14} className={activeSubTab === 'financials' ? 'text-emerald-400' : 'text-neutral-500'} />
          <span>Money</span>
        </button>

        {/* Logistics Tab */}
        <button
          onClick={() => setActiveSubTab('logistics')}
          className={`py-3 px-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 border min-h-[48px] sm:min-h-0 relative ${
            activeSubTab === 'logistics'
              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20 font-black shadow-md shadow-sky-950/30'
              : 'bg-neutral-900/30 text-neutral-400 border-transparent hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Truck size={14} className={activeSubTab === 'logistics' ? 'text-sky-400' : 'text-neutral-500'} />
          <span>Logistics</span>
          {weatherCondition === 'rain' && (
            <span className="absolute top-1.5 right-1.5 sm:top-1 sm:right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          )}
        </button>

        {/* Analytics Tab */}
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`py-3 px-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 border min-h-[48px] sm:min-h-0 relative ${
            activeSubTab === 'analytics'
              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-black shadow-md shadow-indigo-950/30'
              : 'bg-neutral-900/30 text-neutral-400 border-transparent hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Activity size={14} className={activeSubTab === 'analytics' ? 'text-indigo-400 animate-pulse' : 'text-neutral-500'} />
          <span>Analytics</span>
        </button>

        {/* AI Prediction Tab */}
        <button
          onClick={() => setActiveSubTab('ai-prediction')}
          className={`py-3 px-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 border min-h-[48px] sm:min-h-0 relative ${
            activeSubTab === 'ai-prediction'
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 font-black shadow-md shadow-purple-950/30'
              : 'bg-neutral-900/30 text-neutral-400 border-transparent hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Sparkles size={14} className={activeSubTab === 'ai-prediction' ? 'text-purple-400 animate-pulse' : 'text-neutral-500'} />
          <span>AI Opt</span>
        </button>

        {/* Menu Management (Stock) Tab */}
        <button
          onClick={() => setActiveSubTab('menu-mgmt')}
          className={`py-3 px-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 border min-h-[48px] sm:min-h-0 relative ${
            activeSubTab === 'menu-mgmt'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 font-black shadow-md shadow-amber-950/30'
              : 'bg-neutral-900/30 text-neutral-400 border-transparent hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Package size={14} className={activeSubTab === 'menu-mgmt' ? 'text-amber-400' : 'text-neutral-500'} />
          <span>Stock</span>
        </button>

        {/* Tickets Tab */}
        <button
          onClick={() => setActiveSubTab('tickets')}
          className={`py-3 px-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 border min-h-[48px] sm:min-h-0 relative ${
            activeSubTab === 'tickets'
              ? 'bg-red-500/10 text-red-500 border-red-500/20 font-black shadow-md shadow-red-950/30'
              : 'bg-neutral-900/30 text-neutral-400 border-transparent hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <ShieldAlert size={14} className={activeSubTab === 'tickets' ? 'text-red-500' : 'text-neutral-500'} />
          <span>Tickets</span>
          {complaintTickets.filter((t) => t.status === 'pending').length > 0 && (
            <span className="absolute top-1 right-1 sm:static sm:ml-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-mono font-bold leading-none shrink-0 shadow-sm">
              {complaintTickets.filter((t) => t.status === 'pending').length}
            </span>
          )}
        </button>

        {/* Feedback / Review Tab */}
        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`py-3 px-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 border min-h-[48px] sm:min-h-0 relative ${
            activeSubTab === 'feedback'
              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 font-black shadow-md shadow-yellow-950/30'
              : 'bg-neutral-900/30 text-neutral-400 border-transparent hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Star size={14} className={activeSubTab === 'feedback' ? 'text-yellow-400' : 'text-neutral-500'} />
          <span>Review</span>
          {dbFeedbacks.length > 0 && (
            <span className="absolute top-1 right-1 sm:static sm:ml-1 w-4 h-4 bg-yellow-500 text-neutral-950 rounded-full flex items-center justify-center text-[9px] font-mono font-bold leading-none shrink-0 shadow-sm">
              {dbFeedbacks.length}
            </span>
          )}
        </button>

        {/* Loyalty Tab */}
        <button
          onClick={() => setActiveSubTab('loyalty')}
          className={`py-3 px-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 border min-h-[48px] sm:min-h-0 relative ${
            activeSubTab === 'loyalty'
              ? 'bg-pink-500/10 text-pink-400 border-pink-500/20 font-black shadow-md shadow-pink-950/30'
              : 'bg-neutral-900/30 text-neutral-400 border-transparent hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Award size={14} className={activeSubTab === 'loyalty' ? 'text-pink-400' : 'text-neutral-500'} />
          <span>Loyalty</span>
        </button>
      </div>

      {/* 3. SIMULATION CONTROLLER DRAWER */}
      <div className="glass-panel border-white/5 p-3 rounded-2xl space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-mono tracking-widest text-neutral-400 font-black uppercase">
            OPERATIONAL ENVIRONMENT SIMULATOR CONTROLS
          </span>
          <Sliders size={11} className="text-neutral-500" />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Weather Toggle */}
          <div className="bg-neutral-950/50 p-2 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[8px] font-mono font-bold text-neutral-500 uppercase">Weather Matrix</span>
            <div className="flex gap-1.5 mt-1.5">
              <button
                onClick={() => setWeatherCondition('sun')}
                className={`flex-1 py-1 text-[9px] font-bold rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  weatherCondition === 'sun' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-neutral-900 border border-transparent text-neutral-400'
                }`}
              >
                <Sun size={11} /> Clear
              </button>
              <button
                onClick={() => setWeatherCondition('rain')}
                className={`flex-1 py-1 text-[9px] font-bold rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  weatherCondition === 'rain' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-neutral-900 border border-transparent text-neutral-400'
                }`}
              >
                <CloudRain size={11} /> Gauteng Rain
              </button>
            </div>
          </div>

          {/* Optimizer control */}
          <div className="bg-neutral-950/50 p-2 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[8px] font-mono font-bold text-neutral-500 uppercase">Proximity Dispatch Alg</span>
            <button
              onClick={handleRunOptimizer}
              disabled={optimizerActive}
              className={`w-full py-1.5 mt-1.5 rounded-md text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                optimizerActive
                  ? 'bg-neutral-900 text-neutral-600 animate-pulse'
                  : 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-400 hover:text-neutral-950'
              }`}
            >
              {optimizerActive ? 'Recomputing TSP Paths...' : '⚡ Rebalance Dispatch Rules'}
            </button>
          </div>
        </div>

        {/* Action Storm multiplier */}
        <div className="flex gap-2.5 items-center justify-between pt-1 border-t border-white/5">
          <div className="space-y-0.5">
            <span className="text-[8px] text-neutral-500 font-mono font-bold uppercase block">Demand Multiplier Knob</span>
            <span className="text-[10px] text-amber-400 font-bold font-mono">{(demandMultiplier).toFixed(1)}x Traffic Spike Active</span>
          </div>
          <button
            onClick={handleBoostDemand}
            className="px-3.5 py-1.5 bg-red-600/15 border border-red-500/20 text-red-400 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer flex items-center gap-1 transition-all hover:bg-red-500 hover:text-white"
          >
            <Zap size={10} className="text-red-400 animate-pulse" /> Boost Customer Demand
          </button>
        </div>
      </div>

      {/* 4. SUB TAB PANELS CONTENT */}
      <div className="glass-panel border-white/5 p-4 rounded-3xl min-h-[300px] flex flex-col justify-between">
        
        {/* PANEL: EXECUTIVE ANALYTICS */}
        {activeSubTab === 'analytics' && (
          <div className="space-y-4 animate-fade-in flex flex-col justify-between h-full font-sans">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9.5px] font-mono tracking-widest text-indigo-300 font-bold block uppercase">
                  📊 EXECUTIVE ANALYTICS ENGINE
                </span>
                <span className="text-[8px] font-mono text-zinc-500">Real-Time Core Stream Active</span>
              </div>

               {/* Bento Row: KPI Scorecards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                {/* Scorecard 1: Daily Revenue */}
                <div className="p-3 bg-neutral-950/50 border border-white/5 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[9px] text-neutral-400">
                    <span className="font-medium">Daily Revenue (ZAR)</span>
                    <TrendingUp size={11} className="text-[#a855f7]" />
                  </div>
                  <div className="text-lg font-bold font-mono text-white tracking-tight">
                    R {(12495.00 * demandMultiplier).toFixed(2)}
                  </div>
                  <p className="text-[7.5px] text-emerald-400 font-mono flex items-center gap-0.5">
                    <span>↑ +{(18.4 * demandMultiplier).toFixed(1)}% dynamic vol boost</span>
                  </p>
                </div>

                {/* Scorecard 2: Kitchen Efficiency */}
                <div className="p-3 bg-neutral-950/50 border border-white/5 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[9px] text-neutral-400">
                    <span className="font-medium">Kitchen Efficiency Score</span>
                    <Activity size={11} className={kitchenDeadlockActive ? "text-red-500 animate-pulse" : "text-emerald-505"} />
                  </div>
                  <div className={`text-lg font-bold font-mono tracking-tight ${
                    kitchenDeadlockActive ? 'text-red-500 animate-pulse' : 'text-emerald-400'
                  }`}>
                    {kitchenEfficiencyData[kitchenEfficiencyData.length - 1].Efficiency}%
                  </div>
                  <p className="text-[7.5px] font-mono">
                    {kitchenDeadlockActive ? (
                      <span className="text-red-400 font-bold uppercase">🚨 DEADLOCK DETECTED!</span>
                    ) : (
                      <span className="text-zinc-500">Normal operations (Target: 85%)</span>
                    )}
                  </p>
                </div>

                {/* Scorecard 3: Order Throughput */}
                <div className="p-3 bg-neutral-950/50 border border-white/5 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-[9px] text-neutral-400">
                    <span className="font-medium">Order Throughput</span>
                    <Coins size={11} className="text-amber-500" />
                  </div>
                  <div className="text-lg font-bold font-mono text-white tracking-tight">
                    {liveOrdersTracked} Orders Live
                  </div>
                  <p className="text-[7.5px] text-zinc-500 font-mono">
                    <span>In-flight queue: {currentQueueLength} orders</span>
                  </p>
                </div>

                {/* Scorecard 4: Daily Sales */}
                <div className="p-3 bg-[#0c0705] border border-amber-500/15 rounded-2xl space-y-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl -mr-4 -mt-4 pointer-events-none" />
                  <div className="flex items-center justify-between text-[9.5px]">
                    <span className="font-black text-amber-400 font-mono tracking-wider uppercase">📊 DAILY SALES</span>
                    <Award size={11} className="text-amber-500" />
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-neutral-450">Orders Placed:</span>
                      <span className="font-black text-white">{dailySalesMetrics.totalOrdersCount}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-neutral-450">Redeemed:</span>
                      <span className="font-black text-amber-500">{dailySalesMetrics.totalPointsRedeemed} pts</span>
                    </div>
                    <div className="flex justify-between text-[9.5px] items-center gap-1">
                      <span className="text-neutral-450 font-mono shrink-0">Popular:</span>
                      <span className="font-bold text-emerald-400 truncate max-w-[105px] text-right" title={dailySalesMetrics.mostOrderedItem}>
                        {dailySalesMetrics.mostOrderedItem}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid block for Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3.5">
                {/* Area Chart: Revenue Trend */}
                <div className="bg-[#0c0705] border border-white/5 p-3 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold block">
                      Hourly Revenue Velocity (ZAR)
                    </span>
                    <span className="text-[7.5px] text-emerald-400 font-mono">
                      Demand: {demandMultiplier.toFixed(1)}x
                    </span>
                  </div>
                  <div className="h-40 w-full" id="revenue-trend-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={dailyRevenueData}
                        margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                          </linearGradient>
                          <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#1e130c" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="hour"
                          stroke="#78716c"
                          fontSize={8}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#78716c"
                          fontSize={8}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0a0503',
                            border: '1px solid #451a03',
                            borderRadius: '12px',
                            fontSize: '9px',
                            color: '#fff',
                            fontFamily: 'monospace'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="Revenue"
                          stroke="#ef4444"
                          strokeWidth={1.5}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                        <Area
                          type="monotone"
                          dataKey="Forecast"
                          stroke="#a855f7"
                          strokeWidth={1}
                          strokeDasharray="3 3"
                          fillOpacity={1}
                          fill="url(#colorForecast)"
                        />
                        <Legend
                          verticalAlign="top"
                          height={15}
                          iconSize={8}
                          wrapperStyle={{ fontSize: '8px', fontFamily: 'monospace' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Line Chart: Kitchen Efficiency */}
                <div className="bg-[#0c0705] border border-white/5 p-3 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold block">
                      Kitchen Efficiency Score (%)
                    </span>
                    <span className={`text-[7.5px] font-mono font-bold ${
                      kitchenDeadlockActive ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                    }`}>
                      {kitchenDeadlockActive ? 'DEADLOCKED!' : 'Healthy'}
                    </span>
                  </div>
                  <div className="h-40 w-full" id="kitchen-efficiency-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={kitchenEfficiencyData}
                        margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid stroke="#1e130c" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="hour"
                          stroke="#78716c"
                          fontSize={8}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          stroke="#78716c"
                          fontSize={8}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0a0503',
                            border: '1px solid #451a03',
                            borderRadius: '12px',
                            fontSize: '9px',
                            color: '#fff',
                            fontFamily: 'monospace'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Efficiency"
                          stroke={kitchenDeadlockActive ? "#ef4444" : "#10b981"}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Target"
                          stroke="#f59e0b"
                          strokeDasharray="4 4"
                          strokeWidth={1}
                          dot={false}
                        />
                        <Legend
                          verticalAlign="top"
                          height={15}
                          iconSize={8}
                          wrapperStyle={{ fontSize: '8px', fontFamily: 'monospace' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Grid block for Bottom Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3.5">
                {/* Stacked Bar Chart: Order Throughput */}
                <div className="bg-[#0c0705] border border-white/5 p-3 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold block">
                      Order Throughput Rate (Completed vs Queue vs Delayed)
                    </span>
                    <span className="text-[7.5px] font-mono text-amber-500 uppercase">
                      Weather: {weatherCondition === 'rain' ? 'RAINING (Traffic delays active)' : 'CLEAR'}
                    </span>
                  </div>
                  <div className="h-44 w-full" id="order-throughput-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={orderThroughputData}
                        margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid stroke="#1e130c" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="hour"
                          stroke="#78716c"
                          fontSize={8}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#78716c"
                          fontSize={8}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0a0503',
                            border: '1px solid #451a03',
                            borderRadius: '12px',
                            fontSize: '9px',
                            color: '#fff',
                            fontFamily: 'monospace'
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          height={16}
                          iconSize={8}
                          wrapperStyle={{ fontSize: '8px', fontFamily: 'monospace' }}
                        />
                        <Bar dataKey="Completed" stackId="a" fill="#10b981" />
                        <Bar dataKey="Cooking" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="Late" stackId="a" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart: Stock Distribution */}
                <div className="bg-[#0c0705] border border-white/5 p-3 rounded-2xl space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold block">
                      Stock Distribution by Category (Total Units)
                    </span>
                    <div className="flex items-center gap-1.5">
                      {criticalItems.length > 0 && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-950 border border-red-500/35 text-red-400 rounded text-[7.5px] font-mono uppercase font-black animate-pulse">
                          <AlertTriangle size={9} className="text-red-500" />
                          {criticalItems.length} LOW WARNING
                        </span>
                      )}
                      <span className="text-[7.5px] font-mono text-amber-500 uppercase">
                        Inventory Health
                      </span>
                    </div>
                  </div>
                  <div className="h-44 w-full" id="stock-distribution-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stockDistributionData}
                        margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid stroke="#1e130c" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="category"
                          stroke="#78716c"
                          fontSize={8}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#78716c"
                          fontSize={8}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0a0503',
                            border: '1px solid #451a03',
                            borderRadius: '12px',
                            fontSize: '9px',
                            color: '#fff',
                            fontFamily: 'monospace'
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          height={16}
                          iconSize={8}
                          wrapperStyle={{ fontSize: '8px', fontFamily: 'monospace' }}
                        />
                        <Bar dataKey="Stock" fill="#a855f7" radius={[4, 4, 0, 0]}>
                          {stockDistributionData.map((entry, index) => {
                            // Highlight categories with ultra-low inventory (average stock <= 25 units is low)
                            const isLow = entry.Stock <= 25;
                            return (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={isLow ? '#f43f5e' : entry.category === 'Beverages' ? '#3b82f6' : '#a855f7'} 
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Red Warning list for items with stock < 10 */}
                  {criticalItems.length > 0 && (
                    <div className="pt-2 border-t border-red-500/10 space-y-1.5">
                      <div className="text-[8.5px] font-mono uppercase text-red-500 font-extrabold flex items-center gap-1">
                        <AlertOctagon size={11} className="text-red-500 animate-bounce" />
                        CRITICAL LOW INVENTORY (STOCK &lt; 10):
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {criticalItems.map(item => (
                          <div key={item.id} className="flex justify-between items-center p-1.5 bg-red-950/20 border border-red-500/15 rounded-lg">
                            <span className="text-[9px] font-medium text-neutral-300 truncate max-w-[125px]" title={item.name}>
                              {item.name}
                            </span>
                            <span className="text-[9px] font-mono text-neutral-500 truncate text-[8px] max-w-[50px]">
                              {item.category}
                            </span>
                            <span className="text-[9.5px] font-bold font-mono text-red-400 bg-red-950/50 px-1.5 py-0.5 rounded border border-red-500/30">
                              {item.stock} left
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Line Chart: 30-Day Inventory Depletion Rates against predictions */}
              <div className="bg-[#0c0705] border border-white/5 p-4 rounded-2xl space-y-3 mt-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 pb-2 border-b border-white/5">
                  <div>
                    <span className="text-[9.5px] font-mono text-zinc-400 uppercase font-black tracking-wider block">
                      30-Day Inventory Depletion Rates (Units / Day)
                    </span>
                    <span className="text-[8.5px] text-zinc-500 block leading-tight">
                      Visualize actual daily depletion vs. predicted average rates to identify potential stock-outs.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-955 border border-amber-500/20 text-amber-400 rounded text-[7.5px] font-mono uppercase font-semibold">
                      <Sparkles size={9} className="text-amber-500" />
                      Dynamic Predictive Engine
                    </span>
                  </div>
                </div>

                <div className="h-56 w-full" id="inventory-depletion-line-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyDepletionData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                    >
                      <CartesianGrid stroke="#1e130c" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="day"
                        stroke="#78716c"
                        fontSize={8}
                        tickLine={false}
                        axisLine={false}
                        interval={4}
                      />
                      <YAxis
                        stroke="#78716c"
                        fontSize={8}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a0503',
                          border: '1px solid #451a03',
                          borderRadius: '12px',
                          fontSize: '9px',
                          color: '#fff',
                          fontFamily: 'monospace'
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={24}
                        iconSize={8}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '7.5px', fontFamily: 'monospace', paddingBottom: '10px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="The Jozi Double Smash Burger"
                        stroke="#fb923c"
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Spicy Peri-Peri Chicken Burger"
                        stroke="#f43f5e"
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Quarter Lamb Bunny Chow"
                        stroke="#38bdf8"
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Boerewors & Chakalaka Pizza"
                        stroke="#c084fc"
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Predictive Baseload"
                        stroke="#78716c"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={{ r: 4 }}
                        name="Model Prediction (Ideal Max)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Informative breakdown row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="bg-neutral-950/45 p-2 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-[7px] font-mono text-zinc-500 uppercase block">Smash Burgers</span>
                    <span className="text-[10px] font-mono font-bold text-orange-400">
                      {demandMultiplier > 1.2 ? '⚠️ High Outpace' : 'Stable'}
                    </span>
                  </div>
                  <div className="bg-neutral-950/45 p-2 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-[7px] font-mono text-zinc-500 uppercase block">Peri-Peri Burgers</span>
                    <span className="text-[10px] font-mono font-bold text-rose-400">
                      {demandMultiplier > 1.5 ? '⚠️ Spiked Rate' : 'Within Forecast'}
                    </span>
                  </div>
                  <div className="bg-neutral-950/45 p-2 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-[7px] font-mono text-zinc-500 uppercase block">Lamb Bunny Chow</span>
                    <span className="text-[10px] font-mono font-bold text-sky-400">
                      {demandMultiplier > 1.0 ? '⚡ Faster Rate' : 'Normal'}
                    </span>
                  </div>
                  <div className="bg-neutral-950/45 p-2 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-[7px] font-mono text-zinc-500 uppercase block">Predictive Match Accuracy</span>
                    <span className="text-[10px] font-mono font-bold text-stone-400">
                      {Math.round(92 / (demandMultiplier > 1 ? demandMultiplier * 0.95 : 1))}% Acc.
                    </span>
                  </div>
                </div>
              </div>

              {/* Simulation Response Feedback explanation banner */}
              <div className="mt-3.5 p-2.5 bg-indigo-505/5 border border-indigo-500/10 rounded-xl text-[8.5px] leading-relaxed text-zinc-400 font-mono flex items-start gap-2">
                <span className="text-indigo-400 text-[10px]">ℹ️</span>
                <div>
                  <h5 className="font-bold text-indigo-300 uppercase shrink-0">Real-Time Simulation Response</h5>
                  These charts update reactively as you change operational environment settings above! Increasing customer demand spikes the revenue curves, weather conditions alter order delays, and deadlocking or resolving kitchen induction queues reflects instantly on efficiency rating coordinates.
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-white/5 text-[9px] text-[#9e7a68] italic flex justify-between mt-3">
              <span>*Metrics powered by real-time checkout telemetry and simulation parameters</span>
              <span className="font-bold underline text-indigo-400">Export Analytics Data</span>
            </div>
          </div>
        )}

        {/* PANEL A: FINANCIALS & REVENUE METRICS */}
        {activeSubTab === 'financials' && (
          <div className="space-y-4 animate-fade-in flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono tracking-widest text-[#a855f7] font-bold block uppercase">
                  💰 SALER & PROFITABILITY TRACKING INDEX
                </span>
                <span className="text-[8px] font-mono text-zinc-400 bg-neutral-900 border border-white/5 px-2 py-0.5 rounded-full">
                  Real-time Gauteng Ledger
                </span>
              </div>

              {/* Bento grid scorecard metrics */}
              <div className="grid grid-cols-2 gap-2">
                {/* Score 1: Gross Sales Revenue */}
                <div className="p-3 bg-neutral-950/45 border border-white/5 rounded-xl space-y-1 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm" />
                  <div className="flex items-center justify-between text-[9px] text-zinc-400 uppercase font-mono font-bold">
                    <span>Gross Sales Revenue</span>
                    <TrendingUp size={11} className="text-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-lg font-black font-mono text-white tracking-tight glow-amber-soft">
                    R {financeMetrics.totalRevenues.toFixed(2)}
                  </div>
                  <p className="text-[7.5px] text-zinc-500 font-mono flex items-center justify-between">
                    <span>Live R{financeMetrics.liveRevenues.toFixed(0)} • Sim R{financeMetrics.simulatedRevenues.toFixed(0)}</span>
                  </p>
                </div>

                {/* Score 2: Net Profit & Net Margin */}
                <div className={`p-3 bg-neutral-950/45 border border-white/5 rounded-xl space-y-1 relative overflow-hidden`}>
                  <div className={`absolute top-0 left-0 w-full h-0.5 ${financeMetrics.netProfit >= 0 ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' : 'bg-red-500'} shadow-sm`} />
                  <div className="flex items-center justify-between text-[9px] text-zinc-400 uppercase font-mono font-bold">
                    <span>Net Take-home Profit</span>
                    <Coins size={11} className={financeMetrics.netProfit >= 0 ? 'text-amber-400' : 'text-red-400'} />
                  </div>
                  <div className={`text-lg font-black font-mono tracking-tight ${financeMetrics.netProfit >= 0 ? 'text-emerald-400 glow-amber-soft' : 'text-red-400'}`}>
                    R {financeMetrics.netProfit.toFixed(2)}
                  </div>
                  <p className="text-[7.5px] font-mono flex justify-between">
                    <span className="text-zinc-500">Margin Factor:</span>
                    <span className={`font-bold ${financeMetrics.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {financeMetrics.netMarginPct.toFixed(1)}% {financeMetrics.netProfit >= 0 ? '🔥' : '❄️'}
                    </span>
                  </p>
                </div>

                {/* Score 3: Cost of Goods Sold (Ingredients / Toppings) */}
                <div className="p-3 bg-neutral-950/45 border border-white/5 rounded-xl space-y-0.5">
                  <div className="flex items-center justify-between text-[8px] text-zinc-400 uppercase font-mono font-bold">
                    <span>Cost of Goods (COGS)</span>
                    <span className="text-[7.5px] font-mono text-amber-500 font-bold bg-amber-500/10 px-1 rounded">
                      {(inflationMultiplier * 100).toFixed(0)}% Supplier Price
                    </span>
                  </div>
                  <div className="text-sm font-semibold font-mono text-zinc-200">
                    R {financeMetrics.totalCOGS.toFixed(2)}
                  </div>
                  <p className="text-[7px] text-zinc-500 font-mono font-bold leading-none">
                    Raw ingredient costs & toppings processing
                  </p>
                </div>

                {/* Score 4: Total Operating Expenses (OPEX) */}
                <div className="p-3 bg-neutral-950/45 border border-white/5 rounded-xl space-y-0.5">
                  <div className="flex items-center justify-between text-[8px] text-zinc-400 uppercase font-mono font-bold">
                    <span>Operating Costs (OPEX)</span>
                    <span className="text-[7.5px] text-zinc-500 font-mono">Rent + Dispatch + Processing</span>
                  </div>
                  <div className="text-sm font-semibold font-mono text-zinc-200">
                    R {financeMetrics.totalOPEX.toFixed(2)}
                  </div>
                  <p className="text-[7px] text-zinc-500 font-mono font-bold leading-none">
                    Includes dynamic R15-per-delivery driver fees
                  </p>
                </div>
              </div>

              {/* INTERACTIVE CONTROLS / SIMULATION SETTINGS */}
              <div className="bg-[#110a07] border border-amber-500/15 p-3 rounded-2xl space-y-2.5">
                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span className="text-[9px] font-mono text-orange-400 uppercase font-black tracking-wider block">
                    ⚙️ Financial stress-analysis & testing levers
                  </span>
                  <div className="flex items-center gap-1.5 text-[8px] font-mono">
                    <span className={useLiveOnly ? 'text-zinc-500' : 'text-purple-400 font-bold'}>Sim-Blended</span>
                    <button
                      type="button"
                      onClick={() => setUseLiveOnly(!useLiveOnly)}
                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        useLiveOnly ? 'bg-purple-600' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          useLiveOnly ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={useLiveOnly ? 'text-purple-400 font-bold' : 'text-zinc-500'}>Live Orders Only</span>
                  </div>
                </div>

                {/* Inflation control */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[8px] font-mono text-zinc-400">
                    <span>🌾 Raw Ingredient Price Inflation (Supplies COGS Index)</span>
                    <span className={`font-black ${inflationMultiplier > 1.0 ? 'text-red-400' : inflationMultiplier < 1.0 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                      {((inflationMultiplier - 1.0) * 100) >= 0 ? '+' : ''}{((inflationMultiplier - 1.0) * 100).toFixed(0)}% Rate
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.70"
                    max="1.50"
                    step="0.05"
                    value={inflationMultiplier}
                    onChange={(e) => setInflationMultiplier(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1 rounded-lg bg-neutral-900 appearance-none cursor-pointer"
                  />
                </div>

                {/* Fixed Opex control */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[8px] font-mono text-zinc-400">
                    <span>🏢 Est. Daily Fixed Overhead costs (Labour, Rent, Electricity)</span>
                    <span className="font-black text-amber-500">R {fixedOpexAssumption} / Day</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="100"
                    value={fixedOpexAssumption}
                    onChange={(e) => setFixedOpexAssumption(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1 rounded-lg bg-neutral-900 appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* CATEGORIES REVENUE VS COST COMPARISON RECHARTS BAR CHART */}
              <div className="bg-[#0a0604] border border-white/5 p-3 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-neutral-400 uppercase font-black block">
                    Product margins & gross revenues by category (ZAR)
                  </span>
                  <span className="text-[7.5px] font-mono text-emerald-400 font-bold">
                    Revenue vs Ingredients Cost cogs
                  </span>
                </div>

                <div className="h-32 w-full text-[8px] font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(financeMetrics.categoryMetrics).map(([name, val]) => ({
                        Category: name.substring(0, 8),
                        Revenue: Math.round(val.revenue),
                        COGS: Math.round(val.cogs),
                      }))}
                      margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="Category" stroke="#777" tick={{ fontSize: 7 }} />
                      <YAxis stroke="#777" tick={{ fontSize: 7 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '9px' }}
                        labelStyle={{ fontStyle: 'bold', color: '#ff9800' }}
                      />
                      <Legend iconSize={6} wrapperStyle={{ fontSize: '7.5px' }} />
                      <Bar dataKey="Revenue" fill="#10b981" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="COGS" fill="#ef4444" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* best-selling Leaderboards and margin analysis */}
              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[8.5px] font-mono text-neutral-400 uppercase font-black block">
                    🥇 Gauteng Menu Items Performance Leaderboard
                  </span>
                  <div className="flex gap-1">
                    {(['units', 'revenue', 'profit', 'margin'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setFinanceSortBy(mode)}
                        className={`px-1.5 py-0.5 rounded text-[7px] font-mono uppercase border transition-colors ${
                          financeSortBy === mode
                            ? 'bg-amber-500 border-amber-600 text-neutral-900 font-bold'
                            : 'bg-neutral-900 border-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ranked leader boards listing */}
                <div className="space-y-1 bg-neutral-950/45 border border-white/5 rounded-xl p-1.5 max-h-[160px] overflow-y-auto">
                  {menuItems.map((item) => {
                    // Compute dynamic units sold based on popular index and standard sales
                    const baseOrderSold = (orders || []).reduce((sum, o) => {
                      let qty = 0;
                      o.items?.forEach((oi: any) => {
                        if (oi.menuItem?.id === item.id) qty += oi.quantity || 1;
                      });
                      return sum + qty;
                    }, 0);

                    // Add simulated weights to make it look stable and beautiful
                    const simulatedWeightIdx = item.popular ? 42 : item.category === 'Beverages' ? 28 : 20;
                    const itemsSold = useLiveOnly ? baseOrderSold : (Math.round(simulatedWeightIdx * demandMultiplier) + baseOrderSold);

                    const revenue = itemsSold * item.price;
                    const cogsPrice = costOverrides[item.id] !== undefined
                      ? costOverrides[item.id]
                      : item.price * 0.45;
                    const totalCost = itemsSold * cogsPrice;
                    const netMarginContribution = revenue - totalCost;
                    const individualMargin = item.price > 0 ? (netMarginContribution / revenue) * 100 : 0;

                    return {
                      id: item.id,
                      name: item.name,
                      category: item.category,
                      units: itemsSold,
                      revenue,
                      profit: netMarginContribution,
                      margin: individualMargin,
                      cost: cogsPrice,
                      retail: item.price
                    };
                  }).sort((a, b) => {
                    if (financeSortBy === 'units') return b.units - a.units;
                    if (financeSortBy === 'revenue') return b.revenue - a.revenue;
                    if (financeSortBy === 'profit') return b.profit - a.profit;
                    return b.margin - a.margin;
                  }).slice(0, 5).map((ranked, index) => (
                    <div
                      key={ranked.id}
                      className="flex justify-between items-center text-[9px] bg-neutral-950/80 p-1.5 rounded-lg border border-white/5 hover:border-amber-500/20 transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-100 flex items-center gap-1">
                          <span className="text-zinc-500 font-mono">#{index + 1}</span> {ranked.name}
                        </span>
                        <span className="text-[7.5px] text-zinc-500 font-mono">
                          Retail: R{ranked.retail.toFixed(0)} • Cost Override: R{ranked.cost.toFixed(0)} ({ranked.category})
                        </span>
                      </div>
                      <div className="text-right font-mono flex flex-col items-end">
                        {financeSortBy === 'units' && <span className="font-bold text-amber-400">{ranked.units} units sold</span>}
                        {financeSortBy === 'revenue' && <span className="font-bold text-amber-400">R {ranked.revenue.toFixed(2)} rev</span>}
                        {financeSortBy === 'profit' && (
                          <span className={`font-bold ${ranked.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            R {ranked.profit.toFixed(2)} profit
                          </span>
                        )}
                        {financeSortBy === 'margin' && (
                          <span className="font-bold text-blue-400">
                            {ranked.margin.toFixed(0)}% gross margin
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {menuItems.length === 0 && (
                    <div className="text-center py-4 text-xs font-mono text-zinc-500 italic">
                      No active items registered under menu files.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 text-[9px] text-[#9e7a68] italic flex justify-between mt-3">
              <span>*Metrics powered by real-time checkout telemetry and simulation parameters</span>
              <span className="font-bold underline text-indigo-400">Export Analytics Data</span>
            </div>
          </div>
        )}

        {/* PANEL B: LOGISTICS & LIVE RE-ROUTING MAP */}
        {activeSubTab === 'logistics' && (
          <div className="space-y-4 animate-fade-in flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold block uppercase">
                  DELIVERY LOGISTICS & LOGIC
                </span>
                <span className="text-[8px] font-mono text-cyan-500">Live Traffic Delay: {trafficJamFactor}x</span>
              </div>

              {/* Delivery KPI Stats */}
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                <div className="p-2 bg-neutral-950/45 border border-white/5 rounded-xl text-center">
                  <span className="text-[7.5px] text-neutral-500 block uppercase font-mono">Queue delays</span>
                  <span className="text-xs font-mono font-bold text-white block mt-0.5">{currentQueueLength} orders</span>
                </div>
                <div className="p-2 bg-neutral-950/45 border border-white/5 rounded-xl text-center">
                  <span className="text-[7.5px] text-neutral-500 block uppercase font-mono">Avg Prep time</span>
                  <span className={`text-xs font-mono font-bold block mt-0.5 ${weatherCondition === 'rain' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {Math.floor(avgPrepTimeSec / 60)}m {avgPrepTimeSec % 60}s
                  </span>
                </div>
                <div className="p-2 bg-neutral-950/45 border border-white/5 rounded-xl text-center">
                  <span className="text-[7.5px] text-neutral-500 block uppercase font-mono">Late Delivery %</span>
                  <span className={`text-xs font-mono font-bold block mt-0.5 ${weatherCondition === 'rain' ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                    {weatherCondition === 'rain' ? '18.4%' : '2.1%'}
                  </span>
                </div>
              </div>

              {/* SVG Vector Heatmap for Gauteng Hotspots */}
              <div className="mt-3.5 bg-neutral-950/40 border border-white/5 rounded-2xl p-2.5 relative overflow-hidden h-36">
                <div className="absolute inset-0 bg-[#060403] opacity-50" />
                <svg className="absolute inset-0 w-full h-full opacity-65" xmlns="http://www.w3.org/2000/svg">
                  {/* Map contours */}
                  <path d="M10,80 Q100,20 200,90 T350,15" fill="none" stroke="#1c1109" strokeWidth="4" />
                  <path d="M50,140 Q150,110 300,140" fill="none" stroke="#1c1109" strokeWidth="2" />
                  
                  {/* West Gauteng boundary */}
                  <rect x="290" y="0" width="100" height="150" fill="#2c4a12" opacity="0.1" />
                  <text x="300" y="70" fill="#a8a29e" opacity="0.4" fontSize="6" fontFamily="sans-serif">Highveld Ridge</text>
                  
                  {/* Heat circles */}
                  {/* Pretoria CBD */}
                  <circle cx="90" cy="50" r={weatherCondition === 'rain' ? '30' : '22'} fill="#ef4444" opacity={weatherCondition === 'rain' ? '0.35' : '0.25'} />
                  {/* Jozi CBD M2 highway Area */}
                  <circle cx="190" cy="40" r="16" fill="#f59e0b" opacity="0.25" />
                  {/* Commissioner St */}
                  <circle cx="160" cy="80" r="28" fill="#ef4444" opacity="0.3" className="animate-pulse" />
                  {/* Church Square */}
                  <circle cx="275" cy="110" r="14" fill="#10b981" opacity="0.2" />
                </svg>

                {/* Hotspot Indicators Overlay Pin labels */}
                <div className="absolute top-[35px] left-[70px] flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-lg" />
                  <span className="text-[6.5px] font-bold font-mono text-red-200">PRETORIA CBD</span>
                </div>
                <div className="absolute top-[65px] left-[135px] flex items-center gap-1 bg-[#0f0a07]/80 rounded p-1 border border-orange-500/15">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                  <span className="text-[6.5px] font-black font-mono text-orange-400">COMMISSIONER ST SURGE</span>
                </div>
                <div className="absolute top-[102px] left-[225px] flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[6.5px] font-bold font-mono text-emerald-400">CHURCH SQUARE (CLEAR)</span>
                </div>

                <div className="absolute bottom-2 left-2 bg-neutral-950/90 border border-white/5 rounded px-2 py-0.5 text-[7px] font-mono text-neutral-400">
                  🇿🇦 Spatial Hotspot Heatmap • Johannesburg & Pretoria CBDs
                </div>
              </div>

              {/* Dynamic Dispatcher rider roster status */}
              <div className="mt-3.5 space-y-1.5">
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-black block">
                  LOGISTICS DISPATCH ROSTER & PENALTIES
                </span>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[8.5px] bg-[#0d0705] p-2 rounded-lg border border-white/5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-400">🛵 Sipho M.</span>
                      <span className="font-mono text-[7px] bg-[#291307] text-orange-400 px-1 py-0.1 rounded border border-orange-500/10 uppercase">En Route Florida</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">0 mins delay</span>
                  </div>
                  <div className="flex justify-between items-center text-[8.5px] bg-[#0d0705] p-2 rounded-lg border border-white/5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-400">🛵 Ndumiso K.</span>
                      <span className="font-mono text-[7px] bg-red-950 text-red-400 px-1 py-0.1 rounded border border-red-500/10 uppercase">Trafficberea</span>
                    </div>
                    <span className={`font-mono font-bold ${weatherCondition === 'rain' ? 'text-red-400 animate-pulse' : 'text-neutral-400'}`}>
                      {weatherCondition === 'rain' ? '+14 mins late' : '+2 mins late'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 text-[9px] text-[#9e7a68] italic flex justify-between">
              <span>*Automatic dispatching evaluates rider grid distances dynamically</span>
              <span className="font-bold underline">Driver roster pdf</span>
            </div>
          </div>
        )}

        {/* PANEL C: PREDICTIVE AI & SMART RESTOCKING FORECASTS */}
        {activeSubTab === 'ai-prediction' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in lg:h-[650px]">
            {/* Left Column: Analytics Stats & Projections */}
            <div className="space-y-4 bg-neutral-950/40 p-4 border border-white/5 rounded-2xl flex flex-col justify-between h-full overflow-y-auto scrollbar-thin">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono tracking-widest text-[#a855f7] font-bold block uppercase font-sans">
                    AI DEMAND FORECAST & AUTO-BALANCING
                  </span>
                  <span className="text-[8px] font-mono text-purple-400 flex items-center gap-0.5">
                    <Sparkles size={9} className="animate-spin-slow" /> Predictive Engine Live
                  </span>
                </div>

                {/* AI Forecast warning summary and Ingredient shortage probabilities */}
                <div className="mt-2.5 p-3 bg-neutral-950/45 border border-[#a855f7]/15 rounded-xl space-y-1.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#a855f7]/5 rounded-full blur-[20px] pointer-events-none" />
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-[#a855f7] animate-bounce shrink-0" />
                    <span className="text-[10px] font-black text-purple-200">AI INGREDIENT CONGESTION DIRECTIVE</span>
                  </div>
                  <p className="text-[8.5px] text-zinc-300 leading-normal">
                    <span className="text-yellow-400 font-bold font-mono">WARNING:</span> Late evening rush expected in Berea. High (89%) probability of beef mince stockout for curried vetkoeks. 
                  </p>
                  <div className="pt-1 select-none flex items-center gap-1.5">
                    <span className="text-[7.5px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 font-mono font-bold uppercase">
                      Auto-strategy: Pre-prep 12 mince vetkoeks
                    </span>
                  </div>
                </div>

                {/* Smart Balancing appliance chart */}
                <div className="mt-4 bg-neutral-950/50 p-3 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[8px] text-neutral-400 font-mono font-black uppercase block">
                    KITCHEN SYSTEM OCCUPANCY BALANCE
                  </span>
                  
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] text-zinc-400">
                        <span>Grill Occupancy load</span>
                        <span className="font-mono font-bold">{cookingCongestionRatio}% Used</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-800 ${
                            cookingCongestionRatio > 80 ? 'bg-red-500' : cookingCongestionRatio > 50 ? 'bg-orange-500' : 'bg-amber-400'
                          }`}
                          style={{ width: `${cookingCongestionRatio}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] text-zinc-400">
                        <span>Vetkoek Fryer Capacity load</span>
                        <span className="font-mono font-bold">{Math.min(95, Math.round(cookingCongestionRatio * 1.1))}% Used</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-800 ${
                            cookingCongestionRatio * 1.1 > 80 ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
                          }`}
                          style={{ width: `${Math.min(100, Math.round(cookingCongestionRatio * 1.1))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🔮 Interactive AI Ingredient Exhaustion Predictor & Recommended Orders */}
                <div className="mt-4 bg-neutral-950/50 p-3 rounded-xl border border-[#a855f7]/15 space-y-2">
                  <span className="text-[8px] uppercase tracking-widest text-[#a855f7] font-bold block font-mono">
                    🔮 AI Item Exhaustion Forecasts ({orders.length} Past Orders Analysed)
                  </span>
                  
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin">
                    {menuItems.map((item) => {
                      const forecast = stockForecasts[item.id];
                      const stock = inventoryStock[item.id] !== undefined ? inventoryStock[item.id] : 30;
                      if (!forecast) return null;

                      return (
                        <div 
                          key={item.id}
                          className={`p-2 rounded-lg border flex items-center justify-between gap-3 text-[9px] transition-colors ${
                            forecast.replenishRecommended 
                              ? 'bg-purple-950/20 border-purple-500/20' 
                              : 'bg-neutral-900/60 border-white/5'
                          }`}
                        >
                          <div className="min-w-0 space-y-0.5 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-neutral-150 truncate block">{item.name}</span>
                              {forecast.replenishRecommended && (
                                <span className="text-[6.5px] bg-amber-500/10 text-amber-400 font-mono font-bold px-1 border border-amber-500/20 rounded animate-pulse uppercase">
                                  REPLENISH ADVISED
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-[7.5px] text-neutral-400 font-mono">
                              <span>Stock: <strong className="text-white">{stock} units</strong></span>
                              <span>&bull;</span>
                              <span>Rate: <strong className="text-white">{(forecast.salesRatePerDay).toFixed(1)}/day</strong></span>
                            </div>
                          </div>

                          <div className="text-right space-y-0.5 shrink-0">
                            <span className={`text-[9px] font-bold font-mono block ${forecast.replenishRecommended ? 'text-amber-400 font-black' : 'text-neutral-400'}`}>
                              {forecast.replenishRecommended ? `🚨 ~${forecast.runOutTimeText}` : `✅ ~${forecast.runOutTimeText}`}
                            </span>
                            <span className="text-[6.5px] text-zinc-500 font-mono block leading-none">
                              {forecast.confidence}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live terminal-like intelligence update feed */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[8px] text-neutral-500 font-mono font-bold uppercase block">
                    DYNAMIC EXECUTABLE AI FEED:
                  </span>
                  <div className="bg-black/85 rounded-xl p-2.5 border border-[#a855f7]/15 font-mono text-[7px] text-[#aa84cc] space-y-1">
                    {aiFeed.map((feedLine, idx) => (
                      <div key={idx} className="line-clamp-2">
                        {feedLine}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[9px] text-[#9e7a68] italic flex justify-between">
                <span>*Generative demand models update recursively on each checkout event.</span>
                <span className="font-bold underline text-purple-400">Config model</span>
              </div>
            </div>

            {/* Right Column: Dynamic Conversational Advisory Partner Chat */}
            <div className="bg-neutral-950/40 p-0 border border-white/5 rounded-2xl h-full flex flex-col overflow-hidden relative shadow-2xl">
              <ChatbotView 
                orders={orders}
                userName="Lekker Bites Manager"
                menuItems={menuItems}
                onSelectItem={() => {}}
                onNavigateToTab={() => {}}
                isAdminMode={true}
                financeMetrics={financeMetrics}
                inventoryStock={inventoryStock}
                complaintTickets={complaintTickets}
                weatherCondition={weatherCondition}
                cookingCongestionRatio={cookingCongestionRatio}
                kitchenDeadlockActive={kitchenDeadlockActive}
                demandMultiplier={demandMultiplier}
              />
            </div>
          </div>
        )}

        {/* PANEL D: DYNAMIC MENU MANAGEMENT & INVENTORY TRACKING */}
        {activeSubTab === 'menu-mgmt' && (
          <div className="space-y-4 animate-fade-in flex flex-col justify-between h-full">
            <div className="space-y-4">
              
              {/* HEADER CAP */}
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono tracking-widest text-[#a855f7] font-bold block uppercase">
                  📦 Gauteng Menu Inventory & Bulk Actions
                </span>
                <span className="text-[8px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  {menuItems.length} active plates on menu
                </span>
              </div>

              {/* 1. DYNAMIC INVENTORY STATUS KPIs */}
              <div className="grid grid-cols-3 gap-2">
                <div 
                  onClick={() => setInventoryFilter('low')}
                  className={`p-2.5 bg-[#0a0604] border rounded-xl space-y-1 cursor-pointer transition-all ${
                    inventoryFilter === 'low' ? 'border-orange-500 bg-orange-950/20 shadow-md' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <span className="text-[7.5px] text-zinc-400 block uppercase font-mono">Stock Warnings</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold font-mono text-orange-400">
                      {menuItems.filter(item => (inventoryStock[item.id] || 0) <= 15).length} Items Low
                    </span>
                    <AlertTriangle size={11} className="text-orange-400 animate-pulse" />
                  </div>
                  <span className="text-[6.5px] text-zinc-500 block leading-none font-mono">Stock limit &le; 15 units</span>
                </div>

                <div 
                  onClick={() => setInventoryFilter('all')}
                  className={`p-2.5 bg-[#0a0604] border rounded-xl space-y-1 cursor-pointer transition-all ${
                    inventoryFilter === 'all' ? 'border-purple-500 bg-purple-950/20 shadow-md' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <span className="text-[7.5px] text-zinc-400 block uppercase font-mono">Total Menu Assets</span>
                  <div className="text-sm font-bold font-mono text-white">
                    {menuItems.length} active
                  </div>
                  <span className="text-[6.5px] text-zinc-500 block leading-none font-mono">
                    {menuItems.filter(i => i.category === 'Beverages').length} drink, {menuItems.filter(i => i.category === 'Desserts').length} sweet
                  </span>
                </div>

                <div className="p-2.5 bg-neutral-950/50 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[7.5px] text-zinc-400 block uppercase font-mono">Warehouse stock</span>
                  <div className="text-sm font-bold font-mono text-emerald-400">
                    {Object.values(inventoryStock).reduce((sum: number, curr: number) => sum + curr, 0)} units
                  </div>
                  <span className="text-[6.5px] text-zinc-500 block leading-none font-mono">Total kitchen ingredients</span>
                </div>
              </div>

              {/* ACTION MESSAGES FEEDBACK */}
              {formError && (
                <div className="p-2.5 bg-red-950/80 border border-red-500/30 text-red-200 rounded-xl text-[9px] font-bold flex gap-1.5 items-center animate-shake">
                  <AlertTriangle size={12} className="text-red-400" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/30 text-emerald-200 rounded-xl text-[9px] font-bold flex gap-1.5 items-center animate-bounce-short">
                  <CheckCircle size={12} className="text-emerald-400 animate-pulse" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* 2. ADD FOOD ITEM USER-FRIENDLY SECTION */}
              <details className="bg-neutral-950/40 border border-amber-500/10 rounded-2xl overflow-hidden group transition-all" open={menuItems.length <= 10}>
                <summary className="p-3 bg-[#110a07] font-bold font-mono text-[10px] text-amber-400 uppercase tracking-wider flex items-center justify-between cursor-pointer select-none">
                  <span className="flex items-center gap-1.5">
                    <PlusCircle size={13} className="text-amber-500" /> Add New Food Asset
                  </span>
                  <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/20">
                    FORM SHEETS
                  </span>
                </summary>

                <div className="p-3.5 space-y-3.5 border-t border-white/5 bg-[#080503]/50">
                  
                  {/* PRESET LOAD BAR */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] uppercase font-mono tracking-wider text-zinc-400 font-bold block">
                      ⚡ Quick Food Presets (Tap to Auto-Fill Form)
                    </span>
                    <div className="grid grid-cols-3 gap-1 overflow-x-auto pb-1 max-h-[85px] scrollbar-none">
                      {PRESET_FOODS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyPreset(p)}
                          className="bg-neutral-900 hover:bg-[#1a110a] border border-white/5 p-1 rounded-lg text-left text-[8.5px] transition-colors cursor-pointer flex flex-col justify-between"
                        >
                          <span className="font-bold text-neutral-200 truncate block w-full">{p.name}</span>
                          <span className="text-[#d97706] font-bold font-mono block">R{p.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FORM BODY */}
                  <form onSubmit={handleCreateMenuItem} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Name input */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-zinc-400 uppercase font-black block">Dish Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Gauteng Curry Samosas"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          className="w-full h-8 px-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-neutral-200 outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>

                      {/* Price input */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-zinc-400 uppercase font-black block">Price ZAR (R) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="e.g. 55.00"
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(e.target.value)}
                          className="w-full h-8 px-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-neutral-200 outline-none focus:border-amber-500 transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Type input */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-zinc-400 uppercase font-black block">Food Type *</label>
                        <select
                          value={newItemType}
                          onChange={(e) => setNewItemType(e.target.value as any)}
                          className="w-full h-8 px-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-neutral-200 outline-none focus:border-amber-500 transition-colors"
                        >
                          <option value="meal">Meal 🍲</option>
                          <option value="beverage">Beverage 🥤</option>
                          <option value="dessert">Dessert 🍰</option>
                        </select>
                      </div>

                      {/* Decoupled Subcategory (Only show if Meal is selected) */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-zinc-400 uppercase font-black block">Category Mapping</label>
                        {newItemType === 'meal' ? (
                          <select
                            value={newItemCategory}
                            onChange={(e) => setNewItemCategory(e.target.value as any)}
                            className="w-full h-8 px-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-neutral-200 outline-none focus:border-amber-500 transition-colors font-semibold text-amber-500"
                          >
                            <option value="Bunny Chow">Bunny Chow</option>
                            <option value="Vetkoek">Vetkoek</option>
                            <option value="Shwamma">Shwamma</option>
                            <option value="Burgers">Burgers</option>
                            <option value="Pizza">Pizza</option>
                          </select>
                        ) : (
                          <div className="w-full h-8 px-2 bg-neutral-900/30 border border-dashed border-white/5 rounded-lg text-[10px] text-zinc-500 flex items-center italic">
                            Auto categorized as {newItemType === 'beverage' ? 'Beverages' : 'Desserts'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image URL with Preset Helper */}
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-zinc-400 uppercase font-black block">Image URL link *</label>
                      <input
                        type="text"
                        placeholder="Paste link or load preset card from top"
                        value={newItemImage}
                        onChange={(e) => setNewItemImage(e.target.value)}
                        className="w-full h-8 px-2 bg-neutral-900 border border-white/10 rounded-lg text-[10.5px] text-neutral-200 outline-none focus:border-amber-500 transition-colors truncate"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-zinc-400 uppercase font-black block">Taste Description</label>
                      <textarea
                        rows={1}
                        placeholder="Describe spicy notes or preparation details..."
                        value={newItemDescription}
                        onChange={(e) => setNewItemDescription(e.target.value)}
                        className="w-full p-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-neutral-200 outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    {/* Prep time slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[8px] font-mono text-zinc-400 font-bold uppercase">
                        <span>Preparation time limit</span>
                        <span className="text-amber-400 font-extrabold">{newItemPrepTime} Minutes</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="30"
                        value={newItemPrepTime}
                        onChange={(e) => setNewItemPrepTime(parseInt(e.target.value))}
                        className="w-full accent-amber-500 h-1 rounded-lg bg-neutral-900 appearance-none cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full h-9 bg-amber-500 text-neutral-950 text-[10.5px] font-bold uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-all shadow-md mt-1 cursor-pointer"
                    >
                      Create Food Item ➕
                    </button>
                  </form>
                </div>
              </details>

              {/* 3. DYNAMIC WAREHOUSE INVENTORY LISTING */}
              <div className="space-y-2.5">
                {/* Advanced List Filter pills bar + Smart Reorder button */}
                <div className="flex justify-between items-center bg-neutral-950/45 p-2 rounded-xl border border-white/5 flex-wrap gap-2">
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
                    <span className="text-[8px] text-zinc-500 font-bold font-mono uppercase mr-1 shrink-0">Filter:</span>
                    {(['all', 'low', 'out', 'Bunny Chow', 'Burgers', 'Vetkoek', 'Pizza', 'Desserts', 'Beverages'] as const).map(pill => {
                      const isActive = inventoryFilter === pill;
                      const count = menuItems.filter(item => {
                        const s = inventoryStock[item.id] !== undefined ? inventoryStock[item.id] : 30;
                        if (pill === 'all') return true;
                        if (pill === 'low') return s <= 15;
                        if (pill === 'out') return s === 0;
                        return item.category === pill;
                      }).length;

                      return (
                        <button
                          key={pill}
                          type="button"
                          onClick={() => setInventoryFilter(pill)}
                          className={`px-1.5 py-0.5 rounded-md text-[8px] font-mono whitespace-nowrap border shrink-0 transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#a855f7] border-purple-500 text-white font-extrabold shadow'
                              : 'bg-neutral-900 border-white/5 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {pill} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={restockingAll}
                    onClick={handleRestockAllLowItems}
                    className="px-2 py-1 bg-[#4c1d95] hover:bg-[#5b21b6] text-[8px] font-mono text-purple-200 font-bold uppercase rounded border border-[#7c3aed]/30 cursor-pointer shrink-0 transition-colors"
                  >
                    {restockingAll ? 'Restocking...' : '⚡ Smart Restock Lows'}
                  </button>
                </div>

                <div className="max-h-[380px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                  {menuItems.filter((item) => {
                    const s = inventoryStock[item.id] !== undefined ? inventoryStock[item.id] : 30;
                    if (inventoryFilter === 'all') return true;
                    if (inventoryFilter === 'low') return s <= 15;
                    if (inventoryFilter === 'out') return s === 0;
                    return item.category === inventoryFilter;
                  }).map((item) => {
                    const stock = inventoryStock[item.id] !== undefined ? inventoryStock[item.id] : 30;
                    const forecast = stockForecasts[item.id];
                    
                    // Simple KPI mappings based on standard numbers
                    const quantitySold = (item.ratingCount || 10) * 3;
                    const estimatedRevenue = quantitySold * item.price;
                    
                    // Style alerts based on current stocks
                    const isOutOfStock = stock === 0;
                    const isLowStock = stock > 0 && stock <= 15;

                    const itemCost = costOverrides[item.id] !== undefined
                      ? costOverrides[item.id]
                      : item.price * 0.45;
                    
                    const unitProfit = item.price - itemCost;
                    const profitMargin = item.price > 0 ? (unitProfit / item.price) * 100 : 0;
                    const isHighlyProfitable = profitMargin >= 55;

                    return (
                      <div
                        key={item.id}
                        id={`admin-inventory-card-${item.id}`}
                        className="p-3 bg-[#0a0604] rounded-2xl border border-white/5 flex flex-col gap-3 h-auto hover:bg-[#0e0805] hover:border-white/10 transition-all font-sans"
                      >
                        <div className="flex gap-3 items-start justify-between">
                          {/* Left thumbnail */}
                          <img
                            src={item.image}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/5 placeholder-img"
                          />

                          {/* Middle detailed metadata */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                              <span className="font-bold text-[11px] text-neutral-100 truncate block max-w-[130px]">
                                {item.name}
                              </span>
                              <span className="text-[7.5px] font-mono text-[#a855f7] font-semibold shrink-0">
                                ({item.category})
                              </span>
                              {forecast?.replenishRecommended && (
                                <span className="inline-flex items-center text-[7px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25 px-1 py-0.2 rounded shrink-0 animate-pulse uppercase leading-none">
                                  ⚠️ REPLENISH RECOMMENDED
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[8.5px] text-zinc-400 leading-none">
                              <span className="font-mono text-white font-bold">R{item.price.toFixed(2)} retail</span>
                              <span>&bull;</span>
                              <span className="text-emerald-400 font-mono font-bold">R{itemCost.toFixed(2)} cost</span>
                              <span>&bull;</span>
                              <span>⏱ {item.preparationTime} mins</span>
                            </div>

                            {/* Live stocking tracking progression bar */}
                            <div className="space-y-1 pt-0.5">
                              <div className="flex justify-between items-center text-[7.5px] font-mono font-bold leading-none">
                                <span className="text-zinc-500 uppercase">Stock remaining</span>
                                <span className={`font-mono text-[8px] font-black ${
                                  isOutOfStock ? 'text-red-400 font-extrabold animate-pulse' : isLowStock ? 'text-orange-400' : 'text-emerald-400'
                                }`}>
                                  {isOutOfStock ? 'OUT OF STOCK ❌' : `${stock} / 99 in stock`}
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden flex">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isOutOfStock ? 'w-0' : isLowStock ? 'bg-orange-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(100, (stock / 99) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Right stocking controls & remove button */}
                          <div className="flex flex-col items-end gap-2 shrink-0 pl-1.5 font-mono">
                            {/* Stock adjusting stepper */}
                            <div className="flex items-center justify-between gap-1 border border-white/10 p-0.5 rounded-lg bg-neutral-900 h-6">
                              <button
                                type="button"
                                onClick={() => handleAdjustStock(item.id, -5)}
                                title="Deduct 5 items"
                                className="w-4 h-4 text-[9px] hover:bg-neutral-800 rounded font-bold cursor-pointer text-zinc-400 flex items-center justify-center animate-pulse"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={stock}
                                onChange={(e) => handleSetExactStock(item.id, parseInt(e.target.value) || 0)}
                                className="w-5 text-center bg-transparent border-none text-[8.5px] font-mono text-zinc-200 outline-none p-0 h-full font-bold select-all overflow-hidden inline"
                              />
                              <button
                                type="button"
                                onClick={() => handleAdjustStock(item.id, 5)}
                                title="Add 5 items"
                                className="w-4 h-4 text-[9px] hover:bg-neutral-800 rounded font-bold cursor-pointer text-zinc-400 flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>

                            {/* Max Replenish button & Remove */}
                            <div className="flex gap-1 items-center">
                              <button
                                type="button"
                                onClick={() => handleSetExactStock(item.id, 99)}
                                title="Top up inventory to 99 Max"
                                className="px-1.5 py-0.5 bg-[#4c1d95]/35 border border-[#7c3aed]/20 rounded text-[7.5px] font-bold text-purple-300 cursor-pointer uppercase font-mono hover:bg-[#4c1d95]/50 transition-colors"
                              >
                                Replenish
                              </button>

                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveMenuItem(item.id, item.name)}
                                title="Remove item permanently"
                                className="p-1 text-red-400 bg-red-950/20 hover:bg-red-950/60 border border-red-500/20 hover:border-red-500/50 rounded-lg cursor-pointer transition-all"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* ADVANCED PROFIT & RECIPE EXPANSIONS */}
                        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-dashed border-white/5 text-[8px] font-mono">
                          {/* Cost Editor Panel */}
                          <div className="bg-[#110a07] p-1.5 rounded-lg border border-white/5 space-y-1">
                            <span className="text-zinc-500 uppercase font-bold tracking-wider block leading-none">
                              Dynamic Item Cost (COGS)
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-zinc-400">R</span>
                              <input
                                type="number"
                                step="0.50"
                                value={itemCost}
                                onChange={(e) => handleSetCostPrice(item.id, parseFloat(e.target.value) || 0)}
                                className="w-12 bg-neutral-900 border border-white/10 rounded px-1 py-0.5 text-[8.5px] text-white font-bold outline-none focus:border-amber-500"
                              />
                              <span className={`px-1 rounded text-[7.5px] font-semibold leading-none ${
                                isHighlyProfitable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              }`}>
                                {profitMargin.toFixed(0)}% Margin
                              </span>
                            </div>
                            <span className="text-[6.5px] text-[#9e7a68] italic block leading-none">
                              Profit/unit: R{unitProfit.toFixed(1)} ZAR
                            </span>
                          </div>

                          {/* Ingredient Checklist Expanded state toggle */}
                          <div className="flex flex-col justify-between">
                            <div className="text-neutral-500">
                              Estimated Units Dispatched: <span className="font-bold text-neutral-300">{quantitySold}</span>
                            </div>
                            <div className="text-neutral-550">
                              Exhaust Vector: <span className={`font-bold ${forecast?.replenishRecommended ? 'text-amber-400 font-extrabold' : 'text-neutral-400'}`}>{forecast ? forecast.runOutTimeText : 'N/A'}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setExpandedRecipeId(expandedRecipeId === item.id ? null : item.id)}
                              className="w-full text-left font-bold text-[#a855f7] hover:text-[#c084fc] flex items-center justify-between mt-1 cursor-pointer"
                            >
                              <span>{expandedRecipeId === item.id ? 'Hide requirements' : 'View Gauteng recipe'}</span>
                              <ChevronRight size={9} className={`transition-transform transform ${expandedRecipeId === item.id ? 'rotate-90' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Standard Gauteng milling supplier integration (visual expansion details) */}
                        {expandedRecipeId === item.id && (
                          <div className="p-2 bg-[#050302] border border-white/5 rounded-xl space-y-1.5 animate-fade-in text-[8px] font-mono text-zinc-300">
                            <span className="text-[#a855f7] font-black uppercase tracking-wider block">
                              🍁 Gauteng Culinary Mills Recipe Checksheet:
                            </span>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                              {(RECIPES[item.id] || RECIPES[item.category] || RECIPES['Bunny Chow']).map((ing, i) => (
                                <div key={i} className="flex items-center gap-1">
                                  <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                  <span className="text-zinc-300">{ing}</span>
                                </div>
                              ))}
                            </div>
                            <div className="pt-1 border-t border-white/5 flex justify-between items-center text-[7px] text-zinc-500">
                              <span>Health inspection clearance: APPROVED</span>
                              <span className="text-emerald-400">⚡ High Yield Quality</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-white/5 text-[9px] text-[#9e7a68] italic flex justify-between">
              <span>*Asset catalog modifications affect client ordering menus in real time.</span>
              <span className="font-bold underline text-amber-500">Warehouse PDF</span>
            </div>
          </div>
        )}

        {/* PANEL E: GOVERNANCE, ADMINISTRATIVE SECURITY OVERRIDES & TICKETS */}
        {activeSubTab === 'tickets' && (
          <div className="space-y-4 animate-fade-in flex flex-col justify-between h-full font-sans">
            <div>
              {/* BRAND HEADER & MFA ROLE CHECK */}
              <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-[#110a07] border border-red-500/10 rounded-2xl p-3">
                <div className="space-y-1">
                  <span className="text-[8px] font-mono tracking-widest text-[#ef4444] font-bold uppercase block leading-none">
                    PRIVILEGED AUTHORIZATION SCENARIOS
                  </span>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5 uppercase">
                    <Shield size={12} className="text-red-500 animate-[pulse_2s_infinite]" /> Role-Based Access Control Audit
                  </h4>
                </div>
                
                <div className="flex flex-wrap gap-2 text-[9px] font-mono">
                  <div className="bg-neutral-950 px-2 py-1 rounded border border-white/5 flex items-center gap-1">
                    <span className="text-zinc-500">ROLE:</span>
                    <select
                      value={adminRoleLevel}
                      onChange={(e) => {
                        const newRol = e.target.value as any;
                        setAdminRoleLevel(newRol);
                        addLog(`[ROLE PRIVILEGE CHANGE] Shifted administrator priority domain level to "${newRol}".`);
                      }}
                      className="bg-transparent text-amber-400 font-bold outline-none cursor-pointer"
                    >
                      <option value="Owner">Owner / Executive</option>
                      <option value="Manager">Shift Manager</option>
                      <option value="Dispatcher">Dispatcher</option>
                    </select>
                  </div>

                  <div className="bg-neutral-950 px-2 py-1 rounded border border-white/5 flex items-center gap-1">
                    <span className="text-zinc-500">AUTHENTICATOR:</span>
                    <button
                      onClick={() => {
                        if (mfaStatus === 'Verified') {
                          setMfaStatus('Unverified');
                          addLog('[MFA OVERRIDE] Shift administrator manually revoked secure FIDO2 Hardware token session.');
                        } else {
                          setMfaStatus('Verified');
                          addLog('[MFA VERIFICATION] Re-secured session. Administrator verified biometric Hardware Token.');
                        }
                      }}
                      className={`font-mono font-bold uppercase cursor-pointer ${
                        mfaStatus === 'Verified' ? 'text-emerald-400' : 'text-red-400 animate-pulse'
                      }`}
                    >
                      {mfaStatus === 'Verified' ? '🔑 MFA PASS' : '🔒 MFA UNLOCKED'}
                    </button>
                  </div>
                </div>
              </div>

              {/* SYSTEM-WIDE OPERATION KPIs SHIELD */}
              <div className="mt-4 bg-[#0a0604] border border-white/5 rounded-2xl p-3 space-y-2">
                <span className="text-[8.5px] uppercase tracking-widest text-neutral-400 font-bold block font-mono">
                  📊 SYSTEM-WIDE OPERATIONAL PERFORMANCE KPIs (ANNUALIZED MEDIAN)
                </span>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-neutral-950/60 p-2 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-[7.5px] text-zinc-500 uppercase block font-mono">Kitchen Throughput</span>
                    <div className="text-sm font-bold font-mono text-emerald-400 font-bold">96.4%</div>
                    <span className="text-[6.5px] text-zinc-500 block leading-none">Target &ge; 95.0%</span>
                  </div>

                  <div className="bg-neutral-950/60 p-2 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-[7.5px] text-zinc-500 uppercase block font-mono">Order Completion</span>
                    <div className="text-sm font-bold font-mono text-emerald-400 font-bold">99.1%</div>
                    <span className="text-[6.5px] text-zinc-500 block leading-none">Target &ge; 98.0%</span>
                  </div>

                  <div className="bg-neutral-950/60 p-2 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-[7.5px] text-zinc-500 uppercase block font-mono">Delivery Efficiency</span>
                    <div className="text-sm font-bold font-mono text-cyan-400 font-bold">93.8%</div>
                    <span className="text-[6.5px] text-zinc-500 block leading-none">Target &ge; 92.0%</span>
                  </div>

                  <div className="bg-neutral-950/60 p-2 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-[7.5px] text-zinc-500 uppercase block font-mono">Customer Retention</span>
                    <div className="text-sm font-bold font-mono text-emerald-400 font-bold">84.7%</div>
                    <span className="text-[6.5px] text-zinc-500 block leading-none">Target &ge; 80.0%</span>
                  </div>

                  <div className="bg-neutral-950/60 p-2 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-[7.5px] text-zinc-500 uppercase block font-mono">Refund Frequencies</span>
                    <div className="text-sm font-bold font-mono text-emerald-400 font-bold">0.35%</div>
                    <span className="text-[6.5px] text-zinc-500 block leading-none">Target &le; 1.5%</span>
                  </div>

                  <div className="bg-neutral-950/60 p-2 rounded-xl border border-white/5 space-y-0.5">
                    <span className="text-[7.5px] text-zinc-500 uppercase block font-mono">Inventory Utilization</span>
                    <div className="text-sm font-bold font-mono text-amber-500 font-bold">88.2%</div>
                    <span className="text-[6.5px] text-zinc-500 block leading-none font-mono">Coefficient Max</span>
                  </div>

                  <div className="bg-neutral-950/60 p-2 rounded-xl border border-white/5 space-y-0.5 col-span-2">
                    <span className="text-[7.5px] text-zinc-500 uppercase block font-mono">Complaint Trends Volume</span>
                    <div className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <span>1.2% Tickets</span>
                      <span className="text-[7px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded uppercase font-mono leading-none">&darr; Improving</span>
                    </div>
                    <span className="text-[6.5px] text-zinc-500 block leading-none">Decreased from 2.5% YoY</span>
                  </div>
                </div>
              </div>

              {/* OPERATIONAL DEADLOCK RESOLUTION ALERT */}
              {kitchenDeadlockActive ? (
                <div className="mt-4 p-3.5 bg-red-950/40 border border-red-500/20 rounded-2xl relative overflow-hidden animate-pulse">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full blur-[25px] pointer-events-none" />
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-red-500 shrink-0 animate-bounce" />
                        <h4 className="text-[10px] uppercase font-mono tracking-widest text-red-200 font-extrabold">
                          ⚠️ KITCHEN INFRASTRUCTURE DEADLOCK ALERT
                        </h4>
                      </div>
                      <p className="text-[8.5px] text-neutral-400 leading-normal max-w-sm">
                        High-volume Vetkoek fryer steam congestion dropped induction threshold. <strong>3 orders stalled!</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResolveDeadlock}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-neutral-950 text-[8.5px] font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-lg hover:opacity-90 flex items-center gap-1"
                    >
                      <Wrench size={10} /> Resolve Deadlock
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-500/25 rounded-2xl flex items-center justify-between text-[9px] text-emerald-400">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Kitchen Queues Optimised successfully</span>
                  </div>
                  <span className="text-[7.5px] text-neutral-500 font-mono">Deadlocks: 0 Locked</span>
                </div>
              )}

              {/* CUSTOMER COMPLAINTS RESOLUTION QUEUE */}
              <div className="mt-4 space-y-2.5">
                <span className="text-[8.5px] font-mono uppercase tracking-widest text-red-400 font-bold block">
                  🛡️ CUSTOMER COMPLAINTS RESOLUTION QUEUE
                </span>

                <div className="space-y-3">
                  {complaintTickets.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3 rounded-2xl border ${
                        t.status === 'pending'
                          ? 'bg-[#0f0a07] border-red-500/10'
                          : 'bg-neutral-950/45 border-white/5 opacity-80'
                      } space-y-2.5 transition-all`}
                    >
                      {/* Ticket header details */}
                      <div className="flex justify-between items-start gap-2 text-[9px]">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-bold text-white uppercase">{t.customerName}</h5>
                            <span className="text-zinc-500 font-mono text-[7.5px]">({t.userEmail})</span>
                          </div>
                          <span className="text-[7.5px] text-zinc-500 font-mono">
                            Order {t.orderRef} &bull; {t.timestamp}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono">
                          <span
                            className={`text-[7px] px-1.5 py-0.2 rounded border font-bold uppercase leading-none ${
                              t.severity === 'critical'
                                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                : t.severity === 'high'
                                ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}
                          >
                            {t.severity}
                          </span>

                          <span
                            className={`text-[7.5px] px-2 py-0.5 rounded-full font-black uppercase leading-none ${
                              t.status === 'pending'
                                ? 'bg-red-500/10 border-red-500/30 text-red-00'
                                : t.status === 'resolved-cashback'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : t.status === 'resolved-reprep'
                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                : 'bg-neutral-900 border-white/5 text-neutral-500'
                            }`}
                          >
                            {t.status === 'pending'
                              ? '⏳ Pending'
                              : t.status === 'resolved-cashback'
                              ? '🪙 Cashback'
                              : t.status === 'resolved-reprep'
                              ? '🔄 Re-prep'
                              : '📇 Dismissed'}
                          </span>
                        </div>
                      </div>

                      {/* Complaint payload text */}
                      <p className="text-[9.5px] text-zinc-300 leading-relaxed font-sans bg-black/35 rounded-xl p-2.5 border border-white/5">
                        &ldquo;{t.complaintText}&rdquo;
                      </p>

                      {/* Administrative compensation controls */}
                      {t.status === 'pending' && (
                        <div className="grid grid-cols-3 gap-2 pt-0.5 font-mono text-[8px] md:text-[8.5px] font-bold">
                          <button
                            type="button"
                            onClick={() => handleResolveTicket(t.id, 'cashback')}
                            className="py-1.5 px-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl cursor-pointer text-center"
                          >
                            🪙 Cashback (+50 Coins)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveTicket(t.id, 'reprep')}
                            className="py-1.5 px-1 bg-[#6366f1]/10 hover:bg-[#6366f1]/20 border border-[#6366f1]/30 text-indigo-300 rounded-xl cursor-pointer text-center"
                          >
                            🔄 Priority Re-Prep
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveTicket(t.id, 'dismiss')}
                            className="py-1.5 px-1 bg-neutral-900 hover:bg-neutral-800 border border-white/5 text-zinc-400 rounded-xl cursor-pointer text-center"
                          >
                            📇 Dismiss & Archive
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* MONOSPACED SECURITY ELEVATION AUDIT LOGGER TERMINAL */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[8.5px] tracking-widest text-neutral-500 uppercase font-bold font-mono block">
                  🛡️ REAL-TIME RBAC PRIVILEGE LOGS:
                </span>
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-red-500/10 font-mono text-[7.5px] text-red-500/80 space-y-1 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                  {rbacLogs.map((logLine, idx) => (
                    <div key={idx} className="truncate select-none leading-relaxed">
                      &gt; {logLine}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-white/5 text-[9px] text-[#9e7a68] italic flex justify-between">
              <span>*Privilege level actions are fully scoped under secure RBAC authorization paradigms.</span>
              <span className="font-bold underline text-red-400">Download Audit PDF</span>
            </div>
          </div>
        )}

        {/* PANEL G: SERVICE RATINGS AND REAL-TIME CUSTOMER FEEDBACK */}
        {activeSubTab === 'feedback' && (
          <div className="space-y-4 animate-fade-in flex flex-col justify-between h-full font-sans">
            <div>
              {/* Header metrics card */}
              <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-[#110a07] border border-amber-500/10 rounded-2xl p-3.5">
                <div>
                  <span className="text-[8px] font-mono tracking-widest text-amber-500 font-bold uppercase block leading-none">
                    Lekker Bites Service Metrics
                  </span>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5 uppercase mt-1 animate-pulse">
                    ⭐ Real-time Customer Feedback & Net Promoter System
                  </h4>
                </div>
                <div className="text-[9.5px] font-mono bg-neutral-950 px-2.5 py-1 rounded border border-white/5 text-amber-400">
                  Total Reviews Synced: <span className="font-extrabold text-white">{feedbackMetrics.total}</span>
                </div>
              </div>

              {/* Scorecards Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3.5">
                {/* Average Rating Scorecard */}
                <div className="p-3 bg-[#0c0705] border border-white/5 rounded-2xl flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/25 rounded-xl flex flex-col items-center justify-center text-amber-500">
                    <span className="text-lg font-black leading-none font-mono">{feedbackMetrics.avg}</span>
                    <span className="text-[7px] font-mono uppercase tracking-widest font-black">STARS</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-neutral-400 uppercase font-mono block">Overall Service Score</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          fill={i < Math.round(parseFloat(feedbackMetrics.avg)) ? "#f59e0b" : "none"}
                          className="text-amber-500"
                        />
                      ))}
                    </div>
                    <span className="text-[7.5px] text-neutral-500 block">Calculated from dynamic live submissions</span>
                  </div>
                </div>

                {/* Net Promoter Scorecard */}
                <div className="p-3 bg-[#0c0705] border border-white/5 rounded-2xl flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex flex-col items-center justify-center text-emerald-400">
                    <span className="text-lg font-black leading-none font-mono">{feedbackMetrics.happyPct}%</span>
                    <span className="text-[7px] font-mono uppercase tracking-widest font-black">HAPPY</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-neutral-400 uppercase font-mono block">Customer Satisfaction Index</span>
                    <div className="w-20 bg-neutral-950 h-1 rounded-full overflow-hidden mt-1 border border-white/5">
                      <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${feedbackMetrics.happyPct}%` }} />
                    </div>
                    <span className="text-[7.5px] text-[#10b981] font-mono font-bold block mt-0.5">90.0% Target Met</span>
                  </div>
                </div>

                {/* Database Source */}
                <div className="p-3 bg-[#0c0705] border border-white/5 rounded-2xl flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/25 rounded-xl flex flex-col items-center justify-center text-indigo-300 animate-pulse">
                    <Activity size={18} />
                    <span className="text-[6.5px] font-mono uppercase tracking-widest font-black mt-0.5">STREAM</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-neutral-400 uppercase font-mono block">Live Database Ingestion</span>
                    <span className="text-[10px] font-bold text-slate-100 block font-mono mt-0.5">/feedback Collection</span>
                    <span className="text-[7px] font-mono text-indigo-400 leading-none block">
                      Synced via Firestore onSnapshot
                    </span>
                  </div>
                </div>
              </div>

              {/* Distributions & Progress tabulations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {/* Distribution bars */}
                <div className="bg-[#0c0705] border border-white/5 rounded-2xl p-3.5 space-y-2">
                  <span className="text-[8.5px] text-neutral-300 font-mono font-bold block uppercase border-b border-white/5 pb-1">
                    ⭐ Service Rating Tabulation Breakdown:
                  </span>
                  <div className="space-y-1.5 font-mono text-[8px] pt-1">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = feedbackMetrics.distribution[stars as 1|2|3|4|5] || 0;
                      const pct = feedbackMetrics.total > 0 ? Math.round((count / feedbackMetrics.total) * 100) : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="w-10 text-neutral-400 text-right">{stars} Stars:</span>
                          <div className="flex-1 bg-neutral-950 border border-white/5 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-14 text-left font-bold text-white">
                            {count} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Star Filter Filter Box */}
                <div className="bg-[#0c0705] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[8.5px] text-neutral-300 font-mono font-bold block uppercase border-b border-white/5 pb-1">
                      🔍 FILTER FEEDBACK INGESTION:
                    </span>
                    <p className="text-[8px] text-neutral-400 leading-normal pt-1">
                      Deep search incoming reviews cataloged on Google Cloud Firestore database by rating class:
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-1 mt-2.5">
                    <button
                      onClick={() => setFeedbackStarFilter('all')}
                      className={`py-1.5 rounded-xl text-[8.5px] font-mono font-bold tracking-wider cursor-pointer border ${
                        feedbackStarFilter === 'all'
                          ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                          : 'bg-neutral-950 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      All Stars
                    </button>
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <button
                        key={stars}
                        onClick={() => setFeedbackStarFilter(stars)}
                        className={`py-1.5 rounded-xl text-[8.5px] font-mono font-bold tracking-wider cursor-pointer border ${
                          feedbackStarFilter === stars
                            ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                            : 'bg-neutral-950 border-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {stars} ⭐
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feedbacks table list */}
              <div className="mt-4 space-y-2">
                <span className="text-[8.5px] font-mono uppercase tracking-widest text-amber-400 font-bold block leading-none">
                  🌟 REAL-TIME FEEDBACK SUBMISSION DATABASE TABLE:
                </span>
                
                <div className="bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden shadow-inner font-mono">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[8.5px] text-left border-collapse">
                      <thead>
                        <tr className="bg-[#110a07] border-b border-white/5 text-neutral-400 uppercase text-[7px]" id="feedback-table-header">
                          <th className="p-2.5">TRANSACTION CODE</th>
                          <th className="p-2.5">REVIEWER NAME</th>
                          <th className="p-2.5">SCORE</th>
                          <th className="p-2.5">COMMENT WRITTEN BY CUSTOMER</th>
                          <th className="p-2.5 text-right">DATE SUBMITTED</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {feedbackMetrics.allReviews
                          .filter(r => feedbackStarFilter === 'all' || r.rating === feedbackStarFilter)
                          .map((f) => (
                            <tr key={f.id} className="hover:bg-neutral-900/50 transition-colors text-zinc-300 font-sans">
                              <td className="p-2.5 font-mono text-[8px] text-amber-500 font-bold">
                                #{f.transactionId || 'SEED-TXN'}
                              </td>
                              <td className="p-2.5 font-medium text-white">{f.userName || 'Customer'}</td>
                              <td className="p-2.5">
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      size={9}
                                      fill={i < f.rating ? "#f59e0b" : "none"}
                                      className="text-amber-500"
                                    />
                                  ))}
                                </div>
                              </td>
                              <td className="p-2.5 text-neutral-300 max-w-xs truncate italic">
                                {f.comment ? `"${f.comment}"` : <span className="text-neutral-500 italic">No comment left</span>}
                              </td>
                              <td className="p-2.5 text-right font-mono text-[7px] text-neutral-500">
                                {f.createdAt ? new Date(f.createdAt).toLocaleString('en-ZA', { hour12: false }) : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        {feedbackMetrics.allReviews.filter(r => feedbackStarFilter === 'all' || r.rating === feedbackStarFilter).length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-neutral-500 font-mono italic text-[8.5px]">
                              No feedbacks found matching star category filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-white/5 text-[9px] text-[#9e7a68] italic flex justify-between">
              <span>*Customer evaluations are collected instantly upon transactional dismissals.</span>
              <span className="font-bold underline text-amber-500 cursor-pointer">Export Feedbacks CSV</span>
            </div>
          </div>
        )}

        {/* PANEL H: CUSTOMER LOYALTY AND SPENDING ANALYTICS */}
        {activeSubTab === 'loyalty' && (
          <div className="space-y-4 animate-fade-in flex flex-col justify-between h-full font-sans text-white">
            <div>
              {/* Header metrics card */}
              <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-[#110a07] border border-amber-500/10 rounded-2xl p-3.5">
                <div>
                  <span className="text-[8px] font-mono tracking-widest text-amber-500 font-bold uppercase block leading-none">
                    Lekker Bites Loyalty Console
                  </span>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5 uppercase mt-1">
                    🏅 Spend Distribution & Loyalty Segment Analytics
                  </h4>
                </div>
                <div className="flex gap-2 items-center">
                  {selectedLoyaltyCategory && (
                    <button
                      onClick={() => setSelectedLoyaltyCategory(null)}
                      className="text-[9px] font-mono bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 px-2 py-0.5 rounded-lg font-bold uppercase cursor-pointer"
                    >
                      Clear Filter [x]
                    </button>
                  )}
                  <div className="text-[9.5px] font-mono bg-neutral-950 px-2.5 py-1 rounded border border-white/5 text-amber-400">
                    Active Segment: <span className="font-extrabold text-white">{selectedLoyaltyCategory ? selectedLoyaltyCategory.toUpperCase() : 'ALL CATEGORIES'}</span>
                  </div>
                </div>
              </div>

              {/* Active Filter Pill Bar */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[8px] font-mono text-neutral-400 uppercase self-center mr-1">Cuisine Filter:</span>
                <button
                  onClick={() => setSelectedLoyaltyCategory(null)}
                  className={`px-2.5 py-1 rounded-full text-[8.5px] font-bold font-mono transition-all cursor-pointer ${
                    !selectedLoyaltyCategory
                      ? 'bg-amber-500 text-neutral-950 font-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/5'
                  }`}
                >
                  All Cuisine Types
                </button>
                {['Bunny Chow', 'Burgers', 'Pizza', 'Shwamma', 'Vetkoek', 'Beverages', 'Desserts'].map((cat) => {
                  const isActive = selectedLoyaltyCategory === cat;
                  const isBunny = cat === 'Bunny Chow';
                  const label = isBunny ? 'Bunny Chow 🌶' : cat;
                  const colors: Record<string, string> = {
                    'Bunny Chow': 'border-amber-500 text-amber-300',
                    'Burgers': 'border-red-500 text-red-300',
                    'Pizza': 'border-rose-500 text-rose-300',
                    'Shwamma': 'border-emerald-500 text-emerald-300',
                    'Vetkoek': 'border-orange-500 text-orange-300',
                    'Beverages': 'border-cyan-500 text-cyan-300',
                    'Desserts': 'border-pink-500 text-pink-300',
                  };
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedLoyaltyCategory(isActive ? null : cat as any)}
                      className={`px-2.5 py-1 rounded-full text-[8.5px] font-medium font-mono border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-neutral-950 border-transparent font-black shadow-lg shadow-amber-500/10'
                          : `bg-[#0c0705] ${colors[cat] || 'border-neutral-800 text-neutral-400'} hover:brightness-125`
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Scorecards Bento Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 font-sans">
                {/* Spend Volume */}
                <div className={`p-3 bg-[#0c0705] border rounded-2xl relative overflow-hidden group transition-all ${selectedLoyaltyCategory ? 'border-amber-500/20' : 'border-white/5'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-neutral-400 uppercase font-mono block">
                      {selectedLoyaltyCategory ? `${selectedLoyaltyCategory} Spend (6M)` : 'Loyalty GMV (6M)'}
                    </span>
                    <Coins size={12} className={selectedLoyaltyCategory ? 'text-amber-400' : 'text-amber-500'} />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-neutral-500 font-mono text-xs">R</span>
                    <span className="text-base font-black font-mono text-white">
                      {loyaltyAnalytics.displaySpend.toLocaleString('en-ZA')}
                    </span>
                  </div>
                  <span className="text-[7px] text-neutral-500 block mt-1">
                    {selectedLoyaltyCategory ? `Total ZAR cycle spend for ${selectedLoyaltyCategory}` : 'Includes baseline + active demo orders'}
                  </span>
                </div>

                {/* Average Ticket */}
                <div className="p-3 bg-[#0c0705] border border-white/5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-neutral-400 uppercase font-mono block">Average Item Ticket</span>
                    <TrendingUp size={12} className="text-emerald-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-neutral-500 font-mono text-xs">R</span>
                    <span className="text-base font-black font-mono text-white">
                      {loyaltyAnalytics.displayAverageValue.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[7px] text-emerald-400 font-mono block mt-1">
                    {selectedLoyaltyCategory ? `${selectedLoyaltyCategory} mean basket` : `${loyaltyAnalytics.realOrdersCount} live Orders Synced`}
                  </span>
                </div>

                {/* Coins Issued */}
                <div className="p-3 bg-[#0c0705] border border-white/5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-neutral-400 uppercase font-mono block font-bold">Category Coins Issued</span>
                    <Award size={12} className="text-indigo-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-base font-black font-mono text-white">
                      {loyaltyAnalytics.displayPointsIssued.toLocaleString('en-ZA')}
                    </span>
                    <span className="text-[8px] text-indigo-400 font-mono">Lekker Coins</span>
                  </div>
                  <span className="text-[7px] text-neutral-500 block mt-1">
                    {selectedLoyaltyCategory ? `Estimated via ${selectedLoyaltyCategory} spend` : 'Earned via order cashbacks'}
                  </span>
                </div>

                {/* Coins Redeemed */}
                <div className="p-3 bg-[#0c0705] border border-white/5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-neutral-400 uppercase font-mono block">Coins Redeemed Portion</span>
                    <Activity size={12} className="text-rose-400 animate-pulse" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-base font-black font-mono text-white">
                      {loyaltyAnalytics.displayPointsRedeemed.toLocaleString('en-ZA')}
                    </span>
                    <span className="text-[8px] text-rose-400 font-mono">Lekker Coins</span>
                  </div>
                  <span className="text-[7px] text-neutral-500 block mt-1">
                    {selectedLoyaltyCategory ? `Calculated proportional share` : 'Converted to checkout discounts'}
                  </span>
                </div>
              </div>

              {/* Monthly Spending Goal Tracker */}
              <div className="bg-[#110a07] border border-amber-500/10 rounded-2xl p-4 mt-3 font-mono">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Target size={14} className="text-amber-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                        🎯 Monthly Spending Goal
                      </span>
                      {spendingGoal > 0 && (
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          loyaltyAnalytics.currentMonthSpend > spendingGoal
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : (loyaltyAnalytics.currentMonthSpend / spendingGoal) >= 0.8
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {loyaltyAnalytics.currentMonthSpend > spendingGoal
                            ? '🔴 Over Budget'
                            : (loyaltyAnalytics.currentMonthSpend / spendingGoal) >= 0.8
                            ? '🟡 Warning Range'
                            : '🟢 Safe Zone'}
                        </span>
                      )}
                    </div>
                    <p className="text-[8.5px] text-zinc-400 font-sans leading-relaxed">
                      Track spending momentum for <span className="text-white font-semibold">{loyaltyAnalytics.currentMonthName}</span> against your monthly target ({selectedLoyaltyCategory ? `${selectedLoyaltyCategory} Spend` : 'All Categories Spend'}).
                    </p>
                  </div>

                  {/* Goal Input form controls */}
                  <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                    <span className="text-[8.5px] text-zinc-400 uppercase">Set Goal:</span>
                    <div className="flex h-7 rounded-lg overflow-hidden border border-white/10 bg-neutral-900 focus-within:border-amber-500/50">
                      <span className="text-zinc-500 text-[9px] self-center pl-2 pr-1 select-none">R</span>
                      <input
                        type="number"
                        min="1"
                        step="100"
                        value={spendingGoal || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setSpendingGoal(isNaN(val) ? 0 : val);
                        }}
                        className="bg-transparent border-none text-white font-bold font-mono text-[9.5px] text-left outline-none py-1 w-20 max-w-full"
                        placeholder="Limit"
                      />
                    </div>
                    {/* Quick increment buttons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSpendingGoal(prev => Math.max(500, prev - 1000))}
                        className="h-7 text-[8.5px] font-bold bg-neutral-900 hover:bg-neutral-800 border border-white/5 hover:border-white/10 text-neutral-400 hover:text-white px-2 rounded-lg cursor-pointer transition-all"
                        title="Reduce budget by R1,000"
                      >
                        -1k
                      </button>
                      <button
                        onClick={() => setSpendingGoal(prev => (prev || 0) + 1000)}
                        className="h-7 text-[8.5px] font-bold bg-neutral-900 hover:bg-neutral-800 border border-white/5 hover:border-white/10 text-neutral-400 hover:text-white px-2 rounded-lg cursor-pointer transition-all"
                        title="Increase budget by R1,000"
                      >
                        +1k
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress bar and metrics */}
                <div className="mt-3.5 space-y-2">
                  <div className="flex justify-between items-baseline text-[9px]">
                    <div className="text-neutral-400">
                      Current Spend: <span className="text-white font-extrabold text-[10px]">R {loyaltyAnalytics.currentMonthSpend.toLocaleString('en-ZA')}</span>
                    </div>
                    <div className="font-bold text-neutral-300">
                      {spendingGoal > 0 ? (
                        <>
                          {((loyaltyAnalytics.currentMonthSpend / spendingGoal) * 100).toFixed(1)}% of Goal (R {spendingGoal.toLocaleString('en-ZA')})
                        </>
                      ) : (
                        'No goal configured'
                      )}
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  {spendingGoal > 0 ? (
                    <div className="relative w-full h-3 bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          loyaltyAnalytics.currentMonthSpend > spendingGoal
                            ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-600 animate-pulse'
                            : (loyaltyAnalytics.currentMonthSpend / spendingGoal) >= 0.8
                            ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, (loyaltyAnalytics.currentMonthSpend / spendingGoal) * 100)}%` }}
                      />
                      {/* Optional 80% mark indicator line if budget is within range */}
                      <div className="absolute top-0 bottom-0 left-[80%] w-0.5 border-r border-dotted border-white/40" />
                    </div>
                  ) : (
                    <div className="w-full h-3 bg-neutral-900 border border-white/5 rounded-full flex items-center justify-center">
                      <span className="text-[7.5px] text-zinc-600 uppercase font-bold">Configure spending goal limit above</span>
                    </div>
                  )}

                  {/* Summary commentary line */}
                  <div className="flex justify-between items-center text-[8.2px] text-zinc-500 pt-1">
                    <span>Baseline current month cycle: {loyaltyAnalytics.currentMonthName} sales ledger</span>
                    {spendingGoal > 0 && (
                      <span className="font-semibold">
                        {loyaltyAnalytics.currentMonthSpend > spendingGoal ? (
                          <span className="text-rose-400">
                            ⚠ Budget exceeded by R {(loyaltyAnalytics.currentMonthSpend - spendingGoal).toLocaleString('en-ZA')}!
                          </span>
                        ) : (
                          <span className="text-emerald-400">
                            ✓ R {(spendingGoal - loyaltyAnalytics.currentMonthSpend).toLocaleString('en-ZA')} buffer capacity left
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Recharts Bar Chart Panel */}
              <div className="bg-[#0c0705] border border-white/5 rounded-2xl p-3.5 mt-3 space-y-3 font-sans">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[8.5px] text-neutral-300 font-mono font-bold block uppercase pb-0.5">
                      📊 CATEGORY SPEND DISTRIBUTION CHRONOLOGY
                    </span>
                    <p className="text-[7.5px] text-neutral-400 leading-normal font-sans">
                      Interactive distribution breakdown. <span className="text-amber-400 font-bold">CLICK on any colored bar segment or legend category</span> to filter transaction logs and dashboard metrics!
                    </p>
                  </div>
                  {/* View mode buttons */}
                  <div className="flex gap-1 bg-neutral-950 p-1 rounded-xl border border-white/5 items-center">
                    <button
                      onClick={() => setShowLoyaltyTrend(!showLoyaltyTrend)}
                      className={`px-2 py-1 text-[8px] font-mono font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                        showLoyaltyTrend
                          ? 'bg-amber-500 text-neutral-950 font-black'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      <TrendingUp size={10} />
                      {showLoyaltyTrend ? 'Trend: ON' : 'Trend: OFF'}
                    </button>
                    <div className="w-px h-3.5 bg-white/10 mx-1" />
                    <button
                      onClick={() => setLoyaltyChartMode('stacked')}
                      className={`px-2.5 py-1 text-[8px] font-mono font-bold rounded-lg cursor-pointer transition-all ${
                        loyaltyChartMode === 'stacked'
                          ? 'bg-amber-500/20 text-amber-300 font-black'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      Stacked View
                    </button>
                    <button
                      onClick={() => setLoyaltyChartMode('grouped')}
                      className={`px-2.5 py-1 text-[8px] font-mono font-bold rounded-lg cursor-pointer transition-all ${
                        loyaltyChartMode === 'grouped'
                          ? 'bg-amber-500/20 text-amber-300 font-black'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      Grouped View
                    </button>
                  </div>
                </div>

                <div className="h-56 w-full font-mono" id="loyalty-category-spend-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={loyaltyAnalytics.chartData}
                      margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid stroke="#1e130c" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#78716c"
                        fontSize={8.5}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#78716c"
                        fontSize={8.5}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `R${v}`}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name && name.toString().includes('Average')) {
                            return [`R ${Number(value).toLocaleString('en-ZA')}`, name];
                          }
                          return [`R ${Number(value).toLocaleString('en-ZA')}`, name];
                        }}
                        contentStyle={{
                          backgroundColor: '#0a0503',
                          border: '1px solid #451a03',
                          borderRadius: '12px',
                          fontSize: '8.5px',
                          color: '#fff',
                          fontFamily: 'monospace'
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={24}
                        iconSize={8}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '7.5px', fontFamily: 'monospace', paddingBottom: '8px', cursor: 'pointer' }}
                        onClick={(e) => {
                          if (e && e.dataKey) {
                            const keyStr = String(e.dataKey);
                            setSelectedLoyaltyCategory(prev => prev === keyStr ? null : keyStr as any);
                          }
                        }}
                      />
                      <Bar
                        dataKey="Bunny Chow"
                        stackId={loyaltyChartMode === 'stacked' ? 'a' : undefined}
                        fill="#f59e0b"
                        radius={loyaltyChartMode === 'stacked' ? 0 : [3, 3, 0, 0]}
                        onClick={() => setSelectedLoyaltyCategory(prev => prev === 'Bunny Chow' ? null : 'Bunny Chow')}
                        cursor="pointer"
                        opacity={!selectedLoyaltyCategory || selectedLoyaltyCategory === 'Bunny Chow' ? 1 : 0.25}
                      />
                      <Bar
                        dataKey="Burgers"
                        stackId={loyaltyChartMode === 'stacked' ? 'a' : undefined}
                        fill="#ef4444"
                        radius={loyaltyChartMode === 'stacked' ? 0 : [3, 3, 0, 0]}
                        onClick={() => setSelectedLoyaltyCategory(prev => prev === 'Burgers' ? null : 'Burgers')}
                        cursor="pointer"
                        opacity={!selectedLoyaltyCategory || selectedLoyaltyCategory === 'Burgers' ? 1 : 0.25}
                      />
                      <Bar
                        dataKey="Pizza"
                        stackId={loyaltyChartMode === 'stacked' ? 'a' : undefined}
                        fill="#f43f5e"
                        radius={loyaltyChartMode === 'stacked' ? 0 : [3, 3, 0, 0]}
                        onClick={() => setSelectedLoyaltyCategory(prev => prev === 'Pizza' ? null : 'Pizza')}
                        cursor="pointer"
                        opacity={!selectedLoyaltyCategory || selectedLoyaltyCategory === 'Pizza' ? 1 : 0.25}
                      />
                      <Bar
                        dataKey="Shwamma"
                        stackId={loyaltyChartMode === 'stacked' ? 'a' : undefined}
                        fill="#10b981"
                        radius={loyaltyChartMode === 'stacked' ? 0 : [3, 3, 0, 0]}
                        onClick={() => setSelectedLoyaltyCategory(prev => prev === 'Shwamma' ? null : 'Shwamma')}
                        cursor="pointer"
                        opacity={!selectedLoyaltyCategory || selectedLoyaltyCategory === 'Shwamma' ? 1 : 0.25}
                      />
                      <Bar
                        dataKey="Vetkoek"
                        stackId={loyaltyChartMode === 'stacked' ? 'a' : undefined}
                        fill="#d97706"
                        radius={loyaltyChartMode === 'stacked' ? 0 : [3, 3, 0, 0]}
                        onClick={() => setSelectedLoyaltyCategory(prev => prev === 'Vetkoek' ? null : 'Vetkoek')}
                        cursor="pointer"
                        opacity={!selectedLoyaltyCategory || selectedLoyaltyCategory === 'Vetkoek' ? 1 : 0.25}
                      />
                      <Bar
                        dataKey="Beverages"
                        stackId={loyaltyChartMode === 'stacked' ? 'a' : undefined}
                        fill="#06b6d4"
                        radius={loyaltyChartMode === 'stacked' ? 0 : [3, 3, 0, 0]}
                        onClick={() => setSelectedLoyaltyCategory(prev => prev === 'Beverages' ? null : 'Beverages')}
                        cursor="pointer"
                        opacity={!selectedLoyaltyCategory || selectedLoyaltyCategory === 'Beverages' ? 1 : 0.25}
                      />
                      <Bar
                        dataKey="Desserts"
                        stackId={loyaltyChartMode === 'stacked' ? 'a' : undefined}
                        fill="#ec4899"
                        radius={loyaltyChartMode === 'stacked' ? [3, 3, 0, 0] : [3, 3, 0, 0]}
                        onClick={() => setSelectedLoyaltyCategory(prev => prev === 'Desserts' ? null : 'Desserts')}
                        cursor="pointer"
                        opacity={!selectedLoyaltyCategory || selectedLoyaltyCategory === 'Desserts' ? 1 : 0.25}
                      />
                      {showLoyaltyTrend && (
                        <Line
                          type="monotone"
                          dataKey="movingAverage"
                          stroke="#ffffff"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#fbbf24', stroke: '#0a0503', strokeWidth: 1.5 }}
                          activeDot={{ r: 6, fill: '#f59e0b' }}
                          name={selectedLoyaltyCategory ? `${selectedLoyaltyCategory} (3M Mean Trend)` : "Total 3M Moving Average"}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Audited data breakdown table */}
              <div className="mt-4 space-y-2">
                <span className="text-[8.5px] font-mono uppercase tracking-widest text-amber-400 font-bold block leading-none">
                  📊 FISCAL SPENDING BREAKDOWN TABLE BY MONTH:
                </span>
                
                <div className="bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden shadow-inner font-mono">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[8px] text-left border-collapse">
                      <thead>
                        <tr className="bg-[#110a07] border-b border-white/5 text-neutral-400 uppercase text-[7px]" id="loyalty-table-header">
                          <th className="p-2.5">MONTH CYCLE</th>
                          <th className={`p-2.5 text-right transition-all ${selectedLoyaltyCategory === 'Bunny Chow' ? 'bg-amber-500/20 text-amber-300 font-bold border-x border-amber-500/30' : ''}`}>BUNNY CHOW</th>
                          <th className={`p-2.5 text-right transition-all ${selectedLoyaltyCategory === 'Burgers' ? 'bg-amber-500/20 text-amber-300 font-bold border-x border-amber-500/30' : ''}`}>BURGERS</th>
                          <th className={`p-2.5 text-right transition-all ${selectedLoyaltyCategory === 'Pizza' ? 'bg-amber-500/20 text-amber-400 font-bold border-x border-amber-500/30' : ''}`}>PIZZA</th>
                          <th className={`p-2.5 text-right transition-all ${selectedLoyaltyCategory === 'Shwamma' ? 'bg-amber-500/20 text-amber-400 font-bold border-x border-amber-500/30' : ''}`}>SHWAMMA</th>
                          <th className={`p-2.5 text-right transition-all ${selectedLoyaltyCategory === 'Vetkoek' ? 'bg-amber-500/20 text-amber-400 font-bold border-x border-amber-500/30' : ''}`}>VETKOEK</th>
                          <th className={`p-2.5 text-right transition-all ${selectedLoyaltyCategory === 'Beverages' ? 'bg-amber-500/20 text-amber-400 font-bold border-x border-amber-500/30' : ''}`}>DRINKS</th>
                          <th className={`p-2.5 text-right transition-all ${selectedLoyaltyCategory === 'Desserts' ? 'bg-amber-500/20 text-amber-400 font-bold border-x border-amber-500/30' : ''}`}>DESSERTS</th>
                          <th className="p-2.5 text-right text-amber-400 font-bold">TOTAL MONTH GMV</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-neutral-300">
                        {loyaltyAnalytics.chartData.map((m) => (
                          <tr key={m.key} className="hover:bg-neutral-900/40 transition-colors">
                            <td className="p-2.5 font-bold font-sans text-neutral-100">{m.name}</td>
                            <td className={`p-2.5 text-right transition-all ${selectedLoyaltyCategory === 'Bunny Chow' ? 'bg-amber-500/5 text-amber-200 font-bold border-x border-amber-500/10' : ''}`}>R {m['Bunny Chow'].toLocaleString('en-ZA')}</td>
                            <td className={`p-2.5 text-right transition-all ${selectedLoyaltyCategory === 'Burgers' ? 'bg-amber-500/5 text-amber-200 font-bold border-x border-amber-500/10' : ''}`}>R {m['Burgers'].toLocaleString('en-ZA')}</td>
                            <td className={`p-2.5 text-right transition-all ${selectedLoyaltyCategory === 'Pizza' ? 'bg-amber-500/5 text-amber-200 font-bold border-x border-amber-500/10' : ''}`}>R {m['Pizza'].toLocaleString('en-ZA')}</td>
                            <td className={`p-2.5 text-right transition-all ${selectedLoyaltyCategory === 'Shwamma' ? 'bg-amber-500/5 text-amber-200 font-bold border-x border-amber-500/10' : ''}`}>R {m['Shwamma'].toLocaleString('en-ZA')}</td>
                            <td className={`p-2.5 text-right transition-all ${selectedLoyaltyCategory === 'Vetkoek' ? 'bg-amber-500/5 text-amber-200 font-bold border-x border-amber-500/10' : ''}`}>R {m['Vetkoek'].toLocaleString('en-ZA')}</td>
                            <td className={`p-2.5 text-right transition-all ${selectedLoyaltyCategory === 'Beverages' ? 'bg-amber-500/5 text-amber-200 font-bold border-x border-amber-500/10' : ''}`}>R {m['Beverages'].toLocaleString('en-ZA')}</td>
                            <td className={`p-2.5 text-right transition-all ${selectedLoyaltyCategory === 'Desserts' ? 'bg-amber-500/5 text-amber-200 font-bold border-x border-amber-500/10' : ''}`}>R {m['Desserts'].toLocaleString('en-ZA')}</td>
                            <td className="p-2.5 text-right font-extrabold text-amber-400">R {m.total.toLocaleString('en-ZA')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Real-time Category Order/Transaction History Logs */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[8.5px] font-mono uppercase tracking-widest text-amber-400 font-bold block leading-none">
                    📜 AUDITED transaction history ({selectedLoyaltyCategory ? `${selectedLoyaltyCategory.toUpperCase()} only` : 'All Categories'}):
                  </span>
                  {selectedLoyaltyCategory && (
                    <span className="text-[7.5px] font-mono text-zinc-500 bg-neutral-900 border border-white/5 py-0.5 px-2 rounded-md">
                      Filtered down to {loyaltyAnalytics.combinedTransactions.length} entries
                    </span>
                  )}
                </div>

                <div className="bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden shadow-inner font-mono">
                  <div className="overflow-y-auto max-h-56">
                    <table className="w-full text-[8.2px] text-left border-collapse">
                      <thead>
                        <tr className="bg-[#110a07] border-b border-white/5 text-neutral-400 uppercase text-[7px] sticky top-0" id="loyalty-history-header">
                          <th className="p-2.5">TRANSACTION ID</th>
                          <th className="p-2.5">CUSTOMER</th>
                          <th className="p-2.5">TIMESTAMP</th>
                          <th className="p-2.5">PURCHASE DETAILS</th>
                          <th className="p-2.5 text-right">TOTAL</th>
                          <th className="p-2.5 text-right text-indigo-400">COINS STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-neutral-300">
                        {loyaltyAnalytics.combinedTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-neutral-900/40 transition-colors">
                            <td className="p-2.5 font-bold text-amber-500">#{tx.id}</td>
                            <td className="p-2.5 font-sans text-neutral-200">{tx.customer}</td>
                            <td className="p-2.5 font-mono text-neutral-400 text-[7.5px]">{tx.date}</td>
                            <td className="p-2.5 font-sans italic text-neutral-300 max-w-xs truncate">{tx.items}</td>
                            <td className="p-2.5 text-right font-bold text-white">R {tx.total}</td>
                            <td className="p-2.5 text-right text-indigo-400 font-semibold">+{tx.pointsEarned} Lekker Coins</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 text-[9px] text-[#9e7a68] italic flex justify-between">
              <span>*Loyalty spending distribution accounts for full item-toppings totals and real-time live ordering flows.</span>
              <span className="font-bold underline text-amber-500 cursor-pointer">Download Spending Audit CSV</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
