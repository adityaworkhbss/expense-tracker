import dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import * as weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend((utc as any).default || utc);
dayjs.extend((timezone as any).default || timezone);
dayjs.extend((isoWeek as any).default || isoWeek);
dayjs.extend((weekOfYear as any).default || weekOfYear);

const IST = 'Asia/Kolkata';

/**
 * Get the current salary cycle boundaries based on cycle day (default 10th).
 * Salary cycle: 10th of current month → 9th of next month.
 */
export function getSalaryCycleDates(
  referenceDate?: Date,
  cycleDay = 10,
): { start: Date; end: Date } {
  const ref = dayjs(referenceDate).tz(IST);
  const dayOfMonth = ref.date();

  let cycleStart: dayjs.Dayjs;
  let cycleEnd: dayjs.Dayjs;

  if (dayOfMonth >= cycleDay) {
    // We are in a cycle that started this month
    cycleStart = ref.date(cycleDay).startOf('day');
    cycleEnd = ref.add(1, 'month').date(cycleDay - 1).endOf('day');
  } else {
    // We are in a cycle that started last month
    cycleStart = ref.subtract(1, 'month').date(cycleDay).startOf('day');
    cycleEnd = ref.date(cycleDay - 1).endOf('day');
  }

  return {
    start: cycleStart.utc().toDate(),
    end: cycleEnd.utc().toDate(),
  };
}

/**
 * Get salary cycle for a specific month/year.
 */
export function getSalaryCycleForMonth(
  year: number,
  month: number,
  cycleDay = 10,
): { start: Date; end: Date } {
  const cycleStart = dayjs.tz(`${year}-${String(month).padStart(2, '0')}-${String(cycleDay).padStart(2, '0')}`, IST).startOf('day');
  const cycleEnd = cycleStart.add(1, 'month').subtract(1, 'day').endOf('day');

  return {
    start: cycleStart.utc().toDate(),
    end: cycleEnd.utc().toDate(),
  };
}

/**
 * Get today's start/end in IST, returned as UTC timestamps.
 */
export function getTodayRange(tz = IST): { start: Date; end: Date } {
  const now = dayjs().tz(tz);
  return {
    start: now.startOf('day').utc().toDate(),
    end: now.endOf('day').utc().toDate(),
  };
}

/**
 * Get this ISO week's start/end in IST.
 */
export function getThisWeekRange(tz = IST): { start: Date; end: Date } {
  const now = dayjs().tz(tz);
  return {
    start: now.startOf('isoWeek').utc().toDate(),
    end: now.endOf('isoWeek').utc().toDate(),
  };
}

/**
 * Get last N days range.
 */
export function getLastNDaysRange(
  n: number,
  tz = IST,
): { start: Date; end: Date } {
  const now = dayjs().tz(tz);
  return {
    start: now.subtract(n - 1, 'day').startOf('day').utc().toDate(),
    end: now.endOf('day').utc().toDate(),
  };
}

/**
 * Get this calendar month's start/end in IST.
 */
export function getThisMonthRange(tz = IST): { start: Date; end: Date } {
  const now = dayjs().tz(tz);
  return {
    start: now.startOf('month').utc().toDate(),
    end: now.endOf('month').utc().toDate(),
  };
}

/**
 * Get a specific date range.
 */
export function getDateRange(
  from: string,
  to: string,
  tz = IST,
): { start: Date; end: Date } {
  return {
    start: dayjs.tz(from, tz).startOf('day').utc().toDate(),
    end: dayjs.tz(to, tz).endOf('day').utc().toDate(),
  };
}

/**
 * Convert a UTC date to IST date string (YYYY-MM-DD).
 */
export function toISTDateString(date: Date): string {
  return dayjs(date).tz(IST).format('YYYY-MM-DD');
}

/**
 * Get the month key (YYYY-MM) in IST for a given date.
 */
export function toISTMonthKey(date: Date): string {
  return dayjs(date).tz(IST).format('YYYY-MM');
}

/**
 * Get all salary cycle histories up to N months back.
 */
export function getSalaryCycleHistory(
  months: number,
  cycleDay = 10,
): Array<{ start: Date; end: Date; label: string }> {
  const cycles: Array<{ start: Date; end: Date; label: string }> = [];
  const now = dayjs().tz(IST);

  for (let i = 0; i < months; i++) {
    const refDate = now.subtract(i, 'month');
    const cycle = getSalaryCycleDates(refDate.toDate(), cycleDay);
    const label = dayjs(cycle.start).tz(IST).format('MMM YYYY');
    cycles.push({ ...cycle, label });
  }

  return cycles;
}
