import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import AddNoteModal from './components/AddNoteModal';
import { getNotes } from './api';

function App() {
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);

  useEffect(() => {
    getNotes()
      .then(setNotes)
      .catch(() => console.log('Could not reach backend.'));
  }, []);

  const handleNoteSaved = (note, isEdit) => {
    if (isEdit) {
      setNotes((prev) => prev.map((n) => n._id === note._id ? note : n));
    } else {
      setNotes((prev) => [...prev, note]);
    }
  };

  const handleNoteDeleted = (deletedId) => {
    setNotes((prev) => prev.filter((n) => n._id !== deletedId));
  };

  const handleNoteEdit = (note) => {
    setEditNote(note);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditNote(null);
  };

  return (
    <div className="app-shell">
      <Sidebar
        notes={notes}
        onNewNoteClick={() => setIsModalOpen(true)}
        onNoteDeleted={handleNoteDeleted}
        onNoteEdit={handleNoteEdit}
      />
      <Chat notes={notes} />
      {isModalOpen && (
        <AddNoteModal
          onClose={handleModalClose}
          onNoteSaved={handleNoteSaved}
          editNote={editNote}
        />
      )}
    </div>
  );
}

export default App;