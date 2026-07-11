import React, { useEffect, useState } from 'react';
import { auctioneerApi, lotsApi } from '../../api';
import DevFooter from '../../components/DevFooter';
import toast from 'react-hot-toast';

export default function AuctioneerConsole() {
  const [liveLots, setLiveLots] = useState([]);
  const [queuedLots, setQueuedLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [phoneBidder, setPhoneBidder] = useState('');
  const [phoneBidAmt, setPhoneBidAmt] = useState('');

  useEffect(() => {
    auctioneerApi.getLive().then(r => setLiveLots(r.data)).catch(() => {});
    lotsApi.getCatalog({ status: 'APPROVED', size: 20 })
      .then(r => setQueuedLots(r.data.content || [])).catch(() => {});
  }, []);

  const openLot = async (lotId) => {
    try {
      await auctioneerApi.openLot(lotId);
      toast.success('Lot opened for bidding');
      auctioneerApi.getLive().then(r => setLiveLots(r.data)).catch(() => {});
    } catch (e) { toast.error('Failed to open lot'); }
  };

  const pauseLot = async (lotId) => {
    try {
      await auctioneerApi.pauseLot(lotId);
      toast.success('Lot paused');
    } catch { toast.error('Failed to pause'); }
  };

  const hammerLot = async (lotId) => {
    if (!window.confirm('Close this lot and declare a winner?')) return;
    try {
      await auctioneerApi.hammerLot(lotId);
      toast.success('Lot closed — winner notified!');
      auctioneerApi.getLive().then(r => setLiveLots(r.data)).catch(() => {});
    } catch { toast.error('Failed to close lot'); }
  };

  const submitPhoneBid = async () => {
    if (!selectedLot || !phoneBidder || !phoneBidAmt) return;
    try {
      await auctioneerApi.phoneBid(selectedLot, phoneBidder, Number(phoneBidAmt));
      toast.success('Phone bid entered');
      setPhoneBidAmt('');
    } catch (e) { toast.error(e.response?.data?.detail || 'Phone bid failed'); }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', background: '#16261F' }}>
      {/* ── Lot Sequence Sidebar ─────────────────────────────────────────── */}
      <div style={{ width: 260, borderRight: '1px solid rgba(255,255,255,.1)',
                    overflowY: 'auto', padding: '16px 0' }}>
        <div className="eyebrow" style={{ color: '#C89B3C', padding: '0 16px 12px' }}>
          Lot Sequence
        </div>

        {liveLots.length > 0 && (
          <>
            <div className="lot-meta" style={{ color: 'rgba(243,236,221,.4)', padding: '0 16px 8px' }}>
              LIVE
            </div>
            {liveLots.map(la => (
              <div key={la.id}
                onClick={() => setSelectedLot(la.lot?.id)}
                style={{
                  padding: '10px 16px', cursor: 'pointer',
                  background: selectedLot === la.lot?.id ? 'rgba(200,155,60,.15)' : 'transparent',
                  borderLeft: selectedLot === la.lot?.id ? '3px solid #C89B3C' : '3px solid transparent',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-live" style={{ fontSize: '0.55rem' }}>
                    <span className="badge-dot" />LIVE
                  </span>
                  <span style={{ color: '#F3ECDD', fontSize: '0.82rem', fontWeight: 500 }}>
                    {la.lot?.lotNumber || la.id}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {queuedLots.length > 0 && (
          <>
            <div className="lot-meta" style={{ color: 'rgba(243,236,221,.4)', padding: '12px 16px 8px' }}>
              QUEUED
            </div>
            {queuedLots.map(lot => (
              <div key={lot.id}
                onClick={() => setSelectedLot(lot.id)}
                style={{
                  padding: '10px 16px', cursor: 'pointer',
                  background: selectedLot === lot.id ? 'rgba(200,155,60,.1)' : 'transparent',
                }}>
                <div style={{ color: 'rgba(243,236,221,.7)', fontSize: '0.82rem' }}>
                  {lot.lotNumber}
                </div>
                <div style={{ color: 'rgba(243,236,221,.4)', fontSize: '0.72rem',
                               overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {lot.title}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Main Console ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: 24, overflowY: 'auto', paddingBottom: 60 }}>
        <div style={{ marginBottom: 20 }}>
          <div className="eyebrow" style={{ color: '#C89B3C', marginBottom: 4 }}>Auctioneer Console</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: '#F3ECDD' }}>
            Live Auction Control
          </h1>
        </div>

        {/* Video placeholder */}
        <div style={{ background: 'rgba(0,0,0,.4)', borderRadius: 8, aspectRatio: '16/9',
                      maxHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,.1)', marginBottom: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📹</div>
            <div className="eyebrow" style={{ color: '#C89B3C' }}>Auctioneer Stream</div>
            <div style={{ color: 'rgba(243,236,221,.4)', fontSize: '0.75rem', marginTop: 4 }}>
              Agora.io SDK — Broadcaster View
            </div>
          </div>
        </div>

        {/* Controls */}
        {selectedLot && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => openLot(selectedLot)}>
              ▶ Open Lot
            </button>
            <button className="btn btn-outline" style={{ color: '#F3ECDD', borderColor: 'rgba(243,236,221,.3)' }}
              onClick={() => pauseLot(selectedLot)}>
              ⏸ Pause Lot
            </button>
            <button className="btn btn-danger" onClick={() => hammerLot(selectedLot)}>
              🔨 Close & Hammer
            </button>
          </div>
        )}

        {/* Phone Bid Entry */}
        <div style={{ background: 'rgba(0,0,0,.3)', borderRadius: 8, padding: 20,
                      border: '1px solid rgba(255,255,255,.08)', marginBottom: 20 }}>
          <div className="eyebrow" style={{ color: '#C89B3C', marginBottom: 12 }}>Phone Bid Entry</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input placeholder="Bidder ID"
              value={phoneBidder} onChange={e => setPhoneBidder(e.target.value)}
              style={{ flex: 1, minWidth: 160, padding: '8px 12px', borderRadius: 4,
                       background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)',
                       color: '#F3ECDD', fontSize: '0.85rem' }} />
            <input placeholder="Bid Amount (₹)" type="number"
              value={phoneBidAmt} onChange={e => setPhoneBidAmt(e.target.value)}
              style={{ flex: 1, minWidth: 160, padding: '8px 12px', borderRadius: 4,
                       background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)',
                       color: '#F3ECDD', fontSize: '0.85rem' }} />
            <button className="btn btn-primary" onClick={submitPhoneBid}
              disabled={!selectedLot || !phoneBidder || !phoneBidAmt}>
              Enter Phone Bid
            </button>
          </div>
        </div>

        {/* Live stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'Live Lots',    value: liveLots.length },
            { label: 'Queued Lots',  value: queuedLots.length },
            { label: 'Total Attendees', value: liveLots.reduce((s, la) => s + (la.attendeeCount || 0), 0) },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(0,0,0,.3)', borderRadius: 8, padding: 16,
                                         border: '1px solid rgba(255,255,255,.08)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: '#C89B3C' }}>
                {s.value}
              </div>
              <div className="eyebrow" style={{ color: 'rgba(243,236,221,.5)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </main>

      <DevFooter screenNum={7} screenName="Auctioneer Console" subLabel="Live Control" />
    </div>
  );
}
