import React, { useEffect, useState } from 'react';
import { useCanvas } from '../contexts/CanvasContext';
import { useCalendar } from '../contexts/CalendarContext';
import { format } from 'date-fns';
import { 
  AcademicCapIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const { events, courses, courseColors, setCourseColor } = useCanvas();
  const { filter, setFilter } = useCalendar();
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [showUpcomingOnly, setShowUpcomingOnly] = useState<boolean>(false);
  const palette = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#22c55e','#111827','#6b7280'];

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <AcademicCapIcon className="h-4 w-4" />;
      case 'exam':
        return <ExclamationCircleIcon className="h-4 w-4" />;
      case 'project':
        return <CalendarDaysIcon className="h-4 w-4" />;
      case 'announcement':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <CalendarDaysIcon className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'text-blue-600 bg-blue-100';
      case 'exam':
        return 'text-red-600 bg-red-100';
      case 'project':
        return 'text-purple-600 bg-purple-100';
      case 'announcement':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const upcomingEvents = events
    .filter(event => new Date(event.dueDate).getTime() > now.getTime())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const handleCourseFilter = (courseId: string) => {
    const newCourses = filter.courses.includes(courseId)
      ? filter.courses.filter(id => id !== courseId)
      : [...filter.courses, courseId];
    
    setFilter({ ...filter, courses: newCourses });
  };

  const handleTypeFilter = (type: string) => {
    const newTypes = filter.types.includes(type)
      ? filter.types.filter(t => t !== type)
      : [...filter.types, type];
    
    setFilter({ ...filter, types: newTypes });
  };

  return (
    <div className="bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="heading-2 heading-art font-bold">Schedulr</h2>
            <p className="text-sm text-gray-700 mt-1 italic">Your school life, all in one place.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {events.length} events across {courses.length} courses
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Courses Filter */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Courses</h3>
          <div className="space-y-2">
            {[...courses].sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''))).map(course => (
              <label key={course.id} className="flex items-center space-x-3 cursor-pointer relative">
                <input
                  type="checkbox"
                  checked={filter.courses.includes(course.id)}
                  onChange={() => handleCourseFilter(course.id)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    <button
                      type="button"
                      className="inline-block h-3 w-3 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ backgroundColor: courseColors[course.id] || '#6b7280' }}
                      aria-label={`Change color for ${course.name}`}
                      onClick={(e) => { e.preventDefault(); setEditingCourse(course.id); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEditingCourse(course.id); } }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 truncate">{course.name}</p>
                      <p className="text-xs text-gray-500">{course.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2"></div>
                </div>
                {editingCourse === course.id && (
                  <div
                    className="absolute left-10 mt-6 p-2 bg-white border border-gray-200 rounded shadow z-10"
                    role="dialog"
                    aria-label={`Select color for ${course.name}`}
                  >
                    <div className="grid grid-cols-9 gap-1">
                      {palette.map(c => (
                        <button
                          key={c}
                          onMouseEnter={(e) => { e.preventDefault(); try { setCourseColor(course.id, c); } catch {} }}
                          onClick={(e) => { e.preventDefault(); try { setCourseColor(course.id, c); } catch {} }}
                          className="h-5 w-5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                          style={{ backgroundColor: c }}
                          aria-label={c}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <input
                        type="color"
                        value={courseColors[course.id] || '#6b7280'}
                        onInput={(e) => { try { setCourseColor(course.id, (e.target as HTMLInputElement).value); } catch {} }}
                        aria-label="Custom color picker"
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setEditingCourse(null); }}
                        className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Event Types Filter */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Event Types</h3>
          <div className="space-y-2">
            {['assignment', 'exam', 'project', 'announcement', 'personal'].map(type => (
              <label key={type} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.types.includes(type)}
                  onChange={() => handleTypeFilter(type)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded ${getEventTypeColor(type)}`}>
                    {getEventTypeIcon(type)}
                  </div>
                  <span className="text-sm text-gray-900 capitalize">{type}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Status</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={filter.completed === null}
                onChange={() => setFilter({ ...filter, completed: null })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">All Events</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={filter.completed === false}
                onChange={() => setFilter({ ...filter, completed: false })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">Incompleted</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={filter.completed === true}
                onChange={() => setFilter({ ...filter, completed: true })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">Upcoming</span>
            </label>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Upcoming Events</h3>
            <button
              onClick={() => setShowUpcomingOnly(v => !v)}
              className={`text-xs rounded px-2 py-1 transition-colors ${showUpcomingOnly ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Upcoming
            </button>
          </div>
          <div className="space-y-3">
            {(showUpcomingOnly ? upcomingEvents : events
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 5)).length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming events</p>
            ) : (
              (showUpcomingOnly ? upcomingEvents : events
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 5)).map(event => (
                <div key={event.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded ${getEventTypeColor(event.type)} mt-0.5`}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      {String(event.course || '').trim().toLowerCase() !== String(event.title || '').trim().toLowerCase() && (
                        <p className="text-xs text-gray-500 mt-1">{event.course}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <ClockIcon className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {format(new Date(event.dueDate), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      {event.isCompleted && (
                        <div className="flex items-center space-x-1 mt-2">
                          <CheckCircleIcon className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Profile Link */}
        <div className="p-6 border-t border-gray-200">
          <a href="/profile" className="text-sm text-blue-600 hover:text-blue-800">Go to Profile & Connections →</a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;