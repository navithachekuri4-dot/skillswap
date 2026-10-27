import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { offersAPI, requestsAPI } from '../services/api';
import Avatar from '../components/Avatar';
import { BookOpen, Inbox, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_COLORS = {
  Programming: 'badge-primary', Design: 'badge-purple', Mathematics: 'badge-warning',
  Science: 'badge-success', Language: 'badge-orange', Other: 'badge-gray'
};

const MySkills = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('offers');
  const [offers, setOffers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ofRes, reqRes] = await Promise.all([offersAPI.getMy(), requestsAPI.getMy()]);
      setOffers(ofRes.data.offers);
      setRequests(reqRes.data.requests);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    setDeletingId(id);
    try {
      await offersAPI.delete(id);
      setOffers(prev => prev.filter(o => o._id !== id));
      toast.success('Offer deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeletingId(null); }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    setDeletingId(id);
    try {
      await requestsAPI.delete(id);
      setRequests(prev => prev.filter(r => r._id !== id));
      toast.success('Request deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeletingId(null); }
  };

  const handleToggleOffer = async (offer) => {
    setTogglingId(offer._id);
    try {
      const res = await offersAPI.update(offer._id, { isActive: !offer.isActive });
      setOffers(prev => prev.map(o => o._id === offer._id ? res.data.offer : o));
      toast.success(offer.isActive ? 'Offer hidden' : 'Offer made active');
    } catch { toast.error('Failed'); }
    finally { setTogglingId(null); }
  };

  const URGENCY_COLOR = { High: 'badge-error', Medium: 'badge-warning', Low: 'badge-success' };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Skills</h1>
          <p className="page-subtitle">Manage your skill offers and requests</p>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab-btn${tab === 'offers' ? ' active' : ''}`} onClick={() => setTab('offers')}>
          <BookOpen size={13} /> My Offers ({offers.length})
        </button>
        <button className={`tab-btn${tab === 'requests' ? ' active' : ''}`} onClick={() => setTab('requests')}>
          <Inbox size={13} /> My Requests ({requests.length})
        </button>
      </div>

      {loading ? (
        <div className="grid-3">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 180 }} />)}
        </div>
      ) : tab === 'offers' ? (
        offers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><BookOpen size={28} /></div>
            <h3 className="empty-title">No skill offers yet</h3>
            <p className="empty-description">Post a skill offer to start teaching and exchanging!</p>
          </div>
        ) : (
          <div className="grid-3">
            {offers.map(offer => (
              <div key={offer._id} className="card" style={{ opacity: offer.isActive ? 1 : 0.65 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className={`badge ${CATEGORY_COLORS[offer.category] || 'badge-gray'}`}>{offer.category}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      title={offer.isActive ? 'Hide offer' : 'Make active'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)' }}
                      onClick={() => handleToggleOffer(offer)}
                      disabled={togglingId === offer._id}
                    >
                      {offer.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--error)' }}
                      onClick={() => handleDeleteOffer(offer._id)}
                      disabled={deletingId === offer._id}
                    >
                      {deletingId === offer._id ? <span className="spin">◌</span> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{offer.title}</h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10 }} className="line-clamp-2">{offer.description}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-muted)', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <span>{offer.level}</span>
                  <span>·</span>
                  <span>{offer.preferredMode}</span>
                  <span>·</span>
                  <span>{offer.sessionDuration}min</span>
                  <span style={{ marginLeft: 'auto' }}>{formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}</span>
                </div>
                {!offer.isActive && <div style={{ fontSize: 11, color: 'var(--error)', marginTop: 6, fontWeight: 600 }}>HIDDEN</div>}
              </div>
            ))}
          </div>
        )
      ) : (
        requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Inbox size={28} /></div>
            <h3 className="empty-title">No skill requests yet</h3>
            <p className="empty-description">Post a request to find peers who can help you learn!</p>
          </div>
        ) : (
          <div className="grid-3">
            {requests.map(req => (
              <div key={req._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className={`badge ${CATEGORY_COLORS[req.category] || 'badge-gray'}`}>{req.category}</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className={`badge ${URGENCY_COLOR[req.urgency]}`}>{req.urgency}</span>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--error)' }}
                      onClick={() => handleDeleteRequest(req._id)}
                      disabled={deletingId === req._id}
                    >
                      {deletingId === req._id ? <span className="spin">◌</span> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{req.title}</h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10 }} className="line-clamp-2">{req.description}</p>
                <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-muted)', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <span>Level: {req.currentLevel}</span>
                  <span style={{ marginLeft: 'auto' }}>{formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default MySkills;
