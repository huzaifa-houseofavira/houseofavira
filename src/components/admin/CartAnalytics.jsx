'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BarChart3, ShoppingBag, Users, User, Phone, Mail, Loader2, CheckCircle2, Send, X } from 'lucide-react';

export default function CartAnalytics() {
  const [allUsers, setAllUsers] = useState([]);
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [actualRevenue, setActualRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('carts'); // 'carts' or 'users'
  const [sendingIds, setSendingIds] = useState(new Set());
  const [sentIds, setSentIds] = useState(new Set());
  
  // Bulk sending states
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkTotal, setBulkTotal] = useState(0);
  
  // Promo Modal states
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoSubject, setPromoSubject] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  const handleSendAllReminders = async () => {
    const unsentCarts = abandonedCarts.filter(cart => !sentIds.has(cart.id)).slice(0, 50);
    if (unsentCarts.length === 0) {
      alert('All active carts have already been sent a reminder in this session!');
      return;
    }
    
    if (!confirm(`Are you sure you want to send reminder emails to ${unsentCarts.length} users?`)) return;

    setIsSendingBulk(true);
    setBulkTotal(unsentCarts.length);
    setBulkProgress(0);

    for (let i = 0; i < unsentCarts.length; i++) {
      const cart = unsentCarts[i];
      await handleSendReminder(cart);
      setBulkProgress(i + 1);
      if (i < unsentCarts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsSendingBulk(false);
    alert('Finished sending bulk reminders!');
  };

  const handleSendPromo = async () => {
    if (!promoSubject || !promoMessage) {
      alert('Please fill in both subject and message.');
      return;
    }
    
    const usersToSend = allUsers.slice(0, 50);
    if (!confirm(`Are you sure you want to send this promotional email to ${usersToSend.length} users?`)) return;

    setIsSendingBulk(true);
    setBulkTotal(usersToSend.length);
    setBulkProgress(0);
    setIsPromoModalOpen(false);

    for (let i = 0; i < usersToSend.length; i++) {
      const user = usersToSend[i];
      try {
        await fetch('/api/send-custom-mail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            subject: promoSubject,
            message: promoMessage,
            link: 'https://houseofavira.shop/catalogue'
          }),
        });
      } catch (error) {
        console.error("Error sending promo to", user.email, ":", error);
      }
      
      setBulkProgress(i + 1);
      if (i < usersToSend.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsSendingBulk(false);
    alert('Finished sending promotional emails!');
    setPromoSubject('');
    setPromoMessage('');
  };

  const handleSendReminder = async (cart) => {
    setSendingIds(prev => new Set(prev).add(cart.id));
    
    try {
      const response = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cart.email,
          name: cart.name,
          itemCount: cart.itemCount
        }),
      });
      
      if (response.ok) {
        setSentIds(prev => new Set(prev).add(cart.id));
      } else {
        console.error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setSendingIds(prev => {
        const next = new Set(prev);
        next.delete(cart.id);
        return next;
      });
    }
  };

  useEffect(() => {
    async function fetchUsersAndCarts() {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = [];
        const cartsData = [];
        
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          const userObj = {
            id: doc.id,
            email: userData.email || 'No Email',
            name: userData.name || 'Unknown User',
            phone: userData.phone ? `${userData.countryCode || ''} ${userData.phone}`.trim() : 'No Phone',
            role: userData.role || 'customer',
          };
          
          usersData.push(userObj);

          if (userData.cart && userData.cart.length > 0) {
            const cartTotal = userData.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            cartsData.push({
              ...userObj,
              cart: userData.cart,
              total: cartTotal,
              itemCount: userData.cart.reduce((count, item) => count + item.quantity, 0)
            });
          }
        });
        
        // Fetch confirmed orders to calculate actual revenue
        const ordersQuery = query(
          collection(db, 'orders'),
          where('product_payment_status', '==', 'CONFIRMED')
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        let actualRev = 0;
        ordersSnapshot.forEach((doc) => {
          const data = doc.data();
          actualRev += (data.payable_amount || 0);
        });
        setActualRevenue(actualRev);

        // Sort by total descending for carts
        cartsData.sort((a, b) => b.total - a.total);
        setAbandonedCarts(cartsData);
        setAllUsers(usersData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsersAndCarts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-dm-sans">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#d2d2d7]/50 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#86868b] font-bold uppercase tracking-wider mb-1">Total Users</p>
            <h3 className="text-3xl font-bold text-black">{allUsers.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#d2d2d7]/50 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#86868b] font-bold uppercase tracking-wider mb-1">Active Carts</p>
            <h3 className="text-3xl font-bold text-black">{abandonedCarts.length}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#d2d2d7]/50 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#86868b] font-bold uppercase tracking-wider mb-1">Actual Revenue</p>
            <h3 className="text-3xl font-bold text-black">₹{actualRevenue.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#d2d2d7]/50 overflow-hidden flex flex-col">
        {/* Tabs and Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#d2d2d7]/50 bg-gray-50/30 pr-0 sm:pr-4">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('carts')}
              className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'carts' ? 'border-black text-black' : 'border-transparent text-[#86868b] hover:text-black'}`}
            >
              Abandoned Carts
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'users' ? 'border-black text-black' : 'border-transparent text-[#86868b] hover:text-black'}`}
            >
              All Registered Users
            </button>
          </div>
          
          <div className="px-6 pb-4 sm:px-0 sm:pb-0">
            {activeTab === 'carts' && abandonedCarts.length > 0 && (
              <button 
                onClick={handleSendAllReminders}
                disabled={isSendingBulk}
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isSendingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSendingBulk ? `Sending (${bulkProgress}/${bulkTotal})` : 'Send to All Carts (Max 50)'}
              </button>
            )}
            
            {activeTab === 'users' && allUsers.length > 0 && (
              <button 
                onClick={() => setIsPromoModalOpen(true)}
                disabled={isSendingBulk}
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isSendingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSendingBulk ? `Sending (${bulkProgress}/${bulkTotal})` : 'Send Promo to All (Max 50)'}
              </button>
            )}
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="overflow-x-auto">
          {activeTab === 'carts' ? (
            abandonedCarts.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-black mb-1">No Active Carts</h3>
                <p className="text-sm text-[#86868b]">Users haven't left any items in their carts yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#d2d2d7]/50 text-[10px] font-bold uppercase tracking-widest text-[#86868b] bg-gray-50/50">
                    <th className="px-6 py-4">Customer Details</th>
                    <th className="px-6 py-4">Cart Contents</th>
                    <th className="px-6 py-4 text-right">Cart Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d2d2d7]/30">
                  {abandonedCarts.map((cart) => (
                    <tr key={cart.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-1">
                          <div className="font-semibold text-black text-sm">{cart.name}</div>
                          <div className="flex items-center gap-1.5 text-xs text-[#86868b]">
                            <Mail className="w-3 h-3" />
                            {cart.email}
                          </div>
                          {cart.phone !== 'No Phone' && (
                            <div className="flex items-center gap-1.5 text-xs text-[#86868b]">
                              <Phone className="w-3 h-3" />
                              {cart.phone}
                            </div>
                          )}
                          {sentIds.has(cart.id) ? (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-green-600 bg-green-50 text-[10px] font-bold uppercase tracking-widest rounded-md w-fit animate-in zoom-in duration-300">
                              <CheckCircle2 className="w-3 h-3" />
                              Sent Successfully
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleSendReminder(cart)}
                              disabled={sendingIds.has(cart.id)}
                              className="mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-md hover:bg-gray-800 transition-colors w-fit disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {sendingIds.has(cart.id) ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Mail className="w-3 h-3" />
                              )}
                              {sendingIds.has(cart.id) ? 'Sending...' : 'Send Reminder'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="text-xs font-semibold text-black mb-2">
                          {cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {cart.cart.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <span className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 text-[10px] font-bold shrink-0">
                                {item.quantity}x
                              </span>
                              <span className="text-gray-700 truncate max-w-[250px]">
                                {item.title} {item.size ? `(${item.size})` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-right">
                        <div className="text-sm font-bold text-black bg-gray-100 inline-block px-3 py-1 rounded-full">
                          ₹{cart.total.toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            allUsers.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <Users className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-black mb-1">No Users Found</h3>
                <p className="text-sm text-[#86868b]">There are no registered users in the database yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#d2d2d7]/50 text-[10px] font-bold uppercase tracking-widest text-[#86868b] bg-gray-50/50">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d2d2d7]/30">
                  {allUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-black text-sm">{user.name}</div>
                            <div className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">ID: {user.id.substring(0,8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-[#86868b]">
                            <Mail className="w-3.5 h-3.5" />
                            {user.email}
                          </div>
                          {user.phone !== 'No Phone' && (
                            <div className="flex items-center gap-1.5 text-xs text-[#86868b]">
                              <Phone className="w-3.5 h-3.5" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin_owner' 
                            ? 'bg-purple-100 text-purple-700' 
                            : user.role === 'admin_team'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>

      {/* Promo Email Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setIsPromoModalOpen(false)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#d2d2d7]/50 flex justify-between items-center bg-[#FAFAFA]">
              <div>
                <h3 className="text-lg font-semibold text-black">Send Promotional Email</h3>
                <p className="text-sm text-[#86868b]">Will be sent to max 50 registered users.</p>
              </div>
              <button 
                onClick={() => setIsPromoModalOpen(false)}
                className="p-2 hover:bg-[#E5E5EA] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#86868b]" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. 50% Off Our New Collection!"
                  value={promoSubject}
                  onChange={(e) => setPromoSubject(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-[#d2d2d7] rounded-lg text-sm text-black placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Message</label>
                <textarea
                  placeholder="Type your beautiful message here. We will format it into a stunning House of Avira email template..."
                  value={promoMessage}
                  onChange={(e) => setPromoMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 bg-white border border-[#d2d2d7] rounded-lg text-sm text-black placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-all resize-none"
                />
                <p className="text-xs text-[#86868b] mt-2">
                  A "View Catalogue" button linking to your catalogue will be automatically added at the bottom.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#FAFAFA] border-t border-[#d2d2d7]/50 flex justify-end gap-3">
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-black bg-white border border-[#d2d2d7] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendPromo}
                disabled={!promoSubject || !promoMessage}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
