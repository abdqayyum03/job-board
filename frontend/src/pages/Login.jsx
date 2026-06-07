// eslint-disable 
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      login(res.data.user, res.data.token);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.needsVerification) {
        navigate('/verify-otp', { state: { email: errData.email } });
      } else {
        setError(errData?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back!</h2>
        <p style={styles.subtitle}>Login to your Job Board account</p>

        {/* Google Sign In Button */}
        <a
          href='http://localhost:5000/api/auth/google'
          style={styles.googleBtn}
          target='_self'
          rel='noopener noreferrer'
        >
          <img
            src='https://www.google.com/favicon.ico'
            alt='Google'
            style={styles.googleIcon}
          />
          Continue with Google
        </a>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>Or with email and password</span>
          <div style={styles.dividerLine}></div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type='email'
              name='email'
              placeholder='john@example.com'
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type='password'
              name='password'
              placeholder='Enter your password'
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button style={styles.button} type='submit' disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={styles.link}>
          Don't have an account?{' '}
          <a href='/register' style={styles.anchor}>Register here</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: 'calc(100vh - 60px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  card: { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#1e1e2e', marginBottom: '6px' },
  subtitle: { color: '#888', marginBottom: '24px', fontSize: '14px' },
  googleBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '12px', backgroundColor: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', fontWeight: '600', textDecoration: 'none', marginBottom: '16px' },
  googleIcon: { width: '20px', height: '20px' },
  divider: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  dividerLine: { flex: 1, height: '1px', backgroundColor: '#e5e7eb' },
  dividerText: { fontSize: '13px', color: '#9ca3af', whiteSpace: 'nowrap' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#374151' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' },
  button: { width: '100%', padding: '12px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', marginTop: '8px' },
  link: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#555' },
  anchor: { color: '#1e40af', fontWeight: 'bold', textDecoration: 'none' }
};

export default Login;