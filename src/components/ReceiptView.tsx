import React, { useState } from 'react';
import { FileText, Printer, Check, Copy, ShoppingBag, MapPin, Award, ArrowRight, Share2, Download, Star, Sparkles, Home } from 'lucide-react';
import { Order, CartItem } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { motion } from 'motion/react';

interface ReceiptViewProps {
  order: Order;
  onClose?: () => void;
  onReturnToHome?: () => void;
  onReorderWholeOrder?: (order: Order) => void;
}

export default function ReceiptView({ order, onClose, onReturnToHome, onReorderWholeOrder }: ReceiptViewProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [printStep, setPrintStep] = useState<'idle' | 'humming' | 'feeding'>('idle');

  // Service feedback states
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  // Generate a mock unique reference string
  const paymentReference = order.id ? `REF-TXN-LEKKER-${order.id}A982` : `REF-TXN-LEKKER-DEFAULT77`;

  const copyRefCode = () => {
    navigator.clipboard.writeText(paymentReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitFeedback = async () => {
    if (feedbackRating === 0) return;
    setSubmittingFeedback(true);
    const feedbackId = `FB-${order.id || 'txn'}-${Date.now().toString().slice(-4)}`;
    try {
      const docRef = doc(db, 'feedback', feedbackId);
      const payload = {
        feedbackId: feedbackId,
        userId: auth.currentUser?.uid || 'anonymous',
        userName: localStorage.getItem('lekker_username') || auth.currentUser?.displayName || 'Customer',
        rating: Math.round(feedbackRating),
        comment: feedbackComment.trim(),
        transactionId: order.id || 'unknown',
        createdAt: new Date().toISOString()
      };
      await setDoc(docRef, payload);
      setFeedbackSubmitted(true);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `feedback/${feedbackId}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const triggerDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`📥 Receipt PDF successfully compiled for Order #${order.id}! Saved to your device's downloads.`);
    }, 1500);
  };

  const playPrinterAudioHum = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      // Read dynamic volume from settings registry
      const savedVol = localStorage.getItem('lekker_sound_volume');
      const volMultiplier = savedVol !== null ? parseInt(savedVol, 10) / 100 : 0.8;

      // Mechanical Carriage motor steady note
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, ctx.currentTime);

      // Low frequency modulator to produce standard rotational stutter/vibe
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      modulator.frequency.setValueAtTime(12, ctx.currentTime);
      modGain.gain.setValueAtTime(20, ctx.currentTime);

      modulator.connect(osc.frequency);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Volume envelop using dynamic multiplier
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.06 * volMultiplier, ctx.currentTime + 0.15);
      gainNode.gain.linearRampToValueAtTime(0.06 * volMultiplier, ctx.currentTime + 1.25);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.6);

      osc.start();
      modulator.start();

      setTimeout(() => {
        try {
          osc.stop();
          modulator.stop();
          ctx.close();
        } catch (err) {}
      }, 1600);
    } catch (e) {
      console.warn('Audio synthesis denied or unsupported:', e);
    }
  };

  const triggerPrintReceipt = () => {
    if (printStep !== 'idle') return;

    // Phase 1: Heavy printer humming vibration feedback + Audio whirring
    setPrintStep('humming');
    playPrinterAudioHum();

    // Phase 2: Feed out visual slide
    setTimeout(() => {
      setPrintStep('feeding');
    }, 700);

    // Phase 3: Launch OS print prompt & refresh back
    setTimeout(() => {
      const backupTitle = document.title;
      document.title = `LekkerBites_Receipt_Order_${order.id}`;
      window.print();
      document.title = backupTitle;
      setPrintStep('idle');
    }, 1750);
  };

  return (
    <div id="receipt-modal-overlay" className="bg-[#0c0705]/95 border border-amber-500/15 rounded-3xl p-5 space-y-4 max-w-sm mx-auto shadow-2xl relative overflow-hidden animate-fade-in font-mono text-xs text-white">
      {/* CSS injected variables for carriage vibration shake motion */}
      <style>{`
        @keyframes printVibrate {
          0% { transform: translate(0.5px, 0.5px) rotate(0deg); }
          20% { transform: translate(-0.5px, -1px) rotate(-0.5deg); }
          40% { transform: translate(-1.5px, 0px) rotate(0.5deg); }
          60% { transform: translate(0.5px, 1px) rotate(0deg); }
          80% { transform: translate(-0.5px, -0.5px) rotate(0.5deg); }
          100% { transform: translate(0.5px, -1px) rotate(-0.5deg); }
        }
        .machine-humming {
          animation: printVibrate 0.18s infinite;
        }
      `}</style>

      {/* Background paper roll decorative style */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600" />
      
      {feedbackSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-6 py-6 text-center select-none"
        >
          {/* Animated celebration icon */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            {/* Glowing rings */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-orange-500/5 rounded-full border border-amber-500/20"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut", delay: 0.4 }}
              className="absolute inset-3 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent rounded-full"
            />
            
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, delay: 0.15 }}
              className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center text-[#0c0705] shadow-xl shadow-orange-500/25 border border-amber-400/20"
            >
              <Check size={32} strokeWidth={3} className="text-[#0c0705]" />
            </motion.div>
          </div>

          <div className="space-y-2">
            <motion.h4
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-amber-400 font-extrabold tracking-widest text-[14px] uppercase font-mono flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} className="text-amber-500 animate-pulse" />
              FEEDBACK SUBMITTED!
              <Sparkles size={14} className="text-amber-500 animate-pulse" />
            </motion.h4>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-neutral-300 font-sans text-[11px] leading-relaxed max-w-[280px] mx-auto text-center"
            >
              Review logged successfully with rating <span className="text-amber-400 font-bold font-mono">{feedbackRating} ★</span> on our secure Firestore database! Thank you for helping us elevate Gauteng's premier bite flow.
            </motion.p>
          </div>

          {/* Gamification and Loyalty XP points accruals */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-[#070403] border border-amber-500/15 p-3.5 rounded-2xl space-y-2 text-left"
          >
            <span className="text-[8.5px] font-bold text-neutral-500 uppercase tracking-wider block font-mono">
              💎 REAL-TIME COGNITIVE EARNINGS
            </span>
            <div className="flex justify-between items-center text-[9px] font-mono font-bold">
              <span className="text-neutral-400">XP ACCRUED INCREMENT:</span>
              <span className="text-orange-400">+50 XP ACCRUED</span>
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono font-bold">
              <span className="text-neutral-400">LEKKER COIN MULTIPLIER:</span>
              <span className="text-emerald-500">+10 LC COINS</span>
            </div>
          </motion.div>

          {/* Interactive requested actions */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={triggerDownload}
              disabled={downloading}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-white/5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer text-amber-400 hover:text-white transition-all transform active:scale-95 disabled:opacity-55"
            >
              <Download size={13} className={downloading ? 'animate-spin' : ''} />
              {downloading ? 'Compiling Official Billing...' : 'Download Official Tax Receipt'}
            </button>

            <button
              onClick={() => {
                if (onReturnToHome) {
                  onReturnToHome();
                } else if (onClose) {
                  onClose();
                }
              }}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-[#0c0705] font-black tracking-widest text-[9.5px] uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/15 cursor-pointer hover:opacity-95 transform active:scale-98 transition-all"
            >
              <Home size={12} strokeWidth={2.5} />
              Confirm and Return to Home Page
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Top action bar */}
          <div className="flex justify-between items-center text-neutral-400 pb-2 border-b border-dashed border-white/10 select-none">
            <span className="text-[9px] uppercase tracking-widest font-black text-amber-500 flex items-center gap-1">
              <FileText size={11} /> TAX TRANSACTION RECEIPT
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 hover:border-white/20 text-neutral-300 font-bold hover:text-white cursor-pointer"
              >
                DISMISS ×
              </button>
            )}
          </div>

          {/* 🧾 Mechanical Printer Feed Slot Slit */}
          <div className="w-full h-3.5 bg-neutral-950 border border-zinc-800 rounded-lg flex items-center justify-center relative overflow-hidden p-[1px] shadow-inner select-none">
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-zinc-900 to-neutral-950 pointer-events-none" />
            <div className={`w-[96%] h-[2px] bg-orange-500/50 rounded-full blur-[1px] transition-all duration-300 ${printStep !== 'idle' ? 'opacity-100 shadow-[0_0_12px_#ea580c] bg-orange-400' : 'opacity-20'}`} />
          </div>

          {/* Main Ticket Area */}
          <div 
            className={`bg-white text-neutral-950 p-4 rounded-xl shadow-inner relative overflow-hidden space-y-4 transition-all duration-700 ease-out ${
              printStep === 'humming' ? 'machine-humming' : ''
            } ${
              printStep === 'feeding' 
                ? 'mt-3 border-t-4 border-amber-600/30 shadow-[0_15px_30px_rgba(245,158,11,0.15)] scale-[1.02]' 
                : 'mt-0 border-t-0'
            }`}
          >
            {/* Serrated edge indicators on receipt top & bottom */}
            <div className="absolute top-0 left-0 w-full flex justify-between pointer-events-none -translate-y-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i} className="w-2.5 h-2.5 bg-[#0c0705] rounded-full" />
              ))}
            </div>

            {/* Brand Banner */}
            <div className="text-center space-y-1 pt-1">
              <h3 className="text-sm font-black uppercase tracking-tight text-neutral-900 leading-none">
                LEKKER BITES GOURMET
              </h3>
              <p className="text-[8px] text-neutral-600">
                185 Francis Baard St, Pretoria CBD / 88 Commissioner St, Johannesburg CBD, Gauteng
              </p>
              <p className="text-[8px] text-neutral-500">
                Vat Reg No: 492108553
              </p>
              <div className="text-[9px] font-bold text-neutral-800 bg-neutral-100 py-1 px-2.5 rounded-md inline-block mt-1">
                TAX INVOICE / DUPLICATE
              </div>
            </div>

            {/* Metadata Details */}
            <div className="text-[9px] text-neutral-700 space-y-1 border-t border-b border-dashed border-neutral-300 py-2">
              <div className="flex justify-between">
                <span>ORDER NUMBER:</span>
                <span className="font-bold text-neutral-950">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>TIMESTAMP:</span>
                <span>{order.timestamp || 'Today, 09:13 AM'}</span>
              </div>
              <div className="flex justify-between">
                <span>PAYMENT METHOD:</span>
                <span className="uppercase">{order.paymentMethod} ({order.paymentGateway || 'Yoco'})</span>
              </div>
              <div className="flex justify-between items-center">
                <span>GP-REF CODE:</span>
                <button
                  type="button"
                  onClick={copyRefCode}
                  title="Copy Reference"
                  className="font-bold text-neutral-950 hover:underline flex items-center gap-1 leading-none shrink-0 cursor-pointer"
                >
                  {paymentReference.substring(0, 15)}... {copied ? <Check size={8} className="text-emerald-600" /> : <Copy size={8} />}
                </button>
              </div>
              <div className="flex justify-between">
                <span>DINING MODE:</span>
                <span className="font-bold uppercase text-neutral-950">{order.diningOption}</span>
              </div>
              {order.diningOption === 'dine-in' ? (
                <div className="flex justify-between">
                  <span>TABLE NUMBER:</span>
                  <span className="font-bold text-neutral-950">{order.tableNumber || 'Table 4'}</span>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5 pt-0.5 mt-0.5 border-t border-neutral-200">
                  <span className="text-[8px] text-neutral-500 uppercase leading-none">DELIVERY ADDRESS:</span>
                  <span className="font-bold text-neutral-950 leading-tight text-[8px] truncate">
                    {order.address || '185 Francis Baard St, Pretoria CBD, Gauteng'}
                  </span>
                </div>
              )}
            </div>

            {/* Itemized Loop List */}
            <div className="space-y-1.5 py-1">
              <span className="text-[8px] font-bold text-neutral-500 uppercase block mb-1">Items Summary Breakdown:</span>
              {order.items.map((item, idx) => {
                const toppingsSum = item.selectedToppings.reduce((sum, t) => sum + t.price, 0);
                const singleItemTotal = item.menuItem.price + toppingsSum;
                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-start text-xs font-bold text-neutral-900 leading-tight">
                      <span className="flex-1 pr-3">
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span className="font-mono text-neutral-950 text-right">
                        R {(singleItemTotal * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    {item.selectedToppings.length > 0 && (
                      <div className="text-[8px] text-neutral-600 pl-3 leading-none italic">
                        + Toppings: {item.selectedToppings.map(t => `${t.name} (R${t.price})`).join(', ')}
                      </div>
                    )}
                    {item.note && (
                      <div className="text-[8px] text-orange-700 pl-3 leading-none italic">
                        Request: "{item.note}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Numeric Calculations totals block */}
            <div className="border-t border-dashed border-neutral-300 pt-2 text-[10px] text-neutral-800 space-y-1 font-bold">
              <div className="flex justify-between font-normal text-neutral-600">
                <span>SUBTOTAL BRUT:</span>
                <span>R {order.subtotal?.toFixed(2)}</span>
              </div>
              {order.pointsDiscount > 0 && (
                <div className="flex justify-between font-normal text-amber-700">
                  <span>LEKKER COINS REDEMPTION DISCOUNT:</span>
                  <span>-R {order.pointsDiscount?.toFixed(2)}</span>
                </div>
              )}
              {order.couponDiscount && order.couponDiscount > 0 && (
                <div className="flex justify-between font-bold text-rose-700">
                  <span>PROMO COUPON DISCOUNT ({order.couponCode || 'PROMO'}):</span>
                  <span>-R {order.couponDiscount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-normal text-neutral-600">
                <span>DELIVERY & SERVICE FEE:</span>
                <span>{order.deliveryFee > 0 ? `R ${order.deliveryFee.toFixed(2)}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between text-xs font-black text-neutral-950 border-t border-neutral-200 pt-1.5 leading-none shadow-sm pb-1">
                <span>ZAR INVOICED RECAPTURE (VAT INCL.):</span>
                <span>R {order.total?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[7.5px] font-mono font-bold text-emerald-700 leading-none pt-1">
                <span>LEKKER COINS EARNED:</span>
                <span>+{order.pointsEarned} LC</span>
              </div>
              <div className="flex justify-between text-[7.5px] font-mono font-bold text-orange-700 leading-none pt-0.5">
                <span>XP POINTS ACCRUED:</span>
                <span>+{Math.floor(order.subtotal * 10) + (order.items.some(it => it.note?.includes('Bypass')) ? 250 : 0)} XP</span>
              </div>
            </div>

            {/* ⭐ Interactive Service Rating & Feedback Form */}
            <div className="border-t border-b border-dashed border-neutral-300 py-3 space-y-2 select-none">
              <span className="text-[8.5px] font-black text-neutral-500 uppercase block tracking-wider font-mono text-center">
                ⭐ RATE SERVICE & GAUTENG BITES ⭐
              </span>

              {feedbackSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-250/50 text-emerald-800 p-2.5 rounded-xl text-center space-y-1 animate-fade-in font-sans">
                  <span className="text-[10px] font-black block leading-none">❤️ Review Logged Successfully!</span>
                  <p className="text-[7.5px] text-emerald-600 leading-tight">
                    Stored securely on Firestore. Thank you for your feedback! It makes Lekker Bites much better.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 font-sans bg-amber-500/5 border border-dashed border-amber-500/15 p-2.5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-neutral-800 uppercase font-mono">Service Rating:</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const activeVal = feedbackHoverRating || feedbackRating;
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setFeedbackRating(star)}
                            onMouseEnter={() => setFeedbackHoverRating(star)}
                            onMouseLeave={() => setFeedbackHoverRating(0)}
                            className="text-amber-500 hover:scale-120 transition-transform shrink-0 cursor-pointer focus:outline-none"
                          >
                            <Star
                              size={14}
                              fill={star <= activeVal ? "#f59e0b" : "none"}
                              className="transition-colors"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-neutral-600 uppercase font-mono block">Write a short note (optional):</span>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      maxLength={100}
                      placeholder="Tell us about the delivery speeds, spicy lamb, etc..."
                      className="w-full h-11 bg-white border border-neutral-250 rounded-xl p-1.5 text-[8.5px] font-medium outline-none text-neutral-900 focus:border-amber-500 transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={submitFeedback}
                    disabled={submittingFeedback || feedbackRating === 0}
                    className={`w-full py-1.5 rounded-xl text-[8px] font-black uppercase text-center tracking-wider transition-all select-none ${
                      feedbackRating === 0
                        ? 'bg-neutral-100 text-neutral-450 border border-neutral-250 cursor-not-allowed'
                        : 'bg-[#a3532c] text-white hover:bg-[#853f1c] active:scale-97 cursor-pointer shadow-sm'
                    }`}
                  >
                    {submittingFeedback ? 'Submitting review...' : 'Submit Real-time Feedback'}
                  </button>
                </div>
              )}
            </div>

            {/* ASCII Barcode & Message */}
            <div className="text-center pt-2 space-y-1.5">
              {/* Simple Vector-like Barcode */}
              <div className="font-mono text-[9px] leading-none tracking-tighter text-neutral-700 font-bold">
                |||| ||| ||||| || |||| |||| ||||| ||| ||| |
              </div>
              <p className="text-[7.5px] text-neutral-500 font-sans tracking-wide leading-tight">
                Thank you for dining with Lekker Bites! Your purchase supports local Gauteng artisans, local riders and our sustainable food networks.
              </p>
            </div>

            {/* Serrated bottom edge decoration */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between pointer-events-none translate-y-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i} className="w-2.5 h-2.5 bg-[#0c0705] rounded-full" />
              ))}
            </div>
          </div>

          {/* Interactive Print & Download controls */}
          <div className="grid grid-cols-2 gap-2 text-[10px] select-none text-center">
            <button
              onClick={triggerPrintReceipt}
              className={`py-2.5 bg-neutral-900 border border-white/5 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all transform active:scale-95 ${
                printStep !== 'idle' ? 'text-orange-400 bg-neutral-950 font-black' : 'text-amber-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Printer size={12} className={printStep !== 'idle' ? 'animate-bounce' : ''} />
              {printStep === 'humming' && 'Humming... 🔊'}
              {printStep === 'feeding' && 'Feeding... 📜'}
              {printStep === 'idle' && 'Print Ticket'}
            </button>
            <button
              onClick={triggerDownload}
              disabled={downloading}
              className="py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-white/5 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer text-amber-400 hover:text-white transition-all transform active:scale-95 disabled:opacity-55"
            >
              <Download size={12} className={downloading ? 'animate-spin' : ''} />
              {downloading ? 'Compiling ID...' : 'Download PDF'}
            </button>
          </div>

          {/* Quick Re-order option directly from details page */}
          {onReorderWholeOrder && (
            <button
              onClick={() => {
                onReorderWholeOrder(order);
                alert(`🍱 Meal order #${order.id} items populated in your active shopping cart!`);
              }}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-[#0c0705] font-black tracking-wider text-[9px] uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 cursor-pointer hover:opacity-95 transform active:scale-98 transition-all"
            >
              <ShoppingBag size={11} /> Re-order Whole Meal Flow
            </button>
          )}
        </>
      )}
    </div>
  );
}
