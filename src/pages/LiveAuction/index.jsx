import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { lotsApi, bidsApi } from '../../api';
import { selectAuth, selectAuction, selectBids, setBidHistory } from '../../store';
import { useAuctionSocket } from '../../hooks/useAuctionSocket';
import { useCountdown } from '../../hooks/useCountdown';
import { useFirestoreChat } from '../../hooks/useFirestoreChat';
import { useFirestoreViewers } from '../../hooks/useFirestoreViewers';
import DevFooter from '../../components/DevFooter';

export default function LiveAuction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const auction = useSelector(selectAuction);
  const bids = useSelector(selectBids);

  const [lot, setLot] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [placing, setPlacing] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const chatRef = useRef(null);

  const { messages: chatLog, sendMessage } = useFirestoreChat(id);
  const viewerCount = useFirestoreViewers(id, user?.userId);

  useAuctionSocket(id);
  const endAt = auction.endAt || lot?.endAt;
  const { display, urgent, expired } = useCountdown(endAt);

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

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatLog]);

  const currentBid = auction.currentBid || lot?.currentBid || lot?.startingBid;
  const minIncrement = lot?.minIncrement || 500;
  const minBid = currentBid ? Number(currentBid) + Number(minIncrement) : Number(lot?.startingBid || 0);

  const placeBid = async () => {
    if (!user) { navigate('/login'); return; }
    setPlacing(true);
    try {
      await bidsApi.placeBid({ lotId: id, amount: Number(bidAmount) });
      toast.success(`Bid ₹${Number(bidAmount).toLocaleString('en-IN')} placed!`);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Bid failed');
    } finally { setPlacing(false); }
  };

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    sendMessage(chatMsg, user?.fullName?.split(' ')[0] || 'Guest');
    setChatMsg('');
  };

  if (!lot) return <div style={{ padding: 60, textAlign: 'center', color: '#888' }}>Loading auction room…</div>;

  const extensionsUsed = auction.extensionsUsed || 0;

  return (
    <div style={{ background: '#16261F', minHeight: 'calc(100vh - 60px)', paddingBottom: 48 }}>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div style={styles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="lot-token">{lot.lotNumber?.replace('LOT-','')}</div>
          <div>
            <div className="eyebrow" style={{ color: '#C89B3C' }}>
              {lot.lotNumber} · Live Auction
            </div>
            <div style={{ color: '#F3ECDD', fontFamily: 'Georgia, serif', fontSize: '1rem' }}>
              {lot.title}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span className="badge badge-live"><span className="badge-dot" />Live</span>
          <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(243,236,221,.5)' }}>
            👁 {viewerCount} watching
          </span>
          {extensionsUsed > 0 && (
            <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#C89B3C' }}>
              {extensionsUsed} of 3 extensions used
            </span>
          )}
        </div>
      </div>

      <div style={styles.layout}>
        {/* ── Video + Bid Panel ────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={styles.videoBox}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 8 }}>📹</div>
              <div className="eyebrow" style={{ color: '#C89B3C', marginBottom: 4 }}>Live Stream</div>
              <div style={{ color: 'rgba(243,236,221,.5)', fontSize: '0.8rem' }}>
                Agora.io / Jitsi stream loads here
              </div>
              <div className="lot-meta" style={{ color: 'rgba(243,236,221,.4)', marginTop: 8 }}>
                Channel: paddlepost-{lot.lotNumber?.toLowerCase()}
              </div>
            </div>
          </div>

          <div style={styles.bidStrip}>
            <div>
              <div className="eyebrow" style={{ color: 'rgba(243,236,221,.5)' }}>Current Bid</div>
              <div style={{ fontFamily: 'monospace', fontSize: '2.2rem', fontWeight: 700, color: '#F3ECDD' }}>
                ₹{Number(currentBid || 0).toLocaleString('en-IN')}
              </div>
              {auction.leadingBidder && (
                <div className="lot-meta" style={{ color: '#C89B3C' }}>
                  Leading: {auction.leadingBidder}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="eyebrow" style={{ color: 'rgba(243,236,221,.5)' }}>Time Remaining</div>
              <div className={`countdown ${urgent ? 'urgent' : ''}`}>
                {expired ? 'CLOSED' : display}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="eyebrow" style={{ color: 'rgba(243,236,221,.5)' }}>Total Bids</div>
              <div style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: '#C89B3C' }}>
                {auction.bidCount || lot.bidCount || 0}
              </div>
            </div>
          </div>

          {!expired && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[0, 1, 2, 4].map(extra => {
                const amt = minBid + extra * Number(minIncrement);
                return (
                  <button key={extra} className="btn btn-outline btn-sm btn-pill"
                    style={{ color: '#F3ECDD', borderColor: 'rgba(243,236,221,.3)' }}
                    onClick={() => setBidAmount(amt)}>
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                );
              })}
              <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                <input
                  type="number" value={bidAmount} min={minBid}
                  onChange={e => setBidAmount(e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 4,
                           background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)',
                           color: '#F3ECDD', fontFamily: 'monospace', fontSize: '0.9rem' }}
                />
                <button className="btn btn-primary" onClick={placeBid}
                  disabled={placing || Number(bidAmount) < minBid || expired}>
                  {placing ? '…' : 'Bid'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Panel: Bid Feed + Chat ─────────────────────────────── */}
        <div style={styles.rightPanel}>
          <div style={{ marginBottom: 16 }}>
            <div className="eyebrow" style={{ color: '#C89B3C', marginBottom: 10 }}>Live Bid Feed</div>
            <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {bids.slice(0, 15).map((b, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '6px 10px', borderRadius: 4,
                  background: i === 0 ? 'rgba(200,155,60,.2)' : 'rgba(255,255,255,.05)',
                  fontSize: '0.8rem',
                }}>
                  <span style={{ color: 'rgba(243,236,221,.7)' }}>
                    {b.bidderName}
                    <span style={{ fontFamily: 'monospace', fontSize: '0.65rem',
                                   color: 'rgba(243,236,221,.4)', marginLeft: 4 }}>
                      {b.bidType}
                    </span>
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700,
                                 color: i === 0 ? '#C89B3C' : '#F3ECDD' }}>
                    ₹{Number(b.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
              {bids.length === 0 && (
                <div style={{ color: 'rgba(243,236,221,.4)', fontSize: '0.8rem', textAlign: 'center', padding: 12 }}>
                  No bids yet
                </div>
              )}
            </div>
          </div>

          <div className="divider" style={{ borderColor: 'rgba(255,255,255,.1)' }} />

          <div className="eyebrow" style={{ color: '#C89B3C', marginBottom: 10 }}>Bidder Chat</div>
          <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', marginBottom: 10,
                                      display: 'flex', flexDirection: 'column', gap: 6 }}>
            {chatLog.length === 0 && (
              <div style={{ color: 'rgba(243,236,221,.3)', fontSize: '0.75rem', textAlign: 'center', padding: 8 }}>
                No messages yet
              </div>
            )}
            {chatLog.map(c => (
              <div key={c.id} style={{ fontSize: '0.78rem' }}>
                <span style={{ color: '#C89B3C', fontWeight: 600 }}>{c.userName}: </span>
                <span style={{ color: 'rgba(243,236,221,.8)' }}>{c.text}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Type a message…"
              style={{ flex: 1, padding: '6px 10px', borderRadius: 4,
                       background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)',
                       color: '#F3ECDD', fontSize: '0.8rem' }} />
            <button className="btn btn-primary btn-sm" onClick={sendChat}>Send</button>
          </div>
        </div>
      </div>

      <DevFooter screenNum={4} screenName="Live Auction Room" subLabel="Real-Time Bidding" />
    </div>
  );
}

const styles = {
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,.1)',
  },
  layout: {
    display: 'flex', gap: 20, padding: '20px 24px',
    maxWidth: 1280, margin: '0 auto',
  },
  videoBox: {
    background: 'rgba(0,0,0,.4)', borderRadius: 8,
    aspectRatio: '16/9', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    border: '1px solid rgba(255,255,255,.1)',
  },
  bidStrip: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', background: 'rgba(0,0,0,.3)',
    borderRadius: 8, border: '1px solid rgba(255,255,255,.08)',
  },
  rightPanel: {
    width: 300, flexShrink: 0,
    background: 'rgba(0,0,0,.3)', borderRadius: 8,
    padding: 16, display: 'flex', flexDirection: 'column',
    border: '1px solid rgba(255,255,255,.08)',
    maxHeight: 'calc(100vh - 160px)',
  },
};
