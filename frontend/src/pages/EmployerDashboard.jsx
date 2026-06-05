/* eslint-disable */
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function EmployerDashboard() {
  const { user, token } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '', company: user?.company || '', location: '',
    type: 'Full-time', description: '', requirements: '',
    salaryMin: '', salaryMax: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/jobs');
      const myJobs = res.data.filter(job => job.employer._id === user.id);
      setJobs(myJobs);
    } catch {
      setError('Failed to fetch jobs');
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/applications/employer/all', config);
      setApplications(res.data);
    } catch {
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        requirements: formData.requirements.split(',').map(r => r.trim())
      };
      await axios.post('http://localhost:5000/api/jobs', payload, config);
      setMessage('Job posted successfully! 🎉');
      setShowForm(false);
      setFormData({ title: '', company: user?.company || '', location: '', type: 'Full-time', description: '', requirements: '', salaryMin: '', salaryMax: '' });
      fetchJobs();
    } catch {
      setError('Failed to post job');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${id}`, config);
      setMessage('Job deleted successfully!');
      fetchJobs();
    } catch {
      setError('Failed to delete job');
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        { status },
        config
      );
      setMessage(`Application ${status}! Email sent to candidate.`);
      fetchApplications();
    } catch {
      setError('Failed to update status');
    }
  };

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Employer Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {user?.name}! 👔</p>
        </div>
        <button style={styles.postBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Post New Job'}
        </button>
      </div>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* Post Job Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Post a New Job</h3>
          <form onSubmit={handlePostJob}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Job Title</label>
                <input style={styles.input} type='text' name='title' placeholder='e.g. Frontend Developer' value={formData.title} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Company</label>
                <input style={styles.input} type='text' name='company' placeholder='Company name' value={formData.company} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <input style={styles.input} type='text' name='location' placeholder='e.g. Kuala Lumpur' value={formData.location} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Job Type</label>
                <select style={styles.input} name='type' value={formData.type} onChange={handleChange}>
                  <option value='Full-time'>Full-time</option>
                  <option value='Part-time'>Part-time</option>
                  <option value='Remote'>Remote</option>
                  <option value='Internship'>Internship</option>
                  <option value='Contract'>Contract</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Min Salary (RM)</label>
                <input style={styles.input} type='number' name='salaryMin' placeholder='e.g. 3000' value={formData.salaryMin} onChange={handleChange} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Max Salary (RM)</label>
                <input style={styles.input} type='number' name='salaryMax' placeholder='e.g. 5000' value={formData.salaryMax} onChange={handleChange} />
              </div>
              <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                <label style={styles.label}>Requirements (comma separated)</label>
                <input style={styles.input} type='text' name='requirements' placeholder='e.g. React, Node.js, MongoDB' value={formData.requirements} onChange={handleChange} />
              </div>
              <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                <label style={styles.label}>Job Description</label>
                <textarea style={styles.textarea} name='description' placeholder='Describe the role and responsibilities...' value={formData.description} onChange={handleChange} rows={4} required />
              </div>
            </div>
            <button style={styles.submitBtn} type='submit'>Post Job</button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={activeTab === 'jobs' ? styles.tabActive : styles.tabInactive} onClick={() => setActiveTab('jobs')}>
          My Jobs ({jobs.length})
        </button>
        <button style={activeTab === 'applications' ? styles.tabActive : styles.tabInactive} onClick={() => setActiveTab('applications')}>
          Applications ({applications.length})
        </button>
      </div>

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div style={styles.section}>
          {jobs.length === 0 ? (
            <div style={styles.empty}>No jobs posted yet. Click "Post New Job" to get started!</div>
          ) : (
            jobs.map(job => (
              <div key={job._id} style={styles.jobCard}>
                <div>
                  <h3 style={styles.jobTitle}>{job.title}</h3>
                  <p style={styles.jobMeta}>{job.location} • {job.type} • RM {job.salaryMin?.toLocaleString()} - RM {job.salaryMax?.toLocaleString()}</p>
                </div>
                <div style={styles.jobActions}>
                  <span style={job.isOpen ? styles.openBadge : styles.closedBadge}>
                    {job.isOpen ? 'Open' : 'Closed'}
                  </span>
                  <button style={styles.deleteBtn} onClick={() => handleDeleteJob(job._id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div style={styles.section}>
          {applications.length === 0 ? (
            <div style={styles.empty}>No applications received yet.</div>
          ) : (
            applications.map(app => (
              <div key={app._id} style={styles.appCard}>
                <div style={styles.appLeft}>
                  <h3 style={styles.appName}>{app.candidate?.name}</h3>
                  <p style={styles.appMeta}>{app.candidate?.email}</p>
                  <p style={styles.appMeta}>Applied for: <strong>{app.job?.title}</strong></p>
                  {app.candidate?.skills?.length > 0 && (
                    <div style={styles.skillsRow}>
                      {app.candidate.skills.map((skill, i) => (
                        <span key={i} style={styles.skillBadge}>{skill}</span>
                      ))}
                    </div>
                  )}
                  <p style={styles.coverLetter}>"{app.coverLetter}"</p>
                  <a href={`http://localhost:5000/${app.resume}`} target='_blank' style={styles.resumeLink}>📄 View Resume</a>
                </div>
                <div style={styles.appRight}>
                  <span style={
                    app.status === 'Accepted' ? styles.acceptedBadge :
                    app.status === 'Rejected' ? styles.rejectedBadge :
                    styles.pendingBadge
                  }>
                    {app.status}
                  </span>
                  {app.status === 'Pending' && (
                    <div style={styles.statusBtns}>
                      <button style={styles.acceptBtn} onClick={() => handleUpdateStatus(app._id, 'Accepted')}>Accept</button>
                      <button style={styles.rejectBtn} onClick={() => handleUpdateStatus(app._id, 'Rejected')}>Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '40px auto', padding: '0 20px' },
  loading: { textAlign: 'center', marginTop: '60px', fontSize: '18px', color: '#888' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '28px', fontWeight: 'bold', color: '#1e1e2e' },
  subtitle: { color: '#6b7280', fontSize: '15px', marginTop: '4px' },
  postBtn: { backgroundColor: '#1e40af', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' },
  success: { backgroundColor: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: '500' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' },
  formCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  formTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#1e1e2e' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  input: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' },
  textarea: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', resize: 'vertical' },
  submitBtn: { marginTop: '16px', padding: '10px 24px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
  tabActive: { padding: '10px 24px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' },
  tabInactive: { padding: '10px 24px', backgroundColor: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' },
  section: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  empty: { textAlign: 'center', padding: '40px', color: '#888' },
  jobCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb' },
  jobTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1e1e2e', marginBottom: '4px' },
  jobMeta: { fontSize: '13px', color: '#6b7280' },
  jobActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  openBadge: { backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  closedBadge: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' },
  appCard: { display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #e5e7eb', gap: '16px' },
  appLeft: { flex: 1 },
  appName: { fontSize: '16px', fontWeight: 'bold', color: '#1e1e2e', marginBottom: '4px' },
  appMeta: { fontSize: '13px', color: '#6b7280', marginBottom: '4px' },
  skillsRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0' },
  skillBadge: { backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
  coverLetter: { fontSize: '13px', color: '#4b5563', fontStyle: 'italic', margin: '8px 0' },
  resumeLink: { fontSize: '13px', color: '#1e40af', fontWeight: 'bold' },
  appRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' },
  pendingBadge: { backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  acceptedBadge: { backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  rejectedBadge: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  statusBtns: { display: 'flex', gap: '8px' },
  acceptBtn: { backgroundColor: '#d1fae5', color: '#065f46', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' },
  rejectBtn: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' }
};

export default EmployerDashboard;