import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={styles.nav}>
      <a href='/' style={styles.logo}>💼 Job Board</a>
      <div style={styles.right}>
        {!user ? (
          <>
            <a href='/login' style={styles.link}>Login</a>
            <a href='/register' style={styles.button}>Register</a>
          </>
        ) : (
          <>
            <span style={styles.welcome}>Hi, {user.name}!</span>
            <a
              href={user.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard'}
              style={styles.link}
            >
              Dashboard
            </a>
            <button style={styles.logoutBtn} onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { backgroundColor: '#1e40af', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },
  logo: { color: '#fff', fontSize: '22px', fontWeight: 'bold', textDecoration: 'none' },
  right: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: '#bfdbfe', fontSize: '14px' },
  link: { color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
  button: { backgroundColor: '#fff', color: '#1e40af', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' },
  logoutBtn: { backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff', padding: '6px 14px', borderRadius: '6px', fontSize: '14px' }
};

export default Navbar;