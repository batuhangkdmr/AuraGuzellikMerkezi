/**
 * Format date using user's local timezone (browser/system time)
 * SQL Server dates are displayed as-is without timezone conversion
 * The browser will use the user's system timezone automatically
 */
export function formatDateToTurkey(date: Date | string): string {
  // Convert to Date object if it's a string
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date:', date);
    return String(date);
  }
  
  // Format using browser's local timezone (no timeZone parameter)
  // This will automatically use the user's system timezone
  return dateObj.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date using user's local timezone (short format)
 */
export function formatDateToTurkeyShort(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date:', date);
    return String(date);
  }
  
  return dateObj.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date using user's local timezone (date only)
 */
export function formatDateToTurkeyDateOnly(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date:', date);
    return String(date);
  }
  
  return dateObj.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
