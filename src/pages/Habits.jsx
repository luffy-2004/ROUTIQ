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
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 5px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#7f8c8d',
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
  },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '12px',
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 0,
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50',
  },
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(50px, 1fr))',
    gap: '8px',
  },
  iconButton: {
    padding: '10px',
    fontSize: '24px',
    border: '2px solid #ecf0f1',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #bdc3c7',
    borderRadius: '6px',
    fontFamily: 'inherit',
  },
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #bdc3c7',
    borderRadius: '6px',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  textarea: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #bdc3c7',
    borderRadius: '6px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  submitButton: {
    padding: '12px 20px',
    backgroundColor: '#27ae60',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  habitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  habitCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    transition: 'all 0.3s ease',
  },
  habitHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px',
  },
  habitTitle: {
    display: 'flex',
    gap: '10px',
    flex: 1,
  },
  habitIcon: {
    fontSize: '32px',
    minWidth: '40px',
    textAlign: 'center',
  },
  habitName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2c3e50',
    margin: 0,
    marginBottom: '4px',
  },
  habitDescription: {
    fontSize: '12px',
    color: '#7f8c8d',
    margin: 0,
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: 0,
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  habitStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  statLabel: {
    fontSize: '11px',
    color: '#7f8c8d',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  completeButton: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '48px',
    margin: 0,
  },
  emptyText: {
    fontSize: '16px',
    color: '#7f8c8d',
    margin: '10px 0 0 0',
  },
  errorMessage: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fadbd8',
    color: '#c0392b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #ecf0f1',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '15px',
  },
};
