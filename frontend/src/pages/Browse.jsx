import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { offersAPI, requestsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import UserCard from '../components/UserCard';
import ProposalModal from '../components/ProposalModal';
import { Search, Plus, BookOpen, Inbox, X, Users, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All', 'Programming', 'Design', 'Mathematics', 'Science',
  'Language', 'Music', 'Sports', 'Art', 'Business', 'Writing',
  'Photography', 'Cooking', 'Other'
];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const MODES = ['Online', 'In-Person', 'Both'];

const CATEGORY_COLORS = {
  Programming: 'badge-primary', Design: 'badge-purple', Mathematics: 'badge-warning',
  Science: 'badge-success', Language: 'badge-orange', Music: 'badge-pink',
  Business: 'badge-gray', Writing: 'badge-purple', Photography: 'badge-orange', Other: 'badge-gray'
};

const OfferCard = ({ offer, onPropose, isOwn }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
      <span className={`badge ${CATEGORY_COLORS[offer.category] || 'badge-gray'}`}>{offer.category}</span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {offer.isWishlistMatch && (
          <span className="badge badge-success" style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Sparkles size={10} /> Wishlist Match
          </span>
        )}
        <span className="badge badge-gray">{offer.level}</span>
      </div>
    </div>

    <div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{offer.title}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }} className="line-clamp-2">{offer.description}</p>
    </div>

    {offer.matchReason && (
      <div style={{ fontSize: 11.5, color: '#047857', background: '#ECFDF5', padding: '4px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Sparkles size={11} /> {offer.matchReason}
      </div>
    )}

    {offer.tags?.length > 0 && (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {offer.tags.slice(0, 3).map(t => <span key={t} className="chip" style={{ fontSize: 11 }}>{t}</span>)}
      </div>
    )}

    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
      {offer.user && (
        <>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
            {offer.user.name?.[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }} className="truncate">{offer.user.name}</span>
              {offer.user.isDemo && (
                <span className="badge" style={{ fontSize: 9.5, padding: '1px 4px', background: 'var(--purple-light)', color: 'var(--purple)' }}>
                  Demo
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }} className="truncate">
              {offer.user.college || 'Student'} {offer.user.year && `• ${offer.user.year}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {offer.preferredMode} · {offer.sessionDuration}m
          </div>
        </>
      )}
    </div>

    {!isOwn && (
      <button className="btn btn-primary btn-sm" onClick={() => onPropose?.(offer.user, offer, null)}>
        Send Proposal
      </button>
    )}
  </div>
);

const RequestCard = ({ req, onPropose, isOwn }) => {
  const URGENCY = { High: 'badge-error', Medium: 'badge-warning', Low: 'badge-success' };
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
        <span className={`badge ${CATEGORY_COLORS[req.category] || 'badge-gray'}`}>{req.category}</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {req.canHelpWithSkill && (
            <span className="badge badge-primary" style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Sparkles size={10} /> You Can Teach This
            </span>
          )}
          <span className={`badge ${URGENCY[req.urgency]}`}>{req.urgency} Urgency</span>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{req.title}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }} className="line-clamp-2">{req.description}</p>
      </div>

      {req.matchReason && (
        <div style={{ fontSize: 11.5, color: '#1D4ED8', background: '#EFF6FF', padding: '4px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={11} /> {req.matchReason}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        {req.user && (
          <>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
              {req.user.name?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600 }} className="truncate">{req.user.name}</span>
                {req.user.isDemo && (
                  <span className="badge" style={{ fontSize: 9.5, padding: '1px 4px', background: 'var(--purple-light)', color: 'var(--purple)' }}>
                    Demo
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }} className="truncate">
                {req.user.college || 'Student'} {req.user.year && `• ${req.user.year}`}
              </div>
            </div>
            <span className="badge badge-gray" style={{ fontSize: 11 }}>Lvl: {req.currentLevel}</span>
          </>
        )}
      </div>

      {!isOwn && (
        <button className="btn btn-outline btn-sm" onClick={() => onPropose?.(req.user, null, req)}>
          Offer Help
        </button>
      )}
    </div>
  );
};

const CreateOfferModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({ title: '', category: 'Programming', level: 'Intermediate', description: '', preferredMode: 'Both', sessionDuration: 60, tags: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      await offersAPI.create({ ...form, tags, sessionDuration: Number(form.sessionDuration) });
      toast.success('Skill offer created!');
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create offer');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <h2 className="modal-title">Post a Skill Offer</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required">Title</label>
            <input className={`form-input${errors.title ? ' error' : ''}`} placeholder="e.g., Python for Beginners" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Your Level</label>
              <select className="form-select" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label required">Description</label>
            <textarea className={`form-textarea${errors.description ? ' error' : ''}`} placeholder="Describe what you'll teach, your approach, and what students will gain..." rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            {errors.description && <p className="form-error">{errors.description}</p>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Preferred Mode</label>
              <select className="form-select" value={form.preferredMode} onChange={e => setForm(f => ({ ...f, preferredMode: e.target.value }))}>
                {MODES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Session Duration (mins)</label>
              <input type="number" className="form-input" min={30} max={180} step={15} value={form.sessionDuration} onChange={e => setForm(f => ({ ...f, sessionDuration: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input className="form-input" placeholder="e.g., web dev, backend, django" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spin">◌</span> Posting...</> : <><BookOpen size={14} /> Post Offer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateRequestModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({ title: '', category: 'Programming', currentLevel: 'Beginner', description: '', urgency: 'Medium' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await requestsAPI.create(form);
      toast.success('Skill request posted!');
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Post a Skill Request</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required">What do you want to learn?</label>
            <input className={`form-input${errors.title ? ' error' : ''}`} placeholder="e.g., UI/UX Design basics" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Current Level</label>
              <select className="form-select" value={form.currentLevel} onChange={e => setForm(f => ({ ...f, currentLevel: e.target.value }))}>
                {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label required">Description</label>
            <textarea className={`form-textarea${errors.description ? ' error' : ''}`} placeholder="What specific things do you want to learn? What's your goal?" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            {errors.description && <p className="form-error">{errors.description}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Urgency</label>
            <select className="form-select" value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}>
              {['Low', 'Medium', 'High'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spin">◌</span> Posting...</> : <><Inbox size={14} /> Post Request</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Browse = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'peers'); // 'peers' | 'offers' | 'requests'
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');

  const [peers, setPeers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [proposalTarget, setProposalTarget] = useState(null);
  const [proposalOffer, setProposalOffer] = useState(null);
  const [proposalReq, setProposalReq] = useState(null);

  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [showCreateReq, setShowCreateReq] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search: search.trim() || undefined,
        q: search.trim() || undefined,
        category: category !== 'All' ? category : undefined
      };

      const [peerRes, offRes, reqRes] = await Promise.allSettled([
        usersAPI.search(params),
        offersAPI.getAll(params),
        requestsAPI.getAll(params)
      ]);

      let hasSuccess = false;

      if (peerRes.status === 'fulfilled') {
        setPeers(peerRes.value.data.users || []);
        hasSuccess = true;
      } else {
        console.error('Failed to load peers:', peerRes.reason);
        setPeers([]);
      }

      if (offRes.status === 'fulfilled') {
        setOffers(offRes.value.data.offers || []);
        hasSuccess = true;
      } else {
        console.error('Failed to load offers:', offRes.reason);
        setOffers([]);
      }

      if (reqRes.status === 'fulfilled') {
        setRequests(reqRes.value.data.requests || []);
        hasSuccess = true;
      } else {
        console.error('Failed to load requests:', reqRes.reason);
        setRequests([]);
      }

      if (!hasSuccess) {
        setError('Unable to load discovery results. Please check your connection.');
        toast.error('Failed to load peer discovery data');
      }
    } catch (err) {
      console.error('Unexpected error loading browse data:', err);
      setError('Unable to load discovery results. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 250); // slight debounce for search input
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handlePropose = (targetUser, offer = null, req = null) => {
    setProposalTarget(targetUser);
    setProposalOffer(offer);
    setProposalReq(req);
  };

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Discover Peers & Skills</h1>
          <p className="page-subtitle">
            Find college peers with complementary skills to exchange knowledge 1-on-1
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setShowCreateReq(true)}>
            <Plus size={14} /> Post Request
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateOffer(true)}>
            <Plus size={14} /> Post Offer
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="search-input"
            style={{ width: '100%', paddingLeft: 40, height: 44, borderRadius: 'var(--radius)' }}
            placeholder="Search by student name, college, skill offered or needed..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="filters-row" style={{ marginBottom: 18, overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.map(c => (
          <span
            key={c}
            className={`filter-chip${category === c ? ' active' : ''}`}
            onClick={() => setCategory(c)}
            style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {c}
          </span>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
        <div className="tabs" style={{ borderBottom: 'none', margin: 0 }}>
          <button className={`tab-btn${tab === 'peers' ? ' active' : ''}`} onClick={() => setTab('peers')}>
            <Users size={14} style={{ marginRight: 6 }} /> Students / Peers
            {!loading && <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.8 }}>({peers.length})</span>}
          </button>
          <button className={`tab-btn${tab === 'offers' ? ' active' : ''}`} onClick={() => setTab('offers')}>
            <BookOpen size={14} style={{ marginRight: 6 }} /> Skill Offers
            {!loading && <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.8 }}>({offers.length})</span>}
          </button>
          <button className={`tab-btn${tab === 'requests' ? ' active' : ''}`} onClick={() => setTab('requests')}>
            <Inbox size={14} style={{ marginRight: 6 }} /> Learning Wishlists
            {!loading && <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.8 }}>({requests.length})</span>}
          </button>
        </div>

        {/* Refresh button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchData}
          disabled={loading}
          title="Refresh results"
          style={{ padding: '6px 10px' }}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          padding: '16px 20px', background: 'var(--error-light)', border: '1px solid #FECACA',
          borderRadius: 'var(--radius)', color: '#991B1B', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>Try Again</button>
        </div>
      )}

      {/* Grid Content */}
      {loading ? (
        <div className="grid-auto">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton" style={{ height: 230, borderRadius: 'var(--radius)' }} />
          ))}
        </div>
      ) : tab === 'peers' ? (
        peers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Users size={28} /></div>
            <h3 className="empty-title">No students found</h3>
            <p className="empty-description">
              {search || category !== 'All'
                ? 'No peers matched your search criteria. Try broadening your keywords or clearing category filters.'
                : 'No peers found yet. Check back soon!'}
            </p>
            {(search || category !== 'All') && (
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setCategory('All'); }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid-auto">
            {peers.map(peer => (
              <UserCard
                key={peer._id}
                user={peer}
                onPropose={user => handlePropose(user)}
              />
            ))}
          </div>
        )
      ) : tab === 'offers' ? (
        offers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><BookOpen size={28} /></div>
            <h3 className="empty-title">No skill offers found</h3>
            <p className="empty-description">
              {search || category !== 'All'
                ? 'No skill offers matched your search. Try different keywords or be the first to post!'
                : 'Be the first student to post a skill offer!'}
            </p>
            <button className="btn btn-primary" onClick={() => setShowCreateOffer(true)}>
              <Plus size={14} /> Post an Offer
            </button>
          </div>
        ) : (
          <div className="grid-auto">
            {offers.map(o => (
              <OfferCard
                key={o._id}
                offer={o}
                onPropose={handlePropose}
                isOwn={o.user?._id === user?._id}
              />
            ))}
          </div>
        )
      ) : (
        requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Inbox size={28} /></div>
            <h3 className="empty-title">No skill requests found</h3>
            <p className="empty-description">
              {search || category !== 'All'
                ? 'No requests matched your query. Post what you want to learn!'
                : 'Need help with something? Post a request to find a peer tutor!'}
            </p>
            <button className="btn btn-primary" onClick={() => setShowCreateReq(true)}>
              <Plus size={14} /> Post a Request
            </button>
          </div>
        ) : (
          <div className="grid-auto">
            {requests.map(r => (
              <RequestCard
                key={r._id}
                req={r}
                onPropose={handlePropose}
                isOwn={r.user?._id === user?._id}
              />
            ))}
          </div>
        )
      )}

      {/* Modals */}
      <ProposalModal
        isOpen={!!proposalTarget}
        targetUser={proposalTarget}
        skillOffer={proposalOffer}
        skillRequest={proposalReq}
        onClose={() => { setProposalTarget(null); setProposalOffer(null); setProposalReq(null); }}
      />
      <CreateOfferModal isOpen={showCreateOffer} onClose={() => setShowCreateOffer(false)} onCreated={fetchData} />
      <CreateRequestModal isOpen={showCreateReq} onClose={() => setShowCreateReq(false)} onCreated={fetchData} />
    </div>
  );
};

export default Browse;
