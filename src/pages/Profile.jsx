import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserSettings, updateUserSettings } from '../services/userService';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  // we'll calculate hours/minutes from stored minutes on load
  const [input, setInput] = useState({
    dailyHours: '',
    dailyMins: '',
    studyHours: '',
    studyMins: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getUserSettings(user.uid);
        const daily = data.dailyAvailableMinutes || 0;
        const study = data.studyGoalMinutes || 0;
        setInput({
          dailyHours: Math.floor(daily / 60).toString(),
          dailyMins: (daily % 60).toString(),
          studyHours: Math.floor(study / 60).toString(),
          studyMins: (study % 60).toString(),
        });
      } catch (e) {
        console.error(e);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      // convert hours/minutes inputs back to total minutes
      const dh = parseInt(input.dailyHours, 10) || 0;
      const dm = parseInt(input.dailyMins, 10) || 0;
      const sh = parseInt(input.studyHours, 10) || 0;
      const sm = parseInt(input.studyMins, 10) || 0;
      if (isNaN(dh) || isNaN(dm) || isNaN(sh) || isNaN(sm)) {
        throw new Error('Please enter valid hour and minute values');
      }
      const daily = dh * 60 + dm;
      const study = sh * 60 + sm;
      await updateUserSettings(user.uid, {
        dailyAvailableMinutes: daily,
        studyGoalMinutes: study,
      });
      // no need to keep raw minutes in state
      setInput({ dailyHours: dh.toString(), dailyMins: dm.toString(), studyHours: sh.toString(), studyMins: sm.toString() });
      setMessage('Settings saved');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error', err);
      setError('Failed to logout');
    }
  };

  if (loading) {
    return <div className="container" style={styles.container}><p>Loading profile...</p></div>;
  }

  return (
    <div style={styles.container}>
      <h1>Profile</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <div style={styles.card}>
        <h3>Your Info</h3>
        <p><strong>Name:</strong> {user?.displayName || 'N/A'}</p>
        <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
      </div>

      <div style={styles.card}>
        <h3>Settings</h3>
        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Daily Available Time</label>
            <div style={styles.timeRow}>
              <input
                type="number"
                name="dailyHours"
                value={input.dailyHours}
                onChange={handleChange}
                placeholder="hrs"
                style={styles.timeInput}
              />
              <span>:</span>
              <input
                type="number"
                name="dailyMins"
                value={input.dailyMins}
                onChange={handleChange}
                placeholder="mins"
                style={styles.timeInput}
              />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Daily Study Goal</label>
            <div style={styles.timeRow}>
              <input
                type="number"
                name="studyHours"
                value={input.studyHours}
                onChange={handleChange}
                placeholder="hrs"
                style={styles.timeInput}
              />
              <span>:</span>
              <input
                type="number"
                name="studyMins"
                value={input.studyMins}
                onChange={handleChange}
                placeholder="mins"
                style={styles.timeInput}
              />
            </div>
          </div>
          <button type="submit" style={styles.saveButton} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    margin: '10px 0',
    cursor: 'pointer',
  },
  logoutButton: {
    width: '100%',
    padding: '12px',
    background: '#ff6b6b',
  },
  timeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  timeInput: {
    width: '60px',
    padding: '6px 8px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
};
