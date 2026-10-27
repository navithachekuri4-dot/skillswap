import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const handleChange = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
    if (serverError) setServerError('');
  };

  const handleDemoLogin = async () => {
    setServerError('');
    setDemoLoading(true);
    try {
      await demoLogin();
      toast.success('Welcome to SkillSwap Demo, Navitha! 👋');
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.request && !err.response
          ? 'Cannot connect to server. Please ensure backend is running.'
          : err.message || 'Demo login failed. Please try again.');
      setServerError(message);
      toast.error(message);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!form.email.match(/^\S+@\S+\.\S+$/)) errs.email = 'Valid email required';
    if (!form.password) errs.password = 'Password is required';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(form.email.trim().toLowerCase(), form.password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.request && !err.response
          ? 'Cannot connect to server. Please ensure backend is running.'
          : err.message || 'Login failed. Please check your credentials.');
      setServerError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 50%, #F5F3FF 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', boxShadow: 'var(--shadow-primary)'
          }}>
            <Zap size={24} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -0.5 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
            Sign in to SkillSwap
          </p>
        </div>

        <div className="card" style={{ padding: 28 }}>
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
                gap: 9
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{serverError}</span>
            </div>
          )}

          {/* Quick Demo Login Option */}
          <div style={{
            marginBottom: 20,
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
            borderRadius: 'var(--radius)',
            border: '1px solid #DDD6FE'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--purple)' }}>
                ⚡ Instant Evaluation
              </span>
              <span className="badge" style={{ fontSize: 10, background: '#EDE9FE', color: 'var(--purple)', border: '1px solid #C4B5FD' }}>
                Navitha Chekuri
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: '#4B5563', marginBottom: 12, lineHeight: 1.4 }}>
              Experience SkillSwap as <strong>Navitha Chekuri</strong> (Scaler School of Technology, Second Year) with live seeded proposals, sessions & reviews.
            </div>
            <button
              id="demo-login-btn"
              type="button"
              className="btn btn-primary"
              onClick={handleDemoLogin}
              disabled={demoLoading || loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                borderColor: '#6D28D9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontWeight: 600
              }}
            >
              {demoLoading ? <span className="spin">◌</span> : <Zap size={16} />}
              {demoLoading ? 'Signing in as Navitha...' : 'Demo Login as Navitha Chekuri'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              or student sign in
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label required">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className={`form-input${errors.email ? ' error' : ''}`}
                  style={{ paddingLeft: 36 }}
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  autoComplete="email"
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
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  autoComplete="current-password"
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

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: 4 }} disabled={loading || demoLoading}>
              {loading ? <span className="spin">◌</span> : null}
              {loading ? 'Signing in...' : 'Sign In with Password'}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{
            marginTop: 16, padding: '10px 14px', background: 'var(--primary-50)',
            borderRadius: 'var(--radius)', border: '1px solid var(--primary-100)'
          }}>
            <p style={{ fontSize: 12, color: 'var(--primary-600)', textAlign: 'center' }}>
              New here? <Link to="/register" style={{ fontWeight: 700 }}>Create an account</Link> to get started.
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13.5, color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
