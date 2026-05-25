import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, format: string = 'dd MM yyyy'): string {
  const d = new Date(date);
  const parts = {
    yyyy: d.getFullYear(),
    MM: String(d.getMonth() + 1).padStart(2, '0'),
    dd: String(d.getDate()).padStart(2, '0'),
    MMM: d.toLocaleDateString('en-AU', { month: 'short' }),
    ddd: d.toLocaleDateString('en-AU', { weekday: 'short' }),
  };

  return format
    .replace(/yyyy/g, String(parts.yyyy))
    .replace(/MM/g, parts.MM)
    .replace(/MMM/g, parts.MMM)
    .replace(/dd/g, parts.dd)
    .replace(/ddd/g, parts.ddd);
}

export function getDaysBetween(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // +1 to include the start date
}

export function getWeekDates(date: Date): { startDate: Date; endDate: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday

  const startDate = new Date(d.setDate(diff));
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  return { startDate, endDate };
}

export function getDateArray(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isWeekend(date: Date): boolean {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    done: 'st-done',
    in_progress: 'st-progress',
    planned: 'st-planned',
    milestone: 'accent',
    blocked: 'red-500',
  };
  return colors[status] || 'st-planned';
}

export function getProjectColor(color: string): string {
  const colors: Record<string, string> = {
    p1: 'p1',
    p2: 'p2',
    p3: 'p3',
    p4: 'p4',
    p5: 'p5',
  };
  return colors[color] || 'p1';
}

export function getThreeMonthsWeeks(date: Date): { weeks: Date[][]; startDate: Date; endDate: Date } {
  const d = new Date(date);
  d.setDate(1);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d.setDate(diff));

  const weeks: Date[][] = [];
  const endDate = new Date(weekStart);
  endDate.setDate(endDate.getDate() + 84); // 12 weeks

  let currentWeekStart = new Date(weekStart);
  while (currentWeekStart < endDate) {
    const weekDates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      weekDates.push(new Date(currentWeekStart.getTime() + i * 24 * 60 * 60 * 1000));
    }
    weeks.push(weekDates);
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  return { weeks, startDate: weekStart, endDate };
}

export function getTodayWeekIndex(weeks: Date[][]): number {
  const today = new Date();
  for (let i = 0; i < weeks.length; i++) {
    const weekStart = weeks[i][0];
    const weekEnd = weeks[i][6];
    if (today >= weekStart && today <= weekEnd) {
      return i;
    }
  }
  return -1;
}

export function getTodayDayOffset(week: Date[]): number {
  const today = new Date();
  for (let i = 0; i < week.length; i++) {
    if (
      today.getDate() === week[i].getDate() &&
      today.getMonth() === week[i].getMonth() &&
      today.getFullYear() === week[i].getFullYear()
    ) {
      return i;
    }
  }
  return -1;
}

export function formatOffsetDate(date: string): string {
  const targetDate = new Date(date);
  const today = new Date();

  // reset time
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();

  const diffDays = Math.round(
    diffTime / (1000 * 60 * 60 * 24)
  );

  return `d(${diffDays})`;
}

export function formatShortId(id: string): string {
  if (!id || id.length < 6) return id;

  const first = id.slice(0, 3);
  const last = id.slice(-3);

  return `${first}-${last}`;
}
export function removeQuotes(value: string): string {
  return value.replace(/^"(.*)"$/, '$1');
}

export function parseOffsetDate(value: string): Date {
  const match = value.match(/d\((-?\d+)\)/);

  if (!match) {
    return new Date(value);
  }

  const offset = Number(match[1]);

  const date = new Date();
  date.setDate(date.getDate() + offset);

  return date;
}