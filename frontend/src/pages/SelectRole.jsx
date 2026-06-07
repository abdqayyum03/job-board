// eslint-disable
import { useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function SelectRole() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const [role, setRole] = useState('candidate');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/set-role', {
        userId, role, company
      });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconWrapper}>
          <span style={styles.icon}>🎯</span>
        </div>
        <h2 style={styles.title}>One Last Step!</h2>
        <p style={styles.subtitle}>How will you be using Job Board?</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.roleRow}>
          <button
            style={role === 'candidate' ? styles.roleActive : styles.roleInactive}
            onClick={() => setRole('candidate')}
          >
            👤 I am a Candidate
          </button>
          <button
            style={role === 'employer' ? styles.roleActive : styles.roleInactive}
            onClick={() => setRole('employer')}
          >
            👔 I am an Employer
          </button>
        </div>

        {role === 'employer' && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Company Name</label>
            <input
              style={styles.input}
              type='text'
              placeholder='e.g. Tech Solutions Sdn Bhd'
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>
        )}

        <button
          style={styles.button}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: 'calc(100vh - 60px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  card: { backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '440px', textAlign: 'center' },
  iconWrapper: { width: '80px', height: '80px', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  icon: { fontSize: '36px' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#1e1e2e', marginBottom: '8px' },
  subtitle: { color: '#6b7280', fontSize: '14px', marginBottom: '24px' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  roleRow: { display: 'flex', gap: '12px', marginBottom: '24px' },
  roleActive: { flex: 1, padding: '14px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' },
  roleInactive: { flex: 1, padding: '14px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' },
  formGroup: { marginBottom: '16px', textAlign: 'left' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#374151' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' },
  button: { width: '100%', padding: '14px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }
};

export default SelectRole;