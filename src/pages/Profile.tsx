import React from 'react';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, CalendarDaysIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Profile & Connections</h1>
          <Link to="/dashboard" className="text-sm text-blue-600 hover:text-blue-800">← Back to Dashboard</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* User Info */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <UserCircleIcon className="h-5 w-5" />
            <span>用户信息</span>
          </h2>
          <div className="mt-3 text-sm text-gray-700">
            <p><span className="text-gray-500">姓名：</span>{user?.name || '未登录'}</p>
            <p><span className="text-gray-500">邮箱：</span>{user?.email || '未登录'}</p>
          </div>
        </section>

        {/* Connectors */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900">Google Calendar</h2>
            <p className="text-sm text-gray-600 mt-1">连接你的 Google Calendar，将个人日程与学术事件合并显示。</p>
            <button className="mt-4 px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">连接 Google</button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900">Canvas</h2>
            <p className="text-sm text-gray-600 mt-1">可选接入，拉取作业与考试信息。</p>
            <button className="mt-4 px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center space-x-2">
              <AcademicCapIcon className="h-4 w-4" />
              <span>连接 Canvas</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900">希悦</h2>
            <p className="text-sm text-gray-600 mt-1">后续版本提供接入。</p>
            <button className="mt-4 px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700" disabled>即将支持</button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900">Outlook / 飞书</h2>
            <p className="text-sm text-gray-600 mt-1">后续版本提供接入。</p>
            <button className="mt-4 px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700" disabled>即将支持</button>
          </div>
        </section>

        {/* Platform Description */}
        <section>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <CalendarDaysIcon className="h-5 w-5" />
              <span>平台说明</span>
            </h2>
            <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Google Calendar：合并显示个人日程与学术事件。</li>
              <li>Canvas：同步课程作业、考试、项目等信息。</li>
              <li>其它平台（希悦、Outlook、飞书）：将逐步接入。</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;