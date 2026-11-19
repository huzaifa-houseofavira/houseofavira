'use client';
import { LumaSpin } from '@/components/ui/luma-spin';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { formatCurrency, isOrderIdMatch } from '@/lib/shipping-constants';
import { Loader2, X, Phone, Mail, MapPin, CreditCard, Clock, Package, AtSign, Search, Plus } from 'lucide-react';
import StatusBadge from './shipping/StatusBadge';
import Image from 'next/image';

function OrderItemRow({ item, currencyCode }) {
  const [imgError, setImgError] = useState(false);

  const itemName = item.name || item.title || 'Product';
  const itemQty = item.quantity || item.qty || 1;
  const itemPrice = Number(item.price || 0);

  // Comprehensive color & size resolution across legacy and current order formats
  let size = item.size || item.selectedSize || '';
  let color = item.color || item.selectedColor || item.variant || item.colorName || '';

  // Fallback extraction if size or color missing (e.g. from cartItemId "productId-size-color")
  if ((!size || !color) && item.cartItemId && typeof item.cartItemId === 'string') {
    const parts = item.cartItemId.split('-');
    if (parts.length >= 3) {
      if (!size && parts[1]) size = parts[1];
      if (!color && parts.slice(2).join('-')) color = parts.slice(2).join('-');
    }
  }

  return (
    <div className="flex gap-4 p-3.5 bg-[#F5F5F7] rounded-xl border border-[#d2d2d7]/30 items-start">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#e5e5ea] flex-shrink-0 border border-[#d2d2d7]/50 flex items-center justify-center">
        {item.image && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={itemName}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#86868b] p-1 text-center">
            <Package className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">No Img</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h5 className="text-sm font-semibold text-black break-words leading-tight" title={itemName}>
          {itemName}
        </h5>

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {color && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
              Color: {color}
            </span>
          )}
          {size && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              Size: {size}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-200/80 text-neutral-800">
            Qty: {itemQty}
          </span>
        </div>

        {!color && !size && item.cartItemId && item.cartItemId.includes('-') && (
          <p className="text-[11px] text-[#86868b] mt-1.5 truncate">
            Ref: {item.cartItemId}
          </p>
        )}
      </div>

      <div className="text-sm font-semibold text-black text-right shrink-0">
        {formatCurrency(itemPrice * itemQty, currencyCode)}
      </div>
    </div>
  );
}

export default function OrderManager({ onAddOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resendingEmail, setResendingEmail] = useState(null);
  const [emailMessage, setEmailMessage] = useState(null);

  useEffect(() => {
    async function fetchAllOrders() {
      try {
        setLoading(true);
        setError(null);
        const ordersRef = collection(db, 'orders');
        // Fetch latest 100 orders for admin dashboard
        const q = query(ordersRef, orderBy('created_at', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        
        const fetchedOrders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Failed to fetch admin orders:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAllOrders();
  }, []);

  const openModal = (order) => {
    setSelectedOrder(order);
    setEmailMessage(null);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setEmailMessage(null);
    document.body.style.overflow = 'auto';
  };

  const handleResendEmail = async (orderId) => {
    try {
      setResendingEmail(orderId);
      setEmailMessage(null);
      const res = await fetch(`/api/admin/orders/${orderId}/resend-confirmation`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to send email');
      }
      setEmailMessage({ type: 'success', text: data.message || 'Email sent successfully!' });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, confirmation_email_sent: true } : o));
      setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, confirmation_email_sent: true } : prev);
    } catch (err) {
      setEmailMessage({ type: 'error', text: err.message });
    } finally {
      setResendingEmail(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[#d2d2d7]/50 shadow-sm">
        <LumaSpin />
        <p className="text-[#86868b] font-dm-sans text-sm tracking-wide">Loading orders...</p>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    // Apply status filter
    if (statusFilter === 'paid' && order.product_payment_status !== 'CONFIRMED') return false;
    if (statusFilter === 'placed' && order.order_status !== 'PLACED') return false;

    // Apply search filter
    if (!searchTerm) return true;
    const s = searchTerm.replace(/#/g, '').toLowerCase();
    return (
      isOrderIdMatch(order.id, searchTerm) ||
      order.customer_name?.toLowerCase().includes(s) ||
      order.customer_email?.toLowerCase().includes(s) ||
      order.customer_phone?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-[#d2d2d7]/50 shadow-sm overflow-hidden font-dm-sans">
      <div className="p-6 border-b border-[#d2d2d7]/50 bg-[#FAFAFA] flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-black tracking-tight">Recent Orders</h2>
          <p className="text-sm text-[#86868b] mt-1">View all store orders.</p>
          {error && <p className="text-sm text-red-500 mt-2">Error: {error}</p>}
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto flex-1 xl:flex-none justify-end min-w-0">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`shrink-0 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${
                statusFilter === 'all' 
                  ? 'bg-black text-white' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`shrink-0 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${
                statusFilter === 'paid' 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              }`}
            >
              Paid & Confirmed
            </button>
            <button
              onClick={() => setStatusFilter('placed')}
              className={`shrink-0 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${
                statusFilter === 'placed' 
                  ? 'bg-yellow-500 text-white border-yellow-500' 
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
              }`}
            >
              Only Placed
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {orders.length > 0 && (
              <div className="relative w-full sm:w-64 max-w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#d2d2d7] rounded-lg text-sm text-black placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-all shadow-sm"
                />
              </div>
            )}
            {onAddOrder && (
              <button
                onClick={onAddOrder}
                className="shrink-0 flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Order</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#d2d2d7]/50 bg-white">
              <th className="py-4 px-6 text-xs font-bold text-[#86868b] uppercase tracking-wider">Order ID & Date</th>
              <th className="py-4 px-6 text-xs font-bold text-[#86868b] uppercase tracking-wider">Customer</th>
              <th className="py-4 px-6 text-xs font-bold text-[#86868b] uppercase tracking-wider">Amount</th>
              <th className="py-4 px-6 text-xs font-bold text-[#86868b] uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d2d2d7]/30">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-[#86868b] text-sm">
                  {orders.length === 0 ? 'No orders found.' : 'No matching orders found.'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => openModal(order)}
                  className="hover:bg-[#F5F5F7]/50 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <div className="font-semibold text-black text-sm mb-1 uppercase tracking-wider">#{order.id}</div>
                    <div className="text-xs text-[#86868b]">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-black text-sm">{order.customer_name}</div>
                    <div className="text-xs text-[#86868b]">{order.customer_email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-black text-sm">
                      {formatCurrency(order.payable_amount, order.customer_country === 'USA' ? 'USD' : 'INR')}
                    </div>
                    <div className="text-xs text-[#86868b]">{order.items_count || order.items?.length || 0} items</div>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={order.order_status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={closeModal}>
          <div 
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#d2d2d7]/50 flex justify-between items-center bg-[#FAFAFA]">
              <div>
                <h3 className="text-lg font-semibold text-black">Order #{selectedOrder.id.toUpperCase()}</h3>
                <p className="text-sm text-[#86868b]">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-[#E5E5EA] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#86868b]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F5F5F7]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="bg-white p-5 rounded-xl border border-[#d2d2d7]/50 shadow-sm">
                    <h4 className="text-sm font-semibold text-black mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Customer Details
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div><span className="text-[#86868b]">Name:</span> <span className="font-medium text-black">{selectedOrder.customer_name}</span></div>
                      <div><span className="text-[#86868b]">Email:</span> <span className="font-medium text-black">{selectedOrder.customer_email}</span></div>
                      <div><span className="text-[#86868b]">Phone:</span> <span className="font-medium text-black">{selectedOrder.customer_phone}</span></div>
                      {selectedOrder.customer_instagram && (
                        <div className="flex items-center gap-1">
                          <AtSign className="w-3 h-3 text-[#86868b]" />
                          <span className="font-medium text-black">{selectedOrder.customer_instagram}</span>
                        </div>
                      )}

                      {/* Confirmation Email Status & Action */}
                      <div className="pt-3 border-t border-[#d2d2d7]/50">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-[#86868b]">Confirmation Email:</span>
                          <span className={`font-semibold ${selectedOrder.confirmation_email_sent ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {selectedOrder.confirmation_email_sent ? 'Sent ✓' : 'Not Confirmed / Failed'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleResendEmail(selectedOrder.id)}
                          disabled={resendingEmail === selectedOrder.id}
                          className="w-full py-2 px-3 bg-black hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {resendingEmail === selectedOrder.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5" />
                              <span>Resend Confirmation Email</span>
                            </>
                          )}
                        </button>
                        {emailMessage && (
                          <p className={`text-xs text-center mt-2 font-medium ${emailMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {emailMessage.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="bg-white p-5 rounded-xl border border-[#d2d2d7]/50 shadow-sm">
                    <h4 className="text-sm font-semibold text-black mb-4 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Shipping Address
                    </h4>
                    <div className="text-sm text-black space-y-1">
                      <p>{selectedOrder.shipping_address?.addressLine1 || selectedOrder.customer_address}</p>
                      {(selectedOrder.shipping_address?.addressLine2 || selectedOrder.customer_landmark) && <p>Landmark: {selectedOrder.shipping_address?.addressLine2 || selectedOrder.customer_landmark}</p>}
                      <p>{selectedOrder.shipping_address?.city || selectedOrder.customer_city}, {selectedOrder.shipping_address?.state || selectedOrder.customer_state}</p>
                      <p>{selectedOrder.shipping_address?.country || selectedOrder.customer_country} - {selectedOrder.shipping_address?.pincode || selectedOrder.customer_pincode}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-white p-5 rounded-xl border border-[#d2d2d7]/50 shadow-sm">
                    <h4 className="text-sm font-semibold text-black mb-4 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Payment Details
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div><span className="text-[#86868b]">Status:</span> <StatusBadge status={selectedOrder.order_status} /></div>
                      <div><span className="text-[#86868b]">Method:</span> <span className="font-medium text-black uppercase">{selectedOrder.payment_method}</span></div>
                      {selectedOrder.razorpay_payment_id && (
                        <>
                          <div className="pt-2 border-t border-[#d2d2d7]/50"><span className="text-[#86868b]">Razorpay Payment ID:</span> <span className="font-medium text-black block">{selectedOrder.razorpay_payment_id}</span></div>
                          <div><span className="text-[#86868b]">Razorpay Order ID:</span> <span className="font-medium text-black block">{selectedOrder.razorpay_order_id}</span></div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-[#86868b]">
                            <Clock className="w-3 h-3" /> Verified at {new Date(selectedOrder.updated_at).toLocaleString()}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Order Items */}
                  <div className="bg-white p-5 rounded-xl border border-[#d2d2d7]/50 shadow-sm">
                    <h4 className="text-sm font-semibold text-black mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4" /> Ordered Items ({selectedOrder.items_count || selectedOrder.items?.length || 0})
                    </h4>
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, idx) => (
                          <OrderItemRow
                            key={idx}
                            item={item}
                            currencyCode={(selectedOrder.shipping_address?.country || selectedOrder.customer_country) === 'USA' ? 'USD' : 'INR'}
                          />
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-[#86868b] bg-[#F5F5F7] rounded-lg">
                          No items recorded for this order.
                        </div>
                      )}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-4 pt-4 border-t border-[#d2d2d7]/50 space-y-2 text-sm">
                      <div className="flex justify-between text-[#86868b]">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selectedOrder.product_total || selectedOrder.subtotal || 0, (selectedOrder.shipping_address?.country || selectedOrder.customer_country) === 'USA' ? 'USD' : 'INR')}</span>
                      </div>
                      {(selectedOrder.discount_amount > 0 || selectedOrder.discount_applied > 0) && (
                        <div className="flex justify-between text-[#0071e3]">
                          <span>Discount (Coupon: {selectedOrder.coupon_code})</span>
                          <span>-{formatCurrency(selectedOrder.discount_amount || selectedOrder.discount_applied || 0, (selectedOrder.shipping_address?.country || selectedOrder.customer_country) === 'USA' ? 'USD' : 'INR')}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-black text-base pt-2 border-t border-[#d2d2d7]/30">
                        <span>Paid Amount</span>
                        <span>{formatCurrency(selectedOrder.payable_amount || selectedOrder.total_amount || 0, (selectedOrder.shipping_address?.country || selectedOrder.customer_country) === 'USA' ? 'USD' : 'INR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


