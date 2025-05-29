import { useState, useEffect } from 'react'
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'

import '@schedule-x/theme-default/dist/index.css' // Import Schedule-X default theme

import ChronoSidebar from '../ChronoSidebar'
import { useEvents } from '../contexts/EventContext'; // Essential for consuming events
import PopUpWindow from '../PopUpWindow';

function CalendarApp() {
  const eventsService = useState(() => createEventsServicePlugin())[0]
  const { eventsByDate } = useEvents(); // Get events from context

  // Use eventsByDate directly without filtering by profile choice
  console.log('EventsByDate:', eventsByDate);
  const filteredEventsByDate = eventsByDate || {};

  // Helper to transform your event data structure to Schedule-X's format
  const transformEventsForScheduleX = (eventsMap) => {
    const transformedEvents = [];
    for (const date in eventsMap) {
      if (Object.hasOwnProperty.call(eventsMap, date)) {
        eventsMap[date].forEach(event => {
          const startDateTime = `${date}T${event.timeFrom || event.startTime || '00:00'}:00`;
          const endDateTime = `${date}T${event.timeTo || event.endTime || '00:00'}:00`;

          // Convert to Date objects
          const startDateObj = new Date(startDateTime);
          const endDateObj = new Date(endDateTime);

          // Format to ISO string without timezone offset (YYYY-MM-DDTHH:mm:ss)
          const formatToLocalISOString = (date) => {
            const pad = (num) => num.toString().padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
          };

          transformedEvents.push({
            id: event.id ? event.id.toString() : Date.now().toString(), // Schedule-X requires ID as string
            title: event.title,
            start: formatToLocalISOString(startDateObj),
            end: formatToLocalISOString(endDateObj),
            // You can add more Schedule-X specific properties here
            // e.g., description: event.comments, location: event.location, calendarId: 'work'
          });
        });
      }
    }
    return transformedEvents;
  };

  const calendar = useCalendarApp({
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(), // The main month view
      createViewMonthAgenda(),
    ],
    events: [], // Events will be populated by the useEffect
    plugins: [eventsService]
  })

  // Debug calendarApp object for visible range and time scale info
  useEffect(() => {
    if (calendar) {
      console.log('calendarApp object:', calendar);
      if (calendar.getVisibleRange) {
        console.log('Visible range:', calendar.getVisibleRange());
      }
      if (calendar.getTimeScale) {
        console.log('Time scale:', calendar.getTimeScale());
      }
    }
  }, [calendar]);

  // Effect to update Schedule-X calendar when filteredEventsByDate changes
  useEffect(() => {
    const transformed = transformEventsForScheduleX(filteredEventsByDate);
    console.log('Transformed events for ScheduleX:', transformed);
    eventsService.set(transformed);
  }, [filteredEventsByDate, eventsService]) // Dependencies: run when filteredEventsByDate or eventsService changes

  // Popup state for event info
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [dialogEvent, setDialogEvent] = useState(null);

  // Handle event icon click to show popup
  const handleEventIconClick = (event) => {
    setDialogEvent([event]);
    setShowEventDialog(true);
  };

  // Optional: Add a loading state if calendar takes time to initialize
  if (!calendar) {
    return (
      <div className="flex h-screen bg-gray-50">
        <ChronoSidebar />
        <div className="flex-1 p-6 overflow-auto">
          <div>Loading Calendar...</div>
        </div>
      </div>
    );
  }

  // Calculate event duration in minutes for icon sizing
  const getEventDurationMinutes = (event) => {
    const start = new Date(`${event.date}T${event.timeFrom || event.startTime || '00:00'}`);
    const end = new Date(`${event.date}T${event.timeTo || event.endTime || '00:00'}`);
    return (end - start) / (1000 * 60);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ChronoSidebar /> {/* Your sidebar for navigation */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Removed profile dropdown and Week View label */}

        {/* Event bars sized by duration, clickable to show popup */}
        <div className="flex flex-wrap gap-2 mb-4 items-end" style={{ height: 50 }}>
          {Object.entries(filteredEventsByDate).map(([date, events]) =>
            events.map((event, idx) => {
              const duration = getEventDurationMinutes(event);
              const barHeight = Math.min(Math.max(duration / 5, 10), 50); // height between 10 and 50 px
              return (
                <div
                  key={`${date}-${idx}`}
                  title={`${event.title} (${duration} mins)`}
                  onClick={() => handleEventIconClick(event)}
                  className="bg-purple-600 cursor-pointer"
                  style={{ width: 20, height: barHeight, borderRadius: 4 }}
                />
              );
            })
          )}
        </div>

        <div className="relative">
          <ScheduleXCalendar calendarApp={calendar} />
          {/* Custom bar chart overlay */}
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 10 }}
          >
            {Object.entries(filteredEventsByDate).map(([date, events]) =>
              events.map((event, idx) => {
                // Calculate position and size for bar overlay
                // For simplicity, position bars horizontally by date index and vertically by time
                // This is a simplified example and may need adjustment to align with calendar grid

                // Calculate day index relative to visible week start (assume week view)
                const weekStart = new Date();
                weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday as start
                const eventDate = new Date(date);
                const dayIndex = Math.floor((eventDate - weekStart) / (1000 * 60 * 60 * 24));
                if (dayIndex < 0 || dayIndex > 6) return null; // Outside visible week

                // Calculate top position based on start time (hours and minutes)
                const startTimeParts = (event.timeFrom || event.startTime || '00:00').split(':');
                const startHour = parseInt(startTimeParts[0], 10);
                const startMinute = parseInt(startTimeParts[1], 10);
                const topPercent = ((startHour * 60 + startMinute) / (24 * 60)) * 100;

                // Calculate height based on duration in minutes
                const durationMinutes = (() => {
                  const start = new Date(`${date}T${event.timeFrom || event.startTime || '00:00'}`);
                  const end = new Date(`${date}T${event.timeTo || event.endTime || '00:00'}`);
                  return (end - start) / (1000 * 60);
                })();
                const heightPercent = (durationMinutes / (24 * 60)) * 100;

                // Calculate left position and width for day column (7 days)
                const leftPercent = (dayIndex / 7) * 100;
                const widthPercent = 100 / 7;

                return (
                  <div
                    key={`${date}-${idx}`}
                    title={`${event.title} (${durationMinutes} mins)`}
                    onClick={() => handleEventIconClick(event)}
                    className="bg-purple-600 cursor-pointer absolute rounded"
                    style={{
                      top: `${topPercent}%`,
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      height: `${heightPercent}%`,
                      pointerEvents: 'auto',
                      opacity: 0.7,
                    }}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {showEventDialog && (
        <PopUpWindow
          date={dialogEvent && dialogEvent.length > 0 ? dialogEvent[0].date : null}
          dialogEvent={dialogEvent}
          existingEvents={filteredEventsByDate[dialogEvent && dialogEvent.length > 0 ? dialogEvent[0].date : ''] || []}
          onClose={() => setShowEventDialog(false)}
          currentYear={new Date().getFullYear()}
          currentMonth={new Date().toLocaleString('default', { month: 'long' })}
          allowDelete={false} // Disable delete feature in popup
        />
      )}
    </div>
  )
}

export default CalendarApp
