import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Check,
  Truck,
  ShieldAlert,
  Navigation,
  AlertCircle,
  RotateCcw,
  RefreshCw,
  Flame,
  Coins,
  Ticket,
  FileText,
  CheckCircle2,
  Activity,
  Cpu,
  Layers,
  Award,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { Order, OrderStatus, CartItem } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';

interface OrderTrackerViewProps {
  activeOrder: Order | null;
  orders?: Order[];
  setOrders?: React.Dispatch<React.SetStateAction<Order[]>>;
  setActiveOrder?: React.Dispatch<React.SetStateAction<Order | null>>;
  loyalty?: any;
  setLoyalty?: React.Dispatch<React.SetStateAction<any>>;
  handleAddToCart?: (customItem: any) => void;
}

interface ComplaintTicket {
  ticketId: string;
  orderId: string;
  dishName: string;
  reason: string;
  outcomeType: string;
  status: 'Investigating' | 'Approved & Resolved' | 'Dispatching Cook';
  timestamp: string;
}

export default function OrderTrackerView({
  activeOrder,
  orders = [],
  setOrders,
  setActiveOrder,
  loyalty,
  setLoyalty,
  handleAddToCart,
}: OrderTrackerViewProps) {
  // Navigation for Operations Control Tabs
  const [opsTab, setOpsTab] = useState<'queue' | 'deadlock' | 'returns'>('queue');

  // Deadlock State Engine
  const [deadlockActive, setDeadlockActive] = useState(false);
  const [deadlockResolved, setDeadlockResolved] = useState(false);
  const [deadlockTimerId, setDeadlockTimerId] = useState<NodeJS.Timeout | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionLogs, setResolutionLogs] = useState<string[]>([]);
  const [selectedSolver, setSelectedSolver] = useState<'preempt' | 'abort' | 'additional'>('additional');

  // Kitchen priority queue list
  const [simulatedQueue, setSimulatedQueue] = useState([
    {
      id: '4102',
      customer: 'Sibusiso M.',
      dish: 'Traditional Curried Mince Vetkoek',
      category: 'Vetkoek',
      priority: 'Standard',
      progress: 45,
      resourceNeeded: 'Golden Vetkoek Fryer',
      currentResource: 'Golden Vetkoek Fryer',
      status: 'Cooking',
      blocked: false,
    },
    {
      id: '9055',
      customer: 'Lerato K.',
      dish: 'Quarter Lamb Bunny Chow',
      category: 'Bunny Chow',
      priority: 'Standard',
      progress: 25,
      resourceNeeded: 'Gauteng Flame Grill',
      currentResource: 'Gauteng Flame Grill',
      status: 'Cooking',
      blocked: false,
    },
    {
      id: '5091',
      customer: 'Chantal J. (VIP)',
      dish: 'The Jozi Double Smash Burger',
      category: 'Burgers',
      priority: 'High',
      progress: 70,
      resourceNeeded: 'Gauteng Flame Grill',
      currentResource: 'Gauteng Flame Grill',
      status: 'On Hold',
      blocked: false,
    },
  ]);

  // Complaints / Returns State
  const [complaintOrdersList, setComplaintOrdersList] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [complaintReason, setComplaintReason] = useState<string>('cold');
  const [complaintOutcome, setComplaintOutcome] = useState<string>('points');
  const [complaintTickets, setComplaintTickets] = useState<ComplaintTicket[]>(() => {
    const saved = localStorage.getItem('lekker_customer_tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        ticketId: 'RTN-3921',
        orderId: '8744',
        dishName: 'Boerewors & Chakalaka Pizza',
        reason: '🌶️ Curry Spice Lethal (Mouth on fire)',
        outcomeType: 'Lekker Coins Cashback',
        status: 'Approved & Resolved',
        timestamp: 'Yesterday, 14:12',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('lekker_customer_tickets', JSON.stringify(complaintTickets));
  }, [complaintTickets]);

  // Post-delivery feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackIssueKey, setFeedbackIssueKey] = useState<string | null>(null);
  const [feedbackCompensation, setFeedbackCompensation] = useState<string>('points');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackCompletedFor, setFeedbackCompletedFor] = useState<string[]>(() => {
    const saved = localStorage.getItem('lekker_feedback_completed_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Auto-open feedback modal when activeOrder becomes delivered
  useEffect(() => {
    if (activeOrder && activeOrder.status === 'delivered') {
      if (!feedbackCompletedFor.includes(activeOrder.id)) {
        setFeedbackModalOpen(true);
      }
    }
  }, [activeOrder?.status, activeOrder?.id, feedbackCompletedFor]);

  // Tracker timing and slider variables
  const [countdownMinutes, setCountdownMinutes] = useState(25);
  const [driverProgressPct, setDriverProgressPct] = useState(0);

  // Load complaints-eligible past orders (mock defaults to guarantee interactivity)
  useEffect(() => {
    const mockPast = [
      {
        id: '8744',
        timestamp: 'Yesterday, 13:48',
        total: 125.00,
        items: [
          {
            menuItem: { id: 'pizza-regina', name: 'Boerewors & Chakalaka Pizza', price: 125.00 },
            quantity: 1,
            selectedToppings: [],
          },
        ],
      },
      {
        id: '3201',
        timestamp: '2 Days Ago, 18:22',
        total: 48.00,
        items: [
          {
            menuItem: { id: 'dessert-malva', name: 'Warm Malva Pudding & Custard', price: 48.00 },
            quantity: 1,
            selectedToppings: [],
          },
        ],
      },
    ];

    // Combine actual active or legacy checkout orders with mocks
    const combined = [...orders];
    mockPast.forEach((mp) => {
      if (!combined.some((o) => o.id === mp.id)) {
        combined.push(mp as any);
      }
    });

    setComplaintOrdersList(combined);
    if (combined.length > 0 && !selectedOrderId) {
      setSelectedOrderId(combined[0].id);
    }
  }, [orders, activeOrder]);

  // Live order coordinate slider & time countdown decay (paused if deadlock is active!)
  useEffect(() => {
    if (!activeOrder) return;

    // Pausing track if there is an active deadlock
    if (deadlockActive) return;

    const initialPrepTime = activeOrder.items.reduce(
      (max, item) => Math.max(max, item.menuItem.preparationTime),
      10
    ) + 12;
    setCountdownMinutes((prev) => (prev === 25 ? initialPrepTime : prev));

    const timer = setInterval(() => {
      setCountdownMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 12000);

    const trackInterval = setInterval(() => {
      setDriverProgressPct((prev) => {
        if (activeOrder.status === 'on-the-way') {
          return prev < 90 ? prev + 3 : 95;
        } else if (activeOrder.status === 'delivered') {
          return 100;
        }
        return 0;
      });
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(trackInterval);
    };
  }, [activeOrder, deadlockActive]);

  // Handle manual queue priorities elevation inside the kitchen
  const handleElevateQueueItem = (id: string) => {
    setSimulatedQueue((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newPriority = item.priority === 'Standard' ? 'High' : 'CRITICAL (PREEMPTED)';
          return { ...item, priority: newPriority };
        }
        return item;
      })
    );
  };

  // Trigger simulated operational deadlock (hardware resources wait-for graph cycle)
  const triggerDeadlockSim = () => {
    if (deadlockActive) return;
    setDeadlockActive(true);
    setDeadlockResolved(false);
    setSelectedSolver('additional');
    setResolutionLogs([]);

    // Modify the kitchen queue state to demonstrate mutual exclusion resource blocks
    setSimulatedQueue([
      {
        id: '4102',
        customer: 'Sibusiso M.',
        dish: 'Traditional Curried Mince Vetkoek',
        category: 'Vetkoek',
        priority: 'Standard',
        progress: 45,
        resourceNeeded: 'Gauteng Flame Grill', // Sipho holds the Fryer but needs the Grill!
        currentResource: 'Golden Vetkoek Fryer (Locked)',
        status: 'Deadlocked ⚠️',
        blocked: true,
      },
      {
        id: '9055',
        customer: 'Lerato K.',
        dish: 'Quarter Lamb Bunny Chow',
        category: 'Bunny Chow',
        priority: 'Standard',
        progress: 25,
        resourceNeeded: 'Golden Vetkoek Fryer', // Lerato holds the Grill but needs the Fryer!
        currentResource: 'Gauteng Flame Grill (Locked)',
        status: 'Deadlocked ⚠️',
        blocked: true,
      },
      {
        id: '5091',
        customer: 'Chantal J. (VIP)',
        dish: 'The Jozi Double Smash Burger',
        category: 'Burgers',
        priority: 'High',
        progress: 70,
        resourceNeeded: 'Gauteng Flame Grill',
        currentResource: 'Gauteng Flame Grill (Locked)',
        status: 'Blocked 🛑',
        blocked: true,
      },
    ]);
  };

  // Run selected computer science algorithm to resolve the deadlock
  const solveDeadlockSim = (method: 'preempt' | 'abort' | 'additional') => {
    setIsResolving(true);
    setSelectedSolver(method);
    setResolutionLogs([
      `[DEBUG] Booting operational safety analyzer v2.5...`,
      `[DEBUG] Found Wait-For Node loop: Sibusiso M (#4102) ⟷ Lerato K (#9055)`,
      `[ALERT] Resource 'Golden Vetkoek Fryer' (Capacity: 1) is fully exhausted.`,
      `[ALERT] Resource 'Gauteng Flame Grill' (Capacity: 1) is fully exhausted.`,
    ]);

    let logSequence: string[] = [];

    if (method === 'preempt') {
      logSequence = [
        `[STRATEGY] RESOURCE PREEMPTION CHOSEN`,
        `[ACTION] Safely preempting 'Golden Vetkoek Fryer' lock from order #4102...`,
        `[ACTION] Swapping Sibusiso's half-fried vetkoek to hot insulation tray.`,
        `[SUCCESS] Allocating free Fryer instance to Lerato's Quarter Lamb Bunny.`,
        `[INFO] Bunny Chow order #9055 successfully cooked and resolved!`,
        `[INFO] Re-releasing fryer to Sibusiso... Cooking resumed safely.`,
        `[SYSTEM] ALL HEURISTIC CYCLES RESOLVED SUCCESSFULLY!`,
      ];
    } else if (method === 'abort') {
      logSequence = [
        `[STRATEGY] PROCESS ABANDONMENT & ROLLBACK CHOSEN`,
        `[ACTION] Sending abort SIGKILL intercept to order #4102 (Sibusiso M.).`,
        `[ACTION] Rolling back Sibusiso's order state to PLACED queue (re-allocating ingredients).`,
        `[SUCCESS] Golden Vetkoek Fryer instantly released into pool (Capacity = 1 free).`,
        `[INFO] Gauteng Flame Grill instantly claims fryer to complete Bunny Chow #9055.`,
        `[INFO] Re-queued Sibusiso #4102 back at lowest priority slot to restart prep.`,
        `[SYSTEM] ALL HEURISTIC CYCLES RESOLVED SUCCESSFULLY!`,
      ];
    } else {
      logSequence = [
        `[STRATEGY] MUTUAL EXCLUSION PREVENTION (RESOURCE ALLOCATION) CHOSEN`,
        `[ACTION] Requesting backup auxiliary hardware burner & fryer from reserve pantry...`,
        `[ACTION] Dynamically provisioned Aux-Fryer-2 & Aux-Grill-2 into operational pool!`,
        `[SUCCESS] Pool updated: Grill Capacity = 2, Fryer Capacity = 2.`,
        `[INFO] Sibusiso & Lerato orders successfully matching with dedicated burners!`,
        `[SYSTEM] Circular dependency permanently broken through prevention!`,
      ];
    }

    // Sequentially stream letters/lines onto screen for rich visual interaction!
    logSequence.forEach((line, index) => {
      setTimeout(() => {
        setResolutionLogs((prev) => [...prev, line]);
        if (index === logSequence.length - 1) {
          setIsResolving(false);
          setDeadlockActive(false);
          setDeadlockResolved(true);

          // Restore simulated kitchen queue state back to normal
          setSimulatedQueue([
            {
              id: '4102',
              customer: 'Sibusiso M.',
              dish: 'Traditional Curried Mince Vetkoek',
              category: 'Vetkoek',
              priority: 'Standard',
              progress: 100,
              resourceNeeded: 'Golden Vetkoek Fryer',
              currentResource: 'Completed',
              status: 'Ready for delivery 🛵',
              blocked: false,
            },
            {
              id: '9055',
              customer: 'Lerato K.',
              dish: 'Quarter Lamb Bunny Chow',
              category: 'Bunny Chow',
              priority: 'Standard',
              progress: 100,
              resourceNeeded: 'Gauteng Flame Grill',
              currentResource: 'Completed',
              status: 'Ready for delivery 🛵',
              blocked: false,
            },
            {
              id: '5091',
              customer: 'Chantal J. (VIP)',
              dish: 'The Jozi Double Smash Burger',
              category: 'Burgers',
              priority: 'High',
              progress: 100,
              resourceNeeded: 'Gauteng Flame Grill',
              currentResource: 'Completed',
              status: 'Ready for delivery 🛵',
              blocked: false,
            },
          ]);

          // Award loyalty reward bonus points for resolving the grid deadlock!
          if (loyalty && setLoyalty) {
            setLoyalty((prev: any) => ({
              ...prev,
              pointsBalance: prev.pointsBalance + 25,
              lifetimePoints: prev.lifetimePoints + 25,
            }));
          }
        }
      }, (index + 1) * 350);
    });
  };

  // Reusable core complaint ticketing and compensation logic
  const coreCreateComplaint = (
    orderId: string,
    reason: string, // 'spicy' | 'cold' | 'missing' | 'deadlock' | 'none'
    outcome: string, // 'recook' | 'points' | 'voucher' | 'none'
    commentText?: string,
    ratingScore?: number
  ) => {
    const matchedOrder = complaintOrdersList.find((o) => o.id === orderId);
    const dishName = matchedOrder?.items?.[0]?.menuItem?.name || 'Mzansi Gourmet Item';

    const ticketId = 'RTN-' + Math.floor(1000 + Math.random() * 9000);
    
    let reasonLabel = 'N/A (Satisfied)';
    if (reason === 'spicy') reasonLabel = '🌶️ Lethal Spice Burn (curry too hot)';
    if (reason === 'cold') reasonLabel = '❄️ Arrived cold as Drakensberg winter';
    if (reason === 'missing') reasonLabel = '🥓 Missing Extra Toppings (Polony/Chakalaka)';
    if (reason === 'deadlock') reasonLabel = '⏳ High latency delay due to kitchen deadlock';

    let outcomeLabel = 'None (Standard Review)';
    if (outcome === 'recook') outcomeLabel = 'Immediate Priority Re-Cook Dispatch';
    if (outcome === 'points') outcomeLabel = '150 Coins Refund';
    if (outcome === 'voucher') outcomeLabel = 'Apology Voucher (Free Vetkoek)';

    // 1. Create Customer-facing Ticket
    const newTicket: ComplaintTicket = {
      ticketId,
      orderId,
      dishName,
      reason: reasonLabel,
      outcomeType: outcomeLabel,
      status: outcome === 'recook' ? 'Dispatching Cook' : 'Approved & Resolved',
      timestamp: 'Just now',
    };
    setComplaintTickets((prev) => [newTicket, ...prev]);

    // 2. Create and push Administrator-facing Ticket (synchronized to 'durban_complaint_tickets')
    const adminSaved = localStorage.getItem('durban_complaint_tickets');
    let adminTickets: any[] = [];
    if (adminSaved) {
      try {
        adminTickets = JSON.parse(adminSaved);
      } catch (e) {}
    }

    const userNameStr = localStorage.getItem('lekker_username') || 'Nkululeko';
    const userEmailStr = localStorage.getItem('lekker_email') || 'nkululeko@gmail.com';

    let severityValue = 'low';
    if (reason === 'spicy' || (ratingScore && ratingScore <= 2)) severityValue = 'critical';
    else if (reason === 'missing' || reason === 'cold') severityValue = 'high';
    else if (reason === 'deadlock') severityValue = 'medium';

    const cleanComment = commentText ? ` — Comment: "${commentText}"` : "";
    const adminTicket = {
      id: 'T-' + Math.floor(1000 + Math.random() * 9000),
      customerName: userNameStr,
      userEmail: userEmailStr,
      orderRef: '#' + orderId,
      timestamp: 'Just now',
      severity: severityValue,
      complaintText: `[Rating: ${ratingScore || 5} Stars] Code: ${reasonLabel}${cleanComment}`,
      status: reason === 'none' ? 'resolved' : 'pending',
    };

    adminTickets = [adminTicket, ...adminTickets];
    localStorage.setItem('durban_complaint_tickets', JSON.stringify(adminTickets));

    // Synchronize post-delivery feedback directly into Firestore 'feedback' collection
    const feedbackId = `FB-${orderId || 'txn'}-${Date.now().toString().slice(-4)}`;
    const syncFeedbackToFirestore = async () => {
      try {
        const docRef = doc(db, 'feedback', feedbackId);
        const payload = {
          feedbackId: feedbackId,
          userId: auth?.currentUser?.uid || 'anonymous',
          userName: userNameStr || localStorage.getItem('lekker_username') || 'Customer',
          rating: ratingScore !== undefined ? Math.round(ratingScore) : 5,
          comment: (commentText || '').trim() || `Complaint filed: ${reasonLabel}`,
          transactionId: orderId || 'unknown',
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, payload);
      } catch (e) {
        console.error("Failed to write delivered feedback to Firestore:", e);
        try {
          handleFirestoreError(e, OperationType.CREATE, `feedback/${feedbackId}`);
        } catch (err) {}
      }
    };
    syncFeedbackToFirestore();

    // 3. Handle immediate side effects depending on outcome
    if (outcome === 'recook') {
      if (activeOrder && activeOrder.id === orderId && setActiveOrder) {
        setActiveOrder({
          ...activeOrder,
          status: 'preparing',
        });
        setCountdownMinutes(6);
      }

      setSimulatedQueue((prev) => [
        {
          id: orderId,
          customer: `${userNameStr} (RE-COOK)`,
          dish: dishName,
          category: 'Bunny Chow',
          priority: 'CRITICAL (COMPLAINT PREEMPTION)',
          progress: 5,
          resourceNeeded: 'Gauteng Flame Grill',
          currentResource: 'Gauteng Flame Grill (Exchanged)',
          status: 'Cooking Priority #1 🌟',
          blocked: false,
        },
        ...prev,
      ]);

      alert(`🔄 Priority preemption re-cook approved! Ticket ${ticketId} dispatched directly to Master Chef. Your item has moved to Front-of-Queue!`);
    } else if (outcome === 'points') {
      if (setLoyalty) {
        setLoyalty((prev: any) => ({
          ...prev,
          pointsBalance: prev.pointsBalance + 150,
          lifetimePoints: prev.lifetimePoints + 150,
        }));
      }
      alert(`🪙 Compensation approved! 150 Lekker Coins (equivalent refund credit) has been instantly loaded to your loyalty balance.`);
    } else if (outcome === 'voucher') {
      if (handleAddToCart) {
        handleAddToCart({
          menuItem: {
            id: 'vetkoek-sweet',
            category: 'Vetkoek',
            name: '🎁 Apology Free Apricot Vetkoek',
            price: 0.00,
            description: '100% Free crispy vetkoek with butter and sweet jam to apologize for order delay.',
            rating: 5.0,
            ratingCount: 1,
            preparationTime: 1,
          },
          selectedToppings: [],
          quantity: 1,
          diningOption: 'takeaway',
          note: `Apology return voucher credited for Ticket ${ticketId}`,
        });
        alert(`🥡 Free Vetkoek Voucher redeemed! We have appended a free dessert to your order basket. Check your Cart tab!`);
      }
    } else {
      // Just normal positive review with rating
      if (setLoyalty) {
        setLoyalty((prev: any) => ({
          ...prev,
          pointsBalance: prev.pointsBalance + 10,
          lifetimePoints: prev.lifetimePoints + 10,
        }));
      }
      alert(`🇿🇦 Siyabonga! Thank you for rating your master series culinary experience. We have added 10 complimentary Lekker Coins to your wallet!`);
    }
  };

  // Process filing returns, complaints and claim compensatory refunds!
  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    coreCreateComplaint(selectedOrderId, complaintReason, complaintOutcome);
  };

  // Steps indicator computed for active order
  const steps = activeOrder
    ? [
        {
          title: 'Order Placed & Confirmed',
          desc: 'Paid securely via ' + (activeOrder.paymentGateway || 'Yoco'),
          isCompleted: true,
          isActive: activeOrder.status === 'placed',
        },
        {
          title: 'Gauteng Kitchen Cooking',
          desc: deadlockActive
            ? '🔥 PAUSED: Kitchen Operations deadlocked! Resolve below'
            : 'Master Chef is seasoning your items with traditional Gauteng spices!',
          isCompleted: activeOrder.status !== 'placed',
          isActive: activeOrder.status === 'preparing',
        },
        {
          title: 'Out for Mzansi Delivery',
          desc: activeOrder.diningOption === 'dine-in' ? 'Ready at serving counter' : 'Lekker rider is riding down Francis Baard St / Commissioner St',
          isCompleted: activeOrder.status === 'delivered' || activeOrder.status === 'on-the-way',
          isActive: activeOrder.status === 'on-the-way',
        },
        {
          title: 'Delivered & Enjoyed!',
          desc: 'Sharp! Food received hand-to-hand hot and steaming',
          isCompleted: activeOrder.status === 'delivered',
          isActive: activeOrder.status === 'delivered',
        },
      ]
    : [];

  const calculateDriverCoordinates = () => {
    const ratio = driverProgressPct / 100;
    const pathX = 80 + ratio * 220;
    const pathY = 50 + ratio * 150;
    return { x: pathX, y: pathY };
  };

  const driverCoords = calculateDriverCoordinates();

  return (
    <div id="tracker-view-container" className="flex flex-col p-4 pb-12 w-full text-white space-y-4 font-sans animate-fade-in">
      
      {/* 1. MAP & GPS MILESTONES (Rendered if an order is active) */}
      {activeOrder ? (
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-neutral-400 text-[10px] font-mono tracking-widest block uppercase">LIVE MZANSI ORDER MAP</span>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                Lekker Tracker 🇿🇦
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-neutral-450 font-mono block">ORDER NO</span>
              <span className="text-xs font-mono font-bold text-amber-400">#{activeOrder.id}</span>
            </div>
          </div>

          {/* Dynamic Interactive GPS Map */}
          <div id="live-vector-map-panel" className="relative h-[190px] rounded-2xl bg-[#0c0705] border border-orange-500/15 overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-[radial-gradient(#2a170d_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />

            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <line x1="20" y1="50" x2="380" y2="50" stroke="#1c1109" strokeWidth="4" />
              <line x1="80" y1="20" x2="80" y2="200" stroke="#1c1109" strokeWidth="6" />
              <line x1="280" y1="20" x2="280" y2="200" stroke="#1c1109" strokeWidth="6" />
              <line x1="20" y1="120" x2="380" y2="120" stroke="#1c1109" strokeWidth="4" />
              <line x1="80" y1="50" x2="280" y2="200" stroke="#160e08" strokeWidth="8" strokeDasharray="4 4" />

              <text x="95" y="32" fill="#d97706" opacity="0.8" fontSize="8" fontFamily="monospace" fontWeight="bold">COMMISSIONER ST</text>
              <text x="210" y="112" fill="#d97706" opacity="0.8" fontSize="8" fontFamily="monospace" fontWeight="bold">GAUTENG CBD</text>
              <text x="20" y="145" fill="#451a03" fontSize="8" fontFamily="sans-serif">Francis Baard St</text>

              <line
                x1="80"
                y1="50"
                x2="280"
                y2="200"
                stroke={deadlockActive ? '#ef4444' : '#f59e0b'}
                strokeWidth="3.5"
                strokeLinecap="round"
                className={`opacity-75 ${deadlockActive ? 'animate-pulse' : 'glow-amber-soft'}`}
              />

              <circle cx="80" cy="50" r="6" fill="#ef4444" className="glow-orange-soft" />
              <text x="10" y="45" fill="#ef4444" fontSize="8" fontWeight="bold" fontFamily="sans-serif">LEKKER KITCHEN</text>

              <circle cx="280" cy="200" r="8" fill="#10b981" className="animate-pulse" />
              <text x="215" y="212" fill="#10b981" fontSize="8" fontWeight="bold" fontFamily="sans-serif">YOUR TABLE / IP</text>
            </svg>

            {/* Simulated Rider or Alert Notification */}
            {deadlockActive ? (
              <div className="absolute top-[60px] left-[70px] bg-red-950 border border-red-500 rounded-xl p-2 flex items-center gap-1.5 animate-pulse shadow-md">
                <span className="text-xs">⚠️</span>
                <span className="text-[8px] font-mono uppercase text-red-300 font-bold">DEADLOCK DETECTED</span>
              </div>
            ) : activeOrder.status === 'on-the-way' ? (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 flex flex-col items-center"
                style={{
                  left: `${driverCoords.x}px`,
                  top: `${driverCoords.y}px`,
                }}
              >
                <div className="absolute w-6 h-6 bg-amber-500/30 rounded-full animate-ping -z-10" />
                <div className="w-8 h-8 rounded-full bg-neutral-900 border-2 border-amber-400 shadow-lg flex items-center justify-center text-white text-xs">
                  🛵
                </div>
                <span className="bg-amber-400 text-neutral-950 font-black font-mono text-[7px] px-1 py-0.2 rounded mt-0.5 select-none whitespace-nowrap shadow-sm">
                  Sipho (Lekker Rider)
                </span>
              </div>
            ) : activeOrder.status === 'preparing' ? (
              <div className="absolute top-[60px] left-[70px] bg-neutral-900/90 border border-orange-500/15 rounded-xl p-2 flex items-center gap-1.5 animate-bounce shadow-md">
                <span className="text-xs">🍳</span>
                <span className="text-[8px] font-mono uppercase text-amber-300 font-bold">Grill & Fryer Active</span>
              </div>
            ) : null}

            <div className="absolute bottom-2.5 left-2.5 bg-[#120a06]/90 border border-white/5 px-2.5 py-1 rounded-lg text-[9px] font-mono text-zinc-400 flex items-center gap-1">
              <Truck size={10} className="text-emerald-500" />
              <span>GPS Tracking System • Gauteng, ZA</span>
            </div>
          </div>

          {/* Custom Visual Transit Map Progress Bar */}
          <div className="glass-panel border-amber-500/10 rounded-2xl p-4 space-y-4 shadow-lg bg-neutral-950/40 font-sans">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold block uppercase">
                🚚 Delivery Route & Stage Progress
              </span>
              <span className="text-[8.5px] font-mono text-neutral-400">
                Gauteng CBD Logistics Area Map
              </span>
            </div>

            {/* Interactive Progress Bar with Custom Pins */}
            <div className="relative pt-6 pb-4 px-4 bg-neutral-950/80 rounded-xl border border-white/5 overflow-hidden">
              {/* Background Map Grid / Lines detail */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
              
              {/* Route line connecting pins */}
              <div className="relative h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    deadlockActive 
                      ? 'bg-red-500 animate-pulse' 
                      : 'bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500'
                  }`}
                  style={{
                    width: `${
                      activeOrder.status === 'placed' ? '12%' :
                      activeOrder.status === 'preparing' ? '30%' :
                      activeOrder.status === 'on-the-way' ? `${30 + (driverProgressPct * 0.55)}%` :
                      activeOrder.status === 'delivered' ? '100%' : '5%'
                    }`
                  }}
                />
              </div>

              {/* Pins relative position */}
              <div className="relative w-full -mt-5 flex justify-between px-1">
                
                {/* 1. KITCHEN PIN (10% approx) */}
                <div className="flex flex-col items-center">
                  <div className="h-6" /> {/* spacer */}
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing glow if active */}
                    {(activeOrder.status === 'placed' || activeOrder.status === 'preparing') && !deadlockActive && (
                      <span className="absolute w-7 h-7 rounded-full bg-orange-500/25 animate-ping" />
                    )}
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all shadow-md ${
                        activeOrder.status === 'placed' || activeOrder.status === 'preparing'
                          ? 'bg-orange-500/10 border-orange-500 scale-110 text-orange-400'
                          : 'bg-emerald-500 text-neutral-950 border-emerald-500'
                      }`}
                    >
                      {activeOrder.status !== 'placed' && activeOrder.status !== 'preparing' ? (
                        <Check size={11} strokeWidth={4} />
                      ) : (
                        <span className="text-[10px]">🍳</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[9.5px] font-bold mt-2 ${
                    activeOrder.status === 'placed' || activeOrder.status === 'preparing'
                      ? 'text-orange-400'
                      : 'text-emerald-400'
                  }`}>
                    Kitchen
                  </span>
                  <span className="text-[7.5px] font-mono text-neutral-500 leading-none mt-0.5">
                    {activeOrder.status === 'placed' ? 'Placed' : activeOrder.status === 'preparing' ? 'Cooking' : 'Completed'}
                  </span>
                </div>

                {/* 2. TRANSIT PIN (50% approx) */}
                <div className="flex flex-col items-center">
                  <div className="h-6" /> {/* spacer */}
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing glow if active */}
                    {activeOrder.status === 'on-the-way' && (
                      <span className="absolute w-7 h-7 rounded-full bg-amber-500/25 animate-ping" />
                    )}
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all shadow-md ${
                        activeOrder.status === 'on-the-way'
                          ? 'bg-amber-400/10 border-amber-400 scale-110 text-amber-400 animate-pulse'
                          : activeOrder.status === 'delivered'
                          ? 'bg-emerald-500 text-neutral-950 border-emerald-500'
                          : 'bg-[#120a06] border-neutral-800 text-neutral-650'
                      }`}
                    >
                      {activeOrder.status === 'delivered' ? (
                        <Check size={11} strokeWidth={4} />
                      ) : (
                        <Truck size={12} className={activeOrder.status === 'on-the-way' ? 'animate-bounce text-amber-400' : 'text-neutral-500'} />
                      )}
                    </div>
                  </div>
                  <span className={`text-[9.5px] font-bold mt-2 ${
                    activeOrder.status === 'on-the-way'
                      ? 'text-amber-400'
                      : activeOrder.status === 'delivered'
                      ? 'text-emerald-400'
                      : 'text-neutral-500'
                  }`}>
                    Transit
                  </span>
                  <span className="text-[7.5px] font-mono text-neutral-500 leading-none mt-0.5">
                    {activeOrder.status === 'on-the-way' ? 'On the road' : activeOrder.status === 'delivered' ? 'Completed' : 'Queued'}
                  </span>
                </div>

                {/* 3. ARRIVING PIN (90% approx) */}
                <div className="flex flex-col items-center">
                  <div className="h-6" /> {/* spacer */}
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing glow if active */}
                    {activeOrder.status === 'delivered' && (
                      <span className="absolute w-7 h-7 rounded-full bg-emerald-500/25 animate-ping" />
                    )}
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all shadow-md ${
                        activeOrder.status === 'delivered'
                          ? 'bg-emerald-500/10 border-emerald-500 scale-110 text-emerald-400'
                          : 'bg-[#120a06] border-neutral-800 text-neutral-600'
                      }`}
                    >
                      <MapPin size={12} className={activeOrder.status === 'delivered' ? 'text-emerald-400' : 'text-neutral-500'} />
                    </div>
                  </div>
                  <span className={`text-[9.5px] font-bold mt-2 ${
                    activeOrder.status === 'delivered'
                      ? 'text-emerald-400 font-extrabold'
                      : 'text-neutral-500'
                  }`}>
                    Arriving
                  </span>
                  <span className="text-[7.5px] font-mono text-neutral-500 leading-none mt-0.5">
                    {activeOrder.status === 'delivered' ? 'Arrived!' : activeOrder.status === 'on-the-way' ? 'Nearly here' : 'Pending'}
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* ETA Clock Panel */}
          <div className="glass-panel border-amber-500/12 rounded-2xl p-4 flex justify-between items-center shadow-lg">
            <div className="flex gap-3 items-center">
              <div className={`w-10 h-10 rounded-xl bg-neutral-950 border border-white/5 flex items-center justify-center ${deadlockActive ? 'text-red-500' : 'text-amber-400'}`}>
                {deadlockActive ? (
                  <ShieldAlert size={20} className="animate-pulse text-red-500" />
                ) : (
                  <Clock size={20} className="animate-spin-slow glow-amber-soft" />
                )}
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider font-mono text-neutral-500 block font-bold">ESTIMATED ARRIVAL</span>
                <span id="tracker-eta-time" className={`text-sm font-black font-mono block ${deadlockActive ? 'text-red-500 animate-pulse' : 'text-white glow-amber-soft'}`}>
                  {deadlockActive ? '∞ INFINITE LOCK' : activeOrder.status === 'delivered' ? 'ARRIVED!' : `${countdownMinutes} - ${countdownMinutes + 3} Mins`}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider font-mono text-neutral-500 block font-bold">STATUS</span>
              <span className={`text-xs font-black font-mono uppercase tracking-wide px-2 py-0.5 rounded-full ${deadlockActive ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-amber-400 glow-amber-soft'}`}>
                {deadlockActive ? 'Blocked' : activeOrder.status === 'placed' ? 'Placed' : activeOrder.status === 'preparing' ? 'Preparing' : activeOrder.status === 'on-the-way' ? 'On The Way' : 'Delivered'}
              </span>
            </div>
          </div>

          {/* Rider Details */}
          {activeOrder.diningOption === 'takeaway' && (
            <div className="flex justify-between items-center glass-panel-interactive border-amber-500/15 rounded-2xl p-3">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-500 flex items-center justify-center text-neutral-950 text-base font-black select-none shadow-sm shadow-orange-500/20">
                  SM
                </div>
                <div>
                  <span className="text-[9px] text-neutral-500 font-mono uppercase tracking-wide block font-bold">Your Delivery Rider</span>
                  <span className="text-xs font-bold text-white block">Sipho Madlala 🇿🇦</span>
                  <span className="text-[9px] italic text-emerald-400 font-mono font-bold">5.0 ★ Rating • Gauteng Depot</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => alert("Simulating telephone connection with Sipho Madlala... Line connected!")}
                  className="w-8.5 h-8.5 rounded-xl bg-neutral-950/80 border border-white/5 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Phone size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const riderMsg = deadlockActive
                      ? "Rider Sipho: 'Howzit sharp my friend! I'm sitting inside the kitchen waiting for the chefs to resolve the resource deadlock on the Spiced Grill. Please click the solver below to speed them up!'"
                      : "Rider Sipho: 'Yo my friend! Just loaded your Bunny Chow in my insulated bag. Turning onto Florida Road now, see you in 2 mins!'";
                    alert(riderMsg);
                  }}
                  className="w-8.5 h-8.5 rounded-xl bg-neutral-950/80 border border-white/5 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <MessageSquare size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Stepper milestones */}
          <div className="space-y-2 pt-1 border-b border-white/5 pb-4">
            <h3 className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 font-bold">
              Step-by-Step Milestones
            </h3>
            <div className="space-y-2">
              {steps.map((st, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    st.isActive
                      ? 'border-amber-500/40 bg-amber-500/10'
                      : 'border-white/5 bg-[#120a06]/45'
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    {st.isCompleted ? (
                      <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-neutral-900 font-black text-[9px]">
                        ✓
                      </div>
                    ) : st.isActive ? (
                      <div className="w-4.5 h-4.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full border border-neutral-800 bg-neutral-950" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className={`text-xs font-bold leading-tight ${st.isActive ? 'text-amber-400' : 'text-neutral-200'}`}>
                      {st.title}
                    </h4>
                    <p className={`text-[9px] transition-colors leading-relaxed ${st.isActive ? 'text-amber-300/80' : 'text-neutral-500'}`}>
                      {st.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Elegant post-delivery feedback / rating section */}
          {activeOrder.status === 'delivered' && (
            <div className="bg-gradient-to-r from-orange-500/15 to-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-2.5 shadow-lg animate-fade-in">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[8.5px] font-mono tracking-widest text-amber-400 font-extrabold uppercase">FEAST FEEDBACK DISPATCHED</span>
                  <h4 className="text-xs font-bold text-white">How was your Gauteng food adventure?</h4>
                </div>
                <span className="text-xl">🍲🇿🇦</span>
              </div>
              <p className="text-[10px] text-neutral-450 leading-normal">
                Siyabonga! Savoring the flavours of Pretoria & Jozi CBDs. Your rating helps our riders, local artisans, and premium kitchen crew maintain strict benchmarks.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-mono font-black text-[9.5px] tracking-wider uppercase transition-all duration-150 cursor-pointer shadow-md transform active:scale-97"
                >
                  {feedbackCompletedFor.includes(activeOrder.id) ? 'Edit Order Review ✍️' : 'Rate & Leave Feedback 🌟'}
                </button>
                {feedbackCompletedFor.includes(activeOrder.id) && (
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                    ✓ Feedback submitted!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* NO ACTIVE ORDER FALLBACK */
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-neutral-400 text-[10px] font-mono tracking-widest block uppercase">LIVE MZANSI ORDER MAP</span>
              <h2 className="text-xl font-black text-white tracking-tight">Lekker Tracker 🇿🇦</h2>
            </div>
          </div>

          <div className="border border-white/5 rounded-2xl bg-[#120a06]/40 p-5 text-center space-y-3 shadow-inner">
            <div className="w-12 h-12 rounded-full bg-[#1e140d] border border-orange-500/20 flex items-center justify-center mx-auto text-orange-400">
              <Navigation size={20} className="transform rotate-45 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-neutral-200">No Current Route Tracked</h3>
              <p className="text-[10px] text-neutral-500 leading-normal max-w-[280px] mx-auto">
                No active order flow is dispatched right now. Standard operations are idle. Feel free to play with our real-time kitchen simulation console below!
              </p>
            </div>
            <span className="inline-block text-[9px] px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-mono font-bold">
              KITCHEN INACTIVE
            </span>
          </div>
        </div>
      )}

      {/* 2. LEKKER KITCHEN OPS CONTROL HUB */}
      <div className="space-y-3 pt-2">
        <div className="border-t border-white/5 pt-4">
          <span className="text-amber-500 text-[10px] font-mono tracking-widest block uppercase">LEKKER CONSOLE</span>
          <h3 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
            Kitchen Queue & Returns Manager 🛠️
          </h3>
        </div>

        {/* Console Tab Selector */}
        <div className="grid grid-cols-3 gap-1 p-0.5 bg-neutral-950/80 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setOpsTab('queue')}
            className={`py-1.5 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
              opsTab === 'queue'
                ? 'bg-[#291811] text-amber-400 border border-amber-500/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            🍳 Queue Monitor
          </button>
          <button
            type="button"
            onClick={() => setOpsTab('deadlock')}
            className={`py-1.5 text-center text-[10px] font-bold rounded-lg relative transition-all cursor-pointer ${
              opsTab === 'deadlock'
                ? 'bg-[#291811] text-amber-400 border border-amber-500/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            ⚠️ Deadlocks
            {deadlockActive && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpsTab('returns')}
            className={`py-1.5 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
              opsTab === 'returns'
                ? 'bg-[#291811] text-amber-400 border border-amber-500/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            📋 Complaints & Returns
          </button>
        </div>

        {/* Tab content area */}
        <div id="ops-tab-content-panel" className="glass-panel border-white/5 p-4 rounded-2xl min-h-[220px]">
          
          {/* TAB 1: KITCHEN QUEUE MONITOR */}
          {opsTab === 'queue' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black text-neutral-200">Active Prep Channels</h4>
                  <p className="text-[9px] text-neutral-500">Live priority listing of dishes inside Lekker Bites kitchen</p>
                </div>
                <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                  SYSTEM ACTIVE
                </span>
              </div>

              {/* Hardware resources slots status indicators */}
              <div className="grid grid-cols-2 gap-2 bg-neutral-950/40 p-2.5 rounded-xl border border-white/5">
                <div>
                  <span className="text-[8px] font-mono font-bold text-neutral-500 uppercase block">Spiced Grill Resource</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${deadlockActive ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`} />
                    <span className="text-[9px] font-mono font-bold text-neutral-300">
                      {deadlockActive ? 'Full (Deadlocked)' : '1/2 Slots Used'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[8px] font-mono font-bold text-neutral-500 uppercase block">Vetkoek deep-Fryer</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${deadlockActive ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-[9px] font-mono font-bold text-neutral-300">
                      {deadlockActive ? 'Full (Circular Block)' : '1/1 Slots Used'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Prep Queue Lists */}
              <div className="space-y-2">
                {simulatedQueue.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      item.blocked
                        ? 'border-red-500/30 bg-red-950/15'
                        : item.priority === 'High' || item.priority.includes('CRITICAL')
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-white/5 bg-neutral-900/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-neutral-200">{item.dish}</span>
                          <span className={`text-[7px] px-1 py-0.2 rounded font-mono font-bold uppercase ${
                            item.blocked
                              ? 'bg-red-500/20 text-red-400'
                              : item.priority.includes('CRITICAL')
                              ? 'bg-emerald-500 text-neutral-950 animate-pulse'
                              : item.priority === 'High'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-[8px] font-mono text-neutral-500">
                          Order #{item.id} • Customer: {item.customer} • Lock: {item.currentResource}
                        </p>
                      </div>

                      {/* Manual priority preemption trigger */}
                      {!item.blocked && !item.priority.includes('CRITICAL') && (
                        <button
                          type="button"
                          onClick={() => handleElevateQueueItem(item.id)}
                          className="text-[8px] px-2 py-0.5 bg-neutral-950 text-amber-500 hover:text-white border border-amber-500/20 hover:bg-amber-500/10 rounded-full transition-all cursor-pointer font-bold uppercase tracking-wider font-mono self-center shrink-0"
                        >
                          ⚡ Preempt / Elevate
                        </button>
                      )}
                    </div>

                    {/* Progress slider bar inside queue */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-neutral-950 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${
                            item.blocked
                              ? 'bg-red-500 animate-pulse'
                              : item.priority.includes('CRITICAL')
                              ? 'bg-[#10b981]'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-neutral-400 shrink-0">
                        {item.blocked ? 'BLOCKED' : `${item.progress}%`}
                      </span>
                    </div>
                  </div>
                ))}

                {/* If user order is active and preparing, display it in the visible stream too! */}
                {activeOrder && activeOrder.status === 'preparing' && !deadlockActive && (
                  <div className="p-2.5 rounded-xl border border-amber-500/25 bg-[#201309] animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-amber-300">⭐ {activeOrder.items[0]?.menuItem?.name || 'My Selection'}</span>
                          <span className="text-[7px] font-mono font-bold bg-amber-400 text-neutral-950 px-1 py-0.2 rounded uppercase animate-ping">YOURS</span>
                        </div>
                        <p className="text-[8px] font-mono text-amber-300/70">
                          Order #{activeOrder.id} • Undergoing deep-fry & assembly seasoning
                        </p>
                      </div>
                      <span className="text-[8px] font-mono font-bold text-amber-400">Cooking</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM DEADLOCK ENGINE PLATFORM */}
          {opsTab === 'deadlock' && (
            <div className="space-y-4 animate-fade-in select-none">
              
              {/* DEFAULT STATE: Optimal Operational flow */}
              {!deadlockActive && !deadlockResolved && (
                <div className="space-y-3.5 text-center py-2 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 text-sm">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-neutral-200">No Kitchen Deadlocks Present</h4>
                    <p className="text-[10px] text-neutral-500 max-w-[280px] mx-auto leading-normal">
                      The restaurant wait-for resource allocation graph is acyclic. However, hot rush hours might block shared burners!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={triggerDeadlockSim}
                    className="h-8.5 px-4 bg-red-600/15 hover:bg-red-600 border border-red-500/30 hover:border-red-500 text-red-200 py-1 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-150 cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-950/20"
                  >
                    <Flame size={12} className="animate-pulse" />
                    Simulate Grid Deadlock
                  </button>
                </div>
              )}

              {/* DEADLOCK DETECTED! CRITICAL CIRCULAR WAIT ALERT */}
              {deadlockActive && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 p-2.5 rounded-xl">
                    <ShieldAlert size={14} className="text-red-400 animate-bounce shrink-0" />
                    <div className="text-[9px] leading-relaxed text-red-200">
                      <span className="font-bold">MUTUAL CIRCULAR WAIT LOCKOUT DETECTED!</span> Sibusiso holds Fryer (waiting for Grill), Lerato holds Grill (waiting for Fryer). Standard priority timers are frozen.
                    </div>
                  </div>

                  {/* Visual allocation deadlock dependency cycle widget */}
                  <div className="flex justify-around items-center py-2 bg-[#0c0503] border border-white/5 rounded-xl relative overflow-hidden">
                    <div className="text-center space-y-1 z-10 w-28">
                      <span className="text-[8px] font-mono text-neutral-400 block font-bold">Process #4102</span>
                      <span className="text-[9px] font-bold text-white block bg-neutral-950 px-1.5 py-1 rounded border border-white/5 line-clamp-1">Sibusiso Mutton</span>
                      <span className="text-[8px] font-mono font-bold text-red-400 block">Holds: Fryer 🔒</span>
                    </div>

                    {/* Circular arrows loop */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-14 h-14 border-2 border-dashed border-red-500 rounded-full animate-spin-slow opacity-40" />
                      <div className="absolute text-[8px] font-black text-red-400 uppercase bg-[#0c0503] px-1 font-mono tracking-widest glow-red-soft">
                        CYCLE WAITING
                      </div>
                    </div>

                    <div className="text-center space-y-1 z-10 w-28">
                      <span className="text-[8px] font-mono text-neutral-400 block font-bold">Process #9055</span>
                      <span className="text-[9px] font-bold text-white block bg-neutral-950 px-1.5 py-1 rounded border border-white/5 line-clamp-1">Lerato Vetkoek</span>
                      <span className="text-[8px] font-mono font-bold text-red-400 block">Holds: Grill 🔒</span>
                    </div>
                  </div>

                  {/* Solver selection tool */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] text-neutral-500 font-mono tracking-wider block font-bold uppercase">
                      SELECT DISTRIBUTED SOLVER STRATEGY:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSolver('preempt')}
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedSolver === 'preempt'
                            ? 'border-amber-500 bg-[#2c1a11]'
                            : 'border-white/5 bg-neutral-950/40'
                        }`}
                      >
                        <span className="text-[9px] font-black block text-amber-300">A. Preemption</span>
                        <span className="text-[7px] text-neutral-450 block font-bold mt-0.5 mt-0.5 leading-snug">Temporarily swap lock to break chain</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSolver('abort')}
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedSolver === 'abort'
                            ? 'border-amber-500 bg-[#2c1a11]'
                            : 'border-white/5 bg-neutral-950/40'
                        }`}
                      >
                        <span className="text-[9px] font-black block text-amber-300">B. Rollback Abort</span>
                        <span className="text-[7px] text-neutral-450 block font-bold mt-0.5 leading-snug">Kill Lerato order, restart on buffer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSolver('additional')}
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedSolver === 'additional'
                            ? 'border-amber-500 bg-[#2c1a11]'
                            : 'border-white/5 bg-neutral-950/40'
                        }`}
                      >
                        <span className="text-[9px] font-black block text-amber-300">C. Prevention</span>
                        <span className="text-[7px] text-neutral-450 block font-bold mt-0.5 leading-snug">Allocate backup auxiliary pantry hardware</span>
                      </button>
                    </div>
                  </div>

                  {/* Executable Solver Button */}
                  <button
                    type="button"
                    disabled={isResolving}
                    onClick={() => solveDeadlockSim(selectedSolver)}
                    className="w-full h-9 bg-gradient-to-r from-red-500 to-amber-500 text-neutral-950 font-black uppercase text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-1.5 transform active:scale-98 transition-all hover:opacity-95 cursor-pointer disabled:opacity-50"
                  >
                    <Cpu size={12} className={isResolving ? 'animate-spin' : ''} />
                    {isResolving ? 'De-allocating Cycle Loops...' : 'Execute Deadlock Resolution Heuristic'}
                  </button>

                  {/* Live terminal feedback monitor logs */}
                  {resolutionLogs.length > 0 && (
                    <div className="bg-black/80 rounded-xl p-2.5 border border-white/5 font-mono text-[7px] text-neutral-400 space-y-1 max-h-[80px] overflow-y-auto">
                      {resolutionLogs.map((log, i) => (
                        <div key={i} className={log.includes('SUCCESS') || log.includes('broken') ? 'text-emerald-400' : log.includes('ALERT') ? 'text-red-400 animate-pulse' : ''}>
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* RESOLVED CELEBRATION */}
              {deadlockResolved && !deadlockActive && (
                <div className="space-y-3.5 text-center py-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/15 animate-fade-in">
                  <div className="w-11 h-11 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-[#080503] font-mono text-base font-black glow-emerald-soft">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-emerald-400 glow-emerald-soft">Mutual Dependency Cycled Resolved!</h4>
                    <p className="text-[9px] text-neutral-400 leading-relaxed max-w-[310px] mx-auto">
                      You applied <span className="text-amber-400 font-bold whitespace-nowrap">Strategy {selectedSolver === 'preempt' ? 'A (Resource Preemption)' : selectedSolver === 'abort' ? 'B (Process Abort & Rollback)' : 'C (Resource Allocation Prevention)'}</span>. Capacity released, deliveries resumed, and we have loaded <span className="text-amber-400 font-bold">25 complimentary Lekker Coins</span> to Nkululeko's wallet balance!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDeadlockResolved(false);
                      setResolutionLogs([]);
                    }}
                    className="h-7 text-[8px] px-3 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg font-mono tracking-wider font-bold cursor-pointer text-neutral-400 uppercase"
                  >
                    Dismiss Console Notification
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOMER COMPLAINTS & RETURNS PORTAL */}
          {opsTab === 'returns' && (
            <div className="space-y-4 animate-fade-in select-none">
              
              <div className="flex justify-between items-center text-xs">
                <div>
                  <h4 className="text-xs font-black text-neutral-200">Mzansi Returns & Claims</h4>
                  <p className="text-[9px] text-neutral-500">File standard customer complaints to initiate refunds or re-cook priority sweeps</p>
                </div>
                <Ticket size={16} className="text-amber-500" />
              </div>

              {/* Complaints Input Form */}
              <form onSubmit={handleSubmitComplaint} className="space-y-3.5 bg-neutral-950/40 p-3 rounded-xl border border-white/5">
                
                {/* Select Order Input */}
                <div className="space-y-1">
                  <label className="text-[8px] font-mono font-bold text-neutral-500 uppercase block">
                    Choose Order Ticket:
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full text-[10px] p-2 bg-[#0c0705] border border-white/5 text-neutral-200 rounded-lg outline-none cursor-pointer focus:border-amber-500/30"
                  >
                    {complaintOrdersList.length === 0 ? (
                      <option value="">No completed orders available</option>
                    ) : (
                      complaintOrdersList.map((ord) => (
                        <option key={ord.id} value={ord.id}>
                          Order #{ord.id} ({ord.timestamp || 'Today'}) • Total ZAR {ord.total?.toFixed(2)}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Complaint Category and Reason Details */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono font-bold text-neutral-500 uppercase block">
                      Dispute Reason:
                    </label>
                    <select
                      value={complaintReason}
                      onChange={(e) => setComplaintReason(e.target.value)}
                      className="w-full text-[9px] p-1.5 bg-[#0c0705] border border-white/5 text-neutral-200 rounded-lg outline-none cursor-pointer focus:border-amber-500/30 font-bold"
                    >
                      <option value="spicy">🌶️ Spice too Lethal</option>
                      <option value="cold">❄️ Arrived too Cold</option>
                      <option value="missing">🥓 Missing Toppings</option>
                      <option value="deadlock">⏳ Deadlock Delay Latency</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-mono font-bold text-neutral-500 uppercase block">
                      Compensation Claim:
                    </label>
                    <select
                      value={complaintOutcome}
                      onChange={(e) => setComplaintOutcome(e.target.value)}
                      className="w-full text-[9px] p-1.5 bg-[#0c0705] border border-white/5 text-neutral-200 rounded-lg outline-none cursor-pointer focus:border-amber-500/30 font-bold"
                    >
                      <option value="recook">🔄 Priority Re-Cook (Preempt)</option>
                      <option value="points">🪙 150 Coins Refund</option>
                      <option value="voucher">🥡 Free Vetkoek Apricot</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={complaintOrdersList.length === 0}
                  className="w-full h-8 zest-gradient-bg text-neutral-950 font-black text-[9px] tracking-widest uppercase rounded-lg transform active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  Submit Complaint Ticket & File Return
                </button>
              </form>

              {/* Dynamic Tickets history listing */}
              <div className="space-y-2">
                <span className="text-[8px] text-neutral-500 font-mono tracking-wider block font-bold uppercase">
                  COMPLAINTS HISTORY & RESOLUTION STATUS:
                </span>

                <div className="space-y-1.5">
                  {complaintTickets.map((t, index) => (
                    <div
                      key={index}
                      className="p-2.5 rounded-xl bg-[#0c0705] border border-white/5 space-y-1"
                    >
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="font-mono text-amber-400 font-bold">Ticket Key: #{t.ticketId}</span>
                        <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[7px] uppercase ${
                          t.status === 'Approved & Resolved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-extrabold text-neutral-200">
                          {t.dishName}
                        </p>
                        <p className="text-[8px] text-neutral-500">
                          Disputed Reason: <span className="text-neutral-400">{t.reason}</span>
                        </p>
                        <p className="text-[8px] text-neutral-500">
                          Compensation Allocated: <span className="text-emerald-400 font-bold">{t.outcomeType}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GORGEOUS POST-DELIVERY FEEDBACK DIALOG MODAL OVERLAY */}
      {feedbackModalOpen && activeOrder && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0d0806] border border-orange-500/25 p-5 space-y-4 shadow-2xl relative animate-scale-up">
            
            {/* Header section */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto text-xl shadow-lg shadow-orange-500/10">
                ⭐
              </div>
              <h3 className="text-base font-black text-white tracking-tight mt-2">Rate Your Lekker Feast!</h3>
              <p className="text-[10.5px] text-neutral-450">
                Order <span className="text-amber-400 font-bold">#{activeOrder.id}</span> • Delivery complete to {activeOrder.address ? activeOrder.address.split(',')[0] : 'your CBD location'}
              </p>
            </div>

            {/* STAR RATING PICKER */}
            <div className="space-y-1 bg-neutral-950/40 p-3 rounded-2xl border border-white/5 text-center">
              <span className="text-[8.5px] font-mono font-bold text-neutral-400 uppercase tracking-widest block leading-none mb-1">
                Gauteng Chef Rating Scale
              </span>
              <div className="flex justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFeedbackRating(val)}
                    className="focus:outline-none transition-transform active:scale-90 hover:scale-115"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className={`w-7 h-7 ${
                        val <= feedbackRating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]'
                          : 'fill-transparent text-neutral-750'
                      }`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499c.151-.302.502-.302.653 0l2.382 4.764 5.25.763c.334.049.467.458.225.698l-3.8 3.7c.091.527.391 2.274-.153 2.766-.543.491-2.115-.558-2.585-.826a.653.653 0 00-.653 0c-.47.268-2.042 1.317-2.585.826-.544-.492-.244-2.239-.153-2.765l-3.8-3.7c-.242-.24-.109-.649.225-.698l5.25-.764 2.382-4.764z"
                      />
                    </svg>
                  </button>
                ))}
              </div>
              <span className="text-[9px] font-semibold text-amber-500 tracking-wide font-mono block">
                {feedbackRating === 5 ? '🔥 SPECTACULAR / ULTIMATE LEKKER!' :
                 feedbackRating === 4 ? '🍲 TRADITIONAL & DELICIOUS!' :
                 feedbackRating === 3 ? '👌 STABLE / ALRIGHT' :
                 feedbackRating === 2 ? '❄️ DISAPPOINTING EXPERIENCES' :
                 '❌ UNACCEPTABLE / GRIEVANCE FILED'}
              </span>
            </div>

            {/* DISPUTE REPORTING ISSUES SECTION */}
            <div className="space-y-1.5 bg-neutral-950/40 p-3 rounded-2xl border border-white/5">
              <span className="text-[8.5px] font-mono font-bold text-neutral-400 uppercase tracking-widest block leading-none">
                Report Specific Food Issues (Optional)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setFeedbackIssueKey(feedbackIssueKey === 'cold' ? null : 'cold')}
                  className={`p-2 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                    feedbackIssueKey === 'cold'
                      ? 'border-cyan-500/55 bg-cyan-950/35 text-cyan-300'
                      : 'border-white/5 bg-neutral-950/65 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-bold block">Arrived Cold ❄️</span>
                  <span className="text-[7.5px] opacity-60 leading-tight">Grievance fallback refund</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackIssueKey(feedbackIssueKey === 'missing' ? null : 'missing')}
                  className={`p-2 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                    feedbackIssueKey === 'missing'
                      ? 'border-amber-500/55 bg-[#2c1a11] text-amber-300'
                      : 'border-white/5 bg-neutral-950/65 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-bold block">Missing Item 🥓</span>
                  <span className="text-[7.5px] opacity-60 leading-tight">Missing pack toppings</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackIssueKey(feedbackIssueKey === 'spicy' ? null : 'spicy')}
                  className={`p-2 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                    feedbackIssueKey === 'spicy'
                      ? 'border-red-500/55 bg-red-950/35 text-red-300'
                      : 'border-white/5 bg-neutral-950/65 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-bold block">Too Spicy 🌶️</span>
                  <span className="text-[7.5px] opacity-60 leading-tight">Extremely hot chillies</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackIssueKey(feedbackIssueKey === 'deadlock' ? null : 'deadlock')}
                  className={`p-2 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                    feedbackIssueKey === 'deadlock'
                      ? 'border-yellow-500/55 bg-yellow-950/35 text-yellow-300'
                      : 'border-white/5 bg-neutral-950/65 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-bold block">Kitchen Delay ⏳</span>
                  <span className="text-[7.5px] opacity-60 leading-tight">Resource lockout delay</span>
                </button>
              </div>
            </div>

            {/* DYNAMIC RESOLUTION PREVIEW FOR TRIGGERING TICKET SYSTEM */}
            {feedbackIssueKey && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1 animate-fade-in text-[10.5px]">
                <div className="flex gap-1.5 items-center">
                  <span className="text-emerald-400 font-extrabold uppercase text-[7.5px] font-mono tracking-wider bg-emerald-500/10 border border-emerald-500/30 px-1 rounded">
                    TICKETING RESOLUTOR SYNC
                  </span>
                  <span className="text-white font-extrabold">Compensation Plan</span>
                </div>
                <p className="text-[9px] text-neutral-350 leading-relaxed mb-1">
                  Selecting this issue triggers executive staff dispatch instantly. Pick your refund compensation:
                </p>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setFeedbackCompensation('points')}
                    className={`py-1 text-center font-bold text-[8.5px] rounded-lg transition-all ${
                      feedbackCompensation === 'points'
                        ? 'bg-emerald-500 text-neutral-950 font-black'
                        : 'bg-neutral-950/80 text-neutral-400 hover:text-neutral-200 border border-white/5'
                    }`}
                  >
                    🪙 R150 Coins
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackCompensation('recook')}
                    className={`py-1 text-center font-bold text-[8.5px] rounded-lg transition-all ${
                      feedbackCompensation === 'recook'
                        ? 'bg-emerald-500 text-neutral-950 font-black'
                        : 'bg-neutral-950/80 text-neutral-400 hover:text-neutral-200 border border-white/5'
                    }`}
                  >
                    🔄 Re-Cook
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackCompensation('voucher')}
                    className={`py-1 text-center font-bold text-[8.5px] rounded-lg transition-all ${
                      feedbackCompensation === 'voucher'
                        ? 'bg-emerald-500 text-[#0d0806] font-black'
                        : 'bg-neutral-950/80 text-neutral-400 hover:text-neutral-200 border border-white/5'
                    }`}
                  >
                    🥡 Free Vetkoek
                  </button>
                </div>
              </div>
            )}

            {/* COMMENT INPUT TEXT BOX */}
            <div className="space-y-1">
              <span className="text-[8.5px] font-mono font-bold text-neutral-400 uppercase tracking-widest block leading-none">
                Experience Comments (Optional)
              </span>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Share any special compliments, notes or rider reviews..."
                className="w-full h-11 p-2 bg-neutral-950/65 border border-white/5 rounded-xl text-[9.5px] text-neutral-200 outline-none placeholder-neutral-700 focus:border-orange-500/30 font-semibold"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setFeedbackModalOpen(false);
                  // Mark as completed anyway to avoid nagging, but don't submit complaints
                  const updated = [...feedbackCompletedFor, activeOrder.id];
                  setFeedbackCompletedFor(updated);
                  localStorage.setItem('lekker_feedback_completed_orders', JSON.stringify(updated));
                }}
                className="flex-1 h-8 rounded-xl bg-neutral-950 border border-white/5 text-[9px] font-mono tracking-wider font-extrabold uppercase hover:bg-neutral-900 text-neutral-400 cursor-pointer"
              >
                Skip ✖
              </button>
              <button
                type="button"
                onClick={() => {
                  // Determine the reason and compensation keys
                  const resolvedReason = feedbackIssueKey || 'none';
                  const resolvedComp = feedbackIssueKey ? feedbackCompensation : 'none';
                  
                  // Trigger existing complaint ticketing logic with coreCreateComplaint!
                  coreCreateComplaint(activeOrder.id, resolvedReason, resolvedComp, feedbackComment, feedbackRating);
                  
                  // Add activeOrder.id to completed feedback list
                  const updatedCompleted = [...feedbackCompletedFor, activeOrder.id];
                  setFeedbackCompletedFor(updatedCompleted);
                  localStorage.setItem('lekker_feedback_completed_orders', JSON.stringify(updatedCompleted));
                  
                  // Close modal
                  setFeedbackModalOpen(false);
                  
                  // Reset state
                  setFeedbackRating(5);
                  setFeedbackIssueKey(null);
                  setFeedbackComment('');
                }}
                className="flex-1 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-mono font-black text-[9px] tracking-widest uppercase cursor-pointer text-center"
              >
                Submit Review ✓
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
