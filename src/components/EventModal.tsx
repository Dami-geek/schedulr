import React, { useEffect, useState } from 'react';
import { useCalendar } from '../contexts/CalendarContext';
import { CalendarEvent } from '../contexts/CalendarContext';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  editEvent?: any;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, editEvent }) => {
  const { addManualEvent, updateManualEvent } = useCalendar();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('personal');
  const [course, setCourse] = useState('');

  useEffect(() => {
    if (editEvent) {
      setTitle(editEvent.title || '');
      setDescription(editEvent.description || '');
      setDate(editEvent.dueDate ? editEvent.dueDate.split('T')[0] : '');
      setTime(editEvent.dueDate ? editEvent.dueDate.split('T')[1]?.slice(0,5) || '' : '');
      setType((editEvent.type || 'personal') as CalendarEvent['type']);
      setCourse(editEvent.course || '');
    } else {
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setType('personal');
      setCourse('');
    }
  }, [editEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dueDate = time ? `${date}T${time}` : `${date}T00:00`;
  
    const payload: Omit<CalendarEvent, 'id'> = {
      title,
      description,
      type,
      dueDate,
      course,
      isCompleted: false
    };
  
    if (editEvent?.id) {
      updateManualEvent(editEvent.id, payload);
    } else {
      addManualEvent(payload);
    }
  
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {editEvent ? '编辑事件' : '新增事件'}
          </h3>
          <p className="text-sm text-gray-500">支持个人日程，含日期与时间</p>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">时间</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">类型</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CalendarEvent['type'])}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="personal">个人</option>
                <option value="assignment">作业</option>
                <option value="exam">考试</option>
                <option value="project">项目</option>
                <option value="announcement">公告</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">课程/来源</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="如：个人 / CS101"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;