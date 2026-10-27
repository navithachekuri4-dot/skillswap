import { useState, useEffect } from 'react';
import { proposalsAPI, sessionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { CheckCircle, XCircle, Clock, X, Calendar, Send, AlertCircle, MessageSquare } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { label: 'Pending', badge: 'badge-warning', icon: Clock },
  accepted: { label: 'Accepted', badge: 'badge-success', icon: CheckCircle },
  rejected: { label: 'Declined', badge: 'badge-error', icon: XCircle },
  cancelled: { label: 'Cancelled', badge: 'badge-gray', icon: X },
  completed: { label: 'Completed', badge: 'badge-primary', icon: CheckCircle }
};

const AcceptModal = ({ isOpen, proposal, onClose, onSuccess }) => {
  const [form, setForm] = useState({ scheduledAt: '', duration: 60, mode: 'Online', meetLink: '', location: '' });
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!form.scheduledAt) { toast.error('Please pick a date/time for the session'); return; }
    setLoading(true);
    try {
      await proposalsAPI.accept(proposal._id, { ...form, scheduledAt: new Date(form.scheduledAt) });
      toast.success('Proposal accepted! Session scheduled.');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !proposal) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Accept & Schedule Session</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ background: 'var(--success-light)', border: '1px solid #6EE7B7', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: '#065F46' }}>
            You're accepting <strong>{proposal.sender?.name}'s</strong> proposal to exchange <strong>{proposal.offeredSkill}</strong> for <strong>{proposal.requestedSkill}</strong>.
          </p>
        </div>
        <div className="form-group">
          <label className="form-label required">Session Date & Time</label>
          <input type="datetime-local" className="form-input" value={form.scheduledAt} min={new Date().toISOString().slice(0, 16)} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Mode</label>
            <select className="form-select" value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}>
              <option>Online</option><option>In-Person</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Duration (minutes)</label>
            <input type="number" className="form-input" min={30} max={180} step={15} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
          </div>
        </div>
        {form.mode === 'Online' ? (
          <div className="form-group">
            <label className="form-label">Meet Link (optional)</label>
            <input className="form-input" placeholder="https://meet.google.com/..." value={form.meetLink} onChange={e => setForm(f => ({ ...f, meetLink: e.target.value }))} />
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-input" placeholder="Library Room 3, Campus..." value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleAccept} disabled={loading}>
            {loading ? <span className="spin">◌</span> : <CheckCircle size={14} />}
            {loading ? 'Accepting...' : 'Accept & Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RejectModal = ({ isOpen, proposalId, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    setLoading(true);
    try {
      await proposalsAPI.reject(proposalId, { reason });
      toast.success('Proposal declined.');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title">Decline Proposal</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="form-group">
          <label className="form-label">Reason (optional)</label>
          <textarea className="form-textarea" placeholder="Let them know why (optional)..." value={reason} onChange={e => setReason(e.target.value)} rows={2} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={handleReject} disabled={loading}>
            {loading ? <span className="spin">◌</span> : <XCircle size={14} />}
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

const ProposalCard = ({ proposal, type, onRefresh }) => {
  const { user } = useAuth();
  const [showAccept, setShowAccept] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { label, badge, icon: StatusIcon } = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.pending;
  const other = type === 'received' ? proposal.sender : proposal.receiver;

  const handleCancel = async () => {
    if (!window.confirm('Cancel this proposal?')) return;
    setCancelling(true);
    try {
      await proposalsAPI.cancel(proposal._id, {});
      toast.success('Proposal cancelled');
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <Avatar name={other?.name} size="md" />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{other?.name}</span>
            <span className={`badge ${badge}`}><StatusIcon size={10} /> {label}</span>
            {proposal.isDemo && (
              <span className="badge" style={{ fontSize: 10, background: '#EDE9FE', color: 'var(--purple)', border: '1px solid #DDD6FE' }}>
                Demo Proposal
              </span>
            )}
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 6 }}>
            {other?.college} {other?.year && `• ${other.year}`}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            <div style={{ background: 'var(--primary-50)', padding: '4px 10px', borderRadius: 'var(--radius)', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Teaches: </span>
              <strong style={{ color: 'var(--primary-600)' }}>{proposal.offeredSkill}</strong>
            </div>
            <div style={{ background: 'var(--purple-light)', padding: '4px 10px', borderRadius: 'var(--radius)', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Wants: </span>
              <strong style={{ color: 'var(--purple)' }}>{proposal.requestedSkill}</strong>
            </div>
          </div>
          <div style={{ background: 'var(--gray-50)', padding: '10px 12px', borderRadius: 'var(--radius)', marginBottom: 10 }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              "{proposal.message}"
            </p>
          </div>
          {proposal.preferredTimes?.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Calendar size={13} color="var(--text-muted)" />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Preferred: {format(new Date(proposal.preferredTimes[0].date), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
            </span>

            {proposal.status === 'pending' && type === 'received' && (
              <>
                <button className="btn btn-success btn-sm" onClick={() => setShowAccept(true)}>
                  <CheckCircle size={13} /> Accept
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowReject(true)}>
                  <XCircle size={13} /> Decline
                </button>
              </>
            )}
            {proposal.status === 'pending' && type === 'sent' && (
              <button className="btn btn-secondary btn-sm" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? <span className="spin">◌</span> : <X size={13} />} Cancel
              </button>
            )}
          </div>

          {proposal.status === 'rejected' && proposal.rejectionReason && (
            <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 8 }}>
              Reason: {proposal.rejectionReason}
            </p>
          )}
        </div>
      </div>

      <AcceptModal isOpen={showAccept} proposal={proposal} onClose={() => setShowAccept(false)} onSuccess={onRefresh} />
      <RejectModal isOpen={showReject} proposalId={proposal._id} onClose={() => setShowReject(false)} onSuccess={onRefresh} />
    </div>
  );
};

const Proposals = () => {
  const [tab, setTab] = useState('received');
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const [sentRes, recvRes] = await Promise.all([proposalsAPI.getSent(), proposalsAPI.getReceived()]);
      setSent(sentRes.data.proposals);
      setReceived(recvRes.data.proposals);
    } catch {
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProposals(); }, []);

  const displayList = (tab === 'received' ? received : sent)
    .filter(p => statusFilter === 'all' || p.status === statusFilter);

  const pendingReceived = received.filter(p => p.status === 'pending').length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Proposals</h1>
          <p className="page-subtitle">Manage your skill exchange proposals</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div className="tabs">
          <button className={`tab-btn${tab === 'received' ? ' active' : ''}`} onClick={() => setTab('received')}>
            Received {pendingReceived > 0 && <span className="nav-badge" style={{ marginLeft: 4 }}>{pendingReceived}</span>}
          </button>
          <button className={`tab-btn${tab === 'sent' ? ' active' : ''}`} onClick={() => setTab('sent')}>
            Sent
          </button>
        </div>
        <select className="form-select" style={{ width: 'auto', padding: '6px 12px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Declined</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 150 }} />)}
        </div>
      ) : displayList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><MessageSquare size={28} /></div>
          <h3 className="empty-title">No proposals {statusFilter !== 'all' ? `with status "${statusFilter}"` : 'yet'}</h3>
          <p className="empty-description">
            {tab === 'received' ? 'Browse skill offers and let others know about your skills!' : 'Browse skill listings and send your first proposal!'}
          </p>
        </div>
      ) : (
        displayList.map(p => (
          <ProposalCard key={p._id} proposal={p} type={tab} onRefresh={fetchProposals} />
        ))
      )}
    </div>
  );
};

export default Proposals;
