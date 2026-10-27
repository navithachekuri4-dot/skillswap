import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { proposalsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { X, Send, Clock, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const ProposalModal = ({ isOpen, onClose, targetUser, skillOffer = null, skillRequest = null }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    offeredSkill: '',
    requestedSkill: '',
    message: '',
    preferredDate: '',
    preferredTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (skillOffer) {
      setForm(f => ({ ...f, requestedSkill: skillOffer.title }));
    }
    if (skillRequest) {
      setForm(f => ({ ...f, offeredSkill: skillRequest.title }));
    }
    // Pre-fill offered skill from user's skills
    if (user?.skillsOffered?.length > 0 && !skillRequest) {
      setForm(f => ({ ...f, offeredSkill: user.skillsOffered[0].name }));
    }
  }, [skillOffer, skillRequest, user]);

  const validate = () => {
    const errs = {};
    if (!form.offeredSkill.trim()) errs.offeredSkill = 'Required';
    if (!form.requestedSkill.trim()) errs.requestedSkill = 'Required';
    if (form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const preferredTimes = [];
      if (form.preferredDate && form.preferredTime) {
        preferredTimes.push({
          date: new Date(`${form.preferredDate}T${form.preferredTime}`),
          timeSlot: form.preferredTime
        });
      }

      await proposalsAPI.send({
        receiver: targetUser._id,
        offeredSkill: form.offeredSkill,
        requestedSkill: form.requestedSkill,
        message: form.message,
        preferredTimes,
        skillOffer: skillOffer?._id || null,
        skillRequest: skillRequest?._id || null
      });

      toast.success('Proposal sent successfully!');
      onClose();
      setForm({ offeredSkill: '', requestedSkill: '', message: '', preferredDate: '', preferredTime: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send proposal');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !targetUser) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Send Proposal</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
              Propose a skill exchange with {targetUser.name}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Target User Info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
          background: 'var(--gray-50)', borderRadius: 'var(--radius)', marginBottom: 20
        }}>
          <Avatar name={targetUser.name} size="md" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{targetUser.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{targetUser.college} • {targetUser.year}</div>
          </div>
          {targetUser.reputationScore > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={13} fill="#F59E0B" color="#F59E0B" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{targetUser.reputationScore}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">I'll teach</label>
              <input
                className={`form-input${errors.offeredSkill ? ' error' : ''}`}
                placeholder="e.g., Python Programming"
                value={form.offeredSkill}
                onChange={e => { setForm(f => ({ ...f, offeredSkill: e.target.value })); setErrors(er => ({ ...er, offeredSkill: '' })); }}
              />
              {errors.offeredSkill && <p className="form-error">{errors.offeredSkill}</p>}
              {user?.skillsOffered?.length > 0 && (
                <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {user.skillsOffered.slice(0, 3).map(s => (
                    <span
                      key={s._id}
                      className="badge badge-gray"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setForm(f => ({ ...f, offeredSkill: s.name }))}
                    >{s.name}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">I want to learn</label>
              <input
                className={`form-input${errors.requestedSkill ? ' error' : ''}`}
                placeholder="e.g., Graphic Design"
                value={form.requestedSkill}
                onChange={e => { setForm(f => ({ ...f, requestedSkill: e.target.value })); setErrors(er => ({ ...er, requestedSkill: '' })); }}
              />
              {errors.requestedSkill && <p className="form-error">{errors.requestedSkill}</p>}
              {targetUser?.skillsOffered?.length > 0 && (
                <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {targetUser.skillsOffered.slice(0, 3).map(s => (
                    <span
                      key={s._id}
                      className="badge badge-primary"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setForm(f => ({ ...f, requestedSkill: s.name }))}
                    >{s.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Message</label>
            <textarea
              className={`form-textarea${errors.message ? ' error' : ''}`}
              placeholder="Introduce yourself and explain why you'd like to exchange skills..."
              rows={3}
              value={form.message}
              onChange={e => { setForm(f => ({ ...f, message: e.target.value })); setErrors(er => ({ ...er, message: '' })); }}
            />
            {errors.message && <p className="form-error">{errors.message}</p>}
            <p className="form-hint">{form.message.length}/500 characters</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Preferred Date</label>
              <input
                type="date"
                className="form-input"
                value={form.preferredDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Time</label>
              <input
                type="time"
                className="form-input"
                value={form.preferredTime}
                onChange={e => setForm(f => ({ ...f, preferredTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spin">◌</span> : <Send size={14} />}
              {loading ? 'Sending...' : 'Send Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposalModal;
