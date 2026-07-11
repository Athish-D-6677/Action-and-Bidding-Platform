import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store, { selectAuth, setWatchlist } from './store';
import { watchlistApi } from './api';
import { useFCM } from './hooks/useFCM';

import './styles/global.css';

import NavBar from './components/NavBar';
import RequireAuth from './components/RequireAuth';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import LotDetail from './pages/LotDetail';
import LiveAuction from './pages/LiveAuction';
import MyBids from './pages/MyBids';
import SellerPortal from './pages/SellerPortal';
import AuctioneerConsole from './pages/AuctioneerConsole';
import AdminConsole from './pages/AdminConsole';
import Payment from './pages/Payment';
import Analytics from './pages/Analytics';
import { Login, Register } from './pages/Auth';

function AppRoutes() {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);

  useFCM(user?.userId);

  // Load watchlist on login
  useEffect(() => {
    if (user) {
      watchlistApi.get()
        .then(r => dispatch(setWatchlist(r.data)))
        .catch(() => {});
    }
  }, [user, dispatch]);

  return (
    <>
      <NavBar />
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Home />} />
        <Route path="/catalog"  element={<Catalog />} />
        <Route path="/lot/:id"  element={<LotDetail />} />
        <Route path="/live/:id" element={<LiveAuction />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated — any role */}
        <Route path="/my-bids" element={
          <RequireAuth><MyBids /></RequireAuth>
        } />
        <Route path="/payment/:lotId" element={
          <RequireAuth><Payment /></RequireAuth>
        } />

        {/* Seller */}
        <Route path="/seller" element={
          <RequireAuth roles={['SELLER','ADMIN']}><SellerPortal /></RequireAuth>
        } />

        {/* Auctioneer */}
        <Route path="/auctioneer" element={
          <RequireAuth roles={['AUCTIONEER','ADMIN']}><AuctioneerConsole /></RequireAuth>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <RequireAuth roles={['ADMIN','FINANCE_MANAGER']}><AdminConsole /></RequireAuth>
        } />

        {/* Analytics */}
        <Route path="/analytics" element={
          <RequireAuth roles={['ADMIN','FINANCE_MANAGER','AUCTIONEER']}><Analytics /></RequireAuth>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              background: '#16261F',
              color: '#F3ECDD',
            },
            success: { iconTheme: { primary: '#C89B3C', secondary: '#16261F' } },
            error:   { iconTheme: { primary: '#D94F3D', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </Provider>
  );
}
