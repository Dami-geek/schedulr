import React from 'react';
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
  const { events, courses } = useCanvas();
  const { filter, setFilter } = useCalendar();

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

  const upcomingEvents = events
    .filter(event => new Date(event.dueDate) >= new Date())
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
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Schedulr</h2>
        <p className="text-sm text-gray-600 mt-1">
          {events.length} events across {courses.length} courses
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Courses Filter */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Courses</h3>
          <div className="space-y-2">
            {courses.map(course => (
              <label key={course.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.courses.includes(course.id)}
                  onChange={() => handleCourseFilter(course.id)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{course.name}</p>
                  <p className="text-xs text-gray-500">{course.code}</p>
                </div>
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
              <span className="text-sm text-gray-900">Pending Only</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={filter.completed === true}
                onChange={() => setFilter({ ...filter, completed: true })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">Completed Only</span>
            </label>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming events</p>
            ) : (
              upcomingEvents.map(event => (
                <div key={event.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded ${getEventTypeColor(event.type)} mt-0.5`}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{event.course}</p>
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