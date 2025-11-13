import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface CanvasEvent {
  id: string;
  title: string;
  description: string;
  type: 'assignment' | 'exam' | 'project' | 'announcement' | 'personal';
  course: string;
  courseCode?: string;
  dueDate: string;
  startTime?: string;
  endTime?: string;
  points?: number;
  url?: string;
  color?: string;
  isCompleted: boolean;
}

interface CanvasContextType {
  events: CanvasEvent[];
  loading: boolean;
  lastSync: Date | null;
  courses: { id: string; name: string; code: string }[];
  syncCanvas: () => Promise<void>;
  syncWithCanvas: () => Promise<void>;
  isSyncing: boolean;
  getEventsByCourse: (courseCode: string) => CanvasEvent[];
  markAsCompleted: (eventId: string) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};

interface CanvasProviderProps {
  children: ReactNode;
}

// Mock Canvas data for demo - Updated with current dates
const mockCanvasEvents: CanvasEvent[] = [
  {
    id: '1',
    title: 'Midterm Exam',
    description: 'Comprehensive midterm covering chapters 1-6',
    type: 'exam',
    course: 'Computer Science 101',
    courseCode: 'CS101',
    dueDate: '2025-11-15T09:00:00.000Z',
    startTime: '09:00',
    endTime: '11:00',
    points: 100,
    url: 'https://canvas.university.edu/courses/123/assignments/1',
    color: '#ef4444',
    isCompleted: false
  },
  {
    id: '2',
    title: 'Programming Assignment 3',
    description: 'Implement a sorting algorithm in Python',
    type: 'assignment',
    course: 'Computer Science 101',
    courseCode: 'CS101',
    dueDate: '2025-11-12T23:59:00.000Z',
    endTime: '23:59',
    points: 50,
    url: 'https://canvas.university.edu/courses/123/assignments/2',
    color: '#f59e0b',
    isCompleted: false
  },
  {
    id: '3',
    title: 'Lab Report 4',
    description: 'Analysis of chemical reactions lab results',
    type: 'assignment',
    course: 'Chemistry 201',
    courseCode: 'CHEM201',
    dueDate: '2025-11-10T17:00:00.000Z',
    endTime: '17:00',
    points: 30,
    url: 'https://canvas.university.edu/courses/456/assignments/3',
    color: '#10b981',
    isCompleted: true
  },
  {
    id: '4',
    title: 'Group Project Presentation',
    description: 'Present your research findings to the class',
    type: 'project',
    course: 'Biology 150',
    courseCode: 'BIO150',
    dueDate: '2025-11-18T14:00:00.000Z',
    startTime: '14:00',
    endTime: '16:00',
    points: 75,
    url: 'https://canvas.university.edu/courses/789/assignments/4',
    color: '#3b82f6',
    isCompleted: false
  },
  {
    id: '5',
    title: 'Reading Quiz',
    description: 'Quiz on Chapter 8: Cellular Respiration',
    type: 'assignment',
    course: 'Biology 150',
    courseCode: 'BIO150',
    dueDate: '2025-11-14T23:59:00.000Z',
    endTime: '23:59',
    points: 15,
    url: 'https://canvas.university.edu/courses/789/assignments/5',
    color: '#3b82f6',
    isCompleted: false
  },
  {
    id: '6',
    title: 'Final Paper',
    description: 'Research paper on a topic of your choice',
    type: 'project',
    course: 'English 102',
    courseCode: 'ENG102',
    dueDate: '2025-11-20T23:59:00.000Z',
    endTime: '23:59',
    points: 150,
    url: 'https://canvas.university.edu/courses/101/assignments/6',
    color: '#8b5cf6',
    isCompleted: false
  },
  {
    id: '7',
    title: 'Math Homework',
    description: 'Calculus problems from Chapter 5',
    type: 'assignment',
    course: 'Mathematics 201',
    courseCode: 'MATH201',
    dueDate: '2025-11-16T23:59:00.000Z',
    endTime: '23:59',
    points: 25,
    url: 'https://canvas.university.edu/courses/202/assignments/7',
    color: '#dc2626',
    isCompleted: false
  },
  {
    id: '8',
    title: 'History Essay',
    description: 'Essay on the American Revolution',
    type: 'assignment',
    course: 'History 101',
    courseCode: 'HIST101',
    dueDate: '2025-11-13T23:59:00.000Z',
    endTime: '23:59',
    points: 40,
    url: 'https://canvas.university.edu/courses/303/assignments/8',
    color: '#f59e0b',
    isCompleted: false
  }
];

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<CanvasEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      syncCanvas();
    }
  }, [isAuthenticated]);

  const syncCanvas = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would call the Canvas API
      // For demo, we'll use mock data
      setEvents(mockCanvasEvents);
      setLastSync(new Date());
      
      // Store in localStorage for persistence
      localStorage.setItem('canvas_events', JSON.stringify(mockCanvasEvents));
      localStorage.setItem('canvas_last_sync', new Date().toISOString());
    } catch (error) {
      console.error('Failed to sync with Canvas:', error);
      // Fallback to cached data
      const cachedEvents = localStorage.getItem('canvas_events');
      if (cachedEvents) {
        setEvents(JSON.parse(cachedEvents));
      }
    } finally {
      setLoading(false);
    }
  };

  const getEventsByCourse = (courseCode: string) => {
    return events.filter(event => event.courseCode === courseCode);
  };

  const markAsCompleted = (eventId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId ? { ...event, isCompleted: !event.isCompleted } : event
      )
    );
  };

  const courses = Array.from(new Set(events.map(event => event.courseCode || '')))
    .filter(code => code)
    .map(code => {
      const event = events.find(e => e.courseCode === code);
      return {
        id: code!,
        name: event?.course || code!,
        code: code!
      };
    });

  const value = {
    events,
    loading,
    lastSync,
    courses,
    syncCanvas,
    syncWithCanvas: syncCanvas, // Alias for syncCanvas
    isSyncing: loading, // Alias for loading
    getEventsByCourse,
    markAsCompleted
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};