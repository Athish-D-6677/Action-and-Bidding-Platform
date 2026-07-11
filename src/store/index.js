import { configureStore, createSlice } from '@reduxjs/toolkit';

// ── Auth Slice ────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('pp_user') || 'null'),
    token: localStorage.getItem('pp_token') || null,
    refreshToken: localStorage.getItem('pp_refresh') || null,
  },
  reducers: {
    setCredentials(state, { payload }) {
      state.user = { userId: payload.userId, role: payload.role, fullName: payload.fullName };
      state.token = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      localStorage.setItem('pp_token', payload.accessToken);
      localStorage.setItem('pp_refresh', payload.refreshToken);
      localStorage.setItem('pp_user', JSON.stringify(state.user));
    },
    logout(state) {
      state.user = null; state.token = null; state.refreshToken = null;
      localStorage.removeItem('pp_token');
      localStorage.removeItem('pp_refresh');
      localStorage.removeItem('pp_user');
    },
  },
});

// ── Auction Slice ─────────────────────────────────────────────────────────────
const auctionSlice = createSlice({
  name: 'auction',
  initialState: {
    activeLot: null,
    currentBid: null,
    minNextBid: null,
    bidCount: 0,
    endAt: null,
    reserveMet: false,
    extensionsUsed: 0,
    leadingBidder: null,
    eventType: null,
  },
  reducers: {
    setActiveLot(state, { payload }) {
      Object.assign(state, payload);
    },
    applyBidUpdate(state, { payload }) {
      state.currentBid    = payload.currentBid;
      state.minNextBid    = payload.minNextBid;
      state.bidCount      = payload.bidCount;
      state.endAt         = payload.endAt;
      state.reserveMet    = payload.reserveMet;
      state.leadingBidder = payload.leadingBidderName;
      state.eventType     = payload.eventType;
    },
    clearAuction(state) {
      Object.assign(state, { activeLot: null, currentBid: null, bidCount: 0 });
    },
  },
});

// ── Bid History Slice ─────────────────────────────────────────────────────────
const bidHistorySlice = createSlice({
  name: 'bidHistory',
  initialState: { bids: [] },
  reducers: {
    setBidHistory(state, { payload }) { state.bids = payload; },
    prependBid(state, { payload }) {
      state.bids = [payload, ...state.bids].slice(0, 50);
    },
  },
});

// ── Watchlist Slice ───────────────────────────────────────────────────────────
const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState: { lotIds: [] },
  reducers: {
    setWatchlist(state, { payload }) { state.lotIds = payload.map(w => w.lot?.id || w); },
    toggleWatchlist(state, { payload: lotId }) {
      const idx = state.lotIds.indexOf(lotId);
      if (idx >= 0) state.lotIds.splice(idx, 1);
      else state.lotIds.push(lotId);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const { setActiveLot, applyBidUpdate, clearAuction } = auctionSlice.actions;
export const { setBidHistory, prependBid } = bidHistorySlice.actions;
export const { setWatchlist, toggleWatchlist } = watchlistSlice.actions;

export const selectAuth    = s => s.auth;
export const selectAuction = s => s.auction;
export const selectBids    = s => s.bidHistory.bids;
export const selectWatchlist = s => s.watchlist.lotIds;

export default configureStore({
  reducer: {
    auth:       authSlice.reducer,
    auction:    auctionSlice.reducer,
    bidHistory: bidHistorySlice.reducer,
    watchlist:  watchlistSlice.reducer,
  },
});
