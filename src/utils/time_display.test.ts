import { toLocalDate, toLocalTime, toIsoFromLocal } from './time';

describe('time display consistency', () => {
  test('local parts from ISO reflect local timezone', () => {
    const iso = new Date('2025-03-15T12:00:00Z').toISOString();
    const date = toLocalDate(iso);
    const time = toLocalTime(iso);
    expect(date.length).toBe(10);
    expect(time.length).toBe(5);
  });

  test('toIsoFromLocal converts local date/time to ISO', () => {
    const iso = toIsoFromLocal('2025-08-01', '09:30');
    const d = new Date(iso);
    expect(d.getFullYear()).toBe(2025);
  });

  test('DST handling: spring forward check', () => {
    // Create a local date during DST change; behavior is environment-dependent, ensure no crash
    const iso = toIsoFromLocal('2025-03-09', '02:30');
    const d = new Date(iso);
    expect(isFinite(d.getTime())).toBe(true);
  });

  test('historical and future events parse', () => {
    const pastIso = toIsoFromLocal('1999-12-31', '23:59');
    const futureIso = toIsoFromLocal('2035-01-01', '00:00');
    expect(isFinite(new Date(pastIso).getTime())).toBe(true);
    expect(isFinite(new Date(futureIso).getTime())).toBe(true);
  });
});