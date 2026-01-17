import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { notesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaArrowLeft, FaSave, FaStickyNote, FaExclamationTriangle } from 'react-icons/fa';

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  const isEditing = !!id;

  useEffect(() => {
    if (id) {
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getNoteById(id);
      setFormData({
        title: response.data.title || '',
        content: response.data.content || ''
      });
    } catch (error) {
      console.error('Error fetching note:', error);
      setError('Failed to load note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (isEditing) {
        await notesAPI.updateNote(id, formData);
      } else {
        await notesAPI.createNote(formData);
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving note:', error);
      setError('Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            to="/"
            className="inline-flex items-center text-blue-700 hover:text-blue-800 mr-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="flex items-center">
          <FaStickyNote className="h-8 w-8 text-blue-700 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Note' : 'Create New Note'}
            </h1>
            <p className="mt-1 text-gray-600">
              {isEditing ? 'Update your note below' : 'Write your new note below'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {/* Note Form */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-700 outline-none transition text-lg"
                placeholder="Enter note title"
                maxLength={25}
              />
              <div className="mt-1 text-sm text-gray-500 text-right">
                {formData.title.length}/25 characters
              </div>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="12"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-700 outline-none transition resize-none"
                placeholder="Write your note content here..."
              />
              <div className="mt-1 text-sm text-gray-500 text-right">
                {formData.content.length} characters
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-gray-200">
              <div className="mb-4 sm:mb-0">
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </Link>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      {isEditing ? 'Update Note' : 'Save Note'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Character Count Stats */}
      {/* <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Title Length</div>
          <div className="text-2xl font-bold text-blue-700">{formData.title.length}</div>
          <div className="text-xs text-gray-500">/ 100 characters</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Content Length</div>
          <div className="text-2xl font-bold text-blue-700">{formData.content.length}</div>
          <div className="text-xs text-gray-500">characters</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Words</div>
          <div className="text-2xl font-bold text-blue-700">
            {formData.content.split(/\s+/).filter(word => word.length > 0).length}
          </div>
          <div className="text-xs text-gray-500">total words</div>
        </div>
      </div> */}
    </div>
  );
};

export default NoteEditor;