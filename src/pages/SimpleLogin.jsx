import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SimpleLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleClick = () => {
    setMessage(`Button clicked! Email: ${email}, Password: ${password}`);
    console.log('Button was clicked');
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div style={{padding: '40px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ddd', borderRadius: '8px'}}>
      <h1>Simple Login Test</h1>
      <p>If you can see this and click the button below, the page works.</p>
      
      <div style={{marginBottom: '15px'}}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
        />
      </div>

      <div style={{marginBottom: '15px'}}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
        />
      </div>

      <button
        onClick={handleClick}
        style={{
          width: '100%',
          padding: '10px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        Test Button Click
      </button>

      {message && (
        <div style={{marginTop: '20px', padding: '10px', background: '#efe', border: '1px solid #6c6', borderRadius: '4px'}}>
          <p>{message}</p>
          <p style={{fontSize: '12px', color: '#666'}}>Check browser console (F12) for logs</p>
        </div>
      )}
    </div>
  );
}
