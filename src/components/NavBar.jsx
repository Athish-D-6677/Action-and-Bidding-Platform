import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectAuth, selectWatchlist } from '../store';

export default function NavBar() {
  const { user } = useSelector(selectAuth);
  const watchlist = useSelector(selectWatchlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const roleLinks = {
    SELLER:          [{ to: '/seller', label: 'Seller Portal' }],
    AUCTIONEER:      [{ to: '/auctioneer', label: 'Console' }],
    ADMIN:           [{ to: '/admin', label: 'Admin' }],
    FINANCE_MANAGER: [{ to: '/admin', label: 'Finance' }],
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoAccent}>Paddle</span>
          <span style={styles.logoDivider}> & </span>
          <span>Post</span>
        </Link>

        {/* Center links */}
        <div style={styles.links}>
          <Link to="/catalog" style={styles.link}>Browse Lots</Link>
          {user && <Link to="/my-bids" style={styles.link}>My Bids</Link>}
          {user && roleLinks[user.role]?.map(l => (
            <Link key={l.to} to={l.to} style={styles.link}>{l.label}</Link>
          ))}
        </div>

        {/* Right side */}
        <div style={styles.right}>
          {user && (
            <Link to="/catalog" style={styles.watchlistBtn}>
              <span>♡</span>
              {watchlist.length > 0 && (
                <span style={styles.badge}>{watchlist.length}</span>
              )}
            </Link>
          )}
          {user ? (
            <div style={styles.userMenu}>
              <button style={styles.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <span style={styles.avatar}>{user.fullName?.[0] || 'U'}</span>
                <span style={styles.userName}>{user.fullName?.split(' ')[0]}</span>
                <span>▾</span>
              </button>
              {menuOpen && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownRole}>{user.role}</div>
                  <button style={styles.dropdownItem} onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: '#fff', borderBottom: '1px solid #e0d8cc',
    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
  },
  inner: {
    maxWidth: 1280, margin: '0 auto', padding: '0 24px',
    height: 60, display: 'flex', alignItems: 'center', gap: 24,
  },
  logo: {
    fontFamily: 'Georgia, serif', fontSize: '1.15rem', fontWeight: 700,
    color: '#16261F', textDecoration: 'none', flexShrink: 0,
  },
  logoAccent: { color: '#C89B3C' },
  logoDivider: { color: '#888' },
  links: { display: 'flex', gap: 4, flex: 1 },
  link: {
    padding: '6px 12px', borderRadius: 4,
    color: '#555', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
    transition: 'color .15s',
  },
  right: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  watchlistBtn: {
    position: 'relative', fontSize: '1.2rem', color: '#C89B3C',
    textDecoration: 'none', padding: '4px 8px',
  },
  badge: {
    position: 'absolute', top: 0, right: 0,
    background: '#D94F3D', color: '#fff',
    borderRadius: '50%', width: 16, height: 16,
    fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userMenu: { position: 'relative' },
  userBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
  },
  avatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: '#16261F', color: '#C89B3C',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.8rem', fontWeight: 700,
  },
  userName: { fontWeight: 600, color: '#1a1a1a' },
  dropdown: {
    position: 'absolute', top: '100%', right: 0, marginTop: 4,
    background: '#fff', border: '1px solid #e0d8cc', borderRadius: 6,
    boxShadow: '0 4px 16px rgba(0,0,0,.12)', minWidth: 160, zIndex: 200,
  },
  dropdownRole: {
    padding: '8px 14px', fontSize: '0.65rem', fontFamily: 'monospace',
    letterSpacing: '.08em', textTransform: 'uppercase', color: '#C89B3C',
    borderBottom: '1px solid #e0d8cc',
  },
  dropdownItem: {
    display: 'block', width: '100%', padding: '10px 14px',
    background: 'none', border: 'none', textAlign: 'left',
    fontSize: '0.85rem', cursor: 'pointer', color: '#555',
  },
};
