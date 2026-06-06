/* eslint-disable */
import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function VerifyOTP() {
  const { login } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  // Redirect if no email
  useEffect(() => {
    if (!email) navigate('/register');
  }, [email]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // numbers only
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp: otpString
      });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setMessage('');
    try {
      await axios.post('http://localhost:5000/api/auth/resend-otp', { email });
      setMessage('New OTP sent to your email!');
      setCountdown(300);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Icon */}
        <div style={styles.iconWrapper}>
          <span style={styles.icon}>📧</span>
        </div>

        <h2 style={styles.title}>Verify Your Email</h2>
        <p style={styles.subtitle}>
          We sent a 6-digit OTP to
        </p>
        <p style={styles.email}>{email}</p>

        {/* Timer */}
        <div style={countdown > 0 ? styles.timer : styles.timerExpired}>
          {countdown > 0 ? (
            <>⏱️ OTP expires in <strong>{formatTime(countdown)}</strong></>
          ) : (
            <>⚠️ OTP has expired. Please resend.</>
          )}
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}

        {/* OTP Input Boxes */}
        <div style={styles.otpRow} onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              style={styles.otpInput}
              type='text'
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          style={styles.verifyBtn}
          onClick={handleVerify}
          disabled={loading || countdown === 0}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        {/* Resend OTP */}
        <div style={styles.resendRow}>
          <span style={styles.resendText}>Didn't receive the OTP?</span>
          <button
            style={styles.resendBtn}
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>

        <p style={styles.backLink}>
          <a href='/register' style={styles.anchor}>← Back to Register</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: 'calc(100vh - 60px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  card: { backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '440px', textAlign: 'center' },
  iconWrapper: { width: '80px', height: '80px', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  icon: { fontSize: '36px' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#1e1e2e', marginBottom: '8px' },
  subtitle: { color: '#6b7280', fontSize: '14px', marginBottom: '4px' },
  email: { color: '#1e40af', fontWeight: 'bold', fontSize: '15px', marginBottom: '20px' },
  timer: { backgroundColor: '#dbeafe', color: '#1e40af', padding: '10px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  timerExpired: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  success: { backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  otpRow: { display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' },
  otpInput: { width: '48px', height: '56px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold', borderRadius: '10px', border: '2px solid #d1d5db', outline: 'none', color: '#1e40af' },
  verifyBtn: { width: '100%', padding: '14px', backgroundColor: '#1e40af', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' },
  resendRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' },
  resendText: { fontSize: '13px', color: '#6b7280' },
  resendBtn: { backgroundColor: 'transparent', border: 'none', color: '#1e40af', fontWeight: 'bold', fontSize: '13px', textDecoration: 'underline' },
  backLink: { fontSize: '13px', marginTop: '8px' },
  anchor: { color: '#6b7280', textDecoration: 'none' }
};

export default VerifyOTP;