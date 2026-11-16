export function formatEuro(value: string, lang = 'fr') {
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) return value;
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'it-IT', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 2,
  }).format(Number(value.replace(',', '.')));
}
export function formatDate(value: string, lang = 'fr') {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'it-IT', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(value + 'T12:00:00Z'));
}
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
