export function formatDate(value: string) {
  const intl = Intl.DateTimeFormat('en-US');
  return intl.format(new Date(value));
}
