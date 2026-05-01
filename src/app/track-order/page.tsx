'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Package, Search, MapPin, CheckCircle2, Clock, Truck, Box, XCircle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

// --- TYPES ---
interface OrderItem {
  name: string;
  size: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
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
  order_status: string;
  payment_method: string;
  createdAt: string;
}

// --- STATUS CONFIG ---
const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed',  icon: Clock,         desc: 'We received your order' },
  { key: 'processing', label: 'Processing',    icon: Box,           desc: 'Being carefully prepared' },
  { key: 'shipped',    label: 'On the Way',    icon: Truck,         desc: 'Out for delivery' },
  { key: 'delivered',  label: 'Delivered',     icon: CheckCircle2,  desc: 'Enjoy your order!' },
];

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered'];

function getStepIndex(status: string) {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

// --- TIMELINE COMPONENT ---
function OrderTimeline({ status }: { status: string }) {
  const isCancelled = status === 'cancelled';
  const activeIdx = isCancelled ? -1 : getStepIndex(status);

  return (
    <div className="w-full py-6 px-2">
      {isCancelled ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
          <XCircle size={22} className="text-red-400 shrink-0" />
          <div>
            <p className="font-bold text-red-600 text-sm">Order Cancelled</p>
            <p className="text-red-400 text-xs mt-0.5">This order has been cancelled.</p>
          </div>
        </div>
      ) : (
        <div className="relative flex items-start justify-between">
          {/* Background line */}
          <div className="absolute top-[18px] left-0 right-0 h-[2px] bg-stone-100 z-0 mx-[calc(12.5%)] hidden sm:block" />

          {/* Progress line — fills up to active step */}
          {activeIdx > 0 && (
            <div
              className="absolute top-[18px] h-[2px] bg-gradient-to-r from-[#2D241E] to-[#ee3f5c] z-0 hidden sm:block transition-all duration-700"
              style={{
                left: 'calc(12.5%)',
                width: `calc(${(activeIdx / (STATUS_STEPS.length - 1)) * 100}% - 0%)`
              }}
            />
          )}

          {STATUS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx <= activeIdx;
            const isActive = idx === activeIdx;

            return (
              <div key={step.key} className="flex flex-col items-center gap-2 z-10 flex-1 min-w-0">
                {/* Dot */}
                <div className={`
                  relative w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500
                  ${isDone
                    ? isActive
                      ? 'bg-[#ee3f5c] border-[#ee3f5c] shadow-lg shadow-[#ee3f5c]/30 scale-110'
                      : 'bg-[#2D241E] border-[#2D241E]'
                    : 'bg-white border-stone-200'}
                `}>
                  <Icon
                    size={16}
                    className={isDone ? 'text-white' : 'text-stone-300'}
                    strokeWidth={2.5}
                  />
                  {isActive && (
                    <span className="absolute -inset-1 rounded-full border-2 border-[#ee3f5c] opacity-40 animate-ping" />
                  )}
                </div>

                {/* Label */}
                <div className="text-center px-1 max-w-[90px]">
                  <p className={`text-[11px] font-bold leading-tight ${isDone ? 'text-[#2D241E]' : 'text-stone-300'}`}>
                    {step.label}
                  </p>
                  <p className={`text-[10px] mt-0.5 leading-tight hidden sm:block ${isActive ? 'text-[#ee3f5c]' : 'text-stone-400'}`}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- ORDER CARD ---
function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Card Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg tracking-wider">
                #{order.id.slice(-8).toUpperCase()}
              </span>
              <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                order.order_status === 'shipped'   ? 'bg-purple-100 text-purple-700' :
                order.order_status === 'processing'? 'bg-blue-100 text-blue-700' :
                order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {order.order_status}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-2">
              <Calendar size={12} />
              <span>{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-[#2D241E]">LKR {order.total_amount.toLocaleString()}</p>
            <p className="text-xs text-stone-400 uppercase mt-0.5">{order.payment_method}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 sm:px-6">
        <OrderTimeline status={order.order_status} />
      </div>

      {/* Delivery Address Strip */}
      {order.customer?.address && (
        <div className="mx-6 mb-4 flex items-center gap-2 bg-stone-50 rounded-xl px-4 py-3 text-xs text-stone-500">
          <MapPin size={13} className="text-[#ee3f5c] shrink-0" />
          <span className="truncate">{order.customer.address}, {order.customer.city}</span>
        </div>
      )}

      {/* Items Accordion */}
      <div className="border-t border-stone-50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-6 py-3.5 text-xs font-bold text-stone-500 hover:bg-stone-50 transition-colors"
        >
          <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''} in this order</span>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expanded && (
          <div className="px-6 pb-5 space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center shrink-0">
                  <Package size={14} className="text-stone-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2D241E] truncate">{item.name}</p>
                  <p className="text-xs text-stone-400">Size: {item.size} · Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-[#2D241E] shrink-0">LKR {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- GUEST LOOKUP FORM ---
function GuestLookup({ onResult }: { onResult: (order: Order | null) => void }) {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
 
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/track?orderId=${orderId.trim()}`
      );
      if (!res.ok) {
        setError('No order found. Please check your Order ID.');
        onResult(null);
        return;
      }
      const data = await res.json();
      onResult(data);
    } catch {
      setError('Something went wrong. Please try again.');
      onResult(null);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 space-y-4 max-w-md w-full">
      <div>
        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-2">Order ID</label>
        <input
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
          placeholder="e.g. 5D6311DE"
          className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[#2D241E] transition font-mono tracking-wider"
          required
        />
        <p className="text-[11px] text-stone-400 mt-1.5">
          Found on your order confirmation page — the code after the <span className="font-mono">#</span>
        </p>
      </div>
 
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}
 
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#2D241E] text-white rounded-xl py-4 font-bold text-sm hover:bg-stone-800 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
      >
        {loading
          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <Search size={16} />}
        Track Order
      </button>
    </form>
  );
}
// --- MAIN PAGE ---
export default function TrackOrderPage() {
  const { user, token } = useAuth();
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loading, setLoading]         = useState(false);
  const [guestOrder, setGuestOrder]   = useState<Order | null>(null);
  const [guestSearched, setGuestSearched] = useState(false);

  // Fetch orders for logged-in users
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleGuestResult = (order: Order | null) => {
    setGuestOrder(order);
    setGuestSearched(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-24 px-5 md:px-16">
      <div className="max-w-3xl mx-auto">

        {/* Page Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#2D241E] rounded-2xl mb-5">
            <Package size={26} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2D241E]">
            {user ? `Your Orders` : 'Track Your Order'}
          </h1>
          <p className="text-stone-500 mt-2 text-sm">
            {user
              ? `All orders placed under ${user.email}`
              : 'Enter your order details below to see live status'}
          </p>
        </div>

        {/* Logged-in: Order List */}
        {user ? (
          loading ? (
            <div className="flex justify-center py-20">
              <span className="w-8 h-8 border-2 border-stone-200 border-t-[#2D241E] rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
              <Package size={36} className="text-stone-200 mx-auto mb-3" />
              <p className="text-stone-400 text-sm">No orders placed yet.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )
        ) : (
          /* Guest: Lookup Form */
          <div className="flex flex-col items-center gap-6">
            <GuestLookup onResult={handleGuestResult} />
            {guestSearched && guestOrder && (
              <div className="w-full">
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-4 text-center">Order Found</p>
                <OrderCard order={guestOrder} />
              </div>
            )}
            {guestSearched && !guestOrder && null /* Error shown inside form */}
          </div>
        )}

      </div>
    </div>
  );
}