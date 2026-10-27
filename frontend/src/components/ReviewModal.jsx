import { useState } from 'react';
import { sessionsAPI, reviewsAPI } from '../services/api';
import { X, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from './Avatar';

const REVIEW_TAGS = ['Knowledgeable', 'Patient', 'Punctual', 'Helpful', 'Clear Explanation', 'Friendly', 'Well Prepared'];

const ReviewModal = ({ isOpen, onClose, session, reviewee, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }

    setLoading(true);
    try {
      await reviewsAPI.submit({
        session: session._id,
        reviewee: reviewee._id,
        rating,
        feedback,
        tags: selectedTags,
        skillReviewed: session.skill
      });
      toast.success('Review submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !session || !reviewee) return null;

  const displayRating = hoverRating || rating;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Rate Your Session</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
              How was your experience with {reviewee.name}?
            </p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Avatar name={reviewee.name} size="md" />
          <div>
            <div style={{ fontWeight: 600 }}>{reviewee.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{session.skill}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'center' }}>
            <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Overall Rating</label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                >
                  <Star
                    size={36}
                    fill={s <= displayRating ? '#F59E0B' : 'none'}
                    color={s <= displayRating ? '#F59E0B' : 'var(--gray-300)'}
                    style={{ transition: 'all 0.15s' }}
                  />
                </button>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
              {rating === 0 ? 'Select a rating' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">What went well? (optional)</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {REVIEW_TAGS.map(tag => (
                <span
                  key={tag}
                  className={`filter-chip${selectedTags.includes(tag) ? ' active' : ''}`}
                  style={{ fontSize: 12 }}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Written Feedback (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Share what you learned, how the session went..."
              rows={3}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              maxLength={400}
            />
            <p className="form-hint">{feedback.length}/400 characters</p>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Skip</button>
            <button type="submit" className="btn btn-primary" disabled={loading || rating === 0}>
              {loading ? <span className="spin">◌</span> : <Star size={14} />}
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
