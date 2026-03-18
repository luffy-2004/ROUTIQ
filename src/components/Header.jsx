import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/routiq-logo.png';

export default function Header() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header style={styles.header}>
      <div className="container" style={styles.container}>
        <Link to="/home" style={styles.logoContainer}>
          <img src={logo} alt="Routiq" style={styles.logoImg} />
          <h2 style={styles.logo}>Routiq</h2>
        </Link>
        <nav style={styles.nav}>
          <a href="/" style={styles.navLink}>Dashboard</a>
          <a href="/add-task" style={styles.navLink}>Add Task</a>
          <a href="/habits" style={styles.navLink}>Habits</a>
          <a href="/progress" style={styles.navLink}>Progress</a>
          <a href="/my-data" style={styles.navLink}>My Data</a>
          <a href="/notes" style={styles.navLink}>Notes</a>
          <a href="/chat" style={styles.navLink}>AI Chat</a>
          <a href="/profile" style={styles.navLink}>Profile</a>
        </nav>
        <div style={styles.userSection}>
          <span style={styles.userName}>{user?.displayName || user?.email}</span>
          <button
            onClick={handleLogout}
            style={{
              ...styles.logoutButton,
              opacity: isLoggingOut ? 0.7 : 1,
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
            }}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: 'var(--primary-color)',
    color: 'white',
    padding: 'var(--spacing) 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoImg: {
    width: '100px',
    height: '100px',
    objectFit: 'contain',
  },
  logo: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
  },
  nav: {
    display: 'flex',
    gap: '30px',
    flex: 1,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'opacity 0.3s ease',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userName: {
    fontSize: '13px',
    opacity: 0.9,
  },
  logoutButton: {
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
};
