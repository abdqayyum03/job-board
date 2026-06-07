import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import SelectRole from './pages/SelectRole';
import AuthSuccess from './pages/AuthSuccess';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import EmployerDashboard from './pages/EmployerDashboard';
import CandidateDashboard from './pages/CandidateDashboard';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={!user ? <Login /> : <Navigate to='/' />} />
        <Route path='/register' element={!user ? <Register /> : <Navigate to='/' />} />
        <Route path='/verify-otp' element={<VerifyOTP />} />
        <Route path='/select-role' element={<SelectRole />} />
        <Route path='/auth/success' element={<AuthSuccess />} />
        <Route path='/jobs/:id' element={<JobDetail />} />
        <Route path='/employer/dashboard' element={
          <ProtectedRoute allowedRole='employer'>
            <EmployerDashboard />
          </ProtectedRoute>
        } />
        <Route path='/candidate/dashboard' element={
          <ProtectedRoute allowedRole='candidate'>
            <CandidateDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;