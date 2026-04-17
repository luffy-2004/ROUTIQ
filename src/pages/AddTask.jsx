import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { addTask } from '../services/taskService';


export default function AddTask() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    estimatedHours: '',
    estimatedMins: '',
    priority: 'medium',
    dueDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Task title is required');
      return false;
    }
    const h = parseInt(formData.estimatedHours, 10) || 0;
    const m = parseInt(formData.estimatedMins, 10) || 0;
    if (h === 0 && m === 0) {
      setError('Estimated time is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);

    try {
      console.log('Adding task for user:', user.uid);
      // convert hours/minutes into total minutes
      const hrs = parseInt(formData.estimatedHours, 10) || 0;
      const mins = parseInt(formData.estimatedMins, 10) || 0;
      const total = hrs * 60 + mins;
      await addTask(user.uid, { ...formData, estimatedTime: total });
      
      // Show success message
      setSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        category: 'General',
        estimatedHours: '',
        estimatedMins: '',
        priority: 'medium',
        dueDate: '',
      });

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err.message || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={styles.container}>
      <h1 style={styles.heading}>Add New Task</h1>
      <p style={styles.subheading}>Add a task to your list and track your progress</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Error Message */}
        {error && (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={styles.successContainer}>
            <p style={styles.successText}>✅ Task added successfully! Redirecting...</p>
          </div>
        )}

        {/* Task Title */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Task Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Complete Math Assignment"
            style={styles.input}
            disabled={loading}
            required
          />
        </div>

        {/* Category */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={styles.input}
            disabled={loading}
          >
            <option value="General">General</option>
            <option value="Math">Math</option>
            <option value="Science">Science</option>
            <option value="Literature">Literature</option>
            <option value="History">History</option>
            <option value="Languages">Languages</option>
            <option value="Project">Project</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Two Column Layout */}
        <div style={styles.twoColumn}>
          {/* Estimated Time */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Estimated Time *</label>
            <div style={styles.timeRow}>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleChange}
                placeholder="hrs"
                style={styles.timeInput}
                disabled={loading}
                min="0"
              />
              <span>:</span>
              <input
                type="number"
                name="estimatedMins"
                value={formData.estimatedMins}
                onChange={handleChange}
                placeholder="mins"
                style={styles.timeInput}
                disabled={loading}
                min="0"
                max="59"
              />
            </div>
            <p style={styles.hint}>Hours and minutes</p>
          </div>

          {/* Priority */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              style={styles.input}
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Due Date (Optional)</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            style={styles.input}
            disabled={loading}
          />
        </div>

        {/* Buttons */}
        <div style={styles.buttonGroup}>
          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
          >
            {loading ? 'Adding Task...' : '➕ Add Task'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        {/* Info */}
        <p style={styles.infoText}>
          💡 Pro Tip: Break large tasks into smaller ones for better time management!
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  heading: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 8px 0',
  },
  subheading: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 30px 0',
  },
  form: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px',
  },
  input: {
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.3s ease',
  },
  hint: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '6px 0 0 0',
  },
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  errorContainer: {
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    padding: '12px 15px',
    marginBottom: '20px',
  },
  errorText: {
    color: '#991b1b',
    fontSize: '13px',
    margin: '0',
    lineHeight: '1.4',
  },
  successContainer: {
    background: '#dcfce7',
    border: '1px solid #86efac',
    borderRadius: '6px',
    padding: '12px 15px',
    marginBottom: '20px',
  },
  successText: {
    color: '#166534',
    fontSize: '13px',
    margin: '0',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '25px',
  },
  button: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    background: '#f3f4f6',
    color: '#6b7280',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  infoText: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '20px 0 0 0',
    textAlign: 'center',
    lineHeight: '1.5',
  },
};
