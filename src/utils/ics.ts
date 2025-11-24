export const extractCourseFromSummary = (summary: string) => {
  const s = String(summary || '');
  let stack = 0;
  let start = -1;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '[') {
      if (stack === 0) start = i + 1;
      stack++;
    } else if (ch === ']') {
      if (stack > 0) {
        stack--;
        if (stack === 0 && start >= 0) {
          const raw = s.slice(start, i);
          const cleaned = raw.replace(/[\[\]]/g, '').trim();
          return { course: cleaned, title: s };
        }
      }
    }
  }
  return { course: '', title: s };
};

export const courseColor = (course: string) => {
  const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#22c55e'];
  const key = course.toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
};