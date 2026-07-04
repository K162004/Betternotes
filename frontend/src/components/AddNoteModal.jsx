import { useState } from 'react';
import { saveNote, updateNote } from '../api';

function AddNoteModal({ onClose, onNoteSaved, editNote }) {
  const isEditing = !!editNote;
  const [title, setTitle] = useState(editNote ? editNote.title : '');
  const [content, setContent] = useState(editNote ? editNote.content : '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (isEditing) {
        const result = await updateNote(editNote._id, title.trim(), content.trim());
        onNoteSaved(result.note, true); // true = is an edit
      } else {
        const result = await saveNote(title.trim(), content.trim());
        onNoteSaved(result.note, false);
      }
      onClose();
    } catch (err) {
      setError('Could not save note. Is your backend running on port 5000?');
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Note' : 'Add New Note'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <label className="field-label">Title</label>
        <input
          className="field-input"
          placeholder="Enter note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="field-label">Content</label>
        <textarea
          className="field-textarea"
          placeholder="Write your note here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditing ? 'Update Note' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddNoteModal;