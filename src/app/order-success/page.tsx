'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Copy, Check, Download, Loader2 } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const shortId = orderId.slice(-8).toUpperCase();

  const [copied, setCopied]         = useState(false);
  const [show, setShow]             = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(shortId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReceipt = async () => {
    setPdfLoading(true);
    try {
      // Dynamically import jsPDF so it doesn't bloat initial bundle
      const { jsPDF } = await import('jspdf');

      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

      const W = doc.internal.pageSize.getWidth();   // 210mm
      const margin = 24;
      const col = W - margin * 2;
      let y = 20;

      const date = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });

      // ── Helper functions ────────────────────────────────────────────
      const centerText = (text: string, yPos: number, size = 11) => {
        doc.setFontSize(size);
        doc.text(text, W / 2, yPos, { align: 'center' });
      };

      const dashedLine = (yPos: number) => {
        doc.setLineDashPattern([1.5, 1.5], 0);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, W - margin, yPos);
        doc.setLineDashPattern([], 0);
      };

      const solidLine = (yPos: number, color = [40, 36, 30]) => {
        doc.setDrawColor(...(color as [number, number, number]));
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, W - margin, yPos);
        doc.setLineWidth(0.2);
      };

      const row = (label: string, value: string, yPos: number) => {
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.setFont('helvetica', 'normal');
        doc.text(label, margin, yPos);
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'bold');
        doc.text(value, W - margin, yPos, { align: 'right' });
      };

      // ── BRAND HEADER ────────────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(45, 36, 30);
      centerText('SKINCARES.LK', y, 22);
      y += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      centerText('Premium Skincare  ·  Sri Lanka', y, 9);
      y += 10;

      solidLine(y);
      y += 10;

      // ── ORDER ID BOX ────────────────────────────────────────────────
      doc.setFillColor(245, 245, 242);
      doc.setDrawColor(220, 215, 210);
      doc.roundedRect(margin, y, col, 28, 3, 3, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      centerText('ORDER CONFIRMATION', y + 8, 8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(45, 36, 30);
      centerText(`#${shortId}`, y + 21, 24);
      y += 36;

      // ── STATUS BADGE ────────────────────────────────────────────────
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(margin, y, col, 12, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(21, 128, 61);
      centerText('ORDER CONFIRMED', y + 8, 10);
      y += 20;

      // ── ORDER META ──────────────────────────────────────────────────
      doc.setTextColor(80, 80, 80);
      row('Date', date, y);               y += 8;
      row('Payment Method', 'Cash on Delivery (COD)', y); y += 8;
      row('Payment Status', 'Pending — Pay on delivery', y); y += 6;

      dashedLine(y); y += 8;

      // ── PRICING ─────────────────────────────────────────────────────
      row('Shipping Fee', 'LKR 500.00', y); y += 8;

      dashedLine(y); y += 8;

      // Total row
      doc.setFontSize(13);
      doc.setTextColor(45, 36, 30);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount', margin, y);
      doc.text('Payable on delivery', W - margin, y, { align: 'right' });
      y += 14;

      solidLine(y); y += 12;

      // ── THANK YOU ───────────────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(45, 36, 30);
      centerText('Thank You for Your Order!', y, 14);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      centerText('We appreciate your trust in SKINCARES.LK', y, 9);
      y += 10;

      dashedLine(y); y += 10;

      // ── NEXT STEPS BOX ──────────────────────────────────────────────
      doc.setFillColor(250, 249, 246);
      doc.setDrawColor(230, 225, 220);
      doc.roundedRect(margin, y, col, 34, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(140, 130, 120);
      doc.text('WHAT HAPPENS NEXT', margin + 5, y + 8);

      const steps = [
        '1.  We\'ll carefully prepare and pack your items',
        '2.  Your order will be dispatched for delivery',
        '3.  Pay cash to the delivery rider upon arrival',
      ];
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(70, 60, 50);
      steps.forEach((step, i) => {
        doc.text(step, margin + 5, y + 16 + i * 7);
      });
      y += 44;

      dashedLine(y); y += 10;

      // ── FOOTER ──────────────────────────────────────────────────────
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      centerText('Track your order at  skincares.lk/track-order', y, 8);    y += 6;
      centerText('Questions? Visit  skincares.lk/contact', y, 8);           y += 6;
      centerText('This is your official order confirmation. Keep it safe.', y, 8);

      // ── SAVE ────────────────────────────────────────────────────────
      doc.save(`SKINCARES-Receipt-${shortId}.pdf`);

    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center px-5 py-20">

      {/* Card */}
      <div
        className={`
          bg-white rounded-3xl shadow-sm border border-stone-100 p-10 max-w-md w-full text-center
          transition-all duration-700 ease-out
          ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        `}
      >
        {/* Animated checkmark */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 bg-green-50 rounded-full animate-ping opacity-30" />
            <div className="relative w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 size={40} className="text-green-500" strokeWidth={1.8} />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-serif font-bold text-[#2D241E] mb-2">Order Confirmed!</h1>
        <p className="text-stone-500 text-sm mb-8">
          Thank you for your purchase. We'll start processing your order right away.
        </p>

        {/* Order ID box */}
        <div className="bg-stone-50 rounded-2xl px-6 py-5 mb-8">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Your Order ID</p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-2xl font-bold text-[#2D241E] tracking-wider">{shortId}</span>
            <button
              onClick={handleCopy}
              className="text-stone-400 hover:text-[#2D241E] transition-colors p-1.5 hover:bg-stone-100 rounded-lg"
              title="Copy order ID"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-[11px] text-stone-400 mt-2">Save this to track your order later</p>
        </div>

        {/* What's next */}
        <div className="text-left bg-[#2D241E]/3 rounded-2xl px-5 py-4 mb-8 space-y-2.5">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">What happens next</p>
          {[
            "We'll prepare and pack your items",
            'Your order will be dispatched soon',
            'Cash on delivery upon arrival',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-stone-600">
              <span className="w-5 h-5 rounded-full bg-[#2D241E] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link
            href="/track-order"
            className="w-full bg-[#2D241E] text-white rounded-xl py-4 font-bold text-sm hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
          >
            <Package size={16} /> Track Your Order <ArrowRight size={15} />
          </Link>

          {/* ✅ Direct PDF Download */}
          <button
            onClick={handleDownloadReceipt}
            disabled={pdfLoading}
            className="w-full border border-stone-200 text-stone-600 rounded-xl py-3.5 font-medium text-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {pdfLoading
              ? <><Loader2 size={15} className="animate-spin" /> Generating...</>
              : <><Download size={15} /> Download Receipt</>
            }
          </button>

          <Link
            href="/products"
            className="w-full border border-stone-200 text-stone-600 rounded-xl py-3.5 font-medium text-sm hover:bg-stone-50 transition-all flex items-center justify-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Subtle footnote */}
      <p className="text-xs text-stone-400 mt-6 text-center">
        Need help? <a href="/contact" className="underline hover:text-stone-600">Contact us</a>
      </p>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <OrderSuccessContent />
    </Suspense>
  );
}