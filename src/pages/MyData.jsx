import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserTasks } from '../services/taskService';
import { getHabits } from '../services/habitService';
import { getStudyNotes, getStudyFiles } from '../services/studyService';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function MyData() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [notes, setNotes] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const fetchAll = async () => {
    try {
      setLoading(true);
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
      setError('Failed to sync with central database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.uid) fetchAll();
  }, [user?.uid, authLoading]);

  // --- NEW: UPLOAD LOGIC ---
 // --- NEW: UPLOAD LOGIC ---
  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!fileUrl || !fileName || !user) return;

    setUploading(true);
    try {
      // We go straight to the "study_files" collection in Firestore
      await addDoc(collection(db, "study_files"), {
        userId: user.uid,
        name: fileName,
        url: fileUrl, // The link you pasted
        createdAt: serverTimestamp()
      });
      
      // Reset form
      setFileName('');
      setFileUrl('');
      
      console.log("URL SYNCED TO MISSION DATA");
      await fetchAll(); // Refresh the list so the new link appears
    } catch (err) {
      console.error("Database Error:", err);
      alert("SYNC FAILED: Database connection interrupted.");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || loading) return (
    <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>
  );

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h1 style={styles.heading}>MISSION DATA CENTER</h1>
        
        <div style={styles.grid}>
          {/* Tasks Section */}
          <section style={styles.glassCard}>
            <h2 style={styles.cardTitle}>📊 ACTIVE TASKS</h2>
            <div style={styles.list}>
              {tasks.map(t => (
                <div key={t.id} style={styles.listItem}>
                  <span>{t.title}</span>
                  <span style={t.completed ? styles.statusDone : styles.statusPending}>
                    {t.completed ? 'COMPLETED' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Habits Section */}
          <section style={styles.glassCard}>
            <h2 style={styles.cardTitle}>🔥 HABIT STREAKS</h2>
            <div style={styles.list}>
              {habits.map(h => (
                <div key={h.id} style={styles.listItem}>
                  <span>{h.icon} {h.name}</span>
                  <span style={styles.streakBadge}>{h.streak} DAYS</span>
                </div>
              ))}
            </div>
          </section>

          {/* Files/PDF Section */}
          {/* Files/PDF Section - UPDATED TO URL MODE */}
<section style={styles.glassCard}>
  <h2 style={styles.cardTitle}>📁 DATA LINK REPOSITORY</h2>
  
  {/* NEW: Input form for the URL and Name */}
  <div style={styles.urlForm}>
    <input 
      type="text" 
      placeholder="FILE NAME (e.g. OS Module 3)" 
      value={fileName}
      onChange={(e) => setFileName(e.target.value)}
      style={styles.textInput}
    />
    <input 
      type="url" 
      placeholder="PASTE DATA URL HERE..." 
      value={fileUrl}
      onChange={(e) => setFileUrl(e.target.value)}
      style={styles.textInput}
    />
    <button onClick={handleAddUrl} style={styles.uploadBtn} disabled={uploading}>
      {uploading ? "SYNCING..." : "➕ ADD DATA LINK"}
    </button>
  </div>

  <div style={styles.list}>
    {/* This still maps through your 'files' array from Firestore */}
    {files.map(f => (
      <div key={f.id} style={styles.listItem}>
        <a href={f.url} target="_blank" rel="noreferrer" style={styles.fileLink}>
          {f.name.length > 20 ? f.name.slice(0, 20) + '...' : f.name}
        </a>
        <span style={{fontSize: '10px', color: '#667eea'}}>LINK</span>
      </div>
    ))}
  </div>
</section>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    padding: '40px 20px',
    color: 'white',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  heading: {
    textAlign: 'center',
    fontSize: '36px',
    letterSpacing: '5px',
    textShadow: '0 0 15px #667eea',
    marginBottom: '40px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '25px',
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  cardTitle: {
    fontSize: '18px',
    color: '#667eea',
    marginBottom: '20px',
    borderBottom: '1px solid rgba(102, 126, 234, 0.3)',
    paddingBottom: '10px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: '14px',
  },
  statusDone: { color: '#4ade80', fontWeight: 'bold' },
  statusPending: { color: '#fbbf24', opacity: 0.8 },
  streakBadge: {
    background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
    padding: '2px 8px',
    borderRadius: '5px',
    fontSize: '12px',
  },
  uploadBtn: {
    display: 'block',
    textAlign: 'center',
    padding: '10px',
    background: 'rgba(102, 126, 234, 0.2)',
    // 👇 Change this line to be a solid color for now
    border: '1px dashed #667eea', 
    borderRadius: '10px',
    cursor: 'pointer',
    marginBottom: '15px',
    fontSize: '13px',
    transition: '0.3s',
  },
  fileLink: {
    color: 'white',
    textDecoration: 'none',
    opacity: 0.9,
  },
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#000',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #667eea',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};