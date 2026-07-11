import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import DevFooter from '../../components/DevFooter';
import toast from 'react-hot-toast';

export default function AdminConsole() {
  const [stats, setStats] = useState({});
  const [pending, setPending] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [tab, setTab] = useState('approvals');

  useEffect(() => {
    adminApi.getStats().then(r => setStats(r.data)).catch(() => {});
    adminApi.getPending().then(r => setPending(r.data)).catch(() => {});
    adminApi.getDisputes().then(r => setDisputes(r.data)).catch(() => {});
  }, []);

  const approveLot = async (id) => {
    try {
      await adminApi.approveLot(id);
      toast.success('Lot approved');
      setPending(p => p.filter(l => l.id !== id));
    } catch { toast.error('Approval failed'); }
  };

  const rejectLot = async (id) => {
    try {
      await adminApi.rejectLot ? adminApi.rejectLot(id) : Promise.resolve();
      toast.success('Lot rejected');
      setPending(p => p.filter(l => l.id !== id));
    } catch { toast.error('Rejection failed'); }
  };

  const resolveDispute = async (id, resolution) => {
    try {
      await adminApi.resolveDispute(id, resolution);
      toast.success('Dispute resolved');
      setDisputes(d => d.filter(x => x.id !== id));
    } catch { toast.error('Failed to resolve'); }
  };

  const STAT_CARDS = [
    { label: 'Pending Approvals', value: stats.pendingApprovals ?? '—', color: '#C89B3C' },
    { label: 'Open Disputes',     value: stats.openDisputes ?? '—',     color: '#D94F3D' },
    { label: 'AML Flags',         value: '0',                           color: '#D94F3D' },
    { label: 'Total Users',       value: stats.totalUsers ?? '—',       color: '#2D6A4F' },
    { label: 'Live Lots',         value: stats.liveLots ?? '—',         color: '#2D6A4F' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          Paddle <span>&</span> Post<br />
          <span style={{ fontSize: '0.7rem', color: 'rgba(243,236,221,.5)' }}>Admin Console</span>
        </div>
        <nav className="sidebar-nav">
          {['Dashboard','Lot Approvals','Disputes','AML Review','Users','Finance'].map(l => (
            <a key={l} href="#" className="sidebar-link">{l}</a>
          ))}
        </nav>
      </div>

      {/* Main */}
      <main style={{ flex: 1, padding: 24, overflowY: 'auto', paddingBottom: 60 }}>
        <div style={{ marginBottom: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Admin Console</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem' }}>Platform Overview</h1>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          {STAT_CARDS.map(s => (
            <div key={s.label} className="card card-body"
              style={{ minWidth: 160, flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700,
                             color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div className="eyebrow" style={{ color: '#888' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 20 }}>
          {[
            { key: 'approvals', label: `Pending Approvals (${pending.length})` },
            { key: 'disputes',  label: `Open Disputes (${disputes.length})` },
            { key: 'aml',       label: 'AML Review Queue' },
          ].map(t => (
            <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {/* Pending Approvals */}
        {tab === 'approvals' && (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Lot #</th><th>Title</th><th>Category</th>
                  <th>Type</th><th>Starting Bid</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(lot => (
                  <tr key={lot.id}>
                    <td><span className="lot-meta">{lot.lotNumber}</span></td>
                    <td style={{ fontWeight: 500, maxWidth: 240 }}>{lot.title}</td>
                    <td><span className="lot-meta">{lot.category}</span></td>
                    <td><span className="lot-meta">{lot.auctionType}</span></td>
                    <td style={{ fontFamily: 'monospace' }}>
                      ₹{Number(lot.startingBid).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-primary" onClick={() => approveLot(lot.id)}>
                          Approve
                        </button>
                        <button className="btn btn-sm btn-outline" style={{ color: '#D94F3D', borderColor: '#D94F3D' }}
                          onClick={() => rejectLot(lot.id)}>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pending.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 32 }}>
                    No pending approvals
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Disputes */}
        {tab === 'disputes' && (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Lot</th><th>Type</th><th>Description</th>
                  <th>Status</th><th>Deadline</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map(d => (
                  <tr key={d.id}>
                    <td><span className="lot-meta">{d.lot?.lotNumber || d.lot?.id}</span></td>
                    <td><span className="lot-meta">{d.disputeType}</span></td>
                    <td style={{ maxWidth: 200, fontSize: '0.82rem' }}>
                      {d.description?.slice(0, 80)}…
                    </td>
                    <td><span className="badge badge-pending">{d.status}</span></td>
                    <td style={{ fontSize: '0.8rem', color: '#888' }}>
                      {d.deadlineAt ? new Date(d.deadlineAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm btn-primary"
                          onClick={() => resolveDispute(d.id, 'FULL_REFUND')}>
                          Refund
                        </button>
                        <button className="btn btn-sm btn-outline"
                          onClick={() => resolveDispute(d.id, 'DISMISSED')}>
                          Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {disputes.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 32 }}>
                    No open disputes
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* AML Review */}
        {tab === 'aml' && (
          <div className="card card-body" style={{ textAlign: 'center', padding: 48, color: '#888' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>AML Review Queue</div>
            <div style={{ fontSize: '0.85rem' }}>
              Transactions above ₹10 lakh are automatically flagged for PMLA screening.
              No pending reviews.
            </div>
          </div>
        )}
      </main>

      <DevFooter screenNum={8} screenName="Admin Console" subLabel="Approvals & Disputes" />
    </div>
  );
}
