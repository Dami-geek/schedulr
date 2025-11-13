import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCanvas } from '../contexts/CanvasContext';
import { useCalendar } from '../contexts/CalendarContext';
import { Link, useNavigate } from 'react-router-dom';
import CalendarView from './CalendarView';
import Sidebar from './Sidebar';
import EventModal from './EventModal';
import NotificationSettings from './NotificationSettings';
import { PlusIcon, Cog6ToothIcon, ArrowPathIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { syncWithCanvas, isSyncing } = useCanvas();
  const { view, setView } = useCalendar();
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const navigate = useNavigate();

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSync = async () => {
    try {
      await syncWithCanvas();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-72 border-r border-gray-200">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div>
              <div className="text-sm text-gray-500">欢迎</div>
              <div className="text-lg font-semibold text-gray-900">{user?.name || 'Student'}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === 'day'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                日
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === 'week'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                周
              </button>
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === 'month'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                月
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isSyncing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <ArrowPathIcon className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? '同步中...' : '立即同步'}</span>
              </button>

              <button
                onClick={handleAddEvent}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                <span>新增日程</span>
              </button>

              <Link
                to="/profile"
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <UserCircleIcon className="h-4 w-4" />
                <span>{user?.email || 'Profile'}</span>
              </Link>

              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <Cog6ToothIcon className="h-4 w-4" />
                <span>设置</span>
              </button>

              <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900">
                退出
              </button>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="p-4">
          <CalendarView onEventClick={handleEditEvent} />
        </div>
      </div>

      {/* Event Modal */}
      <EventModal isOpen={showEventModal} onClose={() => setShowEventModal(false)} editEvent={selectedEvent} />

      {/* Notification Settings Modal */}
      {showSettings && (
        <NotificationSettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default Dashboard;