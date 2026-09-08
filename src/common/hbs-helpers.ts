const CATEGORY_LABELS: Record<string, string> = {
  FICTION: 'Художественная',
  NON_FICTION: 'Нехудожественная',
  SCIENCE: 'Наука',
  FANTASY: 'Фэнтези',
  DETECTIVE: 'Детектив',
  ROMANCE: 'Романтика',
  HORROR: 'Ужасы',
  BIOGRAPHY: 'Биография',
  HISTORY: 'История',
};

export const helpers = {
  eq: (a: any, b: any) => a === b,
  gte: (a: any, b: any) => Number(a) >= Number(b),
  range: (from: number, to: number) => {
    const arr: number[] = [];
    for (let i = from; i <= to; i += 1) arr.push(i);
    return arr;
  },
  firstLetter: (value?: string) =>
    value && value.trim() ? value.trim()[0] : '?',
  bookImage: (image?: string) => image || '/images/default-book.png',
  categoryLabel: (category?: string) => CATEGORY_LABELS[category ?? ''] || '',
  categoryOptions: () =>
    Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  pluralize: (n: number, one: string, few: string, many: string) => {
    const abs = Math.abs(n);
    const n10 = abs % 10;
    const n100 = abs % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
    return many;
  },
  formatDateTime: (date?: Date | string | null) => {
    if (!date) return '';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsed);
  },
  datetimeLocal: (date?: Date | string | null) => {
    if (!date) return '';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
  },
  json: (data: any) =>
    JSON.stringify(data)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026'),
};
