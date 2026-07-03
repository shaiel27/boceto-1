export const EMAIL_DOMAIN = '@tickets.gob';

export function formatEmailPrefix(value: string): string {
  return value.split('@')[0];
}

export function buildFullEmail(prefix: string): string {
  const cleaned = prefix.split('@')[0];
  return cleaned ? `${cleaned}${EMAIL_DOMAIN}` : '';
}
