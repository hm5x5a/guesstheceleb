import { DAILY_LIMIT, STORAGE_USAGE_KEY } from '../config';

interface DailyUsage {
  day: string;
  count: number;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in the device's local timezone.
 */
export function getLocalToday(): string {
  return new Date().toLocaleDateString('en-CA');
}

export function getUsage(): DailyUsage {
  const today = getLocalToday();
  try {
    const raw = localStorage.getItem(STORAGE_USAGE_KEY);
    if (!raw) return { day: today, count: 0 };
    const parsed: DailyUsage = JSON.parse(raw);
    return parsed && parsed.day === today ? parsed : { day: today, count: 0 };
  } catch {
    return { day: today, count: 0 };
  }
}

export function getRemainingUploads(): number {
  return Math.max(0, DAILY_LIMIT - getUsage().count);
}

export function consumeUpload(): boolean {
  const usage = getUsage();
  if (usage.count >= DAILY_LIMIT) {
    return false;
  }
  usage.count += 1;
  try {
    localStorage.setItem(STORAGE_USAGE_KEY, JSON.stringify(usage));
  } catch (err) {
    console.warn('Unable to persist daily usage:', err);
  }
  return true;
}

export function getTimeUntilReset(): { hours: number; minutes: number } {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const diffMs = midnight.getTime() - now.getTime();
  const totalMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMins / 60);
  const minutes = totalMins % 60;
  return { hours, minutes };
}
