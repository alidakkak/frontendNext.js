export const fmtDate = (iso?: string | Date | null) => {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(d);
};

export const statusText = (s: 'ACTIVE' | 'EXPIRED' | 'CANCELED') =>
  s === 'ACTIVE' ? 'نشِط' : s === 'EXPIRED' ? 'منتهي' : 'ملغى';

export function fromNow(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso).getTime();
  const diff = d - Date.now();
  const abs = Math.abs(diff);
  const minutes = Math.round(abs / 60000);

  const rtf = new Intl.RelativeTimeFormat('ar', { numeric: 'auto' });
  if (minutes < 60) return rtf.format(Math.sign(diff) * Math.max(1, Math.round(minutes)), 'minute');

  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(Math.sign(diff) * hours, 'hour');

  const days = Math.round(hours / 24);
  return rtf.format(Math.sign(diff) * days, 'day');
}
