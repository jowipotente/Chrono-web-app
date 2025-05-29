import React, { useState, useEffect } from 'react';

function EventDetailModal({ event, onClose, onDelete, onUpdate }) {
  // Use local state for editable fields within the modal, providing empty string fallbacks
  const [editedTitle, setEditedTitle] = useState(event?.title ?? '');
  const [editedStartTime, setEditedStartTime] = useState(event?.startTime ?? '');
  const [editedEndTime, setEditedEndTime] = useState(event?.endTime ?? '');
  const [editedLocation, setEditedLocation] = useState(event?.location ?? '');
  const [editedComments, setEditedComments] = useState(event?.comments ?? '');

  // useEffect to update local state if the 'event' prop changes (e.g., modal re-opened for a different event)
  useEffect(() => {
    setEditedTitle(event?.title ?? '');
    setEditedStartTime(event?.startTime ?? '');
    setEditedEndTime(event?.endTime ?? '');
    setEditedLocation(event?.location ?? '');
    setEditedComments(event?.comments ?? '');
  }, [event]); // Dependency array: re-run when the 'event' prop object reference changes

  // If no event is passed (e.g., when closing or initially), don't render the modal content
  if (!event) return null;

  const handleSave = () => {
    // Call the onUpdate prop with the new, edited event data
    if (onUpdate) {
      onUpdate({
        ...event, // Spread existing event properties (like id, date, selectedWeekDays etc.)
        title: editedTitle,
        startTime: editedStartTime,
        endTime: editedEndTime,
        location: editedLocation,
        comments: editedComments,
      });
    }
    onClose(); // Close the modal after saving
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Event Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Display Event Date (read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Date:</label>
          <p className="text-gray-900 text-lg font-semibold">{event.date}</p>
        </div>

        {/* Input fields for editing, using local state variables */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title:</label>
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="mb-4 flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">From:</label>
            <input
              type="time"
              value={editedStartTime}
              onChange={(e) => setEditedStartTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
            <input
              type="time"
              value={editedEndTime}
              onChange={(e) => setEditedEndTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location:</label>
          <input
            type="text"
            value={editedLocation}
            onChange={(e) => setEditedLocation(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Comments:</label>
          <textarea
            value={editedComments}
            onChange={(e) => setEditedComments(e.target.value)}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          ></textarea>
        </div>

        {/* Display selected weekdays (if applicable) */}
        {event.selectedWeekDays && event.selectedWeekDays.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Repeats on:</label>
            <div className="flex flex-wrap gap-2">
              {event.selectedWeekDays.map((day, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {day}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleSave}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleDeleteClick}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventDetailModal;