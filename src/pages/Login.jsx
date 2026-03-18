import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/routiq-logo.png';


export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Form validation
  const validateForm = () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Please enter your password');
      return false;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return false;
    }
    if (isSignUp && !displayName.trim()) {
      setError('Please enter your name');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Form submitted:', { isSignUp, email });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Starting auth process...');
      if (isSignUp) {
        // Sign up
        console.log('Calling register...');
        await register(email, password, displayName);
        console.log('Register successful');
        setEmail('');
        setPassword('');
        setDisplayName('');
        navigate('/');
      } else {
        // Login
        console.log('Calling login...');
        await login(email, password);
        console.log('Login successful');
        setEmail('');
        setPassword('');
        navigate('/');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login and signup
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <div className="container" style={styles.container}>
      <div className="card" style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <img src={logo} alt="Routiq Logo" style={styles.logo} />
          <h1 style={styles.heading}>Routiq</h1>
          <p style={styles.tagline}>Let's get learning 🎓</p>
        </div>

        {/* Form Title */}
        <h2 style={styles.formTitle}>
          {isSignUp ? 'Create Your Account' : 'Welcome Back'}
        </h2>

        {/* Error Message */}
        {error && (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Name Field (only for signup) */}
          {isSignUp && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your full name"
                style={styles.input}
                disabled={loading}
              />
            </div>
          )}

          {/* Email Field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={styles.input}
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={styles.input}
              disabled={loading}
            />
            {isSignUp && (
              <p style={styles.hint}>Minimum 6 characters</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
          >
            {loading
              ? 'Loading...'
              : isSignUp
              ? 'Sign Up'
              : 'Login'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={styles.toggleContainer}>
          <p style={styles.toggleText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              type="button"
              onClick={toggleMode}
              style={styles.toggleButton}
              disabled={loading}
            >
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Info Text */}
        <p style={styles.infoText}>
          {isSignUp
            ? 'By signing up, you agree to use Routiq responsibly and securely.'
            : 'Your data is secure with Firebase authentication.'}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px 30px',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '420px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '30px',
  },
  logo: {
    width: '150px',
    maxWidth: '100%',
    height: 'auto',
    marginBottom: '20px',
  },
  heading: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0',
  },
  tagline: {
    color: '#667eea',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0',
    letterSpacing: '0.5px',
  },
  formTitle: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '24px',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorContainer: {
    background: '#fee',
    border: '1px solid #fcc',
    borderRadius: '6px',
    padding: '12px 15px',
    marginBottom: '20px',
  },
  errorText: {
    color: '#c33',
    fontSize: '13px',
    margin: '0',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '6px',
  },
  input: {
    padding: '12px 14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.3s ease',
    outline: 'none',
  },
  hint: {
    fontSize: '12px',
    color: '#999',
    margin: '6px 0 0 0',
  },
  button: {
    padding: '13px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  toggleContainer: {
    textAlign: 'center',
    marginBottom: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #eee',
  },
  toggleText: {
    fontSize: '14px',
    color: '#666',
    margin: '0',
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0',
    textDecoration: 'underline',
  },
  infoText: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'center',
    margin: '0',
    lineHeight: '1.4',
  },
};
