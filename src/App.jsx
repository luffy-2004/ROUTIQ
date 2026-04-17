import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import { useAuth } from './hooks/useAuth';
import bgImage from './assets/background.png';
import Revision from './pages/Revision'; // Add this line

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AddTask from './pages/AddTask';
import Progress from './pages/Progress';
import Notes from './pages/Notes';
import MyData from './pages/MyData';
import AIChat from './pages/AIChat';
import Profile from './pages/Profile';
import Habits from './pages/Habits';
import TestFirebase from './pages/TestFirebase';
import SimpleLogin from './pages/SimpleLogin';

// Components
import Header from './components/Header';

// Protected Route Component
function ProtectedRoute({ children, isAuthenticated, isLoading }) {
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const { user, loading, isAuthenticated } = useAuth();

  // helper component to wrap routes and access location inside Router
  const PageWrapper = ({ children }) => {
    const location = useLocation();
    return <div key={location.pathname} className="page-container">{children}</div>;
  };

  return (
    <div className="app-bg" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="app-overlay" />
      <Router>
        {isAuthenticated && !loading && <Header />}
        <PageWrapper>
          <Routes>
        {/* Public Routes */}
        <Route
          path="/home"
          element={<Home />}
        />
        <Route
          path="/login"
          element={
            isAuthenticated && !loading ? (
              <Navigate to="/" replace />
            ) : (
              <Login />
            )
          }
        />
        {/* Test Routes */}
        <Route path="/test-firebase" element={<TestFirebase />} />
        <Route path="/simple-login" element={<SimpleLogin />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isLoading={loading}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-task"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isLoading={loading}
            >
              <AddTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isLoading={loading}
            >
              <Progress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isLoading={loading}
            >
              <Notes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-data"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isLoading={loading}
            >
              <MyData />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isLoading={loading}
            >
              <AIChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isLoading={loading}
            >
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/habits"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isLoading={loading}
            >
              <Habits />
            </ProtectedRoute>
          }
        />
        <Route
  path="/revision"
  element={
    <ProtectedRoute
      isAuthenticated={isAuthenticated}
      isLoading={loading}
    >
      <Revision />
    </ProtectedRoute>
  }
/>

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </PageWrapper>
    </Router>
</div>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  spinner: {
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
};

// Add keyframe animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default App;
