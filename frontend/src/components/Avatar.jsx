const Avatar = ({ name = '', src, size = 'md', className = '' }) => {
  const sizeClass = `avatar avatar-${size} ${className}`;
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');

  const colors = [
    { bg: 'var(--primary-100)', color: 'var(--primary-600)' },
    { bg: '#E0F2FE', color: '#0369A1' },
    { bg: '#F3E8FF', color: '#7C3AED' },
    { bg: '#FEF3C7', color: '#92400E' },
    { bg: '#FCE7F3', color: '#9D174D' },
    { bg: '#D1FAE5', color: '#065F46' },
  ];
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;
  const { bg, color } = colors[colorIdx];

  if (src) {
    return <img src={src} alt={name} className={sizeClass} />;
  }

  return (
    <div
      className={sizeClass}
      style={{ background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {initials || '?'}
    </div>
  );
};

export default Avatar;
