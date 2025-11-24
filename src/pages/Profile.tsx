import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, CalendarDaysIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useCanvas } from '../contexts/CanvasContext';
import { useGoogleCalendar } from '../contexts/GoogleCalendarContext';
import { format } from 'date-fns';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { connected, lastSync, connect, disconnect, isSyncing, isOnline, localOnly, setLocalOnly, testConnectivity, importICS, importICSFromUrl, importICSText } = useCanvas();
  const { events: googleEvents } = useGoogleCalendar();
  const [domain, setDomain] = useState('');
  const [token, setToken] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [icsFile, setIcsFile] = useState<File | null>(null);
  const [icsUrl, setIcsUrl] = useState('');
  const [icsText, setIcsText] = useState('');
  const [discrepancies, setDiscrepancies] = useState<any[]>([]);

  const handleConnect = async () => {
    setMessage(null);
    try {
      await connect(domain.trim(), token.trim(), passphrase);
      setMessage('Connected');
      setToken('');
    } catch (e: any) {
      setMessage(e?.message || 'Connection failed');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setMessage('Disconnected');
  };

  const handleTest = async () => {
    const r = await testConnectivity();
    if (r.ok) setMessage('网络与CORS可访问');
    else setMessage(`不可访问：${r.reason}`);
  };

  const handleImportICS = async () => {
    setMessage(null);
    if (!icsFile) {
      setMessage('请选择 ICS 文件');
      return;
    }
    try {
      await importICS(icsFile);
      setMessage('已导入本地课程事件');
      computeDiscrepancies();
    } catch (e: any) {
      setMessage(e?.message || '导入失败');
    }
  };

  const handleImportUrl = async () => {
    setMessage(null);
    if (!icsUrl.trim()) {
      setMessage('请输入 ICS 链接');
      return;
    }
    try {
      await importICSFromUrl(icsUrl.trim());
      setMessage('已从URL导入课程事件');
      computeDiscrepancies();
    } catch (e: any) {
      setMessage(e?.message || 'URL导入失败');
    }
  };

  const handleImportText = async () => {
    setMessage(null);
    if (!icsText.trim()) {
      setMessage('请粘贴 ICS 文本');
      return;
    }
    try {
      await importICSText(icsText.trim());
      setMessage('已从文本导入课程事件');
      computeDiscrepancies();
    } catch (e: any) {
      setMessage(e?.message || '文本导入失败');
    }
  };

  const computeDiscrepancies = () => {
    try {
      const canvasIcs = (window as any).canvas_events_override || [];
      const allEvents = JSON.parse(localStorage.getItem('canvas_events') || '[]');
      const icsEvents = allEvents.filter((e: any) => e.source === 'ics');
      const mismatches: any[] = [];
      const byTitle = new Map<string, any>(googleEvents.map(g => [String(g.title).toLowerCase(), g]));
      for (const e of icsEvents) {
        const key = String(e.title || '').toLowerCase();
        const match = byTitle.get(key);
        if (!match) {
          mismatches.push({ type: 'missing_in_google', title: e.title, dueDate: e.dueDate });
          continue;
        }
        const delta = Math.abs(new Date(e.dueDate).getTime() - new Date(match.dueDate).getTime());
        if (delta > 10 * 60 * 1000) {
          mismatches.push({ type: 'time_mismatch', title: e.title, icsDue: e.dueDate, googleDue: match.dueDate });
        }
      }
      const icsTitles = new Set(icsEvents.map((e: any) => String(e.title).toLowerCase()));
      for (const g of googleEvents) {
        const key = String(g.title).toLowerCase();
        if (!icsTitles.has(key)) {
          mismatches.push({ type: 'missing_in_ics', title: g.title, dueDate: g.dueDate });
        }
      }
      mismatches.sort((a, b) => String(a.title).localeCompare(String(b.title)));
      setDiscrepancies(mismatches);
    } catch {}
  };

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
        <section className="a11y-card rounded-lg shadow p-6">
          <h2 className="heading-2 flex items-center space-x-2">
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
          <div className="a11y-card rounded-lg shadow p-6">
            <h2 className="heading-2">Google Calendar</h2>
            <p className="text-sm a11y-muted mt-1">连接你的 Google Calendar，将个人日程与学术事件合并显示。</p>
            <button className="a11y-button mt-4 px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">连接 Google</button>
          </div>

          <div className="a11y-card rounded-lg shadow p-6 space-y-3">
            <h2 className="heading-2">Canvas</h2>
            <p className="text-sm a11y-muted">连接以同步课程作业、考试等信息。</p>
            <div className="text-sm text-gray-800">网络：{isOnline ? '在线' : '离线'} ・ 模式：{localOnly ? '本地' : '网络'}</div>
            <Input label="Canvas 域名" placeholder="example.instructure.com" value={domain} onChange={e => setDomain(e.target.value)} />
            <div className="grid grid-cols-1 gap-2">
              <Input label="个人访问令牌" placeholder="粘贴你的 Canvas 令牌" value={token} onChange={e => setToken(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Input label="本地保护口令" placeholder="用于本地加密令牌" type="password" value={passphrase} onChange={e => setPassphrase(e.target.value)} />
            </div>
            <div className="flex items-center space-x-2">
              {!connected ? (
                <button
                  onClick={handleConnect}
                  disabled={isSyncing}
                  className="a11y-button mt-2 px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center space-x-2"
                >
                  <AcademicCapIcon className="h-4 w-4" />
                  <span>{isSyncing ? '连接中…' : '连接 Canvas'}</span>
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="a11y-button mt-2 px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  断开连接
                </button>
              )}
              <button
                onClick={handleTest}
                className="mt-2 px-3 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                测试网络/CORS
              </button>
              <label className="mt-2 inline-flex items-center space-x-2 text-sm text-gray-700">
                <input type="checkbox" checked={localOnly} onChange={e => setLocalOnly(e.target.checked)} />
                <span>仅本地模式</span>
              </label>
            </div>
            <div className="text-sm a11y-muted">
              <div>状态：{connected ? '已连接' : '未连接'}</div>
              <div>上次同步：{lastSync ? format(new Date(lastSync), 'yyyy-MM-dd HH:mm') : '—'}</div>
              {message && <div className="text-xs text-gray-800">{message}</div>}
            </div>
            <div className="pt-3 border-t space-y-2">
              <div className="text-sm font-semibold text-gray-900">本地导入</div>
              <p className="text-xs a11y-muted">无法网络访问时，上传从 Canvas 导出的 ICS 文件进行本地同步。</p>
              <input type="file" accept=".ics,text/calendar" onChange={e => setIcsFile(e.target.files?.[0] || null)} />
              <button onClick={handleImportICS} className="a11y-button px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">导入 ICS</button>
              <div className="grid grid-cols-1 gap-2 pt-2">
                <Input label="或通过 URL 导入" placeholder="https://example.com/calendar.ics" value={icsUrl} onChange={e => setIcsUrl(e.target.value)} />
                <button onClick={handleImportUrl} className="a11y-button px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">从URL导入</button>
                {icsUrl && (
                  <a href={icsUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600">在新标签页打开链接以下载</a>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2 pt-2">
                <Textarea label="或粘贴 ICS 文本" placeholder="BEGIN:VCALENDAR\n..." value={icsText} onChange={e => setIcsText(e.target.value)} rows={6} />
                <button onClick={handleImportText} className="a11y-button px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">从文本导入</button>
              </div>
              {discrepancies.length > 0 && (
                <div className="pt-3">
                  <div className="text-sm font-semibold text-gray-900">一致性检测</div>
                  <p className="text-xs a11y-muted">发现 {discrepancies.length} 处与 Google Calendar 的差异。</p>
                  <div className="mt-2 space-y-1">
                    {discrepancies.slice(0, 8).map((d, idx) => (
                      <div key={idx} className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-700">
                        <span className="font-medium">{d.type}</span> ・ {d.title}
                        {d.icsDue && (<span> ・ ICS: {new Date(d.icsDue).toLocaleString()}</span>)}
                        {d.googleDue && (<span> ・ Google: {new Date(d.googleDue).toLocaleString()}</span>)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="a11y-card rounded-lg shadow p-6">
            <h2 className="heading-2">希悦</h2>
            <p className="text-sm a11y-muted mt-1">后续版本提供接入。</p>
            <button className="mt-4 px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700" disabled>即将支持</button>
          </div>

          <div className="a11y-card rounded-lg shadow p-6">
            <h2 className="heading-2">Outlook / 飞书</h2>
            <p className="text-sm a11y-muted mt-1">后续版本提供接入。</p>
            <button className="mt-4 px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700" disabled>即将支持</button>
          </div>
        </section>

        {/* Platform Description */}
        <section>
          <div className="a11y-card rounded-lg shadow p-6">
            <h2 className="heading-2 flex items-center space-x-2">
              <CalendarDaysIcon className="h-5 w-5" />
              <span>平台说明</span>
            </h2>
            <ul className="mt-3 text-sm a11y-muted list-disc pl-5 space-y-1">
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