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
  source?: 'canvas' | 'google' | 'ics';
  raw?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
}

interface CanvasContextType {
  events: CanvasEvent[];
  loading: boolean;
  lastSync: string | null;
  courses: { id: string; name: string; code: string }[];
  connected: boolean;
  isOnline: boolean;
  localOnly: boolean;
  courseColors: Record<string, string>;
  syncCanvas: () => Promise<void>;
  syncWithCanvas: () => Promise<void>;
  isSyncing: boolean;
  getEventsByCourse: (courseCode: string) => CanvasEvent[];
  markAsCompleted: (eventId: string) => void;
  connect: (domain: string, token: string, passphrase: string) => Promise<void>;
  disconnect: () => void;
  setLocalOnly: (v: boolean) => void;
  testConnectivity: () => Promise<{ ok: boolean; reason?: string }>;
  importICS: (file: File) => Promise<void>;
  importICSFromUrl: (url: string) => Promise<void>;
  importICSText: (text: string) => Promise<void>;
  setCourseColor: (courseId: string, color: string) => void;
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
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [domain, setDomain] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [localOnly, setLocalOnly] = useState<boolean>(false);
  const [courseColors, setCourseColors] = useState<Record<string, string>>(() => {
    try {
      const v = localStorage.getItem('course_colors');
      return v ? JSON.parse(v) : {};
    } catch { return {}; }
  });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const d = localStorage.getItem('canvas_domain');
    const ls = localStorage.getItem('canvas_last_sync');
    if (d) {
      setDomain(d);
      setConnected(true);
    }
    if (ls) setLastSync(ls);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const encode = (buf: ArrayBuffer) => {
    const bytes = new Uint8Array(buf);
    let str = '';
    for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
    return btoa(str);
  };

  const decode = (b64: string) => {
    const str = atob(b64);
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
    return buf;
  };

  const deriveKey = async (secret: string, salt: BufferSource) => {
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'PBKDF2' }, false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    return key;
  };

  const encryptToken = async (token: string, secret: string) => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(secret, salt);
    const enc = new TextEncoder();
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(token));
    return JSON.stringify({ salt: encode(salt.buffer), iv: encode(iv.buffer), ct: encode(ct) });
  };

  const decryptToken = async (payload: string, secret: string) => {
    const obj = JSON.parse(payload);
    const salt = decode(obj.salt);
    const iv = decode(obj.iv);
    const ct = decode(obj.ct);
    const key = await deriveKey(secret, salt);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return new TextDecoder().decode(pt);
  };

  const connect = async (d: string, t: string, s: string) => {
    if (!d || !t || !s) throw new Error('请输入完整信息');
    const base = `https://${d}`;
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/v1/users/self/profile`, { headers: { Authorization: `Bearer ${t}` }, mode: 'cors' });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error('令牌或权限不足');
        throw new Error(`连接失败：HTTP ${res.status}`);
      }
      const encToken = await encryptToken(t, s);
      localStorage.setItem('canvas_domain', d);
      localStorage.setItem('canvas_token_enc', encToken);
      setDomain(d);
      setPassphrase(s);
      setConnected(true);
      setLastSync(new Date().toISOString());
      localStorage.setItem('canvas_last_sync', new Date().toISOString());
      await syncCanvas();
    } catch (e: any) {
      if (e?.name === 'TypeError') {
        throw new Error('网络或CORS被阻止：浏览器无法访问该 Canvas 域名 API');
      }
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('canvas_domain');
    localStorage.removeItem('canvas_token_enc');
    localStorage.removeItem('canvas_last_sync');
    setDomain(null);
    setPassphrase(null);
    setConnected(false);
    setEvents([]);
    setLastSync(null);
  };

  const syncCanvas = async () => {
    if (!domain) throw new Error('未连接');
    if (!passphrase) throw new Error('需要口令');
    if (localOnly || !isOnline) {
      const cachedEvents = localStorage.getItem('canvas_events');
      if (cachedEvents) {
        try { setEvents(JSON.parse(cachedEvents)); } catch {}
      }
      return;
    }
    const encToken = localStorage.getItem('canvas_token_enc');
    if (!encToken) throw new Error('缺少令牌');
    setLoading(true);
    try {
      const token = await decryptToken(encToken, passphrase);
      const base = `https://${domain}`;
      const headers = { Authorization: `Bearer ${token}` } as Record<string, string>;
      const coursesRes = await fetch(`${base}/api/v1/courses?enrollment_state=active&per_page=50`, { headers, mode: 'cors' });
      if (!coursesRes.ok) throw new Error('课程获取失败');
      const courses = await coursesRes.json();
      const eventsAcc: CanvasEvent[] = [];
      for (const c of courses) {
        if (!c || !c.id) continue;
        const aRes = await fetch(`${base}/api/v1/courses/${c.id}/assignments?per_page=50`, { headers, mode: 'cors' });
        if (!aRes.ok) continue;
        const assigns = await aRes.json();
        for (const a of assigns) {
          const due = a?.due_at || a?.lock_at || a?.unlock_at || new Date().toISOString();
          eventsAcc.push({
            id: `assignment-${a.id}`,
            title: a?.name || 'Assignment',
            description: a?.description || '',
            type: 'assignment',
            course: c?.name || '',
            courseCode: c?.course_code || String(c?.id || ''),
            dueDate: due,
            endTime: undefined,
            startTime: undefined,
            points: a?.points_possible || undefined,
            url: a?.html_url || undefined,
            color: '#f59e0b',
            isCompleted: false
          });
        }
      }
      setEvents(eventsAcc);
      setLastSync(new Date().toISOString());
      localStorage.setItem('canvas_events', JSON.stringify(eventsAcc));
      localStorage.setItem('canvas_last_sync', new Date().toISOString());
    } catch (error: any) {
      if (error?.name === 'TypeError') {
        throw new Error('同步失败：网络或CORS被阻止');
      }
      const cachedEvents = localStorage.getItem('canvas_events');
      if (cachedEvents) {
        try { setEvents(JSON.parse(cachedEvents)); } catch {}
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const testConnectivity = async () => {
    if (!domain) return { ok: false, reason: '未连接' };
    const encToken = localStorage.getItem('canvas_token_enc');
    if (!encToken) return { ok: false, reason: '缺少令牌' };
    if (!isOnline) return { ok: false, reason: '离线' };
    try {
      if (!passphrase) return { ok: false, reason: '需要口令' };
      const token = await decryptToken(encToken, passphrase);
      const base = `https://${domain}`;
      const res = await fetch(`${base}/api/v1/users/self/profile`, { headers: { Authorization: `Bearer ${token}` }, mode: 'cors' });
      if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
      return { ok: true };
    } catch (e: any) {
      if (e?.name === 'TypeError') return { ok: false, reason: 'CORS阻止' };
      return { ok: false, reason: '未知错误' };
    }
  };

  const importICS = async (file: File) => {
    const maxSize = 2 * 1024 * 1024;
    if (!file.name.toLowerCase().endsWith('.ics')) throw new Error('文件类型无效');
    if (file.size > maxSize) throw new Error('文件过大');
    const text = await file.text();
    const eventsAcc = parseICS(text);
    eventsAcc.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    setEvents(eventsAcc);
    setLastSync(new Date().toISOString());
    localStorage.setItem('canvas_events', JSON.stringify(eventsAcc));
    localStorage.setItem('canvas_last_sync', new Date().toISOString());
  };

  const importICSFromUrl = async (url: string) => {
    const u = url.trim();
    if (!/^https?:\/\//i.test(u)) throw new Error('URL无效');
    try {
      const res = await fetch(u, { mode: 'cors' });
      if (!res.ok) throw new Error(`无法访问：HTTP ${res.status}`);
      const ct = res.headers.get('content-type') || '';
      const hinted = u.toLowerCase().endsWith('.ics') || ct.includes('text/calendar');
      if (!hinted) throw new Error('非ICS文件');
      const text = await res.text();
      if (text.length > 2 * 1024 * 1024) throw new Error('内容过大');
      const eventsAcc = parseICS(text);
      eventsAcc.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      setEvents(eventsAcc);
      setLastSync(new Date().toISOString());
      localStorage.setItem('canvas_events', JSON.stringify(eventsAcc));
      localStorage.setItem('canvas_last_sync', new Date().toISOString());
    } catch (e: any) {
      if (e?.name === 'TypeError') {
        throw new Error('无法通过浏览器获取该URL（可能被CORS阻止或需要登录）。请在新标签打开该链接并下载后使用文件上传，或粘贴ICS文本。');
      }
      throw e;
    }
  };

  const importICSText = async (text: string) => {
    const t = text || '';
    if (t.length === 0) throw new Error('请输入ICS文本');
    if (t.length > 2 * 1024 * 1024) throw new Error('文本过大');
    const eventsAcc = parseICS(t);
    eventsAcc.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    setEvents(eventsAcc);
    setLastSync(new Date().toISOString());
    localStorage.setItem('canvas_events', JSON.stringify(eventsAcc));
    localStorage.setItem('canvas_last_sync', new Date().toISOString());
  };

  const parseICS = (text: string) => {
    const raw = text.split(/\r?\n/);
    const lines: string[] = [];
    for (let i = 0; i < raw.length; i++) {
      const l = raw[i];
      if (l.startsWith(' ') && lines.length) lines[lines.length - 1] += l.slice(1);
      else lines.push(l);
    }
    const tzMap: Record<string, number> = {};
    let inTZ = false;
    let tzidCur = '';
    for (const l of lines) {
      if (l === 'BEGIN:VTIMEZONE') { inTZ = true; tzidCur = ''; continue; }
      if (l === 'END:VTIMEZONE') { inTZ = false; tzidCur = ''; continue; }
      if (inTZ) {
        if (l.startsWith('TZID:')) tzidCur = l.slice(5).trim();
        if (l.startsWith('TZOFFSETTO:') && tzidCur) {
          const off = l.slice(11).trim();
          const m = off.match(/([+-])(\d{2})(\d{2})/);
          if (m) {
            const sign = m[1] === '-' ? -1 : 1;
            const min = sign * (Number(m[2]) * 60 + Number(m[3]));
            tzMap[tzidCur] = min;
          }
        }
      }
    }
    const eventsAcc: CanvasEvent[] = [];
    let cur: Record<string, string> = {};
    let inEvent = false;
    const getKey = (l: string) => l.split(':')[0];
    const getVal = (l: string) => {
      const idx = l.indexOf(':');
      return idx >= 0 ? l.slice(idx + 1) : '';
    };
    const parseDt = (val: string, head?: string) => {
      const v = val.trim();
      const h = head || '';
      if (/VALUE=DATE/.test(h)) {
        let m = v.match(/(\d{4})(\d{2})(\d{2})/);
        if (!m) m = v.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (!m) return new Date().toISOString();
        const y = Number(m[1]);
        const mo = Number(m[2]) - 1;
        const d = Number(m[3]);
        return new Date(Date.UTC(y, mo, d, 0, 0, 0)).toISOString();
      }
      const tzMatch = h.match(/TZID=([^;]+)/);
      const tzid = tzMatch ? tzMatch[1] : undefined;
      const z = /Z$/.test(v);
      let m = v.match(/(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?(\d{2})?/);
      if (!m) m = v.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?Z?/);
      if (!m) return new Date().toISOString();
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const d = Number(m[3]);
      const hh = Number(m[4] || '0');
      const mm = Number(m[5] || '0');
      const ss = Number(m[6] || '0');
      if (z) return new Date(Date.UTC(y, mo, d, hh, mm, ss)).toISOString();
      if (tzid && tzMap[tzid] !== undefined) {
        const offsetMin = tzMap[tzid];
        const utcMs = Date.UTC(y, mo, d, hh, mm, ss) - offsetMin * 60 * 1000;
        return new Date(utcMs).toISOString();
      }
      return new Date(y, mo, d, hh, mm, ss).toISOString();
    };
    for (const l of lines) {
      if (l === 'BEGIN:VEVENT') { inEvent = true; cur = {}; continue; }
      if (l === 'END:VEVENT') {
        if (inEvent) {
          const title = cur['SUMMARY'] || 'Event';
          // Extract course from bracketed summary like "[Course Name]"
          let courseExtract = '';
          try {
            const { extractCourseFromSummary, courseColor } = require('../utils/ics');
            const res = extractCourseFromSummary(title);
            courseExtract = res.course || '';
          } catch {}
          const desc = cur['DESCRIPTION'] || '';
          const url = cur['URL'] || undefined;
          const location = cur['LOCATION'] || '';
          const dtStartHead = cur['__HEAD_DTSTART'];
          const dtStartVal = cur['DTSTART'] || '';
          const due = dtStartVal ? parseDt(dtStartVal, dtStartHead) : new Date().toISOString();
          if (!dtStartVal || !title) {
            console.warn('ICS缺少必填字段', { DTSTART: dtStartVal, SUMMARY: title });
          }
          const courseCode = courseExtract || (title.match(/\(([^)]+)\)/) || [])[1] || '';
          const type = /quiz|exam/i.test(title) ? 'exam' : /assignment|hw|homework/i.test(title) ? 'assignment' : 'assignment';
          let color: string | undefined = undefined;
          try {
            const { courseColor } = require('../utils/ics');
            color = courseColors[courseCode || ''] || courseColor(courseCode || '');
          } catch {}
          const priority: 'low' | 'medium' | 'high' = type === 'exam' ? 'high' : type === 'assignment' ? 'medium' : 'low';
          eventsAcc.push({
            id: `ics-${Date.now()}-${eventsAcc.length}`,
            title,
            description: desc || location,
            type,
            course: courseCode || '',
            courseCode: courseCode || undefined,
            dueDate: due,
            startTime: undefined,
            endTime: undefined,
            points: undefined,
            url,
            color,
            isCompleted: false,
            source: 'ics',
            raw: { ...cur },
            priority
          });
        }
        inEvent = false;
        continue;
      }
      if (inEvent) {
        const headFull = getKey(l);
        const baseKey = headFull.split(';')[0];
        const val = getVal(l);
        cur[baseKey] = val;
        cur[`__HEAD_${baseKey}`] = headFull;
      }
    }
    return eventsAcc;
  };

  const setCourseColor = (courseId: string, color: string) => {
    setCourseColors(prev => {
      const next = { ...prev, [courseId]: color };
      try { localStorage.setItem('course_colors', JSON.stringify(next)); } catch {}
      return next;
    });
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
    connected,
    isOnline,
    localOnly,
    courseColors,
    syncCanvas,
    syncWithCanvas: syncCanvas,
    isSyncing: loading,
    getEventsByCourse,
    markAsCompleted,
    connect,
    disconnect,
    setLocalOnly,
    testConnectivity,
    importICS,
    importICSFromUrl,
    importICSText,
    setCourseColor
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};