import { isUpcoming, getUpcomingSorted } from './time';

describe('time utils', () => {
  test('isUpcoming returns true when event is in the future', () => {
    const now = new Date('2025-11-23T12:00:00Z');
    const future = '2025-11-23T12:01:00Z';
    expect(isUpcoming(future, now)).toBe(true);
  });

  test('isUpcoming returns false when event is in the past', () => {
    const now = new Date('2025-11-23T12:00:00Z');
    const past = '2025-11-23T11:59:00Z';
    expect(isUpcoming(past, now)).toBe(false);
  });

  test('getUpcomingSorted filters and sorts', () => {
    const now = new Date('2025-11-23T12:00:00Z');
    const events = [
      { dueDate: '2025-11-23T12:05:00Z' },
      { dueDate: '2025-11-23T12:01:00Z' },
      { dueDate: '2025-11-23T11:59:00Z' },
    ];
    const res = getUpcomingSorted(events as any, now, 5);
    expect(res.length).toBe(2);
    expect(res[0].dueDate).toBe('2025-11-23T12:01:00Z');
    expect(res[1].dueDate).toBe('2025-11-23T12:05:00Z');
  });
});