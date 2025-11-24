import React, { useMemo } from 'react';
import { useCanvas } from '../contexts/CanvasContext';
import { useCalendar } from '../contexts/CalendarContext';
import { useGoogleCalendar } from '../contexts/GoogleCalendarContext';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';
import { CalendarEvent } from '../contexts/CalendarContext';

interface CalendarViewProps {
  onEventClick: (event: CalendarEvent) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onEventClick }) => {
  const { events: canvasEvents, courseColors } = useCanvas();
  const { events: googleEvents } = useGoogleCalendar();
  const { view, selectedDate, setSelectedDate, filter, manualEvents } = useCalendar();

  // Combine Canvas, Google, and manual events
  const allEvents = useMemo(() => {
    const combined = [...canvasEvents, ...googleEvents, ...manualEvents];
    
    // Apply filters
    return combined.filter((event: any) => {
      // Course filter: uses courseCode if available, else course name
      const courseKey = event.courseCode || event.course || '';
      if (filter.courses.length > 0 && !filter.courses.includes(courseKey)) {
        return false;
      }
      
      // Type filter
      if (filter.types.length > 0 && !filter.types.includes(event.type)) {
        return false;
      }
      
      // Status filter
      if (filter.completed !== null) {
        const completed = event.isCompleted ?? event.completed ?? false;
        if (completed !== filter.completed) return false;
      }
      
      return true;
    });
  }, [canvasEvents, googleEvents, manualEvents, filter]);

  const navigateDate = (direction: 'prev' | 'next') => {
    if (view === 'month') {
      setSelectedDate(direction === 'prev' ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1));
    } else if (view === 'week') {
      setSelectedDate(direction === 'prev' ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1));
    } else {
      setSelectedDate(direction === 'prev' ? addDays(selectedDate, -1) : addDays(selectedDate, 1));
    }
  };

  const getEventsForDate = (date: Date) => {
    return allEvents.filter((event: any) => 
      isSameDay(new Date(event.dueDate), date)
    );
  };

  const getEventColorClass = (event: any) => {
    if (event.color) return '';
    switch (event.type) {
      case 'assignment': return 'bg-blue-500';
      case 'exam': return 'bg-red-500';
      case 'project': return 'bg-purple-500';
      case 'announcement': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventStyle = (event: any) => {
    const courseKey = event.courseCode || event.course || '';
    const color = courseColors[courseKey] || event.color;
    return color ? { backgroundColor: color } : undefined;
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
  
    const dateFormat = 'd';
    const rows: React.ReactElement[] = [];
    let days: React.ReactElement[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayEvents = getEventsForDate(cloneDay);
        
        days.push(
          <div
            key={day.toString()}
            className={`min-h-24 p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
              !isSameMonth(day, monthStart) ? 'bg-gray-50 text-gray-400' : ''
            } ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className={`text-sm font-medium mb-1 ${
              isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'
            }`}>
              {formattedDate}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 2).map((event: any) => (
                <div
                  key={event.id}
                  style={getEventStyle(event)}
                  className={`text-xs p-1 rounded text-white truncate cursor-pointer ${getEventColorClass(event)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                >
                  <span className="font-medium">{event.title}</span>
                  <span className="ml-1 opacity-90">{format(new Date(event.dueDate), 'HH:mm')}</span>
                  {event.priority && (
                    <span className={`ml-1 inline-block px-1 rounded text-[10px] ${event.priority === 'high' ? 'bg-red-700' : event.priority === 'medium' ? 'bg-yellow-700' : 'bg-gray-700'}`}>{event.priority}</span>
                  )}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 py-3 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="divide-y divide-gray-200">
          {rows}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate);
    const days: React.ReactElement[] = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayEvents = getEventsForDate(day);
      
      days.push(
        <div key={i} className="flex-1 border-r border-gray-200 last:border-r-0">
          <div className={`text-center py-2 border-b border-gray-200 ${
            isSameDay(day, new Date()) ? 'bg-blue-50' : ''
          }`}>
            <div className="text-xs text-gray-500">{format(day, 'EEE')}</div>
            <div className={`text-lg font-semibold ${
              isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'
            }`}>
              {format(day, 'd')}
            </div>
          </div>
          <div className="p-2 space-y-2 min-h-96">
            {dayEvents.map((event: any) => (
              <div
                key={event.id}
                style={getEventStyle(event)}
                className={`p-2 rounded text-white text-sm cursor-pointer ${getEventColorClass(event)}`}
                onClick={() => onEventClick(event)}
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-xs opacity-90">{format(new Date(event.dueDate), 'HH:mm')}</div>
                <div className="text-xs opacity-75">{event.course}</div>
                {event.priority && (
                  <div className="mt-1 text-[10px] opacity-90">Priority: {event.priority}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="flex">
          {days}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(selectedDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white rounded-lg shadow">
        <div className={`text-center py-4 border-b border-gray-200 ${
          isSameDay(selectedDate, new Date()) ? 'bg-blue-50' : ''
        }`}>
          <div className="text-sm text-gray-500">{format(selectedDate, 'EEEE')}</div>
          <div className={`text-2xl font-bold ${
            isSameDay(selectedDate, new Date()) ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {format(selectedDate, 'MMMM d, yyyy')}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {hours.map(hour => {
            const hourEvents = dayEvents.filter((event: any) => {
              const eventHour = new Date(event.dueDate).getHours();
              return eventHour === hour;
            });

            return (
              <div key={hour} className="flex border-b border-gray-100">
                <div className="w-20 p-3 text-sm text-gray-500 text-right border-r border-gray-100">
                  {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                </div>
                <div className="flex-1 p-3 min-h-16">
                  {hourEvents.map((event: any) => (
                    <div
                      key={event.id}
                      style={getEventStyle(event)}
                      className={`p-2 rounded text-white text-sm mb-2 cursor-pointer ${getEventColorClass(event)}`}
                      onClick={() => onEventClick(event)}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs opacity-75">{event.course}</div>
                      {event.priority && (
                        <div className="mt-1 text-[10px] opacity-90">Priority: {event.priority}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            ←
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {view === 'month' && format(selectedDate, 'MMMM yyyy')}
            {view === 'week' && `Week of ${format(startOfWeek(selectedDate), 'MMM d, yyyy')}`}
            {view === 'day' && format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            →
          </button>
        </div>
        <button
          onClick={() => setSelectedDate(new Date())}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Today
        </button>
      </div>

      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}
    </div>
  );
};

export default CalendarView;