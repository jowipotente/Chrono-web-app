import React, { useState, useEffect, useRef } from 'react';
import PopUpWindow from '../PopUpWindow';
import { useNavigate } from 'react-router-dom';
import ChronoSidebar from '../ChronoSidebar';
import './Dashboard.css';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownChoices, setDropdownChoices] = useState(() => {
    return ['Profile 1', 'Profile 2', 'Profile 3', 'Profile 4', 'Profile 5'];
  });
  const [userChoice, setUserChoice] = useState(() => {
    return dropdownChoices.length > 0 ? dropdownChoices[0] : '';
  });
  const [committedChoice, setCommittedChoice] = useState(() => {
    return dropdownChoices.length > 0 ? dropdownChoices[0] : '';
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(() => {
    return dropdownChoices.length > 0 ? 0 : null;
  });

  const [profiles, setProfiles] = useState([]);
  const [profileMap, setProfileMap] = useState({}); // Map profile_name to profile_id

  const [currentMonth, setCurrentMonth] = useState('');
  const [currentYear, setCurrentYear] = useState(0);

  // Remove duplicate generateDays function declaration

  const generateDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0 (Sun) to 6 (Sat)

    const daysArray = [];
    for (let i = 0; i < startDay; i++) {
      daysArray.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }
    setDays(daysArray);
  };

  const weekDays = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];

  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

  // Initialize currentMonth and currentYear on mount
  useEffect(() => {
    const now = new Date();
    setCurrentMonth(now.toLocaleString('default', { month: 'long' }));
    setCurrentYear(now.getFullYear());
    generateDays(now.getFullYear(), now.getMonth());
  }, []);

  const [selectedDate, setSelectedDate] = useState(null);
  const [days, setDays] = useState([]);
  const [eventsByDate, setEventsByDate] = useState({});

  const [showEventDialog, setShowEventDialog] = useState(false);
  const [dialogEvent, setDialogEvent] = useState(null);

  const [eventTitle, setEventTitle] = useState('');
  const [eventTimeFrom, setEventTimeFrom] = useState('');
  const [eventTimeTo, setEventTimeTo] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventComments, setEventComments] = useState('');
  const [activeTab, setActiveTab] = useState('Reminders'); // New state for tab control
  const [dateSortOrder, setDateSortOrder] = useState('desc'); // Sorting order for dates
  const [timeSortOrder, setTimeSortOrder] = useState('asc'); // Sorting order for times
  const [showPastEvents, setShowPastEvents] = useState(false); // Show past events toggle
  const navigate = useNavigate();

  // Fetch profiles for the logged-in user
  const fetchProfiles = async (userEmail) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_email', userEmail);

    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }
    setProfiles(data);
    const map = {};
    data.forEach(profile => {
      map[profile.profile_name] = profile.id;
    });
    setProfileMap(map);
    // Update dropdownChoices with profile names
    if (data.length > 0) {
      const names = data.map(p => p.profile_name);
      setDropdownChoices(names);
      setUserChoice(names[0]);
      setCommittedChoice(names[0]);
      setSelectedChoiceIndex(0);
    }
  };

  // Fetch events from Supabase for the selected profile
  const fetchEvents = async (profileId) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('profile_id', profileId);

    if (error) {
      console.error('Error fetching events:', error);
      return;
    }

    // Transform data into eventsByDate structure
    const eventsMap = {};
    data.forEach(event => {
      if (!eventsMap[event.user_choice]) {
        eventsMap[event.user_choice] = {};
      }
      if (!eventsMap[event.user_choice][event.date]) {
        eventsMap[event.user_choice][event.date] = [];
      }
      eventsMap[event.user_choice][event.date].push({
        id: event.id,
        title: event.title,
        timeFrom: event.time_from,
        timeTo: event.time_to,
        date: event.date,
        location: event.location,
        comments: event.comments,
      });
    });
    setEventsByDate(eventsMap);
  };

  // Auth state check using sessionStorage
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchProfiles(parsedUser.email);
      setLoading(false);
    } else {
      setLoading(false);
      navigate('/login');
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  //End of auth state check



  const handlePrevMonth = () => {
    let newMonthIndex = new Date(`${currentMonth} 1, ${currentYear}`).getMonth() - 1;
    let newYear = currentYear;
    if (newMonthIndex < 0) {
      newMonthIndex = 11;
      newYear -= 1;
    }
    setCurrentYear(newYear);
    setCurrentMonth(new Date(newYear, newMonthIndex).toLocaleString('default', { month: 'long' }));
    generateDays(newYear, newMonthIndex);
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    let newMonthIndex = new Date(`${currentMonth} 1, ${currentYear}`).getMonth() + 1;
    let newYear = currentYear;
    if (newMonthIndex > 11) {
      newMonthIndex = 0;
      newYear += 1;
    }
    setCurrentYear(newYear);
    setCurrentMonth(new Date(newYear, newMonthIndex).toLocaleString('default', { month: 'long' }));
    generateDays(newYear, newMonthIndex);
    setSelectedDate(null);
  };

  const handlePrevYear = () => {
    const newYear = currentYear - 1;
    const monthIndex = new Date(`${currentMonth} 1, ${currentYear}`).getMonth();
    setCurrentYear(newYear);
    setCurrentMonth(new Date(newYear, monthIndex).toLocaleString('default', { month: 'long' }));
    generateDays(newYear, monthIndex);
    setSelectedDate(null);
  };

  const handleNextYear = () => {
    const newYear = currentYear + 1;
    const monthIndex = new Date(`${currentMonth} 1, ${currentYear}`).getMonth();
    setCurrentYear(newYear);
    setCurrentMonth(new Date(newYear, monthIndex).toLocaleString('default', { month: 'long' }));
    generateDays(newYear, monthIndex);
    setSelectedDate(null);
  };

  // Helper to get events for current dropdown choice and date
  const getEventsForChoiceAndDate = (choice, dateKey) => {
    if (!eventsByDate[choice]) return [];
    return eventsByDate[choice][dateKey] || [];
  };

  // Helper to update events for a choice and date in Supabase and state
  const updateEventsForChoiceAndDate = async (choice, dateKey, newEvents) => {
    // Find new events that are not in DB and insert them
    for (const event of newEvents) {
      if (!event.id) {
        const profileId = profileMap[choice];
        const { data, error } = await supabase
          .from('events')
          .insert([{
            profile_id: profileId,
            user_choice: choice,
            title: event.title,
            time_from: event.timeFrom,
            time_to: event.timeTo,
            date: dateKey,
            location: event.location,
            comments: event.comments,
          }]);
        if (error) {
          console.error('Error inserting event:', error);
        } else {
          event.id = data[0].id;
        }
      }
    }
    // Update local state
    setEventsByDate(prev => {
      const updated = { ...prev };
      if (!updated[choice]) updated[choice] = {};
      updated[choice][dateKey] = newEvents;
      return updated;
    });
  };

  // Helper to delete event for choice and date in Supabase and state
  const deleteEventForChoiceAndDate = async (choice, dateKey, eventToDelete) => {
    if (eventToDelete.id) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete.id);
      if (error) {
        console.error('Error deleting event:', error);
      }
    }
    setEventsByDate(prev => {
      const updated = { ...prev };
      if (!updated[choice]) return prev;
      if (!updated[choice][dateKey]) return prev;
      updated[choice][dateKey] = updated[choice][dateKey].filter(e => e !== eventToDelete);
      if (updated[choice][dateKey].length === 0) {
        delete updated[choice][dateKey];
      }
      if (Object.keys(updated[choice]).length === 0) {
        delete updated[choice];
      }
      return updated;
    });
  };

  const closeDialog = () => {
    setShowEventDialog(false);
    setDialogEvent(null);
  };

  const handleSubmit = () => {
    if (!selectedDate || !eventTitle) {
      alert('Please select a date and enter an event title.');
      return;
    }
    const monthIndex = new Date(`${currentMonth} 1, ${currentYear}`).getMonth();
    // Zero pad month and day
    const paddedMonth = String(monthIndex + 1).padStart(2, '0');
    const paddedDay = String(selectedDate).padStart(2, '0');
    const dateKey = `${currentYear}-${paddedMonth}-${paddedDay}`;
    const eventsForDate = getEventsForChoiceAndDate(committedChoice, dateKey);
    const newStart = eventTimeFrom;
    const newEnd = eventTimeTo;

    const isOverlap = eventsForDate.some(event => {
      const existingStart = event.timeFrom;
      const existingEnd = event.timeTo;
      return (newStart < existingEnd && newEnd > existingStart);
    });

    if (isOverlap) {
      alert('Event time overlaps with an existing event. Please choose a different time.');
      return;
    }

    const newEvent = {
      title: eventTitle,
      timeFrom: eventTimeFrom,
      timeTo: eventTimeTo,
      date: selectedDate,
      location: eventLocation,
      comments: eventComments,
    };
    const updatedEventsForDate = [...eventsForDate, newEvent];
    updateEventsForChoiceAndDate(committedChoice, dateKey, updatedEventsForDate);

    setEventTitle('');
    setEventTimeFrom('');
    setEventTimeTo('');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ChronoSidebar />

      <div className="flex-1 flex flex-col min-w-0 p-6">
        <div className="flex justify-center items-center mb-6 space-x-4">
          <button
            onClick={handlePrevYear}
            aria-label="Previous Year"
            className="p-2 rounded hover:bg-gray-200"
          >
            &#171;
          </button>
          <button
            onClick={handlePrevMonth}
            aria-label="Previous Month"
            className="p-2 rounded hover:bg-gray-200"
          >
            &#8592;
          </button>
          <h1 className="text-lg font-bold text-gray-800">{currentMonth} {currentYear}</h1>
          <button
            onClick={handleNextMonth}
            aria-label="Next Month"
            className="p-2 rounded hover:bg-gray-200"
          >
            &#8594;
          </button>
          <button
            onClick={handleNextYear}
            aria-label="Next Year"
            className="p-2 rounded hover:bg-gray-200"
          >
            &#187;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 bg-blue-50 rounded-lg">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 mb-6">
{days.map((day, index) => {
  const monthIndex = new Date(`${currentMonth} 1, ${currentYear}`).getMonth();

  // Zero pad month and day for consistent key format
  const paddedMonth = String(monthIndex + 1).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');
  const dateKey = day ? `${currentYear}-${paddedMonth}-${paddedDay}` : null;

  // Remove usage of selectedWeek since it is removed
  const events = dateKey ? getEventsForChoiceAndDate(committedChoice, dateKey) : [];

  return (
    <div
      key={index}
      className={`min-h-[100px] flex flex-col items-start p-2 text-sm cursor-pointer rounded-lg border border-gray-100 ${
        day && selectedDate === day ? 'bg-purple-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700'
      }`}
      onClick={() => handleDateClick(day)}
    >
      <span className="font-bold">{day}</span>
      {events.length > 0 && (
        <div className="mt-1 w-full">
          <span className="inline-block bg-purple-500 rounded-full w-3 h-3"></span>
        </div>
      )}
      {events.map((event, idx) => (
        <div
          key={idx}
          className="text-xs bg-purple-200 text-purple-800 rounded-md px-1 py-0.5 mt-1 w-full truncate cursor-pointer"
          onClick={() => {
            setDialogEvent([event]);
            setShowEventDialog(true);
          }}
        >
          {event.title}
        </div>
      ))}
    </div>
  );
})}
        </div>
      </div>

      <div className="w-80 bg-white border-l border-gray-200 p-6 relative flex flex-col justify-between h-screen">
        <div>
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1 mt-16">
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'Reminders' ? 'bg-white text-gray-600' : 'text-gray-600 hover:bg-purple-200'
              }`}
              onClick={() => setActiveTab('Reminders')}
            >
              Reminders
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'Event' ? 'bg-white text-gray-600' : 'text-gray-600 hover:bg-purple-200'
              }`}
              onClick={() => setActiveTab('Event')}
            >
              Add Event
            </button>
          </div>

          <div className="absolute top-6 left-0 right-0 flex justify-between items-center px-6" tabIndex={0} onBlur={(e) => {
            // Delay closing dropdown to allow click events to register
            setTimeout(() => setShowDropdown(false), 150);
          }}>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={userChoice}
                onChange={(e) => setUserChoice(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (
                      selectedChoiceIndex !== null &&
                      userChoice.trim() !== '' &&
                      userChoice.trim() !== dropdownChoices[selectedChoiceIndex]
                    ) {
                      const oldChoice = dropdownChoices[selectedChoiceIndex];
                      const newChoice = userChoice.trim();
                      // Check for duplicate (case-insensitive)
                      const duplicate = dropdownChoices.some((choice, idx) => idx !== selectedChoiceIndex && choice.toLowerCase() === newChoice.toLowerCase());
                      if (duplicate) {
                        alert('Duplicate choice. Please enter another.');
                        return;
                      }
                      setDropdownChoices(prev => {
                        const newChoices = [...prev];
                        // Ensure length remains 5 by replacing only
                        if (newChoices.length === 5) {
                          newChoices[selectedChoiceIndex] = newChoice;
                        }
                        return newChoices;
                      });
                      // Migrate eventsByDate key from oldChoice to newChoice
                      setEventsByDate(prev => {
                        const updated = { ...prev };
                        if (updated[oldChoice]) {
                          updated[newChoice] = updated[oldChoice];
                          delete updated[oldChoice];
                          sessionStorage.setItem('eventsByDate', JSON.stringify(updated));
                        }
                        return updated;
                      });
                      setCommittedChoice(newChoice); // Update committedChoice only on Enter
                    }
                    // Keep dropdown open after editing choice
                    setShowDropdown(true);
                  }
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
                placeholder="Select or type"
                autoComplete="off"
                tabIndex={0}
              />
              {showDropdown && (
                <ul className="absolute w-32 max-h-40 overflow-auto border border-gray-300 bg-white rounded shadow-lg z-10" style={{ top: '2.5rem' }}>
                  {dropdownChoices.map((choice, index) => (
                    <li
                      key={index}
                      className="px-2 py-1 cursor-pointer hover:bg-purple-200"
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevent blur
                        setUserChoice(choice);
                        setSelectedChoiceIndex(index);
                        setCommittedChoice(choice);
                        setShowDropdown(false);
                      }}
                    >
                      {choice}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-black font-semibold">{user?.username || ''}</span>
              <button
                onClick={() => navigate('/settings')}
                className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center"
                title="Profile Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" stroke="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                  <path d="M6 20v-2c0-2.21 3.58-4 6-4s6 1.79 6 4v2" />
                </svg>
              </button>
            </div>
          </div>

          {activeTab === 'Event' ? (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time and Date</label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="time"
                    placeholder="From"
                    value={eventTimeFrom}
                    onChange={(e) => setEventTimeFrom(e.target.value)}
                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                  />
                  <input
                    type="time"
                    placeholder="To"
                    value={eventTimeTo}
                    onChange={(e) => setEventTimeTo(e.target.value)}
                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                  />
                </div>
                <div className="grid grid-cols-7 gap-1 mb-4 text-gray-500 text-xs">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                  <div>Sun</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Date</label>
                <input
                  type="text"
                  value={selectedDate ? new Date(currentYear, new Date(`${currentMonth} 1, ${currentYear}`).getMonth(), selectedDate).toLocaleDateString('en-US') : ''}
                  readOnly
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Location"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <textarea
                  rows={3}
                  placeholder="Comments"
                  value={eventComments}
                  onChange={(e) => setEventComments(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-4"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 mt-auto mb-4 flex justify-center items-center"
                style={{ paddingTop: '15px', paddingBottom: '15px' }}
              >
                Submit
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="mb-2 flex justify-between items-center">
                <h2 className="text-lg font-bold mb-2 text-left">Reminders</h2>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPastEvents}
                    onChange={() => setShowPastEvents(!showPastEvents)}
                    className="form-checkbox h-4 w-4 text-purple-600"
                  />
                  <span>Show Past Events</span>
                </label>
              </div>
              <div className="flex justify-center space-x-4 mb-4">
                <div>
                  <label htmlFor="dateSort" className="block text-xs font-medium text-gray-700 mb-1 text-center">Date Sort</label>
                  <select
                    id="dateSort"
                    value={dateSortOrder}
                    onChange={(e) => setDateSortOrder(e.target.value)}
                    className="px-2 py-1 rounded border border-gray-300 text-sm"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="timeSort" className="block text-xs font-medium text-gray-700 mb-1 text-center">Time Sort</label>
                  <select
                    id="timeSort"
                    value={timeSortOrder}
                    onChange={(e) => setTimeSortOrder(e.target.value)}
                    className="px-2 py-1 rounded border border-gray-300 text-sm"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
              <div className="overflow-auto flex-1 border border-gray-200 rounded p-2">
                {(() => {
                  console.log('Debug: committedChoice:', committedChoice, 'eventsByDate keys:', Object.keys(eventsByDate));
                  // Normalize date keys and group events by normalized date
                  const normalizedEventsMap = {};
                  // Only consider events for committedChoice
                  const datesObj = eventsByDate[committedChoice];
                  if (datesObj) {
                    Object.entries(datesObj).forEach(([dateKey, events]) => {
                      const dateObj = new Date(dateKey.trim());
                      if (isNaN(dateObj)) return; // skip invalid dates
                      const normalizedKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
                      if (!normalizedEventsMap[normalizedKey]) {
                        normalizedEventsMap[normalizedKey] = [];
                      }
                      if (Array.isArray(events)) {
                        normalizedEventsMap[normalizedKey].push(...events);
                      }
                    });
                  }

                  // Filter out year 2001 and earlier
                  const filteredKeys = Object.keys(normalizedEventsMap).filter(dateKey => {
                    const year = new Date(dateKey).getFullYear();
                    if (year <= 2001) return false;
                    if (!showPastEvents) {
                      // Only show upcoming events: date >= today
                      const today = new Date();
                      const date = new Date(dateKey);
                      return date >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    }
                    return true;
                  });

                  // Sort keys
                  filteredKeys.sort((a, b) => {
                    if (dateSortOrder === 'asc') {
                      return new Date(a) - new Date(b);
                    } else {
                      return new Date(b) - new Date(a);
                    }
                  });

                  return filteredKeys.map(dateKey => {
                    const events = normalizedEventsMap[dateKey]
                      .slice()
                      .sort((a, b) => {
                        if (timeSortOrder === 'asc') {
                          return a.timeFrom.localeCompare(b.timeFrom);
                        } else {
                          return b.timeFrom.localeCompare(a.timeFrom);
                        }
                      });
                    return (
                      <div key={dateKey} className="mb-4 p-2 border border-gray-300 rounded relative">
                        <p className="font-semibold">{event.title}</p>
                        <p>Start Time: {event.timeFrom ? new Date(`1970-01-01T${event.timeFrom}:00`).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                        <p>End Time: {event.timeTo ? new Date(`1970-01-01T${event.timeTo}:00`).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                        <p>Date: {event.date ? new Date(currentYear, new Date(`${currentMonth} 1, ${currentYear}`).getMonth(), event.date).toLocaleDateString('en-US') : 'N/A'}</p>
                        <p>Location: {event.location || 'N/A'}</p>
                        <p>Comments: {event.comments || 'N/A'}</p>
                        <button
                          onClick={() => {
                            // Delete event scoped to committedChoice
                            setEventsByDate(prev => {
                              const updatedEvents = { ...prev };
                              const profileEvents = updatedEvents[committedChoice];
                              if (profileEvents) {
                                const dateEvents = profileEvents[dateKey];
                                if (dateEvents) {
                                  profileEvents[dateKey] = dateEvents.filter(e => e !== event);
                                  if (profileEvents[dateKey].length === 0) {
                                    delete profileEvents[dateKey];
                                  }
                                  if (Object.keys(profileEvents).length === 0) {
                                    delete updatedEvents[committedChoice];
                                  }
                                }
                              }
                              sessionStorage.setItem('eventsByDate', JSON.stringify(updatedEvents));
                              return updatedEvents;
                            });
                          }}
                          className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          title="Delete Event"
                        >
                          Delete
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {showEventDialog && (
        <PopUpWindow
          date={selectedDate ? new Date(currentYear, new Date(`${currentMonth} 1, ${currentYear}`).getMonth(), selectedDate).toISOString().split('T')[0] : null}
          dialogEvent={dialogEvent}
          existingEvents={selectedDate ? eventsByDate[`${currentYear}-${String(new Date(`${currentMonth} 1, ${currentYear}`).getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`] || [] : []}
          onClose={closeDialog}
          currentYear={currentYear}
          currentMonth={currentMonth}
          onAddEvent={(newEvent) => {
            const eventDate = new Date(newEvent.start).toISOString().split('T')[0];
            const profileEvents = eventsByDate[committedChoice] || {};
            const eventsForDate = profileEvents[eventDate] || [];
            const updatedEventsForDate = [...eventsForDate, {
              title: newEvent.title,
              timeFrom: newEvent.start.slice(11,16),
              timeTo: newEvent.end.slice(11,16),
              date: new Date(newEvent.start).getDate(),
              location: newEvent.location,
              comments: newEvent.comments,
            }];
            const updatedProfileEvents = { ...profileEvents, [eventDate]: updatedEventsForDate };
            const updated = { ...eventsByDate, [committedChoice]: updatedProfileEvents };
            sessionStorage.setItem('eventsByDate', JSON.stringify(updated));
            setEventsByDate(updated);
          }}
          onDeleteEvent={(eventToDelete) => {
            // Delete event scoped to committedChoice and correct dateKey
            const monthIndex = new Date(`${currentMonth} 1, ${currentYear}`).getMonth();
            const paddedMonth = String(monthIndex + 1).padStart(2, '0');
            const day = eventToDelete.date || (new Date(eventToDelete.start).getDate());
            const paddedDay = String(day).padStart(2, '0');
            const dateKey = `${currentYear}-${paddedMonth}-${paddedDay}`;
            setEventsByDate(prev => {
              const updatedEvents = { ...prev };
              const profileEvents = updatedEvents[committedChoice];
              if (profileEvents) {
                const dateEvents = profileEvents[dateKey];
                if (dateEvents) {
                  profileEvents[dateKey] = dateEvents.filter(e => e !== eventToDelete);
                  if (profileEvents[dateKey].length === 0) {
                    delete profileEvents[dateKey];
                  }
                  if (Object.keys(profileEvents).length === 0) {
                    delete updatedEvents[committedChoice];
                  }
                }
              }
              sessionStorage.setItem('eventsByDate', JSON.stringify(updatedEvents));
              return updatedEvents;
            });
            setShowEventDialog(false);
            setDialogEvent(null);
          }}
        />
      )}
    </div>
  );
}
