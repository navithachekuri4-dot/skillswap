import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { Star, MapPin, BookOpen, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const CATEGORY_COLORS = {
  Programming: 'badge-primary',
  Design: 'badge-purple',
  Mathematics: 'badge-warning',
  Science: 'badge-success',
  Language: 'badge-orange',
  Music: 'badge-pink',
  Business: 'badge-gray',
  Writing: 'badge-purple',
  Photography: 'badge-orange',
  Other: 'badge-gray'
};

const UserCard = ({ user, onPropose, showPropose = true }) => {
  const navigate = useNavigate();

  const isMutual = user.matchScore >= 90;
  const isHighMatch = user.matchScore >= 70;

  return (
    <div
      className="user-card"
      onClick={() => navigate(`/profile/${user._id}`)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        border: isMutual ? '1.5px solid #10B981' : undefined
      }}
    >
      {/* Top Header with Avatar and Basic Info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
        <Avatar name={user.name} size="md" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-primary)' }} className="truncate">
              {user.name}
            </span>
            {user.isDemo && (
              <span
                className="badge"
                style={{
                  fontSize: 10,
                  padding: '1px 6px',
                  background: 'var(--purple-light)',
                  color: 'var(--purple)',
                  fontWeight: 600,
                  borderRadius: 4
                }}
                title="This is a realistic fictional demo account"
              >
                Demo Student
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <MapPin size={11} color="var(--text-muted)" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }} className="truncate">
              {user.college || 'Student'} {user.year && `• ${user.year}`}
            </span>
          </div>
        </div>

        {/* Match Score Badge */}
        {user.matchScore !== undefined && user.matchScore > 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              background: isMutual
                ? 'var(--success-light)'
                : isHighMatch
                ? 'var(--primary-50)'
                : 'var(--gray-100)',
              color: isMutual
                ? '#065F46'
                : isHighMatch
                ? 'var(--primary)'
                : 'var(--text-secondary)',
              fontSize: 11.5,
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
            title={user.matchReason}
          >
            <Sparkles size={11} color={isMutual ? '#10B981' : 'var(--primary)'} />
            <span>{user.matchScore}% Match</span>
          </div>
        ) : user.reputationScore > 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            background: 'var(--warning-light)', padding: '3px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            <Star size={11} fill="#F59E0B" color="#F59E0B" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>
              {Number(user.reputationScore).toFixed(1)}
            </span>
          </div>
        ) : null}
      </div>

      {/* Match Reason Explanation */}
      {user.matchReason && (
        <div
          style={{
            fontSize: 11.5,
            padding: '5px 9px',
            background: isMutual ? '#ECFDF5' : '#EFF6FF',
            color: isMutual ? '#047857' : '#1D4ED8',
            borderRadius: 6,
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            lineHeight: 1.3
          }}
        >
          <Sparkles size={12} style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 500 }}>{user.matchReason}</span>
        </div>
      )}

      {/* Bio Snippet */}
      {user.bio && (
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.4 }} className="line-clamp-2">
          {user.bio}
        </p>
      )}

      {/* Skills Offered */}
      {user.skillsOffered?.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
            <BookOpen size={11} /> CAN TEACH
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {user.skillsOffered.slice(0, 3).map((skill, i) => (
              <span key={i} className={`badge ${CATEGORY_COLORS[skill.category] || 'badge-gray'}`} style={{ fontSize: 11 }}>
                {skill.name} {skill.level ? `(${skill.level[0]})` : ''}
              </span>
            ))}
            {user.skillsOffered.length > 3 && (
              <span className="badge badge-gray" style={{ fontSize: 11 }}>+{user.skillsOffered.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Skills Needed */}
      {user.skillsNeeded?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5 }}>WANTS TO LEARN</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {user.skillsNeeded.slice(0, 3).map((skill, i) => (
              <span key={i} className="badge badge-gray" style={{ fontSize: 11 }}>{skill.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info & Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
          {user.totalReviews > 0 ? (
            <span>{user.totalReviews} reviews · {user.completedSessions} sessions</span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>New Member · 0 reviews</span>
          )}
        </div>
        {showPropose && (
          <button
            className="btn btn-primary btn-sm"
            onClick={e => {
              e.stopPropagation();
              onPropose?.(user);
            }}
          >
            <ArrowRight size={13} /> Propose
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
