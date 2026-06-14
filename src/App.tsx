import React, { useState, useEffect } from 'react';
import PhoneFrame from './components/PhoneFrame';
import HomeView from './components/HomeView';
import MenuView from './components/MenuView';
import LoyaltyView from './components/LoyaltyView';
import CartView from './components/CartView';
import OrderTrackerView from './components/OrderTrackerView';
import ChatbotView from './components/ChatbotView';
import FoodDetailModal from './components/FoodDetailModal';
import ExecutiveDashboardView from './components/ExecutiveDashboardView';
import CustomerAuthView from './components/CustomerAuthView';
import SplashView from './components/SplashView';
import ReceiptView from './components/ReceiptView';
import QRScannerView from './components/QRScannerView';
import SettingsView from './components/SettingsView';
import { Lock, FileText, AlertCircle, Sparkles, QrCode } from 'lucide-react';

import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

import { MenuItem, CartItem, Order, LoyaltyRewards, RewardItem, OrderStatus } from './types';
import { MENU_ITEMS } from './data/menu';

export default function App() {
  // Live Menu Items state with localStorage support for robust persistence
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('durban_menu_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure new items are imported if they are not in the parsed list
        const missing = MENU_ITEMS.filter(item => !parsed.some((p: any) => p.id === item.id));
        if (missing.length > 0) {
          return [...parsed, ...missing];
        }
        return parsed;
      } catch (e) {
        return MENU_ITEMS;
      }
    }
    return MENU_ITEMS;
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem('durban_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  // Navigation states
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'cart' | 'loyalty' | 'tracking' | 'chatbot' | 'settings'>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('lekker_theme') as 'light' | 'dark') || 'dark';
  });
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Custom search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // User profiles & Mobile-First session state
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('lekker_authenticated') === 'true';
  });
  const [userRole, setUserRole] = useState<'customer' | 'admin'>(() => {
    return (localStorage.getItem('lekker_role') as 'customer' | 'admin') || 'customer';
  });
  
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('lekker_username') || 'Nkululeko';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('lekker_email') || 'nkululekofreed11@gmail.com';
  });
  const [userPhone, setUserPhone] = useState<string>(() => {
    return localStorage.getItem('lekker_phone') || '082 555 4921';
  });
  const [deliveryAddress, setDeliveryAddress] = useState<string>(() => {
    return localStorage.getItem('lekker_address') || '185 Francis Baard St, Pretoria CBD, Gauteng';
  });
  
  const [paymentPreference, setPaymentPreference] = useState<'card' | 'wallet' | 'points'>(() => {
    return (localStorage.getItem('lekker_payment_pref') as 'card' | 'wallet' | 'points') || 'card';
  });

  const [tableNumber, setTableNumber] = useState<string>('Table 4');

  // Gated PIN Overlay for isolation of the Admin system
  const [showAdminPinModal, setShowAdminPinModal] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [adminPinError, setAdminPinError] = useState<string>('');

  // Branded Initial Landing Splash Screen State representation
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Floating Interactive Queue QR code scanner modal state
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);

  // Active floating transactional digital receipt
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  
  // Selected single menu item for custom toppings modal layout
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  // Core baskets & history states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    const lambBunny = MENU_ITEMS.find(item => item.id === 'bunny-lamb');
    const curriedVetkoek = MENU_ITEMS.find(item => item.id === 'vetkoek-mince');
    const peachTea = MENU_ITEMS.find(item => item.id === 'bev-rooibos');
    const malvaPudding = MENU_ITEMS.find(item => item.id === 'dessert-malva');

    const defaultOrders: Order[] = [];

    if (lambBunny && peachTea) {
      defaultOrders.push({
        id: '4921',
        items: [
          {
            id: 'bunny-lamb-takeaway-atchar',
            menuItem: lambBunny,
            selectedToppings: [{ name: 'Spicy Mango Atchar', price: 10 }],
            quantity: 1,
            diningOption: 'takeaway',
            note: 'Extra spicy please!'
          },
          {
            id: 'bev-rooibos-takeaway',
            menuItem: peachTea,
            selectedToppings: [],
            quantity: 2,
            diningOption: 'takeaway'
          }
        ],
        subtotal: 120 + 28 * 2,
        deliveryFee: 0,
        pointsDiscount: 0,
        total: 176,
        pointsEarned: 35,
        status: 'delivered',
        diningOption: 'takeaway',
        address: '185 Francis Baard St, Pretoria CBD, Gauteng',
        paymentMethod: 'card',
        paymentGateway: 'Yoco',
        timestamp: 'Yesterday, 19:42',
        estimatedArrival: 'Delivered'
      });
    }

    if (curriedVetkoek && malvaPudding) {
      defaultOrders.push({
        id: '3810',
        items: [
          {
            id: 'vetkoek-mince-takeaway',
            menuItem: curriedVetkoek,
            selectedToppings: [{ name: 'Melted Cheddar Cheese', price: 12 }],
            quantity: 2,
            diningOption: 'takeaway'
          },
          {
            id: 'dessert-malva-takeaway',
            menuItem: malvaPudding,
            selectedToppings: [],
            quantity: 1,
            diningOption: 'takeaway'
          }
        ],
        subtotal: (55 + 12) * 2 + 48,
        deliveryFee: 35,
        pointsDiscount: 10,
        total: 207,
        pointsEarned: 36,
        status: 'delivered',
        diningOption: 'takeaway',
        address: '88 Commissioner St, Johannesburg CBD, Gauteng',
        paymentMethod: 'wallet',
        timestamp: 'May 23, 13:15',
        estimatedArrival: 'Delivered'
      });
    }

    return defaultOrders;
  });
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Dynamic loyalty score simulator engine
  const [loyalty, setLoyalty] = useState<LoyaltyRewards>({
    pointsBalance: 460, // Loaded at Silver level so user starts with ample Points!
    lifetimePoints: 1250,
    tier: 'Silver Feast',
    nextTierPointsNeeded: 240, // 300 to Gold at 700 milestone points
    progressPercentage: 65,
    xpPoints: 3450,
    xpLevel: 2,
    unlockedCoupons: ['QUEUESKIP', 'LEKKER50']
  });

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            setUserName(data.name || 'Nkululeko');
            setUserEmail(data.email || user.email || 'nkululekofreed11@gmail.com');
            setUserPhone(data.phone || '082 555 4921');
            setDeliveryAddress(data.address || '185 Francis Baard St, Pretoria CBD, Gauteng');
            const role = data.role || ((user.email === 'admin@lekker.cbd' || user.email === 'admin@gmail.com') ? 'admin' : 'customer');
            setUserRole(role);
            setIsAdminMode(role === 'admin');
            setIsCustomerAuthenticated(true);

            localStorage.setItem('lekker_authenticated', 'true');
            localStorage.setItem('lekker_role', role);
            localStorage.setItem('lekker_username', data.name || 'Nkululeko');
            localStorage.setItem('lekker_email', data.email || user.email || '');
            localStorage.setItem('lekker_phone', data.phone || '');
            localStorage.setItem('lekker_address', data.address || '');

            if (data.pointsBalance !== undefined) {
              setLoyalty((prev) => ({
                ...prev,
                pointsBalance: data.pointsBalance,
              }));
            }
          } else {
            const tempRegName = localStorage.getItem('lekker_temp_reg_name') || user.displayName || 'Nkululeko';
            const tempRegAddress = localStorage.getItem('lekker_temp_reg_address') || '185 Francis Baard St, Pretoria CBD, Gauteng';
            const tempRegPhone = localStorage.getItem('lekker_temp_reg_phone') || user.phoneNumber || '082 555 4921';
            const role = (user.email === 'admin@lekker.cbd' || user.email === 'admin@gmail.com') ? 'admin' : 'customer';

            const newProfile = {
              userId: user.uid,
              name: tempRegName,
              email: user.email || (tempRegName.toLowerCase().replace(/\s+/g, '') + '@gmail.com'),
              phone: tempRegPhone,
              address: tempRegAddress,
              role: role,
              pointsBalance: 460,
              createdAt: new Date().toISOString()
            };

            await setDoc(userDocRef, newProfile);

            setUserName(newProfile.name);
            setUserEmail(newProfile.email);
            setUserPhone(newProfile.phone);
            setDeliveryAddress(newProfile.address);
            setUserRole(role);
            setIsAdminMode(role === 'admin');
            setIsCustomerAuthenticated(true);

            localStorage.setItem('lekker_authenticated', 'true');
            localStorage.setItem('lekker_role', role);
            localStorage.setItem('lekker_username', newProfile.name);
            localStorage.setItem('lekker_email', newProfile.email);
            localStorage.setItem('lekker_phone', newProfile.phone);
            localStorage.setItem('lekker_address', newProfile.address);
            
            setLoyalty((prev) => ({
              ...prev,
              pointsBalance: 460,
            }));
          }
        } catch (err) {
          console.error("Error loading user profile from Firestore: ", err);
        }
      } else {
        setIsCustomerAuthenticated(false);
        setUserRole('customer');
        setIsAdminMode(false);
        
        localStorage.removeItem('lekker_authenticated');
        localStorage.removeItem('lekker_role');
        localStorage.removeItem('lekker_username');
        localStorage.removeItem('lekker_email');
        localStorage.removeItem('lekker_phone');
        localStorage.removeItem('lekker_address');
        localStorage.removeItem('lekker_temp_reg_name');
        localStorage.removeItem('lekker_temp_reg_address');
        localStorage.removeItem('lekker_temp_reg_phone');
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync profile edits / loyalty point changes real-time in firestore
  useEffect(() => {
    if (!auth.currentUser) return;
    const syncProfileChanges = async () => {
      const userDocRef = doc(db, 'users', auth.currentUser!.uid);
      try {
        await setDoc(userDocRef, {
          userId: auth.currentUser!.uid,
          name: userName,
          email: userEmail,
          phone: userPhone,
          address: deliveryAddress,
          role: userRole,
          pointsBalance: loyalty.pointsBalance,
          createdAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error("Error syncing profile updates to Firestore:", err);
      }
    };
    const debouncer = setTimeout(syncProfileChanges, 800);
    return () => clearTimeout(debouncer);
  }, [userName, userEmail, userPhone, deliveryAddress, userRole, loyalty.pointsBalance]);

  // Recompute loyalty progress whenever pointsBalance changes
  useEffect(() => {
    let tier: 'Bronze Star' | 'Silver Feast' | 'Golden Chef' = 'Bronze Star';
    let nextTierPointsNeeded = 0;
    let progressPercentage = 0;

    if (loyalty.pointsBalance >= 700) {
      tier = 'Golden Chef';
      nextTierPointsNeeded = 0; // max tier achieved
      progressPercentage = 100;
    } else if (loyalty.pointsBalance >= 300) {
      tier = 'Silver Feast';
      nextTierPointsNeeded = 700 - loyalty.pointsBalance;
      progressPercentage = Math.round(((loyalty.pointsBalance - 300) / 400) * 100);
    } else {
      tier = 'Bronze Star';
      nextTierPointsNeeded = 300 - loyalty.pointsBalance;
      progressPercentage = Math.round((loyalty.pointsBalance / 300) * 100);
    }

    setLoyalty((prev) => ({
      ...prev,
      tier,
      nextTierPointsNeeded,
      progressPercentage,
    }));
  }, [loyalty.pointsBalance]);

  // Timed simulated tracker lifecycle watcher
  useEffect(() => {
    if (!activeOrder) return;

    let timer: NodeJS.Timeout;

    if (activeOrder.status === 'placed') {
      timer = setTimeout(() => {
        setActiveOrder((prev) => prev ? { ...prev, status: 'preparing' } : null);
      }, 9000); // 9 seconds to kitchen prep stage
    } else if (activeOrder.status === 'preparing') {
      timer = setTimeout(() => {
        setActiveOrder((prev) => prev ? { ...prev, status: 'on-the-way' } : null);
      }, 12000); // 12 seconds kitchen to biker transit stage
    } else if (activeOrder.status === 'on-the-way') {
      timer = setTimeout(() => {
        setActiveOrder((prev) => prev ? { ...prev, status: 'delivered' } : null);
        
        // Add final points reward to account when driver knocks!
        setLoyalty((prev) => {
          const addedVal = activeOrder.pointsEarned;
          return {
            ...prev,
            pointsBalance: prev.pointsBalance + addedVal,
            lifetimePoints: prev.lifetimePoints + addedVal,
          };
        });
      }, 15000); // 15 seconds transit to arrival house call
    }

    return () => clearTimeout(timer);
  }, [activeOrder?.status]);

  // Add Item to cart basket handler
  const handleAddToCart = (customItem: Omit<CartItem, 'id'>) => {
    // Generate unique index composite key for combinations
    const combinationKey = `${customItem.menuItem.id}-${customItem.diningOption}-${customItem.selectedToppings.map(t => t.name).sort().join(',')}`;

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(item => item.id === combinationKey);
      if (existingIdx > -1) {
        // Increment quantity value
        const updated = [...prevCart];
        updated[existingIdx].quantity += customItem.quantity;
        return updated;
      } else {
        // Append new item definition
        return [...prevCart, { ...customItem, id: combinationKey }];
      }
    });
  };

  // Modify quantity inside cart view
  const handleUpdateCartQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveCartItem(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  // Delete cart entry handler
  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Loyalty rewards claiming logic
  const handleRedeemReward = (reward: RewardItem) => {
    if (loyalty.pointsBalance < reward.pointsCost) return;

    // Deduct points cost
    setLoyalty((prev) => ({
      ...prev,
      pointsBalance: prev.pointsBalance - reward.pointsCost,
    }));

    // Find equivalent item structure
    let rewardItemMap: MenuItem | undefined;
    if (reward.id === 'reward-cream-soda') rewardItemMap = menuItems.find(m => m.id === 'bev-creamsoda');
    if (reward.id === 'reward-vetkoek-sweet') rewardItemMap = menuItems.find(m => m.id === 'vetkoek-sweet');
    if (reward.id === 'reward-lamb-bunny') rewardItemMap = menuItems.find(m => m.id === 'bunny-lamb');
    if (reward.id === 'reward-jozi-burger') rewardItemMap = menuItems.find(m => m.id === 'burger-jozi');

    if (rewardItemMap) {
      // Craft a R0 reward MenuItem duplicate to embed
      const freePrize: MenuItem = {
        ...rewardItemMap,
        price: 0.00, // free prize!
        name: `🎁 Free ${rewardItemMap.name}`,
      };

      // Push custom Cart item
      handleAddToCart({
        menuItem: freePrize,
        selectedToppings: [],
        quantity: 1,
        diningOption: 'dine-in',
        note: 'Loyalty Reward Voucher redeemed',
      });

      // Navigate to cart tab to review free items
      setActiveTab('cart');
    }
  };

  // Checkout process trigger
  const handleCheckout = (
    paymentMethod: 'card' | 'wallet' | 'points',
    pointsDiscount: number,
    gateway: 'Yoco' | 'PayFast',
    couponCode?: string,
    couponDiscount?: number
  ) => {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((acc, item) => {
      const toppingsSum = item.selectedToppings.reduce((tsum, t) => tsum + t.price, 0);
      return acc + (item.menuItem.price + toppingsSum) * item.quantity;
    }, 0);

    // Calculate dynamic delivery flat fee
    const isDeliveryFree = activeTab === 'cart' && (loyalty.tier === 'Silver Feast' || loyalty.tier === 'Golden Chef');
    const deliveryFee = (activeTab === 'cart' && tableNumber) ? 0 : isDeliveryFree ? 0 : 35.00;

    const actualCouponDiscount = couponDiscount || 0;
    const totalZar = Math.max(0, subtotal - pointsDiscount - actualCouponDiscount + deliveryFee);

    // 1 LC point per R5 spent (SA reward conversions)
    const pointsToEarn = Math.floor(subtotal / 5);

    // Calculate XP Points earned: R1 = 10 XP points, plus a 250 XP bonus for QR-scanning queue bypasses!
    const scannedViaQr = cart.some(item => item.note?.includes('Bypass'));
    const xpToEarn = Math.floor(subtotal * 10) + (scannedViaQr ? 250 : 0);

    // Update loyalty details with deductions, points balance, accrued XP, and new level thresholds
    setLoyalty((prev) => {
      const basePoints = prev.pointsBalance || 0;
      const finalPoints = Math.max(0, basePoints - pointsDiscount * 15); // Deduct spent points
      
      const currentXp = prev.xpPoints || 3450;
      const nextXp = currentXp + xpToEarn;

      // Level 1: Starter (0 - 999 XP)
      // Level 2: Gauteng Gourmet (1,000 - 4,999 XP)
      // Level 3: Pretoria Prince (5,000 - 9,999 XP)
      // Level 4: Lekker CBD Legend (10,000+ XP)
      let nextLevel = 1;
      if (nextXp >= 10000) {
        nextLevel = 4;
      } else if (nextXp >= 5000) {
        nextLevel = 3;
      } else if (nextXp >= 1000) {
        nextLevel = 2;
      }

      return {
        ...prev,
        pointsBalance: Math.max(0, prev.pointsBalance - pointsDiscount * 10),
        xpPoints: nextXp,
        xpLevel: nextLevel
      };
    });

    const orderId = Math.floor(1000 + Math.random() * 9000).toString();
    const newOrder: Order = {
      id: orderId,
      items: [...cart],
      subtotal,
      deliveryFee,
      pointsDiscount,
      couponCode,
      couponDiscount: actualCouponDiscount,
      total: totalZar,
      pointsEarned: pointsToEarn,
      status: 'placed',
      diningOption: tableNumber ? 'dine-in' : 'takeaway',
      address: deliveryAddress,
      tableNumber: tableNumber,
      paymentMethod,
      paymentGateway: gateway,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedArrival: '25 Mins',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrder(newOrder);

    // Wipe cart active list clean
    setCart([]);

    // Open Live Order GPS tracker screen!
    setActiveTab('tracking');

    // Automatically trigger visual digital receipt popup!
    setActiveReceiptOrder(newOrder);
  };

  // Count cart items quantity total helper
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <div id="app-root-container" className="min-h-screen w-full bg-[#080503]">
      <PhoneFrame
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
        hasActiveOrder={activeOrder !== null && activeOrder.status !== 'delivered'}
        isAdminMode={isAdminMode}
        isCustomerAuthenticated={isCustomerAuthenticated}
        showSplash={showSplash}
        theme={theme}
      >
        {showSplash ? (
          <SplashView onDismiss={() => setShowSplash(false)} />
        ) : isQrScannerOpen ? (
          <QRScannerView
            onClose={() => setIsQrScannerOpen(false)}
            menuItems={menuItems}
            cartCount={cartCount}
            onScanSuccess={(item, customNote, keepOpen) => {
              handleAddToCart({
                menuItem: item,
                selectedToppings: [],
                quantity: 1,
                diningOption: tableNumber ? 'dine-in' : 'takeaway',
                note: customNote || 'Scanned via In-Store Queuing Tag 📱'
              });
              if (!keepOpen) {
                setIsQrScannerOpen(false);
              }
            }}
          />
        ) : !isCustomerAuthenticated ? (
          <CustomerAuthView
            onAuthenticate={(user) => {
              setUserName(user.name);
              setUserEmail(user.email);
              setUserPhone(user.phone);
              setDeliveryAddress(user.address);
              setIsCustomerAuthenticated(true);
              setUserRole('customer');
              localStorage.setItem('lekker_authenticated', 'true');
              localStorage.setItem('lekker_role', 'customer');
              localStorage.setItem('lekker_username', user.name);
              localStorage.setItem('lekker_email', user.email);
              localStorage.setItem('lekker_phone', user.phone);
              localStorage.setItem('lekker_address', user.address);
            }}
            onAuthenticateAdmin={() => {
              setUserName('Staff Admin');
              setUserEmail('staff@lekkerbites.co.za');
              setUserPhone('082 555 9999');
              setIsCustomerAuthenticated(true);
              setUserRole('admin');
              setIsAdminMode(true);
              localStorage.setItem('lekker_authenticated', 'true');
              localStorage.setItem('lekker_role', 'admin');
              localStorage.setItem('lekker_username', 'Staff Admin');
              localStorage.setItem('lekker_email', 'staff@lekkerbites.co.za');
              localStorage.setItem('lekker_phone', '082 555 9999');
            }}
          />
        ) : isAdminMode ? (
          <ExecutiveDashboardView
            orders={orders}
            loyalty={loyalty}
            menuItems={menuItems}
            setMenuItems={setMenuItems}
            onClose={() => setIsAdminMode(false)}
            onIssueCompensation={(points) => {
              setLoyalty((prev) => ({
                ...prev,
                pointsBalance: prev.pointsBalance + points,
                lifetimePoints: prev.lifetimePoints + points,
              }));
            }}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                menuItems={menuItems}
                userName={userName}
                loyalty={loyalty}
                onSelectCategory={(category) => {
                  setSelectedCategory(category);
                  setActiveTab('menu');
                }}
                onSelectItem={(item) => setSelectedMenuItem(item)}
                onNavigateToTab={setActiveTab}
                diningOption={tableNumber ? 'dine-in' : 'takeaway'}
                setDiningOption={(opt) => {
                  if (opt === 'dine-in') {
                    if (!tableNumber) setTableNumber('Table 4');
                  } else {
                    setTableNumber('');
                  }
                }}
                tableNumber={tableNumber}
                setTableNumber={setTableNumber}
                deliveryAddress={deliveryAddress}
                setDeliveryAddress={setDeliveryAddress}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onToggleAdmin={() => {
                  if (userRole === 'admin') {
                    setIsAdminMode(true);
                  } else {
                    setShowAdminPinModal(true);
                    setAdminPinInput('');
                    setAdminPinError('');
                  }
                }}
                onOpenQrScanner={() => setIsQrScannerOpen(true)}
              />
            )}

            {activeTab === 'menu' && (
              <MenuView
                menuItems={menuItems}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onSelectItem={(item) => setSelectedMenuItem(item)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpenQrScanner={() => setIsQrScannerOpen(true)}
                onDirectScanAdd={(item) => {
                  handleAddToCart({
                    menuItem: item,
                    selectedToppings: [],
                    quantity: 1,
                    diningOption: tableNumber ? 'dine-in' : 'takeaway',
                    note: 'Direct Insta-Scan QR Tag 📱 (Bypass ⚡)'
                  });
                }}
              />
            )}

            {activeTab === 'cart' && (
              <CartView
                cart={cart}
                cartCount={cartCount}
                onUpdateCartQuantity={handleUpdateCartQuantity}
                onRemoveCartItem={handleRemoveCartItem}
                diningOption={tableNumber ? 'dine-in' : 'takeaway'}
                setDiningOption={(opt) => {
                  if (opt === 'dine-in') {
                    if (!tableNumber) setTableNumber('Table 4');
                  } else {
                    setTableNumber('');
                  }
                }}
                tableNumber={tableNumber}
                setTableNumber={setTableNumber}
                deliveryAddress={deliveryAddress}
                setDeliveryAddress={setDeliveryAddress}
                loyalty={loyalty}
                onCheckout={handleCheckout}
              />
            )}

            {activeTab === 'loyalty' && (
              <LoyaltyView
                loyalty={loyalty}
                onRedeemReward={handleRedeemReward}
                userName={userName}
                setUserName={setUserName}
                userEmail={userEmail}
                setUserEmail={setUserEmail}
                userPhone={userPhone}
                setUserPhone={setUserPhone}
                deliveryAddress={deliveryAddress}
                setDeliveryAddress={setDeliveryAddress}
                paymentPreference={paymentPreference}
                setPaymentPreference={setPaymentPreference}
                pastOrders={orders}
                onReorderItem={(item) => {
                  handleAddToCart({
                    menuItem: item.menuItem,
                    selectedToppings: item.selectedToppings,
                    quantity: item.quantity,
                    diningOption: item.diningOption,
                    note: item.note,
                  });
                }}
                onReorderWholeOrder={(order) => {
                  order.items.forEach((item) => {
                    handleAddToCart({
                      menuItem: item.menuItem,
                      selectedToppings: item.selectedToppings,
                      quantity: item.quantity,
                      diningOption: item.diningOption,
                      note: item.note,
                    });
                  });
                }}
                setActiveTab={setActiveTab}
                onSignOut={() => {
                  signOut(auth).catch((err) => console.error(err));
                }}
                onViewReceipt={(order) => {
                  setActiveReceiptOrder(order);
                }}
              />
            )}

            {activeTab === 'tracking' && (
              <OrderTrackerView
                activeOrder={activeOrder}
                orders={orders}
                setOrders={setOrders}
                setActiveOrder={setActiveOrder}
                loyalty={loyalty}
                setLoyalty={setLoyalty}
                handleAddToCart={handleAddToCart}
              />
            )}

            {activeTab === 'chatbot' && (
              <ChatbotView
                orders={orders}
                userName={userName}
                menuItems={menuItems}
                onNavigateToTab={setActiveTab}
                onSelectItem={(item) => setSelectedMenuItem(item)}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                onThemeChange={(newTheme) => setTheme(newTheme)}
              />
            )}

            {/* Immersive Floating QR Scanner shortcut button hovering right above the bottom nav bar */}
            {!isQrScannerOpen && (
              <button
                id="floating-qr-scan-shortcut"
                onClick={() => setIsQrScannerOpen(true)}
                title="Bypass cashier queue - Scan food tags"
                className="absolute bottom-[92px] right-4 w-12 h-12 bg-gradient-to-tr from-orange-600 to-amber-500 text-neutral-950 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/25 z-40 animate-pulse"
                style={{
                  boxShadow: '0 0 15px rgba(245, 158, 11, 0.4), 0 4px 12px rgba(0,0,0,0.45)'
                }}
              >
                <QrCode size={20} className="stroke-[2.5px]" />
              </button>
            )}
          </>
        )}
      </PhoneFrame>

      {/* Appetizing Custom toppings dialog overlay drawer sheet */}
      {selectedMenuItem && (
        <FoodDetailModal
          item={selectedMenuItem}
          onClose={() => setSelectedMenuItem(null)}
          onAddToCart={handleAddToCart}
          diningOption={tableNumber ? 'dine-in' : 'takeaway'}
        />
      )}

      {/* Administrative Lock Security PIN Overlay challenge dialog */}
      {showAdminPinModal && (
        <div id="admin-pin-dialog-backdrop" className="fixed inset-0 bg-[#070403]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in animate-duration-150 relative">
          <div id="admin-pin-surface" className="w-full max-w-xs bg-[#0c0705] border border-red-500/15 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden text-center text-white">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-655 via-amber-500 to-red-655 bg-red-700" />
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto text-red-500">
              <Lock size={20} className="animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest text-[#ef4444] uppercase font-mono block font-bold">STAFF AUTH SYSTEM</span>
              <h3 className="text-sm font-black uppercase text-white">Administrative Lock</h3>
              <p className="text-[9.5px] text-neutral-450 leading-normal max-w-[220px] mx-auto">
                Customer is fully isolated from administration systems. Enter secure override passcode to unlock diagnostic tools:
              </p>
            </div>

            {adminPinError && (
              <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-xl text-[9px] text-red-200 font-mono">
                {adminPinError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (adminPinInput === '1234' || adminPinInput.toLowerCase() === 'admin') {
                  setUserRole('admin');
                  localStorage.setItem('lekker_role', 'admin');
                  setIsAdminMode(true);
                  setShowAdminPinModal(false);
                } else {
                  setAdminPinError('ERROR: Invalid access level PIN. Type "1234" to pass.');
                }
              }}
              className="space-y-3"
            >
              <input
                type="password"
                required
                maxLength={8}
                placeholder="Enter Staff Passcode (1234)"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                className="w-full h-10 bg-neutral-950 border border-white/5 rounded-xl text-center font-mono font-black text-sm tracking-widest text-white outline-none focus:border-red-500/40"
              />

              <div className="grid grid-cols-2 gap-2 text-[9.5px] font-mono tracking-wider font-bold">
                <button
                  type="button"
                  onClick={() => setShowAdminPinModal(false)}
                  className="py-2.5 bg-neutral-900 border border-white/5 rounded-xl text-neutral-400 hover:text-white cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-red-700 hover:bg-red-600 rounded-xl text-white font-mono cursor-pointer"
                >
                  DE-ISOLATE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating digital transactional confirmation receipt slider */}
      {activeReceiptOrder && (
        <div id="receipt-slide-backdrop" className="fixed inset-0 bg-[#070403]/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in animate-duration-200">
          <div className="w-full max-w-sm">
            <ReceiptView
              order={activeReceiptOrder}
              onClose={() => setActiveReceiptOrder(null)}
              onReturnToHome={() => {
                setActiveReceiptOrder(null);
                setActiveTab('home');
              }}
              onReorderWholeOrder={(ord) => {
                ord.items.forEach((item) => {
                  handleAddToCart({
                    menuItem: item.menuItem,
                    selectedToppings: item.selectedToppings,
                    quantity: item.quantity,
                    diningOption: item.diningOption,
                    note: item.note,
                  });
                });
                setActiveReceiptOrder(null);
                setActiveTab('cart');
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
