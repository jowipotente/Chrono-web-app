import React, { useState, useEffect } from 'react';

export default function PopUpWindow({
  date,
  dialogEvent,
  existingEvents,
  onClose,
  onAddEvent,
  onDeleteEvent,
  currentYear,
  currentMonth,
  allowDelete = true,
}) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (dialogEvent && dialogEvent.length > 0) {
      // Clear creation form when viewing events
      setTitle('');
      setStartTime('');
      setEndTime('');
      setLocation('');
      setComments('');
      setError('');
    }
  }, [dialogEvent]);

  if (!date) {
    return null;
  }

  const handleSubmit = () => {
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    // Validate
    if (end <= start) {
      setError('End time must be after start time.');
      return;
    }

    // Check for time conflicts
    const hasConflict = existingEvents.some(event => {
      const evStart = new Date(event.start);
      const evEnd = new Date(event.end);
      return (
        (start >= evStart && start < evEnd) || // Overlaps start
        (end > evStart && end <= evEnd) ||     // Overlaps end
        (start <= evStart && end >= evEnd)     // Completely overlaps
      );
    });

    if (hasConflict) {
      setError('Another event is already scheduled during this time.');
      return;
    }

    onAddEvent({
      id: Date.now().toString(),
      title,
      start: start.toISOString(),
      end: end.toISOString(),
      location,
      comments,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4 max-h-[80vh] overflow-auto">
        {dialogEvent && dialogEvent.length > 0 ? (
          <>
            <h2 className="text-lg font-bold mb-4">Events on {new Date(date).toLocaleDateString('en-US')}</h2>
            {dialogEvent.map((event, idx) => (
              <div key={idx} className="mb-3 p-2 border border-gray-300 rounded relative">
                <p className="font-semibold">{event.title}</p>
                <p>Start Time: {event.timeFrom ? new Date(`1970-01-01T${event.timeFrom}`).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: true}) : (event.start ? new Date(event.start).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: true}) : '')}</p>
                <p>End Time: {event.timeTo ? new Date(`1970-01-01T${event.timeTo}`).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: true}) : (event.end ? new Date(event.end).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: true}) : '')}</p>
                <p>Date: {event.date ? new Date(currentYear, new Date(`${currentMonth} 1, ${currentYear}`).getMonth(), event.date).toLocaleDateString('en-US') : new Date(date).toLocaleDateString('en-US')}</p>
                <p>Location: {event.location || 'N/A'}</p>
                <p>Comments: {event.comments || 'N/A'}</p>
              </div>
            ))}
            <div className="flex justify-end space-x-2 mt-4">
              {allowDelete && (
                <button
                  onClick={() => {
                    if (dialogEvent.length > 0) {
                      onDeleteEvent(dialogEvent[0]);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  title="Delete Event"
                >
                  Delete
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">Create Event for {new Date(date).toLocaleDateString('en-US')}</h2>

            <input
              className="w-full border p-2 rounded"
              placeholder="Event Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="time"
                className="w-full border p-2 rounded"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
              <input
                type="time"
                className="w-full border p-2 rounded"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
            <input
              className="w-full border p-2 rounded"
              placeholder="Location"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
            <textarea
              className="w-full border p-2 rounded"
              placeholder="Comments"
              value={comments}
              onChange={e => setComments(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700">Save</button>
            </div>
          </>
        )}
      </div>
    </div>
  );}
