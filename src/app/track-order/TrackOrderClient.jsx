'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const STATUS_STEPS = ['Order Confirmed', 'International Shipping'];
const STATUS_CONFIG = {
  Pending:   { color: '#B45309', bg: '#FEF3C7', icon: '⏳' },
  Placed:    { color: '#B45309', bg: '#FEF3C7', icon: '⏳' },
  Confirmed: { color: '#047857', bg: '#D1FAE5', icon: '✓' },
  Processing:{ color: '#1D4ED8', bg: '#DBEAFE', icon: '⚙️' },
  Shipped:   { color: '#1D4ED8', bg: '#DBEAFE', icon: '🚚' },
  Delivered: { color: '#065F46', bg: '#A7F3D0', icon: '📦' },
  Cancelled: { color: '#DC2626', bg: '#FEE2E2', icon: '✕' },
};

export default function TrackOrderClient() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams?.get('orderId') || '');
  const [contact, setContact] = useState(searchParams?.get('contact') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [cachedOrder, setCachedOrder] = useState(null);

  useEffect(() => {
    if (searchParams?.get('orderId') && searchParams?.get('contact')) {
      handleTrack(new Event('submit'));
    }
  }, []);

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    setError('');

    // Check if we already fetched THIS exact order to prevent spam
    if (cachedOrder && cachedOrder.orderId.toLowerCase().includes(orderId.toLowerCase().replace(/[\s#]/g, '')) && !searched) {
      setOrder(cachedOrder);
      return;
    }

    setOrder(null);
    setSearched(true);
    if (!orderId.trim() || !contact.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId.trim(),
          contact: contact.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setOrder(data.order);
      setCachedOrder(data.order);
    } catch (err) {
      console.error('Track order error:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
      setSearched(false);
    }
  };

  const getStepIndex = (orderData) => {
    if (!orderData) return 0;
    
    // 0 = Order Confirmed, 1 = International Shipping
    // Tick "International Shipping" only when weight is entered or beyond
    if (orderData.weightStatus === 'ENTERED' || orderData.estimatedOrderWeight > 0) {
      return 1;
    }
    return 0;
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const date = new Date(ts);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Convert generic status to track-order steps where possible
  const displayStatus = order ? (order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()) : '';
  const configStatus = STATUS_CONFIG[displayStatus] || STATUS_CONFIG['Pending'];

  return (
    <>
      <style>{CSS}</style>
      <div className="trk-page">
        {/* Hero */}
        <div className="trk-hero">
          <div className="trk-hero-inner">
            <div className="trk-badge">ORDER TRACKING</div>
            <h1 className="trk-h1">
              TRACK YOUR<br />
              <span className="trk-h1-accent">ORDER</span>
            </h1>
            <p className="trk-subtitle">Enter your Order ID and phone number or email to see the live status of your shipment.</p>
          </div>
          {/* Brutalist decorative elements */}
          <div className="trk-deco-1" />
          <div className="trk-deco-2" />
          <div className="trk-deco-3" />
        </div>
        {/* Form Section */}
        <div className="trk-container">
          <form className="trk-form" onSubmit={handleTrack}>
            <div className="trk-form-header">
              <span className="trk-form-num">01</span>
              <span className="trk-form-label">ENTER DETAILS</span>
            </div>
            <div className="trk-fields">
              <div className="trk-field">
                <label className="trk-label" htmlFor="trk-oid">ORDER ID</label>
                <input
                  id="trk-oid"
                  type="text"
                  className="trk-input"
                  placeholder="e.g. #HOA001"
                  value={orderId}
                  onChange={e => setOrderId(e.target.value.toUpperCase())}
                  autoComplete="off"
                />
                <span className="trk-hint">Found on your confirmation page or email</span>
              </div>
              <div className="trk-field">
                <label className="trk-label" htmlFor="trk-contact">PHONE NO. OR EMAIL</label>
                <input
                  id="trk-contact"
                  type="text"
                  className="trk-input"
                  placeholder="e.g. 9876543210 or you@email.com"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  autoComplete="off"
                />
                <span className="trk-hint">Must match the details used during checkout</span>
              </div>
            </div>
            <button type="submit" className="trk-btn" disabled={loading}>
              {loading ? (
                <span className="trk-spinner" />
              ) : (
                <>
                  <span>TRACK NOW</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
            {error && (
              <div className="trk-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                <span>{error}</span>
              </div>
            )}
          </form>
          {/* Results */}
          {order && (
            <div className="trk-result">
              <div className="trk-result-header">
                <div>
                  <span className="trk-result-label">ORDER</span>
                  <span className="trk-result-id">#{order.orderId}</span>
                </div>
                <div className="trk-status-badge" style={{ background: configStatus.bg, color: configStatus.color }}>
                  <span>{configStatus.icon}</span>
                  <span>{displayStatus.toUpperCase()}</span>
                </div>
              </div>
              {/* Progress Tracker */}
              {displayStatus !== 'Cancelled' && (
                <div className="trk-progress">
                  <div className="trk-progress-bar">
                    <div className="trk-progress-fill" style={{ width: `${(getStepIndex(order) / (STATUS_STEPS.length - 1)) * 100}%` }} />
                  </div>
                  <div className="trk-steps">
                    {STATUS_STEPS.map((step, i) => {
                      const active = i <= getStepIndex(order);
                      return (
                        <div key={step} className={`trk-step ${active ? 'trk-step-active' : ''}`}>
                          <div className={`trk-step-dot ${active ? 'trk-dot-active' : ''}`}>
                            {active ? '✓' : (i + 1)}
                          </div>
                          <span className="trk-step-label">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {displayStatus === 'Cancelled' && (
                <div className="trk-cancelled">
                  <span>This order has been cancelled.</span>
                </div>
              )}
              {/* Order Details Grid */}
              <div className="trk-details-grid">
                <div className="trk-detail-card">
                  <div className="trk-detail-head">CUSTOMER</div>
                  <div className="trk-detail-body">
                    <div className="trk-detail-row">
                      <span className="trk-detail-key">Name</span>
                      <span className="trk-detail-val">{order.customerInfo.name}</span>
                    </div>
                    <div className="trk-detail-row">
                      <span className="trk-detail-key">Phone</span>
                      <span className="trk-detail-val">{order.customerInfo.phone || '—'}</span>
                    </div>
                    <div className="trk-detail-row">
                      <span className="trk-detail-key">Email</span>
                      <span className="trk-detail-val trk-detail-email">{order.customerInfo.email}</span>
                    </div>
                  </div>
                </div>
                <div className="trk-detail-card">
                  <div className="trk-detail-head">SHIPPING</div>
                  <div className="trk-detail-body">
                    <div className="trk-detail-row">
                      <span className="trk-detail-key">Address</span>
                      <span className="trk-detail-val">
                        {order.shippingAddress.addressLine1 || 'Pending Input'}
                      </span>
                    </div>
                    <div className="trk-detail-row">
                      <span className="trk-detail-key">City</span>
                      <span className="trk-detail-val">{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                    </div>
                    <div className="trk-detail-row">
                      <span className="trk-detail-key">Pincode</span>
                      <span className="trk-detail-val">{order.shippingAddress.pincode}</span>
                    </div>
                  </div>
                </div>
                <div className="trk-detail-card">
                  <div className="trk-detail-head">PAYMENT</div>
                  <div className="trk-detail-body">
                    <div className="trk-detail-row">
                      <span className="trk-detail-key">Status</span>
                      <span className="trk-detail-val">{order.paymentMethod || 'Pending'}</span>
                    </div>
                    <div className="trk-detail-row">
                      <span className="trk-detail-key">Date</span>
                      <span className="trk-detail-val">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="trk-detail-row">
                      <span className="trk-detail-key">Shipping</span>
                      <span className="trk-detail-val">{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Items */}
              <div className="trk-items-card">
                <div className="trk-detail-head">ITEMS ORDERED</div>
                <div className="trk-items-list">
                  {order.items.map((item, i) => (
                    <div key={i} className="trk-item">
                      <div className="trk-item-info">
                        <span className="trk-item-name">{item.name}</span>
                        <span className="trk-item-meta">{item.size ? `Size: ${item.size} × ` : ''}Qty: {item.quantity || 1}</span>
                      </div>
                      <span className="trk-item-price">{item.price === 0 ? 'FREE' : `₹${item.price * (item.quantity || 1)}`}</span>
                    </div>
                  ))}
                </div>
                <div className="trk-total-bar">
                  <span>TOTAL PAID</span>
                  <span className="trk-total-amount">₹{order.finalTotal}</span>
                </div>
              </div>
              {/* Help CTA */}
              <div className="trk-help">
                <span>Need help with this order?</span>
                <a
                  href={`https://wa.me/919986742779?text=Hi%20Support,%20I%20need%20help%20with%20order%20${order.orderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trk-help-btn"
                >
                  CONTACT ON WHATSAPP →
                </a>
              </div>
            </div>
          )}
          {searched && !order && !loading && !error && (
            <div className="trk-empty">
              <p>No matching order found. Double-check your details.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS — BRUTALISM DESIGN · TRACK ORDER
   Bold borders · Raw typography · Stark contrasts
══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
.trk-page {
  min-height: 100vh;
  background: #F5F0E8;
  padding-top: 20px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
/* ── HERO ── */
.trk-hero {
  position: relative;
  background: #0A0A0A;
  color: #F5F0E8;
  padding: clamp(60px, 10vw, 100px) clamp(24px, 5vw, 80px);
  overflow: hidden;
  border-bottom: 6px solid #E11D48;
}
.trk-hero-inner {
  position: relative;
  z-index: 2;
  max-width: 900px;
}
.trk-badge {
  display: inline-block;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  padding: 8px 16px;
  border: 2px solid #E11D48;
  color: #E11D48;
  margin-bottom: 24px;
}
.trk-h1 {
  font-family: var(--font-perandory), serif;
  font-size: clamp(3rem, 8vw, 6.5rem);
  font-weight: normal;
  line-height: 0.9;
  letter-spacing: -0.01em;
  margin: 0 0 20px;
  text-transform: uppercase;
}
.trk-h1-accent {
  color: #E11D48;
  display: inline-block;
  font-style: italic;
}
.trk-subtitle {
  font-size: clamp(0.9rem, 1.5vw, 1.1rem);
  color: #A8A29E;
  max-width: 500px;
  line-height: 1.6;
  margin: 0;
}
/* Brutalist decorative blocks */
.trk-deco-1 {
  position: absolute;
  top: 20px; right: 40px;
  width: 120px; height: 120px;
  border: 4px solid rgba(138,0,26,0.3);
  transform: rotate(12deg);
}
.trk-deco-2 {
  position: absolute;
  bottom: -30px; right: 200px;
  width: 80px; height: 80px;
  background: #E11D48;
  opacity: 0.15;
  transform: rotate(-8deg);
}
.trk-deco-3 {
  position: absolute;
  top: 50%; right: 10%;
  width: 4px; height: 100px;
  background: #E11D48;
  opacity: 0.5;
}
@media(max-width:600px) {
  .trk-deco-1, .trk-deco-2, .trk-deco-3 { display: none; }
}
/* ── CONTAINER ── */
.trk-container {
  max-width: 900px;
  margin: 0 auto;
  padding: clamp(30px, 5vw, 60px) clamp(16px, 4vw, 40px) 80px;
}
/* ── FORM ── */
.trk-form {
  background: #FFFFFF;
  border: 3px solid #0A0A0A;
  padding: 0;
  margin-bottom: 40px;
  position: relative;
}
.trk-form::before {
  content: '';
  position: absolute;
  top: 6px; left: 6px;
  width: 100%; height: 100%;
  background: #0A0A0A;
  z-index: -1;
}
.trk-form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  background: #0A0A0A;
  color: #F5F0E8;
}
.trk-form-num {
  font-family: 'Space Mono', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #E11D48;
}
.trk-form-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
}
.trk-fields {
  padding: 32px 28px 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
@media(max-width:600px) {
  .trk-fields { grid-template-columns: 1fr; gap: 20px; }
}
.trk-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.trk-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #0A0A0A;
}
.trk-input {
  height: 52px;
  padding: 0 16px;
  border: 2.5px solid #0A0A0A;
  background: #F5F0E8;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #0A0A0A;
  outline: none;
  transition: all 0.15s;
}
.trk-input::placeholder {
  color: #B8B2A8;
  font-weight: 400;
}
.trk-input:focus {
  border-color: #E11D48;
  background: #FFF;
  box-shadow: 4px 4px 0px #E11D48;
}
.trk-hint {
  font-size: 0.7rem;
  color: #78716C;
}
.trk-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: calc(100% - 56px);
  margin: 8px 28px 28px;
  height: 56px;
  background: #E11D48;
  color: #FFF;
  border: 3px solid #0A0A0A;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}
.trk-btn:hover:not(:disabled) {
  background: #0A0A0A;
  transform: translate(-3px, -3px);
  box-shadow: 6px 6px 0px #E11D48;
}
.trk-btn:active:not(:disabled) {
  transform: translate(0, 0);
  box-shadow: none;
}
.trk-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}
.trk-spinner {
  display: inline-block;
  width: 22px; height: 22px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #FFF;
  border-radius: 50%;
  animation: trk-spin 0.7s linear infinite;
}
@keyframes trk-spin { to { transform: rotate(360deg); } }
.trk-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0 28px 24px;
  padding: 16px;
  background: #FEF2F2;
  border: 2px solid #DC2626;
  color: #991B1B;
  font-size: 0.9rem;
  font-weight: 600;
}
.trk-error svg { flex-shrink: 0; margin-top: 1px; color: #DC2626; }
/* ── RESULT ── */
.trk-result {
  animation: trk-slideUp 0.5s cubic-bezier(.16,1,.3,1) both;
}
@keyframes trk-slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: none; }
}
.trk-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  background: #0A0A0A;
  border: 3px solid #0A0A0A;
  color: #F5F0E8;
  flex-wrap: wrap;
  gap: 16px;
}
.trk-result-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.3em;
  color: #78716C;
  display: block;
}
.trk-result-id {
  font-family: 'Space Mono', monospace;
  font-size: 1.6rem;
  font-weight: 700;
  display: block;
  margin-top: 2px;
}
.trk-status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  border: 2px solid currentColor;
}
/* ── PROGRESS ── */
.trk-progress {
  background: #FFF;
  border: 3px solid #0A0A0A;
  border-top: none;
  padding: 32px 28px;
}
.trk-progress-bar {
  height: 6px;
  background: #E7E5E4;
  position: relative;
  margin-bottom: 16px;
}
.trk-progress-fill {
  position: absolute;
  top: 0; left: 0;
  height: 100%;
  background: #E11D48;
  transition: width 0.8s cubic-bezier(.16,1,.3,1);
}
.trk-steps {
  display: flex;
  justify-content: space-between;
}
.trk-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.trk-step-dot {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border: 2.5px solid #D6D3D1;
  background: #FFF;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  color: #A8A29E;
  transition: all 0.3s;
}
.trk-dot-active {
  border-color: #E11D48;
  background: #E11D48;
  color: #FFF;
}
.trk-step-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #78716C;
  text-align: center;
}
.trk-step-active .trk-step-label {
  color: #0A0A0A;
}
.trk-cancelled {
  background: #FEF2F2;
  border: 3px solid #DC2626;
  border-top: none;
  padding: 20px 28px;
  font-weight: 700;
  color: #DC2626;
  font-size: 0.9rem;
}
/* ── DETAILS GRID ── */
.trk-details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 3px solid #0A0A0A;
  border-top: none;
}
@media(max-width:700px) {
  .trk-details-grid { grid-template-columns: 1fr; }
}
.trk-detail-card {
  border-right: 3px solid #0A0A0A;
  background: #FFF;
}
.trk-detail-card:last-child { border-right: none; }
@media(max-width:700px) {
  .trk-detail-card {
    border-right: none;
    border-bottom: 3px solid #0A0A0A;
  }
  .trk-detail-card:last-child { border-bottom: none; }
}
.trk-detail-head {
  font-family: 'Space Mono', monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  padding: 14px 20px;
  background: #F5F0E8;
  border-bottom: 2px solid #0A0A0A;
  color: #0A0A0A;
}
.trk-detail-body {
  padding: 16px 20px;
}
.trk-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 6px 0;
  gap: 8px;
}
.trk-detail-key {
  font-size: 0.75rem;
  color: #78716C;
  font-weight: 600;
  flex-shrink: 0;
}
.trk-detail-val {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0A0A0A;
  text-align: right;
  word-break: break-word;
}
.trk-detail-email {
  font-size: 0.78rem;
}
/* ── ITEMS ── */
.trk-items-card {
  border: 3px solid #0A0A0A;
  border-top: none;
  background: #FFF;
}
.trk-items-list {
  padding: 8px 20px;
}
.trk-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1.5px dashed #E7E5E4;
}
.trk-item:last-child { border-bottom: none; }
.trk-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.trk-item-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: #0A0A0A;
}
.trk-item-meta {
  font-size: 0.78rem;
  color: #78716C;
}
.trk-item-price {
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  font-size: 0.95rem;
  color: #0A0A0A;
}
.trk-total-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  background: #0A0A0A;
  color: #F5F0E8;
  font-family: 'Space Mono', monospace;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.15em;
}
.trk-total-amount {
  font-size: 1.3rem;
  color: #E11D48;
}
/* ── HELP ── */
.trk-help {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #FFF;
  border: 3px solid #0A0A0A;
  position: relative;
  flex-wrap: wrap;
  gap: 12px;
}
.trk-help::before {
  content: '';
  position: absolute;
  top: 5px; left: 5px;
  width: 100%; height: 100%;
  background: #0A0A0A;
  z-index: -1;
}
.trk-help span {
  font-weight: 600;
  font-size: 0.9rem;
  color: #44403C;
}
.trk-help-btn {
  font-family: 'Space Mono', monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #FFF;
  background: #25D366;
  padding: 10px 18px;
  border: 2px solid #0A0A0A;
  text-decoration: none;
  transition: all 0.15s;
}
.trk-help-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #0A0A0A;
}
/* ── EMPTY ── */
.trk-empty {
  text-align: center;
  padding: 40px;
  background: #FFF;
  border: 3px solid #0A0A0A;
  font-weight: 600;
  color: #78716C;
}
`
