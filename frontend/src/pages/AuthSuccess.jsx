/* eslint-disable */
import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function AuthSuccess() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        login(user, token);
        navigate('/');
      } catch {
        navigate('/register');
      }
    } else {
      navigate('/register');
    }
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Signing you in...</h2>
      <p>Please wait a moment!</p>
    </div>
  );
}

export default AuthSuccess;