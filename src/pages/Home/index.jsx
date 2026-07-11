import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lotsApi } from '../../api';
import LotCard from '../../components/LotCard';
import DevFooter from '../../components/DevFooter';

const STATS = [
  { value: '5,000', label: 'Bidders Per Room' },
  { value: '<200ms', label: 'Bid Latency' },
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '50K', label: 'Concurrent WS' },
];

const CATEGORIES = [
  { label: 'Textiles & Apparel',   icon: '🧣', color: '#D4B896' },
  { label: 'Fine Art & Paintings', icon: '🖼️', color: '#8FAF8A' },
  { label: 'Furniture & Antiques', icon: '🪑', color: '#C4908A' },
  { label: 'Decorative Arts',      icon: '🏺', color: '#8AAFC4' },
  { label: 'Jewellery',            icon: '💎', color: '#D4B896' },
  { label: 'Books & Manuscripts',  icon: '📜', color: '#8FAF8A' },
];

export default function Home() {
  const [closingSoon, setClosingSoon] = useState([]);
  const [featuredLot, setFeaturedLot] = useState(null);

  useEffect(() => {
    lotsApi.getClosingSoon().then(r => setClosingSoon(r.data)).catch(() => {});
    lotsApi.getCatalog({ status: 'LIVE', size: 1 })
      .then(r => setFeaturedLot(r.data.content?.[0])).catch(() => {});
  }, []);

  return (
    <div style={{ paddingBottom: 48 }}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={styles.hero}>
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Live Auction Platform · Est. 2024
          </div>
          <h1 className="display-heading" style={{ maxWidth: 600, marginBottom: 24 }}>
            Five ways to win a lot.
          </h1>
          <p style={{ color: 'rgba(243,236,221,.75)', maxWidth: 480, marginBottom: 32, lineHeight: 1.7 }}>
            English · Dutch · Sealed · Reserve · Reverse — bid live or set a proxy
            and let the platform fight for you.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/catalog" className="btn btn-primary">Browse Lots</Link>
            <Link to="/register" className="btn btn-outline" style={{ color: '#F3ECDD', borderColor: 'rgba(243,236,221,.4)' }}>
              Register to Bid
            </Link>
          </div>

          {/* Stat Strip */}
          <div className="stat-strip">
            {STATS.map(s => (
              <div className="stat-item" key={s.label}>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Live Lot ─────────────────────────────────────────────── */}
      {featuredLot && (
        <section style={{ background: '#fff', padding: '40px 0', borderBottom: '1px solid #e0d8cc' }}>
          <div className="container">
            <div className="eyebrow" style={{ marginBottom: 12 }}>Featured · Live Now</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
              <div>
                <div style={{ background: '#D4B896', borderRadius: 8, aspectRatio: '4/3',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'monospace', color: '#16261F', opacity: .7 }}>
                  {featuredLot.lotNumber}
                </div>
              </div>
              <div>
                <span className="badge badge-live" style={{ marginBottom: 12 }}>
                  <span className="badge-dot" /> Live Now
                </span>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem',
                             marginBottom: 8, lineHeight: 1.3 }}>
                  {featuredLot.title}
                </h2>
                <div className="lot-meta" style={{ marginBottom: 16 }}>
                  {featuredLot.lotNumber} · {featuredLot.category}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div className="eyebrow">Current Bid</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: '#16261F' }}>
                    ₹{Number(featuredLot.currentBid || featuredLot.startingBid).toLocaleString('en-IN')}
                  </div>
                </div>
                <Link to={`/lot/${featuredLot.id}`} className="btn btn-dark">
                  Bid Now →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Closing Soon ─────────────────────────────────────────────────── */}
      {closingSoon.length > 0 && (
        <section style={{ padding: '40px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Closing in the Next Hour</div>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem' }}>Don't miss out</h2>
              </div>
              <Link to="/catalog" style={{ color: '#C89B3C', fontSize: '0.85rem', fontWeight: 600 }}>
                View All →
              </Link>
            </div>
            <div className="grid-4">
              {closingSoon.map((lot, i) => <LotCard key={lot.id} lot={lot} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Category Shortcuts ────────────────────────────────────────────── */}
      <section style={{ padding: '40px 0', background: '#fff' }}>
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 16 }}>Browse by Category</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.label}
                to={`/catalog?category=${encodeURIComponent(cat.label)}`}
                style={{ ...styles.catCard, background: cat.color }}
              >
                <span style={{ fontSize: '1.8rem' }}>{cat.icon}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.7rem',
                               fontWeight: 700, textTransform: 'uppercase',
                               letterSpacing: '.06em', color: '#16261F', textAlign: 'center' }}>
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <DevFooter screenNum={1} screenName="Home" subLabel="Hero & Catalog Entry" />
    </div>
  );
}

const styles = {
  hero: {
    background: '#16261F',
    padding: '64px 0 40px',
    marginBottom: 0,
  },
  catCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 10, padding: '24px 12px',
    borderRadius: 8, textDecoration: 'none',
    transition: 'transform .15s, box-shadow .15s',
    cursor: 'pointer',
  },
};
