/**
 * User Service
 * Handles operations related to user settings stored in Firestore
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Retrieve user settings from Firestore
 * @param {string} userId
 * @returns {Promise<object>} settings object (may be empty if no doc)
 */
export const getUserSettings = async (userId) => {
  if (!userId) throw new Error('User ID is required');
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
};

/**
 * Update user settings (merges with existing document)
 * @param {string} userId
 * @param {object} settings - fields to update
 * @returns {Promise<void>}
 */
export const updateUserSettings = async (userId, settings) => {
  if (!userId) throw new Error('User ID is required');
  const ref = doc(db, 'users', userId);
  await setDoc(ref, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
};
