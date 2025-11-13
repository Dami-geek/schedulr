import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CanvasEvent } from './CanvasContext';

export interface CalendarEvent extends CanvasEvent {
  isManual?: boolean;
}

interface CalendarContextType {
  view: 'month' | 'week' | 'day';
  setView: (view: 'month' | 'week' | 'day') => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  filter: {
    courses: string[]; // courseCode list
    types: string[];
    completed: boolean | null; // filters by event.isCompleted
  };
  setFilter: (filter: any) => void;
  manualEvents: CalendarEvent[];
  addManualEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateManualEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteManualEvent: (id: string) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState({
    courses: [],
    types: [],
    completed: null
  });
  const [manualEvents, setManualEvents] = useState<CalendarEvent[]>([]);

  // Load manual events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('manual_events');
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        setManualEvents(parsed);
      } catch (e) {
        console.warn('Failed to parse manual_events from localStorage', e);
      }
    }
  }, []);

  const persist = (events: CalendarEvent[]) => {
    setManualEvents(events);
    localStorage.setItem('manual_events', JSON.stringify(events));
  };

  const addManualEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `manual-${Date.now()}`,
      isManual: true,
      // Normalize field names
      isCompleted: event.isCompleted ?? false,
      dueDate: event.dueDate,
      course: event.course ?? ''
    };
    const updatedEvents = [...manualEvents, newEvent];
    persist(updatedEvents);
  };

  const updateManualEvent = (id: string, event: Partial<CalendarEvent>) => {
    const updatedEvents = manualEvents.map(e => 
      e.id === id ? { ...e, ...event } : e
    );
    persist(updatedEvents);
  };

  const deleteManualEvent = (id: string) => {
    const updatedEvents = manualEvents.filter(e => e.id !== id);
    persist(updatedEvents);
  };

  const value = {
    view,
    setView,
    selectedDate,
    setSelectedDate,
    filter,
    setFilter,
    manualEvents,
    addManualEvent,
    updateManualEvent,
    deleteManualEvent
  };

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};