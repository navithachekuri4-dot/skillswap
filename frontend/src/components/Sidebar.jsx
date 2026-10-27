import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, BookOpen, Inbox, Calendar,
  User, Search, LogOut, Zap, MessageSquare,
  ChevronRight
} from 'lucide-react';
import Avatar from './Avatar';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/skills', icon: BookOpen, label: 'My Skills' },
  { to: '/browse', icon: Search, label: 'Browse' },
  { to: '/proposals', icon: MessageSquare, label: 'Proposals', badgeKey: 'proposals' },
  { to: '/sessions', icon: Calendar, label: 'Sessions' },
  { to: '/profile', icon: User, label: 'My Profile' },
];

const Sidebar = ({ pendingCount, open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <NavLink to="/dashboard" className="sidebar-logo" onClick={onClose}>
        <div className="sidebar-logo-icon">
          <Zap size={18} fill="white" />
        </div>
        <span className="sidebar-logo-text">SkillSwap</span>
      </NavLink>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Menu</span>
        {NAV_ITEMS.map(({ to, icon: Icon, label, badgeKey }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Icon className="nav-icon" />
            <span>{label}</span>
            {badgeKey === 'proposals' && pendingCount > 0 && (
              <span className="nav-badge">{pendingCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user" onClick={() => { navigate('/profile'); onClose?.(); }}>
            <Avatar name={user.name} size="sm" />
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{user.college || 'Student'}</div>
            </div>
            <ChevronRight size={14} color="var(--text-muted)" />
          </div>
        )}
        <button
          className="nav-link btn-ghost"
          style={{ width: '100%', marginTop: 4, color: 'var(--error)' }}
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
