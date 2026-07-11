import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('pp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('pp_refresh');
      if (refresh) {
        try {
          const { data } = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
            null, { headers: { 'X-Refresh-Token': refresh } }
          );
          localStorage.setItem('pp_token', data.accessToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: data => api.post('/auth/register', data),
  login:    data => api.post('/auth/login', data),
  refresh:  token => api.post('/auth/refresh', null, { headers: { 'X-Refresh-Token': token } }),
};

// ── Lots ──────────────────────────────────────────────────────────────────────
export const lotsApi = {
  getCatalog:    params => api.get('/lots', { params }),
  getLot:        id => api.get(`/lots/${id}`),
  getClosingSoon: () => api.get('/lots/closing-soon'),
  createLot:     data => api.post('/seller/lots', data),
  getMyLots:     () => api.get('/seller/lots'),
  approveLot:    id => api.patch(`/admin/lots/${id}/approve`),
  rejectLot:     id => api.patch(`/admin/lots/${id}/reject`),
};

// ── Bids ──────────────────────────────────────────────────────────────────────
export const bidsApi = {
  placeBid:    data => api.post('/bids', data),
  setProxy:    data => api.post('/bids/proxy', data),
  getBidHistory: lotId => api.get(`/bids/lot/${lotId}`),
  getMyBids:   () => api.get('/bids/my'),
};

// ── Watchlist ─────────────────────────────────────────────────────────────────
export const watchlistApi = {
  get:    () => api.get('/watchlist'),
  add:    lotId => api.post(`/watchlist/${lotId}`),
  remove: lotId => api.delete(`/watchlist/${lotId}`),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentsApi = {
  getByLot:      lotId => api.get(`/payments/lot/${lotId}`),
  getMyPayments: () => api.get('/payments/my'),
  confirm:       (id, razorpayPaymentId, method) =>
    api.post(`/payments/${id}/confirm`, null, { params: { razorpayPaymentId, method } }),
  releaseEscrow: id => api.post(`/payments/${id}/release-escrow`),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats:      () => api.get('/admin/stats'),
  getPending:    () => api.get('/admin/lots/pending'),
  getDisputes:   () => api.get('/admin/disputes'),
  resolveDispute:(id, resolution, note) =>
    api.patch(`/admin/disputes/${id}/resolve`, null, { params: { resolution, note } }),
  approveSeller: id => api.patch(`/admin/sellers/${id}/approve`),
};

// ── Auctioneer ────────────────────────────────────────────────────────────────
export const auctioneerApi = {
  getLive:   () => api.get('/auctioneer/live'),
  openLot:   id => api.post(`/auctioneer/lots/${id}/open`),
  pauseLot:  id => api.post(`/auctioneer/lots/${id}/pause`),
  hammerLot: id => api.post(`/auctioneer/lots/${id}/hammer`),
  phoneBid:  (lotId, bidderId, amount) =>
    api.post(`/auctioneer/lots/${lotId}/phone-bid`, null, { params: { bidderId, amount } }),
};

// ── Disputes ──────────────────────────────────────────────────────────────────
export const disputesApi = {
  raise:          data => api.post('/disputes', data),
  getMy:          () => api.get('/disputes/my'),
  sellerResponse: (id, response) =>
    api.patch(`/disputes/${id}/seller-response`, null, { params: { response } }),
};

export default api;
