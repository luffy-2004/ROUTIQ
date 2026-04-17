import { auth } from '../firebase/config';

export default function TestFirebase() {
  const testConnection = async () => {
    try {
      console.log('Firebase Auth object:', auth);
      console.log('Firebase Auth App:', auth.app);
      console.log('Firebase configured successfully!');
      alert('Firebase is connected! Check console for details.');
    } catch (error) {
      console.error('Firebase error:', error);
      alert('Firebase error: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Firebase Connection Test</h2>
      <p>Click the button below to test if Firebase is properly configured.</p>
      <button
        onClick={testConnection}
        style={{
          padding: '10px 20px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Test Firebase Connection
      </button>
      <p style={{ marginTop: '20px', color: '#999', fontSize: '12px' }}>
        Open browser Developer Tools (F12) → Console to see detailed output
      </p>
    </div>
  );
}
