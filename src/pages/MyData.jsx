import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserTasks } from '../services/taskService';
import { getHabits } from '../services/habitService';
import { getStudyNotes, getStudyFiles } from '../services/studyService';

export default function MyData() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [notes, setNotes] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !user?.uid) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError('');
        const [t, h, n, f] = await Promise.all([
          getUserTasks(user.uid),
          getHabits(user.uid),
          getStudyNotes(user.uid),
          getStudyFiles(user.uid),
        ]);
        setTasks(t);
        setHabits(h);
        setNotes(n);
        setFiles(f);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user?.uid, authLoading]);

  if (authLoading || loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your data...</p>
      </div>
    );
  }

  return (
    <div className="container" style={styles.container}>
      <h1 style={styles.heading}>My Data</h1>
      {error && (
        <p style={styles.error}>
          {error}
          {!/Permission denied/.test(error) ? null : (
            <><br />
            Ensure your Firestore security rules allow reading your own records (tasks, habits, notes, files).</>
          )}
        </p>
      )}

      <section style={styles.section}>
        <h2>Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p style={styles.empty}>Nothing here yet. Try adding a task to get started!</p>
        ) : (
          <ul style={styles.list}>
            {tasks.map(t => (
              <li key={t.id} style={styles.listItem}>
                <strong>{t.title}</strong> {t.completed ? '✅' : '🕘'}
                {t.category && <span style={styles.meta}>[{t.category}]</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={styles.section}>
        <h2>Habits ({habits.length})</h2>
        {habits.length === 0 ? (
          <p style={styles.empty}>No habits yet – start forming good habits today.</p>
        ) : (
          <ul style={styles.list}>
            {habits.map(h => (
              <li key={h.id} style={styles.listItem}>
                {h.icon} <strong>{h.name}</strong> ➤ streak {h.streak}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={styles.section}>
        <h2>Notes ({notes.length})</h2>
        {notes.length === 0 ? (
          <p style={styles.empty}>No notes yet. Jot down something great!</p>
        ) : (
          <ul style={styles.list}>
            {notes.map(n => (
              <li key={n.id} style={styles.listItem}>
                <strong>{n.subject}</strong> — {n.content.slice(0, 60)}...
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={styles.section}>
        <h2>Files ({files.length})</h2>
        {files.length === 0 ? (
          <p style={styles.empty}>No files yet. Upload your study materials here.</p>
        ) : (
          <ul style={styles.list}>
            {files.map(f => (
              <li key={f.id} style={styles.listItem}>
                <a href={f.url} target="_blank" rel="noopener noreferrer" style={styles.fileLink}>
                  {f.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  heading: {
    fontSize: '28px',
    marginBottom: '20px',
    color: '#1f2937',
  },
  section: {
    marginBottom: '30px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  listItem: {
    padding: '8px 0',
    borderBottom: '1px solid #e5e7eb',
  },
  meta: {
    marginLeft: '8px',
    color: '#6b7280',
    fontSize: '13px',
  },
  fileLink: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
  empty: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  spinner: {
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  error: {
    color: '#dc2626',
    marginBottom: '15px',
  },
};