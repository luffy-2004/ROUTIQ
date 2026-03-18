import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMessages, addMessage, generateAIReply } from '../services/chatService';

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { user } = useAuth();

  // load existing conversation when user logs in
  useEffect(() => {
    if (!user?.uid) return;
    const fetch = async () => {
      try {
        const msgs = await getMessages(user.uid);
        if (msgs.length === 0) {
          // start conversation with a greeting
          const greeting = "Hi! I'm your AI study buddy. How can I help you today?";
          try {
            const saved = await addMessage(user.uid, 'assistant', greeting);
            setMessages([{ id: saved.id, role: 'assistant', text: greeting }]);
          } catch (e) {
            console.error('Failed to save greeting', e);
            setMessages([{ id: Date.now(), role: 'assistant', text: greeting }]);
          }
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
    if (input.trim()) {
      const text = input.trim();
      // save user message
      let newMsgs = [...messages];
      if (user?.uid) {
        try {
          const saved = await addMessage(user.uid, 'user', text);
          newMsgs = [...newMsgs, { id: saved.id, role: 'user', text }];
        } catch (e) {
          console.error('Failed to save user message', e);
          newMsgs = [...newMsgs, { id: Date.now(), role: 'user', text }];
        }
      } else {
        newMsgs = [...newMsgs, { id: Date.now(), role: 'user', text }];
      }
      setMessages(newMsgs);
      setInput('');

      // generate and save AI reply (local heuristic generator)
      const reply = generateAIReply(text);
      if (user?.uid) {
        try {
          const saved = await addMessage(user.uid, 'assistant', reply);
          setMessages(prev => [...prev, { id: saved.id, role: 'assistant', text: reply }]);
        } catch (e) {
          console.error('Failed to save AI reply', e);
          setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: reply }]);
        }
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: reply }]);
      }
    }
  };

  return (
    <div className="container" style={styles.container}>
      <h1>AI Study Buddy</h1>
      
      <div style={styles.chatBox}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            ...styles.message,
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            background: msg.role === 'user' ? '#667eea' : '#e0e0e0',
            color: msg.role === 'user' ? 'white' : 'black',
          }}>
            {msg.text}
          </div>
        ))}
      </div>

      <div style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
          style={styles.input}
        />
        <button onClick={handleSend} style={styles.button}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  chatBox: {
    flex: 1,
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  message: {
    padding: '10px 15px',
    borderRadius: '8px',
    maxWidth: '80%',
    wordWrap: 'break-word',
  },
  inputArea: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
  },
  button: {
    padding: '12px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
