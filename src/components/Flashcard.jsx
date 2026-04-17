import React, { useState } from 'react';

export default function Flashcard({ question, answer }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div 
      onClick={() => setFlipped(!flipped)} 
      style={cardStyles.container}
    >
      <div style={flipped ? cardStyles.back : cardStyles.front}>
        {flipped ? (
          <div>
            <strong style={{color: '#667eea'}}>Answer:</strong>
            <p>{answer}</p>
          </div>
        ) : (
          <div>
            <strong style={{color: '#1d4ed8'}}>Question:</strong>
            <p style={{ color: '#1f2937' }}>{question}</p>
          </div>
        )}
      </div>
      <p style={cardStyles.hint}>Click to flip</p>
    </div>
  );
}

const cardStyles = {
  container: {
    width: '300px',
    height: '200px',
    perspective: '1000px',
    cursor: 'pointer',
    margin: '10px',
  },
  front: {
    background: '#f7fafc',
    height: '100%',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    border: '2px solid #e2e8f0'
  },
  back: {
    background: '#f0a1e7',
    height: '100%',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    border: '2px solid #667eea'
  },
  hint: {
    fontSize: '10px',
    textAlign: 'center',
    color: '#a0aec0',
    marginTop: '5px'
  }
};