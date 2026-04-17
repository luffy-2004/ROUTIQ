/**
 * useAuth Hook
 * Manages user authentication state and provides auth functions
 */

import { useState, useEffect, useContext, createContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { signUp, signIn, logout } from '../services/authService';

// Create auth context
const AuthContext = createContext(null);

/**
 * Custom hook to use authentication
 * @returns {Object} Auth state and functions
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email, password, displayName) => {
    try {
      setError(null);
      setLoading(true);
      console.log('useAuth.register called');
      const newUser = await signUp(email, password, displayName);
      console.log('useAuth: signUp returned:', newUser);
      setUser(newUser);
      return newUser;
    } catch (err) {
      console.error('useAuth.register error:', err);
      const errorMsg = err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      console.log('useAuth.login called');
      const loggedInUser = await signIn(email, password);
      console.log('useAuth: signIn returned:', loggedInUser);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      console.error('useAuth.login error:', err);
      const errorMsg = err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    try {
      setError(null);
      await logout();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    register,
    login,
    logOut,
    isAuthenticated: !!user,
  };
};

export default useAuth;
