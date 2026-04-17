import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getHabits, addHabit, markHabitComplete, unmarkHabitComplete, deleteHabit } from '../services/habitService';
import '../styles/Habits.css';

const HABIT_ICONS = ['📚', '💪', '🧘', '🏃', '🥗', '💧', '😴', '📝', '🎯', '🧠'];

export default function Habits() {
  const { user, loading: authLoading } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'daily',
    description: '',
    icon: '⭐',
  });

  // Fetch habits on component mount or user change
  useEffect(() => {
    if (authLoading || !user?.uid) return;

    const fetchHabits = async () => {
      try {
        setLoading(true);
        setError('');
        const userHabits = await getHabits(user.uid);
        setHabits(userHabits);
      } catch (err) {
        console.error('Error fetching habits:', err);
        setError(err.message || 'Failed to load habits');
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, [user?.uid, authLoading]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle icon selection
  const handleIconSelect = (icon) => {
    setFormData(prev => ({
      ...prev,
      icon,
    }));
  };

  // Add new habit
  const handleAddHabit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      if (!formData.name.trim()) {
        setError('Please enter a habit name');
        return;
      }

      const newHabit = await addHabit(user.uid, formData);
      setHabits([newHabit, ...habits]);
      
      // Reset form
      setFormData({
        name: '',
        frequency: 'daily',
        description: '',
        icon: '⭐',
      });
      setShowForm(false);
    } catch (err) {
      console.error('Error adding habit:', err);
      setError(err.message || 'Failed to add habit');
    }
  };

  // Toggle habit completion
  const toggleHabitCompletion = async (habitId, currentStatus) => {
    try {
      setError('');
      
      if (currentStatus) {
        await unmarkHabitComplete(habitId);
      } else {
        await markHabitComplete(user.uid, habitId);
      }

      // Update local state
      setHabits(habits.map(habit =>
        habit.id === habitId
          ? {
              ...habit,
              completedToday: !currentStatus,
              streak: !currentStatus ? habit.streak + 1 : Math.max(0, habit.streak - 1),
            }
          : habit
      ));
    } catch (err) {
      console.error('Error toggling habit:', err);
      setError(err.message || 'Failed to update habit');
    }
  };

  // Delete habit
  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;

    try {
      setError('');
      await deleteHabit(habitId);
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (err) {
      console.error('Error deleting habit:', err);
      setError(err.message || 'Failed to delete habit');
    }
  };

  if (authLoading || loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your habits...</p>
      </div>
    );
  }

  return (
    <div className="container" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🎯 My Habits</h1>
          <p style={styles.subtitle}>Build consistency, one day at a time</p>
        </div>
        <button
          style={{
            ...styles.addButton,
            backgroundColor: showForm ? '#e74c3c' : '#27ae60',
          }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Habit'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError('')}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Add Habit Form */}
      {showForm && (
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>Create New Habit</h2>
          <form onSubmit={handleAddHabit} style={styles.form}>
            {/* Icon Selector */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Choose Icon</label>
              <div style={styles.iconGrid}>
                {HABIT_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    style={{
                      ...styles.iconButton,
                      backgroundColor: formData.icon === icon ? '#3498db' : '#ecf0f1',
                      transform: formData.icon === icon ? 'scale(1.1)' : 'scale(1)',
                    }}
                    onClick={() => handleIconSelect(icon)}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Habit Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Habit Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Morning Meditation"
                style={styles.input}
              />
            </div>

            {/* Frequency */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Frequency</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Description */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Why is this habit important to you?"
                style={styles.textarea}
                rows={3}
              />
            </div>

            <button type="submit" style={styles.submitButton}>
              ✓ Create Habit
            </button>
          </form>
        </div>
      )}

      {/* Habits Grid */}
      <div style={styles.habitsGrid}>
        {habits.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>🌱</p>
            <p style={styles.emptyText}>No habits yet. Let's build something awesome! 💪</p>
          </div>
        ) : (
          habits.map(habit => (
            <div
              key={habit.id}
              style={{
                ...styles.habitCard,
                borderLeft: habit.completedToday ? '4px solid #27ae60' : '4px solid #bdc3c7',
                backgroundColor: habit.completedToday ? '#f0fdf4' : '#ffffff',
              }}
            >
              {/* Habit Header */}
              <div style={styles.habitHeader}>
                <div style={styles.habitTitle}>
                  <span style={styles.habitIcon}>{habit.icon}</span>
                  <div>
                    <h3 style={styles.habitName}>{habit.name}</h3>
                    {habit.description && (
                      <p style={styles.habitDescription}>{habit.description}</p>
                    )}
                  </div>
                </div>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDeleteHabit(habit.id)}
                  title="Delete habit"
                >
                  🗑️
                </button>
              </div>

              {/* Habit Stats */}
              <div style={styles.habitStats}>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Streak</span>
                  <span style={styles.statValue}>{habit.streak} 🔥</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Total</span>
                  <span style={styles.statValue}>{habit.completionCount}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Frequency</span>
                  <span style={styles.statValue}>{habit.frequency}</span>
                </div>
              </div>

              {/* Complete Button */}
              <button
                style={{
                  ...styles.completeButton,
                  backgroundColor: habit.completedToday ? '#27ae60' : '#ecf0f1',
                  color: habit.completedToday ? '#ffffff' : '#2c3e50',
                }}
                onClick={() => toggleHabitCompletion(habit.id, habit.completedToday)}
              >
                {habit.completedToday ? (
                  <>✓ Completed Today</>
                ) : (
                  <>⭐ Mark as Complete</>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    minHeight: '100vh',
    // Removed solid background to let the page-wide background show through
    color: 'white', 
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    padding: '20px',
    background: 'rgba(13, 20, 67, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '45px',
    border: '5px solid rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#4b51b8', // Brighter for dark background
    margin: '0 0 5px 0',
    textShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(88, 108, 236, 0.7)',
    margin: 0,
  },
  addButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
  formContainer: {
    background: 'rgba(255, 255, 255, 0.1)', // Transparent form
    backdropFilter: 'blur(15px)',
    padding: '25px',
    borderRadius: '12px',
    marginBottom: '30px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 0,
    marginBottom: '20px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: 'white',
    fontFamily: 'inherit',
    outline: 'none',
  },
  // Apply the same 'background' and 'color' to select and textarea as well
  select: {
    padding: '10px 12px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
  },
  textarea: {
    padding: '10px 12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: 'white',
    resize: 'vertical',
  },
  habitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  habitCard: {
    background: 'rgba(255, 255, 255, 0.08)', // The "Glass" effect
    backdropFilter: 'blur(12px)',
    padding: '20px',
    borderRadius: '15px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  habitName: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px',
    background: 'rgba(255, 255, 255, 0.05)', // Inner stats background
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  statLabel: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  completeButton: {
    padding: '12px 15px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  emptyText: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: '10px 0 0 0',
  },
};
