import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  addStudyNote,
  getStudyNotes,
  generateFlashcards,
  uploadStudyFile,
  getStudyFiles,
} from '../services/studyService';

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [flashcards, setFlashcards] = useState([]);
  const [formData, setFormData] = useState({ subject: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fileError, setFileError] = useState('');
  const [fileSuccess, setFileSuccess] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const fetch = async () => {
      try {
        const [noteList, fileList] = await Promise.all([
          getStudyNotes(user.uid),
          getStudyFiles(user.uid),
        ]);
        setNotes(noteList);
        setFiles(fileList);
      } catch (err) {
        console.error('Error loading notes/files:', err);
      }
    };
    fetch();
  }, [user?.uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setFileError('');
    setFileSuccess(false);
    if (!selectedFile) return;
    setFileLoading(true);
    try {
      console.log('uploading file', selectedFile.name);
      const fileRec = await uploadStudyFile(user.uid, selectedFile);
      setFiles([fileRec, ...files]);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFileSuccess(true);
    } catch (err) {
      console.error(err);
      setFileError(err.message || 'Failed to upload file');
    } finally {
      setFileLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.subject.trim() || !formData.content.trim()) {
      setError('Subject and content are required');
      return;
    }

    setLoading(true);
    try {
      const note = await addStudyNote(user.uid, formData);
      setNotes([note, ...notes]);
      setFlashcards(generateFlashcards(formData.content));
      setFormData({ subject: '', content: '' });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={styles.container}>
      <h1 style={styles.heading}>Study Notes</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>Note saved and flashcards generated ✅</p>}

        <div style={styles.formGroup}>
          <label style={styles.label}>Subject/Topic *</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            style={styles.input}
            disabled={loading}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Content *</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            style={styles.textarea}
            rows={6}
            disabled={loading}
          />
        </div>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Saving...' : 'Save Note'}
        </button>
      </form>

      {/* file upload section */}
      <form onSubmit={handleFileUpload} style={{ ...styles.form, marginTop: '30px' }}>
        {fileError && <p style={styles.error}>{fileError}</p>}
        {fileSuccess && <p style={styles.success}>File uploaded successfully ✅</p>}
        <div style={styles.formGroup}>
          <label style={styles.label}>Upload File</label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            disabled={fileLoading}
          />
        </div>
        <button type="submit" style={styles.button} disabled={fileLoading || !selectedFile}>
          {fileLoading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>

      {flashcards.length > 0 && (
        <div className="card" style={styles.card}>
          <h2>Flashcards</h2>
          {flashcards.map((fc, idx) => (
            <div key={idx} style={styles.flashcard}>
              <p style={styles.question}>{fc.question}</p>
              <p style={styles.answer}>{fc.answer}</p>
            </div>
          ))}
        </div>
      )}

      {notes.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2>Your Notes</h2>
          {notes.map(n => (
            <div key={n.id} style={styles.noteItem}>
              <h3 style={styles.noteSubject}>{n.subject}</h3>
              <p style={styles.noteContent}>{n.content}</p>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2>Uploaded Files</h2>
          {files.map(f => (
            <div key={f.id} style={styles.noteItem}>
              <a href={f.url} target="_blank" rel="noopener noreferrer" style={styles.fileLink}>
                {f.name}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  heading: {
    fontSize: '26px',
    marginBottom: '20px',
    color: '#1f2937',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '6px',
    color: '#374151',
  },
  input: {
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
  },
  textarea: {
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  button: {
    padding: '12px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  error: {
    color: '#dc2626',
    fontSize: '14px',
  },
  success: {
    color: '#16a34a',
    fontSize: '14px',
  },
  card: {
    marginTop: '30px',
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  flashcard: {
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '10px',
    background: '#fafafa',
  },
  question: {
    fontWeight: '600',
    marginBottom: '6px',
  },
  answer: {
    margin: 0,
  },
  noteItem: {
    padding: '15px',
    borderBottom: '1px solid #e5e7eb',
  },
  noteSubject: {
    margin: '0 0 6px 0',
    fontSize: '16px',
    fontWeight: '600',
  },
  noteContent: {
    margin: 0,
    fontSize: '14px',
    color: '#4b5563',
  },
  fileLink: {
    color: '#2563eb',
    textDecoration: 'underline',
    fontSize: '14px',
  },
};