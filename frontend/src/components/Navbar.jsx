import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import Avatar from './Avatar';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifsRef = useRef(null);
  const profileRef = useRef(null);

  const unread = user?.notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    if (user?.notifications) {
      setNotifications([...user.notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10));
    }
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleMarkAllRead = async () => {
    try {
      await usersAPI.markAllRead();
      await refreshUser();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <button className="hamburger-btn" onClick={onMenuToggle} aria-label="Toggle menu">
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <form className="navbar-search" onSubmit={handleSearch}>
        <div className="search-input-wrap">
          <Search className="search-icon" />
          <input
            className="search-input"
            placeholder="Search skills, students..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search"
          />
        </div>
      </form>

      <div className="navbar-actions">
        {/* Notifications */}
        <div className="dropdown" ref={notifsRef}>
          <button
            id="notif-btn"
            className="icon-btn"
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            aria-label="Notifications"
          >
            <Bell size={17} />
            {unread > 0 && <span className="badge">{unread > 9 ? '9+' : unread}</span>}
          </button>
          {showNotifs && (
            <div className="notif-panel">
              <div className="notif-header">
                <span>Notifications</span>
                {unread > 0 && (
                  <button
                    className="btn-ghost btn btn-xs"
                    style={{ fontSize: 11 }}
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No notifications yet
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div
                    key={i}
                    className={`notif-item${!n.read ? ' unread' : ''}`}
                    onClick={() => {
                      if (n.link) navigate(n.link);
                      setShowNotifs(false);
                    }}
                  >
                    <div className={`notif-icon ${
                      n.type === 'proposal' ? 'badge-primary' :
                      n.type === 'review' ? 'badge-warning' :
                      n.type === 'session' ? 'badge-success' : 'badge-gray'
                    }`}>
                      <Bell size={14} />
                    </div>
                    <div>
                      <div className="notif-text">{n.message}</div>
                      <div className="notif-time">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="dropdown" ref={profileRef}>
          <div
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
            role="button"
            aria-label="Profile menu"
          >
            <Avatar name={user?.name} size="sm" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.name}
            </span>
          </div>
          {showProfile && (
            <div className="dropdown-menu">
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{user?.name}</span>
                  {user?.isDemo && (
                    <span className="badge" style={{ fontSize: 9.5, padding: '1px 5px', background: 'var(--purple-light)', color: 'var(--purple)' }}>
                      Demo
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              <button className="dropdown-item" onClick={() => { navigate('/profile'); setShowProfile(false); }}>
                My Profile
              </button>
              <button className="dropdown-item" onClick={() => { navigate('/sessions'); setShowProfile(false); }}>
                My Sessions
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
