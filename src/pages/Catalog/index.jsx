import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { lotsApi } from '../../api';
import LotCard from '../../components/LotCard';
import DevFooter from '../../components/DevFooter';

const CATEGORIES = ['Textiles & Apparel','Fine Art & Paintings','Furniture & Antiques',
                    'Decorative Arts','Jewellery','Books & Manuscripts'];
const AUCTION_TYPES = ['ENGLISH','DUTCH','SEALED','REVERSE','LIVE'];
const STATUSES = ['LIVE','PREVIEW','APPROVED'];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [lots, setLots] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    auctionType: '',
    minBid: '',
    maxBid: '',
    status: '',
  });

  const fetchLots = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      const params = { page: pg, size: 20, ...Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      )};
      const { data } = await lotsApi.getCatalog(params);
      setLots(pg === 0 ? data.content : prev => [...prev, ...data.content]);
      setTotal(data.totalElements);
      setPage(pg);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchLots(0); }, [fetchLots]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', paddingBottom: 48 }}>
      {/* ── Filter Sidebar ─────────────────────────────────────────────── */}
      <aside style={styles.sidebar}>
        <div className="eyebrow" style={{ padding: '20px 20px 12px', color: '#C89B3C' }}>
          Filters
        </div>

        <FilterSection title="Auction Type">
          {AUCTION_TYPES.map(t => (
            <label key={t} style={styles.checkLabel}>
              <input type="radio" name="auctionType" value={t}
                checked={filters.auctionType === t}
                onChange={() => setFilter('auctionType', filters.auctionType === t ? '' : t)} />
              <span className="lot-meta">{t}</span>
            </label>
          ))}
        </FilterSection>

        <FilterSection title="Category">
          {CATEGORIES.map(c => (
            <label key={c} style={styles.checkLabel}>
              <input type="radio" name="category" value={c}
                checked={filters.category === c}
                onChange={() => setFilter('category', filters.category === c ? '' : c)} />
              <span style={{ fontSize: '0.8rem' }}>{c}</span>
            </label>
          ))}
        </FilterSection>

        <FilterSection title="Price Range">
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" placeholder="Min ₹" type="number"
              value={filters.minBid} onChange={e => setFilter('minBid', e.target.value)}
              style={{ width: '50%', padding: '6px 8px', fontSize: '0.8rem' }} />
            <input className="form-input" placeholder="Max ₹" type="number"
              value={filters.maxBid} onChange={e => setFilter('maxBid', e.target.value)}
              style={{ width: '50%', padding: '6px 8px', fontSize: '0.8rem' }} />
          </div>
        </FilterSection>

        <FilterSection title="Status">
          {STATUSES.map(s => (
            <label key={s} style={styles.checkLabel}>
              <input type="radio" name="status" value={s}
                checked={filters.status === s}
                onChange={() => setFilter('status', filters.status === s ? '' : s)} />
              <span className="lot-meta">{s}</span>
            </label>
          ))}
        </FilterSection>

        <div style={{ padding: '0 16px 16px' }}>
          <button className="btn btn-outline btn-sm" style={{ width: '100%' }}
            onClick={() => setFilters({ category:'', auctionType:'', minBid:'', maxBid:'', status:'' })}>
            Clear Filters
          </button>
        </div>
      </aside>

      {/* ── Lot Grid ───────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', marginBottom: 4 }}>
              Lot Catalog
            </h1>
            <div className="lot-meta">{total} lots · English · Dutch · Sealed · Reserve · Reverse</div>
          </div>
        </div>

        {loading && lots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading lots…</div>
        ) : lots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
            No lots match your filters.
          </div>
        ) : (
          <>
            <div className="grid-4">
              {lots.map((lot, i) => <LotCard key={lot.id} lot={lot} index={i} />)}
            </div>
            {lots.length < total && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button className="btn btn-outline" onClick={() => fetchLots(page + 1)} disabled={loading}>
                  {loading ? 'Loading…' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <DevFooter screenNum={2} screenName="Lot Catalog" subLabel="Browse & Filter" />
    </div>
  );
}

function FilterSection({ title, children }) {
  return (
    <div style={{ padding: '0 16px 16px', borderBottom: '1px solid #e0d8cc', marginBottom: 4 }}>
      <div className="eyebrow" style={{ marginBottom: 10, color: '#555' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: 220, flexShrink: 0,
    background: '#fff', borderRight: '1px solid #e0d8cc',
    overflowY: 'auto',
  },
  checkLabel: {
    display: 'flex', alignItems: 'center', gap: 8,
    cursor: 'pointer', fontSize: '0.82rem',
  },
};
