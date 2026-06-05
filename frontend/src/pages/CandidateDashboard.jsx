/* eslint-disable */
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function CandidateDashboard() {
  const { user, token } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/applications/candidate/all', config);
        setApplications(res.data);
      } catch {
        setError('Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Candidate Dashboard</h1>
        <p style={styles.subtitle}>Welcome back, {user?.name}! 👤</p>
      </div>

      {/* Stats Card */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Applications</p>
          <h2 style={styles.statNumber}>{applications.length}</h2>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Pending</p>
          <h2 style={styles.statNumber}>{applications.filter(a => a.status === 'Pending').length}</h2>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Accepted</p>
          <h2 style={styles.statNumber}>{applications.filter(a => a.status === 'Accepted').length}</h2>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Rejected</p>
          <h2 style={styles.statNumber}>{applications.filter(a => a.status === 'Rejected').length}</h2>
        </div>
      </div>

      {/* Applications List */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>My Applications</h2>
        {error && <div style={styles.error}>{error}</div>}
        {applications.length === 0 ? (
          <div style={styles.empty}>
            <p>You haven't applied for any jobs yet.</p>
            <a href='/' style={styles.browseBtn}>Browse Jobs →</a>
          </div>
        ) : (
          applications.map(app => (
            <div key={app._id} style={styles.appCard}>
              <div style={styles.appLeft}>
                <h3 style={styles.jobTitle}>{app.job?.title}</h3>
                <p style={styles.appMeta}>{app.job?.company} • {app.job?.location} • {app.job?.type}</p>
                <p style={styles.appMeta}>
                  Applied on {new Date(app.createdAt).toLocaleDateString('en-MY')}
                </p>
              </div>
              <div style={styles.appRight}>
                <span style={
                  app.status === 'Accepted' ? styles.acceptedBadge :
                  app.status === 'Rejected' ? styles.rejectedBadge :
                  app.status === 'Reviewed' ? styles.reviewedBadge :
                  styles.pendingBadge
                }>
                  {app.status}
                </span>
                <a href={`/jobs/${app.job?._id}`} style={styles.viewBtn}>View Job</a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Browse More Jobs */}
      <div style={styles.browseSection}>
        <h3 style={styles.browseTitle}>Looking for more opportunities?</h3>
        <a href='/' style={styles.browseLink}>Browse All Jobs →</a>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '40px auto', padding: '0 20px' },
  loading: { textAlign: 'center', marginTop: '60px', fontSize: '18px', color: '#888' },
  header: { marginBottom: '24px' },
  title: { fontSize: '28px', fontWeight: 'bold', color: '#1e1e2e' },
  subtitle: { color: '#6b7280', fontSize: '15px', marginTop: '4px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: '#1e40af', color: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center' },
  statLabel: { fontSize: '13px', opacity: 0.8, marginBottom: '8px' },
  statNumber: { fontSize: '32px', fontWeight: 'bold' },
  section: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: '24px' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e1e2e', marginBottom: '16px' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '16px' },
  empty: { textAlign: 'center', padding: '40px', color: '#888' },
  browseBtn: { display: 'inline-block', marginTop: '12px', backgroundColor: '#1e40af', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' },
  appCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb' },
  appLeft: { flex: 1 },
  jobTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1e1e2e', marginBottom: '4px' },
  appMeta: { fontSize: '13px', color: '#6b7280', marginBottom: '2px' },
  appRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
  pendingBadge: { backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  acceptedBadge: { backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  rejectedBadge: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  reviewedBadge: { backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  viewBtn: { fontSize: '13px', color: '#1e40af', fontWeight: 'bold', textDecoration: 'none' },
  browseSection: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  browseTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1e1e2e', marginBottom: '12px' },
  browseLink: { color: '#1e40af', fontWeight: 'bold', textDecoration: 'none', fontSize: '15px' }
};

export default CandidateDashboard;