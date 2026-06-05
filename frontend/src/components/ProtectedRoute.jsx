import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  if (!user) return <Navigate to='/login' />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to='/' />;
  }

  return children;
}

export default ProtectedRoute;