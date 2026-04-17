import React, { useState } from 'react';
import Flashcard from '../components/Flashcard'; 

export default function Revision() {
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return alert("Please enter a topic!");
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();
      setCards(data); 
    } catch (err) {
      console.error("Error generating cards:", err);
      alert("Something went wrong with the AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>AI Revision Test</h2>
        <p style={styles.subtitle}>Generate custom flashcards to crush your study goals.</p>

        {/* FIXED INPUT SECTION */}
        <div style={styles.inputCard}>
          <input 
            type="text" 
            placeholder="e.g. Data Structures or GATE Math" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleGenerate} disabled={loading} style={styles.button}>
            {loading ? "CREATING..." : "GENERATE CARDS"}
          </button>
        </div>

        <div style={styles.grid}>
          {cards.map((card, index) => (
            <Flashcard key={index} question={card.question} answer={card.answer} />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    textAlign: 'center',
  },
  title: {
    fontSize: '42px',
    fontWeight: '900',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    color: '#fff',
    textShadow: '0 0 10px #667eea, 0 0 20px #764ba2', 
  },
  subtitle: {
    fontSize: '19px',
    marginBottom: '40px',
    color: '#8f68dd', // Changed to white for better visibility on your background
    textTransform: 'uppercase',
    letterSpacing: '1px',
    opacity: 0.9,
  },
  inputCard: {
    opacity: 0.9,
    background: 'rgba(181, 233, 246, 0.8)', 
    backdropFilter: 'blur(50px)',
    border: '2px solid rgba(229, 222, 235, 0.6)', 
    padding: '25px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center', // Centers button and input vertically
    gap: '15px',
    marginBottom: '50px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    width: '100%',
    boxSizing: 'border-box',
  },
  input: {
    flex: '1',               // FORCES input to take up all available space
    width: '650px',       // PREVENTS the tiny box issue
    height: '60px',          // Tall, visible field
    padding: '0 25px',
    background: 'linear-gradient(135deg, #d8b7d2 0%, #f091dc 100%)',  // PURE BLACK background for maximum text contrast
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    color: '#2e1111',        // BRIGHT WHITE text
    fontSize: '18px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    flexShrink: 0,           // PREVENTS button from squashing the input
    height: '60px',
    width: '320px',          // Matches input height
    padding: '0 40px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: '800',
    fontSize: '16px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(118, 75, 162, 0.5)',
    transition: 'transform 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '25px',
  }
};