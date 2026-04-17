import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { addStudySession, getStudySessions, calculateTotalMinutes } from '../services/studyService';
// firebase for realtime
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
// recharts components
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Line,
  Bar,
  CartesianGrid,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from 'recharts';

export default function Progress() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  // allSessions and habits state removed; real-time data drives charts directly

  // chart data states
  const [dailyCompletionData, setDailyCompletionData] = useState([]);
  const [weeklyCompletedData, setWeeklyCompletedData] = useState([]);
  const [studyTrendData, setStudyTrendData] = useState([]);
  const [habitConsistencyData, setHabitConsistencyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    hours: '',
    minutes: '',
    reflection: '',
  });

  const DAILY_GOAL_MINUTES = 240; // 4 hours default

  const todayString = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user?.uid) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const todays = await getStudySessions(user.uid, todayString);
        setSessions(todays);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.uid, todayString]);

  const totalMinutes = calculateTotalMinutes(sessions);

  // chart helpers
  const lastNDays = 7;
  const getDayKey = (d) => d.toISOString().split('T')[0];
  // memoize week keys so effects don't re-run on every render
  const weekKeys = React.useMemo(() => {
    const arr = [];
    for (let i = lastNDays - 1; i >= 0; i--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      arr.push(getDayKey(dt));
    }
    return arr;
  }, [lastNDays]);

  // realtime listeners populate the chart states below
  useEffect(() => {
    if (!user?.uid) return;

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid)
    );
    const unsubTasks = onSnapshot(tasksQuery, snapshot => {
      const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const daily = weekKeys.map(dayKey => {
        const start = new Date(dayKey);
        start.setHours(0,0,0,0);
        const end = new Date(dayKey);
        end.setHours(23,59,59,999);

        const due = all.filter(t => {
          if (!t.dueDate) return true;
          const d = new Date(t.dueDate);
          d.setHours(0,0,0,0);
          return d.getTime() === start.getTime();
        });
        const completed = due.filter(t => t.completed && t.updatedAt &&
          (() => {
            const ts = t.updatedAt.toDate ? t.updatedAt.toDate() : new Date(t.updatedAt);
            return ts >= start && ts <= end;
          })()
        ).length;
        const total = due.length;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
        return { date: dayKey, percent, completed };
      });
      setDailyCompletionData(daily.map(d => ({ date: d.date, percent: d.percent })));
      setWeeklyCompletedData(daily.map(d => ({ date: d.date, completed: d.completed })));
    });

    const studyQuery = query(
      collection(db, 'study_sessions'),
      where('userId', '==', user.uid)
    );
    const unsubStudy = onSnapshot(studyQuery, snapshot => {
      const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const data = weekKeys.map(dayKey => {
        const minutes = all.filter(s => {
          const t = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
          return getDayKey(t) === dayKey;
        }).reduce((sum,s) => sum + (s.duration||0),0);
        return { date: dayKey, minutes };
      });
      setStudyTrendData(data);
    });

    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', user.uid),
      where('active', '==', true)
    );
    const unsubHabits = onSnapshot(habitsQuery, async snapshot => {
      const list = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const completions = Array.isArray(data.completionsArray) ? data.completionsArray : [];
        list.push({ id: docSnap.id, ...data, completions });
      }
      const data = weekKeys.map(dayKey => {
        const count = list.filter(h => h.completions.includes(dayKey)).length;
        const percent = list.length === 0 ? 0 : Math.round((count / list.length) * 100);
        return { date: dayKey, percent };
      });
      setHabitConsistencyData(data);
    });

    return () => {
      unsubTasks();
      unsubStudy();
      unsubHabits();
    };
  }, [user?.uid, weekKeys]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (!formData.subject.trim()) {
        setError('Please enter a subject');
        return;
      }
      const hrs = parseInt(formData.hours,10) || 0;
      const mins = parseInt(formData.minutes,10) || 0;
      if (hrs === 0 && mins === 0) {
        setError('Please enter a valid duration');
        return;
      }
      const total = hrs * 60 + mins;
      const payload = { ...formData, duration: total };
      const added = await addStudySession(user.uid, payload);
      setSessions([added, ...sessions]);
      setFormData({ subject: '', hours:'', minutes:'', reflection: '' });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to add session');
    }
  };

  return (
    <div className="container" style={styles.container}>
      <h1>Your Progress</h1>

      {/* charts container */}
      <div style={styles.card}>
        <h3>Weekly Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyCompletionData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="percent" stroke="#667eea" name="% Complete" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studyTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} />
                <YAxis label={{ value: 'min', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="minutes" stroke="#10b981" name="Minutes" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyCompletedData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#4f46e5" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitConsistencyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Bar dataKey="percent" fill="#f59e0b" name="Consistency" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Study Section */}
      <div style={styles.card}>
        <h3>Study Sessions</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleAdd} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="e.g., Calculus"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Duration</label>
            <div style={styles.timeRow}>
              <input
                type="number"
                name="hours"
                value={formData.hours}
                onChange={handleInputChange}
                placeholder="hrs"
                style={styles.timeInput}
              />
              <span>:</span>
              <input
                type="number"
                name="minutes"
                value={formData.minutes}
                onChange={handleInputChange}
                placeholder="mins"
                style={styles.timeInput}
              />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Reflection / Proof</label>
            <textarea
              name="reflection"
              value={formData.reflection}
              onChange={handleInputChange}
              style={styles.textarea}
              placeholder="What did you learn in this session?"
              rows={3}
            />
          </div>
          <button type="submit" style={styles.addButton}>Add Session</button>
        </form>

        {loading ? (
          <p>Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p>No study sessions recorded yet.</p>
        ) : (
          <div style={styles.sessionsList}>
            {sessions.map(s => (
              <div key={s.id} style={styles.sessionItem}>
                <div>
                    <strong>{s.subject}</strong> - {Math.floor(s.duration/60)}h {s.duration%60}m
                </div>
                {s.reflection && <div style={styles.reflection}>{s.reflection}</div>}
              </div>
            ))}
          </div>
        )}

        {/* progress bar */}
        <div style={styles.progressBarContainer}>
          <div
            style={{
              ...styles.progressFill,
              width: `${Math.min((totalMinutes / DAILY_GOAL_MINUTES) * 100, 100)}%`,
            }}
          />
        </div>
        <p style={styles.progressText}>
          {Math.floor(totalMinutes/60)}h {totalMinutes%60}m of {Math.floor(DAILY_GOAL_MINUTES/60)}h goal
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '8px 10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  textarea: {
    padding: '8px 10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    resize: 'vertical',
  },
  addButton: {
    padding: '10px 15px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  sessionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '10px',
  },
  sessionItem: {
    padding: '10px',
    background: '#f9fafb',
    borderRadius: '6px',
  },
  reflection: {
    marginTop: '4px',
    fontSize: '13px',
    color: '#555',
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
  progressBarContainer: {
    width: '100%',
    height: '10px',
    background: '#e5e7eb',
    borderRadius: '5px',
    overflow: 'hidden',
    marginTop: '15px',
  },
  progressFill: {
    height: '100%',
    background: '#667eea',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '13px',
    color: '#333',
    marginTop: '5px',
  },
};
