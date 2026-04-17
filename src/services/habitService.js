/**
 * Habit Service
 * Handles all Firestore operations for habits and completions
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  setDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Calculate the current streak for a habit based on completion logs
 * @param {Array} completions - Array of completion dates
 * @returns {number} Current streak count
 */
const calculateStreak = (completions = []) => {
  if (!completions || completions.length === 0) return 0;

  // Sort dates in descending order
  const sorted = [...completions].sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const completionDate = new Date(sorted[i]);
    completionDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (completionDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Add a new habit to Firestore
 * @param {string} userId - The user's ID
 * @param {object} habitData - Habit data { name, frequency, description }
 * @returns {Promise} The newly created habit with ID
 */
export const addHabit = async (userId, habitData) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!habitData.name) throw new Error('Habit name is required');
    if (!habitData.frequency) throw new Error('Habit frequency is required');

    const docRef = await addDoc(collection(db, 'habits'), {
      userId,
      name: habitData.name.trim(),
      frequency: habitData.frequency, // daily, weekly, monthly
      description: habitData.description || '',
      icon: habitData.icon || '⭐',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      active: true,
    });

    console.log('Habit added:', docRef.id);
    return { 
      id: docRef.id, 
      ...habitData, 
      streak: 0, 
      completedToday: false,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Error adding habit:', error);
    throw new Error(error.message || 'Failed to add habit');
  }
};

/**
 * Get all habits for a user with their current streaks
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of habits with streak data
 */
export const getHabits = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');

    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', userId),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(habitsQuery);
    const habits = [];

    for (const doc of querySnapshot.docs) {
      const habitData = doc.data();
      
      // Attempt to read array field if present (updated for real-time usage)
      let completions = Array.isArray(habitData.completionsArray)
        ? habitData.completionsArray
        : [];
      if (completions.length === 0) {
        // fallback to subcollection scan for older entries
        const completionsRef = collection(db, 'habits', doc.id, 'completions');
        const completionsSnapshot = await getDocs(completionsRef);
        completions = completionsSnapshot.docs.map(d => d.id);
      }

      // Check if completed today
      const today = new Date().toISOString().split('T')[0];
      const completedToday = completions.includes(today);

      habits.push({
        id: doc.id,
        name: habitData.name,
        frequency: habitData.frequency,
        description: habitData.description || '',
        icon: habitData.icon || '⭐',
        streak: calculateStreak(completions),
        completedToday,
        completionCount: completions.length,
        completions, // array of YYYY-MM-DD strings for analytics
        createdAt: habitData.createdAt,
      });
    }

    return habits;
  } catch (error) {
    console.error('Error fetching habits:', error);
    const msg = error.message || 'Failed to fetch habits';
    if (/permission/i.test(msg)) {
      throw new Error('Permission denied when fetching habits. Check your Firestore rules.');
    }
    throw new Error(msg);
  }
};

/**
 * Record a habit completion for today
 * @param {string} userId - The user's ID
 * @param {string} habitId - The habit's ID
 * @returns {Promise} Updated habit data
 */
export const markHabitComplete = async (userId, habitId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!habitId) throw new Error('Habit ID is required');

    const today = new Date().toISOString().split('T')[0];
    
    // Add completion log
    const completionRef = doc(db, 'habits', habitId, 'completions', today);
    await setDoc(completionRef, {
      completedAt: serverTimestamp(),
    });

    // Update habit's lastCompletedDate and add to completions array
    const habitRef = doc(db, 'habits', habitId);
    await updateDoc(habitRef, {
      lastCompletedDate: today,
      updatedAt: serverTimestamp(),
    });
    // maintain a simple array field for real-time listeners
    await updateDoc(habitRef, {
      completionsArray: arrayUnion(today),
    });

    console.log('Habit marked complete:', habitId);
    return { success: true };
  } catch (error) {
    console.error('Error marking habit complete:', error);
    throw new Error(error.message || 'Failed to mark habit complete');
  }
};

/**
 * Unmark a habit completion for today
 * @param {string} habitId - The habit's ID
 * @returns {Promise} Success confirmation
 */
export const unmarkHabitComplete = async (habitId) => {
  try {
    if (!habitId) throw new Error('Habit ID is required');

    const today = new Date().toISOString().split('T')[0];
    const completionRef = doc(db, 'habits', habitId, 'completions', today);
    await deleteDoc(completionRef);

    // also remove from array field
    const habitRef = doc(db, 'habits', habitId);
    await updateDoc(habitRef, {
      completionsArray: arrayRemove(today),
    });
    console.log('Habit unmarked:', habitId);
    return { success: true };
  } catch (error) {
    console.error('Error unmarking habit:', error);
    throw new Error(error.message || 'Failed to unmark habit');
  }
};

/**
 * Delete a habit
 * @param {string} habitId - The habit's ID
 * @returns {Promise} Success confirmation
 */
export const deleteHabit = async (habitId) => {
  try {
    if (!habitId) throw new Error('Habit ID is required');

    const habitRef = doc(db, 'habits', habitId);
    await updateDoc(habitRef, { active: false });

    console.log('Habit deleted:', habitId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw new Error(error.message || 'Failed to delete habit');
  }
};
