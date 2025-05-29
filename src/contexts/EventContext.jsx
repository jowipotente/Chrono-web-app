import React, { createContext, useState, useEffect, useContext } from 'react';

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [eventsByDate, setEventsByDate] = useState({});

  useEffect(() => {
    const storedEvents = localStorage.getItem('eventsByDate');
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents);
        setEventsByDate(parsedEvents);
      } catch (e) {
        console.error("Failed to parse stored events from localStorage:", e);
        localStorage.removeItem('eventsByDate');
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('eventsByDate', JSON.stringify(eventsByDate));
    } catch (e) {
      console.error("Failed to save events to localStorage:", e);
    }
  }, [eventsByDate]);

  return (
    <EventContext.Provider value={{ eventsByDate, setEventsByDate }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};