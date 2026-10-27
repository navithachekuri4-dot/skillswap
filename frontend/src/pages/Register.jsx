import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedName) {
      errs.name = 'Full name is required';
    } else if (trimmedName.length > 50) {
      errs.name = 'Name cannot exceed 50 characters';
    }

    if (!trimmedEmail) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!form.confirm) {
      errs.confirm = 'Please confirm your password';
    } else if (form.password !== form.confirm) {
      errs.confirm = 'Passwords do not match';
    }

    return errs;
  };

  const handleChange = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const cleanName = form.name.trim();
      const cleanEmail = form.email.trim().toLowerCase();

      await register(cleanName, cleanEmail, form.password);
      toast.success('Welcome to SkillSwap! 🎉');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);

      // Extract specific, safe error message from response
      const safeMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.request && !err.response
          ? 'Unable to connect to the server. Please verify the backend is running.'
          : err.message || 'Registration failed. Please check your inputs and try again.');

      setServerError(safeMessage);
      toast.error(safeMessage);

      // Attach error to specific field if applicable
      const lower = safeMessage.toLowerCase();
      if (lower.includes('email') || lower.includes('registered') || lower.includes('exists')) {
        setErrors(prev => ({ ...prev, email: safeMessage }));
      } else if (lower.includes('name')) {
        setErrors(prev => ({ ...prev, name: safeMessage }));
      } else if (lower.includes('password')) {
        setErrors(prev => ({ ...prev, password: safeMessage }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 50%, #F5F3FF 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', boxShadow: 'var(--shadow-primary)'
          }}>
            <Zap size={24} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -0.5 }}>
            Join SkillSwap
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
            Exchange skills with students at your campus
          </p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {/* Server Error Alert */}
          {serverError && (
            <div
              style={{
                padding: '11px 14px',
                background: 'var(--error-light)',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius)',
                color: '#B91C1C',
                fontSize: 13,
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                lineHeight: 1.4
              }}
            >
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 500 }}>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label required">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className={`form-input${errors.name ? ' error' : ''}`}
                  style={{ paddingLeft: 36 }}
                  placeholder="e.g., Alex Johnson"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  autoFocus
                />
              </div>
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label required">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className={`form-input${errors.email ? ' error' : ''}`}
                  style={{ paddingLeft: 36 }}
                  placeholder="alex@university.edu"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label required">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`form-input${errors.password ? ' error' : ''}`}
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                />
                <button
                  type="button"
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label className="form-label required">Confirm Password</label>
              <input
                type="password"
                className={`form-input${errors.confirm ? ' error' : ''}`}
                placeholder="Repeat password"
                value={form.confirm}
                onChange={e => handleChange('confirm', e.target.value)}
              />
              {errors.confirm && <p className="form-error">{errors.confirm}</p>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
              {loading ? <span className="spin">◌</span> : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
