import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import ProposalModal from '../components/ProposalModal';
import {
  MapPin, BookOpen, Star, CheckCircle, Edit2, Save, X,
  GraduationCap, Clock, Award, Trash2, Plus, Sparkles, Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Programming', 'Design', 'Mathematics', 'Science', 'Language', 'Music', 'Sports', 'Art', 'Business', 'Writing', 'Photography', 'Cooking', 'Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Second Year', 'Postgraduate', 'PhD'];

const StarRating = ({ value }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={14} fill={s <= Math.round(value) ? '#F59E0B' : 'none'} color={s <= Math.round(value) ? '#F59E0B' : 'var(--gray-300)'} />
    ))}
  </div>
);

const AddSkillModal = ({ isOpen, type, onClose, onAdd }) => {
  const [form, setForm] = useState({ name: '', category: 'Programming', level: 'Intermediate', description: '' });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!form.name.trim()) { toast.error('Skill name required'); return; }
    setLoading(true);
    try {
      if (type === 'offer') await usersAPI.addOfferedSkill(form);
      else await usersAPI.addNeededSkill({ name: form.name, category: form.category, level: form.level });
      toast.success('Skill added!');
      onAdd?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title">{type === 'offer' ? 'Add Skill Offer' : 'Add Skill to Learn'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="form-group">
          <label className="form-label required">Skill Name</label>
          <input className="form-input" placeholder="e.g., Python, Photoshop, Guitar..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Level</label>
            <select className="form-select" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        {type === 'offer' && (
          <div className="form-group">
            <label className="form-label">Brief Description</label>
            <textarea className="form-textarea" placeholder="What can you teach about this?" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={loading}>
            {loading ? <span className="spin">◌</span> : <Plus size={14} />} Add Skill
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const isOwn = !id || id === currentUser?._id;

  const [profileUser, setProfileUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [showAddNeed, setShowAddNeed] = useState(false);
  const [proposalUser, setProposalUser] = useState(null);
  const [activeTab, setActiveTab] = useState('skills');
  const [matchInfo, setMatchInfo] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const userId = id || currentUser?._id;
      const res = await usersAPI.getProfile(userId);
      setProfileUser(res.data.user);
      setMatchInfo(res.data.matchInfo || null);
      setReviews(res.data.reviews || []);
      setEditForm({
        name: res.data.user.name,
        college: res.data.user.college || '',
        year: res.data.user.year || '',
        bio: res.data.user.bio || '',
        availability: res.data.user.availability || {}
      });

      const reviewRes = await reviewsAPI.getForUser(userId);
      setReviewStats(reviewRes.data.stats);
      setReviews(reviewRes.data.reviews);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [id]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await usersAPI.updateProfile(editForm);
      updateUser(res.data.user);
      setProfileUser(res.data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSkill = async (skillId, type) => {
    try {
      const fn = type === 'offer' ? usersAPI.removeOfferedSkill : usersAPI.removeNeededSkill;
      const res = await fn(skillId);
      setProfileUser(res.data.user);
      updateUser(res.data.user);
      toast.success('Skill removed');
    } catch {
      toast.error('Failed to remove skill');
    }
  };

  const handleSkillAdded = async () => {
    await fetchProfile();
    await refreshUser();
  };

  if (loading) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ width: 300 }}>
            <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-md)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 200, marginBottom: 16, borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-md)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) return (
    <div className="page-content">
      <div className="empty-state">
        <h3 className="empty-title">User not found</h3>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go Home</button>
      </div>
    </div>
  );

  const completeness = profileUser.profileComplete || 20;

  return (
    <div className="page-content">
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Left Column - Profile Card */}
        <div>
          <div className="card" style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar name={profileUser.name} size="2xl" />
              {profileUser.reputationScore > 0 && (
                <div style={{
                  position: 'absolute', bottom: 2, right: 2,
                  background: '#F59E0B', color: 'white', width: 26, height: 26,
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, border: '2px solid white'
                }}>
                  {Number(profileUser.reputationScore).toFixed(0)}
                </div>
              )}
            </div>

            {editing && isOwn ? (
              <div style={{ marginTop: 16, textAlign: 'left' }}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">College</label>
                  <input className="form-input" placeholder="Your college name" value={editForm.college} onChange={e => setEditForm(f => ({ ...f, college: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-select" value={editForm.year} onChange={e => setEditForm(f => ({ ...f, year: e.target.value }))}>
                    <option value="">Select year</option>
                    {YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-textarea" rows={3} placeholder="Tell others about yourself..." value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} maxLength={300} />
                  <p className="form-hint">{editForm.bio.length}/300</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Availability</label>
                  <div className="checkbox-group">
                    {['weekdays', 'weekends', 'mornings', 'afternoons', 'evenings'].map(k => (
                      <label key={k} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={editForm.availability?.[k] || false}
                          onChange={e => setEditForm(f => ({ ...f, availability: { ...f.availability, [k]: e.target.checked } }))}
                        />
                        {k.charAt(0).toUpperCase() + k.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveProfile} disabled={saving}>
                    {saving ? <span className="spin">◌</span> : <Save size={14} />} Save
                  </button>
                  <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{profileUser.name}</h2>
                  {profileUser.isDemo && (
                    <span className="badge" style={{ fontSize: 10, padding: '2px 6px', background: 'var(--purple-light)', color: 'var(--purple)' }}>
                      Demo Student
                    </span>
                  )}
                </div>
                {profileUser.college && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4, color: 'var(--text-muted)', fontSize: 13 }}>
                    <GraduationCap size={13} /> {profileUser.college}
                    {profileUser.year && <> · {profileUser.year}</>}
                  </div>
                )}
                {profileUser.bio && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6 }}>{profileUser.bio}</p>
                )}

                {/* Match Banner if viewing peer */}
                {!isOwn && matchInfo && matchInfo.score > 0 && (
                  <div style={{
                    marginTop: 12, padding: '8px 12px', borderRadius: 'var(--radius)',
                    background: matchInfo.score >= 90 ? '#ECFDF5' : '#EFF6FF',
                    border: `1px solid ${matchInfo.score >= 90 ? '#A7F3D0' : '#BFDBFE'}`,
                    color: matchInfo.score >= 90 ? '#065F46' : '#1E40AF',
                    fontSize: 12, textAlign: 'left'
                  }}>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                      <Sparkles size={12} /> {matchInfo.score}% Complementary Match
                    </div>
                    <div style={{ lineHeight: 1.3 }}>{matchInfo.reason}</div>
                  </div>
                )}

                {isOwn ? (
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => setEditing(true)}>
                    <Edit2 size={13} /> Edit Profile
                  </button>
                ) : (
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={() => setProposalUser(profileUser)}>
                    <Send size={14} /> Send Skill Proposal
                  </button>
                )}
              </>
            )}
          </div>

          {/* Stats Card */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Sessions', value: profileUser.completedSessions || 0, icon: CheckCircle, color: 'var(--success)' },
                { label: 'Reviews', value: profileUser.totalReviews || 0, icon: Star, color: '#F59E0B' },
                { label: 'Rating', value: profileUser.reputationScore > 0 ? `${Number(profileUser.reputationScore).toFixed(1)}★` : '—', icon: Award, color: 'var(--primary)' },
                {
                  label: 'Availability',
                  value: Object.values(profileUser.availability || {}).some(Boolean) ? 'Active' : 'TBD',
                  icon: Clock,
                  color: 'var(--purple)'
                }
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} style={{ textAlign: 'center', padding: '10px 8px', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                  <Icon size={16} color={color} style={{ marginBottom: 4 }} />
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Completeness */}
          {isOwn && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Profile Strength</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: completeness >= 80 ? 'var(--success)' : 'var(--warning)' }}>
                  {completeness}%
                </span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar" style={{
                  width: `${completeness}%`,
                  background: completeness >= 80 ? 'linear-gradient(90deg, var(--success), #059669)' : 'linear-gradient(90deg, var(--warning), #F59E0B)'
                }} />
              </div>
              {completeness < 100 && (
                <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8 }}>
                  {completeness < 60 ? 'Add skills and availability for better matches!' : 'Almost there! Add more skills to reach 100%.'}
                </p>
              )}
            </div>
          )}

          {!isOwn && (
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setProposalUser(profileUser)}>
              Send Proposal
            </button>
          )}
        </div>

        {/* Right Column */}
        <div>
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button className={`tab-btn${activeTab === 'skills' ? ' active' : ''}`} onClick={() => setActiveTab('skills')}>Skills</button>
            <button className={`tab-btn${activeTab === 'reviews' ? ' active' : ''}`} onClick={() => setActiveTab('reviews')}>
              Reviews {reviewStats?.total > 0 && `(${reviewStats.total})`}
            </button>
          </div>

          {activeTab === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Skills Offered */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Skills I Can Teach</div>
                  {isOwn && (
                    <button className="btn btn-outline btn-sm" onClick={() => setShowAddOffer(true)}>
                      <Plus size={13} /> Add
                    </button>
                  )}
                </div>
                {profileUser.skillsOffered?.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {isOwn ? 'Add skills you can teach to start matching!' : 'No skills listed yet.'}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {profileUser.skillsOffered.map(skill => (
                      <div key={skill._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'var(--primary-50)', borderRadius: 'var(--radius)', border: '1px solid var(--primary-100)' }}>
                        <BookOpen size={15} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{skill.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{skill.category} · {skill.level}</div>
                          {skill.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{skill.description}</div>}
                        </div>
                        {isOwn && (
                          <button className="btn-ghost" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--error)', opacity: 0.6 }}
                            onClick={() => handleRemoveSkill(skill._id, 'offer')}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills Needed */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Skills I Want to Learn</div>
                  {isOwn && (
                    <button className="btn btn-outline btn-sm" onClick={() => setShowAddNeed(true)}>
                      <Plus size={13} /> Add
                    </button>
                  )}
                </div>
                {profileUser.skillsNeeded?.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {isOwn ? 'Add skills you want to learn to improve matching!' : 'No skills needed listed.'}
                  </p>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {profileUser.skillsNeeded.map(skill => (
                      <div key={skill._id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--gray-100)', padding: '6px 12px', borderRadius: 'var(--radius-full)' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{skill.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {skill.level}</span>
                        {isOwn && (
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', display: 'flex' }}
                            onClick={() => handleRemoveSkill(skill._id, 'need')}>
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability */}
              {(profileUser.availability && Object.values(profileUser.availability).some(Boolean)) && (
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 12 }}>Availability</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {Object.entries(profileUser.availability)
                      .filter(([, v]) => v)
                      .map(([k]) => (
                        <span key={k} className="badge badge-success">{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {reviewStats && reviewStats.total > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {Number(reviewStats.average).toFixed(1)}
                      </div>
                      <StarRating value={reviewStats.average} />
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{reviewStats.total} reviews</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      {[5,4,3,2,1].map(s => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 12 }}>{s}</span>
                          <Star size={11} fill="#F59E0B" color="#F59E0B" />
                          <div className="progress-bar-wrap" style={{ flex: 1, height: 6 }}>
                            <div className="progress-bar" style={{
                              width: `${reviewStats.total > 0 ? (reviewStats.distribution[s] / reviewStats.total) * 100 : 0}%`,
                              background: '#F59E0B'
                            }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 16 }}>{reviewStats.distribution[s]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Star size={24} /></div>
                  <h3 className="empty-title">No reviews yet</h3>
                  <p className="empty-description">Complete sessions to receive your first review!</p>
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review._id} className="card" style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Avatar name={review.reviewer?.name} size="sm" />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: 13.5 }}>{review.reviewer?.name}</span>
                            {review.isDemo && (
                              <span className="badge" style={{ fontSize: 9.5, padding: '1px 5px', background: '#EDE9FE', color: 'var(--purple)', border: '1px solid #DDD6FE' }}>
                                Demo Review
                              </span>
                            )}
                          </div>
                          <StarRating value={review.rating} />
                        </div>
                        {review.tags?.length > 0 && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                            {review.tags.map(t => <span key={t} className="badge badge-primary" style={{ fontSize: 10 }}>{t}</span>)}
                          </div>
                        )}
                        {review.feedback && (
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{review.feedback}"</p>
                        )}
                        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                          {review.skillReviewed && `${review.skillReviewed} · `}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <AddSkillModal isOpen={showAddOffer} type="offer" onClose={() => setShowAddOffer(false)} onAdd={handleSkillAdded} />
      <AddSkillModal isOpen={showAddNeed} type="need" onClose={() => setShowAddNeed(false)} onAdd={handleSkillAdded} />
      <ProposalModal isOpen={!!proposalUser} targetUser={proposalUser} onClose={() => setProposalUser(null)} />
    </div>
  );
};

export default Profile;
