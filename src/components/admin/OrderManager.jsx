'use client';
import { LumaSpin } from '@/components/ui/luma-spin';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { formatCurrency, isOrderIdMatch } from '@/lib/shipping-constants';
import { Loader2, X, Phone, Mail, MapPin, CreditCard, Clock, Package, AtSign, Search, Plus } from 'lucide-react';
import StatusBadge from './shipping/StatusBadge';
import Image from 'next/image';

export default function OrderManager({ onAddOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedOrder(null);
    document.body.style.overflow = 'auto';
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
                    <div className="text-xs text-[#86868b]">{order.items_count} items</div>
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
                      <Package className="w-4 h-4" /> Ordered Items ({selectedOrder.items_count})
                    </h4>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex gap-4 p-3 bg-[#F5F5F7] rounded-lg">
                          {item.image && (
                            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-[#e5e5ea] flex-shrink-0">
                              <Image 
                                src={item.image} 
                                alt={item.name} 
                                fill 
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-black line-clamp-1">{item.name}</h5>
                            <div className="text-xs text-[#86868b] mt-1 space-y-0.5">
                              {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                              {item.selectedColor && <p>Color: {item.selectedColor}</p>}
                              <p>Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-black text-right">
                            {formatCurrency(item.price * item.quantity, (selectedOrder.shipping_address?.country || selectedOrder.customer_country) === 'USA' ? 'USD' : 'INR')}
                          </div>
                        </div>
                      ))}
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


