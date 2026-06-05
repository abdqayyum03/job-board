import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Register() {
  const { login } = useContext(AuthContext);
  const [role, setRole] = useState('candidate');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', company: '', companyDescription: '', bio: '', skills: '' });
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
      const payload = {
        ...formData,
        role,
        skills: role === 'candidate' ? formData.skills.split(',').map(s => s.trim()) : []
      };
      const res = await axios.post('http://localhost:5000/api/auth/register', payload);
      login(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join the Job Board today</p>

        {/* Role Selector */}
        <div style={styles.roleRow}>
          <button
            type='button'
            style={role === 'candidate' ? styles.roleActive : styles.roleInactive}
            onClick={() => setRole('candidate')}
          >
            👤 I am a Candidate
          </button>
          <button
            type='button'
            style={role === 'employer' ? styles.roleActive : styles.roleInactive}
            onClick={() => setRole('employer')}
          >
            👔 I am an Employer
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input style={styles.input} type='text' name='name' placeholder='John Doe' value={formData.name} onChange={handleChange} required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type='email' name='email' placeholder='john@example.com' value={formData.email} onChange={handleChange} required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type='password' name='password' placeholder='Minimum 6 characters' value={formData.password} onChange={handleChange} required />
          </div>

          {/* Candidate Fields */}
          {role === 'candidate' && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Bio</label>
                <input style={styles.input} type='text' name='bio' placeholder='e.g. Fresh graduate looking for opportunities' value={formData.bio} onChange={handleChange} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Skills (comma separated)</label>
                <input style={styles.input} type='text' name='skills' placeholder='e.g. React, Node.js, MongoDB' value={formData.skills} onChange={handleChange} />
              </div>
            </>
          )}

          {/* Employer Fields */}
          {role === 'employer' && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Company Name</label>
                <input style={styles.input} type='text' name='company' placeholder='e.g. Tech Solutions Sdn Bhd' value={formData.company} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Company Description</label>
                <input style={styles.input} type='text' name='companyDescription' placeholder='Tell candidates about your company' value={formData.companyDescription} onChange={handleChange} />
              </div>
            </>
          )}

          <button style={styles.button} type='submit' disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <p style={styles.link}>Already have an account? <a href='/login' style={styles.anchor}>Login here</a></p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: 'calc(100vh - 60px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  card: { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '480px' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#1e1e2e', marginBottom: '6px' },
  subtitle: { color: '#888', marginBottom: '24px', fontSize: '14px' },
  roleRow: { display: 'flex', gap: '12px', marginBottom: '24px' },
  roleActive: { flex: 1, padding: '12px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' },
  roleInactive: { flex: 1, padding: '12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#374151' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' },
  button: { width: '100%', padding: '12px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', marginTop: '8px' },
  link: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#555' },
  anchor: { color: '#1e40af', fontWeight: 'bold', textDecoration: 'none' }
};

export default Register;