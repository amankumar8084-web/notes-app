import React from 'react';
import { FaEdit, FaTrash, FaStickyNote } from 'react-icons/fa';
import { format } from 'date-fns';

const NoteItem = ({ note, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <FaStickyNote className="text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {note.title}
            </h3>
          </div>
          <p className="text-gray-600 mb-3 line-clamp-3">
            {note.content}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {note.createdAt && format(new Date(note.createdAt), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit(note)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Edit note"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Delete note"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteItem;