/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard';

function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');

  const fetchJobs = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;
      if (type) params.type = type;

      const res = await axios.get('http://localhost:5000/api/jobs', { params });
      setJobs(res.data);
    } catch {
      console.log('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleReset = () => {
    setSearch('');
    setLocation('');
    setType('');
    setTimeout(() => fetchJobs(), 100);
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Find Your Dream Job</h1>
        <p style={styles.heroSubtitle}>Browse hundreds of job opportunities across Malaysia</p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            style={styles.searchInput}
            type='text'
            placeholder='Search job title or company...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            style={styles.searchInput}
            type='text'
            placeholder='Location e.g. Kuala Lumpur'
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <select
            style={styles.searchSelect}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value=''>All Types</option>
            <option value='Full-time'>Full-time</option>
            <option value='Part-time'>Part-time</option>
            <option value='Remote'>Remote</option>
            <option value='Internship'>Internship</option>
            <option value='Contract'>Contract</option>
          </select>
          <button style={styles.searchBtn} type='submit'>Search</button>
          <button style={styles.resetBtn} type='button' onClick={handleReset}>Reset</button>
        </form>
      </div>

      {/* Jobs Section */}
      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>
          {jobs.length} Job{jobs.length !== 1 ? 's' : ''} Available
        </h2>
        {loading ? (
          <p style={styles.loading}>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div style={styles.empty}>
            <p>No jobs found. Try different search terms!</p>
          </div>
        ) : (
          <div style={styles.jobGrid}>
            {jobs.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: 'calc(100vh - 60px)' },
  hero: { backgroundColor: '#1e40af', padding: '60px 30px', textAlign: 'center' },
  heroTitle: { fontSize: '42px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' },
  heroSubtitle: { fontSize: '18px', color: '#bfdbfe', marginBottom: '32px' },
  searchForm: { display: 'flex', gap: '12px', maxWidth: '900px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' },
  searchInput: { flex: 1, minWidth: '200px', padding: '12px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', outline: 'none' },
  searchSelect: { padding: '12px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', outline: 'none', minWidth: '150px' },
  searchBtn: { padding: '12px 24px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' },
  resetBtn: { padding: '12px 24px', backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' },
  content: { maxWidth: '1100px', margin: '40px auto', padding: '0 20px' },
  sectionTitle: { fontSize: '22px', fontWeight: 'bold', color: '#1e1e2e', marginBottom: '24px' },
  loading: { textAlign: 'center', color: '#888', fontSize: '16px' },
  empty: { textAlign: 'center', padding: '60px', color: '#888', backgroundColor: '#fff', borderRadius: '12px' },
  jobGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }
};

export default Home;