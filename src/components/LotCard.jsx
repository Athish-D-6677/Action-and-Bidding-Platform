import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWatchlist, selectWatchlist } from '../store';
import { watchlistApi } from '../api';
import { useCountdown } from '../hooks/useCountdown';

const PLACEHOLDER_COLORS = ['sand', 'sage', 'dusty-rose', 'powder-blue'];
const STATUS_BADGE = {
  LIVE:    { cls: 'badge-live',    label: 'Live Now', dot: true },
  PREVIEW: { cls: 'badge-preview', label: 'Preview',  dot: false },
  SOLD:    { cls: 'badge-sold',    label: 'Sold',     dot: false },
  CLOSED:  { cls: 'badge-sold',    label: 'Closed',   dot: false },
  APPROVED:{ cls: 'badge-pending', label: 'Upcoming', dot: false },
};
const TYPE_BADGE = {
  DUTCH:  { cls: 'badge-dutch',  label: 'Dutch' },
  SEALED: { cls: 'badge-sealed', label: 'Sealed' },
  REVERSE:{ cls: 'badge-sealed', label: 'Reverse' },
};

export default function LotCard({ lot, index = 0 }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const watchlist = useSelector(selectWatchlist);
  const isWatched = watchlist.includes(lot.id);
  const { display, urgent } = useCountdown(lot.endAt);
  const colorClass = PLACEHOLDER_COLORS[index % 4];
  const statusBadge = STATUS_BADGE[lot.status];
  const typeBadge = TYPE_BADGE[lot.auctionType];

  const handleWatch = async e => {
    e.stopPropagation();
    dispatch(toggleWatchlist(lot.id));
    try {
      isWatched ? await watchlistApi.remove(lot.id) : await watchlistApi.add(lot.id);
    } catch { dispatch(toggleWatchlist(lot.id)); } // revert on error
  };

  const displayPrice = lot.currentBid || lot.startingBid;

  return (
    <div className="card lot-card" onClick={() => navigate(`/lot/${lot.id}`)}>
      {/* Image / Placeholder */}
      {lot.thumbnailUrl ? (
        <img src={lot.thumbnailUrl} alt={lot.title} className="lot-card-img" />
      ) : (
        <div className={`lot-card-img-placeholder ${colorClass}`}>
          <span>{lot.lotNumber}</span>
        </div>
      )}

      <div className="card-body">
        {/* Top row: lot token + badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div className="lot-token">{lot.lotNumber?.replace('LOT-', '')}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
            {statusBadge && (
              <span className={`badge ${statusBadge.cls}`}>
                {statusBadge.dot && <span className="badge-dot" />}
                {statusBadge.label}
              </span>
            )}
            {typeBadge && (
              <span className={`badge ${typeBadge.cls}`}>{typeBadge.label}</span>
            )}
          </div>
          <button
            onClick={handleWatch}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
                     fontSize: '1.1rem', color: isWatched ? '#C89B3C' : '#ccc' }}
            title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {isWatched ? '♥' : '♡'}
          </button>
        </div>

        {/* Title */}
        <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 4,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {lot.title}
        </div>

        {/* Category */}
        <div className="lot-meta" style={{ marginBottom: 10 }}>{lot.category}</div>

        <div className="divider" style={{ margin: '8px 0' }} />

        {/* Price row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="eyebrow">{lot.currentBid ? 'Current Bid' : 'Starting Bid'}</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.05rem', color: '#16261F' }}>
              ₹{Number(displayPrice).toLocaleString('en-IN')}
            </div>
          </div>
          {lot.endAt && lot.status === 'LIVE' && (
            <div style={{ textAlign: 'right' }}>
              <div className="eyebrow">Ends In</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem',
                            color: urgent ? '#D94F3D' : '#16261F', fontWeight: 700 }}>
                {display}
              </div>
            </div>
          )}
        </div>

        {/* Bid count */}
        {lot.bidCount > 0 && (
          <div className="lot-meta" style={{ marginTop: 6 }}>
            {lot.bidCount} bid{lot.bidCount !== 1 ? 's' : ''}
            {lot.emdRequired && ` · EMD ₹${Number(lot.emdRequired).toLocaleString('en-IN')}`}
          </div>
        )}
      </div>
    </div>
  );
}
