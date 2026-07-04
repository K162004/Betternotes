import { useState } from 'react';
import { deleteNote } from '../api';

function Sidebar({ notes, onNewNoteClick, onNoteDeleted, onNoteEdit }) {
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (e, noteId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this note?')) return;
    setDeletingId(noteId);
    try {
      await deleteNote(noteId);
      onNoteDeleted(noteId);
    } catch (err) {
      alert('Could not delete note. Is backend running?');
    }
    setDeletingId(null);
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18c0-2 1-3 3-3s3 1 3 3M12 3a6 6 0 0 0-6 6c0 2 1 3 2 4l1 2h6l1-2c1-1 2-2 2-4a6 6 0 0 0-6-6z" />
          </svg>
        </div>
        <span className="brand-name">BetterNotes</span>
      </div>

      <button className="new-note-btn" onClick={onNewNoteClick}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        New Note
      </button>

      <div className="sidebar-section-label">My Notes</div>

      {/* Search box */}
      <div className="sidebar-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredNotes.length === 0 ? (
        <p className="notes-empty">
          {search ? 'No notes match your search.' : 'No notes yet. Add your first note to get started.'}
        </p>
      ) : (
        <ul className="notes-list">
          {filteredNotes.map((note) => (
            <li className="note-item" key={note._id} title={note.title}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
              <span className="note-item-title">{note.title}</span>
              <div className="note-actions">
                <button
                  className="note-edit-btn"
                  onClick={(e) => { e.stopPropagation(); onNoteEdit(note); }}
                  title="Edit note"
                >✎</button>
                <button
                  className="note-delete-btn"
                  onClick={(e) => handleDelete(e, note._id)}
                  disabled={deletingId === note._id}
                  title="Delete note"
                >{deletingId === note._id ? '...' : '×'}</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="sidebar-footer">
        {notes.length} {notes.length === 1 ? 'note' : 'notes'} stored
      </div>
    </aside>
  );
}

export default Sidebar;