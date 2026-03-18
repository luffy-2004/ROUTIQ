// ============================================
// HABIT TRACKING FEATURE - EXAMPLE USAGE
// ============================================

// ============================================
// EXAMPLE 1: Using the Habits Page Component
// ============================================

import Habits from './pages/Habits';

// The Habits page is fully self-contained
// Just navigate to /habits to use it
// All state management is handled internally
// No props needed!

// ============================================
// EXAMPLE 2: Using Habit Service Directly
// ============================================

import { getHabits, addHabit, markHabitComplete, deleteHabit } from './services/habitService';

// SCENARIO: User creates a morning meditation habit
const createMeditationHabit = async (userId) => {
  try {
    const habit = await addHabit(userId, {
      name: '🧘 Morning Meditation',
      frequency: 'daily',
      description: 'Start day with 10 minutes of mindfulness',
      icon: '🧘'
    });
    
    console.log('Habit created!', habit);
    // Output: { id: 'habit_123', name: '🧘 Morning Meditation', streak: 0, completedToday: false }
  } catch (error) {
    console.error('Failed to create habit:', error.message);
  }
};

// ============================================
// EXAMPLE 3: Fetching and Displaying Habits
// ============================================

import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';

function MyHabitsDashboard() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const loadHabits = async () => {
      try {
        const userHabits = await getHabits(user.uid);
        setHabits(userHabits);
        
        // Display habits
        userHabits.forEach(habit => {
          console.log(`${habit.icon} ${habit.name}`);
          console.log(`  Streak: ${habit.streak} days`);
          console.log(`  Completed today: ${habit.completedToday}`);
          console.log(`  Total completions: ${habit.completionCount}`);
        });
      } catch (error) {
        console.error('Error loading habits:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHabits();
  }, [user?.uid]);

  return (
    <div>
      {loading ? (
        <p>Loading habits...</p>
      ) : (
        <ul>
          {habits.map(habit => (
            <li key={habit.id}>
              {habit.icon} {habit.name} - Streak: {habit.streak} 🔥
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 4: Marking Habits Complete
// ============================================

import { markHabitComplete, unmarkHabitComplete } from './services/habitService';

const handleCompleteHabit = async (userId, habitId) => {
  try {
    // Mark habit as complete
    await markHabitComplete(userId, habitId);
    
    // Refresh habits to get updated streak
    const updatedHabits = await getHabits(userId);
    
    // Show success message
    const completed = updatedHabits.find(h => h.id === habitId);
    console.log(`✓ Great! You completed: ${completed.name}`);
    console.log(`  Streak is now: ${completed.streak} 🔥`);
    
  } catch (error) {
    console.error('Failed to mark habit complete:', error.message);
  }
};

// Usage:
// await handleCompleteHabit('user_123', 'habit_meditation_01');

// ============================================
// EXAMPLE 5: Updating UI After Completion
// ============================================

function HabitCompleteButton({ habit, userId }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      if (habit.completedToday) {
        // Unmark completion
        await unmarkHabitComplete(habit.id);
        console.log(`Unmarked: ${habit.name}`);
      } else {
        // Mark as complete
        await markHabitComplete(userId, habit.id);
        console.log(`Marked complete: ${habit.name}`);
      }
      
      // Parent component would typically refresh habits here
      // or you could use real-time listeners
    } catch (error) {
      console.error('Error updating habit:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isUpdating}
      style={{
        backgroundColor: habit.completedToday ? '#27ae60' : '#ecf0f1',
        color: habit.completedToday ? '#ffffff' : '#2c3e50',
      }}
    >
      {isUpdating ? 'Updating...' : 
       habit.completedToday ? '✓ Completed Today' : '⭐ Mark Complete'}
    </button>
  );
}

// ============================================
// EXAMPLE 6: Creating Multiple Habits at Once
// ============================================

const initializeDefaultHabits = async (userId) => {
  const defaultHabits = [
    { name: '📚 Read Daily', frequency: 'daily', description: 'Read for 30 minutes', icon: '📚' },
    { name: '💪 Exercise', frequency: 'daily', description: 'Workout or stretch', icon: '💪' },
    { name: '🧘 Meditation', frequency: 'daily', description: '10 minutes mindfulness', icon: '🧘' },
    { name: '💧 Stay Hydrated', frequency: 'daily', description: 'Drink 8 glasses of water', icon: '💧' },
    { name: '😴 Sleep 8 Hours', frequency: 'daily', description: 'Get good rest', icon: '😴' },
  ];

  try {
    const createdHabits = await Promise.all(
      defaultHabits.map(habitData => addHabit(userId, habitData))
    );
    
    console.log(`Created ${createdHabits.length} habits!`);
    createdHabits.forEach(habit => {
      console.log(`✓ ${habit.icon} ${habit.name}`);
    });
    
    return createdHabits;
  } catch (error) {
    console.error('Error initializing habits:', error);
  }
};

// Usage:
// await initializeDefaultHabits('user_123');

// ============================================
// EXAMPLE 7: Calculating Stats from Habits
// ============================================

const calculateHabitsStats = async (userId) => {
  try {
    const habits = await getHabits(userId);
    
    const stats = {
      totalHabits: habits.length,
      completedToday: habits.filter(h => h.completedToday).length,
      longestStreak: Math.max(...habits.map(h => h.streak), 0),
      averageStreak: habits.reduce((sum, h) => sum + h.streak, 0) / habits.length || 0,
      totalCompletions: habits.reduce((sum, h) => sum + h.completionCount, 0),
    };
    
    console.log('📊 Habit Statistics:');
    console.log(`Total Habits: ${stats.totalHabits}`);
    console.log(`Completed Today: ${stats.completedToday}/${stats.totalHabits}`);
    console.log(`Longest Streak: ${stats.longestStreak} days 🔥`);
    console.log(`Average Streak: ${stats.averageStreak.toFixed(1)} days`);
    console.log(`Total Completions: ${stats.totalCompletions}`);
    
    return stats;
  } catch (error) {
    console.error('Error calculating stats:', error);
  }
};

// Usage:
// const stats = await calculateHabitsStats('user_123');

// ============================================
// EXAMPLE 8: Displaying Habit Progress
// ============================================

function HabitProgressCard({ habit }) {
  const progressPercentage = Math.min((habit.streak / 30) * 100, 100); // 30 day goal

  return (
    <div style={styles.card}>
      <h3>{habit.icon} {habit.name}</h3>
      
      <div style={styles.progressSection}>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progressPercentage}%`,
            }}
          />
        </div>
        <p>{habit.streak} / 30 days</p>
      </div>

      <div style={styles.stats}>
        <p>Status: {habit.completedToday ? '✅ Done Today' : '❌ Not Yet'}</p>
        <p>Frequency: {habit.frequency}</p>
        <p>Total: {habit.completionCount} completions</p>
      </div>
    </div>
  );
}

const styles = {
  card: { border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px' },
  progressSection: { margin: '10px 0' },
  progressBar: { width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#27ae60', transition: 'width 0.3s' },
  stats: { fontSize: '12px', color: '#666' },
};

// ============================================
// EXAMPLE 9: Habit Filtering and Sorting
// ============================================

const getHabitsByStreak = async (userId) => {
  try {
    const habits = await getHabits(userId);
    
    // Sort by streak (highest first)
    const sorted = [...habits].sort((a, b) => b.streak - a.streak);
    
    console.log('Habits by Streak:');
    sorted.forEach((habit, index) => {
      console.log(`${index + 1}. ${habit.icon} ${habit.name} - ${habit.streak} 🔥`);
    });
    
    return sorted;
  } catch (error) {
    console.error('Error sorting habits:', error);
  }
};

const getCompletedTodayHabits = async (userId) => {
  try {
    const habits = await getHabits(userId);
    const completed = habits.filter(h => h.completedToday);
    
    console.log(`Completed Today (${completed.length}/${habits.length}):`);
    completed.forEach(habit => {
      console.log(`✓ ${habit.icon} ${habit.name}`);
    });
    
    return completed;
  } catch (error) {
    console.error('Error filtering habits:', error);
  }
};

// Usage:
// const topHabits = await getHabitsByStreak('user_123');
// const doneToday = await getCompletedTodayHabits('user_123');

// ============================================
// EXAMPLE 10: Error Handling Patterns
// ============================================

const robustHabitOperation = async (userId, habitId) => {
  // Validate inputs
  if (!userId) {
    console.error('User ID is required');
    return null;
  }

  if (!habitId) {
    console.error('Habit ID is required');
    return null;
  }

  try {
    // Try to mark habit complete
    await markHabitComplete(userId, habitId);
    
    // Fetch updated data
    const habits = await getHabits(userId);
    const updated = habits.find(h => h.id === habitId);
    
    if (!updated) {
      console.warn('Habit not found after update');
      return null;
    }
    
    return updated;
    
  } catch (error) {
    if (error.message.includes('permission')) {
      console.error('Permission denied - check Firestore rules');
    } else if (error.message.includes('network')) {
      console.error('Network error - check connection');
    } else {
      console.error('Unexpected error:', error.message);
    }
    return null;
  }
};

// ============================================
// SUMMARY
// ============================================

/*
HABIT SERVICE API:

1. addHabit(userId, habitData)
   - Creates new habit
   - Returns: habit object with id

2. getHabits(userId)
   - Fetches all habits with streaks
   - Returns: array of habit objects

3. markHabitComplete(userId, habitId)
   - Records completion for today
   - Returns: success confirmation

4. unmarkHabitComplete(habitId)
   - Removes today's completion
   - Returns: success confirmation

5. deleteHabit(habitId)
   - Soft-deletes habit
   - Returns: success confirmation

6. calculateStreak(completions)
   - Helper function for streak calculation
   - Returns: number of consecutive days
*/

export {
  createMeditationHabit,
  handleCompleteHabit,
  initializeDefaultHabits,
  calculateHabitsStats,
  getHabitsByStreak,
  getCompletedTodayHabits,
  robustHabitOperation,
};
