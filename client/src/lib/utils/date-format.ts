import { formatDistance, formatDistanceToNow as dateFnsFormatDistanceToNow } from 'date-fns';

export function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }): string {
  return dateFnsFormatDistanceToNow(date, { addSuffix: options?.addSuffix, includeSeconds: true });
}

export function formatTimeDistance(dateA: Date, dateB: Date): string {
  return formatDistance(dateA, dateB, { includeSeconds: true });
}
