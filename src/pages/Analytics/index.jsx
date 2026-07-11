import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { adminApi } from '../../api';
import DevFooter from '../../components/DevFooter';

const GMV_DATA = [
  { category: 'Textiles',  gmv: 4200000 },
  { category: 'Fine Art',  gmv: 8900000 },
  { category: 'Furniture', gmv: 3100000 },
  { category: 'Decorative',gmv: 2400000 },
  { category: 'Jewellery', gmv: 6700000 },
  { category: 'Books',     gmv: 900000  },
];

const OUTCOME_DATA = [
  { name: 'Sold',    value: 68, color: '#2D6A4F' },
  { name: 'Unsold',  value: 18, color: '#D4B896' },
  { name: 'Disputed',value: 4,  color: '#D94F3D' },
  { name: 'Pending', value: 10, color: '#C89B3C' },
];

const AUCTIONEER_DATA = [
  { name: 'Rajan Mehta',   lots: 42, gmv: 12400000, sellThrough: 78 },
  { name: 'Priya Iyer',    lots: 31, gmv: 8900000,  sellThrough: 84 },
  { name: 'Arjun Sharma',  lots: 28, gmv: 7200000,  sellThrough: 71 },
];

const fmt = n => n >= 1e7 ? `₹${(n/1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n/1e5).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

export default function Analytics() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    adminApi.getStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  const TOP_STATS = [
    { label: 'Lots Sold %',      value: '68%',        color: '#2D6A4F' },
    { label: 'Total GMV',        value: '₹3.4Cr',     color: '#16261F' },
    { label: 'Commission Rev.',  value: '₹17.2L',     color: '#C89B3C' },
    { label: 'Active Bidders',   value: '1,247',      color: '#16261F' },
    { label: 'Dispute Rate',     value: '4%',         color: '#D94F3D' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          Paddle <span style={{ color: '#C89B3C' }}>&</span> Post<br />
          <span style={{ fontSize: '0.7rem', color: 'rgba(243,236,221,.5)' }}>Analytics</span>
        </div>
        <nav className="sidebar-nav">
          {['Overview','GMV by Category','Lot Outcomes','Auctioneer Scores','Export'].map(l => (
            <a key={l} href="#" className="sidebar-link">{l}</a>
          ))}
        </nav>
      </div>

      <main style={{ flex: 1, padding: 24, overflowY: 'auto', paddingBottom: 60 }}>
        <div style={{ marginBottom: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Platform Analytics</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem' }}>Dashboard</h1>
        </div>

        {/* Top Stat Cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          {TOP_STATS.map(s => (
            <div key={s.label} className="card card-body" style={{ flex: 1, minWidth: 140, textAlign: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '1.6rem', fontWeight: 700,
                             color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div className="eyebrow" style={{ color: '#888' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* GMV Bar Chart */}
          <div className="card card-body">
            <div className="eyebrow" style={{ marginBottom: 16 }}>GMV by Category</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={GMV_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe0" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 10 }} />
                <Tooltip formatter={v => fmt(v)} />
                <Bar dataKey="gmv" fill="#C89B3C" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Outcome Pie Chart */}
          <div className="card card-body">
            <div className="eyebrow" style={{ marginBottom: 16 }}>Lot Outcome Split</div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={OUTCOME_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {OUTCOME_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8}
                  formatter={v => <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{v}</span>} />
                <Tooltip formatter={v => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Auctioneer Scorecard */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e0d8cc',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="eyebrow">Auctioneer Scorecard</div>
            <button className="btn btn-outline btn-sm">Export CSV</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Auctioneer</th>
                <th>Lots Conducted</th>
                <th>Total GMV</th>
                <th>Sell-Through Rate</th>
              </tr>
            </thead>
            <tbody>
              {AUCTIONEER_DATA.map(a => (
                <tr key={a.name}>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td style={{ fontFamily: 'monospace' }}>{a.lots}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{fmt(a.gmv)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: '#f0ebe0', borderRadius: 3 }}>
                        <div style={{ width: `${a.sellThrough}%`, height: '100%',
                                       background: '#2D6A4F', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700 }}>
                        {a.sellThrough}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <DevFooter screenNum={10} screenName="Analytics Dashboard" subLabel="Platform Metrics" />
    </div>
  );
}
