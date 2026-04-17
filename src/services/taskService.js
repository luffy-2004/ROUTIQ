/**
 * Task Service
 * Handles all Firestore operations for tasks
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
  getDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Add a new task to Firestore
 * @param {string} userId - The user's ID
 * @param {object} taskData - Task data { title, category, estimatedTime, priority, dueDate }
 * @returns {Promise} The newly created task with ID
 */
export const addTask = async (userId, taskData) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!taskData.title) throw new Error('Task title is required');

    const docRef = await addDoc(collection(db, 'tasks'), {
      userId,
      title: taskData.title.trim(),
      category: taskData.category || 'General',
      estimatedTime: parseInt(taskData.estimatedTime) || 0,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || null,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('Task added:', docRef.id);
    return { id: docRef.id, ...taskData, completed: false };
  } catch (error) {
    console.error('Error adding task:', error);
    throw new Error(error.message || 'Failed to add task');
  }
};

/**
 * Get all tasks for the logged-in user
 * @param {string} userId - The user's ID
 * @returns {Promise} Array of tasks
 */
export const getUserTasks = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const tasks = [];

    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log('Fetched tasks:', tasks);
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    const msg = error.message || 'Failed to fetch tasks';
    if (/permission/i.test(msg)) {
      throw new Error('Permission denied when fetching tasks. Check your Firestore rules.');
    }
    throw new Error(msg);
  }
};

/**
 * Get today's tasks for the user
 * @param {string} userId - The user's ID
 * @returns {Promise} Array of today's tasks
 */
export const getTodaysTasks = async (userId) => {
  try {
    const allTasks = await getUserTasks(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allTasks.filter(task => {
      if (!task.dueDate) return true; // Include tasks without due date
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
  } catch (error) {
    console.error('Error fetching today\'s tasks:', error);
    throw error;
  }
};

/**
 * Mark a task as completed
 * @param {string} taskId - The task ID
 * @param {boolean} completed - Completion status
 * @returns {Promise}
 */
export const updateTaskCompletion = async (taskId, completed) => {
  try {
    if (!taskId) throw new Error('Task ID is required');

    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      completed: completed,
      updatedAt: serverTimestamp(),
    });

    console.log('Task updated:', taskId, 'completed:', completed);
    return true;
  } catch (error) {
    console.error('Error updating task:', error);
    throw new Error(error.message || 'Failed to update task');
  }
};

/**
 * Update task details
 * @param {string} taskId - The task ID
 * @param {object} updateData - Fields to update
 * @returns {Promise}
 */
export const updateTask = async (taskId, updateData) => {
  try {
    if (!taskId) throw new Error('Task ID is required');

    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    console.log('Task updated:', taskId);
    return true;
  } catch (error) {
    console.error('Error updating task:', error);
    throw new Error(error.message || 'Failed to update task');
  }
};

/**
 * Delete a task
 * @param {string} taskId - The task ID
 * @returns {Promise}
 */
export const deleteTask = async (taskId) => {
  try {
    if (!taskId) throw new Error('Task ID is required');

    await deleteDoc(doc(db, 'tasks', taskId));
    console.log('Task deleted:', taskId);
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error(error.message || 'Failed to delete task');
  }
};

/**
 * Calculate workload status based on remaining tasks
 * @param {array} tasks - Array of tasks
 * @returns {object} Workload info { status, message }
 */
/**
 * Perform a simple AI workload analysis, persist a daily report, and
 * return feedback that can be rendered in the UI.
 *
 * Logic:
 * 1. Only today's tasks are considered (dueDate === today or no due date).
 * 2. Estimated time of those tasks is summed.
 * 3. The total is compared against the user's available daily time
 *    (stored in /users/{userId}.dailyAvailableMinutes, defaults to 480).
 * 4. The day is classified as 'easy', 'doable', or 'overloaded'.
 * 5. A short motivational message is generated.
 * 6. The entire report is written to a new `ai_reports` collection for
 *    analytics / history.
 *
 * @param {string} userId - ID of the user performing the analysis
 * @param {Array} tasks - Array of task objects (from getUserTasks or similar)
 * @returns {Promise<object>} workload info { status, message, totalMinutes, availableMinutes }
 */
export const analyzeWorkload = async (userId, tasks) => {
  if (!userId) throw new Error('User ID is required for workload analysis');

  // helper to normalize today's date string
  const todayStr = new Date().toISOString().split('T')[0];

  // filter tasks to only those due today (or undated)
  const todayTasks = tasks.filter(t => {
    if (!t.dueDate) return true;
    const d = new Date(t.dueDate);
    return d.toISOString().split('T')[0] === todayStr;
  });

  const totalMinutes = todayTasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);

  // fetch user settings to read available daily time
  let availableMinutes = 480; // default 8 hours
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (typeof data.dailyAvailableMinutes === 'number') {
        availableMinutes = data.dailyAvailableMinutes;
      }
    }
  } catch (e) {
    console.warn('Failed to load user settings for workload analysis', e);
  }

  // classification logic relative to availability
  let status, message;
  if (totalMinutes === 0) {
    status = 'easy';
    message = 'No tasks on the horizon – enjoy the free time! 🎉';
  } else if (totalMinutes <= availableMinutes * 0.5) {
    status = 'easy';
    message = 'Light workload. You can breeze through this! 💪';
  } else if (totalMinutes <= availableMinutes) {
    status = 'doable';
    message = 'Manageable workload – stay focused and you’ll crush it! 🎯';
  } else {
    status = 'overloaded';
    message = 'Heavy workload. Try breaking it into smaller chunks! 📝';
  }

  // persist report to Firestore
  try {
    await addDoc(collection(db, 'ai_reports'), {
      userId,
      date: todayStr,
      totalMinutes,
      availableMinutes,
      status,
      message,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error('Failed to save AI workload report:', e);
    // Not a fatal error for the UI; we still return the info
  }

  return { status, message, totalMinutes, availableMinutes };
};
