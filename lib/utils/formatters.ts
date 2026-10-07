/**
 * Central formatting utilities for the SNLHS web portal.
 * All date, number, and file formatting should use these helpers
 * to ensure consistent Bengali/English bilingual output across the site.
 */

/**
 * Formats a date string into a Bengali locale date.
 * @example formatBengaliDate("2026-10-07") → "৭ অক্টোবর ২০২৬"
 */
export function formatBengaliDate(
  dateStr: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats a date string into a short Bengali locale date.
 * @example formatBengaliDateShort("2026-10-07") → "৭/১০/২০২৬"
 */
export function formatBengaliDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats a date string into relative time in Bengali.
 * @example formatRelativeDate("2026-10-01") → "৬ দিন আগে"
 */
export function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'আজকে';
    if (diffDays === 1) return 'গতকাল';
    if (diffDays < 7) return `${toBengaliDigits(diffDays)} দিন আগে`;
    if (diffDays < 30) return `${toBengaliDigits(Math.floor(diffDays / 7))} সপ্তাহ আগে`;
    if (diffDays < 365) return `${toBengaliDigits(Math.floor(diffDays / 30))} মাস আগে`;
    return formatBengaliDate(dateStr);
  } catch {
    return '—';
  }
}

/**
 * Converts an English/Arabic numeral string or number to Bengali numerals.
 * @example toBengaliDigits(2026) → "২০২৬"
 */
export function toBengaliDigits(value: number | string): string {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(value).replace(/[0-9]/g, (digit) => bengaliNumerals[parseInt(digit)]);
}

/**
 * Formats a file size in bytes into a human-readable Bengali string.
 * @example formatFileSize(1048576) → "১ MB"
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '—';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0);
  return `${toBengaliDigits(size)} ${sizes[i]}`;
}

/**
 * Returns a category badge CSS class name based on a notice category string.
 * Useful for applying consistent styling across the notice list.
 */
export function getNoticeCategoryClass(category: string | null | undefined): string {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('ইভেন্ট') || cat.includes('event')) return 'badge-event';
  if (cat.includes('পরীক্ষা') || cat.includes('exam')) return 'badge-exam';
  if (cat.includes('ভর্তি') || cat.includes('admission')) return 'badge-admission';
  if (cat.includes('ছুটি') || cat.includes('holiday')) return 'badge-holiday';
  return 'badge-general';
}

/**
 * Truncates a string to a given maximum length and appends '...' if needed.
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
}
