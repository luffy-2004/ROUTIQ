import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMessages, addMessage } from '../services/chatService';

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { user } = useAuth();
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user?.uid) return;
    const fetch = async () => {
      try {
        const msgs = await getMessages(user.uid);
        if (msgs.length === 0) {
          const greeting = "Greetings, Pilot. I'm your AI Study Buddy. What is our objective today?";
          setMessages([{ id: Date.now(), role: 'assistant', text: greeting }]);
        } else {
          setMessages(msgs);
        }
      } catch (e) {
        console.error('Failed to fetch messages', e);
      }
    };
    fetch();
  }, [user?.uid]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');

    const tempUserMsg = { id: Date.now(), role: 'user', text };
    const loadingId = Date.now() + 1;
    const loadingMsg = { id: loadingId, role: 'assistant', text: "Analyzing data..." };
    
    setMessages(prev => [...prev, tempUserMsg, loadingMsg]);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      const aiReply = data.reply;

      setMessages(prev => 
        prev.map(msg => msg.id === loadingId ? { ...msg, text: aiReply } : msg)
      );

      if (user?.uid) {
        addMessage(user.uid, 'user', text).catch(e => console.error("Save failed", e));
        addMessage(user.uid, 'assistant', aiReply).catch(e => console.error("Save failed", e));
      }
    } catch (err) {
      setMessages(prev => 
        prev.map(msg => msg.id === loadingId ? { ...msg, text: "Uplink Error. Check server." } : msg)
      );
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🤖 AI NEURAL LINK</h1>
      
      <div style={styles.chatBox}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            ...styles.message,
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            background: msg.role === 'user' ? 'rgba(102, 126, 234, 0.4)' : 'rgba(255, 255, 255, 0.1)',
            border: msg.role === 'user' ? '1px solid #667eea' : '1px solid rgba(255,255,255,0.2)',
          }}>
            <span style={styles.roleLabel}>{msg.role === 'user' ? 'YOU' : 'AI'}</span>
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* FIXED INPUT SECTION */}
      <div style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="TYPE YOUR COMMAND..."
          style={styles.input}
        />
        <button onClick={handleSend} style={styles.button}>SEND</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
    height: '85vh',
    display: 'flex',
    flexDirection: 'column',
  },
  heading: {
    color: 'white',
    fontSize: '28px',
    letterSpacing: '4px',
    marginBottom: '20px',
    textAlign: 'center',
    textShadow: '0 0 15px rgba(102, 126, 234, 0.8)',
  },
  chatBox: {
    flex: 1,
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(15px)',
    borderRadius: '20px',
    padding: '30px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '20px',
  },
  message: {
    padding: '15px 20px',
    borderRadius: '15px',
    maxWidth: '70%',
    color: 'white',
    fontSize: '16px',
    lineHeight: '1.4',
  },
  roleLabel: {
    display: 'block',
    fontSize: '10px',
    fontWeight: 'bold',
    marginBottom: '5px',
    letterSpacing: '2px',
    opacity: 0.7,
  },
  inputArea: {
    display: 'flex',
    width: '100%',
    gap: '15px',
    padding: '15px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxSizing: 'border-box',
  },
  input: {
    flex: '1',               // Forces the input to grow and take space
    minWidth: '100px',       // Prevents the tiny box issue
    height: '60px',          // Tall, visible box
    padding: '0 25px',
    background: '#1a1a1a',   // DARK solid background so text is easy to see
    border: '2px solid #667eea', 
    borderRadius: '12px',
    color: '#ffffff',        // BRIGHT WHITE text
    fontSize: '18px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '150px',          // Fixed width for button
    height: '60px',          // Match input height
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    letterSpacing: '2px',
    flexShrink: 0,           // Prevents button from changing size
    boxShadow: '0 0 20px rgba(102, 126, 234, 0.4)',
  },
};