'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ArrowRight, Copy, Check, Download, Loader2, CheckCircle2 } from 'lucide-react';

interface OrderItem {
  name: string;
  size: string;
  price: number;
  quantity: number;
  product_id?: string;
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
  const router = useRouter();
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
    if (!orderId) return;
    const alreadySeen = sessionStorage.getItem(`order_confirmed_${orderId}`);
    if (alreadySeen) {
      router.replace('/products');
    }
  }, [orderId, router]);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

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
          setOrder(orderData);
        }
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setShippingFromSettings(settingsData.shipping_cost ?? settingsData.shippingCost ?? null);
        }
      } catch (err) {
        console.error('Failed to fetch order/settings:', err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchAll();
  }, [orderId]);

  useEffect(() => {
    if (!dataLoading && !autoDownloaded && orderId) {
      setAutoDownloaded(true);
      handleDownloadReceipt();
      sessionStorage.setItem(`order_confirmed_${orderId}`, 'true');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoading]);

  useEffect(() => {
    if (!order || dataLoading) return;
    const downloadProductDocs = async () => {
      try {
        const uniqueProductIds = [
          ...new Set(
            order.items
              .map((item) => item.product_id)
              .filter((id): id is string => Boolean(id))
          )
        ];
        if (uniqueProductIds.length === 0) return;
        const productResponses = await Promise.all(
          uniqueProductIds.map((pid) =>
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${pid}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        );
        const docsToDownload = productResponses.filter((p) => p && p.document);
        if (docsToDownload.length === 0) return;
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

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(45, 36, 30);
      centerText('SKINCARES.LK', y, 22); y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      centerText('Premium Skincare  ·  Sri Lanka', y, 9); y += 10;
      solidLine(y); y += 10;
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
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(margin, y, col, 12, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(21, 128, 61);
      centerText('ORDER CONFIRMED', y + 8, 10);
      y += 20;
      row('Date', orderDate, y); y += 8;
      row('Payment Method', paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : paymentMethod, y); y += 8;
      row('Payment Status', 'Pending — Pay on delivery', y); y += 6;
      dashedLine(y); y += 8;
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
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(140, 130, 120);
      doc.text('PAYMENT SUMMARY', margin, y); y += 8;
      if (items.length > 0) { row('Subtotal', `LKR ${subtotal.toLocaleString()}`, y); y += 8; }
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
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(45, 36, 30);
      centerText('Thank You for Your Order!', y, 14); y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      centerText('We appreciate your trust in SKINCARES.LK', y, 9); y += 10;
      dashedLine(y); y += 10;
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
    <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center px-6 py-8">
      <div
        className={`w-full max-w-2xl transition-all duration-700 ease-out ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >

        {/* ── Hero card ── */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden mb-3">
          <div className="h-[3px]" />

          <div className="px-8 pt-7 pb-6">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-2xl relative shrink-0">
                <div className="absolute inset-0 rounded-2xl bg-green-100 animate-ping opacity-30" />
                <CheckCircle2 size={24} className="text-green-500 relative" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-[#1C1917] tracking-tight">
                  Order Confirmed!
                </h1>
                <p className="text-stone-400 text-[13px] mt-0.5">
                  Your receipt &amp; product guides are downloading
                </p>
              </div>
              <div className="ml-auto">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-green-50 text-green-600 border border-green-200 px-3 py-1.5 rounded-full">
                  Confirmed
                </span>
              </div>
            </div>

            {/* Order ID pill */}
            <div className="mt-5 flex items-center justify-between bg-[#FAFAF9] border border-stone-200 rounded-2xl px-5 py-3.5">
              <div>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.12em] mb-1">Order ID</p>
                <span className="font-mono text-xl font-bold text-[#1C1917] tracking-widest">{shortId}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-[12px] font-semibold px-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-500 hover:text-[#1C1917] hover:border-stone-300 transition-all"
              >
                {copied
                  ? <><Check size={12} className="text-green-500" /> Copied</>
                  : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          </div>
        </div>

        {/* ── Two column: Steps + Info ── */}
        <div className="grid grid-cols-2 gap-3 mb-3">

          {/* What happens next */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm px-6 py-5">
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.12em] mb-4">What happens next</p>
            <div className="space-y-3.5">
              {[
                "We'll carefully prepare and pack your items",
                "Your order will be dispatched for delivery",
                "Pay cash to the delivery rider on arrival",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-[22px] h-[22px] rounded-full bg-[#1C1917] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-[13px] text-stone-600 leading-snug">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Link
            href="/track-order"
            className="flex flex-col items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-800 text-white font-semibold text-[12px] py-5 rounded-2xl transition-colors shadow-sm text-center"
          >
            <Package size={20} />
            Track Order
          </Link>

          <button
            onClick={handleDownloadReceipt}
            disabled={pdfLoading || dataLoading}
            className="flex flex-col items-center justify-center gap-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-[12px] py-5 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pdfLoading
              ? <><Loader2 size={20} className="animate-spin" /><span>Generating…</span></>
              : <><Download size={20} /><span>Download Receipt</span></>}
          </button>

          <Link
            href="/products"
            className="flex flex-col items-center justify-center gap-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-400 font-medium text-[12px] py-5 rounded-2xl transition-colors text-center"
          >
            <ArrowRight size={20} />
            Continue Shopping
          </Link>
        </div>

        <p className="text-center text-[12px] text-stone-400 mt-4">
          Need help?{' '}
          <a href="/contact" className="underline underline-offset-2 hover:text-stone-600 transition-colors">
            Contact us
          </a>
        </p>

      </div>
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