'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, Package, LogOut, Calendar, ChevronRight, MapPin, Clock, Truck, CheckCircle2, XCircle, Box } from 'lucide-react';
import Link from 'next/link';

// ── Status timeline mini config ──────────────────────────────────────
const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:    { label: 'Pending',    color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-700',   bg: 'bg-blue-100',   icon: Box },
  shipped:    { label: 'Shipped',    color: 'text-purple-700', bg: 'bg-purple-100', icon: Truck },
  delivered:  { label: 'Delivered',  color: 'text-green-700',  bg: 'bg-green-100',  icon: CheckCircle2 },
  cancelled:  { label: 'Cancelled',  color: 'text-red-700',    bg: 'bg-red-100',    icon: XCircle },
};

// ── Mini dot-line progress bar ───────────────────────────────────────
function MiniTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
        <XCircle size={13} /> Order Cancelled
      </div>
    );
  }

  const activeIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-0 w-full max-w-[260px]">
      {STATUS_STEPS.map((step, idx) => {
        const isDone   = idx <= activeIdx;
        const isActive = idx === activeIdx;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Dot */}
            <div className={`
              w-2.5 h-2.5 rounded-full shrink-0 transition-all
              ${isActive  ? 'bg-[#ee3f5c] ring-2 ring-[#ee3f5c]/30 scale-125' :
                isDone    ? 'bg-[#2D241E]' :
                            'bg-stone-200'}
            `} />
            {/* Connector line — skip after last */}
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`h-[2px] flex-1 ${idx < activeIdx ? 'bg-[#2D241E]' : 'bg-stone-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setOrders(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };

    fetchMyOrders();
  }, [token, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-20 px-6 md:px-20">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#2D241E]">Hello, {user.full_name}</h1>
            <p className="text-stone-500">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-[#ee3f5c] border border-[#ee3f5c] px-4 py-2 rounded-lg hover:bg-[#ee3f5c] hover:text-white transition-all"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Order History */}
        <h2 className="text-xl font-bold text-[#2D241E] mb-6 flex items-center gap-2">
          <Package size={20} /> Order History
        </h2>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-[#2D241E]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
            <Package size={36} className="text-stone-200 mx-auto mb-3" />
            <p className="text-stone-400">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const meta    = STATUS_META[order.order_status] ?? STATUS_META['pending'];
              const Icon    = meta.icon;
              const shortId = order.id.slice(-8).toUpperCase();

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* ── Top row ── */}
                  <div className="flex flex-col md:flex-row justify-between md:items-center px-6 pt-5 pb-4 border-b border-stone-50 gap-3">
                    <div>
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                        Order #{shortId}
                      </span>
                      <div className="flex items-center gap-2 text-stone-500 text-sm mt-1">
                        <Calendar size={13} />
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status badge */}
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${meta.bg} ${meta.color}`}>
                        <Icon size={11} strokeWidth={2.5} />
                        {meta.label}
                      </span>
                      <span className="font-bold text-[#2D241E] text-lg">
                        LKR {order.total_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* ── Mini timeline + delivery address ── */}
                  <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Delivery Progress</p>
                      <MiniTimeline status={order.order_status} />
                      {/* Step labels */}
                      {order.order_status !== 'cancelled' && (
                        <div className="flex justify-between max-w-[260px]">
                          {STATUS_STEPS.map((step) => (
                            <span key={step} className={`text-[9px] font-bold uppercase ${
                              step === order.order_status ? 'text-[#ee3f5c]' : 'text-stone-300'
                            }`}>
                              {step === 'pending' ? 'Placed' : step === 'processing' ? 'Prep' : step === 'shipped' ? 'Sent' : 'Done'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Track button */}
                    <Link
                      href={`/track-order?orderId=${shortId}`}
                      className="flex items-center gap-2 bg-[#2D241E] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-stone-700 transition-all shrink-0 self-start sm:self-center"
                    >
                      <MapPin size={13} /> Track Order <ChevronRight size={13} />
                    </Link>
                  </div>

                  {/* ── Items ── */}
                  <div className="px-6 pb-5 flex flex-wrap gap-2">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="text-xs bg-stone-50 px-3 py-1.5 rounded-lg text-stone-600 border border-stone-100">
                        {item.quantity}× {item.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}