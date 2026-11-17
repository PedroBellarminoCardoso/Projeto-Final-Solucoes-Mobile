const SHORT_MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const CAP_SHORT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function currentMonthLabel(date: Date = new Date()): string {
  const formatted = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function getMonthShortName(date: Date): string {
  return CAP_SHORT_MONTHS[date.getMonth()];
}

export function getMonthLongName(date: Date): string {
  const label = date.toLocaleDateString('pt-BR', { month: 'long' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function shiftMonth(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function isSameMonth(isoDate: string, monthDate: Date): boolean {
  const parts = isoDate.split('-');
  if (parts.length < 2) return false;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  return year === monthDate.getFullYear() && month === monthDate.getMonth();
}

export function formatShortDayMonth(isoDate: string): string {
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = SHORT_MONTHS[parsed.getMonth()];
  return `${day} ${month}`;
}

export function formatSlashDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('pt-BR');
}

export function parseSlashDateToIso(input: string): string | null {
  const match = input.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const d = Number(dd);
  const m = Number(mm);
  const y = Number(yyyy);
  const candidate = new Date(y, m - 1, d);
  if (candidate.getFullYear() !== y || candidate.getMonth() !== m - 1 || candidate.getDate() !== d) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}
