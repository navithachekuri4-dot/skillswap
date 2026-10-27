import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import UserCard from '../components/UserCard';
import ProposalModal from '../components/ProposalModal';
import Avatar from '../components/Avatar';
import {
  Calendar, ArrowRight, TrendingUp, Users, BookOpen,
  MessageSquare, Star, CheckCircle, Clock, Zap,
  AlertCircle, ChevronRight, RotateCcw
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const Skeleton = ({ h = 20, w = '100%', r = 'var(--radius)' }) => (
  <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} />
);

const Dashboard = () => {
  const { user, logout, resetDemo } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resettingDemo, setResettingDemo] = useState(false);
  const [error, setError] = useState('');
  const [proposalUser, setProposalUser] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.get();
      setData(res.data.data);
    } catch {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      setResettingDemo(true);
      await resetDemo();
      await fetchDashboard();
      toast.success('Demo data reset to initial state!');
    } catch {
      toast.error('Failed to reset demo data');
    } finally {
      setResettingDemo(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const STAT_CARDS = data ? [
    {
      label: 'Upcoming Sessions',
      value: data.stats.upcomingSessions,
      icon: Calendar,
      bg: 'var(--primary-50)',
      color: 'var(--primary)',
      desc: 'Scheduled ahead',
      link: '/sessions'
    },
    {
      label: 'Pending Proposals',
      value: data.stats.pendingProposalsReceived,
      icon: MessageSquare,
      bg: 'var(--warning-light)',
      color: 'var(--warning)',
      desc: 'Awaiting your response',
      link: '/proposals'
    },
    {
      label: 'Completed Sessions',
      value: data.stats.completedSessions,
      icon: CheckCircle,
      bg: 'var(--success-light)',
      color: 'var(--success)',
      desc: 'Skills exchanged',
      link: '/sessions?status=completed'
    },
    {
      label: 'Reputation Score',
      value: data.stats.reputationScore > 0 ? `${Number(data.stats.reputationScore).toFixed(1)}★` : '—',
      icon: Star,
      bg: 'var(--warning-light)',
      color: '#F59E0B',
      desc: `From ${data.stats.totalReviews} reviews`,
      link: '/profile'
    }
  ] : [];

  if (error) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-icon"><AlertCircle size={28} /></div>
          <h3 className="empty-title">Failed to load dashboard</h3>
          <p className="empty-description">{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const isAllZero = data &&
    data.stats.upcomingSessions === 0 &&
    data.stats.pendingProposalsReceived === 0 &&
    data.stats.completedSessions === 0 &&
    data.stats.reputationScore === 0;

  return (
    <div className="page-content">
      {/* Demo Mode Notice */}
      {user?.isDemo && (
        <div style={{
          marginBottom: 20, padding: '14px 18px', background: 'var(--primary-50)',
          border: '1px solid #BFDBFE', borderRadius: 'var(--radius)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={20} color="var(--primary)" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Demo Student: {user?.name}</span>
                <span className="badge" style={{ fontSize: 10.5, background: 'white', color: '#1E40AF', border: '1px solid #93C5FD' }}>
                  {user?.college || 'Scaler School of Technology'} · {user?.year || 'Second Year'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#3B82F6', marginTop: 2 }}>
                Live MongoDB demo records. Seeded proposals, sessions & reviews are simulated data for evaluation.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleResetDemo}
              disabled={resettingDemo}
              style={{ fontSize: 12, background: 'white', borderColor: '#BFDBFE', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: 5 }}
              title="Reset seeded demo proposals, sessions, and reviews to fresh state"
            >
              {resettingDemo ? <span className="spin">◌</span> : <RotateCcw size={12} />}
              {resettingDemo ? 'Resetting...' : 'Reset Demo Data'}
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              style={{ fontSize: 12, background: 'white', borderColor: '#BFDBFE', color: '#1E40AF' }}
            >
              Exit Demo
            </button>
          </div>
        </div>
      )}

      {/* New Real User — Get Started Nudge */}
      {!user?.isDemo && isAllZero && (
        <div style={{
          marginBottom: 20, padding: '14px 18px', background: 'var(--gray-50)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', background: 'var(--primary-50)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={18} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                Welcome to SkillSwap! Your real stats will appear here.
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Browse peers, send a proposal, or complete your profile to start exchanging skills.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/profile" className="btn btn-outline btn-sm">
              Complete Profile
            </Link>
            <Link to="/browse" className="btn btn-primary btn-sm">
              Browse Skills
            </Link>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={user?.name} size="lg" />
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {greeting}, {user?.name?.split(' ')[0]}! 👋
              {user?.isDemo && (
                <span className="badge badge-primary" style={{ fontSize: 11, padding: '2px 8px' }}>
                  Demo Student
                </span>
              )}
            </h1>
            <p className="page-subtitle">
              Here's what's happening with your skill exchange today
            </p>
          </div>
        </div>

        {/* Profile Completeness Alert */}
        {data && data.stats.profileComplete < 80 && (
          <div
            style={{
              marginTop: 16, padding: '12px 16px', background: 'var(--warning-light)',
              border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer'
            }}
            onClick={() => navigate('/profile')}
          >
            <AlertCircle size={16} color="var(--warning)" />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>
                Your profile is {data.stats.profileComplete}% complete.{' '}
              </span>
              <span style={{ fontSize: 13, color: '#B45309' }}>
                Complete it to get better matches!
              </span>
            </div>
            <div className="progress-bar-wrap" style={{ width: 100 }}>
              <div className="progress-bar" style={{
                width: `${data.stats.profileComplete}%`,
                background: 'linear-gradient(90deg, var(--warning), #F59E0B)'
              }} />
            </div>
            <ChevronRight size={14} color="var(--warning)" />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="skeleton-card" style={{ height: 100 }} />)
        ) : (
          STAT_CARDS.map(({ label, value, icon: Icon, bg, color, desc, link }) => (
            <div key={label} className="stat-card" onClick={() => navigate(link)} style={{ cursor: 'pointer' }}>
              <div className="stat-icon-wrap" style={{ background: bg }}>
                <Icon size={20} color={color} />
              </div>
              <div className="stat-info">
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
                <div className="stat-desc">{desc}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Upcoming Sessions */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Upcoming Sessions</div>
              <div className="card-subtitle">Your next scheduled exchanges</div>
            </div>
            <Link to="/sessions" className="btn btn-outline btn-sm">
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2].map(i => <Skeleton key={i} h={60} r="var(--radius)" />)}
            </div>
          ) : data?.upcomingSessions?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div className="empty-icon" style={{ width: 44, height: 44 }}><Calendar size={20} /></div>
              <p className="empty-description" style={{ marginBottom: 12 }}>No sessions scheduled yet</p>
              <Link to="/browse" className="btn btn-primary btn-sm">Find a match</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.upcomingSessions.map(session => {
                const other = session.participants?.find(p => p._id !== user?._id);
                return (
                  <div
                    key={session._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                      background: 'var(--gray-50)', borderRadius: 'var(--radius)', cursor: 'pointer',
                      border: '1px solid var(--border)'
                    }}
                    onClick={() => navigate(`/sessions/${session._id}`)}
                  >
                    <div style={{
                      width: 44, height: 44, background: 'var(--primary-50)', borderRadius: 'var(--radius)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>
                        {format(new Date(session.scheduledAt), 'd')}
                      </span>
                      <span style={{ fontSize: 9, color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 600 }}>
                        {format(new Date(session.scheduledAt), 'MMM')}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {session.skill}
                        {session.isDemo && (
                          <span style={{ fontSize: 10, background: '#EFF6FF', color: 'var(--primary)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                            Demo
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 6, marginTop: 2 }}>
                        <Clock size={11} /> {format(new Date(session.scheduledAt), 'h:mm a')}
                        {other && <> · with {other.name} {other.isDemo && <span style={{ color: 'var(--primary)', fontSize: 11 }}>(Demo)</span>}</>}
                      </div>
                    </div>
                    <span className={`badge ${session.status === 'rescheduled' ? 'badge-warning' : 'badge-success'}`}>
                      {session.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Quick Actions</div>
              <div className="card-subtitle">Jump right in</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Post a Skill Offer', desc: 'Share what you can teach', link: '/skills', color: 'var(--primary)', icon: BookOpen },
              { label: 'Browse Skill Offers', desc: 'Find someone to learn from', link: '/browse', color: 'var(--purple)', icon: Zap },
              { label: 'View My Proposals', desc: 'Check pending requests', link: '/proposals', color: 'var(--warning)', icon: MessageSquare, badge: data?.stats?.pendingProposalsReceived },
              { label: 'Update Profile', desc: 'Improve your matching', link: '/profile', color: 'var(--success)', icon: TrendingUp }
            ].map(({ label, desc, link, color, icon: Icon, badge }) => (
              <div
                key={label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                  border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
                  cursor: 'pointer', transition: 'var(--transition)'
                }}
                className="card"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                  cursor: 'pointer', margin: 0, boxShadow: 'none'
                }}
                onClick={() => navigate(link)}
                onMouseEnter={e => e.currentTarget.style.borderColor = color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius)',
                  background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
                </div>
                {badge > 0 && <span className="nav-badge">{badge}</span>}
                <ChevronRight size={14} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Matches */}
      <div>
        <div className="card-header" style={{ marginBottom: 16 }}>
          <div>
            <h2 className="card-title" style={{ fontSize: 17 }}>Recommended Matches</h2>
            <p className="card-subtitle">Students who match your skill interests</p>
          </div>
          <Link to="/browse" className="btn btn-outline btn-sm">
            Browse all <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="grid-auto">
            {[1,2,3].map(i => <Skeleton key={i} h={180} />)}
          </div>
        ) : data?.recommendedMatches?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Users size={28} /></div>
            <h3 className="empty-title">No matches found yet</h3>
            <p className="empty-description">
              Add skills you offer and skills you want to learn to discover matches!
            </p>
            <Link to="/profile" className="btn btn-primary">Update Skills</Link>
          </div>
        ) : (
          <div className="grid-auto">
            {data.recommendedMatches.map(match => (
              <UserCard key={match._id} user={match} onPropose={setProposalUser} />
            ))}
          </div>
        )}
      </div>

      <ProposalModal
        isOpen={!!proposalUser}
        targetUser={proposalUser}
        onClose={() => setProposalUser(null)}
      />
    </div>
  );
};

export default Dashboard;
