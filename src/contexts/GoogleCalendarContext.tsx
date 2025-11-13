import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface GoogleCalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: 'assignment' | 'exam' | 'project' | 'announcement' | 'personal';
  course?: string; // optional for personal events
  courseCode?: string; // optional
  dueDate: string; // ISO string
  isCompleted?: boolean;
}

interface GoogleCalendarContextType {
  events: GoogleCalendarEvent[];
  loading: boolean;
  lastSync: Date | null;
  syncGoogle: () => Promise<void>;
}

const GoogleCalendarContext = createContext<GoogleCalendarContextType | undefined>(undefined);

export const useGoogleCalendar = () => {
  const ctx = useContext(GoogleCalendarContext);
  if (!ctx) throw new Error('useGoogleCalendar must be used within a GoogleCalendarProvider');
  return ctx;
};

interface ProviderProps { children: ReactNode }

// Mock minimal Google events
const mockGoogleEvents: GoogleCalendarEvent[] = [
  {
    id: 'g-1',
    title: 'Personal: Gym Session',
    type: 'personal',
    dueDate: new Date().toISOString(),
    isCompleted: false,
  },
  {
    id: 'g-2',
    title: 'Team Meeting',
    type: 'announcement',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    isCompleted: false,
  },
];

export const GoogleCalendarProvider: React.FC<ProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Load cached events
    const cached = localStorage.getItem('google_events');
    if (cached) {
      try { setEvents(JSON.parse(cached)); } catch {}
    }
  }, []);

  const syncGoogle = async () => {
    setLoading(true);
    try {
      // Simulate API fetch
      await new Promise(r => setTimeout(r, 1000));
      setEvents(mockGoogleEvents);
      setLastSync(new Date());
      localStorage.setItem('google_events', JSON.stringify(mockGoogleEvents));
      localStorage.setItem('google_last_sync', new Date().toISOString());
    } finally {
      setLoading(false);
    }
  };

  const value = { events, loading, lastSync, syncGoogle };
  return (
    <GoogleCalendarContext.Provider value={value}>
      {children}
    </GoogleCalendarContext.Provider>
  );
};