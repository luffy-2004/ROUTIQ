import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/routiq-logo.png';
import { getUserTasks, updateTaskCompletion, analyzeWorkload } from '../services/taskService';
import { getStudySessions, calculateTotalMinutes } from '../services/studyService';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workloadInfo, setWorkloadInfo] = useState({ status: 'easy', message: '', totalMinutes: 0, availableMinutes: 0 });

  // Dummy habits (hardcoded for now)
  const habits = [
    { id: 1, name: '📚 Read Daily', streak: 12 },
    { id: 2, name: '💪 Exercise', streak: 5 },
    { id: 3, name: '🧘 Meditate', streak: 3 },
  ];

  const [studyTime, setStudyTime] = useState({ completed: 0 });

  // Fetch tasks from Firestore
  useEffect(() => {
    if (authLoading || !user?.uid) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching tasks for user:', user.uid);
        const userTasks = await getUserTasks(user.uid);
        setTasks(userTasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user?.uid, authLoading]);

  // fetch today's study sessions
  useEffect(() => {
    if (authLoading || !user?.uid) return;
    const fetchStudy = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const sessions = await getStudySessions(user.uid, today);
        const minutes = calculateTotalMinutes(sessions);
        setStudyTime({ completed: minutes / 60 });
      } catch (err) {
        console.error('Error fetching study sessions:', err);
      }
    };
    fetchStudy();
  }, [user?.uid, authLoading]);

  // Toggle task completion
  const toggleTask = async (taskId, currentStatus) => {
    try {
      await updateTaskCompletion(taskId, !currentStatus);
      // Update local state
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, completed: !currentStatus } : task
      ));
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  // when tasks change we want to recalculate and save the workload report
  useEffect(() => {
    if (!user?.uid) return;
    const runAnalysis = async () => {
      try {
        const info = await analyzeWorkload(user.uid, tasks);
        setWorkloadInfo(info);
      } catch (err) {
        console.error('Error analyzing workload:', err);
      }
    };
    runAnalysis();
  }, [tasks, user?.uid]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (authLoading || loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container" style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <img src={logo} alt="Routiq Logo" style={styles.logo} />
        <div>
          <h1 style={styles.greeting}>
            {getGreeting()}, {user?.displayName || 'Student'}! 👋
          </h1>
          <p style={styles.tagline}>Ready to crush your goals?</p>
        </div>
        <div style={styles.dateInfo}>
          <p style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Tasks Done</p>
          <p style={styles.statValue}>{completedTasks}/{totalTasks}</p>
          <div style={styles.miniProgressBar}>
            <div style={{...styles.miniProgress, width: totalTasks > 0 ? `${(completedTasks/totalTasks)*100}%` : '0%'}}></div>
          </div>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Study Time</p>
          <p style={styles.statValue}>{studyTime.completed}h</p>
          <div style={styles.miniProgressBar}>
            <div style={{...styles.miniProgress, width: studyTime.completed > 0 ? '100%' : '0%'}}></div>
          </div>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Habit Streaks</p>
          <p style={styles.statValue}>{habits.length}</p>
          <p style={styles.streakPreview}>{habits.map(h => h.name).join(' ')}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {/* Main Content Grid */}
      <div style={styles.mainGrid}>
        {/* Today's Tasks */}
        <div className="card" style={styles.card}>
          <div style={styles.cardHeader}>
            <h2>📋 Your Tasks</h2>
            <span style={styles.badge}>{completedTasks}/{totalTasks}</span>
          </div>
          
          {totalTasks === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No tasks yet – add one and start winning! 📝</p>
              <p style={styles.emptyHint}>Go to "Add Task" to create your first task.</p>
            </div>
          ) : (
            <div style={styles.taskList}>
              {tasks.map(task => (
                <div key={task.id} style={styles.taskItem}>
                  <input
                    type="checkbox"
                    checked={task.completed || false}
                    onChange={() => toggleTask(task.id, task.completed)}
                    style={styles.checkbox}
                  />
                  <div style={styles.taskContent}>
                    <p style={{
                      ...styles.taskTitle,
                      textDecoration: task.completed ? 'line-through' : 'none',
                      opacity: task.completed ? 0.6 : 1,
                    }}>
                      {task.title}
                    </p>
                    <div style={styles.taskMeta}>
                      {task.category && <span style={styles.badge2}>{task.category}</span>}
                      {task.estimatedTime !== undefined && task.estimatedTime !== null && (
                        <span style={styles.meta}>⏱️ {Math.floor(task.estimatedTime/60)}h {task.estimatedTime%60}m</span>
                      )}
                      {task.priority && <span style={{...styles.meta, color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981'}}>
                        {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} {task.priority}
                      </span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={styles.rightColumn}>
          {/* AI Feedback Card */}
          <div className="card" style={{
            ...styles.card,
            ...styles.feedbackCard,
            borderLeft: `6px solid ${
              workloadInfo.status === 'easy' ? '#4ade80' :
              workloadInfo.status === 'doable' ? '#60a5fa' :
              '#f87171'
            }`
          }}>
            <h3 style={styles.feedbackTitle}>🤖 AI Workload Analysis</h3>
            <div style={{
              ...styles.workloadBadge,
              background: workloadInfo.status === 'easy' ? '#dcfce7' :
                         workloadInfo.status === 'doable' ? '#dbeafe' :
                         '#fee2e2',
              color: workloadInfo.status === 'easy' ? '#166534' :
                    workloadInfo.status === 'doable' ? '#1e40af' :
                    '#991b1b'
            }}>
              {workloadInfo.status === 'easy' ? '✅' : workloadInfo.status === 'doable' ? '⚡' : '⚠️'} {workloadInfo.status.toUpperCase()}
            </div>
            <p style={styles.feedbackMessage}>{workloadInfo.message}</p>
            <p style={styles.feedbackTip}>
              {workloadInfo.status === 'easy' && '🎯 Consider adding more tasks to stretch yourself!'}
              {workloadInfo.status === 'doable' && '⏰ You have approximately ' + workloadInfo.totalMinutes + ' minutes of work left.'}
              {workloadInfo.status === 'overloaded' && '💡 Prioritize the most important tasks and tackle them one at a time!'}
            </p>
          </div>

          {/* Study Time Progress */}
          <div className="card" style={styles.card}>
            <h3 style={styles.sectionTitle}>⏲️ Study Time Progress</h3>
            <div style={styles.progressSection}>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: studyTime.completed > 0 ? '100%' : '0%'
                }}></div>
              </div>
              <p style={styles.progressText}>
                {studyTime.completed}h completed
              </p>
              <p style={styles.progressHint}>
                {studyTime.completed > 0 ? 'Study time recorded from your sessions.' : 'No study sessions recorded yet.'}
              </p>
            </div>
          </div>

          {/* Habit Streaks */}
          <div className="card" style={styles.card}>
            <h3 style={styles.sectionTitle}>🔥 Habit Streaks</h3>
            <div style={styles.habitsList}>
              {habits.map(habit => (
                <div key={habit.id} style={styles.habitItem}>
                  <p style={styles.habitName}>{habit.name}</p>
                  <div style={styles.streakContainer}>
                    <span style={styles.streakNumber}>{habit.streak}</span>
                    <span style={styles.streakLabel}>days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Footer */}
      <div style={styles.motivationalCard}>
        <p style={styles.motivationalText}>
          "The secret of getting ahead is getting started." - Mark Twain
        </p>
        <p style={styles.motivationalSubtext}>You're doing great! Keep up the momentum! 💫</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
  padding: '40px',
  minHeight: '100vh',
  // ✅ ADD THIS:
  backgroundImage: "url('/bg.jpg')", // put your image in public folder
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  spinner: {
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '30px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    marginBottom: '0px',
    paddingBottom: '0px',
  
  },
  logo: {
    width: '100px',
    maxWidth: '100%',
    height: '150px',
  },
  greeting: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0  0',
  },
  tagline: {
    fontSize: '14px',
    color: '#667eea',
    fontWeight: '600',
    margin: '0',
  },
  dateInfo: {
    textAlign: 'right',
  },
  date: {
    fontSize: '23px',
    color: '#6b7280',
    margin: '0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginBottom: '30px',
  },
  statCard: {
    minHeight: '120px',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '10px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    padding: '20px',
  },
  statLabel: {
    fontSize: '22px',
    color: '#344d7e',
    margin: '0 0  0',
    fontWeight: '600',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#667eea',
    margin: '0 0  0',
  },
  miniProgressBar: {
    height: '19px',
    background: '#e5e7eb',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  miniProgress: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    transition: 'width 0.3s ease',
  },
  streakPreview: {
    fontSize: '21px',
    color: '#264273',
    margin: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    marginTop: '80px',
    gap: '30px',
    marginBottom: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #f3f4f6',
  },
  badge: {
    background: '#667eea',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  badge2: {
    background: '#f0f9ff',
    color: '#0369a1',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#6b7280',
    margin: '0 0 8px 0',
  },
  emptyHint: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: '0',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  taskItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    borderRadius: '6px',
    background: '#f9fafb',
    transition: 'background 0.2s ease',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginTop: '2px',
    cursor: 'pointer',
    accentColor: '#667eea',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1f2937',
  },
  taskMeta: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    margin: '0',
  },
  meta: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  feedbackCard: {
    borderTop: 'none',
  },
  feedbackTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 12px 0',
  },
  workloadBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  feedbackMessage: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 10px 0',
  },
  feedbackTip: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0',
    lineHeight: '1.5',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 15px 0',
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  progressBar: {
    height: '10px',
    background: '#e5e7eb',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0',
  },
  progressHint: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0',
  },
  habitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  habitItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    background: '#f9fafb',
    borderRadius: '6px',
  },
  habitName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1f2937',
    margin: '0',
  },
  streakContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  streakNumber: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  streakLabel: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  motivationalCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '25px',
    borderRadius: '10px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  motivationalText: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 10px 0',
    fontStyle: 'italic',
  },
  motivationalSubtext: {
    fontSize: '13px',
    margin: '0',
    opacity: 0.9,
  },
};

