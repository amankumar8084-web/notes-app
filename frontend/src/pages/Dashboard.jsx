import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaStickyNote, FaTrash, FaEdit, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import { format } from 'date-fns';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getAllNotes();
      setNotes(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    setDeletingId(noteId);
    try {
      await notesAPI.deleteNote(noteId);
      setNotes(notes.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditNote = (noteId) => {
    navigate(`/notes/edit/${noteId}`);
  };

  const handleCreateNote = () => {
    navigate('/notes/new');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
            <p className="mt-2 text-gray-600">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} total
            </p>
          </div>
          <button
            onClick={handleCreateNote}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
          >
            <FaPlus className="mr-2" />
            Create New Note
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <FaStickyNote className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No notes yet</h3>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            Get started by creating your first note. Click the "Create New Note" button above.
          </p>
          <button
            onClick={handleCreateNote}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800"
          >
            <FaPlus className="mr-2" />
            Create Your First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Note header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <FaStickyNote className="h-5 w-5 text-blue-700 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {note.title || 'Untitled Note'}
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditNote(note._id)}
                      className="p-1 text-blue-700 hover:bg-blue-50 rounded"
                      title="Edit note"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      disabled={deletingId === note._id}
                      className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                      title="Delete note"
                    >
                      {deletingId === note._id ? (
                        <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                </div>

                {/* Note content preview */}
                <p className="text-gray-600 line-clamp-3 mb-4">
                  {note.content || 'No content'}
                </p>

                {/* Note footer */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                      {note.createdAt && format(new Date(note.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {note.content?.length || 0} chars
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats footer */}
      {notes.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
            <div>
              Showing <span className="font-medium">{notes.length}</span> notes
            </div>
            <div className="mt-2 sm:mt-0">
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;