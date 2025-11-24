import { extractCourseFromSummary } from './ics';

describe('extractCourseFromSummary', () => {
  test('extracts course from simple brackets', () => {
    const res = extractCourseFromSummary('[CS101] Midterm Review');
    expect(res.course).toBe('CS101');
  });

  test('handles nested brackets', () => {
    const res = extractCourseFromSummary('[Course [Advanced]] Exam');
    expect(res.course).toBe('Course Advanced');
  });

  test('malformed brackets return empty course', () => {
    const res = extractCourseFromSummary('[Malformed Midterm');
    expect(res.course).toBe('');
  });

  test('no brackets returns empty course', () => {
    const res = extractCourseFromSummary('General Meeting');
    expect(res.course).toBe('');
  });
});