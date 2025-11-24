export const isUpcoming = (eventIso: string, now: Date = new Date()) => {
  const t = new Date(eventIso).getTime();
  return t > now.getTime();
};

export const getUpcomingSorted = (events: Array<{ dueDate: string }>, now: Date = new Date(), limit = 5) => {
  return events
    .filter(e => isUpcoming(e.dueDate, now))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, limit);
};

export const toLocalDate = (isoOrLocal: string) => {
  const d = new Date(isoOrLocal);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const toLocalTime = (isoOrLocal: string) => {
  const d = new Date(isoOrLocal);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

export const toIsoFromLocal = (dateStr: string, timeStr: string) => {
  const safeDate = (dateStr || '').trim();
  const safeTime = (timeStr || '').trim() || '00:00';
  const local = new Date(`${safeDate}T${safeTime}`);
  return local.toISOString();
};