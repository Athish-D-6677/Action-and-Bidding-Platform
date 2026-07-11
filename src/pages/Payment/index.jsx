import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { paymentsApi } from '../../api';
import DevFooter from '../../components/DevFooter';
import toast from 'react-hot-toast';
import { useCountdown } from '../../hooks/useCountdown';

const PROGRESS_STEPS = ['Won','Paid','Dispatched','Delivered','Seller Paid'];

export default function Payment() {
  const { lotId } = useParams();
  const [payment, setPayment] = useState(null);
  const [method, setMethod] = useState('UPI');
  const [paying, setPaying] = useState(false);

  const { display, urgent } = useCountdown(payment?.deadlineAt);

  useEffect(() => {
    paymentsApi.getByLot(lotId).then(r => setPayment(r.data)).catch(() => {});
  }, [lotId]);

  const confirmPayment = async () => {
    setPaying(true);
    try {
      await paymentsApi.confirm(payment.id, 'rzp_demo_' + Date.now(), method);
      toast.success('Payment confirmed! Escrow initiated.');
      paymentsApi.getByLot(lotId).then(r => setPayment(r.data)).catch(() => {});
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Payment failed');
    } finally { setPaying(false); }
  };

  if (!payment) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#888' }}>Loading payment details…</div>
  );

  const currentStep = payment.status === 'PAID' ? 1 : 0;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 720 }}>
      {/* Congratulations Banner */}
      <div style={{ background: '#16261F', borderRadius: 12, padding: '32px 32px 24px',
                    textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
        <div className="eyebrow" style={{ color: '#C89B3C', marginBottom: 8 }}>Congratulations!</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', color: '#F3ECDD', marginBottom: 8 }}>
          You Won the Lot
        </h1>
        <div style={{ color: 'rgba(243,236,221,.6)', fontSize: '0.88rem' }}>
          Complete payment within 48 hours to secure your item.
        </div>
        {payment.status === 'PENDING' && (
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 8 }}>
            <span style={{ color: 'rgba(243,236,221,.5)', fontSize: '0.8rem' }}>Payment deadline:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700,
                           color: urgent ? '#D94F3D' : '#C89B3C', fontSize: '1.1rem' }}>
              {display}
            </span>
          </div>
        )}
      </div>

      {/* Progress Tracker */}
      <div className="card card-body" style={{ marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Order Progress</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {PROGRESS_STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: i <= currentStep ? '#16261F' : '#e0d8cc',
                  color: i <= currentStep ? '#C89B3C' : '#aaa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700,
                  marginBottom: 6,
                }}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', textTransform: 'uppercase',
                               letterSpacing: '.06em', color: i <= currentStep ? '#16261F' : '#aaa',
                               textAlign: 'center' }}>
                  {step}
                </div>
              </div>
              {i < PROGRESS_STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < currentStep ? '#16261F' : '#e0d8cc',
                               margin: '0 4px', marginBottom: 24 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Invoice */}
      <div className="card card-body" style={{ marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Invoice Breakdown</div>
        {[
          { label: 'Hammer Price',    value: payment.hammerPrice },
          { label: "Buyer's Premium", value: payment.buyerPremium },
          { label: 'GST (18%)',       value: payment.gstAmount },
          { label: 'EMD Adjustment',  value: -payment.emdAdjustment, note: 'deducted' },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between',
                                         padding: '8px 0', borderBottom: '1px solid #f0ebe0' }}>
            <span style={{ fontSize: '0.88rem', color: '#555' }}>
              {row.label} {row.note && <span style={{ color: '#888', fontSize: '0.75rem' }}>({row.note})</span>}
            </span>
            <span style={{ fontFamily: 'monospace', fontWeight: 600,
                           color: row.value < 0 ? '#2D6A4F' : '#1a1a1a' }}>
              {row.value < 0 ? '−' : ''}₹{Math.abs(Number(row.value)).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0',
                      borderTop: '2px solid #16261F', marginTop: 4 }}>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total Payable</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.2rem', color: '#16261F' }}>
            ₹{Number(payment.totalPayable).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Payment Method */}
      {payment.status === 'PENDING' && (
        <div className="card card-body" style={{ marginBottom: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Payment Method</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            {['UPI','NETBANKING','NEFT','RTGS'].map(m => (
              <button key={m} className={`btn btn-sm ${method === m ? 'btn-dark' : 'btn-outline'}`}
                onClick={() => setMethod(m)}>{m}</button>
            ))}
          </div>

          {/* Escrow explanation */}
          <div style={{ background: '#f9f6f0', borderRadius: 6, padding: 12,
                        fontSize: '0.78rem', color: '#888', marginBottom: 16 }}>
            🔒 Your payment is held in escrow by Razorpay. Funds are released to the seller only after
            you confirm delivery. In case of dispute, escrow protects both parties.
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }}
            onClick={confirmPayment} disabled={paying}>
            {paying ? 'Processing…' : `Pay ₹${Number(payment.totalPayable).toLocaleString('en-IN')} via ${method}`}
          </button>
        </div>
      )}

      {payment.status === 'PAID' && (
        <div style={{ background: '#f0faf4', border: '1px solid #2D6A4F', borderRadius: 8,
                      padding: 16, textAlign: 'center', color: '#2D6A4F' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>✓ Payment Confirmed</div>
          <div style={{ fontSize: '0.85rem' }}>
            Paid on {new Date(payment.paidAt).toLocaleDateString('en-IN')} via {payment.paymentMethod}
          </div>
        </div>
      )}

      <DevFooter screenNum={9} screenName="Winner Payment" subLabel="Escrow Checkout" />
    </div>
  );
}
