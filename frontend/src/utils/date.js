/**
 * Parse a date value from Neo4j, which returns datetime() as an ISO 8601 string
 * with nanosecond precision (9 fractional digits) that native Date() can't parse.
 * e.g. "2024-03-18T14:30:00.000000000Z"  →  truncated to ms  →  valid Date
 */
export const parseDate = (value) => {
  if (!value) return new Date(NaN);
  if (value instanceof Date) return value;

  let str = typeof value === 'string' ? value : String(value);

  // Truncate fractional seconds beyond 3 digits: .123456789 → .123
  str = str.replace(/(\.\d{3})\d+/, '$1');

  // Remove Neo4j timezone bracket notation e.g. [Europe/London]
  str = str.replace(/\[.*\]$/, '');

  return new Date(str);
};

/**
 * Returns a human-friendly "time ago" string, e.g. "3 hours ago", "Yesterday".
 */
export const timeAgo = (value) => {
  const date = parseDate(value);
  if (isNaN(date)) return 'Unknown date';

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};
