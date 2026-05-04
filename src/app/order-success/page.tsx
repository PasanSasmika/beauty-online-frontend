'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Copy, Check, Download, Loader2 } from 'lucide-react';

interface OrderItem {
  name: string;
  size: string;
  price: number;
  quantity: number;
  product_id?: string; // ← added
}

interface Order {
  id: string;
  orderId?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  items: OrderItem[];
  total_amount: number;
  shipping_cost: number;
  payment_method: string;
  createdAt: string;
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const shortId = orderId.slice(-8).toUpperCase();

  const [copied, setCopied]         = useState(false);
  const [show, setShow]             = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [order, setOrder]           = useState<Order | null>(null);
  const [shippingFromSettings, setShippingFromSettings] = useState<number | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [autoDownloaded, setAutoDownloaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Fetch order + settings in parallel
  useEffect(() => {
    if (!orderId) { setDataLoading(false); return; }

    const fetchAll = async () => {
      try {
        const [orderRes, settingsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`),
        ]);

        if (orderRes.ok) {
          const orderData = await orderRes.json();
          console.log('Order data:', orderData);
          setOrder(orderData);
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          console.log('Settings data:', settingsData);
          setShippingFromSettings(
            settingsData.shipping_cost ?? settingsData.shippingCost ?? null
          );
        }
      } catch (err) {
        console.error('Failed to fetch order/settings:', err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchAll();
  }, [orderId]);

  // Auto-download receipt once data is ready
  useEffect(() => {
    if (!dataLoading && !autoDownloaded && orderId) {
      setAutoDownloaded(true);
      handleDownloadReceipt();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoading]);

  // ── Auto-download product documents ──────────────────────────────────
  useEffect(() => {
    if (!order || dataLoading) return;

    const downloadProductDocs = async () => {
      try {
        // Get unique product IDs (1 doc per unique product, regardless of qty)
        const uniqueProductIds = [
          ...new Set(
            order.items
              .map((item) => item.product_id)
              .filter(Boolean)
          )
        ] as string[];

        if (uniqueProductIds.length === 0) return;

        // Fetch each product in parallel
        const productResponses = await Promise.all(
          uniqueProductIds.map((pid) =>
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${pid}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        );

        // Filter only products that have a document
        const docsToDownload = productResponses.filter((p) => p && p.document);

        if (docsToDownload.length === 0) return;

        // Stagger downloads 800ms apart so browser doesn't block them
        docsToDownload.forEach((product, index) => {
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = `${process.env.NEXT_PUBLIC_API_URL}${product.document}`;
            link.download = `${product.name.replace(/[^a-zA-Z0-9]/g, '_')}_Guide.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, index * 800);
        });

      } catch (err) {
        console.error('Product document download failed:', err);
      }
    };

    downloadProductDocs();
  }, [order, dataLoading]);
  // ─────────────────────────────────────────────────────────────────────

  const handleCopy = () => {
    navigator.clipboard.writeText(shortId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReceipt = async () => {
    setPdfLoading(true);
    try {
      const { jsPDF } = await import('jspdf');

      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const W = doc.internal.pageSize.getWidth();
      const margin = 24;
      const col = W - margin * 2;
      let y = 20;

      // ── Resolve real values ──────────────────────────────────────────
      const customer   = order?.customer;
      const items      = order?.items || [];

      const shippingCost: number =
        (order?.shipping_cost && order.shipping_cost > 0)
          ? order.shipping_cost
          : (shippingFromSettings ?? 0);

      const itemsTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const totalAmount: number =
        (order?.total_amount && order.total_amount > 0)
          ? order.total_amount
          : itemsTotal + shippingCost;

      const subtotal = totalAmount - shippingCost;

      const paymentMethod = (order?.payment_method || 'COD').toUpperCase();
      const orderDate = order?.createdAt
        ? new Date(order.createdAt).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })
        : new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          });

      // ── Helpers ──────────────────────────────────────────────────────
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

      const solidLine = (yPos: number) => {
        doc.setDrawColor(40, 36, 30);
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

      // ── BRAND HEADER ─────────────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(45, 36, 30);
      centerText('SKINCARES.LK', y, 22); y += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      centerText('Premium Skincare  ·  Sri Lanka', y, 9); y += 10;

      solidLine(y); y += 10;

      // ── ORDER ID BOX ─────────────────────────────────────────────────
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
      centerText(`${shortId}`, y + 21, 24);
      y += 36;

      // ── STATUS BADGE ─────────────────────────────────────────────────
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(margin, y, col, 12, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(21, 128, 61);
      centerText('ORDER CONFIRMED', y + 8, 10);
      y += 20;

      // ── ORDER META ───────────────────────────────────────────────────
      row('Date', orderDate, y); y += 8;
      row('Payment Method', paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : paymentMethod, y); y += 8;
      row('Payment Status', 'Pending — Pay on delivery', y); y += 6;

      dashedLine(y); y += 8;

      // ── CUSTOMER DETAILS ─────────────────────────────────────────────
      if (customer) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(140, 130, 120);
        doc.text('DELIVERY TO', margin, y); y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(40, 36, 30);
        doc.text(`${customer.firstName} ${customer.lastName}`, margin, y); y += 6;
        if (customer.phone) { doc.text(customer.phone, margin, y); y += 6; }
        if (customer.address || customer.city) {
          doc.text(`${customer.address}${customer.city ? ', ' + customer.city : ''}`, margin, y); y += 6;
        }
        y += 2;
        dashedLine(y); y += 8;
      }

      // ── ORDER ITEMS TABLE ─────────────────────────────────────────────
      if (items.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(140, 130, 120);
        doc.text('ORDER ITEMS', margin, y); y += 6;

        doc.setFillColor(245, 244, 241);
        doc.rect(margin, y - 1, col, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(100, 90, 80);
        doc.text('Product', margin + 2, y + 5);
        doc.text('Size', margin + 90, y + 5);
        doc.text('Qty', margin + 115, y + 5);
        doc.text('Price', W - margin - 2, y + 5, { align: 'right' });
        y += 10;

        items.forEach((item) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(40, 36, 30);

          let name = item.name;
          while (doc.getTextWidth(name + '...') > 80 && name.length > 0) name = name.slice(0, -1);
          if (name !== item.name) name += '...';

          doc.text(name, margin + 2, y);
          doc.text(item.size || '-', margin + 90, y);
          doc.text(String(item.quantity), margin + 118, y);
          doc.setFont('helvetica', 'bold');
          doc.text(`LKR ${(item.price * item.quantity).toLocaleString()}`, W - margin - 2, y, { align: 'right' });
          y += 8;

          doc.setDrawColor(235, 232, 228);
          doc.setLineWidth(0.1);
          doc.line(margin, y - 2, W - margin, y - 2);
          doc.setLineWidth(0.2);
        });

        y += 2;
        dashedLine(y); y += 8;
      }

      // ── PRICING SUMMARY ───────────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(140, 130, 120);
      doc.text('PAYMENT SUMMARY', margin, y); y += 8;

      if (items.length > 0) {
        row('Subtotal', `LKR ${subtotal.toLocaleString()}`, y); y += 8;
      }
      row('Shipping Fee', `LKR ${shippingCost.toLocaleString()}`, y); y += 6;

      dashedLine(y); y += 8;

      doc.setFontSize(13);
      doc.setTextColor(45, 36, 30);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount', margin, y);
      doc.text(`LKR ${totalAmount.toLocaleString()}`, W - margin, y, { align: 'right' });
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Payable on delivery', W - margin, y, { align: 'right' });
      y += 10;

      solidLine(y); y += 10;

      // ── THANK YOU ─────────────────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(45, 36, 30);
      centerText('Thank You for Your Order!', y, 14); y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      centerText('We appreciate your trust in SKINCARES.LK', y, 9); y += 10;

      dashedLine(y); y += 10;

      // ── NEXT STEPS ────────────────────────────────────────────────────
      doc.setFillColor(250, 249, 246);
      doc.setDrawColor(230, 225, 220);
      doc.roundedRect(margin, y, col, 34, 3, 3, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(140, 130, 120);
      doc.text('WHAT HAPPENS NEXT', margin + 5, y + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(70, 60, 50);
      ["1.  We'll carefully prepare and pack your items",
       '2.  Your order will be dispatched for delivery',
       '3.  Pay cash to the delivery rider upon arrival'].forEach((s, i) => {
        doc.text(s, margin + 5, y + 16 + i * 7);
      });
      y += 44;

      dashedLine(y); y += 10;

      // ── FOOTER ────────────────────────────────────────────────────────
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      centerText('Track your order at  skincares.lk/track-order', y, 8); y += 6;
      centerText('Questions? Visit  skincares.lk/contact', y, 8); y += 6;
      centerText('This is your official order confirmation. Keep it safe.', y, 8);

      doc.save(`SKINCARES-Receipt-${shortId}.pdf`);

    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center px-5 py-20">
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
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-[11px] text-stone-400 mt-2">Save this to track your order later</p>
        </div>

        {/* What's next */}
        <div className="text-left bg-stone-50 rounded-2xl px-5 py-4 mb-8 space-y-2.5">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">What happens next</p>
          {["We'll prepare and pack your items", 'Your order will be dispatched soon', 'Cash on delivery upon arrival'].map((step, i) => (
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

          {/* Download Receipt — disabled until data loaded */}
          <button
            onClick={handleDownloadReceipt}
            disabled={pdfLoading || dataLoading}
            className="w-full border border-stone-200 text-stone-600 rounded-xl py-3.5 font-medium text-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pdfLoading
              ? <><Loader2 size={15} className="animate-spin" /> Generating...</>
              : dataLoading
              ? <><Loader2 size={15} className="animate-spin" /> Loading order data...</>
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