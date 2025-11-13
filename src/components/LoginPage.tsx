import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <CalendarDaysIcon className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="mt-6 text-4xl font-extrabold text-gray-900">Schedulr</h1>
          <p className="mt-2 text-lg text-gray-600">Your Academic Calendar Assistant</p>
          <p className="mt-4 text-sm text-gray-500 max-w-sm mx-auto">
            使用邮箱和密码登录，随后可在 Profile 页连接各平台。
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 text-center">登录</h2>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="至少 6 位"
                required
              />
            </div>
            {error && (<p className="text-sm text-red-600">{error}</p>)}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-3 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${loading ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <span>{loading ? '登录中...' : '登录'}</span>
            </button>
          </form>
          <div className="text-center">
            <p className="text-xs text-gray-500">登录后可在 Profile 页面选择接入平台。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;