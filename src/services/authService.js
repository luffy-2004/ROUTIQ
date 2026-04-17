/**
 * Firebase Authentication Service
 * Handles user signup, signin, and logout
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User's name
 * @returns {Promise} Auth result
 */
export const signUp = async (email, password, displayName) => {
  try {
    console.log('signUp called with:', { email, displayName });
    console.log('auth object:', auth);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created:', result.user.email);
    
    // Update user profile with display name
    if (displayName) {
      await updateProfile(result.user, { displayName });
      console.log('Profile updated with displayName');
    }

    // create a corresponding user document with default settings
    try {
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        displayName: displayName || '',
        dailyAvailableMinutes: 480, // default 8 hours
        studyGoalMinutes: 240, // default 4 hours
        createdAt: serverTimestamp(),
      });
      console.log('User document created');
    } catch (e) {
      console.warn('Failed to create user settings document', e);
    }
    
    return result.user;
  } catch (error) {
    console.error('signUp error:', error.code, error.message);
    throw new Error(getErrorMessage(error.code));
  }
};

/**
 * Sign in user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Auth result
 */
export const signIn = async (email, password) => {
  try {
    console.log('signIn called with:', { email });
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in:', result.user.email);
    return result.user;
  } catch (error) {
    console.error('signIn error:', error.code, error.message);
    throw new Error(getErrorMessage(error.code));
  }
};

/**
 * Sign out the current user
 * @returns {Promise}
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error('Failed to logout');
  }
};

/**
 * Convert Firebase error codes to user-friendly messages
 * @param {string} errorCode - Firebase error code
 * @returns {string} User-friendly error message
 */
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Please login or use a different email.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-login-attempts': 'Too many failed login attempts. Please try again later.',
    'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
  };
  
  return errorMessages[errorCode] || 'An error occurred. Please try again.';
};
