import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import ReviewModal from '../components/ReviewModal';
import {
  Calendar, Clock, CheckCircle, XCircle, RefreshCw, Video,
  MapPin, X, AlertCircle, Copy, Link2, ExternalLink, Plus
} from 'lucide-react';
import { format, isPast, isToday, isFuture } from 'date-fns';
import toast from 'react-hot-toast';
import { validateMeetingUrl } from '../utils/meetingValidator';

const STATUS_CONFIG = {
  upcoming: { badge: 'badge-primary', label: 'Upcoming' },
  rescheduled: { badge: 'badge-warning', label: 'Rescheduled' },
  completed: { badge: 'badge-success', label: 'Completed' },
  cancelled: { badge: 'badge-error', label: 'Cancelled' },
  ongoing: { badge: 'badge-purple', label: 'Ongoing' }
};

const MeetingLinkModal = ({ isOpen, session, onClose, onSuccess }) => {
  const [url, setUrl] = useState(session?.meetLink || '');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setUrl(session?.meetLink || '');
    setError('');
    setCopied(false);
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  const hasConfiguredLink = Boolean(session.meetLink && session.meetLink.trim());
  const validation = url.trim() ? validateMeetingUrl(url.trim()) : null;

  const handleCopy = () => {
    if (session.meetLink) {
      navigator.clipboard.writeText(session.meetLink);
      setCopied(true);
      toast.success('Meeting link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenLink = () => {
    const check = validateMeetingUrl(session.meetLink);
    if (!check.valid) {
      toast.error(check.message);
      return;
    }
    window.open(session.meetLink, '_blank', 'noopener,noreferrer');
    toast.success(`Opening ${check.provider} meeting...`);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const check = validateMeetingUrl(url);
    if (!check.valid) {
      setError(check.message);
      return;
    }

    setLoading(true);
    try {
      await sessionsAPI.updateMeetingLink(session._id, check.url);
      toast.success(`${check.provider} link saved!`);
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save meeting link';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Video size={18} color="var(--primary)" />
            <h2 className="modal-title">
              {hasConfiguredLink ? 'Meeting Link Details' : 'Configure Meeting Link'}
            </h2>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Notice if meeting link is missing */}
        {!hasConfiguredLink ? (
          <div style={{
            background: 'var(--warning-light)',
            border: '1px solid #FDE68A',
            padding: '12px 14px',
            borderRadius: 'var(--radius)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10
          }}>
            <AlertCircle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>
                Meeting link has not been configured
              </div>
              <div style={{ fontSize: 12, color: '#B45309', marginTop: 2, lineHeight: 1.4 }}>
                Before starting the session, please enter a valid HTTPS meeting link (Google Meet, Zoom, Teams, Webex, or Jitsi) so both participants can connect.
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--primary-50)',
            border: '1px solid var(--primary-100)',
            padding: '12px 14px',
            borderRadius: 'var(--radius)',
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Current Saved Link
              </span>
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={handleCopy}
                style={{ fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {copied ? <CheckCircle size={12} color="var(--success)" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-primary)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {session.meetLink}
            </div>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label required">
              {hasConfiguredLink ? 'Update Meeting URL' : 'Enter Meeting URL'}
            </label>
            <input
              type="url"
              className={`form-input${error ? ' error' : ''}`}
              placeholder="https://meet.google.com/abc-defg-hij or https://zoom.us/j/..."
              value={url}
              onChange={e => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              autoFocus={!hasConfiguredLink}
            />
            {error && <p className="form-error" style={{ marginTop: 4 }}>{error}</p>}
            {!error && validation && !validation.valid && url.trim().length > 10 && (
              <p style={{ fontSize: 11.5, color: 'var(--warning)', marginTop: 4 }}>
                {validation.message}
              </p>
            )}
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.4 }}>
              <strong>Approved providers:</strong> Google Meet (format: <code>xxx-xxxx-xxx</code>), Zoom (<code>*.zoom.us</code>), Microsoft Teams, Webex, Jitsi, or Whereby. Must use <code>https://</code>.
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 18 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {hasConfiguredLink && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleOpenLink}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <ExternalLink size={14} /> Open Link
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spin">◌</span> : <Link2 size={14} />}
              {hasConfiguredLink ? 'Update Link' : 'Save Meeting Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RescheduleModal = ({ isOpen, sessionId, onClose, onSuccess }) => {
  const [form, setForm] = useState({ newDate: '', reason: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.newDate) { toast.error('Select a new date'); return; }
    if (!form.reason.trim()) { toast.error('Please provide a reason'); return; }
    setLoading(true);
    try {
      await sessionsAPI.reschedule(sessionId, { newDate: new Date(form.newDate), reason: form.reason });
      toast.success('Session rescheduled!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title">Reschedule Session</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required">New Date & Time</label>
            <input type="datetime-local" className="form-input" value={form.newDate} min={new Date().toISOString().slice(0,16)} onChange={e => setForm(f => ({ ...f, newDate: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label required">Reason</label>
            <textarea className="form-textarea" placeholder="Why are you rescheduling?" rows={2} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spin">◌</span> : <RefreshCw size={14} />}
              Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CancelModal = ({ isOpen, sessionId, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sessionsAPI.cancel(sessionId, { reason });
      toast.success('Session cancelled');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title">Cancel Session</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ background: 'var(--error-light)', padding: '10px 14px', borderRadius: 'var(--radius)', marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: '#991B1B' }}>This will notify the other participant. Are you sure?</p>
          </div>
          <div className="form-group">
            <label className="form-label">Reason (optional)</label>
            <textarea className="form-textarea" placeholder="Reason for cancellation..." rows={2} value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Keep Session</button>
            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? <span className="spin">◌</span> : <XCircle size={14} />}
              Cancel Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SessionCard = ({ session, onRefresh, currentUserId }) => {
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  const { badge, label } = STATUS_CONFIG[session.status] || STATUS_CONFIG.upcoming;
  const other = session.participants?.find(p => p._id !== currentUserId);
  const userMarkedComplete = session.completedBy?.includes(currentUserId);
  const canComplete = session.status === 'completed' ? false : ['upcoming', 'rescheduled'].includes(session.status) && isPast(new Date(session.scheduledAt));
  const canReschedule = ['upcoming', 'rescheduled'].includes(session.status);
  const canCancel = ['upcoming', 'rescheduled'].includes(session.status);
  const isUpcomingOrActive = ['upcoming', 'rescheduled', 'ongoing'].includes(session.status);
  const sessionDate = new Date(session.scheduledAt);
  const isSessionToday = isToday(sessionDate);

  const hasConfiguredLink = Boolean(session.meetLink && session.meetLink.trim());
  const linkValidation = hasConfiguredLink ? validateMeetingUrl(session.meetLink) : { valid: false };

  const handleStartSession = () => {
    if (session.mode !== 'Online') {
      toast(`This is an in-person exchange at ${session.location || 'designated campus location'}.`, { icon: '📍' });
      return;
    }

    if (!hasConfiguredLink || !linkValidation.valid) {
      // Display clear modal explaining link has not been configured
      setShowMeetingModal(true);
      return;
    }

    // Valid meeting URL: open in new tab
    window.open(session.meetLink, '_blank', 'noopener,noreferrer');
    toast.success(`Opening ${linkValidation.provider || 'video'} meeting...`);
  };

  const handleCopyLink = () => {
    if (session.meetLink) {
      navigator.clipboard.writeText(session.meetLink);
      toast.success('Meeting link copied to clipboard!');
    }
  };

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    try {
      await sessionsAPI.markComplete(session._id);
      toast.success('Session marked as complete!');
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setMarkingComplete(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 12, borderLeft: isSessionToday ? '3px solid var(--primary)' : undefined }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Date Column */}
        <div style={{
          width: 52, height: 52, background: isSessionToday ? 'var(--primary)' : 'var(--primary-50)',
          borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: isSessionToday ? 'white' : 'var(--primary)', lineHeight: 1 }}>
            {format(sessionDate, 'd')}
          </span>
          <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: isSessionToday ? 'rgba(255,255,255,0.8)' : 'var(--primary)', letterSpacing: 0.5 }}>
            {format(sessionDate, 'MMM')}
          </span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)' }}>{session.skill}</h3>
            <span className={`badge ${badge}`}>{label}</span>
            {session.isDemo && (
              <span className="badge" style={{ fontSize: 10, background: '#EDE9FE', color: 'var(--purple)', border: '1px solid #DDD6FE' }}>
                Demo Session
              </span>
            )}
            {isSessionToday && <span className="badge badge-primary">Today!</span>}
            {userMarkedComplete && session.status !== 'completed' && (
              <span className="badge badge-success">You marked complete</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: 'var(--text-muted)' }}>
              <Clock size={13} /> {format(sessionDate, 'h:mm a')} · {session.duration}min
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-muted)' }}>
              {session.mode === 'Online' ? <Video size={13} /> : <MapPin size={13} />}
              <span>{session.mode}</span>
              {session.mode === 'Online' && (
                hasConfiguredLink && linkValidation.valid ? (
                  <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    · <CheckCircle size={11} /> {linkValidation.provider} configured
                  </span>
                ) : (
                  <span style={{ color: '#D97706', display: 'flex', alignItems: 'center', gap: 3 }}>
                    · <AlertCircle size={11} /> No link configured
                  </span>
                )
              )}
              {session.mode === 'In-Person' && session.location && (
                <span>· {session.location}</span>
              )}
            </div>
          </div>

          {other && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Avatar name={other.name} size="sm" />
              <div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{other.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>{other.college}</span>
              </div>
            </div>
          )}

          {/* Primary Action Buttons: Start Session, Copy Link, Add/Edit Link */}
          {isUpcomingOrActive && (
            <div style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              marginBottom: 12,
              padding: '10px 12px',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleStartSession}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
              >
                <Video size={14} /> Start Session
              </button>

              {hasConfiguredLink && linkValidation.valid ? (
                <>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleCopyLink}
                    title="Copy meeting link to clipboard"
                    style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <Copy size={13} /> Copy Link
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowMeetingModal(true)}
                    title="Edit or view meeting link"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}
                  >
                    <Link2 size={13} /> Edit Link
                  </button>
                </>
              ) : session.mode === 'Online' ? (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowMeetingModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    color: '#B45309',
                    borderColor: '#FDE68A',
                    background: '#FFFBEB'
                  }}
                >
                  <Plus size={13} /> Add Meeting Link
                </button>
              ) : null}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            {canComplete && !userMarkedComplete && (
              <button className="btn btn-success btn-sm" onClick={handleMarkComplete} disabled={markingComplete}>
                {markingComplete ? <span className="spin">◌</span> : <CheckCircle size={13} />}
                Mark Complete
              </button>
            )}
            {canReschedule && (
              <button className="btn btn-secondary btn-sm" onClick={() => setShowReschedule(true)}>
                <RefreshCw size={13} /> Reschedule
              </button>
            )}
            {canCancel && (
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => setShowCancel(true)}>
                <XCircle size={13} /> Cancel
              </button>
            )}
            {session.status === 'completed' && (
              <button className="btn btn-outline btn-sm" onClick={() => setShowReview(true)}>
                Leave Review
              </button>
            )}
          </div>
        </div>
      </div>

      <MeetingLinkModal
        isOpen={showMeetingModal}
        session={session}
        onClose={() => setShowMeetingModal(false)}
        onSuccess={onRefresh}
      />
      <RescheduleModal isOpen={showReschedule} sessionId={session._id} onClose={() => setShowReschedule(false)} onSuccess={onRefresh} />
      <CancelModal isOpen={showCancel} sessionId={session._id} onClose={() => setShowCancel(false)} onSuccess={onRefresh} />
      {other && (
        <ReviewModal
          isOpen={showReview}
          session={session}
          reviewee={other}
          onClose={() => setShowReview(false)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};

const Sessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await sessionsAPI.getAll();
      setSessions(res.data.sessions);
    } catch {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const upcoming = sessions.filter(s => ['upcoming', 'rescheduled', 'ongoing'].includes(s.status));
  const past = sessions.filter(s => ['completed', 'cancelled'].includes(s.status));
  const displayList = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sessions</h1>
          <p className="page-subtitle">Manage your skill exchange sessions</p>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--primary)' }}>{upcoming.length}</div>
            <div style={{ color: 'var(--text-muted)' }}>Upcoming</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--success)' }}>{past.filter(s => s.status === 'completed').length}</div>
            <div style={{ color: 'var(--text-muted)' }}>Completed</div>
          </div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab-btn${tab === 'upcoming' ? ' active' : ''}`} onClick={() => setTab('upcoming')}>
          Upcoming {upcoming.length > 0 && <span style={{ fontSize: 11, marginLeft: 4 }}>({upcoming.length})</span>}
        </button>
        <button className={`tab-btn${tab === 'past' ? ' active' : ''}`} onClick={() => setTab('past')}>
          Past Sessions
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160 }} />)}
        </div>
      ) : displayList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Calendar size={28} /></div>
          <h3 className="empty-title">No {tab} sessions</h3>
          <p className="empty-description">
            {tab === 'upcoming' ? 'Accept proposals to schedule sessions with peers.' : 'Your completed and cancelled sessions will appear here.'}
          </p>
        </div>
      ) : (
        displayList.map(s => (
          <SessionCard key={s._id} session={s} onRefresh={fetchSessions} currentUserId={user?._id} />
        ))
      )}
    </div>
  );
};

export default Sessions;
