import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { lotsApi, bidsApi } from '../../api';
import { selectAuth, selectBids, setBidHistory } from '../../store';
import { useCountdown } from '../../hooks/useCountdown';
import { useAuctionSocket } from '../../hooks/useAuctionSocket';
import DevFooter from '../../components/DevFooter';

const TABS = ['Condition Report','Provenance','Bid History','Shipping'];

export default function LotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const bids = useSelector(selectBids);

  const [lot, setLot] = useState(null);
  const [tab, setTab] = useState('Condition Report');
  const [bidAmount, setBidAmount] = useState('');
  const [proxyMax, setProxyMax] = useState('');
  const [showProxy, setShowProxy] = useState(false);
  const [placing, setPlacing] = useState(false);

  const { display, urgent } = useCountdown(lot?.endAt);
  useAuctionSocket(id);

  useEffect(() => {
    lotsApi.getLot(id).then(r => {
      setLot(r.data);
      const minBid = r.data.currentBid
        ? Number(r.data.currentBid) + Number(r.data.minIncrement)
        : Number(r.data.startingBid);
      setBidAmount(minBid);
    }).catch(() => navigate('/catalog'));

    bidsApi.getBidHistory(id).then(r => dispatch(setBidHistory(r.data))).catch(() => {});
  }, [id, navigate, dispatch]);

  const placeBid = async () => {
    if (!user) { navigate('/login'); return; }
    setPlacing(true);
    try {
      await bidsApi.placeBid({ lotId: id, amount: Number(bidAmount) });
      toast.success(`Bid of ₹${Number(bidAmount).toLocaleString('en-IN')} placed!`);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Bid failed');
    } finally { setPlacing(false); }
  };

  const setProxy = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await bidsApi.setProxy({ lotId: id, proxyMax: Number(proxyMax) });
      toast.success('Proxy maximum set confidentially');
      setShowProxy(false);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to set proxy');
    }
  };

  if (!lot) return <div style={{ padding: 60, textAlign: 'center' }}>Loading…</div>;

  const minBid = lot.currentBid
    ? Number(lot.currentBid) + Number(lot.minIncrement)
    : Number(lot.startingBid);
  const isLive = lot.status === 'LIVE';
  const photos = (() => { try { return JSON.parse(lot.photos || '[]'); } catch { return []; } })();

  return (
    <div style={{ paddingBottom: 60 }}>
      <div className="container" style={{ paddingTop: 24 }}>
        {/* Breadcrumb */}
        <div className="lot-meta" style={{ marginBottom: 16 }}>
          <span style={{ cursor: 'pointer', color: '#C89B3C' }} onClick={() => navigate('/catalog')}>
            Catalog
          </span>
          {' / '}{lot.lotNumber} · {lot.category}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
          {/* ── Left: Gallery + Tabs ─────────────────────────────────────── */}
          <div>
            {/* Main image */}
            <div style={{ background: '#D4B896', borderRadius: 8, aspectRatio: '4/3',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginBottom: 12, overflow: 'hidden' }}>
              {photos[0]
                ? <img src={photos[0]} alt={lot.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: 'monospace', color: '#16261F', opacity: .6 }}>{lot.lotNumber}</span>
              }
            </div>
            {/* Thumbnails */}
            {photos.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {photos.slice(0, 5).map((p, i) => (
                  <img key={i} src={p} alt="" style={{ width: 64, height: 64, objectFit: 'cover',
                    borderRadius: 4, border: '2px solid #e0d8cc', cursor: 'pointer' }} />
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 20 }}>
              {TABS.map(t => (
                <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`}
                  onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>

            <div style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#444' }}>
              {tab === 'Condition Report' && (lot.conditionReport || 'No condition report available.')}
              {tab === 'Provenance' && (lot.provenance || 'No provenance information available.')}
              {tab === 'Shipping' && (lot.shippingInfo || 'Shipping details to be confirmed with seller.')}
              {tab === 'Bid History' && (
                <div className="bid-feed">
                  {bids.length === 0
                    ? <div style={{ color: '#888' }}>No bids yet. Be the first!</div>
                    : bids.map((b, i) => (
                      <div key={i} className={`bid-feed-item ${b.status === 'WINNING' ? 'winning' : ''}`}>
                        <span>{b.bidderName} <span className="lot-meta">({b.bidType})</span></span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          ₹{Number(b.amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Sticky Bid Panel ──────────────────────────────────── */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div className="card">
              <div style={{ background: '#16261F', padding: '20px 20px 16px', borderRadius: '8px 8px 0 0' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  {isLive && <span className="badge badge-live"><span className="badge-dot" />Live Now</span>}
                  <span className={`badge badge-${lot.auctionType.toLowerCase()}`}>{lot.auctionType}</span>
                </div>
                <div className="lot-meta" style={{ color: 'rgba(243,236,221,.6)', marginBottom: 4 }}>
                  {lot.lotNumber} · {lot.category}
                </div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#F3ECDD',
                              lineHeight: 1.3, marginBottom: 12 }}>
                  {lot.title}
                </div>
                {isLive && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="eyebrow" style={{ color: 'rgba(243,236,221,.5)' }}>Ends In</div>
                      <div className={`countdown ${urgent ? 'urgent' : ''}`} style={{ fontSize: '1.6rem' }}>
                        {display}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="eyebrow" style={{ color: 'rgba(243,236,221,.5)' }}>Bids</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', color: '#C89B3C', fontWeight: 700 }}>
                        {lot.bidCount}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card-body">
                {/* Current price */}
                <div style={{ marginBottom: 16 }}>
                  <div className="eyebrow">{lot.currentBid ? 'Current Bid' : 'Starting Bid'}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 700, color: '#16261F' }}>
                    ₹{Number(lot.currentBid || lot.startingBid).toLocaleString('en-IN')}
                  </div>
                  <div className="lot-meta">
                    Min increment: ₹{Number(lot.minIncrement).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Qualification status */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {lot.kycVerified
                    ? <span className="badge badge-reserve">✓ KYC Verified</span>
                    : <span className="badge badge-pending">KYC Required</span>
                  }
                  {lot.emdRequired && (
                    lot.emdConfirmed
                      ? <span className="badge badge-reserve">✓ EMD Confirmed</span>
                      : <span className="badge badge-pending">EMD ₹{Number(lot.emdRequired).toLocaleString('en-IN')}</span>
                  )}
                </div>

                {isLive && (
                  <>
                    {/* Bid input */}
                    <div className="form-group">
                      <label className="form-label">Your Bid (₹)</label>
                      <input className="form-input" type="number" value={bidAmount}
                        min={minBid} step={Number(lot.minIncrement)}
                        onChange={e => setBidAmount(e.target.value)} />
                      <div className="lot-meta">Minimum: ₹{minBid.toLocaleString('en-IN')}</div>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', marginBottom: 10 }}
                      onClick={placeBid} disabled={placing || Number(bidAmount) < minBid}>
                      {placing ? 'Placing…' : `Place Bid · ₹${Number(bidAmount).toLocaleString('en-IN')}`}
                    </button>

                    {/* Quick bid buttons */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                      {[1, 2, 5].map(mult => {
                        const amt = minBid + (mult - 1) * Number(lot.minIncrement);
                        return (
                          <button key={mult} className="btn btn-outline btn-sm"
                            style={{ flex: 1, fontSize: '0.72rem' }}
                            onClick={() => setBidAmount(amt)}>
                            ₹{amt.toLocaleString('en-IN')}
                          </button>
                        );
                      })}
                    </div>

                    {/* Proxy bid */}
                    <button className="btn btn-dark btn-sm" style={{ width: '100%' }}
                      onClick={() => setShowProxy(!showProxy)}>
                      {showProxy ? 'Cancel' : 'Set Proxy Maximum'}
                    </button>

                    {showProxy && (
                      <div style={{ marginTop: 12, padding: 12, background: '#f9f6f0',
                                    borderRadius: 6, border: '1px solid #e0d8cc' }}>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 8 }}>
                          Your maximum is confidential and encrypted. Only the system uses it to bid on your behalf.
                        </div>
                        <input className="form-input" type="number" placeholder="Your maximum (₹)"
                          value={proxyMax} onChange={e => setProxyMax(e.target.value)}
                          style={{ marginBottom: 8 }} />
                        <button className="btn btn-primary btn-sm" style={{ width: '100%' }}
                          onClick={setProxy} disabled={!proxyMax}>
                          Confirm Proxy Maximum
                        </button>
                      </div>
                    )}
                  </>
                )}

                {lot.status === 'PREVIEW' && (
                  <div style={{ textAlign: 'center', padding: '16px 0', color: '#888', fontSize: '0.85rem' }}>
                    Preview period · Bidding opens {new Date(lot.startAt).toLocaleDateString('en-IN')}
                  </div>
                )}

                {/* Seller info */}
                <div className="divider" />
                <div className="lot-meta">Seller: {lot.sellerName}</div>
                {lot.buyerPremiumPct && (
                  <div className="lot-meta">Buyer's Premium: {lot.buyerPremiumPct}% + 18% GST</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DevFooter screenNum={3} screenName="Lot Detail" subLabel="Bid Panel & Gallery" />
    </div>
  );
}
