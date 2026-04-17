import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home-hero">
      <div className="card home-card" style={{ textAlign: 'center' }}>
        <h1>Welcome to Routiq</h1>
        <p>
          🤖 Routiq helps students track tasks, habits, study notes and files in one place.
          Create tasks, record study sessions, upload your revision materials
          and generate flashcards automatically.
        </p>
        <p>Click the logo or use the navigation to explore.</p>
        <Link to="/login" className="button" style={{ marginTop: '20px' }}>
          Get Started
        </Link>
      </div>
    </div>
  );
}
