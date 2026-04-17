/**
 * Study Service
 * Handles Firestore operations related to study sessions and goals
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Add a new study session to Firestore
 * @param {string} userId - The user's ID
 * @param {object} sessionData - { subject, duration (minutes), reflection }
 * @returns {Promise<object>} Created session with id
 */
export const addStudySession = async (userId, sessionData) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!sessionData.subject) throw new Error('Subject is required');
    const duration = parseInt(sessionData.duration, 10);
    if (isNaN(duration) || duration <= 0) throw new Error('Duration must be a positive number');

    const docRef = await addDoc(collection(db, 'study_sessions'), {
      userId,
      subject: sessionData.subject.trim(),
      duration,
      reflection: sessionData.reflection || '',
      createdAt: serverTimestamp(),
    });

    console.log('Study session added:', docRef.id);
    return { id: docRef.id, ...sessionData, duration };
  } catch (error) {
    console.error('Error adding study session:', error);
    throw new Error(error.message || 'Failed to add study session');
  }
};

/**
 * Get study sessions for a user on a particular date (YYYY-MM-DD) or all
 * @param {string} userId
 * @param {string} [date] - ISO date string (YYYY-MM-DD) optional
 * @returns {Promise<Array>} Array of sessions
 */
export const getStudySessions = async (userId, date) => {
  try {
    if (!userId) throw new Error('User ID is required');

    let q = query(
      collection(db, 'study_sessions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    let sessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      sessions = sessions.filter(s => {
        const t = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
        return t >= start && t <= end;
      });
    }

    return sessions;
  } catch (error) {
    console.error('Error fetching study sessions:', error);
    throw new Error(error.message || 'Failed to fetch study sessions');
  }
};

/**
 * Calculate total study minutes for the given sessions
 * @param {Array} sessions
 * @returns {number} Total minutes
 */
export const calculateTotalMinutes = (sessions = []) => {
  return sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
};

/**
 * Update a study session's reflection (proof answer)
 * @param {string} sessionId
 * @param {string} reflection
 * @returns {Promise}
 */
export const addReflection = async (sessionId, reflection) => {
  try {
    if (!sessionId) throw new Error('Session ID is required');
    const ref = doc(db, 'study_sessions', sessionId);
    await updateDoc(ref, { reflection });
    return { success: true };
  } catch (error) {
    console.error('Error updating reflection:', error);
    throw new Error(error.message || 'Failed to update reflection');
  }
};

/**
 * NOTES MANAGEMENT
 */

/**
 * Add a study note for a user
 * @param {string} userId
 * @param {object} noteData - { subject, content }
 * @returns {Promise<object>} created note
 */
export const addStudyNote = async (userId, noteData) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!noteData.subject || !noteData.content) throw new Error('Subject and content are required');
    const docRef = await addDoc(collection(db, 'study_notes'), {
      userId,
      subject: noteData.subject.trim(),
      content: noteData.content.trim(),
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...noteData };
  } catch (error) {
    console.error('Error adding study note:', error);
    throw new Error(error.message || 'Failed to add study note');
  }
};

/**
 * Get all study notes for a user
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getStudyNotes = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    const q = query(
      collection(db, 'study_notes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching study notes:', error);
    const msg = error.message || 'Failed to fetch study notes';
    if (/permission/i.test(msg)) {
      throw new Error('Permission denied when fetching study notes. Check your Firestore rules.');
    }
    throw new Error(msg);
  }
};

/**
 * Generate simple flashcards from a block of text.
 * Each sentence becomes a card, question is a prompt to explain it.
 * @param {string} content
 * @returns {Array<{question:string,answer:string}>}
 */
export const generateFlashcards = (content = '') => {
  if (!content) return [];
  const sentences = content
    .split(/(?<=[\.\?\!])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  return sentences.map((s, idx) => ({
    question: `Explain this point (#${idx + 1}): ${s.length > 50 ? s.slice(0, 50) + '...' : s}`,
    answer: s,
  }));
};

/**
 * FILE UPLOADS
 */

const storage = getStorage();

/**
 * Upload a file to Firebase Storage and record metadata in Firestore
 * @param {string} userId
 * @param {File} file
 * @returns {Promise<object>} metadata {id,name,url}
 */
export const uploadStudyFile = async (userId, file) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!file) throw new Error('File is required');
    const path = `study_files/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    const docRef = await addDoc(collection(db, 'study_files'), {
      userId,
      name: file.name,
      url,
      createdAt: serverTimestamp(),
      storagePath: path,
    });
    return { id: docRef.id, name: file.name, url };
  } catch (error) {
    console.error('Error uploading study file:', error);
    throw new Error(error.message || 'Failed to upload file');
  }
};

/**
 * Retrieve uploaded study files for a user
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getStudyFiles = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    const q = query(
      collection(db, 'study_files'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching study files:', error);
    const msg = error.message || 'Failed to fetch study files';
    if (/permission/i.test(msg)) {
      throw new Error('Permission denied when fetching study files. Check your Firestore rules.');
    }
    throw new Error(msg);
  }
};