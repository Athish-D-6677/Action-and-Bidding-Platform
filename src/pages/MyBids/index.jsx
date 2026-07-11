import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bidsApi } from '../../api';
import DevFooter from '../../components/DevFooter';

const STATUS_COLOR = {
  WINNING: '#2D6A4F', OUTBID: '#D94F3D', ACTIVE: '#C89B3C',
  WITHDRAWN: '#888', CANCELLED: '#888',
};

export default function MyBids() {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [tab, setTab] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bidsApi.getMyBids()
      .then(r => setBids(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeBids = bids.filter(b => ['WINNING','ACTIVE','OUTBID'].includes(b.status));
  const pastBids   = bids.filter(b => ['WITHDRAWN','CANCELLED'].includes(b.status));

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>My Account</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem' }}>My Bids & Proxy</h1>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        {['active','past'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}>
            {t === 'active' ? `Active Bids (${activeBids.length})` : `Past Bids (${pastBids.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading…</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Lot</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(tab === 'active' ? activeBids : pastBids).map(bid => (
                <tr key={bid.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{bid.lotId}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      ₹{Number(bid.amount).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span className="lot-meta">{bid.bidType}</span>
                  </td>
                  <td>
                    <span style={{
                      fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 700,
                      color: STATUS_COLOR[bid.status] || '#888',
                      textTransform: 'uppercase', letterSpacing: '.06em',
                    }}>
                      {bid.status}
                    </span>
                  </td>
                  <td style={{ color: '#888', fontSize: '0.8rem' }}>
                    {new Date(bid.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm"
                      onClick={() => navigate(`/lot/${bid.lotId}`)}>
                      View Lot
                    </button>
                  </td>
                </tr>
              ))}
              {(tab === 'active' ? activeBids : pastBids).length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 32 }}>
                    No {tab} bids found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Proxy Wizard Info */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-body">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Proxy Bidding — How It Works</div>
          <div style={{ display: 'flex', gap: 0 }}>
            {[
              { step: '01', label: 'EMD Confirmed', desc: 'Deposit your EMD via Razorpay virtual account' },
              { step: '02', label: 'KYC Verified',  desc: 'Complete PAN/Aadhaar verification' },
              { step: '03', label: 'Set Maximum',   desc: 'Enter your confidential proxy maximum — AES-256 encrypted' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: '16px 20px',
                                    borderRight: i < 2 ? '1px solid #e0d8cc' : 'none' }}>
                <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 700,
                               color: '#C89B3C', marginBottom: 6 }}>{s.step}</div>
                <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.88rem' }}>{s.label}</div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 20px', background: '#f9f6f0', borderRadius: 6,
                        marginTop: 12, fontSize: '0.78rem', color: '#888' }}>
            ⚠️ Your proxy maximum is never shown to other bidders. The system only reveals "Proxy" as the bid type.
            Tie-breaking rule: earlier submission wins.
          </div>
        </div>
      </div>

      <DevFooter screenNum={5} screenName="My Bids" subLabel="Proxy & EMD Ledger" />
    </div>
  );
}
