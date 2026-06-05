// eslint-disable 
import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function JobDetail() {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/jobs/${id}`);
        setJob(res.data);
      } catch {
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resume) {
      setError('Please upload your resume!');
      return;
    }
    setApplying(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      formData.append('resume', resume);

      await axios.post(
        `http://localhost:5000/api/applications/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setMessage('Application submitted successfully! 🎉');
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading job details...</div>;
  if (!job) return <div style={styles.loading}>Job not found!</div>;

  return (
    <div style={styles.container}>
      {/* Job Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{job.title}</h1>
          <p style={styles.company}>{job.company}</p>
          <div style={styles.tags}>
            <span style={styles.tag}>📍 {job.location}</span>
            <span style={styles.tag}>💼 {job.type}</span>
            {job.salaryMin && job.salaryMax && (
              <span style={styles.tag}>
                💰 RM {job.salaryMin.toLocaleString()} - RM {job.salaryMax.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        {user?.role === 'candidate' && job.isOpen && (
          <button
            style={styles.applyBtn}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Apply Now'}
          </button>
        )}
      </div>

      {/* Success Message */}
      {message && <div style={styles.success}>{message}</div>}

      {/* Apply Form */}
      {showForm && (
        <div style={styles.applyForm}>
          <h3 style={styles.formTitle}>Apply for {job.title}</h3>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleApply}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Cover Letter</label>
              <textarea
                style={styles.textarea}
                placeholder='Tell the employer why you are the best candidate...'
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Resume (PDF only)</label>
              <input
                style={styles.fileInput}
                type='file'
                accept='.pdf'
                onChange={(e) => setResume(e.target.files[0])}
                required
              />
            </div>
            <button style={styles.submitBtn} type='submit' disabled={applying}>
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      )}

      {/* Job Details */}
      <div style={styles.content}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Job Description</h2>
          <p style={styles.text}>{job.description}</p>
        </div>

        {job.requirements && job.requirements.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Requirements</h2>
            <ul style={styles.list}>
              {job.requirements.map((req, index) => (
                <li key={index} style={styles.listItem}>✅ {req}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>About the Company</h2>
          <p style={styles.text}><strong>{job.employer?.company}</strong></p>
          {job.employer?.companyDescription && (
            <p style={styles.text}>{job.employer.companyDescription}</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '40px auto', padding: '0 20px' },
  loading: { textAlign: 'center', marginTop: '60px', fontSize: '18px', color: '#888' },
  header: { backgroundColor: '#fff', borderRadius: '12px', padding: '30px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: '28px', fontWeight: 'bold', color: '#1e1e2e', marginBottom: '8px' },
  company: { fontSize: '16px', color: '#6b7280', marginBottom: '12px' },
  tags: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  tag: { backgroundColor: '#dbeafe', color: '#1e40af', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },
  applyBtn: { backgroundColor: '#1e40af', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap' },
  success: { backgroundColor: '#d1fae5', color: '#065f46', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontWeight: '500' },
  applyForm: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  formTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#1e1e2e' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#374151' },
  textarea: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', resize: 'vertical' },
  fileInput: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' },
  submitBtn: { padding: '10px 24px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' },
  content: { display: 'flex', flexDirection: 'column', gap: '20px' },
  section: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e1e2e', marginBottom: '12px' },
  text: { fontSize: '15px', color: '#4b5563', lineHeight: '1.7' },
  list: { paddingLeft: '8px', listStyle: 'none' },
  listItem: { fontSize: '14px', color: '#4b5563', marginBottom: '8px' }
};

export default JobDetail;