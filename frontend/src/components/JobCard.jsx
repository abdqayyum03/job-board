function JobCard({ job }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>{job.title}</h3>
          <p style={styles.company}>{job.company}</p>
        </div>
        <span style={styles.typeBadge}>{job.type}</span>
      </div>
      <div style={styles.details}>
        <span style={styles.detail}>📍 {job.location}</span>
        {job.salaryMin && job.salaryMax && (
          <span style={styles.detail}>
            💰 RM {job.salaryMin.toLocaleString()} - RM {job.salaryMax.toLocaleString()}
          </span>
        )}
      </div>
      <p style={styles.description}>
        {job.description.length > 120 ? job.description.substring(0, 120) + '...' : job.description}
      </p>
      <div style={styles.footer}>
        <span style={styles.date}>
          Posted {new Date(job.createdAt).toLocaleDateString('en-MY')}
        </span>
        <a href={`/jobs/${job._id}`} style={styles.viewBtn}>View Details →</a>
      </div>
    </div>
  );
}

const styles = {
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', transition: 'transform 0.2s' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  title: { fontSize: '18px', fontWeight: 'bold', color: '#1e1e2e', marginBottom: '4px' },
  company: { fontSize: '14px', color: '#6b7280' },
  typeBadge: { backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' },
  details: { display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' },
  detail: { fontSize: '13px', color: '#6b7280' },
  description: { fontSize: '14px', color: '#4b5563', lineHeight: '1.6', marginBottom: '16px' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: '12px', color: '#9ca3af' },
  viewBtn: { backgroundColor: '#1e40af', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }
};

export default JobCard;